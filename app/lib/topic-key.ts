// The key every per-topic map in the codebase is keyed by.
//
// Four characters of string concatenation in a file of its own, for the reason
// attempt-sets.ts and topic-completion.ts are also files of their own: it
// imports NOTHING, so a pure reducer that needs to look a topic up can do it
// without pulling in curriculum-progress.ts and, through it, the admin Supabase
// client. That is the difference between a module `node --test` can load and one
// it cannot.
//
// curriculum-progress.ts re-exports this, so every existing import site is
// unchanged and there is still exactly one definition of the key.
export function topicKey(courseId: string, topicId: string): string {
  return `${courseId}:${topicId}`;
}
