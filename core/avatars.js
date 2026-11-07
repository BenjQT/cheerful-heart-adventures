/* =====================================================================
   Cheerful Heart Adventures — player avatars
   CH.AVATARS (10 animals) and CH.avatarSVG(id).
   Each animal has its own silhouette (ears / tufts / mane), so children
   can recognise "their" face by shape, not only by colour.
   ===================================================================== */
(function () {
  'use strict';
  const CH = (window.CH = window.CH || {});
  const INK = '#2a1f3d';

  const AVATARS = [
    { id: 'bunny', name: 'Bunny', bg: '#ffd9e8', face: '#ffffff', edge: '#c9a3b6' },
    { id: 'cat',   name: 'Kitty', bg: '#ffe2b8', face: '#ffa94d', edge: '#b8661a' },
    { id: 'dog',   name: 'Puppy', bg: '#e8f1ff', face: '#d9a066', edge: '#8a5528' },
    { id: 'bear',  name: 'Bear',  bg: '#dff3d6', face: '#b07a4f', edge: '#6e4322' },
    { id: 'panda', name: 'Panda', bg: '#e6f7f2', face: '#ffffff', edge: '#8c8c9c' },
    { id: 'fox',   name: 'Fox',   bg: '#fff3c4', face: '#ff7a2f', edge: '#b04a10' },
    { id: 'frog',  name: 'Frog',  bg: '#e3f6ff', face: '#6cc04a', edge: '#2f7d1f' },
    { id: 'owl',   name: 'Owl',   bg: '#efe6ff', face: '#9b7be0', edge: '#5530b8' },
    { id: 'chick', name: 'Chick', bg: '#ffe9f2', face: '#ffd23f', edge: '#c98207' },
    { id: 'lion',  name: 'Lion',  bg: '#fff0d6', face: '#ffc464', edge: '#b0700f' }
  ];
  const byId = Object.fromEntries(AVATARS.map(a => [a.id, a]));

  const eyes = (y, r, gap) => `<circle cx="${50 - gap}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${50 + gap}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${50 - gap + r * .35}" cy="${y - r * .35}" r="${r * .32}" fill="#fff"/><circle cx="${50 + gap + r * .35}" cy="${y - r * .35}" r="${r * .32}" fill="#fff"/>`;
  const cheeks = (y, c) => `<ellipse cx="31" cy="${y}" rx="6" ry="4" fill="${c || '#ff8fb0'}" opacity=".7"/><ellipse cx="69" cy="${y}" rx="6" ry="4" fill="${c || '#ff8fb0'}" opacity=".7"/>`;
  const smile = y => `<path d="M43 ${y}q7 6 14 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  const head = (a, r) => `<circle cx="50" cy="56" r="${r || 32}" fill="${a.face}" stroke="${a.edge}" stroke-width="3.5"/>`;

  const PARTS = {
    bunny: a => `<ellipse cx="38" cy="22" rx="8" ry="20" fill="${a.face}" stroke="${a.edge}" stroke-width="3.5"/><ellipse cx="62" cy="22" rx="8" ry="20" fill="${a.face}" stroke="${a.edge}" stroke-width="3.5"/><ellipse cx="38" cy="24" rx="3.5" ry="13" fill="#ffb3cc"/><ellipse cx="62" cy="24" rx="3.5" ry="13" fill="#ffb3cc"/>${head(a)}${eyes(52, 4.5, 11)}${cheeks(63)}<path d="M47 59h6l-3 4z" fill="#ff6f9e"/>${smile(65)}`,
    cat: a => `<path d="M24 46 26 16l20 18zM76 46 74 16 54 34z" fill="${a.face}" stroke="${a.edge}" stroke-width="3.5" stroke-linejoin="round"/><path d="M29 38 30 24l9 9zM71 38l-1-14-9 9z" fill="#ffd0a8"/>${head(a)}${eyes(53, 4.5, 11)}${cheeks(63)}<path d="M47 60h6l-3 3z" fill="#e0567e"/><path d="M24 60h12M24 66l12-3M76 60H64M76 66l-12-3" stroke="${a.edge}" stroke-width="2" stroke-linecap="round"/>${smile(65)}`,
    dog: a => `${head(a)}<path d="M22 40c-8 6-8 26 2 32 6-4 8-18 6-30z" fill="#8a5528" stroke="${a.edge}" stroke-width="3"/><path d="M78 40c8 6 8 26-2 32-6-4-8-18-6-30z" fill="#8a5528" stroke="${a.edge}" stroke-width="3"/><ellipse cx="50" cy="66" rx="13" ry="10" fill="#f3d7b4"/>${eyes(51, 4.5, 11)}<ellipse cx="50" cy="61" rx="5" ry="3.6" fill="${INK}"/>${smile(67)}<path d="M50 70v6" stroke="#e0567e" stroke-width="4" stroke-linecap="round"/>`,
    bear: a => `<circle cx="27" cy="31" r="10" fill="${a.face}" stroke="${a.edge}" stroke-width="3.5"/><circle cx="73" cy="31" r="10" fill="${a.face}" stroke="${a.edge}" stroke-width="3.5"/><circle cx="27" cy="31" r="4.5" fill="#e4b48a"/><circle cx="73" cy="31" r="4.5" fill="#e4b48a"/>${head(a)}<ellipse cx="50" cy="66" rx="12" ry="9" fill="#e4b48a"/>${eyes(52, 4.5, 11)}<ellipse cx="50" cy="62" rx="4.5" ry="3.2" fill="${INK}"/>${smile(67)}`,
    panda: a => `<circle cx="27" cy="31" r="10" fill="${INK}"/><circle cx="73" cy="31" r="10" fill="${INK}"/>${head(a)}<ellipse cx="38" cy="53" rx="8" ry="10" fill="${INK}" transform="rotate(-20 38 53)"/><ellipse cx="62" cy="53" rx="8" ry="10" fill="${INK}" transform="rotate(20 62 53)"/><circle cx="39" cy="52" r="3" fill="#fff"/><circle cx="61" cy="52" r="3" fill="#fff"/>${cheeks(66)}<ellipse cx="50" cy="63" rx="4.5" ry="3.2" fill="${INK}"/>${smile(68)}`,
    fox: a => `<path d="M22 48 22 12l24 22zM78 48V12L54 34z" fill="${a.face}" stroke="${a.edge}" stroke-width="3.5" stroke-linejoin="round"/><path d="M27 38V22l10 9zM73 38V22l-10 9z" fill="${INK}"/>${head(a)}<path d="M20 56c10 2 20 8 30 22 10-14 20-20 30-22-2 18-14 30-30 30S22 74 20 56z" fill="#fff"/>${eyes(52, 4.5, 12)}<ellipse cx="50" cy="66" rx="4.5" ry="3.2" fill="${INK}"/>`,
    frog: a => `<circle cx="33" cy="30" r="13" fill="${a.face}" stroke="${a.edge}" stroke-width="3.5"/><circle cx="67" cy="30" r="13" fill="${a.face}" stroke="${a.edge}" stroke-width="3.5"/><ellipse cx="50" cy="60" rx="36" ry="28" fill="${a.face}" stroke="${a.edge}" stroke-width="3.5"/><circle cx="33" cy="30" r="8" fill="#fff"/><circle cx="67" cy="30" r="8" fill="#fff"/><circle cx="34" cy="31" r="4.5" fill="${INK}"/><circle cx="66" cy="31" r="4.5" fill="${INK}"/>${cheeks(64)}<path d="M34 64q16 14 32 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`,
    owl: a => `<path d="M22 40 26 12l16 20zM78 40l-4-28-16 20z" fill="${a.face}" stroke="${a.edge}" stroke-width="3.5" stroke-linejoin="round"/>${head(a, 33)}<circle cx="38" cy="52" r="12" fill="#fff" stroke="${a.edge}" stroke-width="2.5"/><circle cx="62" cy="52" r="12" fill="#fff" stroke="${a.edge}" stroke-width="2.5"/><circle cx="38" cy="53" r="6" fill="${INK}"/><circle cx="62" cy="53" r="6" fill="${INK}"/><circle cx="40" cy="51" r="2" fill="#fff"/><circle cx="64" cy="51" r="2" fill="#fff"/><path d="M45 64h10l-5 9z" fill="#ffb02e" stroke="#c98207" stroke-width="2" stroke-linejoin="round"/><path d="M34 78q4 4 8 0M46 80q4 4 8 0M58 78q4 4 8 0" fill="none" stroke="${a.edge}" stroke-width="2.5" stroke-linecap="round"/>`,
    chick: a => `<path d="M50 24c-2-10 6-14 8-10-4 1-5 5-4 9 2-8 10-8 10-3-5 0-8 3-9 6z" fill="${a.face}" stroke="${a.edge}" stroke-width="2.5" stroke-linejoin="round"/>${head(a, 33)}${eyes(52, 4.8, 11)}${cheeks(63)}<path d="M42 61h16l-8 9z" fill="#ff9330" stroke="#c4600a" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 62c4-6 10-6 12-2M86 62c-4-6-10-6-12-2" fill="none" stroke="${a.edge}" stroke-width="3" stroke-linecap="round"/>`,
    lion: a => `${Array.from({ length: 14 }, (_, i) => { const t = i / 14 * Math.PI * 2; return `<circle cx="${50 + Math.cos(t) * 34}" cy="${56 + Math.sin(t) * 34}" r="11" fill="#d9822b" stroke="#a35a12" stroke-width="2.5"/>`; }).join('')}${head(a, 30)}<circle cx="31" cy="34" r="6" fill="${a.face}" stroke="${a.edge}" stroke-width="3"/><circle cx="69" cy="34" r="6" fill="${a.face}" stroke="${a.edge}" stroke-width="3"/>${eyes(52, 4.5, 10)}<ellipse cx="50" cy="66" rx="11" ry="8" fill="#ffe2b0"/><path d="M46 61h8l-4 4z" fill="#7a3e12"/>${smile(67)}`
  };

  /** avatarSVG(id, {title}) — square SVG with a soft round background */
  function avatarSVG(id, o) {
    o = o || {};
    const a = byId[id] || AVATARS[0];
    const t = o.title ? `<title>${a.name}</title>` : '';
    return `<svg class="ch-avatar" viewBox="0 0 100 100" role="${o.title ? 'img' : 'presentation'}" aria-hidden="${o.title ? 'false' : 'true'}">${t}<circle cx="50" cy="50" r="48" fill="${a.bg}"/>${PARTS[a.id](a)}</svg>`;
  }

  CH.AVATARS = AVATARS;
  CH.avatar = id => byId[id] || AVATARS[0];
  CH.avatarSVG = avatarSVG;
})();
