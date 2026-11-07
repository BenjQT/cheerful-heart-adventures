/* =====================================================================
   Cheerful Heart Adventures — reusable UI components (Phase 1)
   window.CH.ui  — no framework, works on every page.
   Styles live in css/theme.css (ch- prefix).

   Components: bigButton, iconButton, replayButton, starRating, bubble,
               modal, parentGate, progressBar, dots
   Effects:    fx.bounce/wobble/cheer/wave/glow/pointAt/flyStars/confetti
   Motion:     motion.reduced(), motion.set(bool)
   ===================================================================== */
(function () {
  'use strict';
  const CH = (window.CH = window.CH || {});

  /* ---------------- tiny DOM helpers ---------------- */
  const h = (tag, attrs, kids) => {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.keys(v).forEach(sk => sk.startsWith('--') ? e.style.setProperty(sk, v[sk]) : (e.style[sk] = v[sk]));
      else e.setAttribute(k, v === true ? '' : v);
    }
    (Array.isArray(kids) ? kids : kids != null ? [kids] : []).forEach(c => {
      if (c == null || c === false) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  };
  CH.h = h;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  CH.esc = esc;

  /* ---------------- characters (art + colour only; voice lives in core/voice.js) ---------------- */
  CH.HEROES = CH.HEROES || {
    ali:     { id: 'ali',     name: 'Ali',     role: 'Kind thinker',   ring: '#3d63c9', head: 'img/ali.webp',     full: 'img/ali-full.webp' },
    wynea:   { id: 'wynea',   name: 'Wynea',   role: 'Brave explorer', ring: '#ff5c8d', head: 'img/wynea.webp',   full: 'img/wynea-full.webp' },
    matthew: { id: 'matthew', name: 'Matthew', role: 'Silly inventor', ring: '#4aa3e0', head: 'img/matthew.webp', full: 'img/matthew-full.webp' }
  };

  /* ---------------- icons (inline SVG, currentColor) ---------------- */
  const STAR_PATH = 'M50 5l13 28 30 3-23 20 7 30-27-16-27 16 7-30L7 36l30-3z';
  const I = (d, vb) => `<svg viewBox="${vb || '0 0 24 24'}" fill="currentColor" aria-hidden="true" focusable="false">${d}</svg>`;
  const ICONS = {
    home:   I('<path d="M12 3 2 11.5h3V21h5.5v-6h3v6H19v-9.5h3z"/>'),
    back:   I('<path d="M15.5 4 7 12l8.5 8 2-2.1L11.2 12l6.3-5.9z"/>'),
    speak:  I('<path d="M4 9v6h4l5 4V5L8 9zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/>'),
    music:  I('<path d="M12 3v10.6A4 4 0 1 0 14 17V7h4V3z"/>'),
    close:  I('<path d="M6.4 4.9 12 10.6l5.6-5.7 1.5 1.5-5.7 5.6 5.7 5.6-1.5 1.5-5.6-5.7-5.6 5.7-1.5-1.5 5.7-5.6-5.7-5.6z"/>'),
    lock:   I('<path d="M6 10V8a6 6 0 1 1 12 0v2h1.5v12h-15V10zm2.5 0h7V8a3.5 3.5 0 0 0-7 0z"/>'),
    gear:   I('<path d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1L11 21h4l.4-2.9a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/>'),
    play:   I('<path d="M7 4.5v15l13-7.5z"/>'),
    again:  I('<path d="M12 5V1.5L7 6l5 4.5V7a5 5 0 1 1-5 5H4.5A7.5 7.5 0 1 0 12 5z"/>'),
    map:    I('<path d="M9 4 3 6.5v14L9 18l6 2.5 6-2.5v-14L15 6.5zm0 2.2 6 2.5v11.1l-6-2.5z"/>'),
    book:   I('<path d="M5 3h11a3 3 0 0 1 3 3v15H7a2 2 0 0 1-2-2zm2 14v2h10v-2z"/>'),
    plus:   I('<path d="M10.5 4h3v6.5H20v3h-6.5V20h-3v-6.5H4v-3h6.5z"/>'),
    star:   `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path class="fill" stroke-width="6" stroke-linejoin="round" d="${STAR_PATH}"/></svg>`,
    dot:    '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="40" fill="rgba(255,253,246,.85)" stroke="rgba(110,67,34,.55)" stroke-width="10"/></svg>',
    hand:   '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22 6c3 0 5 2 5 5v17l3-1c3-1 6 1 6 4l2-1c3-1 6 1 6 4l2-.5c3-.5 6 1.5 6 4.5v8c0 9-7 16-16 16h-4c-6 0-11-3-14-8L9 42c-2-3 0-7 4-7 2 0 3 1 4 2V11c0-3 2-5 5-5z" fill="#fff" stroke="#2a1f3d" stroke-width="4" stroke-linejoin="round"/></svg>'
  };
  const starFilled = (cls) => `<svg class="ch-star ${cls || ''}" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path class="fill" stroke-width="6" stroke-linejoin="round" d="${STAR_PATH}"/></svg>`;
  CH.ICONS = ICONS;

  /* ---------------- motion preference ---------------- */
  const mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const motion = {
    reduced: () => mq.matches || document.documentElement.dataset.motion === 'reduce',
    set(on) { if (on) document.documentElement.dataset.motion = 'reduce'; else delete document.documentElement.dataset.motion; }
  };

  /* restart a CSS animation class on an element */
  function play(el, cls, ms) {
    if (!el) return;
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    clearTimeout(el['_t_' + cls]);
    el['_t_' + cls] = setTimeout(() => el.classList.remove(cls), ms || 1400);
  }

  /* press feedback for any element (pointer + keyboard), one code path */
  function pressable(el) {
    const on = () => el.classList.add('is-pressed'), off = () => el.classList.remove('is-pressed');
    el.addEventListener('pointerdown', on);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => el.addEventListener(t, off));
    el.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') on(); });
    el.addEventListener('keyup', off); el.addEventListener('blur', off);
    return el;
  }

  /* ===================== components ===================== */

  /** BigButton — large rounded action. variant: leaf|gold|sky|heart|grape|paper; size: xl */
  function bigButton(o) {
    o = o || {};
    const tag = o.href ? 'a' : 'button';
    const el = h(tag, {
      class: ['ch-btn', o.variant && 'ch-btn--' + o.variant, o.size && 'ch-btn--' + o.size, o.block && 'ch-btn--block', o.class].filter(Boolean).join(' '),
      href: o.href, type: tag === 'button' ? 'button' : null,
      'aria-label': o.ariaLabel || null, disabled: o.disabled || null,
      html: (o.icon ? (ICONS[o.icon] || o.icon) : '') + (o.label != null ? `<span>${o.html ? o.label : esc(o.label)}</span>` : '')
    });
    if (o.onClick) el.addEventListener('click', e => { bounce(el); o.onClick(e); });
    return pressable(el);
  }

  /** IconButton — square icon-only control. `label` is required (becomes aria-label). */
  function iconButton(o) {
    o = o || {};
    if (!o.label) console.warn('[CH.ui] iconButton needs a label for screen readers');
    const tag = o.href ? 'a' : 'button';
    const el = h(tag, {
      class: ['ch-icon', o.round && 'ch-icon--round', o.off && 'is-off', o.class].filter(Boolean).join(' '),
      href: o.href, type: tag === 'button' ? 'button' : null, 'aria-label': o.label, title: o.label,
      'aria-pressed': o.toggle ? String(!o.off) : null,
      html: ICONS[o.icon] || o.icon || ''
    });
    if (o.onClick) el.addEventListener('click', e => { bounce(el); o.onClick(e, el); });
    return pressable(el);
  }

  /** ReplayAudioButton — 🔊 always fixed top-right. Re-speaks the last instruction. */
  function replayButton(o) {
    o = o || {};
    const el = iconButton({ icon: 'speak', label: o.label || 'Hear it again', class: 'ch-replay ch-icon--round', onClick: o.onClick });
    el.setSpeaking = on => el.classList.toggle('is-speaking', !!on);
    return el;
  }

  /** StarRating — 0..max stars. Empty stars are dashed outlines (shape differs, not just colour). */
  function starRating(n, o) {
    o = o || {};
    const max = o.max || 3; n = Math.max(0, Math.min(max, n | 0));
    const el = h('div', {
      class: 'ch-stars' + (o.animate ? ' is-animated' : '') + (o.class ? ' ' + o.class : ''),
      role: 'img', 'aria-label': o.label || `${n} of ${max} stars`,
      style: o.size ? { '--size': typeof o.size === 'number' ? o.size + 'px' : o.size } : null,
      html: Array.from({ length: max }, (_, i) => starFilled(i < n ? '' : 'is-empty')).join('')
    });
    return el;
  }

  /** CharacterBubble — character face + speech bubble. bubble.say(who, html) shows + speaks.
   *  Speaking uses CH.voice (Phase 8) when present, else the legacy KG.say. */
  function bubble(o) {
    o = o || {};
    const el = h('div', { class: 'ch-bubble' + (o.class ? ' ' + o.class : '') });
    const face = h('button', { class: 'ch-bubble__face', type: 'button', 'aria-label': 'Hear it again' }, h('img', { alt: '', draggable: 'false' }));
    const who = h('div', { class: 'ch-bubble__who' });
    const txt = h('div', { class: 'ch-bubble__txt', 'aria-live': 'polite' });
    el.append(face, h('div', { class: 'ch-bubble__say' }, [who, txt]));
    let last = null, talkT = 0;
    el.say = function (heroId, html, opt) {
      opt = opt || {};
      const H = CH.HEROES[heroId] || CH.HEROES.wynea;
      last = { heroId, html };
      el.style.setProperty('--ring', H.ring);
      face.querySelector('img').src = H.head;
      who.textContent = H.name;
      txt.innerHTML = html;
      if (opt.speak !== false) {
        const plain = html.replace(/<[^>]+>/g, '');
        if (CH.voice && CH.voice.speak) CH.voice.speak(plain, { who: heroId });
        else if (window.KG && KG.say) KG.say(plain, heroId);
      }
      el.classList.add('is-talking'); clearTimeout(talkT);
      talkT = setTimeout(() => el.classList.remove('is-talking'), Math.min(8000, 600 + html.split(' ').length * 360));
      return el;
    };
    el.replay = () => last && el.say(last.heroId, last.html);
    el.setCaptions = on => el.classList.toggle('is-captions-off', !on);
    face.addEventListener('click', () => el.replay());
    if (o.who && o.text) el.say(o.who, o.text, { speak: o.speak });
    return el;
  }

  /** Modal — accessible dialog with focus trap; Esc closes when dismissible.
   *  actions: [{label, variant, icon, onClick(close), keepOpen}] */
  let openModals = [];
  function modal(o) {
    o = o || {};
    const dismissible = o.dismissible !== false;
    const titleId = 'chm-' + Math.random().toString(36).slice(2, 8);
    const card = h('div', { class: 'ch-modal__card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': o.title ? titleId : null, 'aria-label': o.title ? null : (o.ariaLabel || 'Dialog') });
    const root = h('div', { class: 'ch-modal ch-noselect' + (o.class ? ' ' + o.class : '') }, card);
    if (o.title) card.appendChild(h('h2', { class: 'ch-modal__title', id: titleId, text: o.title }));
    const body = h('div', { class: 'ch-modal__body' });
    if (o.body instanceof Node) body.appendChild(o.body); else if (o.body != null) body.innerHTML = o.body;
    card.appendChild(body);
    if (dismissible) card.appendChild(iconButton({ icon: 'close', label: 'Close', class: 'ch-modal__close ch-icon--round', onClick: () => close() }));
    if (o.actions && o.actions.length) {
      const row = h('div', { class: 'ch-modal__actions' });
      o.actions.forEach(a => row.appendChild(bigButton({
        label: a.label, variant: a.variant, icon: a.icon, ariaLabel: a.ariaLabel,
        onClick: () => { const r = a.onClick && a.onClick(close); if (!a.keepOpen && r !== false) close(); }
      })));
      card.appendChild(row);
    }
    const prevFocus = document.activeElement;
    let closed = false;
    function close(reason) {
      if (closed) return; closed = true;
      root.remove(); document.removeEventListener('keydown', onKey, true);
      openModals = openModals.filter(m => m !== api);
      if (prevFocus && prevFocus.focus) try { prevFocus.focus({ preventScroll: true }); } catch (e) {}
      o.onClose && o.onClose(reason);
    }
    function onKey(e) {
      if (openModals[openModals.length - 1] !== api) return;
      if (e.key === 'Escape' && dismissible) { e.preventDefault(); close('esc'); }
      else if (e.key === 'Tab') {
        const f = [...card.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x => x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      }
    }
    if (dismissible && o.closeOnBackdrop !== false) root.addEventListener('pointerdown', e => { if (e.target === root) close('backdrop'); });
    document.addEventListener('keydown', onKey, true);
    (o.mount || document.body).appendChild(root);
    const api = { el: root, card, body, close };
    openModals.push(api);
    setTimeout(() => {
      const f = card.querySelector(o.initialFocus || '.ch-modal__actions .ch-btn, input, .ch-btn, button');
      f && f.focus({ preventScroll: true });
    }, 50);
    return api;
  }

  /** ParentGate — press-and-hold 3 s, then "Tap the number <word>" from digit choices.
   *  A pre-reader can't map the written word to the numeral. Calls onPass() once. */
  const WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const numWord = n => n < 20 ? WORDS[n] : TENS[(n / 10) | 0] + (n % 10 ? '-' + WORDS[n % 10] : '');
  function parentGate(o) {
    o = o || {};
    const HOLD_MS = o.holdMs || 3000;
    const wrap = h('div', { class: 'ch-stack', style: { justifyItems: 'center' } });
    const m = modal({ title: o.title || 'For grown-ups', body: wrap, class: 'ch-gate', onClose: r => { if (!passed) o.onCancel && o.onCancel(r); } });
    let passed = false;
    function stepHold() {
      wrap.innerHTML = '';
      const hold = h('button', { class: 'ch-hold', type: 'button', 'aria-label': 'Press and hold for 3 seconds',
        html: '<svg class="ring" viewBox="0 0 132 132"><circle class="track" cx="66" cy="66" r="58"/><circle class="bar" cx="66" cy="66" r="58"/></svg><span class="lbl">Press &amp; hold</span>' });
      const bar = hold.querySelector('.bar'), C = 2 * Math.PI * 58;
      bar.style.strokeDasharray = C; bar.style.strokeDashoffset = C;
      let t0 = 0, raf = 0, holding = false;
      const tick = t => {
        if (!holding) return;
        const p = Math.min(1, (t - t0) / HOLD_MS);
        bar.style.strokeDashoffset = C * (1 - p);
        if (p >= 1) { holding = false; stepQuestion(); return; }
        raf = requestAnimationFrame(tick);
      };
      const start = e => { if (holding) return; if (e && e.pointerId != null) try { hold.setPointerCapture(e.pointerId); } catch (x) {} holding = true; t0 = performance.now(); raf = requestAnimationFrame(tick); };
      const stop = () => { holding = false; cancelAnimationFrame(raf); bar.style.strokeDashoffset = C; };
      hold.addEventListener('pointerdown', e => { e.preventDefault(); start(e); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => hold.addEventListener(t, stop));
      hold.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); } });
      hold.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') stop(); });
      hold.addEventListener('contextmenu', e => e.preventDefault());
      wrap.append(h('p', { style: { margin: 0, fontWeight: 600 }, text: 'Press and hold the circle for 3 seconds.' }), hold);
      setTimeout(() => hold.focus({ preventScroll: true }), 60);
    }
    function stepQuestion() {
      wrap.innerHTML = '';
      const n = 11 + Math.floor(Math.random() * 79);               // 11..89
      const pool = new Set([n]);
      const rev = (n % 10) * 10 + ((n / 10) | 0); if (rev !== n && rev >= 10) pool.add(rev);   // digit swap: 14 -> 41
      while (pool.size < 4) { const d = n + [-10, -1, 1, 10, 2, -2][Math.floor(Math.random() * 6)]; if (d >= 10 && d <= 99) pool.add(d); }
      const opts = [...pool].sort(() => Math.random() - .5);
      const grid = h('div', { class: 'ch-gate__opts' });
      opts.forEach(v => grid.appendChild(bigButton({ label: String(v), variant: 'paper', onClick: () => {
        if (v === n) { passed = true; m.close('pass'); o.onPass && o.onPass(); }
        else { wobble(grid); setTimeout(stepHold, 450); }
      } })));
      wrap.append(h('p', { class: 'ch-gate__q', html: `Tap the number <strong>${numWord(n)}</strong>` }), grid);
      setTimeout(() => grid.firstChild.focus({ preventScroll: true }), 60);
    }
    stepHold();
    return m;
  }

  /** ProgressBar — el.set(value). variant: gold|leaf|heart */
  function progressBar(o) {
    o = o || {};
    const max = o.max || 100;
    const bar = h('div', { class: 'ch-progress__bar' });
    const el = h('div', { class: 'ch-progress' + (o.variant ? ' ch-progress--' + o.variant : ''), role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-label': o.label || 'Progress' }, bar);
    el.set = v => { v = Math.max(0, Math.min(max, v)); el.setAttribute('aria-valuenow', v); bar.style.setProperty('--pct', (v / max * 100) + '%'); return el; };
    el.set(o.value || 0);
    return el;
  }

  /** Question dots — done = star, now = bobbing star outline, todo = small dot. el.set(current) */
  function dots(total, current) {
    const el = h('div', { class: 'ch-dots', role: 'img' });
    el.set = cur => {
      el.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const state = i < cur ? 'is-done' : i === cur ? 'is-now' : 'is-todo';
        el.appendChild(h('div', { class: 'ch-dot ' + state, html: state === 'is-todo' ? ICONS.dot : starFilled(state === 'is-now' ? 'is-empty' : '') }));
      }
      el.setAttribute('aria-label', `Question ${Math.min(cur + 1, total)} of ${total}`);
      return el;
    };
    return el.set(current || 0);
  }

  /* ===================== effects ===================== */
  function bounce(el) { play(el, 'ch-bounce', 500); }
  function wobble(el) { play(el, 'ch-wobble', 550); }
  function cheer(el) { play(el, 'ch-cheer', 1300); }
  function wave(el) { play(el, 'ch-wave', 1900); }
  function glow(el, on) { if (el) el.classList.toggle('ch-glow', on !== false); }

  /** A pointing hand that bobs next to an element (hint). Returns remove(). */
  function pointAt(el) {
    if (!el) return () => {};
    const p = h('div', { class: 'ch-pointer', html: ICONS.hand, 'aria-hidden': 'true' });
    document.body.appendChild(p);
    const place = () => { const r = el.getBoundingClientRect(); p.style.left = (r.left + r.width * .6) + 'px'; p.style.top = (r.top + r.height * .55) + 'px'; };
    place(); addEventListener('resize', place); addEventListener('scroll', place, true);
    glow(el, true);
    return () => { p.remove(); glow(el, false); removeEventListener('resize', place); removeEventListener('scroll', place, true); };
  }

  /** Stars flying from one element to another (e.g. into the star counter). Resolves when done. */
  function flyStars(from, to, n) {
    n = n || 3;
    if (!from || !to || motion.reduced()) return Promise.resolve();
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const jobs = [];
    for (let i = 0; i < n; i++) {
      const s = h('div', { class: 'ch-flystar', html: starFilled(''), 'aria-hidden': 'true' });
      s.style.left = (a.left + a.width / 2 - 20) + 'px'; s.style.top = (a.top + a.height / 2 - 20) + 'px';
      document.body.appendChild(s);
      const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
      const an = s.animate([
        { transform: 'translate(0,0) scale(.6) rotate(0)', opacity: 1 },
        { transform: `translate(${dx * .45 + (i - 1) * 40}px,${dy * .45 - 90}px) scale(1.25) rotate(180deg)`, opacity: 1, offset: .45 },
        { transform: `translate(${dx}px,${dy}px) scale(.5) rotate(360deg)`, opacity: .9 }
      ], { duration: 900, delay: i * 160, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      jobs.push(an.finished.catch(() => {}).then(() => s.remove()));
    }
    return Promise.all(jobs).then(() => bounce(to));
  }

  /** Confetti burst over the whole screen (skipped with reduced motion). */
  function confetti(ms) {
    if (motion.reduced()) return;
    ms = ms || 4500;
    let c = document.getElementById('ch-confetti');
    if (!c) { c = h('canvas', { id: 'ch-confetti', 'aria-hidden': 'true' }); document.body.appendChild(c); }
    const dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = ['#ff5c8d', '#ffc93c', '#5fb043', '#3f8fe0', '#a66bff', '#ff9330'];
    const ps = Array.from({ length: 140 }, (_, i) => ({ x: Math.random() * W, y: -20 - Math.random() * H * .6, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 3, r: Math.random() * 6, vr: (Math.random() - .5) * .3, s: 7 + Math.random() * 6, c: cols[i % 6], k: i % 3 }));
    const t0 = performance.now();
    (function f(t) {
      g.clearRect(0, 0, W, H);
      ps.forEach(p => {
        p.x += p.vx + Math.sin(t / 300 + p.r) * .6; p.y += p.vy; p.r += p.vr;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c;
        if (p.k === 0) g.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6);
        else if (p.k === 1) { g.beginPath(); g.arc(0, 0, p.s / 2.4, 0, 7); g.fill(); }
        else { g.beginPath(); g.moveTo(0, -p.s / 2); g.lineTo(p.s / 2, p.s / 2); g.lineTo(-p.s / 2, p.s / 2); g.fill(); }
        g.restore();
      });
      if (t - t0 < ms) requestAnimationFrame(f); else g.clearRect(0, 0, W, H);
    })(t0);
  }

  CH.ui = {
    bigButton, iconButton, replayButton, starRating, bubble, modal, parentGate, progressBar, dots,
    pressable, numWord, ICONS,
    fx: { bounce, wobble, cheer, wave, glow, pointAt, flyStars, confetti, play },
    motion
  };
})();
