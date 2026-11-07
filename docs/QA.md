# QA checklist — Cheerful Heart Adventures

Run on 7 Nov 2026 (Phase 9). Branch: `revamp`.

**Status key**
- ✅ checked here and passed
- 🔶 needs a real device or a real child
- ⚠️ open item that needs a decision

All automated tests are in `tests/`. Serve the folder over http first (`py -m http.server 5173`), then open the test pages.

| Test page | What it checks | Result |
|---|---|---|
| `tests/voice-tests.html` | The exact words sent to text-to-speech (uses a silent fake engine) | ✅ 9 / 9 |
| `tests/smoke.html` | Opens all 14 pages, taps Play like a child would, and records every spoken line | ✅ 14 / 14 (48 lines spoken, 0 raw “Wynea”) |
| `tests/store-tests.html` | Player profiles, migration from the old save format, corrupt / blocked / full storage | ✅ 14 / 14 |
| `tests/devices.html` | 14 pages × 8 screen sizes: no sideways scroll, no cut-off buttons, 44 px tap targets | ✅ 112 / 112 |

## 1. Non-negotiables

| Check | How | Result |
|---|---|---|
| Ali, Wynea and Matthew unchanged | `git diff a5429a4 -- img/*.webp` is empty. Names, roles and colours are as in the original. | ✅ |
| “Wynea” on screen, spoken “Wee-neh-yah” | See §2 | ✅ |
| All 12 skills present | `core/config.js` has 12 stops, each with a skill (listed in Grown-ups’ Corner → About) | ✅ |
| Games last about 3–5 minutes | Each game has 8–12 questions (the race has 5 dice challenges, each with several steps). Play times are recorded in Grown-ups’ Corner → History. | 🔶 Confirm with a real child; adult test runs were 1–3 minutes. |
| Audio-first: works for a child who can’t read | Every instruction is spoken. Replay buttons are on the map and in games. Hints are spoken. Answers are pictures. | ✅ (by code and smoke test) · 🔶 by ear |
| No backend; localStorage with a versioned schema and migration | Schema v2. Migrates `kg-progress` and `starmap-progress`. Backups are made on corrupt or newer data (store tests). | ✅ |
| No ads, no tracking | Searched for `fetch`, XHR, beacon, cookies, analytics and iframes outside tests and `sw.js`: none found. | ✅ |
| Only a first name / nickname stored | Player fields: name (15 characters), picture, optional age (4–6), optional “say it as”, progress. | ✅ |
| Existing features and assets kept | Every file from the baseline commit still exists. The old grown-up note text is kept word for word on the map and in Grown-ups’ Corner. | ✅ |
| Third-party requests | Fonts load from Google Fonts and the Star Map’s 3D library loads from cdnjs. These are not tracking, but each is a request to another company’s server. | ⚠️ Can be self-hosted so the game makes no outside requests (see §9) |

## 2. Wynea pronunciation (grep + runtime)
- ✅ **Grep:** `speechSynthesis` / `SpeechSynthesisUtterance` appears only in `core/voice.js`. The duplicate speech engines in `shared.js` and `star-map.html` were removed in Phase 8.
- ✅ **Grep:** `core/voice.js` makes one real utterance (line ~120), and its text is always `pronounce(plain)`. The other utterance is the silent `' '` used to unlock speech.
- ✅ **Grep:** every other “Wynea” in the code is on-screen text, a comment, or text passed to `CH.voice.speak()` / `KG.say()`, which pronounce it.
- ✅ **Runtime** (`voice-tests.html`): plain text, “Wynea’s / Wynea's”, any capitals, inside `<b>`, a child named Wynea, every map intro / title / place, and all hero names. None of these send “Wynea” raw.
- ✅ **Runtime** (`smoke.html`): real pages were played and 48 spoken lines recorded, with 0 raw “Wynea”. Grown-ups’ Corner said “I’m Wee-neh-yah.”

