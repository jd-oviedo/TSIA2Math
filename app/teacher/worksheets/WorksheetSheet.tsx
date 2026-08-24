import { Fragment } from 'react';
import type { PrintItem, KeyItem } from '@/app/lib/worksheet-source';
import type { TopicMeta, Rationale } from './worksheet-data';

// The paper itself, as pure presentation.
//
// Split out of the print routes so the markup has no data access in it at all:
// these components receive resolved items and render them, and the routes
// decide WHICH resolver ran. That is the boundary that keeps the answer key's
// data path from drifting into the worksheet's -- a component that cannot fetch
// cannot fetch the wrong thing.
//
// It also makes the sheets renderable outside Next, which is how the print
// layout gets checked against real content without a browser session.
//
// EVERY PART SHARES ONE MASTHEAD AND ONE FOOTER. <SheetHead> and <SheetFoot> are
// written once here and used by every part, which is the other half of the
// promise print-styles.ts makes: the parts cannot drift because they are not
// separate implementations. That is what keeps the disclaimer identical on all
// of them.

const WORDMARK = '/unpackmath-wordmark.png';

// AUDIT ENTRY 7. Verbatim, and the wording IS the requirement: it has to read
// "or endorsed by", and it has to name both College Board and ACCUPLACER. A
// paraphrase does not satisfy it, which is why this is one constant rendered by
// <SheetFoot> rather than a line written into each part -- four copies is four
// chances for one of them to be reworded by someone being helpful.
//
// It prints on every part, below the unpackmath.com and page-number row, on its
// own full-width line. At 7.5pt in the body face it measures well inside the
// 7.2in content box; the mockup's monospace footer face does not fit it at any
// legible size, which is why it does not share row one's font.
const DISCLAIMER =
  'Not affiliated with or endorsed by College Board or ACCUPLACER. ' +
  'TSIA2 is a trademark of its respective owner. Practice materials only.';

// The four strand tints, as used on the teacher dashboard and the demo. Fill
// only, with Deep Midnight text on top -- these are pale enough to carry black
// at print contrast, which is why they can be a fill rather than an ink.
//
// Sky Blue is the fallback rather than a grey: a topic whose strand did not
// resolve should still look like a labelled topic.
const STRAND_TINT: Record<string, string> = {
  QR: '#B5D4F4',
  AR: '#9FE1CB',
  GR: '#FAC775',
  PR: '#CECBF6',
};
const STRAND_FALLBACK = '#87CEEB';

/**
 * The tint for a topic's chip.
 *
 * related_strand is the authority, but the topic id opens with the same two
 * letters and is on every stored reference, so it is the fallback when the
 * meta lookup missed. A worksheet printed while curriculum_topics_public was
 * unreachable still gets its strand colours right.
 */
function strandTint(topicId: string, meta: TopicMeta | undefined): string {
  const fromMeta = (meta?.strand ?? '').trim().toUpperCase();
  if (STRAND_TINT[fromMeta]) return STRAND_TINT[fromMeta];
  const fromId = topicId.split('.')[0].toUpperCase();
  return STRAND_TINT[fromId] ?? STRAND_FALLBACK;
}

function choiceEntries(choices: Record<string, string>) {
  return Object.entries(choices).sort(([a], [b]) => a.localeCompare(b));
}

function SheetHead({ heading, meta }: { heading: string; meta: string }) {
  return (
    <header className="ws-head">
      <div>
        <h1 className="ws-title">{heading}</h1>
        <p className="ws-meta">{meta}</p>
      </div>
      {/* A plain img, not next/image. This page is printed, so it wants the
          asset at its natural resolution with no srcset negotiation and no
          layout box to settle after paint. */}
      <img className="ws-mark" src={WORDMARK} alt="UnpackMath" />
    </header>
  );
}

function SheetFoot({ marker, page }: { marker?: string; page: string }) {
  return (
    <footer className="ws-foot">
      <div className="ws-foot-row">
        <span>unpackmath.com</span>
        <span className="ws-foot-mark">
          {marker ? <span>{marker}</span> : null}
          <span>{page}</span>
        </span>
      </div>
      <p className="ws-disclaimer">{DISCLAIMER}</p>
    </footer>
  );
}

