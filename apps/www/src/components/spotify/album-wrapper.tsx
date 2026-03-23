"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useMediaQuery } from "../../hooks/use-media-query";
import { VinylRecord } from "./vinyl-record";

interface SpotifyAlbumWrapperProps {
  albumName?: string;
  albumUrl?: string;
}

export function AlbumWrapper({
  albumUrl,
  albumName,
}: SpotifyAlbumWrapperProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isTapped, setIsTapped] = useState(false);

  const toggleVinyl = () => {
    setIsTapped(!isTapped);
  };

  return (
    <div className="relative h-40 w-40">
      {/* Album cover */}
      <motion.div
        className="absolute inset-0 z-[1] cursor-pointer md:cursor-default"
        onTapStart={toggleVinyl}
      >
        {/* biome-ignore lint/correctness/useImageSize: sized by parent container */}
        <img
          alt={albumName ?? "Album cover"}
          className="h-full w-full rounded-md object-cover"
          src={albumUrl ?? ""}
        />
        {/* biome-ignore lint/correctness/useImageSize: sized by parent container */}
        <img
          alt="texture overlay"
          className="absolute inset-0 h-full w-full rounded-md object-cover mix-blend-screen"
          src="/texture.png"
        />
      </motion.div>
      <motion.div
        animate={
          isDesktop || isTapped
            ? { opacity: 1, x: "50%" }
            : { opacity: 1, x: "0%" }
        }
        initial={{ opacity: 0, x: "0%" }}
        transition={{ duration: 0.4 }}
      >
        <VinylRecord
          albumUrl={albumUrl}
          className="absolute inset-0 z-[0] h-full w-full"
        />
      </motion.div>
    </div>
  );
}
