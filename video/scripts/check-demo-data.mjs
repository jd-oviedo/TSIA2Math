// Guard for the non-negotiable constraint: nothing real in any frame.
// Checks the demo data and the source tree, and exits non-zero on a problem.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const errors = [];

const src = readFileSync(join(root, "src/demo-data.ts"), "utf8");

// Codes: 12 chars, uppercase letters and digits, no lookalikes (I, L, O, 0, 1).
const codes = [...src.matchAll(/code:\s*"([^"]+)"/g)].map((m) => m[1]);
if (codes.length < 4) errors.push(`expected at least 4 demo codes, found ${codes.length}`);
for (const c of codes) {
  if (!/^[A-HJ-KM-NP-Z2-9]{12}$/.test(c)) errors.push(`code ${c} is not 12 chars of A-Z/2-9 without lookalikes`);
}
if (new Set(codes).size !== codes.length) errors.push("duplicate demo codes");

// Emails: only the generic demo domain.
const emails = [...src.matchAll(/email:\s*"([^"]+)"/g)].map((m) => m[1]);
for (const e of emails) {
  if (!e.endsWith("@district.edu")) errors.push(`email ${e} is not on @district.edu`);
}

// Join code: 6 chars.
const join6 = src.match(/joinCode:\s*"([^"]+)"/)?.[1] ?? "";
if (!/^[A-Z0-9]{6}$/.test(join6)) errors.push(`join code ${join6} is not 6 uppercase alphanumerics`);

// Source tree: no em dashes anywhere in copy or comments, and no raster
// image referenced except the brand wordmark.
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const files = [...walk(join(root, "src")), join(root, "narration.txt"), join(root, "README.md")];
for (const f of files) {
  const text = readFileSync(f, "utf8");
  const rel = f.slice(root.length);
  if (text.includes("—")) errors.push(`${rel}: contains an em dash`);
  for (const m of text.matchAll(/[\w-]+\.(png|jpe?g|webp|gif)/gi)) {
    if (m[0] !== "unpackmath-wordmark.png") errors.push(`${rel}: references image ${m[0]}`);
  }
}

if (errors.length) {
  console.error("demo-data check FAILED");
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
}
console.log(`demo-data check OK: ${codes.length} fabricated codes, ${emails.length} @district.edu emails, no em dashes, no screenshots`);
