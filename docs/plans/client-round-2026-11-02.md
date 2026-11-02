# Client round 2026-11-02: compact pages, lid markers, export map

Goal: less scrolling and empty space, no template look. Copy only in messages/*.json, ru/uz/en.
Measured at 1440x900 before the change; target for desktop: each home section fits one screen (about 820 px under the header).

| # | Area | Now | Change |
|---|------|-----|--------|
| 1 | Home, product passport | 1154 px | Smaller pictures, tighter rows and padding; fits one screen |
| 2 | Home, seven operations | 2716 px, mostly empty blue | Round nodes become small lids with a dashed rim that turn with scroll; rail and year ruler on one pinned screen |
| 3 | Home, lacquering and lithography | 1063 px | Two low image-and-text panels; fits one screen |
| 4 | Products | 2176 px, tall cards, lone last card | Shorter image cards, four columns, ring card fills the last row; fix the raw `products.filter.count` key |
| 5 | About | 6197 px, uneven gallery, sticky heading, parallax | Compact timeline, even gallery with no parallax, tighter sections |
| 6 | Services | 4937 px | Merge directions and process into one block, compact spec table, tighter sections |
| 7 | Brands | 6114 px | Remove the `lid-disc` ring behind tubes; replace alternating full-height rows with compact brand panels on one grid, specs in a short table |
| 8 | About, map | Missing, only a heading and a button | Light dot-matrix map from Kokand with lines to delivery countries; based on `prototypes/light-home` (Natural Earth, public domain), wider frame |

## Also fix
- Form labels are nearly invisible on the blue lead form (seen on about, products, services, brands). Contrast fix.

## Phones (390 px)
A whole section will not always fit one screen. Use compact layouts and sideways swipe where it helps; no horizontal page overflow.

## Open question
Item 8 needs the list of delivery countries. Proposal from the brief: KZ, KG, TJ, TM, RU, BY, AZ. The site currently says "Uzbekistan and Central Asia", so the copy changes with it.

## Checks
lint, typecheck, unit tests, e2e for touched pages, reduced motion, keyboard focus, no overflow; screenshots at 1440 and 390 before and after in `qa/screens/client-round/`.

## Order
Shared form fix, then home (1-3), products (4), about (5, 8), services (6), brands (7). Commit by area, publish to the preview after review.
