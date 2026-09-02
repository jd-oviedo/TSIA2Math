// Scene 3. The modal opens on "Send invite"; the cursor picks "Add roster".
import { useCurrentFrame } from "remotion";
import { Caption } from "../components/Caption";
import { at, Cursor } from "../components/Cursor";
import { Screen } from "../components/Screen";
import { fadeIn, useCamera } from "../lib/anim";
import { rect } from "../lib/geometry";
import { RosterModal, TAB_CENTER } from "../ui/RosterModal";
import { INVITE_CENTER, TeacherDashboard } from "../ui/TeacherDashboard";
import { INVITE_FOCUS } from "./InviteScene";
import type { SceneProps } from "./shared";

export const MODAL_FOCUS = {
  landscape: rect(300, 30, 840, 600),
  portrait: rect(320, 40, 800, 620),
};

const TAB_CLICK = 68;

export const AddRosterScene: React.FC<SceneProps> = ({ layout }) => {
  const frame = useCurrentFrame();
  const o = layout.orientation;
  const focus = useCamera([
    { frame: 0, value: INVITE_FOCUS[o] },
    { frame: 34, value: MODAL_FOCUS[o] },
  ]);
  const open = fadeIn(frame, 0, 10);
  const roster = frame >= TAB_CLICK;
  const tab = TAB_CENTER(2);
  return (
    <>
      <Screen layout={layout} focus={focus}>
        <TeacherDashboard />
        <RosterModal stage={roster ? "roster" : "invite"} activeTab={roster ? 2 : 0} opacity={open} lift={(1 - open) * 14} />
        <Cursor path={[at(0, INVITE_CENTER.x, INVITE_CENTER.y), at(24, INVITE_CENTER.x, INVITE_CENTER.y), at(60, tab.x, tab.y)]} clicks={[TAB_CLICK]} />
      </Screen>
      <Caption layout={layout} from={0} to={210} step={3} text="3. Choose [Add roster.]" />
    </>
  );
};
