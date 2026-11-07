/* =====================================================================
   Cheerful Heart Adventures — shared player form
   CH.profileForm({ player?, title?, intro?, onSaved(player) })
   Used by "Who's playing?" (add) and the Grown-ups' Corner (add + edit).
   Needs: core/store.js, core/voice.js, core/ui.js, core/avatars.js
   Collects only a first name / nickname, a picture, an optional age and an
   optional "say it as" spelling for the voice. Nothing else.
   ===================================================================== */
(function () {
  'use strict';
  const CH = window.CH;
  if (!CH || !CH.ui || !CH.store) return;
  const { ui, h, store } = CH;
  const sfx = name => { try { window.KG && KG.sfx && KG.sfx[name] && KG.sfx[name](); } catch (e) {} };

  CH.profileForm = function (o) {
    o = o || {};
    const edit = o.player || null;
    const used = new Set(store.players().filter(p => !edit || p.id !== edit.id).map(p => p.avatar));
    const free = CH.AVATARS.filter(a => !used.has(a.id));
    const rnd = list => list[Math.floor(Math.random() * list.length)];
    let avatar = edit ? edit.avatar : (free.length ? rnd(free) : rnd(CH.AVATARS)).id;
    let age = edit ? edit.age : null;
    const MAX = store.MAX_NAME;

    const nameIn = h('input', { class: 'ch-input', id: 'pname', type: 'text', maxlength: MAX, autocomplete: 'off', autocapitalize: 'words', spellcheck: 'false', enterkeyhint: 'done', 'aria-describedby': 'pname-help perr' });
    nameIn.value = edit ? edit.name : '';
    const countTxt = () => `First name or nickname · ${nameIn.value.length}/${MAX}`;
    const count = h('span', { class: 'help', id: 'pname-help', text: countTxt() });
    const err = h('div', { class: 'ch-err', id: 'perr', role: 'alert' });
    nameIn.addEventListener('input', () => { count.textContent = countTxt(); err.textContent = ''; });

    /* picture picker (radio group with arrow keys) */
    const pick = h('div', { class: 'ch-avpick', role: 'radiogroup', 'aria-label': 'Pick a picture' });
    const drawPick = () => {
      pick.innerHTML = '';
      CH.AVATARS.forEach(a => {
        const b = h('button', { type: 'button', role: 'radio', 'aria-checked': String(a.id === avatar), 'aria-label': a.name, tabindex: a.id === avatar ? '0' : '-1', html: CH.avatarSVG(a.id) });
        b.onclick = () => { avatar = a.id; drawPick(); pick.querySelector('[aria-checked="true"]').focus(); sfx('pop'); };
        pick.appendChild(b);
      });
    };
    pick.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
      e.preventDefault();
      const i = CH.AVATARS.findIndex(a => a.id === avatar);
      avatar = CH.AVATARS[(i + d + CH.AVATARS.length) % CH.AVATARS.length].id;
      drawPick(); pick.querySelector('[aria-checked="true"]').focus();
    });
    drawPick();

    /* age (optional) */
    const seg = h('div', { class: 'ch-seg', role: 'group', 'aria-label': 'Age (optional)' });
    const drawAge = () => [...seg.children].forEach((x, k) => x.setAttribute('aria-pressed', String(age === k + 4)));
    [4, 5, 6].forEach(n => seg.appendChild(ui.bigButton({ label: String(n), variant: 'paper', ariaLabel: 'Age ' + n, onClick: () => { age = age === n ? null : n; drawAge(); } })));
    drawAge();

    /* how the voice says the name (optional) */
    const sayIn = h('input', { class: 'ch-input', id: 'psay', type: 'text', maxlength: MAX, autocomplete: 'off', spellcheck: 'false', placeholder: 'e.g. Ah-lee-yah', 'aria-describedby': 'psay-help' });
    sayIn.value = edit && edit.sayAs ? edit.sayAs : '';
    const test = ui.iconButton({ icon: 'speak', label: 'Hear the name', onClick: () => {
      try { CH.voice.unlock(); } catch (e) {}
      const spoken = sayIn.value.trim() || CH.voice.speakName(nameIn.value.trim() || 'friend');
      CH.voice.speak('Hi, ' + spoken + '!', { who: 'narrator' });
    } });
    const sayRow = h('div', { class: 'ch-row', style: { display: 'flex', gap: '8px', alignItems: 'center' } }, [sayIn, test]);

    const body = h('div', { class: 'ch-stack' }, [
      o.intro !== false ? h('p', { style: { margin: 0 }, text: o.intro || (edit ? 'Change the name, picture or age.' : 'Grown-up: type the child’s name, then let them pick their picture.') }) : null,
      h('div', { class: 'ch-field' }, [h('label', { for: 'pname', text: 'Name' }), nameIn, count]),
      h('div', { class: 'ch-field' }, [h('span', { class: 'lbl', text: 'Picture' }), pick]),
      h('div', { class: 'ch-field' }, [h('span', { class: 'lbl', text: 'Age (optional)' }), seg]),
      h('details', { class: 'ch-more' }, [
        h('summary', { text: 'Voice says the name wrong?' }),
        h('div', { class: 'ch-field', style: { marginTop: '8px' } }, [
          h('label', { for: 'psay', text: 'Say the name as (optional)' }), sayRow,
          h('span', { class: 'help', id: 'psay-help', text: 'Spell it the way it sounds. Only the voice uses this.' })])
      ]),
      err
    ].filter(Boolean));
    if (sayIn.value) body.querySelector('details').open = true;

    const save = close => {
      const data = { name: nameIn.value, avatar, age, sayAs: sayIn.value };
      const r = edit ? store.updatePlayer(edit.id, data) : store.addPlayer(data);
      if (!r.ok) {
        err.textContent = r.error === 'full' ? 'This device already has ' + store.MAX_PLAYERS + ' players.' : 'Please type a name (up to ' + MAX + ' letters).';
        ui.fx.wobble(nameIn); nameIn.focus(); return;
      }
      close();
      o.onSaved && o.onSaved(r.player);
    };
    const m = ui.modal({
      title: o.title || (edit ? 'Edit ' + edit.name : 'Add a player'), body, initialFocus: '#pname',
      actions: [
        { label: 'Cancel', variant: 'paper' },
        { label: 'Save', variant: 'leaf', icon: edit ? undefined : 'plus', keepOpen: true, onClick: save }
      ]
    });
    const submit = e => { if (e.key === 'Enter') { e.preventDefault(); m.card.querySelector('.ch-modal__actions .ch-btn:last-child').click(); } };
    nameIn.addEventListener('keydown', submit);
    sayIn.addEventListener('keydown', submit);
    return m;
  };
})();
