// Scene 5. The results panel with the fabricated sign-in codes. This is one
// of the two frames exported as a still for the credential check.
import { useCurrentFrame } from "remotion";
import { Caption } from "../components/Caption";
import { at, Cursor } from "../components/Cursor";
import { Screen } from "../components/Screen";
import { DEMO_STUDENTS } from "../demo-data";
import { fadeIn, pulseAt } from "../lib/anim";
import { ADD_CENTER, DOWNLOAD_CENTER, RosterModal } from "../ui/RosterModal";
import { TeacherDashboard } from "../ui/TeacherDashboard";
import { MODAL_FOCUS } from "./AddRosterScene";
import type { SceneProps } from "./shared";

export const CodesScene: React.FC<SceneProps> = ({ layout }) => {
  const frame = useCurrentFrame();
  const open = fadeIn(frame, 0, 8);
  const rowsShown = Math.max(0, Math.min(DEMO_STUDENTS.length, Math.floor((frame - 10) / 6) + 1));
  const pulse = pulseAt(frame, [60, 120, 180, 240]);
  const add = ADD_CENTER(true);
  return (
    <>
      <Screen layout={layout} focus={MODAL_FOCUS[layout.orientation]}>
        <TeacherDashboard />
        <RosterModal stage="results" activeTab={2} rowsShown={rowsShown} pulse={pulse} opacity={open} lift={(1 - open) * 10} />
        <Cursor
          path={[at(0, add.x, add.y), at(200, add.x, add.y), at(250, DOWNLOAD_CENTER.x, DOWNLOAD_CENTER.y)]}
          clicks={[258]}
        />
      </Screen>
      <Caption layout={layout} from={0} to={170} step={5} text="5. Get each student's [sign-in code.]" />
      <Caption layout={layout} from={170} to={330} step={5} text="[Download the CSV] to hand them out." />
    </>
  );
};
