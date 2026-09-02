// Scene 1. The teacher lands on the dashboard. A short "Signed in as Mr. O"
// beat instead of a login form.
import { useCurrentFrame } from "remotion";
import { Caption } from "../components/Caption";
import { Screen } from "../components/Screen";
import { DEMO_TEACHER } from "../demo-data";
import { fadeIn, fadeOut } from "../lib/anim";
import { rect } from "../lib/geometry";
import { C, FONT_BODY } from "../theme";
import { TeacherDashboard } from "../ui/TeacherDashboard";
import type { SceneProps } from "./shared";

// Landscape shows the top of the page edge to edge. Portrait shows the left
// two thirds so the sidebar and title read at a usable size.
export const DASH_FOCUS = {
  landscape: rect(0, 0, 1440, 652),
  portrait: rect(0, 0, 760, 900),
};

export const DashboardScene: React.FC<SceneProps> = ({ layout }) => {
  const frame = useCurrentFrame();
  const toast = fadeIn(frame, 18, 8) * fadeOut(frame, 110, 8);
  return (
    <>
      <Screen layout={layout} focus={DASH_FOCUS[layout.orientation]} opacity={fadeIn(frame, 0, 10)}>
        <TeacherDashboard />
        <div
          style={{
            position: "absolute",
            left: 350,
            top: 12,
            height: 32,
            padding: "0 14px",
            background: C.navy,
            color: C.cream,
            fontFamily: FONT_BODY,
            fontSize: 14,
            fontWeight: 600,
            opacity: toast,
            transform: `translateY(${(1 - toast) * -6}px)`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ width: 8, height: 8, background: C.sunset, display: "inline-block" }} />
          Signed in as {DEMO_TEACHER.name}
        </div>
      </Screen>
      <Caption layout={layout} from={6} to={180} step={1} text="1. Log in to your [teacher dashboard.]" />
    </>
  );
};
