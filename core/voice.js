/* =====================================================================
   Cheerful Heart Adventures — voice (text-to-speech)
   window.CH.voice — every spoken line in the game goes through here.

   • Pronunciation dictionary: on screen we always show "Wynea"; the
     speech engine always receives "Wee-neh-yah". Never call
     speechSynthesis directly anywhere else — use CH.voice.speak().
   • speakName(name) / sayName(player) for the child's name.
   • Picks a friendly English voice, waits for voices that load late
     (Safari/iOS), and reports `available` so captions can take over.
   • Speech only starts after a user tap (browser autoplay rules):
     call CH.voice.unlock() inside the first tap handler.
   ===================================================================== */
(function () {
  'use strict';
  const CH = (window.CH = window.CH || {});
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;

  /* ---------- pronunciation dictionary (display name -> spoken form) ---------- */
  const PRONOUNCE = {
    Wynea: 'Wee-neh-yah'
  };
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let rx = null;
  function buildRx() { const keys = Object.keys(PRONOUNCE); rx = keys.length ? new RegExp('\\b(' + keys.map(esc).join('|') + ')\\b', 'gi') : null; }
  buildRx();
  /** Replace every dictionary word with its phonetic spelling (case-insensitive, whole words). */
  function pronounce(text) {
    text = String(text == null ? '' : text);
    if (!rx) return text;
    return text.replace(rx, m => { const k = Object.keys(PRONOUNCE).find(x => x.toLowerCase() === m.toLowerCase()); return k ? PRONOUNCE[k] : m; });
  }
  /** Spoken form of a single name. Players may carry a grown-up-entered `sayAs`. */
  function speakName(nameOrPlayer) {
    if (nameOrPlayer && typeof nameOrPlayer === 'object') return nameOrPlayer.sayAs || pronounce(nameOrPlayer.name || '');
    return pronounce(nameOrPlayer);
  }
  function addPronunciation(word, spoken) { if (word && spoken) { PRONOUNCE[word] = spoken; buildRx(); } }

  /* ---------- character voice styles (pitch kept gentle so it stays clear) ---------- */
  const STYLE = {
    ali:     { pitch: 1.25, rate: 1.0,  male: false },
    wynea:   { pitch: 1.3,  rate: 1.0,  male: false },
    matthew: { pitch: 1.05, rate: 1.04, male: true },
    narrator:{ pitch: 1.1,  rate: 1.0,  male: false }
  };

  /* ---------- voice selection (voices load asynchronously on Safari/Chrome) ---------- */
  let voiceF = null, voiceM = null, voicesLoaded = false;
  const readyCbs = [];
  function pickVoices() {
    if (!synth) return;
    const vs = synth.getVoices() || [];
    if (!vs.length) return;
    const en = vs.filter(v => /^en([-_]|$)/i.test(v.lang));
    const pref = (list, re) => list.find(v => re.test(v.name));
    voiceF = pref(en, /samantha|aria|jenny|zira|google us english|karen|moira|tessa|serena|female/i)
          || en.find(v => /^en[-_]US/i.test(v.lang)) || en[0] || null;
    voiceM = pref(en, /\bguy\b|davis|daniel|alex|fred|david|mark|aaron|arthur|rishi|\bmale\b/i) || voiceF;
    if (!voicesLoaded) { voicesLoaded = true; readyCbs.splice(0).forEach(f => { try { f(); } catch (e) {} }); }
  }
  if (synth) {
    pickVoices();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', pickVoices); else synth.onvoiceschanged = pickVoices;
    // some browsers never fire voiceschanged — poll briefly
    let tries = 0; const poll = setInterval(() => { pickVoices(); if (voicesLoaded || ++tries > 20) clearInterval(poll); }, 250);
  }

  /* ---------- settings (live from CH.store when present) ---------- */
  const setting = (k, d) => (CH.store && CH.store.setting(k) != null ? CH.store.setting(k) : d);

  /* ---------- speaking ---------- */
  let unlocked = false, speakingNow = false, hooks = { start: [], end: [] };
  function emit(t, d) { hooks[t].forEach(f => { try { f(d); } catch (e) {} }); }

  /** Must run inside a user gesture once (title "Play" button). Safe to call repeatedly. */
  function unlock() {
    if (!synth) return;
    try { if (synth.paused) synth.resume(); } catch (e) {}
    if (unlocked) return;
    unlocked = true;
    try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; synth.speak(u); } catch (e) {}
  }

  /**
   * speak(text, {who, rate, queue, onstart, onend})
   * text may contain simple HTML (<b>) — tags are stripped. Returns a promise that
   * resolves when speech ends (or immediately when speech is unavailable/off).
   */
  function speak(text, o) {
    o = o || {};
    const plain = String(text == null ? '' : text).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!plain || !synth || setting('sound', true) === false) { o.onstart && o.onstart(); o.onend && o.onend(); return Promise.resolve(false); }
    const st = STYLE[o.who] || STYLE.narrator;
    const base = setting('voiceRate', 0.9);
    const spoken = pronounce(plain);
    const parts = spoken.match(/[^.!?]+[.!?]*/g) || [spoken];
    return new Promise(resolve => {
      try {
        if (!o.queue) synth.cancel();
        const list = parts.map(s => s.trim()).filter(Boolean);
        list.forEach((ph, i) => {
          const u = new SpeechSynthesisUtterance(ph);
          const v = st.male ? voiceM : voiceF; if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
          const ex = /!$/.test(ph), q = /\?$/.test(ph);
          u.pitch = Math.min(2, st.pitch + (ex ? .08 : 0) + (q ? .12 : 0));
          u.rate = Math.max(.5, Math.min(1.5, base * st.rate * (o.rate || 1)));
          if (i === 0) u.onstart = () => { speakingNow = true; emit('start', { who: o.who, text: plain }); o.onstart && o.onstart(); };
          if (i === list.length - 1) u.onend = u.onerror = () => { speakingNow = false; emit('end', { who: o.who }); o.onend && o.onend(); resolve(true); };
          synth.speak(u);
        });
        // Chrome sometimes never fires onend for long queues: safety net
        setTimeout(() => { if (speakingNow && !synth.speaking) { speakingNow = false; emit('end', {}); resolve(true); } }, 15000);
      } catch (e) { o.onend && o.onend(); resolve(false); }
    });
  }
  function cancel() { try { synth && synth.cancel(); } catch (e) {} if (speakingNow) { speakingNow = false; emit('end', {}); } }

  /* iOS/Safari can leave speech paused after the app was backgrounded */
  document.addEventListener('visibilitychange', () => {
    if (!synth) return;
    if (document.hidden) cancel();
    else try { synth.resume(); } catch (e) {}
  });

  CH.voice = {
    PRONOUNCE, pronounce, speakName, addPronunciation,
    speak, cancel, unlock,
    on(type, fn) { (hooks[type] || []).push(fn); },
    onReady(fn) { voicesLoaded ? fn() : readyCbs.push(fn); },
    get supported() { return !!synth; },
    /** true once at least one English-capable voice is known */
    get available() { return !!synth && voicesLoaded && !!voiceF; },
    get speaking() { return speakingNow; }
  };
})();
