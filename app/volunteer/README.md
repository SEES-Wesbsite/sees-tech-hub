# Volunteer recruitment

Public route: /volunteer. The page follows the existing light campaign palette, Geist (temporary preview) / Playfair Display typography, Instrument Serif for the deadline day, supplied STH logo, and restrained interactions.

## Application window

- Form: https://forms.gle/g8Soucwzh3hiXfBf6
- Deadline: Sunday, October 18, 2026 at 11:59 PM WAT.
- Exact cutoff: 2026-10-18T23:59:00+01:00 (22:59 UTC).
- Source of truth: recruitment.ts.
- Fresh server rendering establishes the initial time and closed state.
- One shared client timer drives the live countdown, status, both CTAs, and closing copy.
- At the cutoff the timer disappears and both application links become disabled buttons.
- Returning to the tab and clicking an application link recheck the cutoff.
- The page controls its own CTAs; it does not change the external Google Form's response settings. The form owner must close responses separately if direct submissions must also stop.

The homepage and volunteer page share the deep-green footer. Volunteer entrances use Motion once at 30% visibility and respect reduced-motion preferences. The app uses a forced light theme. The DataCamp route is unchanged. No new dependencies or database access.

## Verification

Run npx tsc --noEmit, focused ESLint, and node --experimental-strip-types --test tests/volunteer.test.mjs. Deadline tests cover the Lagos/UTC conversion, unit carries, and exact before/at/after closing boundaries.
