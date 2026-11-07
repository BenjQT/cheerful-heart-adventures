/* Cheerful Heart Adventures — shared engine: characters, voices, beat-synced music, voxel scenery, game shell */
(function(){
'use strict';
const KG=window.KG={};
const $=(s,r)=>(r||document).querySelector(s);
KG.$=$;

/* ---------------- data ---------------- */
const HEROES={
  ali:{name:'Ali',role:'Kind thinker',ring:'#3d63c9',p:1.9,r:1.06,notes:[880,1046.5,1174.66,1318.5]},
  wynea:{name:'Wynea',role:'Brave explorer',ring:'#ff5c8d',p:1.78,r:1.1,notes:[659.25,783.99,880,1046.5]},
  matthew:{name:'Matthew',role:'Silly inventor',ring:'#4aa3e0',p:1.6,r:1.12,notes:[392,440,523.25,587.33]}
};
for(const k in HEROES){HEROES[k].head='img/'+k+'.webp';HEROES[k].full='img/'+k+'-full.webp'}
KG.HEROES=HEROES;KG.ORDER=['ali','wynea','matthew'];
KG.GAMES=(window.CH&&CH.config)?CH.config.GAMES:[
  {id:'star-map',file:'star-map.html',title:'The Lost Star Map',skill:'Counting and number order',tag:'Counting',scene:'forest',icon:'star'},
  {id:'shapes',file:'shapes.html',title:'Shape Kingdom Rescue',skill:'Naming shapes',tag:'Shapes',scene:'castle',icon:'shapes'},
  {id:'patterns',file:'patterns.html',title:'Matthew’s Pattern Machine',skill:'Finishing patterns',tag:'Patterns',scene:'lab',icon:'pattern'},
  {id:'treasure',file:'treasure.html',title:'Treasure of Coconut Island',skill:'More, fewer and the same',tag:'Comparing',scene:'beach',icon:'chest'},
  {id:'cookies',file:'cookies.html',title:'Ali’s Cookie Party',skill:'Adding and taking away within 10',tag:'Add & subtract',scene:'party',icon:'cookie'},
  {id:'bridge',file:'bridge.html',title:'Jungle Bridge Builder',skill:'Long, short, tall',tag:'Measuring',scene:'jungle',icon:'log'},
  {id:'sorting',file:'sorting.html',title:'The Sorting Spaceship',skill:'Sorting by color, size and shape',tag:'Sorting',scene:'space',icon:'rocket'},
  {id:'clock',file:'clock.html',title:'Wynea’s Clock Tower Quest',skill:'Telling time to the hour',tag:'Time',scene:'clock',icon:'clock'},
  {id:'market',file:'market.html',title:'Market Day Adventure',skill:'Counting peso coins',tag:'Money',scene:'market',icon:'coin'},
  {id:'hide-seek',file:'hide-seek.html',title:'Hide-and-Seek Village',skill:'Position words',tag:'Positions',scene:'village',icon:'house'},
  {id:'garden',file:'garden.html',title:'Rainbow Number Garden',skill:'Matching numbers to groups',tag:'Number sense',scene:'garden',icon:'flower'},
  {id:'race',file:'race.html',title:'The Great Friendship Race',skill:'Dice counting and review',tag:'Review',scene:'track',icon:'dice'}
];

/* ---------------- progress ---------------- */
function loadProg(){try{const v=JSON.parse(localStorage.getItem('kg-progress')||'{}');return{won:v.won||{},music:v.music!==false}}catch(e){return{won:{},music:true}}}
KG.prog=loadProg();
KG.save=function(){try{localStorage.setItem('kg-progress',JSON.stringify(KG.prog))}catch(e){}};
KG.starsFor=function(id){if(id==='star-map'){try{const v=JSON.parse(localStorage.getItem('starmap-progress')||'{}');const n=Object.keys(v.won||{}).length;return n?Math.min(3,n):0}catch(e){return 0}}return KG.prog.won[id]||0};

/* ---------------- helpers ---------------- */
KG.rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
KG.pick=a=>a[Math.floor(Math.random()*a.length)];
KG.shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
KG.el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
KG.sleep=ms=>new Promise(r=>setTimeout(r,ms));
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
KG.mulberry=mulberry;
function hexRgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[n>>16&255,n>>8&255,n&255]}
function shade(h,a){const c=hexRgb(h);return`rgb(${c.map(v=>Math.max(0,Math.min(255,Math.round(v+a)))).join(',')})`}
KG.shade=shade;
const NUMW=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
KG.word=n=>NUMW[n]||String(n);

/* ---------------- fonts + css ---------------- */
(function(){
  const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Lilita+One&display=swap';document.head.appendChild(l);
  const css=`
:root{--ink:#2a1f3d;--cream:#fff8ea;--paper:#fffdf6;--wood:#a86b3a;--wood-d:#6e4322;--plank:#d9a066;--gold:#ffc93c;--gold-d:#d98f0b;--leaf:#5fb043;--leaf-d:#3c8228;--heart:#ff5c8d;--heart-d:#d63a6c;--sky:#3f8fe0;--sky-d:#2a68b0;--grape:#8a5cf6;--grape-d:#6236c9;
--display:'Lilita One','Arial Rounded MT Bold','Trebuchet MS',system-ui,sans-serif;--body:'Fredoka','Nunito','Arial Rounded MT Bold',system-ui,sans-serif;--kick:0;--cast-h:clamp(100px,22vh,210px);color-scheme:light}
*{box-sizing:border-box}
[hidden]{display:none!important}
html,body{height:100%;margin:0;overflow:hidden}
body{font-family:var(--body);color:var(--ink);background:#7cc4ff;touch-action:manipulation;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;font-size:16px}
button{font-family:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;color:inherit}
button:focus-visible,a:focus-visible{outline:4px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px var(--ink)}
#kg-bg{position:fixed;inset:0;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges;z-index:0}
.kg-btn{display:inline-flex;align-items:center;justify-content:center;gap:.4em;font-family:var(--display);font-size:clamp(1.05rem,3.6vw,1.35rem);letter-spacing:.02em;color:#fff;border:0;border-radius:12px;padding:.55em 1.15em .65em;background:var(--leaf);text-decoration:none;
 box-shadow:inset 0 -6px 0 var(--leaf-d),inset 0 3px 0 rgba(255,255,255,.35),0 5px 0 rgba(42,31,61,.22);text-shadow:0 2px 0 rgba(0,0,0,.22);transition:transform .08s}
.kg-btn:active{transform:translateY(3px)}
.kg-btn svg{width:1.1em;height:1.1em;flex:none}
.kg-btn.gold{background:var(--gold);color:var(--ink);text-shadow:0 2px 0 rgba(255,255,255,.45);box-shadow:inset 0 -6px 0 var(--gold-d),inset 0 3px 0 rgba(255,255,255,.5),0 5px 0 rgba(42,31,61,.22)}
.kg-btn.sky{background:var(--sky);box-shadow:inset 0 -6px 0 var(--sky-d),inset 0 3px 0 rgba(255,255,255,.35),0 5px 0 rgba(42,31,61,.22)}
.kg-btn.big{font-size:clamp(1.4rem,5vw,1.9rem);padding:.5em 1.6em .62em}
.kg-icon{width:56px;height:56px;flex:none;display:grid;place-items:center;border:0;border-radius:14px;background:var(--cream);color:var(--wood-d);box-shadow:inset 0 -5px 0 #e7cfa6,0 4px 0 rgba(42,31,61,.2);text-decoration:none}
.kg-icon:active{transform:translateY(2px)}
.kg-icon svg{width:27px;height:27px}
.kg-icon.off{opacity:.55}
.kg-panel{background:repeating-linear-gradient(180deg,var(--plank) 0 22px,#cf9558 22px 24px);border:4px solid var(--wood-d);border-radius:18px;box-shadow:inset 0 0 0 3px #e9b77f,0 10px 0 rgba(42,31,61,.25),0 18px 40px rgba(42,31,61,.25);padding:14px}
.kg-paper{background:var(--paper);border-radius:14px;box-shadow:inset 0 -5px 0 #ecdcbf,0 4px 0 rgba(42,31,61,.15)}
.kg-top{position:fixed;top:0;left:0;right:0;z-index:6;display:flex;align-items:center;gap:clamp(6px,2vw,10px);padding-top:calc(env(safe-area-inset-top,0px) + 10px);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));pointer-events:none}
.kg-top>*{pointer-events:auto}
.kg-top .sp{flex:1;pointer-events:none}
.kg-chip{font-family:var(--display);font-size:clamp(.9rem,3.2vw,1.15rem);color:#fff;background:rgba(42,31,61,.58);padding:.35em .9em;border-radius:999px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.kg-bubble{position:fixed;z-index:5;top:calc(env(safe-area-inset-top,0px) + 70px);left:max(16px,env(safe-area-inset-left,0px));right:max(16px,env(safe-area-inset-right,0px));display:flex;align-items:center;gap:10px;max-width:620px;margin:0 auto;transition:opacity .25s,transform .25s;pointer-events:none}
.kg-bubble.hide{opacity:0;transform:translateY(-8px)}
.kg-bubble .face{flex:none;width:clamp(50px,13vw,64px);aspect-ratio:1;border-radius:50%;background:#fff;border:4px solid var(--ring,#fff);overflow:hidden;box-shadow:0 4px 0 rgba(42,31,61,.2);transform:translateY(calc(var(--kick)*-4px))}
.kg-bubble .face img{width:100%;height:100%;object-fit:cover;display:block}
.kg-bubble .say{position:relative;flex:1;min-width:0;background:var(--paper);border-radius:16px;padding:8px 14px 10px;box-shadow:0 4px 0 rgba(42,31,61,.18);min-height:56px}
.kg-bubble .say::before{content:"";position:absolute;left:-9px;top:20px;border:9px solid transparent;border-right-color:var(--paper);border-left:0}
.kg-bubble .who{font-family:var(--display);font-size:.92rem;color:var(--ring,var(--heart))}
.kg-bubble .txt{font-weight:600;font-size:clamp(1rem,3.7vw,1.2rem);line-height:1.25}
.kg-bubble .txt b{color:var(--heart-d)}
#kg-stage{position:fixed;z-index:2;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 150px);bottom:calc(var(--cast-h)*.62 + env(safe-area-inset-bottom,0px) + 6px);display:flex;align-items:center;justify-content:center;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:4px}
.kg-cast{position:fixed;z-index:3;right:max(4px,env(safe-area-inset-right,0px));bottom:calc(env(safe-area-inset-bottom,0px) - var(--cast-h)*.08);display:flex;align-items:flex-end;pointer-events:none}
.kg-cast img{height:var(--cast-h);width:auto;margin-left:calc(var(--cast-h)*-.16);filter:drop-shadow(0 5px 0 rgba(42,31,61,.18));transform-origin:50% 100%;transform:translateY(calc(var(--kick)*-5px)) scaleY(calc(1 - var(--kick)*.025));transition:height .3s}
.kg-cast img.talk{transform:translateY(calc(var(--kick)*-14px)) rotate(calc((var(--kick) - .35)*5deg))}
.kg-cast img.cheer{animation:kg-jump .42s ease-in-out infinite}
@keyframes kg-jump{50%{transform:translateY(-22%) rotate(-4deg)}}
@keyframes kg-bob{50%{transform:translateY(-4px)}}
.kg-top .kg-chip{flex:0 1 auto}
@media (max-width:640px){.kg-top .kg-chip{display:none}}
.kg-dots{display:flex;align-items:center;gap:clamp(2px,.8vw,6px);padding:6px clamp(6px,2vw,10px);flex:0 1 auto;min-width:0;border-radius:999px;background:rgba(42,31,61,.45);pointer-events:none}
.kg-dot{flex:none;width:clamp(9px,2.6vw,22px);aspect-ratio:1;display:grid;place-items:center}
.kg-dot svg{width:100%;height:100%;display:block}
.kg-dot i{width:56%;aspect-ratio:1;border-radius:50%;background:rgba(255,253,246,.75);box-shadow:inset 0 -2px 0 rgba(110,67,34,.35)}
.kg-dot.now i{width:72%;background:#fff;box-shadow:0 0 0 3px var(--gold)}
.kg-dot.now{animation:kg-bob 1s ease-in-out infinite}
.kg-dot.got svg{animation:kg-pop .45s}
.kg-cast img.think{transform:rotate(-5deg) translateY(2%);transition:transform .4s}
.kg-hand{position:fixed;z-index:26;pointer-events:none}
.kg-sticker{display:inline-grid;place-items:center;width:clamp(72px,min(20vw,13vh),104px);aspect-ratio:1;border-radius:50%;background:#fff;box-shadow:0 0 0 5px var(--ring,var(--gold)),0 6px 0 5px rgba(42,31,61,.22);transform:rotate(-8deg)}
.kg-sticker .in{width:68%;aspect-ratio:1}.kg-sticker .in svg{width:100%;height:100%;overflow:visible}
.kg-win .got{display:grid;justify-items:center;gap:8px;font-family:var(--display);font-size:1.1rem;color:var(--heart-d)}
.kg-win .got .kg-sticker{animation:kg-stick .7s .9s cubic-bezier(.2,1.5,.4,1) backwards}
@keyframes kg-stick{from{transform:scale(2.4) rotate(20deg);opacity:0}}
@media (max-height:560px){.kg-win .trio{display:none}.kg-win .kg-paper{gap:6px;padding-block:10px}}
.kg-best{font-family:var(--display);font-size:1.05rem;color:var(--ink);background:var(--gold);padding:.25em .9em;border-radius:999px;box-shadow:inset 0 -3px 0 var(--gold-d);animation:kg-pop .5s 1.2s backwards}
.kg-win .s3 .ch-stars{--size:clamp(52px,14vw,66px)}
.kg-bonus{position:fixed;z-index:7;left:max(16px,env(safe-area-inset-left,0px));bottom:calc(env(safe-area-inset-bottom,0px) + 16px);width:64px;height:64px;pointer-events:none}
.kg-bonus circle{fill:none;stroke-width:9}.kg-bonus .bg{stroke:rgba(255,253,246,.7)}.kg-bonus .fg{stroke:var(--gold);stroke-linecap:round;transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dashoffset .25s linear}
.kg-bonus.done{opacity:0;transition:opacity .4s}
html[data-motion="reduce"] .kg-dot.now,html[data-motion="reduce"] .kg-win .trio img,html[data-motion="reduce"] .kg-cast img.cheer{animation:none!important}
@media (prefers-reduced-motion:reduce){.kg-dot.now,.kg-win .trio img,.kg-cast img.cheer{animation:none!important}}
.kg-overlay{position:fixed;inset:0;z-index:20;display:grid;place-items:center;overflow-y:auto;padding-block:max(12px,env(safe-area-inset-top,0px)) max(12px,env(safe-area-inset-bottom,0px));padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.kg-overlay.dim{background:rgba(42,31,61,.32)}
.kg-intro{width:min(560px,100%);display:grid;gap:14px;justify-items:center;text-align:center;animation:kg-rise .5s cubic-bezier(.2,1.4,.4,1)}
@keyframes kg-rise{from{transform:translateY(30px) scale(.92);opacity:0}}
.kg-intro .tag{font-weight:700;font-size:.9rem;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--heart);padding:.35em .9em;border-radius:999px;box-shadow:inset 0 -3px 0 var(--heart-d)}
.kg-title{margin:0;font-family:var(--display);font-weight:400;font-size:clamp(2.1rem,9vw,3.6rem);line-height:1;color:var(--gold);text-wrap:balance;text-shadow:0 4px 0 var(--wood-d),3px 0 0 var(--wood-d),-3px 0 0 var(--wood-d),0 -3px 0 var(--wood-d),3px 3px 0 var(--wood-d),-3px 3px 0 var(--wood-d),3px -3px 0 var(--wood-d),-3px -3px 0 var(--wood-d),0 9px 0 rgba(42,31,61,.25)}
.kg-intro .trio{display:flex;align-items:flex-end;justify-content:center;height:clamp(130px,26vh,220px)}
.kg-intro .trio img{height:100%;margin:0 -10px;filter:drop-shadow(0 6px 0 rgba(42,31,61,.2));transform-origin:50% 100%;transform:translateY(calc(var(--kick)*-8px))}
.kg-intro .trio img:nth-child(2){height:108%}
.kg-intro .card{padding:12px 16px 14px;font-weight:600;font-size:1.05rem;line-height:1.35;max-width:46ch}
.kg-intro .card small{display:block;margin-top:6px;color:#8a6a4a;font-size:.85rem}
.kg-win{width:min(480px,100%);text-align:center;display:grid;gap:12px;justify-items:center;animation:kg-rise .5s cubic-bezier(.2,1.4,.4,1)}
.kg-win .kg-paper{padding:16px 14px 18px;width:100%;display:grid;gap:10px;justify-items:center}
.kg-win h2{margin:0;font-family:var(--display);font-weight:400;font-size:clamp(2rem,8vw,2.8rem);color:var(--gold);text-shadow:0 3px 0 var(--wood-d),2px 0 0 var(--wood-d),-2px 0 0 var(--wood-d),0 -2px 0 var(--wood-d)}
.kg-win .s3{display:flex;gap:8px}
.kg-win .s3 svg{width:clamp(48px,13vw,62px);height:auto;filter:drop-shadow(0 3px 0 var(--gold-d));animation:kg-spin .6s backwards}
.kg-win .s3 svg:nth-child(2){animation-delay:.15s}.kg-win .s3 svg:nth-child(3){animation-delay:.3s}
.kg-win .s3 svg.dim{filter:grayscale(1) opacity(.35)}
@keyframes kg-spin{from{transform:scale(0) rotate(-120deg)}}
.kg-win p{margin:0;font-weight:600;font-size:1.08rem}
.kg-win .row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.kg-card{border:0;background:var(--paper);border-radius:16px;box-shadow:inset 0 -6px 0 #ecdcbf,0 5px 0 rgba(42,31,61,.18);transition:transform .12s;display:grid;place-items:center;padding:8px}
.kg-card:active{transform:translateY(3px) scale(.98)}
@media (hover:hover){.kg-card:hover{transform:translateY(-3px)}}
.kg-num{font-family:var(--body);font-weight:700;font-variant-numeric:tabular-nums}
.shake{animation:kg-shake .45s}
@keyframes kg-shake{25%{transform:translateX(-5px) rotate(-2deg)}50%{transform:translateX(5px) rotate(2deg)}75%{transform:translateX(-2px)}}
.pop{animation:kg-pop .45s}
@keyframes kg-pop{40%{transform:scale(1.18)}}
.glow{box-shadow:0 0 0 5px var(--gold),0 0 24px 8px rgba(255,201,60,.8)!important}
.bob{transform:translateY(calc(var(--kick)*-6px))}
.kg-spark{position:fixed;z-index:30;pointer-events:none;width:22px;height:22px}
.kg-win .res{font-weight:700;font-size:1rem;color:#8a6a4a;font-variant-numeric:tabular-nums}
.kg-win .trio{display:flex;align-items:flex-end;justify-content:center;height:clamp(64px,12vh,130px);position:relative}
.kg-win .trio img{height:100%;margin:0 -8px;transform-origin:50% 100%}
.kg-win .trio img{animation:kg-jump .42s ease-in-out infinite}.kg-win .trio img:nth-child(2){animation-delay:.14s}.kg-win .trio img:nth-child(3){animation-delay:.28s}
#kg-confetti{position:fixed;inset:0;width:100%;height:100%;z-index:25;pointer-events:none}
@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;animation-iteration-count:1!important;transition:none!important}}
`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
})();

/* ---------------- svg art ---------------- */
const STAR_PATH='M50 5l13 28 30 3-23 20 7 30-27-16-27 16 7-30L7 36l30-3z';
KG.starSVG=(fill='#ffc93c',stroke='#6e4322')=>`<svg viewBox="0 0 100 100"><path fill="${fill}" stroke="${stroke}" stroke-width="6" stroke-linejoin="round" d="${STAR_PATH}"/></svg>`;
KG.ICONS={
  home:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 2 11.5h3V21h5.5v-6h3v6H19v-9.5h3z"/></svg>',
  speak:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
  music:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.6A4 4 0 1 0 14 17V7h4V3z"/></svg>'
};
const SHAPE_NAMES={circle:'circle',square:'square',triangle:'triangle',rectangle:'rectangle',oval:'oval',diamond:'diamond',star:'star',heart:'heart',hexagon:'hexagon'};
KG.SHAPE_NAMES=SHAPE_NAMES;
function shapePath(k){switch(k){
  case'circle':return'<circle cx="50" cy="50" r="40"/>';
  case'square':return'<rect x="12" y="12" width="76" height="76" rx="6"/>';
  case'triangle':return'<path d="M50 10 92 86H8z" stroke-linejoin="round"/>';
  case'rectangle':return'<rect x="4" y="26" width="92" height="48" rx="6"/>';
  case'oval':return'<ellipse cx="50" cy="50" rx="44" ry="30"/>';
  case'diamond':return'<path d="M50 6 88 50 50 94 12 50z" stroke-linejoin="round"/>';
  case'star':return`<path d="${STAR_PATH}" stroke-linejoin="round"/>`;
  case'heart':return'<path d="M50 88S10 62 10 34a20 20 0 0 1 40-6 20 20 0 0 1 40 6c0 28-40 54-40 54z" stroke-linejoin="round"/>';
  case'hexagon':return'<path d="M28 12h44l22 38-22 38H28L6 50z" stroke-linejoin="round"/>';
}return''}
KG.shapeSVG=function(k,color,opt){opt=opt||{};const rot=opt.rot||0;
  if(opt.outline)return`<svg viewBox="0 0 100 100" style="overflow:visible"><g transform="rotate(${rot} 50 50)" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width="5" stroke-dasharray="10 7">${shapePath(k)}</g></svg>`;
  return`<svg viewBox="0 0 100 100" style="overflow:visible"><g transform="rotate(${rot} 50 50)"><g transform="translate(0 5)" fill="rgba(42,31,61,.25)">${shapePath(k)}</g><g fill="${color}" stroke="${shade(color,-70)}" stroke-width="5">${shapePath(k)}</g><g fill="none" stroke="rgba(255,255,255,.55)" stroke-width="5" transform="translate(50 50) scale(.72) translate(-50 -50)" stroke-dasharray="26 400" stroke-linecap="round">${shapePath(k)}</g></g></svg>`};
KG.COLORS={red:'#ff4d5e',blue:'#3d7bff',yellow:'#ffd23f',green:'#43c25a',purple:'#a66bff',orange:'#ff9330',pink:'#ff6fb5'};
const DOT_LAYOUTS={1:[[50,50]],2:[[30,30],[70,70]],3:[[25,25],[50,50],[75,75]],4:[[30,30],[70,30],[30,70],[70,70]],5:[[28,28],[72,28],[50,50],[28,72],[72,72]],6:[[30,22],[70,22],[30,50],[70,50],[30,78],[70,78]]};
KG.dicePips=n=>DOT_LAYOUTS[n]||[];
KG.diceSVG=function(n){return`<svg viewBox="0 0 100 100"><rect x="5" y="9" width="90" height="88" rx="16" fill="#d8cdb8"/><rect x="5" y="5" width="90" height="88" rx="16" fill="#fffdf6" stroke="#6e4322" stroke-width="4"/>${(DOT_LAYOUTS[n]||[]).map(([x,y])=>`<circle cx="${x}" cy="${y-2}" r="9" fill="#2a1f3d"/>`).join('')}</svg>`};
KG.coinSVG=function(v){const c=v===1?['#d9dde6','#9aa1b0']:v===5?['#f2d16b','#b88a1d']:v===10?['#e9a34a','#9d5e1a']:['#ffd23f','#b88a1d'];const r=v===1?38:v===5?43:46;
  return`<svg viewBox="0 0 100 100"><circle cx="50" cy="54" r="${r}" fill="rgba(42,31,61,.25)"/><circle cx="50" cy="50" r="${r}" fill="${c[0]}" stroke="${c[1]}" stroke-width="5"/><circle cx="50" cy="50" r="${r-9}" fill="none" stroke="${c[1]}" stroke-width="2.5" stroke-dasharray="4 4"/><text x="50" y="${v>9?61:62}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="${v>9?28:32}" fill="#2a1f3d">₱${v}</text></svg>`};

/* ---------------- audio ---------------- */
let actx=null,master,sfxGain,musGain,noiseBuf=null,gridStart=0,nextNote=0,step=0,song=null,musicOn=KG.prog.music;
const SONGS={
  meadow:{bpm:100,root:261.63,mel:[0,2,4,7,4,2,9,7,4,7,9,12,9,7,4,2],bass:[0,5,7,4]},
  island:{bpm:112,root:293.66,mel:[0,4,7,4,9,7,4,2,0,4,7,9,12,9,7,4],bass:[0,0,5,7]},
  space:{bpm:92,root:220,mel:[0,3,7,10,7,3,12,10,7,3,5,7,3,0,-2,0],bass:[0,-4,-2,3]},
  march:{bpm:108,root:261.63,mel:[0,4,7,12,7,4,7,4,5,9,12,9,7,4,2,0],bass:[0,5,7,0]}
};
KG.BEAT=.6;
function beatLen(){return song?60/song.bpm:.6}
KG.beatPhase=function(){const B=beatLen();const t=actx?actx.currentTime-gridStart:performance.now()/1000;return((t/B)%1+1)%1};
KG.secToNext=function(div){if(!actx)return 0;const span=beatLen()/(div||1),now=actx.currentTime;const k=Math.ceil((now-gridStart+.03)/span);return Math.max(0,gridStart+k*span-now)};
KG.ensureAudio=function(){
  if(!actx){try{actx=new(window.AudioContext||window.webkitAudioContext)();master=actx.createGain();master.gain.value=.9;master.connect(actx.destination);sfxGain=actx.createGain();sfxGain.gain.value=.55;sfxGain.connect(master);musGain=actx.createGain();musGain.gain.value=musicOn?.16:0;musGain.connect(master);
    nextNote=actx.currentTime+.12;gridStart=nextNote;const nb=actx.createBuffer(1,actx.sampleRate*.1,actx.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;noiseBuf=nb;
    if(speechOK){try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u)}catch(e){}}}catch(e){actx=null}}
  else if(actx.state==='suspended')actx.resume();
};
function tone(f,dur,o){if(!actx)return;o=o||{};const type=o.type||'sine',g=o.g==null?.25:o.g,when=o.when||0,dest=o.dest||sfxGain,attack=o.attack||.012,slide=o.slide||0;const t=actx.currentTime+when;const os=actx.createOscillator(),a=actx.createGain();os.type=type;os.frequency.setValueAtTime(f,t);if(slide)os.frequency.exponentialRampToValueAtTime(f*slide,t+dur);a.gain.setValueAtTime(.0001,t);a.gain.exponentialRampToValueAtTime(g,t+attack);a.gain.exponentialRampToValueAtTime(.0001,t+dur);os.connect(a);a.connect(dest);os.start(t);os.stop(t+dur+.05)}
function noise(when,dur,g,freq,dest){if(!actx||!noiseBuf)return;const src=actx.createBufferSource(),f=actx.createBiquadFilter(),gn=actx.createGain();src.buffer=noiseBuf;f.type='highpass';f.frequency.value=freq||7000;const t=actx.currentTime+when;gn.gain.setValueAtTime(g,t);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);src.connect(f);f.connect(gn);gn.connect(dest||sfxGain);src.start(t);src.stop(t+dur+.02)}
KG.tone=tone;
function burst(when,dur,g,freq,type,q,dest){if(!actx||!noiseBuf)return;const src=actx.createBufferSource(),f=actx.createBiquadFilter(),gn=actx.createGain();src.buffer=noiseBuf;src.loop=dur>.09;f.type=type||'bandpass';f.frequency.value=freq;f.Q.value=q||1;const t=actx.currentTime+when;gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(g,t+Math.min(.01,dur/4));gn.gain.exponentialRampToValueAtTime(.0001,t+dur);src.connect(f);f.connect(gn);gn.connect(dest||sfxGain);src.start(t);src.stop(t+dur+.05)}
function wah(f,when,dur,vib){if(!actx)return;const t=actx.currentTime+when,o=actx.createOscillator(),lp=actx.createBiquadFilter(),g=actx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f,t);if(vib){const l=actx.createOscillator(),lg=actx.createGain();l.frequency.value=6;lg.gain.value=f*.03;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+dur+.1);o.frequency.linearRampToValueAtTime(f*.94,t+dur)}lp.type='lowpass';lp.frequency.setValueAtTime(500,t);lp.frequency.linearRampToValueAtTime(1300,t+.08);lp.frequency.linearRampToValueAtTime(600,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.04);g.gain.setValueAtTime(.16,t+dur*.7);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(lp);lp.connect(g);g.connect(sfxGain);o.start(t);o.stop(t+dur+.05)}
const PENTA=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.5,1567.98,1760,2093,2349.3];
KG.sfx={
  correct(k){k=k||0;const f=PENTA[Math.min(PENTA.length-1,k%12)];tone(f,.5,{type:'triangle',g:.28});tone(f*2,.35,{g:.08,when:.05});tone(f*1.5,.45,{type:'triangle',g:.12,when:Math.max(.08,KG.secToNext(2))})},
  wrong(){tone(392,.14,{type:'triangle',g:.09});tone(440,.18,{type:'triangle',g:.07,when:.11})}, // soft "hmm?" — no buzzer
  pop(){tone(880,.09,{type:'triangle',g:.15,slide:1.6})},
  tap(){tone(660,.06,{type:'triangle',g:.1})},
  coin(){tone(1568,.08,{type:'square',g:.06});tone(2093,.25,{type:'square',g:.06,when:.07})},
  munch(){noise(0,.07,.25,1200);noise(.12,.07,.2,1500)},
  whoosh(){tone(260,.55,{type:'sawtooth',g:.05,slide:3.5})},
  splash(){noise(0,.35,.25,800);tone(500,.25,{g:.06,slide:.4})},
  tick(){noise(0,.03,.2,5000)},
  count(k){tone(PENTA[Math.min(PENTA.length-1,k)],.25,{type:'triangle',g:.2})},
  applause(sec){sec=sec||4;for(let i=0;i<sec*55;i++){const t=Math.random()*sec*(i%5===0?.4:1)+.05;burst(t,.025+Math.random()*.03,.06+Math.random()*.14,900+Math.random()*1900,'bandpass',1.4)}
    [0,.18,.36,.54].forEach(t=>burst(.2+t,.4,.03,4000,'highpass',.5));tone(1568,.18,{type:'triangle',g:.05,when:.4});tone(2093,.25,{type:'triangle',g:.05,when:.55})},
  firework(when){tone(450,.6,{type:'sine',g:.045,slide:3.4,when});burst(when+.6,1.1,.55,160,'lowpass',.7);burst(when+.6,.25,.25,900,'bandpass',.8);for(let k=0;k<16;k++)burst(when+.75+Math.random()*.8,.02,.12+Math.random()*.1,3500+Math.random()*3500,'bandpass',2)},
  fireworks(n,cb){n=n||5;for(let i=0;i<n;i++){const w=.25+i*.75+Math.random()*.25;KG.sfx.firework(w);cb&&setTimeout(()=>cb(i),(w+.6)*1000)}},
  fanfare(){const w=KG.secToNext(1),e=beatLen()/2;[523,659,784,1047].forEach((f,i)=>tone(f,.3,{type:'triangle',g:.22,when:w+i*e}));tone(1319,1,{type:'triangle',g:.2,when:w+4*e});tone(784,1,{g:.12,when:w+4*e});tone(659,1,{g:.1,when:w+4*e})}
};
KG.setSong=function(name){song=SONGS[name]||SONGS.meadow};
song=SONGS.meadow;
setInterval(function(){if(!actx||!song)return;const S=beatLen()/2;
  while(nextNote<actx.currentTime+.4){const w=nextNote-actx.currentTime;
    if(step%2===0)tone(125,.2,{g:.26,slide:.32,dest:musGain,when:w,attack:.004});else noise(w,.05,.07,7000,musGain);
    const n=song.mel[step%song.mel.length];if(step%2===0||n>6)tone(song.root*2*Math.pow(2,n/12),.42,{g:.09,dest:musGain,when:w,attack:.03});
    if(step%4===0){const b=song.bass[(step/4|0)%song.bass.length];tone(song.root/2*Math.pow(2,b/12),1.1,{type:'triangle',g:.12,dest:musGain,when:w,attack:.05})}
    nextNote+=S;step++}},120);
