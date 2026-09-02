// Scene 4. The class is pasted in, the preview table appears, the teacher
// clicks Add 4 students.
import { useCurrentFrame } from "remotion";
import { Caption } from "../components/Caption";
import { at, Cursor } from "../components/Cursor";
import { Screen } from "../components/Screen";
import { DEMO_STUDENTS, PASTED_LINES } from "../demo-data";
import { progress, useCamera } from "../lib/anim";
import { rect } from "../lib/geometry";
import { ADD_CENTER, RosterModal, TAB_CENTER } from "../ui/RosterModal";
import { TeacherDashboard } from "../ui/TeacherDashboard";
import { MODAL_FOCUS } from "./AddRosterScene";
import type { SceneProps } from "./shared";

// Once the preview table grows the modal, the landscape camera slides down to
// follow the action; portrait already has the height to show it all.
const PREVIEW_FOCUS = {
  landscape: rect(300, 240, 840, 560),
  portrait: rect(320, 60, 800, 740),
};

const PASTE_START = 20;
const PASTE_GAP = 12;
const PREVIEW_AT = 84;
const ADD_CLICK = 262;

export const PasteScene: React.FC<SceneProps> = ({ layout }) => {
  const frame = useCurrentFrame();
  const o = layout.orientation;
  const focus = useCamera([
    { frame: PREVIEW_AT, value: MODAL_FOCUS[o] },
    { frame: PREVIEW_AT + 30, value: PREVIEW_FOCUS[o] },
  ]);
  const shown = Math.max(0, Math.min(PASTED_LINES.length, Math.floor((frame - PASTE_START) / PASTE_GAP) + 1));
  const lines = frame < PASTE_START ? [] : PASTED_LINES.slice(0, shown);
  const preview = progress(frame, PREVIEW_AT, 12);
  const n = DEMO_STUDENTS.length;
  const pressed = frame >= ADD_CLICK;
  const addLabel = pressed ? `Adding ${n} students…` : preview > 0 ? `Add ${n} students` : "Add students";
  const tab = TAB_CENTER(2);
  const add = ADD_CENTER(true);
  return (
    <>
      <Screen layout={layout} focus={focus}>
        <TeacherDashboard />
        <RosterModal stage="roster" activeTab={2} lines={lines} preview={preview} addLabel={addLabel} pressed={pressed} />
        <Cursor path={[at(0, tab.x, tab.y), at(190, tab.x, tab.y), at(250, add.x, add.y)]} clicks={[ADD_CLICK]} />
      </Screen>
      <Caption layout={layout} from={0} to={190} step={4} text="4. Paste your class. [Name, then email.]" />
      <Caption layout={layout} from={190} to={390} step={4} text="One student per line. [A spreadsheet works too.]" />
    </>
  );
};
