# Client edits 2026-10-29 (three videos from the client)

Source: правка1.mp4, правка2.mp4, правка 3.mp4 (voice transcribed with Whisper small, frames checked).

## What the client said
1. **Lid photos are wrong.** The red Twist-Off with lugs in the hero/product slider (02/03 "Twist-Off 82") is "a different format, we do not make such lids". The client has photos of all their lids and expects them to be used.
2. **The 3D lid in the hero looks wrongly built** when you scroll ("as if it were constructed wrong"). Not clear what is wrong; the client could not say.
3. **The palette is too dark and gloomy.** Make the site lighter, with more red, blue and yellow: the corporate colours of «Мечта хозяйки».
4. **The header name is wrong.** The header shows «Мечта хозяйки». It must show ELIT KONSERVA: «Мечта хозяйки» is the main brand, the company/factory is ELIT KONSERVA.
5. **New interaction: an exploded lid.** Click the lid and it opens like an accordion into layers: sealing ring, lid body, outer lacquer, inner lacquer (with a sound-like "trrrr" motion).

## Plan
| # | Work | Owner | Files | Blocked by |
|---|---|---|---|---|
| A | Header and metadata: ELIT KONSERVA as the company name, «Мечта хозяйки» as a brand | lead (main loop) | apps/web/components/layout/*, messages/{ru,uz,en}.json | ELIT KONSERVA logo file (only low-res logo.png from the old site) |
| B | Light theme: new tokens on a light ground with red / blue / yellow from the brand tubes | lead + web-designer review | apps/web/app/globals.css (tokens), section backgrounds | brand colour values (take from the tube labels, or from the client's brand book) |
| C | Replace lid photos and the Twist-Off render with the client's real photos | lead | apps/web/public/images/lids/*, hero/product data | **client photos** |
| D | Check the 3D lid model against the real lid profile, fix the geometry | threed-dev | apps/web/public/models/*, 3D scene components | photos from C |
| E | Exploded-lid interaction (ring, body, outer lacquer, inner lacquer) | threed-dev | 3D scene components | D |

Order: A and B first (no new inputs needed beyond the logo), then C → D → E once the photos arrive.
DoD per CLAUDE.md: lint, typecheck, tests, Playwright screenshots 1440/390, copy in ru/uz/en, perf budget not worse.
