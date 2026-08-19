// Which topic a /course request is for, read from the path.
//
// The gate lives in app/course/layout.tsx, and a layout is given no part of the
// URL, so the path arrives as the `x-pathname` header middleware.ts stamps. That
// is the same mechanism app/lib/topic-part-route.ts uses for the chrome.
//
// WHY THIS IS NOT topic-part-route.ts, WHICH ALREADY PARSES THIS PATH
//
// activeTopicPart returns null for four different situations: a missing header,
// a path with no `topic` segment, a valid topic path with no part (the doorway),
// and an unrecognised part. Collapsing them is exactly right for chrome, where
// every one of those cases renders no indicator and the worst outcome is a
// missing decoration.
//
// It is wrong for a gate. "This is the topic doorway, decide on the topic" and
// "I could not read this path at all" have to be different answers, because one
// of them must let an entitled visitor through and the other must let nobody
// through. A single null cannot carry both, and a gate written on top of one
// would either deny the doorway to everyone or grant an unreadable path to
// everyone. So this returns a discriminated result instead.
//
// The PART is deliberately not returned. Every route in the tree requires the
// same capability, so the only questions are which topic and whether the path
// could be read.
//
// Imports nothing, same reason as topic-part-route.ts: the parsing is faultable
// in a harness with no browser and no server.

export type CoursePath =
  | { kind: "topic"; courseId: string; topicId: string }
  /** The path could not be read. The caller must DENY on this, not fall back. */
  | { kind: "unreadable" };

/**
 * /course/{test}/{subject}/unit/{unit}/topic/{topicId}[/{part}]
 *
 * courseId is `${test}-${subject}`, which is how every read of
 * curriculum_topics keys it (see topic-data.ts).
 */
export function parseCoursePath(pathname: string | null | undefined): CoursePath {
  if (!pathname) return { kind: "unreadable" };

  // middleware stamps pathname + search, so the query is trimmed before
  // matching. A hash never reaches the server, but it costs nothing to be
  // indifferent to it.
  const path = pathname.split("?")[0].split("#")[0];
  const segments = path.split("/").filter(Boolean);

  if (segments[0] !== "course") return { kind: "unreadable" };

  // Matched by POSITION FROM THE START, anchored on the literal segments, rather
  // than by searching for "topic". Searching would accept
  // /course/x/y/topic/topic/z and would accept a path whose subject segment
  // happened to be "unit". The shape is fixed, so it is asserted.
  const [, test, subject, unitLiteral, , topicLiteral, topicId] = segments;

  if (unitLiteral !== "unit" || topicLiteral !== "topic") return { kind: "unreadable" };
  if (!test || !subject || !topicId) return { kind: "unreadable" };

  // The same shapes the route schemas already enforce. A topic id that cannot
  // appear in the database cannot be entitled, and letting one through would
  // hand an arbitrary string to the free-sample comparison.
  if (!/^[a-z0-9-]+$/.test(test)) return { kind: "unreadable" };
  if (!/^[a-z0-9-]+$/.test(subject)) return { kind: "unreadable" };
  if (!/^[A-Za-z0-9.]+$/.test(topicId)) return { kind: "unreadable" };

  return { kind: "topic", courseId: `${test}-${subject}`, topicId };
}
