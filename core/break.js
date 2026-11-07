/* =====================================================================
   Cheerful Heart Adventures — stretch-break reminder
   CH.breakTime
     Counts *visible* play time across pages (sessionStorage, this tab only).
     Time away from the game for more than 10 minutes starts a fresh count.
     After ~20 minutes, check() shows a friendly stretch break — but only when
     a page calls it at a calm moment (the map, or a game's end screen).
     Grown-ups can turn it off: Grown-ups' Corner → Settings → Break reminder.
   Needs: core/store.js, core/voice.js, core/ui.js
   ===================================================================== */
(function () {
  'use strict';
  const CH = window.CH;
  if (!CH || !CH.ui || !CH.store) return;
  const KEY = 'ch-playtime', LIMIT = 20 * 60e3, AWAY = 10 * 60e3, TICK = 5000, WAIT = 20;
  let mem = { ms: 0, at: Date.now() }, open = false;

  const read = () => { try { const v = JSON.parse(sessionStorage.getItem(KEY)); if (v && Number.isFinite(v.ms)) return v; } catch (e) {} return mem; };
  const write = v => { mem = v; try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} };

  function tick() {
    const v = read(), now = Date.now(), gap = now - (v.at || now);
    if (gap > AWAY) v.ms = 0;                        // came back after a long time away
    else if (!document.hidden) v.ms += Math.min(gap, TICK * 2);
    v.at = now; write(v);
  }
  tick();
  setInterval(tick, TICK);
  document.addEventListener('visibilitychange', () => { const v = read(); if (document.hidden) { tick(); } else { if (Date.now() - v.at > AWAY) v.ms = 0; v.at = Date.now(); write(v); } });

  function due() { return CH.store.setting('breakReminder') !== false && read().ms >= LIMIT; }
  function reset() { write({ ms: 0, at: Date.now() }); }

  const LINES = [
    { who: 'ali',     say: 'Great playing! Let’s take a stretch break. Reach up high to the sky… now touch your toes!' },
    { who: 'wynea',   say: 'Explorers need a rest too! Stand up, wiggle your arms, and take three big breaths with me.' },
    { who: 'matthew', say: 'Beep boop! Brain recharge time! Stand up, march in place, and shake shake shake!' }
  ];

  /** Show the break if it's time. Returns true when shown. opts.onDone runs after it closes. */
  function check(opts) {
    opts = opts || {};
    if (open || !due() || document.querySelector('.ch-modal')) return false;
    open = true;
    const { h, ui } = CH, L = LINES[Math.floor(Math.random() * LINES.length)], hero = CH.HEROES[L.who];
    const art = h('img', { src: hero.full, alt: '', class: 'ch-break__art', draggable: 'false' });
    const txt = h('p', { class: 'ch-break__txt', text: L.say });
    const bar = ui.progressBar({ max: WAIT, value: 0, label: 'Stretch time' });
    const go = ui.bigButton({ label: 'I’m ready!', variant: 'leaf', size: 'xl', icon: 'play', onClick: () => m.close('done') });
    go.hidden = true;
    const body = h('div', { class: 'ch-stack ch-break', style: { justifyItems: 'center', textAlign: 'center' } }, [art, txt, bar, go]);
    const m = ui.modal({ title: 'Stretch break!', body, dismissible: false, class: 'ch-break-modal',
      onClose: () => { open = false; clearInterval(t); try { CH.voice.cancel(); } catch (e) {} reset(); opts.onDone && opts.onDone(); } });
    try { ui.fx.bounce(art); } catch (e) {}
    CH.voice.speak(L.say, { who: L.who });
    let s = 0;
    const t = setInterval(() => {
      if (document.hidden) return;
      s++; bar.set(s);
      if (s % 6 === 0 && s < WAIT) try { ui.fx.wave ? ui.fx.wave(art) : ui.fx.bounce(art); } catch (e) {}
      if (s >= WAIT) { clearInterval(t); go.hidden = false; go.focus(); CH.voice.speak('All done! Let’s keep playing!', { who: L.who }); }
    }, 1000);
    return true;
  }

  CH.breakTime = { check, due, reset, get playedMs() { return read().ms; }, LIMIT };
})();
