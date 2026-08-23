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

function choiceEntries(choices: Record<string, string>) {
  return Object.entries(choices).sort(([a], [b]) => a.localeCompare(b));
}

// Long options wrap badly in two columns. Measured on the rendered string with
// tags stripped, so a KaTeX-heavy choice -- visually short, textually enormous
// -- is not misjudged as long.
function tooWideForTwoColumns(choices: Record<string, string>): boolean {
  const lengths = Object.values(choices).map((html) => html.replace(/<[^>]+>/g, '').length);
  return lengths.length > 0 && Math.max(...lengths) > 34;
}

export function WorksheetSheet({
  title,
  items,
  created,
  topicMeta,
}: {
  title: string;
  items: PrintItem[];
  created: string;
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
      <header className="ws-head">
        <div>
          <h1 className="ws-title">{title}</h1>
          <p className="ws-sub">
            TSIA2 Math Practice · {items.length} question{items.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="ws-fields">
          <span>
            Name<i className="ws-rule" />
          </span>
          <span>
            Date<i className="ws-rule" />
          </span>
        </div>
      </header>

      {groups.map((group) => (
        <section key={group.topic_id}>
          <h2 className="ws-topic-head">
            <span className="ws-topic-id">{group.topic_id}</span>
            <span className="ws-topic-name">{topicMeta[group.topic_id]?.topic_name ?? ''}</span>
          </h2>
          {group.entries.map(({ item, n }) => (
              <article className="ws-q" key={`${item.topic_id}-${n}`}>
                <div className="ws-n">{n}.</div>
                <div className="ws-body">
                  <div className="ws-stem" dangerouslySetInnerHTML={{ __html: item.stem_html }} />
                  <ul className={`ws-choices${tooWideForTwoColumns(item.choices_html) ? ' wide' : ''}`}>
                    {choiceEntries(item.choices_html).map(([letter, html]) => (
                      <li className="ws-choice" key={letter}>
                        <span className="ws-letter">{letter})</span>
                        <span dangerouslySetInnerHTML={{ __html: html }} />
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
          ))}
        </section>
      ))}

      <footer className="ws-foot">
        <span>UnpackMath · app.unpackmath.com</span>
        <span>{created}</span>
      </footer>
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
      <header className="ws-head">
        <div>
          <h1 className="ws-title">{title}</h1>
          <p className="ws-sub">Answer key · teacher copy</p>
        </div>
        <div className="ws-fields">
          <span>{items.length} questions</span>
          <span>{created}</span>
        </div>
      </header>

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
                    ? ` \u00b7 ${topicMeta[item.topic_id].topic_name}`
                    : ''}
                </p>
                <div className="ws-key-stem" dangerouslySetInnerHTML={{ __html: item.stem_html }} />
              </div>
              <div className="ws-correct">{item.correct_answer || '—'}</div>
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
              <div className="ws-solution" dangerouslySetInnerHTML={{ __html: item.solution_html }} />
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
                Generated variant — the correct answer is exact, but the worked
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

      <footer className="ws-foot">
        <span>UnpackMath · answer key · not for student distribution</span>
        <span>{created}</span>
      </footer>
    </div>
  );
}
