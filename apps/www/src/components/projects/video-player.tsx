"use client";

import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaPlayButton,
  MediaPlaybackRateButton,
  MediaTimeRange,
} from "media-chrome/react";

const VideoPlayer = ({ src }: { src: string }) => {
  return (
    <MediaController>
      <video
        className="h-full w-full object-contain"
        muted
        playsInline
        preload="auto"
        slot="media"
        src={src}
        suppressHydrationWarning
      />
      <MediaControlBar>
        <MediaPlayButton />
        <MediaTimeRange />
        <MediaPlaybackRateButton />
        <MediaFullscreenButton />
      </MediaControlBar>
    </MediaController>
  );
};

export default VideoPlayer;
