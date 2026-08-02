import { Composition } from "remotion";
import { ArdenoWebsiteDemo, VIDEO_DURATION_FRAMES, VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "./ArdenoWebsiteDemo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="ArdenoWebsiteDemo"
      component={ArdenoWebsiteDemo}
      durationInFrames={VIDEO_DURATION_FRAMES}
      fps={VIDEO_FPS}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
    />
  );
};
