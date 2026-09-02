// The full explainer. One component serves both aspect ratios; the layout
// decides where the screen viewport and captions sit.
import { AbsoluteFill, Sequence } from "remotion";
import { ProgressBar } from "./components/ProgressBar";
import { LAYOUTS, type Orientation } from "./layout";
import { AddRosterScene } from "./scenes/AddRosterScene";
import { CloseScene } from "./scenes/CloseScene";
import { CodesScene } from "./scenes/CodesScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { HookScene } from "./scenes/HookScene";
import { InviteScene } from "./scenes/InviteScene";
import { PasteScene } from "./scenes/PasteScene";
import type { SceneProps } from "./scenes/shared";
import { StudentScene } from "./scenes/StudentScene";
import { C, FONT_BODY } from "./theme";
import { SCENES, type SceneKey } from "./timeline";

const COMPONENTS: Record<SceneKey, React.FC<SceneProps>> = {
  hook: HookScene,
  dashboard: DashboardScene,
  invite: InviteScene,
  addRoster: AddRosterScene,
  paste: PasteScene,
  codes: CodesScene,
  student: StudentScene,
  close: CloseScene,
};

export type AddRosterProps = { orientation: Orientation };

export const AddRosterVideo: React.FC<AddRosterProps> = ({ orientation }) => {
  const layout = LAYOUTS[orientation];
  return (
    <AbsoluteFill style={{ background: C.sand, fontFamily: FONT_BODY }}>
      {(Object.keys(SCENES) as SceneKey[]).map((key) => {
        const Scene = COMPONENTS[key];
        const { from, dur } = SCENES[key];
        return (
          <Sequence key={key} from={from} durationInFrames={dur} name={key}>
            <Scene layout={layout} />
          </Sequence>
        );
      })}
      <ProgressBar layout={layout} />
    </AbsoluteFill>
  );
};