KG.musicOn=()=>musicOn;
let ambGain=null;
KG.startAmbient=function(){if(!actx||ambGain)return;ambGain=actx.createGain();ambGain.gain.value=musicOn?1:0;ambGain.connect(master);
  const len=actx.sampleRate*3,b=actx.createBuffer(1,len,actx.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<len;i++){last=(last+.02*(Math.random()*2-1))/1.02;d[i]=last*3.5}
  const src=actx.createBufferSource();src.buffer=b;src.loop=true;const lp=actx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=600;const wg=actx.createGain();wg.gain.value=.06;
  const lfo=actx.createOscillator();lfo.frequency.value=.11;const lg=actx.createGain();lg.gain.value=.04;lfo.connect(lg);lg.connect(wg.gain);src.connect(lp);lp.connect(wg);wg.connect(ambGain);src.start();lfo.start();
  const chirp=()=>{const w=KG.secToNext(2),base=2300+Math.random()*1500,n=2+Math.floor(Math.random()*4),step=beatLen()/4;
    for(let k=0;k<n;k++){const t=actx.currentTime+w+k*step,o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.setValueAtTime(base*(k%2?1.12:1),t);o.frequency.exponentialRampToValueAtTime(base*(k%2?1.45:1.3),t+.07);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.045,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.09);o.connect(g);g.connect(ambGain);o.start(t);o.stop(t+.12)}
    setTimeout(chirp,2000+Math.random()*4500)};
  setTimeout(chirp,900);
  const chime=()=>{const w=KG.secToNext(1);[1046.5,1318.5,1568].forEach((f,k)=>tone(f,1.4,{g:.025,when:w+k*beatLen()/2,dest:ambGain,attack:.02}));setTimeout(chime,9000+Math.random()*7000)};
  setTimeout(chime,5000)};
