# Silent Period

**Live: https://nathanc90.github.io/silent-period/**

A study build: what would a "200-day input protocol" language app actually look like, applied to Japanese?

This exists to answer a curiosity question, not as a product or a portfolio piece.

## What it is

An original implementation of a well-established language-acquisition approach — comprehensible input, an enforced silent period before speaking, and a frequency-ordered SRS deck. That methodology traces back to Krashen's input hypothesis and has circulated for years under names like AJATT, MIA and Refold.

It is **not** affiliated with, endorsed by, or derived from any commercial program, and contains none of anyone's course content. The linked input sources are third-party and listed for convenience only.

## The idea being modelled

The interesting design constraint is that the app **removes choice**:

- Each day prescribes its work. You don't pick.
- **Output is locked shut until day 90.** Not discouraged — absent. Half the programme is input-only.
- Targets ramp rather than starting heroic, because the usual failure is a huge week one and then nothing.

Four phases across 200 days: Calibration (1–28), Silent Input (29–89), First Voice (90–119), Consolidation (120–200).

## Running it

Deployed to GitHub Pages on every push to `main`; `npm run check` gates the deploy. Or locally:

```bash
npm install
npm run dev
```

Use the **preview day slider** in the sidebar to jump around the 200 days — that's the fastest way to see how the protocol changes shape, especially either side of day 90.

```bash
npm run check
```

Runs the assert-based self-check over the two pieces of non-trivial logic: day gating and the SRS scheduler. No test framework.

## Layout

| File | What lives there |
| --- | --- |
| `src/protocol.ts` | Phases, day gating, daily targets, the task prescription |
| `src/srs.ts` | SM-2 scheduler, ease/interval clamps, the daily new-card budget |
| `src/store.ts` | localStorage-backed state and the review session queue |
| `src/deck.ts` | Frequency-ordered seed vocabulary |
| `src/library.ts` | Graded catalogue of free input sources |
| `src/selfcheck.ts` | The runnable check |

State is entirely local — no backend, no accounts, nothing leaves the browser.

## Notes

Two bugs the self-check and browser verification caught during the build, both worth knowing about if you touch the scheduler:

- **Intervals compound.** Without a ceiling, ~40 consecutive "easy" grades overflow `Date` and throw. Capped at 100 years.
- **The new-card allowance is a daily budget**, not a queue depth. Refilling it from the unseen pool on every render means a session never ends.
