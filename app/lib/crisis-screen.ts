import Anthropic from "@anthropic-ai/sdk";
import { lexicalFloorHit, decideScreen, type CrisisGrade, type ScreenDecision } from "./crisis";

// The one part of the crisis screen that needs the network.
//
// Split from crisis.ts so that everything decidable stays testable without a
// bundler. This file holds the model call and nothing else: the threshold, the
// lexical floor, the failure direction and the student-facing copy are all next
// door, and this returns their decision rather than making one.
//
// SEPARATE FROM gumu.ts ON PURPOSE. The tutor's own module states the rule this
// follows: "the model is asked for one thing per call, the next message, and is
// never asked to track turns, decide when to stop, or judge its own output"
// (gumu.ts:19-21). Safety triage is a second thing per call. Riding it on the
// reply schema would also put it inside askGumu's retry-and-fallback ladder,
// which can substitute a canned message, so the signal could be dropped by the
// leak checker's error handling.

// Same model the tutor already uses, so this file adds no new model dependency,
// and `effort` makes latency tunable without a model swap. Low because the work
// is one short classification, not reasoning.
export const SCREEN_MODEL = "claude-sonnet-5";

// A classification, not a conversation. 256 is far above what a single enum plus
// a short reason needs, and well clear of truncation.
const SCREEN_MAX_TOKENS = 256;

const SCREEN_SYSTEM_PROMPT = `You classify a single message a high school student typed to a math tutor. You are a safety screen, not a tutor. Do not reply to the student and do not solve anything.

Return one grade:

"none" - ordinary maths, ordinary confusion, or ordinary frustration. This includes hyperbole and venting, which are extremely common and are NOT distress: "this is killing me", "I want to die", "I'm dying", "this is torture", "kill me now", "I hate this", "I'm so done". A teenager saying any of these about a maths problem has said nothing about their safety. Grade these "none".

"concern" - the student describes real difficulty in their life rather than with the maths: anxiety, exhaustion, not sleeping, pressure at home, feeling hopeless in general terms. Not an indication of immediate risk.

"crisis" - the student discloses thoughts of suicide or self harm, an intention to hurt themselves, that someone is hurting them, or that they are in danger right now.

THE DISTINCTION THAT MATTERS is hyperbole versus disclosure, and context decides it. "I want to die" typed straight after getting a question wrong is hyperbole. "I want to die, I can't do this any more, nothing is worth it" is not. When a message is ordinary teenage exasperation about schoolwork, grade "none" even if it contains dramatic words.

Be conservative about grading "crisis". A wrong "crisis" interrupts a child doing algebra and teaches them not to speak freely here, which makes them less safe, not more. Grade "crisis" when the message genuinely indicates risk, not when it merely sounds bleak.`;

const SCREEN_SCHEMA = {
  type: "object",
  properties: {
    grade: {
      type: "string",
      enum: ["none", "concern", "crisis"],
      description: "The classification for this single student message.",
    },
  },
  required: ["grade"],
  additionalProperties: false,
} as const;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set. The crisis screen cannot run without it.");
  }
  if (!client) client = new Anthropic();
  return client;
}

/**
 * Grade one student message, or return null if no verdict could be produced.
 *
 * NULL IS A FAILURE, NOT A CLEAN RESULT, and decideScreen treats it that way. A
 * model refusal returns null for the same reason: a refusal is the safety
 * classifier declining, and reading a disclosure into that is guessing. The
 * floor then decides, and if the floor is silent the turn is refused rather than
 * tutored.
 */
async function gradeMessage(message: string): Promise<CrisisGrade | null> {
  try {
    const response = await getClient().messages.create({
      model: SCREEN_MODEL,
      max_tokens: SCREEN_MAX_TOKENS,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: SCREEN_SCHEMA },
      },
      system: SCREEN_SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    });

    if (response.stop_reason === "refusal") {
      console.error("[crisis-screen] classifier refused; falling back to the lexical floor");
      return null;
    }

    const text = response.content.find((block) => block.type === "text");
    if (!text || text.type !== "text") return null;

    const parsed = JSON.parse(text.text) as { grade?: string };
    if (parsed.grade === "none" || parsed.grade === "concern" || parsed.grade === "crisis") {
      return parsed.grade;
    }
    return null;
  } catch (err) {
    console.error("[crisis-screen] classifier call failed", err);
    return null;
  }
}

/**
 * Screen one student message before it reaches the tutor or the transcript.
 *
 * The floor is evaluated regardless of whether the classifier answered, because
 * on the healthy path the two are OR'd: a disclosure the classifier misses is
 * exactly what the floor is for.
 */
export async function screenStudentMessage(message: string): Promise<ScreenDecision> {
  const floorHit = lexicalFloorHit(message);
  const grade = await gradeMessage(message);

  // Grade only. No student id and no message text, so this is a count for tuning
  // the threshold and not a record of who said what. Persisting the disclosure
  // itself is deliberately not done anywhere in v1; see the design doc.
  console.log(`[crisis-screen] grade=${grade ?? "unavailable"} floor=${floorHit}`);

  return decideScreen({ grade, floorHit });
}