KG.setMusic=function(on){musicOn=on;KG.prog.music=on;KG.save();if(musGain)musGain.gain.setTargetAtTime(on?.16:0,actx.currentTime,.2);if(ambGain)ambGain.gain.setTargetAtTime(on?1:0,actx.currentTime,.3);document.querySelectorAll('[data-music]').forEach(b=>b.classList.toggle('off',!on))};

/* ---------------- speech ---------------- */
const speechOK='speechSynthesis' in window;let voice=null,voiceM=null;
function pickVoice(){if(!speechOK)return;const vs=speechSynthesis.getVoices();voice=vs.find(v=>/^en[-_]/i.test(v.lang)&&/samantha|aria|jenny|zira|google us english|female|karen|moira/i.test(v.name))||vs.find(v=>/^en[-_]US/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null;voiceM=vs.find(v=>/^en/i.test(v.lang)&&/(\bmale\b|daniel|alex|fred|david|mark|guy|aaron|arthur|rishi)/i.test(v.name))||voice;voice=vs.find(v=>/^en/i.test(v.lang)&&/princess|ivy|child|kid/i.test(v.name))||voice;voiceM=vs.find(v=>/^en/i.test(v.lang)&&/junior|justin|boy/i.test(v.name))||voiceM;}
if(speechOK){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
let duckTimer=0,speakTimer=0;const SPEECH_LAG=.09;
function duck(on){if(!musGain||!musicOn)return;musGain.gain.setTargetAtTime(on?.075:.16,actx.currentTime,.12)}
/* All speech goes through CH.voice (core/voice.js): one voice picker, one pronunciation dictionary. */
if(window.CH&&CH.voice){CH.voice.on('start',()=>duck(true));CH.voice.on('end',()=>duck(false))}
KG.say=function(text,who,opt){opt=opt||{};who=who||'wynea';const plain=text.replace(/<[^>]+>/g,'');
  if(window.CH&&CH.voice){CH.voice.speak(plain,{who,queue:!!opt.queue,rate:1+(opt.rate||0),onstart:opt.onstart});return}
  if(!speechOK){opt.onstart&&opt.onstart();return}
  const st=HEROES[who]||HEROES.wynea,parts=(plain.match(/[^.!?]+[.!?]*/g)||[plain]).map(x=>x.trim()).filter(Boolean);
  const go=()=>{try{if(!opt.queue)speechSynthesis.cancel();
    parts.forEach((ph,i)=>{const u=new SpeechSynthesisUtterance(ph.replace(/Wynea/gi,'Wee-neh-yah')),v=who==='matthew'?voiceM:voice;if(v)u.voice=v;/* fallback only: used if core/voice.js is missing */
      const ex=/!$/.test(ph),q=/\?$/.test(ph),num=/\d/.test(ph),short=ph.length<9;
      u.pitch=Math.min(2,st.p+(ex?.16:0)+(q?.22:0)+(num?.1:0)+(Math.random()-.5)*.1);u.rate=Math.min(1.4,st.r+(ex?.07:0)+(short?.06:0)+(opt.rate||0));
      if(i===0)u.onstart=()=>{duck(true);opt.onstart&&opt.onstart()};
      if(i===parts.length-1)u.onend=u.onerror=()=>duck(false);
      speechSynthesis.speak(u)});
    clearTimeout(duckTimer);duckTimer=setTimeout(()=>duck(false),10000)}catch(e){opt.onstart&&opt.onstart()}};
  if(opt.queue||opt.now)go();else{clearTimeout(speakTimer);speakTimer=setTimeout(go,Math.max(0,KG.secToNext(2)-SPEECH_LAG)*1000)}
};
KG.stopSpeech=()=>{clearTimeout(speakTimer);if(window.CH&&CH.voice)CH.voice.cancel();else if(speechOK)speechSynthesis.cancel()};

/* ---------------- beat loop ---------------- */
(function loop(){const k=Math.pow(1-KG.beatPhase(),3);document.documentElement.style.setProperty('--kick',k.toFixed(3));requestAnimationFrame(loop)})();

/* ---------------- sparkles & confetti ---------------- */
KG.sparkle=function(el,color){if(!el)return;const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;color=color||'#ffd23f';
  for(let i=0;i<14;i++){const s=KG.el('div','kg-spark',KG.starSVG(color,'#fff'));s.style.left=cx-11+'px';s.style.top=cy-11+'px';document.body.appendChild(s);const a=Math.random()*Math.PI*2,d=50+Math.random()*80;
    const an=s.animate([{transform:'translate(0,0) scale(.4) rotate(0)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) scale(${.6+Math.random()*.7}) rotate(${Math.random()*360}deg)`,opacity:0}],{duration:700+Math.random()*400,easing:'cubic-bezier(.2,.8,.3,1)'});an.onfinish=()=>s.remove()}};
KG.confetti=function(){let c=$('#kg-confetti');if(!c){c=KG.el('canvas');c.id='kg-confetti';document.body.appendChild(c)}const dpr=Math.min(2,devicePixelRatio||1);c.width=innerWidth*dpr;c.height=innerHeight*dpr;const g=c.getContext('2d');g.scale(dpr,dpr);
  const cols=['#ff5c8d','#ffc93c','#5fb043','#3f8fe0','#a66bff','#ff9330'];const ps=[];for(let i=0;i<150;i++)ps.push({x:Math.random()*innerWidth,y:-20-Math.random()*innerHeight*.6,vx:(Math.random()-.5)*2,vy:2+Math.random()*3,r:Math.random()*6,vr:(Math.random()-.5)*.3,s:6+Math.random()*6,c:cols[i%6]});
  const t0=performance.now();(function f(t){g.clearRect(0,0,innerWidth,innerHeight);ps.forEach(p=>{p.x+=p.vx+Math.sin(t/300+p.r)*.6;p.y+=p.vy;p.r+=p.vr;g.save();g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);g.restore()});if(t-t0<5000)requestAnimationFrame(f);else g.clearRect(0,0,innerWidth,innerHeight)})(t0)};

KG.fireworks=function(){let c=KG.$('#kg-fw');if(!c){c=KG.el('canvas');c.id='kg-fw';Object.assign(c.style,{position:'fixed',inset:'0',width:'100%',height:'100%',zIndex:24,pointerEvents:'none'});document.body.appendChild(c)}
  const dpr=Math.min(2,devicePixelRatio||1);c.width=innerWidth*dpr;c.height=innerHeight*dpr;const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);const ps=[],rockets=[];const cols=['#ff5c8d','#ffc93c','#7ee0ff','#a66bff','#7dff8a','#ff9330'];
  function boom(i){const x=innerWidth*(.18+Math.random()*.64),y=innerHeight*(.15+Math.random()*.3),col=cols[i%cols.length],n=60;for(let k=0;k<n;k++){const a=k/n*Math.PI*2,sp=2+Math.random()*3.5;ps.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,col:Math.random()<.2?'#fff':col})}}
  KG.sfx.fireworks(6,boom);const t0=performance.now();
  (function f(t){g.globalCompositeOperation='destination-out';g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,0,innerWidth,innerHeight);g.globalCompositeOperation='lighter';
    for(let k=ps.length-1;k>=0;k--){const p=ps[k];p.x+=p.vx;p.y+=p.vy;p.vy+=.06;p.vx*=.985;p.vy*=.985;p.life-=.012;if(p.life<=0){ps.splice(k,1);continue}g.globalAlpha=p.life;g.fillStyle=p.col;g.fillRect(p.x-2,p.y-2,4,4)}
    g.globalAlpha=1;if(t-t0<7500)requestAnimationFrame(f);else g.clearRect(0,0,innerWidth,innerHeight)})(t0)};

/* ---------------- voxel scenery ---------------- */
const SCENES={
  meadow:{sky:['#6ab8ff','#dff2ff'],ground:'grass'},forest:{sky:['#6ab8ff','#dff2ff'],ground:'grass'},
  castle:{sky:['#7fb2ff','#ffe3f1'],ground:'grass'},lab:{sky:['#8c6a4c','#b9875a'],ground:'plank',indoor:true},
  beach:{sky:['#4fc3ff','#d7f6ff'],ground:'sand'},party:{sky:['#ffd1dc','#fff1d6'],ground:'tile',indoor:true},
  jungle:{sky:['#7ad1a8','#e3fbe9'],ground:'grass'},space:{sky:['#0f1240','#3b2a78'],ground:'moon',night:true},
  clock:{sky:['#ff9f6b','#ffe3c2'],ground:'grass'},market:{sky:['#5cb8ff','#fff3d2'],ground:'cobble'},
  village:{sky:['#79c4ff','#e9f7ff'],ground:'grass'},garden:{sky:['#8fd3ff','#f4fbff'],ground:'grass'},track:{sky:['#5db2ff','#e2f4ff'],ground:'grass'}
};
KG.drawScene=function(cv,name,seed){
  const T=SCENES[name]||SCENES.meadow;const W=cv.width,H=cv.height,g=cv.getContext('2d');const R=mulberry((seed||0)+name.length*131+7);
  g.imageSmoothingEnabled=false;
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,T.sky[0]);gr.addColorStop(1,T.sky[1]);g.fillStyle=gr;g.fillRect(0,0,W,H);
  const B=Math.max(8,Math.round(H/10)),s=Math.max(2,Math.round(B/6));
  const blk=(x,y,col,w,h,nz)=>{w=w||B;h=h||B;nz=nz==null?16:nz;g.fillStyle=col;g.fillRect(x,y,w,h);for(let yy=0;yy<h;yy+=s)for(let xx=0;xx<w;xx+=s)if(R()<.42){g.fillStyle=shade(col,(R()-.5)*nz*2);g.fillRect(x+xx,y+yy,Math.min(s,w-xx),Math.min(s,h-yy))}g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x,y+h-s,w,s);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x,y,w,s)};
  const cols=Math.ceil(W/B)+1;
  // sky details
  if(T.night){for(let i=0;i<W*H/900;i++){g.fillStyle=R()<.2?'#ffe7a3':'#ffffff';const z=R()<.15?s*2:s;g.fillRect(R()*W|0,R()*H*.75|0,z,z)}
    const pl=(x,y,r,c)=>{for(let yy=-r;yy<=r;yy+=s)for(let xx=-r;xx<=r;xx+=s)if(xx*xx+yy*yy<=r*r){g.fillStyle=shade(c,(xx+yy)/r*-25+(R()-.5)*10);g.fillRect(x+xx,y+yy,s,s)}};
    pl(W*.82,H*.2,B*1.2,'#ff9ec7');pl(W*.15,H*.3,B*.6,'#8fd6ff');g.fillStyle='rgba(255,220,150,.6)';g.fillRect(W*.82-B*1.9,H*.2-s,B*3.8,s*2)}
  else if(!T.indoor){g.fillStyle='#fff6c9';const sx=W-B*2.2,sy=B*.6;g.fillRect(sx,sy,B*1.4,B*1.4);g.fillStyle='#ffe27a';g.fillRect(sx+s*2,sy+s*2,B*1.4-s*4,B*1.4-s*4);
    for(let c=0;c<4;c++){const cx=R()*W,cy=B*.5+R()*B*2.2,n=2+(R()*3|0);for(let k=0;k<n;k++){g.fillStyle='rgba(255,255,255,.95)';g.fillRect(cx+k*B*.9,cy+(k%2?-s*2:0),B*1.3,B*.55);g.fillStyle='rgba(220,235,255,.9)';g.fillRect(cx+k*B*.9,cy+B*.45+(k%2?-s*2:0),B*1.3,s)}}}
  // ground line
  const base=H-B*2.6;const gy=[];for(let c=0;c<cols;c++)gy.push(base-(T.indoor?0:Math.round((Math.sin(c*.55+R()*.3)+Math.sin(c*.23))*.6)*B*.5));
  const decor=DECOR[name];if(decor&&decor.back)decor.back(g,W,H,B,s,blk,R,base);
  const gc={grass:['#62b244','#8a5c3c'],sand:['#ecd497','#d9bb76'],plank:['#c48a52','#a8703c'],tile:['#ffffff','#ff9fbf'],moon:['#9a98ab','#7b7990'],cobble:['#b9b2a6','#8f877c']}[T.ground];
  for(let c=0;c<cols;c++){const x=c*B,y=gy[c];
    if(T.ground==='tile'){for(let yy=y;yy<H;yy+=B)blk(x,yy,((c+Math.round((yy-y)/B))%2)?gc[0]:gc[1],B,B,6)}
    else{blk(x,y,gc[0]);for(let yy=y+B;yy<H;yy+=B)blk(x,yy,gc[1])}
    if(T.ground==='grass'){g.fillStyle=shade(gc[0],-10);for(let xx=0;xx<B;xx+=s)g.fillRect(x+xx,y+B,s,s*(1+(R()*2|0)))}
    if(T.ground==='moon'&&R()<.3){g.fillStyle='#6d6b80';g.fillRect(x+s*2,y+s*2,B-s*4,s*2)}}
  if(decor&&decor.front)decor.front(g,W,H,B,s,blk,R,gy,base);
};
function tree(g,x,y,B,s,blk,R,pink){const th=2+(R()*2|0);for(let k=1;k<=th;k++)blk(x,y-k*B,'#7a5232');const lc=pink?'#f6a8c6':'#3f9a3c';for(let a=-1;a<=1;a++)for(let b=0;b<2;b++)blk(x+a*B,y-(th+1+b)*B,lc,B,B,22);blk(x,y-(th+3)*B,lc,B,B,22)}
const DECOR={
  meadow:{front(g,W,H,B,s,blk,R,gy){for(let i=0;i<4;i++){const c=(R()*(W/B))|0;tree(g,c*B,gy[c]||H-B*3,B,s,blk,R,R()<.4)}}},
  forest:{front(g,W,H,B,s,blk,R,gy){for(let c=0;c<W/B;c+=3+(R()*3|0))tree(g,c*B,gy[c],B,s,blk,R,R()<.35)}},
  garden:{front(g,W,H,B,s,blk,R,gy){for(let c=0;c<W/B;c++){const y=gy[c];g.fillStyle='#f3e6c8';g.fillRect(c*B+s,y-B*1.2,s*2,B*1.2);g.fillRect(c*B,y-B,B,s*1.5);for(let k=0;k<2;k++){const fx=c*B+R()*B,fc=['#ff5c8d','#ffd23f','#a66bff','#ff9330','#fff'][R()*5|0];g.fillStyle='#3f9a3c';g.fillRect(fx,y-s*3,s,s*3);g.fillStyle=fc;g.fillRect(fx-s,y-s*5,s*3,s*2)}}}},
  castle:{back(g,W,H,B,s,blk,R,base){const cx=W/2;const tw=(x,h)=>{for(let k=1;k<=h;k++)for(let a=0;a<2;a++)blk(x+a*B,base-k*B,'#a9a7b8');for(let a=0;a<2;a++)blk(x+a*B+(a?0:0),base-(h+1)*B,'#a9a7b8',B*.5,B*.5);g.fillStyle='#6b5b8a';g.fillRect(x+B*.6,base-h*B+B*.5,B*.8,B*.8);g.fillStyle='#ff5c8d';g.fillRect(x+B,base-(h+2.4)*B,B*.9,B*.5);g.fillStyle='#6e4322';g.fillRect(x+B-s,base-(h+2.4)*B,s,B*1.4)};
    tw(cx-B*5,5);tw(cx+B*3,5);for(let a=-3;a<3;a++)for(let k=1;k<=3;k++)blk(cx+a*B,base-k*B,'#bab8c8');g.fillStyle='#5a3a26';g.fillRect(cx-B,base-B*2,B*2,B*2);g.fillStyle='#ffc93c';g.fillRect(cx-B*.2,base-B*3.6,B*.4,B*.4)}},
  lab:{back(g,W,H,B,s,blk,R,base){for(let y=0;y<base;y+=B)for(let x=0;x<W;x+=B*2)blk(x+((y/B)%2?B:0),y,'#b97d48',B*2,B,10);
    const gear=(x,y,r,c)=>{g.fillStyle=c;for(let a=0;a<8;a++){const an=a*Math.PI/4;g.fillRect(x+Math.cos(an)*r-s*1.5,y+Math.sin(an)*r-s*1.5,s*3,s*3)}g.beginPath();g.arc(x,y,r*.82,0,7);g.fill();g.fillStyle='#b97d48';g.beginPath();g.arc(x,y,r*.3,0,7);g.fill()};
    gear(W*.12,H*.25,B*.9,'#8f9bb0');gear(W*.2,H*.38,B*.6,'#c6a24a');gear(W*.88,H*.22,B*1.1,'#8f9bb0');g.fillStyle='#7ee0ff';g.fillRect(W*.7,H*.4,B*.6,B*1.2);g.fillStyle='#ff6fb5';g.fillRect(W*.78,H*.45,B*.6,B*.9)}},
  beach:{back(g,W,H,B,s,blk,R,base){g.fillStyle='#2fa6e8';g.fillRect(0,base-B*1.6,W,B*2);g.fillStyle='#7fd3ff';for(let x=0;x<W;x+=B)g.fillRect(x+(R()*B|0),base-B*1.6+(R()*B|0),B*.6,s)},
    front(g,W,H,B,s,blk,R,gy){[.08,.9].forEach(f=>{const c=Math.round(f*W/B),x=c*B,y=gy[c]||H-B*3;for(let k=1;k<=4;k++)blk(x+(k>2?s*2:0),y-k*B,'#a77b4a',B*.7,B);for(let a=-2;a<=2;a++)blk(x+a*B*.8,y-5*B+Math.abs(a)*s*3,'#3fa34a',B,B*.5,20)})}},
  party:{back(g,W,H,B,s,blk,R,base){for(let y=0;y<base;y+=B)for(let x=0;x<W;x+=B*2)blk(x+((y/B)%2?B:0),y,'#ffe0b8',B*2,B,6);const cs=['#ff5c8d','#ffc93c','#5fb043','#3f8fe0','#a66bff'];for(let x=0;x<W;x+=B){g.fillStyle=cs[(x/B|0)%5];g.beginPath();g.moveTo(x,B*.6);g.lineTo(x+B,B*.6);g.lineTo(x+B/2,B*1.6);g.fill()}g.fillStyle='#6e4322';g.fillRect(0,B*.5,W,s)}},
  jungle:{back(g,W,H,B,s,blk,R,base){for(let c=0;c<W/B;c+=2){const h=4+(R()*4|0);for(let k=0;k<h;k++)blk(c*B,base-(k+1)*B,k>h-3?'#2f7d3a':'#5c3d22',B,B,20)}g.fillStyle='#2f9de0';g.fillRect(0,base+B*.2,W,B*.9)},
    front(g,W,H,B,s,blk,R){for(let x=0;x<W;x+=B*1.5){const len=1+(R()*3|0);for(let k=0;k<len;k++)blk(x,k*B*.8,'#3c9a3c',B*.4,B*.8,24)}}},
  space:{front(g,W,H,B,s,blk,R,gy){const c=Math.round(W*.14/B);const x=c*B,y=gy[c];for(let k=1;k<=4;k++)blk(x,y-k*B,'#e9e9f2',B,B,8);blk(x,y-5*B,'#ff5c8d',B,B,8);blk(x-B,y-B,'#ff5c8d',B,B,8);blk(x+B,y-B,'#ff5c8d',B,B,8);g.fillStyle='#7ee0ff';g.fillRect(x+s*2,y-B*3.4,B-s*4,B*.6)}},
  clock:{back(g,W,H,B,s,blk,R,base){const cx=W/2-B;for(let k=1;k<=7;k++)for(let a=0;a<2;a++)blk(cx+a*B,base-k*B,'#d7c7a6');blk(cx-B*.5,base-8*B,'#c44a4a',B*3,B,10);g.fillStyle='#fffdf6';g.beginPath();g.arc(cx+B,base-5.5*B,B*.8,0,7);g.fill();g.fillStyle='#2a1f3d';g.fillRect(cx+B-s/2,base-6.1*B,s,B*.6);g.fillRect(cx+B,base-5.5*B-s/2,B*.4,s);
    for(let i=0;i<4;i++){const hx=i<2?cx-B*(4+i*3):cx+B*(4+(i-2)*3);for(let k=1;k<=2;k++)for(let a=0;a<2;a++)blk(hx+a*B,base-k*B,'#e8d2a8');for(let a=-1;a<3;a++)blk(hx+a*B*.75,base-3*B,'#c45a4a',B*.8,B,10)}}},
  market:{back(g,W,H,B,s,blk,R,base){const cs=[['#ff5c8d','#fff'],['#3f8fe0','#fff'],['#ffc93c','#fff'],['#5fb043','#fff']];for(let i=0;i*B*5<W;i++){const x=i*B*5+B*.5;for(let k=1;k<=2;k++){blk(x,base-k*B,'#a8703c',B*.4,B);blk(x+B*3.6,base-k*B,'#a8703c',B*.4,B)}const c=cs[i%4];for(let a=0;a<4;a++){g.fillStyle=c[a%2];g.fillRect(x+a*B,base-B*3,B,B*.8)}blk(x,base-B*1.1,'#c48a52',B*4,B*.5,8)}}},
  village:{back(g,W,H,B,s,blk,R,base){for(let i=0;i*B*6<W;i++){const x=i*B*6+B,rc=['#c45a4a','#3f6fc4','#8a5cf6'][i%3];for(let k=1;k<=2;k++)for(let a=0;a<3;a++)blk(x+a*B,base-k*B,'#e8d2a8');for(let r=0;r<2;r++)for(let a=r;a<4-r;a++)blk(x+a*B-B*.5,base-(3+r)*B,rc,B,B,10);g.fillStyle='#6e4322';g.fillRect(x+B,base-B*1.4,B,B*1.4);g.fillStyle='#9fd8ff';g.fillRect(x+B*2.2,base-B*1.7,B*.6,B*.5)}}},
  track:{front(g,W,H,B,s,blk,R,gy){for(let x=0;x<W;x+=B){g.fillStyle=(x/B|0)%2?'#2a1f3d':'#fff';g.fillRect(x,H-B*2.2,B,s*2)}for(let c=2;c<W/B;c+=7)tree(g,c*B,gy[c],B,s,blk,R,c%2)}}
};
KG.paintBg=function(cv,name){const scale=Math.max(3,Math.round(Math.min(innerWidth,innerHeight)/180));cv.width=Math.ceil(innerWidth/scale);cv.height=Math.ceil(innerHeight/scale);KG.drawScene(cv,name)};

