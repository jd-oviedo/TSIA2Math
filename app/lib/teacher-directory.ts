import type { SupabaseClient } from "@supabase/supabase-js";
// From the leaf module, NOT from ./auth, and that is load-bearing: auth.ts
// imports next/headers, which would make this file -- and everything that
// imports it -- impossible to load outside a request or a test.
import { displayName } from "./display-name";

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

/**
 * The user holding this email, or null.
 *
 * SAME PAGINATION AS usersById, for the same reason. An unpaginated listUsers()
 * sees one default page of 50, so past the fiftieth account in the project it
 * reports "no such user" about people who plainly exist.
 * app/api/teacher/invite/route.ts:49 still does exactly that; the cost there is
 * an invite email to someone who already has an account. The cost on the
 * provisioning route is worse -- it would try to MINT an account that exists --
 * so that route uses this.
 *
 * THROWS RATHER THAN RETURNING NULL ON A READ ERROR, and that is the whole
 * difference from findUserIdByEmail in stripe-activation.ts:35, which returns
 * null for both. "Not found" and "could not look" are the same value to a caller
 * that only gets null, and this caller turns "not found" into createUser. A page
 * that failed to read must never become an account. (The stripe-activation copy
 * is left alone: its callers only read, and changing billing under this task
 * would be scope it did not ask for.)
 *
 * Early-exits on the first match, so it is cheaper than usersById for the one
 * question it answers, and unlike usersById it never holds the project in memory.
 */
export async function findUserByEmail(
  admin: SupabaseClient,
  email: string
): Promise<{ id: string; email: string } | null> {
  const target = email.trim().toLowerCase();
  if (!target) return null;

  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: USERS_PAGE_SIZE,
    });

    if (error) throw error;

    const users = data?.users ?? [];
    const match = users.find((u) => (u.email ?? "").toLowerCase() === target);
    if (match) return { id: match.id, email: match.email ?? target };

    // A short page is the last page.
    if (users.length < USERS_PAGE_SIZE) return null;
  }
}
