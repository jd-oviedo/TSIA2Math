import { randomInt } from "crypto";

// The sign-in code minted for a student a teacher provisions.
//
// THIS IS A PASSWORD, NOT A JOIN CODE, and that is why it does not reuse
// generateJoinCode. A join code is a class's public handle: six characters read
// off a projector, shared with a room, and defensible only because the two
// limiters in rate-limit.ts:148-184 stand in front of it. This string is the
// ONLY credential on a student's account. Its strength has to stand on its own,
// and it must not shrink on the day somebody decides join codes should be five
// characters.
//
// SEPARATE ALPHABET FOR THE SAME REASON. The glyphs are the set join-code.ts
// settled on -- 0/O and 1/I/L dropped because they get misread off paper -- but
// the constant is declared here. CODE_ALPHABET is documented there as "a
// generation policy, not a validation rule" for join codes; importing it would
// let a change to that policy silently re-price every password minted here.
//
// Server-only: imports node:crypto, and nothing that ships to a browser should
// be able to reach a credential generator.
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

// 31^12 = 787,662,783,788,549,761 -- 59.4 bits. The six-glyph join code is 29.7
// bits, which is walkable and is why it is rate limited; this is not.
//
// Twelve is the cost of being typed by hand exactly once. The student signs in
// with it, and once "Connect Google" ships they never type it again. Supabase's
// minimum password length is 6 by default and 8 in its strictest preset, so this
// clears whichever the project carries without this file having to know.
export const STUDENT_CODE_LENGTH = 12;

// ONE DIGIT AND ONE LETTER, GUARANTEED, because Supabase has a "letters and
// digits" password policy tier a project can turn on. A uniform 12-character
// draw misses a digit 3.3% of the time ((23/31)^12), so without this a small
// share of provisioned students would fail createUser for a reason the teacher
// could do nothing about. Redrawing keeps the distribution uniform over the
// codes that survive, so the entropy cost is 0.05 bits.
//
// It does NOT cover the strictest tier (lower + upper + digits + symbols). An
// all-caps alphanumeric code cannot, the project's policy is not this module's
// to change, and the route surfaces the createUser refusal rather than guessing.
const HAS_DIGIT = /[0-9]/;
const HAS_LETTER = /[A-Z]/;

export function generateStudentCode(): string {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let out = "";
    for (let i = 0; i < STUDENT_CODE_LENGTH; i += 1) {
      // randomInt is rejection-sampled, so no modulo bias across the alphabet.
      out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    }
    if (HAS_DIGIT.test(out) && HAS_LETTER.test(out)) return out;
  }

  // ─── THIS THROW IS AN ENTROPY-SANITY GUARD, NOT A POLICY GUARD ─────────────
  //
  // DO NOT DELETE IT AS DEAD CODE. It is not the character policy above that
  // brings you here. A single draw satisfies that policy 96.7% of the time, so
  // twenty consecutive failures is 0.033^20 -- about 1 in 10^30, which will not
  // happen before the heat death of the sun on a working machine.
  //
  // What DOES bring you here is randomInt no longer returning random numbers:
  // a stubbed or monkey-patched crypto in a test harness, a broken polyfill, a
  // bundler that shimmed node:crypto for a browser target, an entropy source
  // that has started returning a constant. Every one of those makes the loop
  // above emit the same predictable string twenty times over.
  //
  // The failure mode this prevents is the only one that matters here: shipping
  // a PREDICTABLE password onto a real student's account and reporting success.
  // Throwing costs one teacher one error message. Not throwing costs a
  // credential that an attacker can reproduce. Loud is correct.
  throw new Error(
    "generateStudentCode: 20 draws failed the character policy -- the entropy source is not returning random values"
  );
}
