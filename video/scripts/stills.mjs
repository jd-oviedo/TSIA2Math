// Export still frames as PNG. Default: the two credential-check frames
// (scene 5 results table, scene 6 code entry) in both aspect ratios.
// `--all` adds one sanity frame per scene. Bundles once, renders many.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { SCENES, STILL_FRAMES } from "../src/timeline.ts";

const all = process.argv.includes("--all");
const only = process.argv.find((a) => a.startsWith("--comp="))?.slice(7);

const frames = {
  "scene5-codes": STILL_FRAMES.codesTable,
  "scene6-code-entry": STILL_FRAMES.codeEntry,
  ...(all
    ? {
        "scene0-hook": SCENES.hook.from + 40,
        "scene0-title": SCENES.hook.from + 130,
        "scene1-dashboard": SCENES.dashboard.from + 60,
        "scene2-invite": SCENES.invite.from + 70,
        "scene3-add-roster": SCENES.addRoster.from + 100,
        "scene4-paste": SCENES.paste.from + 60,
        "scene4-preview": SCENES.paste.from + 200,
        "scene6-role": SCENES.student.from + 60,
        "scene6-signin": SCENES.student.from + 120,
        "scene6-home": SCENES.student.from + 380,
        "scene7-close": SCENES.close.from + 70,
      }
    : {}),
};

mkdirSync("out/stills", { recursive: true });
const serveUrl = await bundle({ entryPoint: "src/index.ts", publicDir: "public" });
const comps = ["AddRoster-16x9", "AddRoster-9x16"].filter((c) => !only || c === only);
for (const id of comps) {
  const composition = await selectComposition({ serveUrl, id });
  for (const [name, frame] of Object.entries(frames)) {
    const output = `out/stills/${id}-${name}.png`;
    await renderStill({ composition, serveUrl, frame, output, imageFormat: "png" });
    console.log(`${output} (frame ${frame})`);
  }
}
