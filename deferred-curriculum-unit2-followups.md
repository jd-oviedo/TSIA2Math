# Deferred: follow-ups from the Unit 2 round

Opened 2026-08-14, alongside the fourteen-topic batch that completed Unit 2 (PR
"curriculum Unit 2, fourteen QR and AR topics"). Both items were found during
that round and deliberately left out of it. Companion to
`deferred-curriculum-unit1-followups.md`,
`deferred-curriculum-round5-followups.md` and `deferred-curriculum-unit-map.md`:
work that is scoped out rather than broken.

---

## 1. The curriculum source path is documented wrong, and has been for three units

Every authoring brief so far has given the source location as

```
data/curriculum/unit-{N}/{TOPIC_ID}.md
```

The real location is

```
curriculum/source/tsia2-math/unit-{N}/{TOPIC_ID}.md
```

This has now been stated incorrectly for Unit 0, Unit 1 and Unit 2. It has been
caught and corrected at the start of each session, so no wrong file has ever
been written, but it costs a discovery step every time and it is the sort of
thing that eventually gets believed rather than checked.

**Where the fix belongs.** Not in this repo. Searching the tree for
`data/curriculum` returns **nothing**: no script, no doc, no comment uses that
path. Every in-repo reference is already correct, including
`curriculum/migrations/upload_curriculum.py`, which derives the directory as
`Path(__file__).parent.parent / 'source' / course_id`, and the four docs that
mention the real path directly.

So the error lives only in the authoring brief template that Juan writes the
session prompts from. The repo is already a reliable source of truth for this,
and correcting the template is the whole fix.

**Why the path is what it is**, for whoever edits the template: the directory is
`curriculum/source/<course_id>/unit-<N>/`, and the `<course_id>` segment is load
bearing rather than decorative. `upload_course_curriculum(course_id)` builds the
path from its argument, so a second course would live beside `tsia2-math` rather
than in a shared folder. Flattening it to `data/curriculum/unit-N/` would remove
the level that makes the uploader multi-course.

**Not urgent.** No action was taken this round, and none is needed in the repo.

---

## 2. `next dev` cannot survive a Playwright run on this Codespace

Found while running the Unit 2 spot-check. Recorded because the next unit will
hit it again and the diagnosis took a while.

The Codespace has 7.8 GB of RAM, **no swap**, and 2 CPUs, and VS Code's own
server holds roughly a third of it. Against that, `next dev` with Turbopack
compiles a route on first request at a cost large enough to be fatal: the topic
lesson route takes 24 to 25 seconds to compile and the process is killed part
way through compiling the second route of the same topic. Adding a Chromium
instance on top makes it certain.

Two symptoms it produces, neither of which looks like a memory problem:

- **Every topic route returns 404**, including topics that are live and were
  serving 200 minutes earlier, while `/` still returns 200. This is a stale
  Turbopack cache in `.next/`, and it is cleared by removing that directory.
  It looks exactly like a content or routing fault and is neither. The same
  symptom appeared in the Unit 1 session and was misdiagnosed then as
  first-boot cache compaction.
- **Playwright reports `Target crashed` or `ERR_CONNECTION_REFUSED`** mid-run,
  because the server died rather than because the page is broken.

**What works.** Build once and serve the built output:

```
npx next build          # succeeds with NODE_OPTIONS=--max-old-space-size=3072
npx next start -p 3000  # then run the spec against this
```

`next start` serves precompiled routes and leaves enough headroom for Chromium.
The Unit 2 spot-check passed 91 of 91 assertions this way after failing entirely
against `next dev`.

One further constraint worth knowing: a background dev server does not outlive
the foreground command that waited on it, so the server and the test have to be
started inside a single invocation.

**What closing it would take.** Nothing in the app. This is an environment note,
and the practical fix is to use `next build` plus `next start` for any
browser-driven verification from now on, rather than `next dev`.
