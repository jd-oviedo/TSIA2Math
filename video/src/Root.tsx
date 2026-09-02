import "./index.css";
import { Composition } from "remotion";
import { AddRosterVideo } from "./AddRosterVideo";
import { LAYOUTS } from "./layout";
import { FPS, TOTAL_FRAMES } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="AddRoster-16x9"
      component={AddRosterVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={LAYOUTS.landscape.width}
      height={LAYOUTS.landscape.height}
      defaultProps={{ orientation: "landscape" as const }}
    />
    <Composition
      id="AddRoster-9x16"
      component={AddRosterVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={LAYOUTS.portrait.width}
      height={LAYOUTS.portrait.height}
      defaultProps={{ orientation: "portrait" as const }}
    />
  </>
);
