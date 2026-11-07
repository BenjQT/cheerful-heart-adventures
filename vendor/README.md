# Third-party files (self-hosted)

These files ship with the game so it never loads anything from another website.

| File | What | Version | License | Original source |
|---|---|---|---|---|
| `three/three.min.js` | three.js, the 3D engine used by the Lost Star Map | r128 | MIT (`three/LICENSE`) | cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js (sha256 `9274bbce…c1ce2`) |
| `fonts/fredoka-*.woff2` | Fredoka (body text), one variable font for weights 300–700 | v17 | SIL OFL 1.1 (`fonts/OFL-Fredoka.txt`) | Google Fonts |
| `fonts/lilita-one-*.woff2` | Lilita One (titles) | v17 | SIL OFL 1.1 (`fonts/OFL-LilitaOne.txt`) | Google Fonts |
| `fonts/fonts.css` | `@font-face` rules for the files above | — | — | written for this project |

The fonts are the `latin` and `latin-ext` subsets, which cover English and accented letters.
If you replace any file here, also add it to `FILES` in `sw.js` and bump `VERSION`.
