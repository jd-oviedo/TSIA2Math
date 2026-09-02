import type { Lang } from './use-login-lang';

// Every string on the three login screens, in both languages.
//
// One dictionary rather than per-component literals, because the ES/EN control
// now sits on all three screens and a string that exists in only one language is
// a screen that half-translates itself. The type is derived from the English
// entry, so adding a key without its Spanish counterpart is a compile error
// rather than a missing sentence someone notices in production.
//
// SCOPED TO /login. /reporte and /go carry their own parallel implementations of
// this idea; unifying the three is its own piece of work and is deliberately not
// attempted here.

const en = {
  // ─── Chrome ───────────────────────────────────────────────────────────────
  signIn: 'Sign in',
  changeRole: '← Change role',
  langLabel: 'Language / Idioma',
  themeLabel: 'Switch light or dark mode',
  toLight: 'Switch to light mode',
  toDark: 'Switch to dark mode',
  privacy: 'Privacy',
  terms: 'Terms',

  // ─── Role select ──────────────────────────────────────────────────────────
  roleHeadline: "Who's signing in today?",
  student: "I'm a student",
  teacher: "I'm a teacher",
  newHere: 'New here?',
  takeTest: 'Take the free practice test',
  noAccount: 'no account needed.',

  // ─── Sign in, both roles ──────────────────────────────────────────────────
  teacherEyebrow: 'Teacher sign in',
  studentEyebrow: 'Student sign in',
  welcomeBack: 'Welcome back',
  studentHeadline: 'Sign in to save your progress',
  teacherBlurb: 'Your class roster, strand data and misconception dashboard.',
  studentBlurb: 'Track your scores over time and pick up where you left off.',
  continueGoogle: 'Continue with Google',
  redirecting: 'Redirecting…',
  noAccountTeacher: 'No account?',
  talkToUs: 'Talk to us about your campus',
  legalPrefix: 'By signing in, you agree to our',
  legalTerms: 'Terms of Use',
  legalAnd: 'and',
  legalPrivacy: 'Privacy Policy',

  // ─── Join a class ─────────────────────────────────────────────────────────
  joinOptional: 'Optional',
  joinHeading: 'Joining a class?',
  joinBlurb: 'Enter the 6-character code your teacher gave you. You can skip this and add it later.',
  joinLabel: 'Class join code',
  joinPlaceholder: 'XK7R2P',
  joinCheck: 'Check code',
  joinChecking: 'Checking…',
  joinConfirmEyebrow: 'You are joining',
  joinTaughtBy: 'Taught by',
  joinChange: 'Use a different code',
  joinThenSignIn: 'Sign in to finish joining.',

  // ─── District code sign in ────────────────────────────────────────────────
  //
  // The second door, for students whose Workspace admin blocks the Google OAuth
  // app. Their teacher mints the account and hands them the code; this is the
  // only way those students can get in at all.
  //
  // ONE ERROR STRING FOR EVERY FAILURE, deliberately. Telling a wrong code apart
  // from an unknown email would turn this form into an account-enumeration
  // oracle, and the student can do nothing different with the finer answer.
  codeLinkLabel: 'District student? Sign in with a code.',
  codeHeading: 'Sign in with your code',
  codeBlurb: 'Use the email and code your teacher gave you.',
  codeEmailLabel: 'School email',
  codeEmailPlaceholder: 'you@school.edu',
  codeCodeLabel: 'Sign-in code',
  codeCodePlaceholder: 'ABCD2345EFGH',
  codeSubmit: 'Sign in',
  codeSigningIn: 'Signing in…',
  codeError: "That email and code don't match. Check with your teacher.",
  // THE ONE FAILURE THAT IS TOLD APART, and it costs nothing to tell apart: a
  // request that never reached the auth server is equally true for an email that
  // has an account and one that does not, so it leaks nothing. It used to share
  // the string above, which told a student with bad wifi that their code was
  // wrong and sent them to their teacher for a replacement they did not need.
  codeErrorNetwork: "Couldn't reach the server. Check your connection and try again.",

  // ─── Failure states. Every one of these is reachable. ─────────────────────
  // Pre-auth, from /api/enroll/lookup.
  errNotFound: "That code doesn't match any class. Check it with your teacher.",
  errInvalid: 'A join code is 6 characters, letters and numbers.',
  errRateLimited: 'Too many tries from this network. Wait a few minutes and try again.',
  errUnavailable: "We couldn't check that code just now. Try again in a moment.",
  errNetwork: "Couldn't reach the server. Check your connection and try again.",
  // Post-auth, from the ?join= parameter the callback sets.
  joinedOk: "You're in.",
  joinedAlready: "You were already in that class, so nothing changed.",
  joinGone: 'That class is no longer taking students. Ask your teacher for a new code.',
  joinOwnClass:
    "That's your own class code. Teachers can't enrol as students, so open your teacher dashboard instead.",
  joinFailed:
    "You're signed in, but we couldn't add you to the class. Use the join box on your dashboard to try again.",
  joinExpired:
    'Your class code expired while you were signing in. You are signed in, so enter it again using the join box on your dashboard.',
  // Auth cancelled, from ?error=auth_failed.
  authFailed: "Sign-in didn't finish. Nothing was saved, and you can try again.",
  authFailedWithCode:
    "Sign-in didn't finish. Your class code is still saved, so signing in again will finish the join.",
  tryAgain: 'Try again',
} as const;

