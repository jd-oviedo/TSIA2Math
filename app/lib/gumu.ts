import Anthropic from "@anthropic-ai/sdk";

// GUMU (Get Ur Math Up) — the Socratic tutor's model layer.
//
// Kept out of the route so the leak check is unit-testable in isolation: it is
// the only thing standing between a model response and a student, and a bug in
// it either leaks the answer or (as the naive single-letter version did)
// rejects every message GUMU ever writes.

// Switched from claude-haiku-4-5 after live testing: Haiku's tone and Socratic
// discipline were good, but it made arithmetic slips mid-explanation ("the
// flour tripled (went from 3 to 12)"), which is the one error a math tutor
// cannot make.
export const GUMU_MODEL = "claude-sonnet-5";

// Student turns, not GUMU's. On the 3rd the route stops asking questions and
// has GUMU compose a nudge toward the answer instead.
export const MAX_STUDENT_TURNS = 3;

const SYSTEM_PROMPT = `You are GUMU (Get Ur Math Up), a warm, curious math tutor for a high school student preparing for the TSIA2 college placement test. A student just answered a question incorrectly. Your job is to ask short, guiding questions that help them find their OWN mistake. Never state the correct answer or directly correct them. Ask about their reasoning step by step.

If they express frustration, be encouraging and lighten the tone, but keep guiding rather than solving it for them.

If the student asks you to just give the answer, respond warmly but redirect. For example: "I hear you, let's get there together. Walk me through what you tried for step 2." Never state the correct answer choice, even if asked directly.

Some replies are not real attempts. Tell these two cases apart, because they need opposite responses:

Gibberish is random characters or words with no relation to the question, like "asdkjfh" or "blah blah whatever". Respond with a light, friendly nudge to actually try. For example: "Ha, I'll need a bit more than that. What's the first thing you'd do with the two numbers in the problem?"

Honest uncertainty is a real response, not gibberish. "I don't know", "idk", "no idea", "I'm lost", and "I don't get it" all mean the student is stuck and telling you so. Never treat these as junk. Scaffold down to a smaller question they can answer. For example: "That's okay, let's make it smaller. Forget the whole problem for a second: what does the 3 in the ratio actually count?"

Never sound clinical or like a corporate chatbot. Keep every message short, 2-4 sentences max, this is a chat interface, not an essay. Never reveal the correct answer choice letter or its value directly.

Never use em dashes. Use a period, a comma, or the word "and" instead.

Set found_own_mistake to true only when the student has actually articulated where their reasoning went wrong, not when they have merely guessed again or asked for help.`;

// Appended only on the student's final turn, where the route also puts the
// correct answer into context for the first time.
const FINAL_TURN_INSTRUCTION = `This is your last exchange. The student has not found the error on their own. Give a warm, encouraging nudge toward the specific step where their reasoning went wrong, then invite them to try the question again themselves. Even now, do NOT state the correct answer choice letter or its value. Point at the step, not the result.`;

const RETRY_REMINDER = `Your previous response revealed the answer, which is not allowed under any circumstances. Rewrite it: point only at the student's reasoning. Do not state the correct answer, its value, or its letter.`;

// Used when the model leaks twice (or leaks on the final turn, where retrying
// is likely to leak again). Deliberately says nothing that could be a leak.
export const SAFE_FALLBACK_MESSAGE =
  "Let's slow down. Walk me through your first step again?";

// The prompt tells GUMU not to use em dashes, but a prompt instruction is a
// preference, not a guarantee -- the same reason the leak check exists. This
// is the safety net: it runs on every message before it reaches the student.
//
// An em dash is nearly always doing the work of a comma, so that is the
// substitution. Adjacent punctuation is collapsed so "text —, more" cannot
// become "text ,, more".
//
// Em dash only. En dashes are left alone: in math content they are usually a
// range ("between 3–4"), and rewriting that to "3, 4" corrupts the meaning.
export function stripEmDashes(text: string): string {
  return text
    .replace(/\s*—\s*/g, ", ")
    .replace(/,\s*([,.;:!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export type GumuReply = { message: string; found_own_mistake: boolean };

const REPLY_SCHEMA = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description: "Your reply to the student. 2-4 sentences, warm and short.",
    },
    found_own_mistake: {
      type: "boolean",
      description:
        "True only if the student has articulated where their own reasoning went wrong.",
    },
  },
  required: ["message", "found_own_mistake"],
  additionalProperties: false,
} as const;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (and Vercel env vars for prod). " +
        "GUMU cannot run without it."
    );
  }
  if (!client) client = new Anthropic();
  return client;
}

// --- Leak detection ---------------------------------------------------------