export function WorksheetSheet({
  title,
  items,
  topicMeta,
}: {
  title: string;
  items: PrintItem[];
  topicMeta: Record<string, TopicMeta>;
}) {
  // Numbered first, grouped second. The obvious shape -- a `let n` incremented
  // inside the render tree -- reassigns a variable across a render pass, which
  // the React compiler rejects and which would give wrong numbers the moment
  // this component re-rendered partially. The number is a property of the item's
  // position in the stored order, so it is computed from that.
  const numbered = items.map((item, i) => ({ item, n: i + 1 }));

  const groups: { topic_id: string; entries: typeof numbered }[] = [];
  for (const entry of numbered) {
    const last = groups[groups.length - 1];
    if (last && last.topic_id === entry.item.topic_id) last.entries.push(entry);
    else groups.push({ topic_id: entry.item.topic_id, entries: [entry] });
  }

  return (
    <div className="ws-sheet">
      <section className="ws-part ws-part-questions">
        {/* The teacher's own title, not a hardcoded "Practice Worksheet". The
            builder defaults it to exactly that, so an untouched worksheet
            reproduces the approved mockup and a named one prints its name. */}
        <SheetHead
          heading={title}
          meta={`TSIA2 · MATH · ${items.length} QUESTION${items.length === 1 ? '' : 'S'}`}
        />

        <div className="ws-fields">
          <div className="ws-field">
            NAME<span className="ws-field-rule" />
          </div>
          <div className="ws-field ws-field-date">
            DATE<span className="ws-field-rule" />
          </div>
        </div>

        {/* The eyebrows and the questions are siblings in the column flow rather
            than each group being its own block. A wrapper per topic would be an
            unbreakable-ish box the columns have to balance around; flat children
            let the flow break wherever it likes, which is what keeps the two
            columns even. */}
        <div className="ws-flow">
          {groups.map((group) => {
            const meta = topicMeta[group.topic_id];
            return (
              <Fragment key={group.topic_id}>
                <div className="ws-eyebrow">
                  <span
                    className="ws-eyebrow-chip"
                    style={{
                      background: strandTint(group.topic_id, meta),
                      borderColor: strandTint(group.topic_id, meta),
                    }}
                  >
                    {group.topic_id}
                  </span>
                  {meta?.topic_name ? (
                    <span className="ws-eyebrow-name">{meta.topic_name}</span>
                  ) : null}
                </div>

                {group.entries.map(({ item, n }) => (
                  <article className="ws-q" key={`${item.topic_id}-${n}`}>
                    <div className="ws-stem">
                      <span className="ws-n">{n}.</span>
                      <div
                        className="ws-stem-text"
                        dangerouslySetInnerHTML={{ __html: item.stem_html }}
                      />
                    </div>
                    <ul className="ws-choices">
                      {choiceEntries(item.choices_html).map(([letter, html]) => (
                        <li className="ws-choice" key={letter}>
                          <span className="ws-letter">{letter}</span>
                          <span
                            className="ws-choice-text"
                            dangerouslySetInnerHTML={{ __html: html }}
                          />
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </Fragment>
            );
          })}
        </div>

        <SheetFoot page="01" />
      </section>
    </div>
  );
}

// TWO PARTS, NOT THREE. The key prints the Answer Key and the Rationales and
// stops.
//
// It used to carry a third part, Teacher Notes: one card per item with the
// worked solution and a "What the wrong answers mean" panel. On the regression
// fixture that was fourteen of the key's sixteen pages, for twenty questions.
// It is removed as a RENDERING, not as data. resolveForKey() still reads
// worked_solutions and distractor_prose, because the correct option's prose IS
// the rationale on part two, and nothing about the answer-key data path changes.
//
// `topicMeta` is gone from the props with the notes card that used it. The key
// route no longer needs the lookup at all; the worksheet route still does, so
// loadTopicMeta() stays where it is.
export function AnswerKeySheet({
  title,
  items,
  created,
  rationales,
}: {
  title: string;
  items: KeyItem[];
  created: string;
  rationales: Rationale[];
}) {
  return (
    <div className="ws-sheet">
      {/* ── page 2, the key itself ────────────────────────────────────────────
          A compact grid, not the per-question cards. This is the page a teacher
          holds while marking a stack of twenty, so it answers exactly one
          question per cell and fits the whole sheet in a glance. The reasoning
          lives on the two parts after it. */}
      <section className="ws-part ws-part-key">
        <SheetHead
          heading="Answer Key"
          meta={`${title} · ${items.length} QUESTIONS · ${created}`}
        />
        <ul className="ws-key-grid">
          {items.map((item, i) => (
            <li className="ws-key-cell" key={`key-${item.topic_id}-${i}`}>
              <span className="ws-key-n">{i + 1}.</span>
              <span className="ws-key-letter">{item.correct_answer || '?'}</span>
            </li>
          ))}
        </ul>
        <SheetFoot marker="KEY" page="02" />
      </section>

      {/* ── page 3, the rationales ───────────────────────────────────────────
          Why the correct choice is correct, one line each. See buildRationales
          for why this reads distractor_prose and not the worked solutions. */}
      <section className="ws-part ws-part-rationales">
        <SheetHead heading="Rationales" meta={`${title} · ${items.length} QUESTIONS`} />
        <ul className="ws-rats">
          {rationales.map((rat) => (
            <li className="ws-rat" key={`rat-${rat.n}`}>
              <span className="ws-rat-n">{rat.n}.</span>
              <span className="ws-rat-text">
                {rat.html ? (
                  <>
                    <strong>Choice {rat.letter || '?'} is correct:</strong>{' '}
                    <span dangerouslySetInnerHTML={{ __html: rat.html }} />
                  </>
                ) : (
                  /* Said out loud rather than left as a blank row. A rolled
                     instance has different numbers from the authored prose, so
                     the stored sentence would be arithmetically wrong for it
                     while reading as perfectly authoritative. */
                  <span className="ws-rat-missing">
                    {rat.generated
                      ? `Choice ${rat.letter || '?'} is correct. Generated variant, so the authored rationale is not shown.`
                      : `Choice ${rat.letter || '?'} is correct. No rationale stored for this item yet.`}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <SheetFoot marker="RATIONALES" page="03" />
      </section>

    </div>
  );
}
