// Scene 2. Camera punches toward the top right, cursor clicks Invite.
import { useCurrentFrame } from "remotion";
import { Caption } from "../components/Caption";
import { at, Cursor } from "../components/Cursor";
import { Screen } from "../components/Screen";
import { useCamera } from "../lib/anim";
import { rect } from "../lib/geometry";
import { INVITE_CENTER, TeacherDashboard } from "../ui/TeacherDashboard";
import { DASH_FOCUS } from "./DashboardScene";
import type { SceneProps } from "./shared";

export const INVITE_FOCUS = {
  landscape: rect(560, 0, 880, 500),
  portrait: rect(760, 0, 680, 800),
};

const CLICK = 58;

export const InviteScene: React.FC<SceneProps> = ({ layout }) => {
  const frame = useCurrentFrame();
  const o = layout.orientation;
  const focus = useCamera([
    { frame: 0, value: DASH_FOCUS[o] },
    { frame: 30, value: INVITE_FOCUS[o] },
  ]);
  return (
    <>
      <Screen layout={layout} focus={focus}>
        <TeacherDashboard inviteHighlight={frame >= CLICK ? 1 : 0} />
        <Cursor path={[at(4, 760, 430), at(50, INVITE_CENTER.x, INVITE_CENTER.y)]} clicks={[CLICK]} />
      </Screen>
      <Caption layout={layout} from={0} to={150} step={2} text="2. Click [Invite.]" />
    </>
  );
};
