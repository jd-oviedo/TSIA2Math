// Shared, SIDE-EFFECT-FREE pieces for the CSV export fixture scripts.
//
// WHY THIS FILE EXISTS
//
// It exists because of a real incident, and the incident is worth recording so
// nobody reintroduces the shape.
//
// teardown_export_fixture.mjs used to borrow three constants and a client
// factory by importing seed_export_fixture.mjs. The seeder called main() at
// module scope, and in ESM an import EXECUTES the imported module's top level.
// So running the teardown ran the seeder. It printed "Seeding CSV export
// fixture", tried to create teacher-a, failed because that user already
// existed, and process.exit(1) killed the run before the teardown had deleted
// anything.
//
// The visible failure was mild. The latent one was not:
//
//   * Against a database with NO fixture, the seeder's main() would have run
//     to completion and CREATED the whole fixture. A teardown that creates
//     data when there is nothing to remove is a genuinely dangerous script.
//     It only failed safely because the fixture happened to already exist.
//
//   * Both main() functions were in flight at once. The seeder lost the race
//     by rejecting first. Had listUsers resolved first, creates and deletes
//     would have interleaved against the same tables non-deterministically.
//
// Guarding the seeder's main() would have patched this instance. Putting the
// shared code somewhere with nothing to execute removes the shape: there is no
// top level here to run, so importing this can never do anything.
//
// RULE FOR THIS DIRECTORY: a script that borrows from another script borrows
// from a module like this one, never from a runnable entry point.
import { createClient } from "@supabase/supabase-js";
import { readFileSync, realpathSync } from "fs";
import { fileURLToPath } from "url";

// ─── Fixture markers. Teardown deletes on these and nothing else. ───────────
export const EMAIL_DOMAIN = "csv-export-fixture.example.com";
export const CLASS_PREFIX = "ZZ CSV Export Fixture";

function loadEnv() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    // Environment already populated, or running somewhere without the file.
  }
}

export function admin() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * True only when this module's importer was launched directly by node.
 *
 * Both fixture scripts gate main() on this, so that even if someone imports
 * one of them again in future, nothing runs. Belt and braces alongside the
 * structural fix above: the structure means there is no reason to import them,
 * this means it does not matter if somebody does anyway.
 */
export function isEntrypoint(importMetaUrl) {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(importMetaUrl));
  } catch {
    return false;
  }
}

/**
 * Make writes impossible on a client, for scripts that must only ever read and
 * delete.
 *
 * The teardown passes its client through this. It is a runtime tripwire rather
 * than a convention: the incident above ended with a teardown script calling
 * createUser, and a comment saying "this script does not create users" would
 * not have stopped it. This throws.
 */
export function forbidUserCreation(db) {
  db.auth.admin.createUser = () => {
    throw new Error(
      "forbidUserCreation: this script must never create a user. " +
        "If you are seeing this, a seeding path has been reached from a teardown."
    );
  };
  return db;
}
