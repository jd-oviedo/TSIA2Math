// Scene 6. Perspective switch to the student: role select, the sign-in page,
// the code disclosure, typing email + code, and the student home.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Caption } from "../components/Caption";
import { at, Cursor } from "../components/Cursor";
import { Screen } from "../components/Screen";
import { SIGN_IN_STUDENT } from "../demo-data";
import { fadeIn, fadeOut, progress, typed, useCamera } from "../lib/anim";
import { rect } from "../lib/geometry";
import { C } from "../theme";
import { DISCLOSURE_CENTER, RoleSelect, SIGN_IN_CENTER, STUDENT_BTN_CENTER, StudentSignIn } from "../ui/StudentLogin";
import { StudentDashboard } from "../ui/StudentDashboard";
import { BigText, type SceneProps } from "./shared";

const T = {
  bannerEnd: 45,
  screenIn: 40,
  roleClick: 82,
  disclosureClick: 132,
  emailStart: 150,
  codeStart: 210,
  signInClick: 292,
  home: 310,
};

const FOCUS = {
  landscape: {
    role: rect(0, 0, 1440, 652),
    signin: rect(400, 100, 640, 652),
    typing: rect(300, 436, 840, 420),
    home: rect(0, 0, 1440, 652),
  },
  portrait: {
    role: rect(360, 200, 720, 420),
    signin: rect(460, 90, 520, 760),
    typing: rect(450, 240, 540, 660),
    home: rect(0, 60, 760, 560),
  },
};

export const StudentScene: React.FC<SceneProps> = ({ layout }) => {
  const frame = useCurrentFrame();
  const land = layout.orientation === "landscape";
  const f = FOCUS[layout.orientation];
  const focus = useCamera([
    { frame: T.roleClick, value: f.role },
    { frame: T.roleClick + 1, value: f.signin },
    { frame: T.emailStart - 8, value: f.signin },
    { frame: T.emailStart + 14, value: f.typing },
    { frame: T.home - 1, value: f.typing },
    { frame: T.home, value: f.home },
  ]);

  const email = typed(SIGN_IN_STUDENT.email, frame, T.emailStart, 2);
  const code = typed(SIGN_IN_STUDENT.code, frame, T.codeStart, 4);
  const emailDone = email.length === SIGN_IN_STUDENT.email.length;
  const codeDone = code.length === SIGN_IN_STUDENT.code.length;
  const codeForm = progress(frame, T.disclosureClick + 2, 12);

  const banner = fadeIn(frame, 0, 8) * fadeOut(frame, T.bannerEnd, 6);

  let screen: React.ReactNode;
  if (frame < T.roleClick) screen = <RoleSelect />;
  else if (frame < T.home)
    screen = (
      <StudentSignIn
        codeForm={codeForm}
        email={email}
        code={code}
        typingEmail={frame >= T.emailStart && !emailDone}
        typingCode={frame >= T.codeStart && !codeDone}
      />
    );
  else screen = <StudentDashboard />;

  return (
    <>
      <Screen layout={layout} focus={focus} opacity={fadeIn(frame, T.screenIn, 10) * (frame >= T.home ? fadeIn(frame, T.home, 8) : 1)}>
        {screen}
        {frame < T.home ? (
          <Cursor
            appearAt={T.screenIn + 4}
            path={[
              at(T.screenIn, 720, 600),
              at(T.roleClick - 8, STUDENT_BTN_CENTER.x, STUDENT_BTN_CENTER.y),
              at(T.roleClick + 10, STUDENT_BTN_CENTER.x, STUDENT_BTN_CENTER.y),
              at(T.disclosureClick - 8, DISCLOSURE_CENTER.x, DISCLOSURE_CENTER.y),
              at(T.codeStart + 50, DISCLOSURE_CENTER.x, DISCLOSURE_CENTER.y),
              at(T.signInClick - 6, SIGN_IN_CENTER.x, SIGN_IN_CENTER.y),
            ]}
            clicks={[T.roleClick, T.disclosureClick, T.signInClick]}
          />
        ) : null}
      </Screen>
      {frame < T.bannerEnd ? (
        <AbsoluteFill style={{ background: C.sand, opacity: banner }}>
          <BigText layout={layout} size={layout.titleSize} top={land ? 420 : 780} opacity={1} lift={(1 - fadeIn(frame, 0, 8)) * 24}>
            Now, the student.
          </BigText>
        </AbsoluteFill>
      ) : null}
      <Caption layout={layout} from={T.bannerEnd} to={T.home + 4} step={6} text="6. The student signs in with [that code.]" />
      <Caption layout={layout} from={T.home + 4} to={450} step={6} text="No Google needed. [They're in.]" />
    </>
  );
};
