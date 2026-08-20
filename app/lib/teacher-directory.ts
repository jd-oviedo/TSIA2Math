import type { SupabaseClient } from "@supabase/supabase-js";
import { displayName } from "./auth";

// The auth.users lookup shared by the roster route and the CSV exports.
//
// Lifted verbatim out of app/api/teacher/roster/route.ts rather than rewritten,
// because the export is required to reuse the roster's reads and not to
// reimplement them. The pagination below is the load-bearing part and the
// reason this is worth sharing at all: GoTrue's listUsers() returns one page at
// a time and defaults to 50 per page, so the original unpaginated call meant
// every user past the first 50 in the project rendered with a blank email and
// "??" initials. A CSV that silently drops a student's name is the same defect
// with a longer half-life, because the file outlives the page view.
//
// Emails and names live only in auth.users. profiles carries an `email` column
// as of the current schema, but no name column, and the OAuth display name is
// in user_metadata, so auth.users remains the only source that answers both.
// That makes this O(users in project) to build a map for one class. Worth
// revisiting if it ever gets slow: per-student lookups are O(class size) but
// cost a round trip each, which is the worse trade at present sizes.

/** GoTrue's per-page ceiling. One request for any project that fits in it. */
const USERS_PAGE_SIZE = 1000;

export type DirectoryUser = { email: string; name: string };

export async function usersById(
  admin: SupabaseClient
): Promise<Map<string, DirectoryUser>> {
  const map = new Map<string, DirectoryUser>();

  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: USERS_PAGE_SIZE,
    });

    if (error) throw error;

    const users = data?.users ?? [];
    for (const u of users) {
      const email = u.email ?? "";
      map.set(u.id, { email, name: displayName(u.user_metadata, email) });
    }

    // A short page is the last page.
    if (users.length < USERS_PAGE_SIZE) break;
  }

  return map;
}