// Strips LaTeX noise so "$4$ cups" and "4 cups" compare equal.
function normalize(text: string): string {
  return text
    .replace(/[$\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Matches a bare option reference — "option A", "answer is B", "choice C",
// "(D)" — without matching the letter "a" in ordinary prose. The naive
// case-insensitive substring check for a single letter matched essentially
// every English sentence, including the safe fallback above, which would have
// rejected every response GUMU ever produced.
function referencesOption(text: string, letter: string): boolean {
  const l = letter.toUpperCase();
  const patterns = [
    new RegExp(`\\b(option|answer|choice|letter)\\s+(is\\s+)?["'(]?${l}\\b`, "i"),
    new RegExp(`\\b(is|it's|its|pick|choose|select)\\s+["'(]?${l}\\)`, "i"),
    new RegExp(`\\(\\s*${l}\\s*\\)`),
    new RegExp(`(^|\\s)${l}\\)`),
  ];
  return patterns.some((p) => p.test(text));
}

// Does the answer's own text appear? A purely numeric answer needs a word
// boundary ("12" must not match "120"), while a phrase like "4 cups" is
// specific enough to substring-match safely. A one-character answer is too
// short to distinguish from prose, so it is left to referencesOption.
function statesAnswerText(normalized: string, answerText: string): boolean {
  const answer = normalize(answerText);
  if (answer.length < 2) return false;

  if (/^[\d.,]+$/.test(answer)) {
    const escaped = answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^\\d.,])${escaped}($|[^\\d.,])`).test(normalized);
  }
  return normalized.includes(answer);
}

export type LeakCheckInput = {
  message: string;
  correctAnswer: string;
  answerText: string;
  misconceptionTag: string | null;
  // The option-letter patterns only run once the answer is in the model's
  // context. Before that the model has nothing to leak, and a stray "(A)" in
  // prose should not cost the student their turn.
  strict: boolean;
};

// Returns the reason a message leaked, or null if it is safe to show.
export function detectLeak({
  message,
  correctAnswer,
  answerText,
  misconceptionTag,
  strict,
}: LeakCheckInput): string | null {
  const normalized = normalize(message);

  if (misconceptionTag && normalized.includes(normalize(misconceptionTag))) {
    return "misconception_tag";
  }
  if (statesAnswerText(normalized, answerText)) {
    return "answer_text";
  }
  if (strict && referencesOption(message, correctAnswer)) {
    return "option_letter";
  }
  return null;
}

// --- Model call -------------------------------------------------------------

export type GumuTurn = { role: "student" | "gumu"; content: string };

export type AnswerContext = {
  correctAnswer: string;
  answerText: string;
  misconceptionTag: string | null;
};

type AskOptions = {
  history: GumuTurn[];
  isFinalTurn: boolean;
  // Always supplied, but used for two different things. The leak checker needs
  // it on every turn -- the model could state the answer having guessed it, and
  // an unchecked lucky guess is just as much a leak as a briefed one. It is
  // injected into the model's own context only on the final turn.
  answerContext: AnswerContext;
};

async function callModel(
  history: GumuTurn[],
  systemExtras: string[]
): Promise<GumuReply> {
  const response = await getClient().messages.create({
    model: GUMU_MODEL,
    // Sonnet 5 runs adaptive thinking when `thinking` is omitted, and
    // max_tokens caps thinking plus reply together. GUMU's replies are 2-4
    // sentences, but at 512 the thinking could eat the budget and truncate
    // one, so the ceiling is raised well clear of it. Thinking is left on
    // deliberately: checking its own arithmetic before answering is exactly
    // the weakness that prompted the model switch.
    max_tokens: 2048,
    output_config: {
      // The work is one short tutoring reply, not deep reasoning. Low keeps
      // latency down in a chat interface while still getting the arithmetic
      // checked.
      effort: "low",
      format: { type: "json_schema", schema: REPLY_SCHEMA },
    },
    system: [SYSTEM_PROMPT, ...systemExtras].join("\n\n"),
    messages: history.map((turn) => ({
      role: turn.role === "student" ? ("user" as const) : ("assistant" as const),
      content: turn.content,
    })),
  });

  if (response.stop_reason === "refusal") {
    throw new Error("GUMU: model declined the request");
  }

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") {
    throw new Error("GUMU: model returned no text block");
  }

  // output_config.format guarantees the text block is valid JSON matching the
  // schema, so a parse failure here is a real error, not an expected branch.
  const parsed = JSON.parse(text.text) as GumuReply;
  return {
    // Applied here rather than at the call sites so every path out of the
    // model -- first attempt, retry, and any future caller -- is covered.
    message: stripEmDashes(String(parsed.message ?? "")),
    found_own_mistake: Boolean(parsed.found_own_mistake),
  };
}

export type AskResult = {
  reply: GumuReply;
  // Set when a response was rejected, so the route can log how often the model
  // has to be caught. Null on a clean first pass.
  leaked: string | null;
  usedFallback: boolean;
};

// Asks GUMU for the next message and guarantees the result is safe to show.
//
// On a leak: one retry with a sharpened reminder, then the canned fallback.
// The final turn skips the retry — that is the one turn where the model has
// the answer in context, so a second attempt is likely to leak the same way,
// and the fallback is the safer terminal state.
export async function askGumu({
  history,
  isFinalTurn,
  answerContext,
}: AskOptions): Promise<AskResult> {
  const systemExtras: string[] = [];

  if (isFinalTurn) {
    systemExtras.push(FINAL_TURN_INSTRUCTION);
    systemExtras.push(
      `For your reference only, never state any of this: the correct answer is ${answerContext.correctAnswer} (${answerContext.answerText}).` +
        (answerContext.misconceptionTag
          ? ` The student's error looks like: ${answerContext.misconceptionTag}.`
          : "")
    );
  }

  const check = (message: string) =>
    detectLeak({ message, ...answerContext, strict: isFinalTurn });

  const first = await callModel(history, systemExtras);
  const firstLeak = check(first.message);
  if (!firstLeak) return { reply: first, leaked: null, usedFallback: false };

  if (isFinalTurn) {
    return {
      reply: { message: SAFE_FALLBACK_MESSAGE, found_own_mistake: false },
      leaked: firstLeak,
      usedFallback: true,
    };
  }

  const second = await callModel(history, [...systemExtras, RETRY_REMINDER]);
  if (!check(second.message)) {
    return { reply: second, leaked: firstLeak, usedFallback: false };
  }

  return {
    reply: { message: SAFE_FALLBACK_MESSAGE, found_own_mistake: false },
    leaked: firstLeak,
    usedFallback: true,
  };
}