KG.fly=function(from,to,html,dur){return new Promise(res=>{const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();const c=KG.el('div','',html);Object.assign(c.style,{position:'fixed',left:a.left+'px',top:a.top+'px',width:a.width+'px',height:a.height+'px',zIndex:28,pointerEvents:'none',display:'grid',placeItems:'center'});document.body.appendChild(c);
  const dx=b.left+b.width/2-(a.left+a.width/2),dy=b.top+b.height/2-(a.top+a.height/2),sc=Math.max(.2,Math.min(b.width/a.width,b.height/a.height));
  const an=c.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${dx/2}px,${dy/2-70}px) scale(${(1+sc)/2*1.12}) rotate(12deg)`},{transform:`translate(${dx}px,${dy}px) scale(${sc})`}],{duration:dur||620,easing:'ease-in-out'});an.onfinish=()=>{c.remove();res()}})};
KG.cubeSVG=c=>`<svg viewBox="0 0 100 100"><path d="M50 6 92 27 50 48 8 27z" fill="${shade(c,45)}" stroke="${shade(c,-80)}" stroke-width="3" stroke-linejoin="round"/><path d="M8 27 50 48 50 95 8 74z" fill="${c}" stroke="${shade(c,-80)}" stroke-width="3" stroke-linejoin="round"/><path d="M92 27 50 48 50 95 92 74z" fill="${shade(c,-38)}" stroke="${shade(c,-80)}" stroke-width="3" stroke-linejoin="round"/><path d="M18 36l10 5v10l-10-5z" fill="rgba(255,255,255,.45)"/></svg>`;
KG.dotsGrid=function(n,color,big){let h='';for(let i=0;i<n;i++){const r=Math.floor(i/5),c=i%5;h+=`<circle cx="${12+c*19}" cy="${n>5?(r?66:30):48}" r="${big?8:7.5}" fill="${color}" stroke="rgba(42,31,61,.55)" stroke-width="2.5"/>`}return`<svg viewBox="0 0 100 92">${h}</svg>`};

/* ---------------- adventure icons (map stops + stickers) ---------------- */
let _icons=null;
KG.gameIcons=function(){if(_icons)return _icons;
  const C=KG.COLORS;_icons={
  star:KG.starSVG(),
  shapes:`<svg viewBox="0 0 100 100"><g transform="translate(2 40) scale(.5)">${KG.shapeSVG('triangle',C.green).replace(/<\/?svg[^>]*>/g,'')}</g><g transform="translate(48 40) scale(.5)">${KG.shapeSVG('circle',C.red).replace(/<\/?svg[^>]*>/g,'')}</g><g transform="translate(25 0) scale(.5)">${KG.shapeSVG('square',C.blue).replace(/<\/?svg[^>]*>/g,'')}</g></svg>`,
  pattern:`<svg viewBox="0 0 100 100"><g transform="translate(0 30) scale(.36)">${KG.cubeSVG(C.red).replace(/<\/?svg[^>]*>/g,'')}</g><g transform="translate(32 30) scale(.36)">${KG.cubeSVG(C.blue).replace(/<\/?svg[^>]*>/g,'')}</g><g transform="translate(64 30) scale(.36)">${KG.cubeSVG(C.red).replace(/<\/?svg[^>]*>/g,'')}</g></svg>`,
  chest:'<svg viewBox="0 0 100 100"><rect x="10" y="44" width="80" height="46" rx="6" fill="#a8693a" stroke="#4a2c16" stroke-width="5"/><path d="M10 46c0-22 80-22 80 0z" fill="#8a5528" stroke="#4a2c16" stroke-width="5"/><circle cx="34" cy="40" r="9" fill="#ffc93c" stroke="#9c6408" stroke-width="3"/><circle cx="52" cy="34" r="9" fill="#ffc93c" stroke="#9c6408" stroke-width="3"/><circle cx="68" cy="42" r="9" fill="#ffc93c" stroke="#9c6408" stroke-width="3"/><rect x="44" y="56" width="12" height="14" rx="2" fill="#ffc93c" stroke="#4a2c16" stroke-width="3"/></svg>',
  cookie:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="#e3a65a" stroke="#8a5528" stroke-width="5"/><circle cx="50" cy="50" r="33" fill="#eeb76b"/><rect x="29" y="31" width="10" height="10" rx="2" fill="#5a3418"/><rect x="55" y="27" width="10" height="10" rx="2" fill="#5a3418"/><rect x="39" y="53" width="10" height="10" rx="2" fill="#5a3418"/><rect x="61" y="55" width="10" height="10" rx="2" fill="#5a3418"/><circle cx="88" cy="22" r="17" fill="#fffdf6"/></svg>',
  log:'<svg viewBox="0 0 100 100"><rect x="6" y="34" width="88" height="22" rx="10" fill="#9a6436" stroke="#4a2c16" stroke-width="5"/><rect x="6" y="64" width="54" height="22" rx="10" fill="#9a6436" stroke="#4a2c16" stroke-width="5"/><circle cx="16" cy="45" r="7" fill="#d8a86a" stroke="#4a2c16" stroke-width="3"/><circle cx="16" cy="75" r="7" fill="#d8a86a" stroke="#4a2c16" stroke-width="3"/></svg>',
  rocket:'<svg viewBox="0 0 100 100"><path d="M50 6C34 22 32 48 34 72h32c2-24 0-50-16-66z" fill="#e9e9f2" stroke="#3e4657" stroke-width="5"/><circle cx="50" cy="40" r="9" fill="#7ee0ff" stroke="#3e4657" stroke-width="4"/><path d="M34 56 22 80h14zM66 56l12 24H64z" fill="#ff5c8d" stroke="#3e4657" stroke-width="4"/><path d="M40 74h20l-10 22z" fill="#ffc93c"/></svg>',
  clock:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#c44a4a" stroke="#6e2222" stroke-width="5"/><circle cx="50" cy="50" r="35" fill="#fffdf6"/><rect x="47" y="20" width="6" height="32" rx="3" fill="#3d7bff"/><rect x="46" y="46" width="8" height="24" rx="4" fill="#ff5c8d" transform="rotate(90 50 50)"/><circle cx="50" cy="50" r="6" fill="#ffc93c" stroke="#6e4322" stroke-width="3"/></svg>',
  coin:KG.coinSVG(5),
  house:'<svg viewBox="0 0 100 100"><rect x="16" y="44" width="68" height="48" fill="#e8d2a8" stroke="#6e4322" stroke-width="5"/><path d="M8 46 50 10 92 46z" fill="#c45a4a" stroke="#6e2222" stroke-width="5" stroke-linejoin="round"/><rect x="42" y="64" width="16" height="28" fill="#6e4322"/><circle cx="78" cy="40" r="10" fill="#4aa3e0" stroke="#fff" stroke-width="3"/><text x="78" y="45" font-size="14" font-family="Fredoka, sans-serif" font-weight="700" fill="#fff" text-anchor="middle">?</text></svg>',
  flower:'<svg viewBox="0 0 100 100"><rect x="46" y="48" width="8" height="46" fill="#3f9a3c"/>'+[0,72,144,216,288].map((a,k)=>`<ellipse cx="50" cy="20" rx="12" ry="17" fill="${['#ff4d5e','#ff9330','#ffd23f','#3d7bff','#a66bff'][k]}" stroke="rgba(42,31,61,.5)" stroke-width="3" transform="rotate(${a} 50 36)"/>`).join('')+'<circle cx="50" cy="36" r="11" fill="#ffd23f" stroke="#9a6a08" stroke-width="3"/></svg>',
  dice:KG.diceSVG(5)
};
  return _icons};
/* a die-cut sticker for a game: KG.stickerSVG(gameId) */
KG.stickerSVG=function(id){const g=(window.CH&&CH.config&&CH.config.game(id))||{icon:'star'};const ic=KG.gameIcons()[g.icon]||KG.gameIcons().star;const H=window.CH&&CH.HEROES&&CH.HEROES[g.host];const ring=H?H.ring:'#ffc93c';
  return`<span class="kg-sticker" style="--ring:${ring}"><span class="in">${ic}</span></span>`};

/* ---------------- game shell ---------------- */
const PRAISE={wynea:['Yes! You did it!','Brave job!','Woo-hoo!','Onward, explorer!'],ali:['Great job, friend!','You got it!','So smart!','Yay!'],matthew:['Boing! Correct!','My brain meter is beeping!','Kaboom, nice one!','Beep boop, perfect!']};
KG.praise=who=>KG.pick(PRAISE[who]||PRAISE.wynea);
KG.game=function(def){
  KG.setSong(def.song||'meadow');
  const hasCH=!!(window.CH&&CH.store&&CH.config),cfgGame=hasCH?CH.config.game(def.id):null;
  const host=def.host||(cfgGame&&cfgGame.host)||'wynea';
  const body=document.body;
  const bg=KG.el('canvas');bg.id='kg-bg';body.appendChild(bg);
  const paint=()=>KG.paintBg(bg,def.scene||'meadow');paint();addEventListener('resize',paint);
  /* top bar: back to map · title · progress dots · hear again · music */
  const top=KG.el('div','kg-top');
  const backIcon=(window.CH&&CH.ICONS&&CH.ICONS.map)||KG.ICONS.home;
  top.innerHTML=`<a class="kg-icon" href="index.html" aria-label="Back to the map">${backIcon}</a><div class="kg-chip">${def.title}</div><div class="kg-dots" role="progressbar" aria-label="Questions" aria-valuemin="0"></div><div class="sp"></div><button class="kg-icon" id="kg-repeat" aria-label="Hear it again">${KG.ICONS.speak}</button><button class="kg-icon${musicOn?'':' off'}" data-music aria-label="Music on or off">${KG.ICONS.music}</button>`;
  body.appendChild(top);
  const dots=top.querySelector('.kg-dots');
  const bub=KG.el('div','kg-bubble hide','<div class="face"><img alt=""></div><div class="say"><div class="who"></div><div class="txt" aria-live="polite"></div></div>');body.appendChild(bub);
  const stage=KG.el('main');stage.id='kg-stage';body.appendChild(stage);
  const cast=KG.el('div','kg-cast');const castImg={};KG.ORDER.forEach(id=>{const i=KG.el('img');i.src=HEROES[id].full;i.alt=HEROES[id].name;castImg[id]=i;cast.appendChild(i)});body.appendChild(cast);
  const intro=KG.el('div','kg-overlay dim');
  intro.innerHTML=`<div class="kg-intro"><span class="tag">${def.tag||'Math adventure'}</span><h1 class="kg-title">${def.title}</h1><div class="trio">${KG.ORDER.map(id=>`<img src="${HEROES[id].full}" alt="${HEROES[id].name}">`).join('')}</div><div class="card kg-paper">${def.blurb||''}<small>${def.skill||''}</small></div><button class="kg-btn gold big" id="kg-play">Play!</button></div>`;
  body.appendChild(intro);
  const win=KG.el('div','kg-overlay dim');win.hidden=true;body.appendChild(win);

  let typeTimer=0,tok=0,hideT=0,talkT={};
  function bubble(who,html){const H=HEROES[who];bub.querySelector('img').src=H.head;bub.querySelector('.who').textContent=H.name;bub.style.setProperty('--ring',H.ring);
    const txt=bub.querySelector('.txt');bub.classList.remove('hide');clearTimeout(hideT);hideT=setTimeout(()=>bub.classList.add('hide'),12000);
    const words=html.split(' '),t=++tok;clearInterval(typeTimer);txt.innerHTML='';
    setTimeout(()=>{if(t!==tok)return;let i=0;typeTimer=setInterval(()=>{if(t!==tok||i>=words.length){clearInterval(typeTimer);return}i++;txt.innerHTML=words.slice(0,i).join(' ');if(i%2===1)tone(H.notes[(i>>1)%4],.07,{type:'triangle',g:.03})},beatLen()/4*1000)},KG.secToNext(2)*1000)}
  function setTalk(who,sec){Object.values(castImg).forEach(i=>i.classList.remove('talk'));const i=castImg[who];if(!i)return;i.classList.add('talk');clearTimeout(talkT[who]);talkT[who]=setTimeout(()=>i.classList.remove('talk'),sec*1000)}
  function pose(who,cls,ms){const i=castImg[who];if(!i)return;i.classList.add(cls);setTimeout(()=>i.classList.remove(cls),ms||1600)}

  /* hints: after the 2nd wrong try the game highlights the answer (.glow);
     the shell adds a pointing hand and a spoken "Here's a hint!" */
  let handOff=null;
  function clearHand(){if(handOff){handOff();handOff=null}}
  function pointTo(el){clearHand();if(!el||!el.isConnected)return;if(window.CH&&CH.ui&&CH.ui.fx){handOff=CH.ui.fx.pointAt(el)}else{el.classList.add('glow')}}

  /* Race only: optional friendly bonus clock (never costs stars) */
  const bonusOn=!!(cfgGame&&cfgGame.finale&&hasCH&&CH.store.setting('bonusTimer'));
  let bonusEl=null,bonusT=0,bonusEnd=0,bonusLive=false,speedy=0;
  function bonusStart(){if(!bonusOn)return;const sec=(CH.config.BONUS&&CH.config.BONUS.seconds)||12;
    if(!bonusEl){bonusEl=KG.el('div','kg-bonus','<svg viewBox="0 0 60 60" aria-hidden="true"><circle class="bg" cx="30" cy="30" r="24"/><circle class="fg" cx="30" cy="30" r="24"/></svg>');bonusEl.setAttribute('role','img');bonusEl.setAttribute('aria-label','Speedy bonus clock');body.appendChild(bonusEl)}
    const fg=bonusEl.querySelector('.fg'),C=2*Math.PI*24;fg.style.strokeDasharray=C;bonusEl.classList.remove('done');bonusLive=true;bonusEnd=Date.now()+sec*1000;clearInterval(bonusT);
    const tick=()=>{const left=Math.max(0,bonusEnd-Date.now());fg.style.strokeDashoffset=C*(1-left/(sec*1000));if(!left)bonusStop()};tick();bonusT=setInterval(tick,250)}
  function bonusStop(){clearInterval(bonusT);bonusLive=false;if(bonusEl)bonusEl.classList.add('done')}

  let firstTry=0,credit=0,repeatLine=null,round=0,misses=0,roundMiss=0,locked=true,finished=false,introLine=null,startedAt=0,hints=0,glowBefore=null;
  const api={stage,rounds:def.rounds||8,host,get round(){return round},get locked(){return locked},
    hero:k=>KG.ORDER[((k%3)+3)%3],
    talk(who,text){if(introLine){text=introLine+' '+text;introLine=null}bubble(who,text);KG.say(text,who);setTalk(who,text.split(' ').length*.36+.8)},
    prompt(who,text){repeatLine={who,text};api.talk(who,text);if(!locked)bonusStart()},
    cheer(who,ms){const list=who?[castImg[who]]:Object.values(castImg);list.forEach(i=>{if(!i)return;i.classList.add('cheer');setTimeout(()=>i.classList.remove('cheer'),ms||1400)})},
    lock(){locked=true},unlock(){locked=false},
    /** point at the answer yourself (optional — glowing it works too) */
    hint(el){pointTo(el)},
    correct(o){o=o||{};if(locked&&!o.force)return false;locked=true;clearHand();
      if(roundMiss===0)firstTry++;credit+=hasCH?CH.config.creditFor(roundMiss):(roundMiss?0:1);
      KG.sfx.correct(round);if(o.el){KG.sparkle(o.el);o.el.classList.remove('pop');void o.el.offsetWidth;o.el.classList.add('pop')}
      let line=o.line||KG.praise(o.who||api.hero(round+1));
      if(bonusLive&&Date.now()<bonusEnd){speedy++;line+=' Speedy bonus!';KG.sfx.coin()}bonusStop();
      const who=o.who||api.hero(round+1);api.cheer(who);if(who!==host)api.cheer(host,900);api.talk(who,line);renderDots(round+1,true);
      if(o.stay)return true;setTimeout(api.next,o.delay||2200);return true},
    wrong(o){o=o||{};misses++;roundMiss++;KG.sfx.wrong();
      if(o.el){o.el.classList.remove('shake');void o.el.offsetWidth;o.el.classList.add('shake')}
      const who=o.who||api.hero(round+2);pose(who,'think',1500);
      let line=o.line||'Hmm, let’s try another one!';
      if(roundMiss===2){hints++;line='Here’s a hint! '+line;glowBefore=new Set(stage.querySelectorAll('.glow'));
        setTimeout(()=>{if(finished)return;const fresh=[...stage.querySelectorAll('.glow')].filter(e=>!glowBefore.has(e));if(fresh[0])pointTo(fresh[0])},80)}
      api.talk(who,line);return roundMiss},
    get roundMisses(){return roundMiss},
    next(){if(finished)return;clearHand();bonusStop();round++;roundMiss=0;if(round>=api.rounds){api.finish();return}renderDots(round);locked=false;inst.round(round)},
    finish(){if(finished)return;finished=true;locked=true;clearHand();bonusStop();renderDots(api.rounds);
      const total=api.rounds,right=Math.min(total,firstTry),cr=Math.min(total,credit);
      const stars=hasCH?CH.config.starsFor(cr,total):(right/total>=.9?3:right/total>=.7?2:1);
      KG.prog.won[def.id]=Math.max(KG.prog.won[def.id]||0,stars);KG.save();
      let res=null;
      if(hasCH&&CH.store.activeId())res=CH.store.recordSession(def.id,{startedAt:new Date(startedAt||Date.now()).toISOString(),durationSec:Math.round((Date.now()-(startedAt||Date.now()))/1000),correct:right,total,hintsUsed:hints,stars});
      setTimeout(()=>showEnd(stars,right,total,res),900)},
    beats(n,fn,div){const B=beatLen()/(div||1);const d=KG.secToNext(div||1)*1000;for(let i=0;i<n;i++)setTimeout(()=>fn(i),d+i*B*1000);return d+n*B*1000},
    beatLen
  };

  /* end screen — always a celebration: 1–3 stars, sticker, personal best */
  function showEnd(stars,right,total,res){
    Object.values(castImg).forEach(i=>i.classList.remove('think','cheer','talk'));
    KG.sfx.fanfare();KG.confetti();api.cheer(null,4000);
    if(stars===3){KG.sfx.applause(4);KG.fireworks()}
    const titles={3:def.winTitle||'Amazing!',2:'Great job!',1:'You did it!'};
    const texts={3:def.winText||'Super math skills!',2:'You worked so hard. Every try makes your brain stronger!',1:'You finished the whole adventure! Play again to grow more stars.'};
    const sticker=!!(res&&res.newSticker),pb=!!(res&&res.personalBest&&!res.firstCompletion);
    const name=hasCH&&CH.store.activePlayer()?CH.store.activePlayer().name:'';
    const sayName=name&&CH.voice?CH.voice.speakName(CH.store.activePlayer()):'';
    const starWord=stars===1?'one star':stars+' stars';
    const say=(stars===3?(def.winSay||'Hooray! You did it!'):stars===2?'Great job'+(sayName?', '+sayName:'')+'!':'You did it'+(sayName?', '+sayName:'')+'! You finished the adventure!')
      +` You earned ${starWord}!`+(sticker?' And you got a new sticker!':'')+(pb?' That’s your personal best!':'');
    win.innerHTML=`<div class="kg-win kg-panel" role="dialog" aria-modal="true" aria-labelledby="kg-win-h"><div class="kg-paper">
      <div class="trio">${KG.ORDER.map(id=>`<img src="${HEROES[id].full}" alt="">`).join('')}</div>
      <h2 id="kg-win-h">${titles[stars]}</h2><div class="s3"></div>
      ${pb?'<div class="kg-best">Personal best!</div>':''}
      ${sticker?`<div class="got">${KG.stickerSVG(def.id)}<span>New sticker!</span></div>`:''}
      ${right?`<div class="res">${right} of ${total} right on the first try</div>`:''}<p>${texts[stars]}</p></div>
      <div class="row"><button class="kg-btn gold big" data-again>${(window.CH&&CH.ICONS&&CH.ICONS.again)||''}Play again</button><a class="kg-btn sky" href="index.html" data-map>${(window.CH&&CH.ICONS&&CH.ICONS.map)||''}Back to map</a></div></div>`;
    const s3=win.querySelector('.s3');
    if(window.CH&&CH.ui)s3.appendChild(CH.ui.starRating(stars,{animate:true,label:`You earned ${stars} of 3 stars`}));
    else s3.innerHTML=[0,1,2].map(i=>i<stars?KG.starSVG():KG.starSVG('rgba(255,253,246,.5)','rgba(110,67,34,.5)')).join('');
    win.hidden=false;
    const again=win.querySelector('[data-again]');again.onclick=()=>{KG.sfx.pop();location.reload()};
    win.querySelector('[data-map]').addEventListener('click',()=>{try{sessionStorage.setItem('ch-in','1')}catch(e){}});
    setTimeout(()=>again.focus(),400);
    KG.say(say,host,{queue:false});
  }

  function renderDots(cur,justGot){dots.innerHTML='';dots.setAttribute('aria-valuemax',api.rounds);dots.setAttribute('aria-valuenow',Math.min(cur,api.rounds));dots.setAttribute('aria-valuetext',`Question ${Math.min(cur+1,api.rounds)} of ${api.rounds}`);
    for(let i=0;i<api.rounds;i++){const got=i<cur;const d=KG.el('span','kg-dot'+(i===cur?' now':'')+(got&&justGot&&i===cur-1?' got':''),got?KG.starSVG():'<i></i>');dots.appendChild(d)}}
  renderDots(0);
  $('#kg-repeat').onclick=()=>{KG.ensureAudio();if(repeatLine)api.talk(repeatLine.who,repeatLine.text)};
  document.querySelector('[data-music]').onclick=()=>{KG.ensureAudio();KG.setMusic(!musicOn)};
  try{sessionStorage.setItem('ch-in','1')}catch(e){}
  const inst=def.build(stage,api);
  $('#kg-play').onclick=()=>{KG.ensureAudio();if(window.CH&&CH.voice)CH.voice.unlock();startedAt=Date.now();hints=0;credit=0;firstTry=0;KG.sfx.pop();intro.hidden=true;round=0;misses=0;renderDots(0);introLine=def.intro?def.intro.text:null;locked=false;inst.round(0);if(introLine){const w=def.intro.who;api.talk(w,'');}};
  setTimeout(()=>intro.querySelector('#kg-play').focus(),300);
  return api;
};
})();
