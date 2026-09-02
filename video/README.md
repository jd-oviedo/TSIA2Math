# Add a roster demo video

A programmatic explainer built with Remotion. Every frame is composed from
React components; nothing here is a screen recording or a screenshot.

**All names, emails, sign-in codes, and join codes in this video are fabricated
demo data** (see `src/demo-data.ts`). They authenticate nothing and must never
be replaced with values from a real account.

## Compositions

| id | size | use |
|---|---|---|
| `AddRoster-16x9` | 1920x1080, 30 fps | YouTube, docs, email |
| `AddRoster-9x16` | 1080x1920, 30 fps | Reels, Shorts, TikTok |

Both share the same scenes; `src/layout.ts` decides where the screen viewport
and captions sit for each aspect ratio.

## Commands

Run from this `video/` folder.

```bash
npm install
npm run dev            # Remotion Studio, scrub every frame
npm run check          # demo-data guard (fabricated codes, @district.edu, no em dashes, no image imports)
npm run lint           # eslint + tsc
```

Render:

```bash
npx remotion render AddRoster-16x9 out/add-roster-16x9.mp4
npx remotion render AddRoster-9x16 out/add-roster-9x16.mp4
```

Export the two credential-check stills before a full render:

```bash
npm run stills
```

They land in `out/stills/`. Eyeball them: every code is fabricated, every name
is a demo name, the domain is `@district.edu`, no district is named.

## Files

- `src/demo-data.ts` fabricated students, teacher, class, join code
- `src/timeline.ts` scene order and lengths in frames
- `src/scenes/` one component per scene
- `src/ui/` the dashboard, modal, sign-in page and student home, rebuilt as flat components
- `src/components/` camera (`Screen`), cursor, captions, progress bar, wordmark
- `narration.txt` voice-over script, timed to the captions
