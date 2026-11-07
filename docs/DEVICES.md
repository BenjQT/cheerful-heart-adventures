# Device support — Cheerful Heart Adventures

Last updated: 7 Nov 2026 (Phase 8.5).

**How this was checked:** the game was opened in a desktop Chromium browser, at phone and tablet screen sizes.
Re-run the size check any time with `tests/devices.html`, which opens all 14 pages at 8 sizes.

Rows marked **Real device needed** could not be checked here. Please try them on the real hardware before release.

## Screen sizes (automatic check: `tests/devices.html`)

The check looks for three problems: sideways scrolling, buttons cut off at the edge, and tap targets smaller than 44 px.

| Size | Width × height | Map + 12 games | Grown-ups’ Corner |
|---|---|---|---|
| Small phone | 320 × 568 | ✅ Pass | ✅ Pass |
| iPhone SE | 375 × 667 | ✅ Pass | ✅ Pass |
| iPhone 14 | 390 × 844 | ✅ Pass | ✅ Pass |
| Android phone | 360 × 740 | ✅ Pass | ✅ Pass |
| Phone landscape | 740 × 360 | ✅ Pass | ✅ Pass |
| iPad portrait | 768 × 1024 | ✅ Pass | ✅ Pass |
| iPad landscape | 1024 × 768 | ✅ Pass | ✅ Pass |
| Laptop / Chromebook | 1366 × 768 | ✅ Pass | ✅ Pass |

First run: 104 of 112 checks passed. The 8 that failed were all the Grown-ups’ Corner section links, which were too small and hidden off the side on phones. After the fix, all 112 pass.

## Features

| Feature | Chrome / Edge (desktop) | Android Chrome | iPhone / iPad Safari | Notes |
|---|---|---|---|---|
| Layout uses `100dvh`, `clamp()` and safe-area insets | ✅ Pass (checked) | Real device needed | Real device needed | `viewport-fit=cover` is on every page. The notch and home bar are padded with `env(safe-area-inset-*)`. |
| Tap / mouse / pen (Pointer Events) | ✅ Pass | Real device needed | Real device needed | Answers are real `<button>`s. The Star Map uses `pointerdown`. `touch-action: manipulation` stops the double-tap zoom delay. |
| Keyboard play | ✅ Pass | n/a | n/a | Tab + Enter/Space in every game. In the Star Map, ← → moves a ring between stars, Enter taps, and number keys tap a star directly. |
| No sound until first tap | ✅ Pass (checked) | Real device needed | Real device needed | A line asked for before the first tap is said on that tap. |
| Sound comes back after the app was in the background or a phone call | ✅ (code path) | Real device needed | **Real device needed** | Audio pauses when hidden. The next tap resumes it, including iOS’s “interrupted” state. |
| Speech voice | ✅ Pass | Real device needed | Real device needed | If no voice exists, captions always show. |
| Private / incognito browsing | ✅ (simulated in `tests/store-tests.html`) | Real device needed | Real device needed | If storage is blocked, children can still play and grown-ups see a notice. Offline mode may be off in private windows. |
| Install to home screen | ✅ manifest + icons valid | Real device needed | Real device needed | iPhone/iPad: Share → Add to Home Screen. Apple tags and a 180 px icon are included. |
| Works offline after first visit | ✅ Pass (server stopped, Star Map 3D + games loaded) | Real device needed | Real device needed | Uses a service worker (`sw.js`). It needs `http(s)://`; opening the files straight from disk still works, just not offline. |
| Smooth 3D (Star Map) | ✅ Pass | Real device needed | Real device needed | Resolution is capped at 2×. It drops to 1× if the first few seconds run under 40 fps. |
| Less motion | ✅ Pass | — | — | The setting is in Grown-ups’ Corner, and the device’s own “reduce motion” setting is also followed. The beat bounce stops to save battery. |

## Releasing an update
After changing any file, change `VERSION` at the top of `sw.js`. Installed copies then fetch the new files; without this, devices can keep showing the old saved copy.
