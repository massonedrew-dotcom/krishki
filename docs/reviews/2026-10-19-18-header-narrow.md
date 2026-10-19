# Review — ticket 18, header fit on narrow phones

- **Date**: 2026-10-19
- **Agent**: frontend-dev
- **Verdict**: **accepted**

## Scope
Changed files:
- `apps/web/src/components/ui/header.tsx` (lines 59, 67, 68)
- `apps/web/src/components/ui/site.css` (new `.header-call` block, about line 230)
- `qa/screens/18-header-narrow/`

`globals.css` is untouched and no new breakpoint was added. Nothing was committed. The server was stopped by PID on port 3100 only, as briefed.

## Fix
- The brand text «ELIT KONSERVA» is hidden below `sm` (640 px). The logo and the home link's aria-label stay.
- The right group gap is `gap-1` on phones and `sm:gap-2` from 640 px up.
- The call link gets `min-height: 2.75rem`, so it is now a 44 px tap target. It was 40 px before, which was a second, silent accessibility issue.
- This is the least visual change: the label stays text, not an icon.

## Checks re-run by the lead
- `pnpm lint`, `pnpm typecheck`, `pnpm build`: pass.
- Built-in browser, production build:

  | Page | Width | Burger (left–right, size) | Call link (left–right, size) | scrollWidth | Notes |
  |---|---|---|---|---|---|
  | `/uz` | 375 | 315–359, 44×44 | 196–311, 115×44 | 375 | — |
  | `/ru` | 390 | 330–374, 44×44 | 219–326, 107×44 | 390 | logo 16–78 |

  In both cases the 16 px gutter is intact.
- The agent's table covers 15 combinations: ru, uz and en × 320, 360, 375, 390 and 414 px. All of them pass.
- Screenshots looked at: `uz-375.png`, `ru-390.png`, `ru-768.png`. At 768 the brand text is back and the header is unchanged.

## Notes
- LOW: in `header.tsx:59`, `sm:inline` sits in the middle of the class list. This is cosmetic only and needs no action.
- Not verified: WebKit/Firefox and real devices.