**Re-run the grep** (should print only `core/voice.js` lines):
```bash
grep -rn "speechSynthesis\|SpeechSynthesisUtterance" --include=*.html --include=*.js . | grep -v "^./tests/"
```

## 3. Player profiles and scorebook
- ✅ Add a player (name, picture, age). An empty name or more than 10 players is refused with a friendly message.
- ✅ Switch player. Stars, stickers and Star Map levels are separate for each player.
- ✅ Edit, reset and delete in Grown-ups’ Corner each ask for confirmation. The active player being deleted sends the app back to “Who’s playing?”.
- ✅ Scorebook mastery uses the last 3 finished plays: *Needs practice* <70%, *Mastered* ≥90%. Each label has an icon and text, so it doesn’t rely on colour.
- ✅ History includes games stopped early. The CSV export has the correct columns and protects against spreadsheet formula injection. The print report shows only the scorebook.
- ✅ The certificate unlocks after all 12 stops. Print and Save are behind the parent gate.
- 🔶 The real print dialog and the real file download on each device.

## 4. Gameplay and feedback
- ✅ Gentle unlocking: 3 stops open, then each finished stop opens the next. The “all open” setting works.
- ✅ Stars: ★★★ ≥90% credit, ★★ ≥70%, ★ for finishing. A second try gets half credit. A hint appears after 2 misses.
- ✅ No sad end screens. Wrong answers get a soft sound, a wobble, and an encouraging line.
- ✅ New sticker / personal best celebrations. Play again / Back to map.
- ✅ Race bonus timer is off by default and never removes stars.
- ✅ Stretch-break reminder after about 20 minutes of visible play, only at calm moments. It can be turned off.

## 5. Sound and voice
- ✅ No audio or speech before the first tap. A line asked for earlier is said on that tap.
- ✅ Music dips to 40% while a friend talks.
- ✅ Settings apply live: sound off, music volume, voice speed, captions off. Words always show if there is no voice or sound is off.
- 🔶 By ear on real devices: voice quality, how the dip sounds, iOS audio after a phone call.

## 6. Accessibility
- ✅ `lang="en"` and a title on every page; no image is missing `alt`.
- ✅ Keyboard: every game uses real buttons. In the Star Map, ← → plus Enter, or number keys. Focus rings are visible.
- ✅ Dialogs trap focus, close with Esc where safe, and return focus afterwards.
- ✅ Reduced motion: both the device setting and the in-app setting are followed.
- ✅ Tap targets are at least 44 px (`devices.html`).
- 🔶 A screen-reader pass with VoiceOver / TalkBack.

## 7. Devices, offline and install
See `docs/DEVICES.md` for the full pass/fail table.
- ✅ 8 screen sizes from 320 px phones to laptops.
- ✅ Offline: with the server stopped, the games and the 3D Star Map still loaded.
- 🔶 Real iPhone, iPad, Android phone and Chromebook: install to home screen, private mode, audio.

## 8. Storage edge cases (`store-tests.html`)
- ✅ Old saves migrate into “Star Friend”, and the migration runs only once.
- ✅ Corrupt data is backed up and rebuilt. Data from a newer version is backed up first.
- ✅ Blocked storage (private mode) still lets children play, and grown-ups see a notice.
- ✅ A full disk trims old history but keeps stars. History is capped at 200 plays per player.

## 9. Open items
1. ⚠️ **Self-host fonts and three.js** so the game makes no requests to Google or cdnjs. That would remove the last third-party requests and make the very first visit work offline too.
2. 🔶 **Real-device pass** on iPhone/iPad (Safari), an Android phone and a Chromebook, using the 🔶 rows above.
3. 🔶 **Play-test with 2–3 children aged 4–6.** Check that each game takes about 3–5 minutes, that instructions are understood without reading, and that hints help.
4. When releasing, bump `VERSION` in `sw.js`.
