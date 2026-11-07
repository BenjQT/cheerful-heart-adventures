/* =====================================================================
   Cheerful Heart Adventures — game configuration (one place to edit)
   window.CH.config
     GAMES        the 12 adventures in map order, with host + map stop
     HOSTS        who hosts what (Ali, Wynea, Matthew host 4 each)
     UNLOCK       gentle unlocking rules (or switch to "all unlocked"
                  in Grown-ups' Corner → settings.unlockMode)
     STARS        star rules used by every game
   ===================================================================== */
(function () {
  'use strict';
  const CH = (window.CH = window.CH || {});

  /* ---------------- the adventure path ----------------
     host: the friend who introduces the stop and leads the game.
     place: the map location name. intro: what the host says on the map.  */
  const GAMES = [
    { id: 'star-map',  file: 'star-map.html',  title: 'The Lost Star Map',           place: 'Starry Woods',          host: 'ali',
      skill: 'Counting and number order', tag: 'Counting', scene: 'forest', icon: 'star',
      intro: 'Welcome to Starry Woods! The wind blew our star map away. Let’s count the stars to find it!' },
    { id: 'shapes',    file: 'shapes.html',    title: 'Shape Kingdom Rescue',        place: 'Shape Castle',          host: 'wynea',
      skill: 'Naming shapes', tag: 'Shapes', scene: 'castle', icon: 'shapes',
      intro: 'Welcome to Shape Castle! A grumpy wizard broke the bridge. Let’s fix it with shapes!' },
    { id: 'patterns',  file: 'patterns.html',  title: 'Matthew’s Pattern Machine',   place: 'Pattern Lab',           host: 'matthew',
      skill: 'Finishing patterns', tag: 'Patterns', scene: 'lab', icon: 'pattern',
      intro: 'Beep boop! Welcome to my Pattern Lab! My machine needs the right patterns to work.' },
    { id: 'treasure',  file: 'treasure.html',  title: 'Treasure of Coconut Island',  place: 'Coconut Island',        host: 'wynea',
      skill: 'More, fewer and the same', tag: 'Comparing', scene: 'beach', icon: 'chest',
      intro: 'Ahoy! Welcome to Coconut Island! Let’s find the chest with more treasure!' },
    { id: 'cookies',   file: 'cookies.html',   title: 'Ali’s Cookie Party',          place: 'Cookie Kitchen',        host: 'ali',
      skill: 'Adding and taking away within 10', tag: 'Add & subtract', scene: 'party', icon: 'cookie',
      intro: 'Welcome to my Cookie Kitchen! Let’s add cookies and take some away. Yum!' },
    { id: 'bridge',    file: 'bridge.html',    title: 'Jungle Bridge Builder',       place: 'Jungle River',          host: 'wynea',
      skill: 'Long, short, tall', tag: 'Measuring', scene: 'jungle', icon: 'log',
      intro: 'Welcome to Jungle River! Help me pick long and short logs so we can cross!' },
    { id: 'sorting',   file: 'sorting.html',   title: 'The Sorting Spaceship',       place: 'Rocket Pad',            host: 'matthew',
      skill: 'Sorting by color, size and shape', tag: 'Sorting', scene: 'space', icon: 'rocket',
      intro: 'Welcome to the Rocket Pad! Let’s sort everything before we blast off!' },
    { id: 'clock',     file: 'clock.html',     title: 'Wynea’s Clock Tower Quest',   place: 'Clock Tower',           host: 'wynea',
      skill: 'Telling time to the hour', tag: 'Time', scene: 'clock', icon: 'clock',
      intro: 'Welcome to the Clock Tower! The clock stopped. Let’s fix it and tell the time!' },
    { id: 'market',    file: 'market.html',    title: 'Market Day Adventure',        place: 'Money Market',          host: 'ali',
      skill: 'Counting peso coins', tag: 'Money', scene: 'market', icon: 'coin',
      intro: 'Welcome to the Money Market! Let’s pay for fruit with peso coins!' },
    { id: 'hide-seek', file: 'hide-seek.html', title: 'Hide-and-Seek Village',       place: 'Hide-and-Seek Village', host: 'matthew',
      skill: 'Position words', tag: 'Positions', scene: 'village', icon: 'house',
      intro: 'Welcome to Hide-and-Seek Village! Listen carefully and find where we are hiding!' },
    { id: 'garden',    file: 'garden.html',    title: 'Rainbow Number Garden',       place: 'Rainbow Garden',        host: 'ali',
      skill: 'Matching numbers to groups', tag: 'Number sense', scene: 'garden', icon: 'flower',
      intro: 'Welcome to Rainbow Garden! Let’s match numbers and make the flowers grow!' },
    { id: 'race',      file: 'race.html',      title: 'The Great Friendship Race',   place: 'Friendship Raceway',    host: 'matthew', finale: true,
      skill: 'Dice counting and review', tag: 'Review', scene: 'track', icon: 'dice',
      intro: 'This is the Friendship Raceway, the big finale! Let’s race the grumpy wizard and use everything we learned!' }
  ];
  GAMES.forEach((g, i) => { g.index = i; g.n = i + 1; });
  const byId = Object.fromEntries(GAMES.map(g => [g.id, g]));

  /* Ali: Star Map, Cookies, Market, Garden · Wynea: Shapes, Treasure, Bridge, Clock
     Matthew: Patterns, Sorting, Hide-and-Seek, Friendship Race (all three cheer in the finale) */
  const HOSTS = {};
  GAMES.forEach(g => { (HOSTS[g.host] = HOSTS[g.host] || []).push(g.id); });

  /* ---------------- unlocking ----------------
     gentle: the first `startOpen` stops are open; finishing a stop (any stars)
             opens the next one; the finale opens after all the others are
             finished at least once. Finished stops can always be replayed.
     all:    everything open (Grown-ups' Corner → settings).               */
  const UNLOCK = {
    startOpen: 3,
    finaleNeedsAll: true,
    defaultMode: 'gentle'
  };
  function unlockMode() { return (CH.store && CH.store.setting('unlockMode')) || UNLOCK.defaultMode; }
  function isCompleted(player, id) { return !!(player && player.games && player.games[id] && player.games[id].completed); }
  /** isUnlocked(gameId, player, mode?) */
  function isUnlocked(id, player, mode) {
    const g = byId[id]; if (!g) return false;
    mode = mode || unlockMode();
    if (mode === 'all') return true;
    if (isCompleted(player, id)) return true;
    if (g.finale && UNLOCK.finaleNeedsAll) return GAMES.filter(x => !x.finale).every(x => isCompleted(player, x.id));
    if (g.index < UNLOCK.startOpen) return true;
    return isCompleted(player, GAMES[g.index - 1].id);
  }
  /** the stop we suggest next: first unlocked, unfinished stop (else null) */
  function nextStop(player, mode) {
    return GAMES.find(g => isUnlocked(g.id, player, mode) && !isCompleted(player, g.id)) || null;
  }

  /* ---------------- stars (used by every game) ----------------
     Each question earns credit: right on the first try = 1, on the second
     try = oneMiss, after a hint (shown after 2 wrong tries) = oneMiss minus
     hintPenalty. accuracy = credit / questions. Finishing always earns ★.
       ★★★ accuracy ≥ 90%   ★★ ≥ 70%   ★ finished                         */
  const STARS = {
    three: 0.90,
    two: 0.70,
    oneMiss: 0.5,         // credit for a question answered on the 2nd try
    hintPenalty: 0.25,    // a hinted question earns 0.5 - 0.25 = 0.25
    min: 1
  };
  /** credit for one question, given how many wrong tries came first */
  function creditFor(misses) { return misses <= 0 ? 1 : misses === 1 ? STARS.oneMiss : Math.max(0, STARS.oneMiss - STARS.hintPenalty); }
  /** starsFor(credit, questions) — credit may be fractional */
  function starsFor(credit, total) {
    if (!total) return STARS.min;
    const a = credit / total + 1e-9;
    return a >= STARS.three ? 3 : a >= STARS.two ? 2 : STARS.min;
  }

  /* Race only: an optional friendly "speedy bonus" clock (Grown-ups' Corner →
     settings.bonusTimer, off by default). It never costs stars.            */
  const BONUS = { seconds: 12 };

  CH.config = { GAMES, byId, HOSTS, UNLOCK, STARS, BONUS, isUnlocked, isCompleted, nextStop, unlockMode, starsFor, creditFor, game: id => byId[id] || null };
})();
