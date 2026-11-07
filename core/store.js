/* =====================================================================
   Cheerful Heart Adventures — player store (schema v2)
   window.CH.store — the ONLY place that reads/writes saved data.

   • Versioned schema, kept in localStorage key "ch-data".
   • First run migrates the old device-level stars (kg-progress,
     starmap-progress) into a default player. Old keys are left in place.
   • Every game session is recorded for the active player (finished or
     stopped early), newest 200 kept per player.
   • Data written by a NEWER version of the app is backed up before this
     version reads it, so going back a version never destroys it.
   • Never throws: corrupt data is backed up and replaced by defaults;
     if storage is blocked (private mode) it runs in memory and
     store.available === false so the UI can tell a grown-up.
   ===================================================================== */
(function () {
  'use strict';
  const CH = (window.CH = window.CH || {});

  const NS = typeof window.CH_STORAGE_NS === 'string' ? window.CH_STORAGE_NS : '';
  const KEY = NS + 'ch-data';
  const OLD_KG = NS + 'kg-progress', OLD_SM = NS + 'starmap-progress';
  const SCHEMA = 2;
  const MAX_PLAYERS = 10;
  const MAX_SESSIONS = 200;
  const MAX_NAME = 15;
  const MAX_EXTRA = 4000;   // chars of JSON per game in player.extra
  const GAME_IDS = ['star-map', 'shapes', 'patterns', 'treasure', 'cookies', 'bridge', 'sorting', 'clock', 'market', 'hide-seek', 'garden', 'race'];
  const AVATAR_IDS = ['bunny', 'cat', 'dog', 'bear', 'panda', 'fox', 'frog', 'owl', 'chick', 'lion'];

  const DEFAULT_SETTINGS = {
    sound: true,          // all sound effects + voice
    music: 0.5,           // background music volume 0..1 (0 = off)
    voiceRate: 0.9,       // speech rate
    captions: true,       // show spoken text in bubbles
    reducedMotion: false, // in-app reduced motion
    unlockMode: 'gentle', // 'gentle' | 'all'
    breakReminder: true,  // stretch-break nudge after ~20 min
    bonusTimer: false     // optional timer in Friendship Race only
  };

  /* ---------------- storage probe ---------------- */
  let ls = null;
  try { const t = '__ch_probe__'; window.localStorage.setItem(t, '1'); window.localStorage.removeItem(t); ls = window.localStorage; } catch (e) { ls = null; }
  const read = k => { try { return ls ? ls.getItem(k) : null; } catch (e) { return null; } };
  let lastWriteOk = !!ls;
  const write = (k, v) => { try { if (!ls) return false; ls.setItem(k, v); return (lastWriteOk = true); } catch (e) { return (lastWriteOk = false); } };

  /* ---------------- helpers ---------------- */
  const now = () => new Date().toISOString();
  const uid = () => 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const clampInt = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, Math.round(v))) : d; };
  const isoOr = (v, d) => (typeof v === 'string' && !isNaN(Date.parse(v)) ? v : d);

  function cleanName(name) {
    // trim, collapse spaces, strip control chars and markup brackets, max 15 chars
    return String(name == null ? '' : name).replace(/<[^>]*>/g, '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME).trim();
  }

  function defaultState() {
    return { schemaVersion: SCHEMA, activePlayerId: null, players: [], settings: Object.assign({}, DEFAULT_SETTINGS) };
  }

  function sanitizeGame(g) {
    g = g && typeof g === 'object' ? g : {};
    return {
      bestStars: clampInt(g.bestStars, 0, 3, 0),
      bestScore: g.bestScore == null ? null : clampInt(g.bestScore, 0, 999, null),
      bestTotal: g.bestTotal == null ? null : clampInt(g.bestTotal, 0, 999, null),
      plays: clampInt(g.plays, 0, 1e6, 0),
      lastPlayedAt: isoOr(g.lastPlayedAt, null),
      completed: !!g.completed
    };
  }
  /* session record:
       gameId, startedAt (ISO), durationSec (time the game was on screen),
       correct (first-try right answers), total (questions in the game),
       answered (questions finished), hintsUsed, stars (0 if stopped early),
       completed (false = stopped early), level (Star Map only)            */
  function sanitizeSession(s) {
    if (!s || typeof s !== 'object' || GAME_IDS.indexOf(s.gameId) < 0) return null;
    const completed = s.completed !== false;
    const total = clampInt(s.total, 0, 999, 0);
    const answered = completed ? total : clampInt(s.answered, 0, total, 0);
    const out = {
      gameId: s.gameId,
      startedAt: isoOr(s.startedAt, now()),
      durationSec: clampInt(s.durationSec, 0, 86400, 0),
      correct: Math.min(clampInt(s.correct, 0, 999, 0), answered),
      total, answered,
      hintsUsed: clampInt(s.hintsUsed, 0, 999, 0),
      stars: completed ? clampInt(s.stars, 0, 3, 0) : 0,
      completed
    };
    if (s.level != null) out.level = String(s.level).slice(0, 40);
    return out;
  }
  function sanitizeExtra(x) {
    if (!x || typeof x !== 'object' || Array.isArray(x)) return null;
    const out = {};
    for (const id of GAME_IDS) {
      const v = x[id];
      if (!v || typeof v !== 'object' || Array.isArray(v)) continue;
      try { if (JSON.stringify(v).length <= MAX_EXTRA) out[id] = JSON.parse(JSON.stringify(v)); } catch (e) {}
    }
    for (const k of ['map', 'book'])   // map: stops seen open · book: stickers seen
      if (x[k] && typeof x[k] === 'object' && Array.isArray(x[k].seen)) out[k] = { seen: x[k].seen.filter(id => GAME_IDS.indexOf(id) >= 0) };
    return Object.keys(out).length ? out : null;
  }
  function sanitizePlayer(p) {
    if (!p || typeof p !== 'object') return null;
    const name = cleanName(p.name);
    if (!name) return null;
    const games = {};
    if (p.games && typeof p.games === 'object') for (const id of GAME_IDS) if (p.games[id]) games[id] = sanitizeGame(p.games[id]);
    const stickers = Array.isArray(p.stickers) ? p.stickers.filter((s, i, a) => GAME_IDS.indexOf(s) >= 0 && a.indexOf(s) === i) : [];
    const sessions = Array.isArray(p.sessions) ? p.sessions.map(sanitizeSession).filter(Boolean).slice(-MAX_SESSIONS) : [];
    const out = {
      id: typeof p.id === 'string' && p.id ? p.id.slice(0, 40) : uid(),
      name,
      avatar: AVATAR_IDS.indexOf(p.avatar) >= 0 ? p.avatar : AVATAR_IDS[0],
      age: [4, 5, 6].indexOf(Number(p.age)) >= 0 ? Number(p.age) : null,
      createdAt: isoOr(p.createdAt, now()),
      stickers, games, sessions
    };
    if (typeof p.sayAs === 'string' && cleanName(p.sayAs)) out.sayAs = cleanName(p.sayAs).slice(0, 30);
    const extra = sanitizeExtra(p.extra);                           // per-game extras (e.g. star-map level unlocks, map "seen")
    if (extra) out.extra = extra;
    if (p.migrated === true) out.migrated = true;                   // "Star Friend" made from old device stars, until renamed/played
    return out;
  }
  function sanitizeSettings(s) {
    s = s && typeof s === 'object' ? s : {};
    const d = DEFAULT_SETTINGS;
    const num = (v, lo, hi, def) => { v = Number(v); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : def; };
    return {
      sound: typeof s.sound === 'boolean' ? s.sound : d.sound,
      music: num(s.music, 0, 1, d.music),
      voiceRate: num(s.voiceRate, 0.6, 1.3, d.voiceRate),
      captions: typeof s.captions === 'boolean' ? s.captions : d.captions,
      reducedMotion: typeof s.reducedMotion === 'boolean' ? s.reducedMotion : d.reducedMotion,
      unlockMode: s.unlockMode === 'all' ? 'all' : 'gentle',
      breakReminder: typeof s.breakReminder === 'boolean' ? s.breakReminder : d.breakReminder,
      bonusTimer: typeof s.bonusTimer === 'boolean' ? s.bonusTimer : d.bonusTimer
    };
  }
  function sanitizeState(raw) {
    const st = defaultState();
    if (!raw || typeof raw !== 'object') return st;
    const seen = new Set();
    st.players = (Array.isArray(raw.players) ? raw.players : []).map(sanitizePlayer).filter(p => p && !seen.has(p.id) && seen.add(p.id)).slice(0, MAX_PLAYERS);
    st.settings = sanitizeSettings(raw.settings);
    st.activePlayerId = st.players.some(p => p.id === raw.activePlayerId) ? raw.activePlayerId : null;
    return st;
  }

  /* ---------------- migrations ---------------- */
  // v1 = the original game: device-wide { kg-progress: {won:{id:stars}, music}, starmap-progress: {won:{levelIdx:true}, unlocked, leader, music} }
  function migrateFromV1() {
    let kg = null, sm = null;
    try { kg = JSON.parse(read(OLD_KG) || 'null'); } catch (e) {}
    try { sm = JSON.parse(read(OLD_SM) || 'null'); } catch (e) {}
    const st = defaultState();
    if (kg && kg.music === false) st.settings.music = 0;
    const games = {};
    if (kg && kg.won && typeof kg.won === 'object') {
      for (const id of GAME_IDS) {
        const s = clampInt(kg.won[id], 0, 3, 0);
        if (s > 0) games[id] = { bestStars: s, bestScore: null, bestTotal: null, plays: 1, lastPlayedAt: null, completed: true };
      }
    }
    let smExtra = null;
    if (sm && sm.won && typeof sm.won === 'object') {
      const levels = Object.keys(sm.won).filter(k => sm.won[k]).map(Number).filter(n => n >= 0 && n < 10);
      if (levels.length) {
        // old hub showed min(3, levels won) as the star-map stars — keep what the child saw
        games['star-map'] = { bestStars: Math.min(3, levels.length), bestScore: null, bestTotal: null, plays: levels.length, lastPlayedAt: null, completed: true };
        smExtra = { wonLevels: levels, unlocked: clampInt(sm.unlocked, 1, 10, 1) };
      }
    }
    if (Object.keys(games).length) {
      const p = sanitizePlayer({ id: uid(), name: 'Star Friend', avatar: 'chick', games, stickers: Object.keys(games), sessions: [] });
      if (smExtra) p.extra = { 'star-map': smExtra };
      p.migrated = true;
      st.players.push(p);
      st.activePlayerId = p.id;
    }
    st.migratedFrom = 1;
    return st;
  }
  const MIGRATIONS = {
    // future: 2: s => { ...; s.schemaVersion = 3; return s; }
  };

  /* ---------------- load / save ---------------- */
  let state, listeners = [], loadIssue = null, newerSchema = 0;
  function load() {
    const raw = read(KEY);
    if (raw == null) { state = migrateFromV1(); persist(); return state; }
    let obj = null;
    try { obj = JSON.parse(raw); } catch (e) { obj = null; }
    if (!obj || typeof obj !== 'object') {
      write(KEY + '-corrupt-' + Date.now(), raw);   // keep a copy for recovery
      loadIssue = 'corrupt';
      state = migrateFromV1(); persist(); return state;   // rebuild from the old device stars if any
    }
    let v = Number(obj.schemaVersion) || 2;
    if (v > SCHEMA) {
      // saved by a newer version of the app: keep an untouched copy once, then read what we understand
      newerSchema = v; loadIssue = 'newer';
      if (read(KEY + '-v' + v + '-backup') == null) write(KEY + '-v' + v + '-backup', raw);
    }
    while (MIGRATIONS[v]) { obj = MIGRATIONS[v](obj); v = obj.schemaVersion; }
    state = sanitizeState(obj);
    return state;
  }
  function persist() {
    if (!ls) return false;
    const out = () => JSON.stringify({ schemaVersion: SCHEMA, activePlayerId: state.activePlayerId, players: state.players, settings: state.settings, savedAt: now() });
    let ok = write(KEY, out());
    if (!ok) {                       // storage full: keep fewer old sessions and retry (stars, stickers, profiles are never trimmed)
      for (const keep of [100, 50, 20]) {
        state.players.forEach(p => { if (p.sessions.length > keep) p.sessions = p.sessions.slice(-keep); });
        if ((ok = write(KEY, out()))) break;
      }
    }
    return ok;
  }
  function emit(type, detail) { listeners.forEach(fn => { try { fn(type, detail); } catch (e) { console.error(e); } }); }
  function commit(type, detail) { const ok = persist(); emit(type, detail); return ok; }

  load();
  // keep tabs in sync (e.g. Grown-ups' Corner open in another tab)
  addEventListener('storage', e => { if (e.key === KEY || e.key === null) { load(); emit('external'); } });

  /* ---------------- public API ---------------- */
  const clone = o => JSON.parse(JSON.stringify(o));
  const find = id => state.players.find(p => p.id === id) || null;

  const store = {
    SCHEMA, MAX_PLAYERS, MAX_SESSIONS, MAX_NAME, GAME_IDS, AVATAR_IDS, DEFAULT_SETTINGS,
    get available() { return !!ls && lastWriteOk; },
    get loadIssue() { return loadIssue; },        // null | 'corrupt' | 'newer'
    get newerSchema() { return newerSchema; },
    get migrated() { return state.players.some(p => p.migrated); },
    cleanName,

    /** subscribe to changes: fn(type, detail). Returns unsubscribe. */
    onChange(fn) { listeners.push(fn); return () => { listeners = listeners.filter(f => f !== fn); }; },
    reload() { load(); emit('external'); },

    /* players */
    players() { return clone(state.players); },
    getPlayer(id) { const p = find(id); return p ? clone(p) : null; },
    activePlayer() { const p = find(state.activePlayerId); return p ? clone(p) : null; },
    activeId() { return find(state.activePlayerId) ? state.activePlayerId : null; },
    setActive(id) { if (id !== null && !find(id)) return false; state.activePlayerId = id; commit('active', { id }); return true; },
    canAddPlayer() { return state.players.length < MAX_PLAYERS; },

    /** addPlayer({name, avatar, age}) → {ok, player} | {ok:false, error:'name'|'full'} */
    addPlayer(o) {
      o = o || {};
      if (!store.canAddPlayer()) return { ok: false, error: 'full' };
      const name = cleanName(o.name);
      if (!name) return { ok: false, error: 'name' };
      const p = sanitizePlayer({ id: uid(), name, avatar: o.avatar, age: o.age, sayAs: o.sayAs, createdAt: now(), games: {}, stickers: [], sessions: [] });
      state.players.push(p);
      commit('player-added', { id: p.id });
      return { ok: true, player: clone(p) };
    },
    /** updatePlayer(id, {name, avatar, age, sayAs}) — only profile fields */
    updatePlayer(id, patch) {
      const p = find(id); if (!p) return { ok: false, error: 'missing' };
      patch = patch || {};
      if ('name' in patch) { const n = cleanName(patch.name); if (!n) return { ok: false, error: 'name' }; p.name = n; }
      if ('avatar' in patch && AVATAR_IDS.indexOf(patch.avatar) >= 0) p.avatar = patch.avatar;
      if ('age' in patch) p.age = [4, 5, 6].indexOf(Number(patch.age)) >= 0 ? Number(patch.age) : null;
      if ('sayAs' in patch) { const s = cleanName(patch.sayAs); if (s) p.sayAs = s; else delete p.sayAs; }
      delete p.migrated;
      commit('player-updated', { id });
      return { ok: true, player: clone(p) };
    },
    resetPlayer(id) {
      const p = find(id); if (!p) return false;
      p.games = {}; p.stickers = []; p.sessions = []; delete p.extra;
      commit('player-reset', { id }); return true;
    },
    deletePlayer(id) {
      const i = state.players.findIndex(p => p.id === id); if (i < 0) return false;
      state.players.splice(i, 1);
      if (state.activePlayerId === id) state.activePlayerId = null;
      commit('player-deleted', { id }); return true;
    },

    /* per-game extra data (e.g. star-map level unlocks) for the active player */
    getExtra(gameId) { const p = find(state.activePlayerId); return p && p.extra && p.extra[gameId] ? clone(p.extra[gameId]) : null; },
    setExtra(gameId, data) { const p = find(state.activePlayerId); if (!p) return false; p.extra = p.extra || {}; p.extra[gameId] = data; return persist(); },

    /** recordSession(gameId, {startedAt, durationSec, correct, total, hintsUsed, stars, level, completed, answered})
     *  for the ACTIVE player. A stopped-early session (completed:false) is only added to the history.
     *  Returns {personalBest, firstCompletion, newSticker, prevBestStars, prevBestScore, game} or {partial:true} */
    recordSession(gameId, s) {
      const p = find(state.activePlayerId);
      const sess = sanitizeSession(Object.assign({ gameId }, s));
      if (!p || !sess) return null;
      if (!sess.completed) {
        p.sessions.push(sess);
        if (p.sessions.length > MAX_SESSIONS) p.sessions = p.sessions.slice(-MAX_SESSIONS);
        commit('session', { id: p.id, gameId, partial: true });
        return { partial: true };
      }
      const g = p.games[gameId] = sanitizeGame(p.games[gameId]);
      const prevStars = g.bestStars, prevScore = g.bestScore, wasCompleted = g.completed;
      const pct = sess.total ? sess.correct / sess.total : 0;
      const prevPct = g.bestTotal ? (g.bestScore || 0) / g.bestTotal : -1;
      const personalBest = g.plays > 0 && (sess.stars > prevStars || (sess.stars === prevStars && pct > prevPct));
      g.plays += 1; g.lastPlayedAt = sess.startedAt; g.completed = true;
      if (sess.stars > g.bestStars) g.bestStars = sess.stars;
      if (pct > prevPct) { g.bestScore = sess.correct; g.bestTotal = sess.total; }
      const newSticker = p.stickers.indexOf(gameId) < 0;
      if (newSticker) p.stickers.push(gameId);
      p.sessions.push(sess);
      if (p.sessions.length > MAX_SESSIONS) p.sessions = p.sessions.slice(-MAX_SESSIONS);
      delete p.migrated;
      commit('session', { id: p.id, gameId });
      return { personalBest, firstCompletion: !wasCompleted, newSticker, prevBestStars: prevStars, prevBestScore: prevScore, game: clone(g) };
    },

    /* settings (device-wide) */
    settings() { return clone(state.settings); },
    setting(k) { return state.settings[k]; },
    setSettings(patch) { state.settings = sanitizeSettings(Object.assign({}, state.settings, patch)); commit('settings', patch); return clone(state.settings); },

    /** session history for one player (oldest first), optionally for one game */
    sessions(id, gameId) { const p = find(id); if (!p) return []; return clone(gameId ? p.sessions.filter(x => x.gameId === gameId) : p.sessions); },

    /** full export (for backups / debugging) */
    exportAll() { return clone({ schemaVersion: SCHEMA, activePlayerId: state.activePlayerId, players: state.players, settings: state.settings }); }
  };
  CH.store = store;

  /* reflect device settings on <html> so CSS can react everywhere:
     data-motion="reduce" (in-app reduced motion), data-captions="off" */
  function applyDocAttrs() {
    const de = document.documentElement, s = state.settings;
    if (s.reducedMotion) de.dataset.motion = 'reduce'; else delete de.dataset.motion;
    de.dataset.captions = s.captions === false ? 'off' : 'on';
  }
  applyDocAttrs();
  listeners.push(t => { if (t === 'settings' || t === 'external') applyDocAttrs(); });
})();
