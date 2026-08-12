# Deferred: the item bank's `unit` field disagrees with the curriculum Unit Map

Opened 2026-08-12, alongside the first curriculum authoring batch (PR "curriculum
Round 1-4, twelve AR/GR/PR topics"). Found while resolving where those twelve
topics belong, and deliberately left out of that PR. Companion to
`deferred-figure-and-notation-passes.md`: work that is scoped out rather than
broken.

---

## What was found

Three sources carry a unit placement for a topic, and they do not all agree.

| Source | What it is | Covers |
|---|---|---|
| The Unit Map | The curriculum taxonomy's unit assignment, six units numbered 0 to 5, supplied by Juan | all 97 topics |
| `curriculum_topics.unit_number` | The live column the app reads and orders by | 6 authored QR topics, now 18 |
| `data/items/**/*.json` -> `unit` | A field on every CAT bank item | all 97 topics |

The bank's `unit` field disagrees with the Unit Map on **47 of 97 topics**.

Where the database and the Unit Map overlap they **agree**: all six previously
authored QR topics sit at `unit_number` 1, which is where the map puts them. So
the disagreement is bank-versus-map, never database-versus-map, and no live row
had to be corrected.

That is why the map won for this batch. The decision is recorded here rather
than inferred from the commit.

## The 47

Two of them are live topics: **QR.2.1** and **QR.3.5** are unit 1 in both the
map and the database, and unit 2 in the bank.

Six of them were in this authoring batch:

| Topic | Unit Map | Item bank |
|---|---|---|
| AR.1.1 | 0 | 5 |
| AR.2.1 | 2 | 3 |
| GR.2.1 | 3 | 2 |
| PR.2.1 | 5 | 4 |
| PR.3.1 | 5 | 4 |
| PR.4.1 | 5 | 4 |

The remaining 39: AR.1.2, AR.1.3, AR.1.4, AR.1.5, AR.2.2, AR.2.3, AR.2.4,
AR.2.5, AR.2.6, AR.2.7, AR.2.8, GR.1.3, GR.2.2, GR.2.3, GR.2.4, PR.1.3, PR.1.4,
PR.1.5, PR.2.2, PR.2.3, PR.2.4, PR.3.2, PR.3.3, PR.3.4, PR.4.2, PR.4.3, PR.4.4,
QR.1.7, QR.1.8, QR.2.2, QR.2.3, QR.2.4, QR.2.5, QR.2.6, QR.2.7, QR.2.8, QR.4.1,
QR.4.2, QR.4.3.

Reproduce the comparison against the map at the top of this file with a walk of
`data/items/*/*.json`, reading `unit` off the first item of each topic file. The
field is internally consistent: all 97 topics carry one, every item within a
topic agrees with its siblings, and the values run 0 to 5, the same range the map
uses.

## Why the bank's version looks like the older one

Its unit composition does not read like a rival taxonomy so much as a coarser
draft of the same one:

```
bank unit 0:  7  GR.1.1 GR.1.2 PR.1.1 PR.1.2 QR.1.5 QR.1.6 QR.3.8
bank unit 1:  5  QR.1.1 QR.1.2 QR.1.3 QR.1.4 QR.3.1
bank unit 2: 17  GR.2.1-2.4 + QR.2.1-2.7 + QR.3.2-3.7
bank unit 3: 22  AR.1.5 AR.2.1-2.6 GR.2.5-2.7 GR.3.x GR.4.x QR.4.1-4.3
bank unit 4: 34  all AR.3.x and AR.4.x + all PR.1.3 through PR.4.4
bank unit 5: 12  AR.1.1-1.4 AR.2.7 AR.2.8 GR.1.3 PR.2.5 PR.3.5 QR.1.7 QR.1.8 QR.2.8
```

Bank unit 4 merges advanced AR with the whole PR strand, which the map splits
into units 4 and 5. Bank unit 5 is a 12-topic mixed bag whose members the map
distributes across units 0, 2 and 5, and it reads like an unassigned bucket
rather than a named unit. That is inference from the shape of the data, not a
provenance record, so it is written down as a reading rather than a finding.

## Why this is not urgent

**Nothing in the curriculum read path reads the bank's `unit` field.** The
ordering that drives the Modules tree, the unit progress bars, the topic-to-topic
Next and Previous sequence, and the dashboard's start-here card all come from
`curriculum_topics.unit_number` via `getTopics()` in
`app/lib/curriculum-progress.ts`. The adaptive test selects on strand and
difficulty, not on unit.

So the drift is latent. It becomes a live problem only if something starts
joining the two datasets on unit, or if a future authoring batch takes its unit
placements from the bank instead of the map.

## What closing it would take

Rewriting `unit` across 47 topic files in `data/items/`, then rebuilding the
published bank (`scripts/build_bank.py`, then the `question_bank.json` artifacts).
That is a CAT item bank change, which the curriculum authoring brief explicitly
scoped out, so it needs its own pass and its own review.

The cheaper half is worth considering first: decide whether the bank's `unit`
field should exist at all. If nothing reads it and the Unit Map is the single
source of truth for placement, a field that can only drift out of agreement is a
liability rather than an asset, and deleting it closes this permanently.

## Open questions for that pass

1. Is the Unit Map authoritative over the bank for all 97 topics, or only for the
   ones with authored curriculum? This batch assumed the former.
2. Should `data/items/**` keep a `unit` field at all, given nothing reads it?
3. Unit **names** exist in the map ("Foundations", "Linear Relationships",
   "Geometry and Spatial Reasoning", "Advanced Algebraic Reasoning",
   "Probabilistic and Statistical Reasoning") and exist nowhere in the repo. The
   UI prints `Unit {unitNumber}`, so a seeded unit 0 renders as "Unit 0". Giving
   units their names needs a source of truth, either a lookup in code or a new
   table, and is a separate piece of work from this drift.
