// Which part of a topic a request is on, read from the path.
//
// The chrome bar lives in the topic LAYOUT, and a layout is given no part of the
// URL. Each page knows its own section -- lesson/page.tsx passes 'lesson' to
// loadNavigation, practice passes 'practice' -- but that is below the chrome and
// cannot reach it.
//
// So the path arrives as the `x-pathname` header stamped by middleware.ts, which
// exists because #135 needed the same thing for the sign-in redirect. This turns
// it into a part, and it is a separate pure function so the parsing can be tested
// and faulted without a browser.
//
// RETURNS NULL FOR THE DOORWAY, ON PURPOSE. /topic/{id} with no part is the
// overview, and the overview owns position on its own route: it already renders
// the three parts with their state. An indicator there would be a control
// describing nothing, sitting above a panel that says it better.
//
// RETURNS NULL FOR ANYTHING IT CANNOT READ, also on purpose. A missing or
// unrecognised header renders no indicator, which is exactly the chrome as it
// shipped before this. Degrading to today beats degrading to a bar that claims
// the wrong part.
//
// Imports nothing, same reason as attempt-sets.ts.

export type TopicPart = 'lesson' | 'practice' | 'quiz';

const PARTS: readonly TopicPart[] = ['lesson', 'practice', 'quiz'];

// middleware stamps pathname + search, so the query is trimmed before matching.
// A hash never reaches the server, but it costs nothing to be indifferent to it.
export function activeTopicPart(pathname: string | null | undefined): TopicPart | null {
  if (!pathname) return null;

  const path = pathname.split('?')[0].split('#')[0];
  const segments = path.split('/').filter(Boolean);

  // The part is the segment immediately after the topic id, and the topic id is
  // the one immediately after "topic". Matching on position from the END would
  // be shorter and would be wrong: /topic/lesson is a topic whose id is
  // "lesson", not a lesson page.
  const at = segments.indexOf('topic');
  if (at === -1) return null;

  const part = segments[at + 2];
  if (!part) return null;

  return (PARTS as readonly string[]).includes(part) ? (part as TopicPart) : null;
}
