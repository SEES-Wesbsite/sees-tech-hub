# DataCamp campaign design

Approved 2026-09-11. This direction applies to `/datacamp`; the main homepage retains its existing design.

- Predominantly light, using the campaign colour tokens in `app/globals.css`.
- Keep the existing content hierarchy and generous whitespace. Subtle grid details and serif emphasis on “On Us.” provide the visual accents. The hero has no stock photography.
- Headline words enter at 70ms intervals; the short closing phrase within the headline cascades by letter. Content remains visible in the server-rendered HTML.
- Scroll entrances use a small forward movement in perspective, once per section. Smaller screens use less movement; reduced-motion preferences disable entrances.
- FAQs animate height and opacity, allow at most one open answer, and can all be closed. Buttons expose their state and support normal keyboard activation. A no-JavaScript fallback displays all answers.
- Application is the primary action. The three steps use connected, numbered action rows, with social buttons, a WhatsApp button, and the application button placed beside their instructions. All external destinations open in a new tab.
- The full-width dark green footer groups Explore and Connect links, provides a WhatsApp invitation, and ends with copyright and back-to-top links.

## Launch configuration

`links.ts` is the source for all destinations. The Google Form, LinkedIn, Instagram, and X URLs are connected. WhatsApp matches the existing homepage. Registration currently uses `/login`.

Applications are reviewed on a rolling basis. Every applicant receives their outcome by email. Each scholarship provides one full year of DataCamp access.

## Design reference

The application guide draws on the action grouping and single-column layout in [Mobbin’s stacked-list examples](https://mobbin.com/glossary/stacked-list), reviewed on 2026-09-11. It is an informational guide; it does not claim to track completion of external actions.

The previously used stock photograph was removed at the user’s request. The supplied STH and DataCamp logo artwork is retained unmodified.