export type CopyKey = keyof typeof en;

const es: Record<CopyKey, string> = {
  signIn: 'Iniciar sesión',
  changeRole: '← Cambiar rol',
  langLabel: 'Language / Idioma',
  themeLabel: 'Cambiar entre modo claro y oscuro',
  toLight: 'Cambiar a modo claro',
  toDark: 'Cambiar a modo oscuro',
  privacy: 'Privacidad',
  terms: 'Términos',

  roleHeadline: '¿Quién inicia sesión hoy?',
  student: 'Soy estudiante',
  teacher: 'Soy maestro(a)',
  newHere: '¿Primera vez?',
  takeTest: 'Haz la prueba de práctica gratis',
  noAccount: 'no necesitas cuenta.',

  teacherEyebrow: 'Acceso para maestros',
  studentEyebrow: 'Acceso para estudiantes',
  welcomeBack: 'Bienvenido de nuevo',
  studentHeadline: 'Inicia sesión para guardar tu progreso',
  teacherBlurb: 'Tu lista de clase, datos por área y panel de errores comunes.',
  studentBlurb: 'Guarda tus resultados y continúa donde lo dejaste.',
  continueGoogle: 'Continuar con Google',
  redirecting: 'Redirigiendo…',
  noAccountTeacher: '¿No tienes cuenta?',
  talkToUs: 'Hablemos sobre tu escuela',
  legalPrefix: 'Al iniciar sesión, aceptas nuestros',
  legalTerms: 'Términos de uso',
  legalAnd: 'y la',
  legalPrivacy: 'Política de privacidad',

  joinOptional: 'Opcional',
  joinHeading: '¿Te unes a una clase?',
  joinBlurb:
    'Escribe el código de 6 caracteres que te dio tu maestro. Puedes omitirlo y agregarlo después.',
  joinLabel: 'Código de la clase',
  joinPlaceholder: 'XK7R2P',
  joinCheck: 'Verificar código',
  joinChecking: 'Verificando…',
  joinConfirmEyebrow: 'Te unes a',
  joinTaughtBy: 'Maestro(a)',
  joinChange: 'Usar otro código',
  joinThenSignIn: 'Inicia sesión para terminar de unirte.',

  // MACHINE-DRAFTED, PENDING HUMAN BILINGUAL REVIEW. Every string below was
  // drafted by machine and has not been read by a bilingual human yet.
  //
  // "profesor/a" rather than "maestro", which reads elementary to a Texas
  // secondary audience. The rest of this dictionary still says "maestro"; that
  // is a pre-existing inconsistency and was left alone rather than swept in here.
  codeLinkLabel: '¿Estudiante del distrito? Inicia sesión con un código.',
  codeHeading: 'Inicia sesión con tu código',
  codeBlurb: 'Usa el correo y el código que te dio tu profesor/a.',
  codeEmailLabel: 'Correo escolar',
  codeEmailPlaceholder: 'tucorreo@escuela.edu',
  codeCodeLabel: 'Código de acceso',
  codeCodePlaceholder: 'ABCD2345EFGH',
  codeSubmit: 'Iniciar sesión',
  codeSigningIn: 'Iniciando sesión…',
  codeError: 'Ese correo y código no coinciden. Verifícalo con tu profesor/a.',
  // No teacher noun appears in this one, in either language, so the
  // profesor/maestro choice does not arise here. Matches the EN string's scope
  // rather than adding advice English does not give.
  codeErrorNetwork: 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',

  errNotFound: 'Ese código no coincide con ninguna clase. Verifícalo con tu maestro.',
  errInvalid: 'El código es de 6 caracteres, letras y números.',
  errRateLimited: 'Demasiados intentos desde esta red. Espera unos minutos e inténtalo de nuevo.',
  errUnavailable: 'No pudimos verificar el código en este momento. Inténtalo en un momento.',
  errNetwork: 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',

  joinedOk: 'Ya estás dentro.',
  joinedAlready: 'Ya estabas en esa clase, así que no cambió nada.',
  joinGone: 'Esa clase ya no acepta estudiantes. Pide a tu maestro un código nuevo.',
  joinOwnClass:
    'Ese es el código de tu propia clase. Los maestros no pueden inscribirse como estudiantes: abre tu panel de maestro.',
  joinFailed:
    'Iniciaste sesión, pero no pudimos agregarte a la clase. Usa la casilla de unirse en tu panel para intentarlo de nuevo.',
  joinExpired:
    'Tu código venció mientras iniciabas sesión. Ya iniciaste sesión: usa la casilla de unirse en tu panel para escribirlo otra vez.',
  authFailed: 'No se completó el inicio de sesión. No se guardó nada y puedes intentarlo de nuevo.',
  authFailedWithCode:
    'No se completó el inicio de sesión. Tu código sigue guardado: inicia sesión otra vez para terminar de unirte.',
  tryAgain: 'Intentar de nuevo',
};

export const COPY: Record<Lang, Record<CopyKey, string>> = { en, es };

export function t(lang: Lang, key: CopyKey): string {
  return COPY[lang][key];
}
