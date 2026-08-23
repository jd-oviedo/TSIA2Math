import { Fragment } from 'react';
import type { PrintItem, KeyItem } from '@/app/lib/worksheet-source';
import type { TopicMeta } from './worksheet-data';

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
// EVERY PART IS A <SheetPart>. The masthead, the wordmark and the footer are
// written once here and used by all three, which is the other half of the
// promise print-styles.ts makes: the three parts cannot drift because they are
// not three implementations.

const WORDMARK = '/unpackmath-wordmark.png';

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

export function AnswerKeySheet({
  title,
  items,
  created,
  topicMeta,
}: {
  title: string;
  items: KeyItem[];
  created: string;
  topicMeta: Record<string, TopicMeta>;
}) {
  return (
    <div className="ws-sheet">
      <section className="ws-part ws-part-key">
        <SheetHead
          heading="Answer Key"
          meta={`${title} · ${items.length} QUESTIONS · ${created}`}
        />

        {items.map((item, i) => {
          const n = i + 1;
          const wrong = item.notes.filter((note) => !note.correct);
          const right = item.notes.find((note) => note.correct);
          return (
            <article className="ws-key-q" key={`${item.topic_id}-${n}`}>
              <div className="ws-key-head">
                <div className="ws-n">{n}.</div>
                <div className="ws-key-body">
                  <p className="ws-key-topic">
                    {item.topic_id}
                    {topicMeta[item.topic_id]?.topic_name
                      ? ` · ${topicMeta[item.topic_id].topic_name}`
                      : ''}
                  </p>
                  <div
                    className="ws-key-stem"
                    dangerouslySetInnerHTML={{ __html: item.stem_html }}
                  />
                </div>
                <div className="ws-correct">{item.correct_answer || '?'}</div>
              </div>

              {right && (
                <div className="ws-solution">
                  <p>
                    {/* A colon, not a full stop. The authored prose is a verb
                        phrase with an implied subject -- "subtracts 9 from both
                        sides" -- so a full stop reads as a sentence starting
                        lowercase. A colon makes the label a label and the phrase
                        its complement, without rewriting 1,344 strings. */}
                    <strong>Why {item.correct_answer} is right:</strong> {right.text}
                  </p>
                </div>
              )}

              {item.solution_html && (
                <div
                  className="ws-solution"
                  dangerouslySetInnerHTML={{ __html: item.solution_html }}
                />
              )}

              {wrong.length > 0 && (
                <div className="ws-notes">
                  <p className="ws-notes-label">What the wrong answers mean</p>
                  {wrong.map((note) => (
                    <p className="ws-note" key={note.letter}>
                      {/* The letter is its own element so it can hold a column
                          while the sentence wraps beside it. Same text
                          distractorLine() produces -- one extractor, in
                          resolveForKey(). */}
                      <span className="ws-note-letter">Chose {note.letter}</span>
                      <span>{note.text}</span>
                    </p>
                  ))}
                </div>
              )}

              {/* A rolled instance carries no prose: the authored explanation names
                  the canonical numbers and would be arithmetically wrong for this
                  variant. Said out loud rather than left as a gap. */}
              {item.ref.source === 'instance' && item.notes.length === 0 && (
                <p className="ws-caveat">
                  Generated variant. The correct answer is exact, but the worked
                  solution and misconception notes are written for the original
                  numbers and are not shown.
                </p>
              )}

              {item.ref.source === 'static' && item.notes.length === 0 && !item.solution_html && (
                <p className="ws-caveat">No worked solution stored for this item yet.</p>
              )}
            </article>
          );
        })}

        <SheetFoot marker="KEY" page="02" />
      </section>
    </div>
  );
}
