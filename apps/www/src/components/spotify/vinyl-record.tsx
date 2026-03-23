"use client";

import { useEffect, useRef, useState } from "react";

interface VinylRecordProps {
  albumUrl?: string;
  className?: string;
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export function VinylRecord({ className, albumUrl }: VinylRecordProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isDraggingRef = useRef(false);
  const lastYRef = useRef(0);
  const recordRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const lastPlaybackTimeRef = useRef(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: stopPlayback uses refs only, stable across renders
  useEffect(() => {
    // Preload audio buffer
    fetch("/scratch-sound.mp3")
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        const tempContext = new (
          window.AudioContext || window.webkitAudioContext
        )();
        return tempContext.decodeAudioData(arrayBuffer).then((buffer) => {
          audioBufferRef.current = buffer;
          tempContext.close();
        });
      })
      .catch((error) => {
        console.error("Error loading audio:", error);
      });

    return () => {
      stopPlayback();
      audioContextRef.current?.close();
    };
  }, []);

  const startPlayback = (playbackRate: number) => {
    if (
      !(
        audioContextRef.current &&
        audioBufferRef.current &&
        gainNodeRef.current
      )
    ) {
      return;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (_) {
        // Ignore cleanup errors from already-stopped sources
      }
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(gainNodeRef.current);
    source.playbackRate.value = Math.abs(playbackRate);
    source.loop = true;

    try {
      source.start();
      sourceNodeRef.current = source;
    } catch (e) {
      console.error("Playback start failed", e);
    }
  };

  const updatePlaybackRate = (deltaY: number) => {
    if (
      !(sourceNodeRef.current && gainNodeRef.current && audioContextRef.current)
    ) {
      return;
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - lastPlaybackTimeRef.current;

    if (timeSinceLastUpdate > 50) {
      const playbackRate = Math.abs(deltaY * 0.5);
      sourceNodeRef.current.playbackRate.value = Math.min(
        Math.max(playbackRate, 0.1),
        4
      );

      const targetGain =
        playbackRate > 0.1 ? Math.min(playbackRate * 0.5, 1) : 0;
      gainNodeRef.current.gain.setTargetAtTime(
        targetGain,
        audioContextRef.current.currentTime,
        0.1
      );
      lastPlaybackTimeRef.current = now;
    }
  };

  const stopPlayback = () => {
    sourceNodeRef.current?.stop();
    sourceNodeRef.current = null;
  };

  const handleGesture = (y: number) => {
    isDraggingRef.current = true;
    lastYRef.current = y;

    if (!audioContextRef.current && audioBufferRef.current) {
      const context = new (window.AudioContext || window.webkitAudioContext)();

      // iOS 17+ audio session fix
      try {
        if (typeof navigator !== "undefined" && "audioSession" in navigator) {
          // @ts-expect-error – not yet in TypeScript types
          navigator.audioSession.type = "playback";
        }
      } catch (_) {
        // silent fail
      }

      const gainNode = context.createGain();
      gainNode.connect(context.destination);
      gainNode.gain.value = 0;
      audioContextRef.current = context;
      gainNodeRef.current = gainNode;

      context.resume().then(() => {
        startPlayback(0.1);
      });
    } else if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume().then(() => {
        startPlayback(0.1);
      });
    } else if (!sourceNodeRef.current) {
      startPlayback(0.1);
    }
  };

  const handleDrag = (y: number) => {
    if (!isDraggingRef.current) {
      return;
    }
    const deltaY = y - lastYRef.current;
    lastYRef.current = y;

    setRotation((prev) => prev + deltaY);
    updatePlaybackRate(deltaY);
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        0,
        audioContextRef.current.currentTime,
        0.1
      );
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: custom drag-to-scratch vinyl interaction
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: custom drag-to-scratch vinyl interaction
    <div
      className={`relative cursor-grab touch-none select-none active:cursor-grabbing ${className}`}
      onMouseDown={(e) => {
        e.preventDefault();
        handleGesture(e.clientY);
      }}
      onMouseLeave={handleDragEnd}
      onMouseMove={(e) => handleDrag(e.clientY)}
      onMouseUp={handleDragEnd}
      onTouchEnd={handleDragEnd}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        if (touch) {
          handleDrag(touch.clientY);
        }
      }}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        if (touch) {
          handleGesture(touch.clientY);
        }
      }}
      ref={recordRef}
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: isDraggingRef.current ? "none" : "transform 0.5s ease-out",
        touchAction: "none",
      }}
    >
      <div className="relative h-full w-full">
        {albumUrl && (
          <div
            className="absolute inset-0 overflow-hidden rounded-full"
            style={{
              width: "47%",
              height: "47%",
              top: "27%",
              left: "27%",
              zIndex: 1,
            }}
          >
            {/* biome-ignore lint/correctness/useImageSize: sized by parent container */}
            <img
              alt="Album label"
              className="h-full w-full object-cover"
              src={albumUrl}
            />
          </div>
        )}
        <div
          className="absolute rounded-full bg-white"
          style={{
            width: "12%",
            height: "12%",
            top: "45%",
            left: "45%",
            zIndex: 1,
          }}
        />
        {/* biome-ignore lint/correctness/useImageSize: sized by parent container */}
        <img
          alt="Interactive vinyl record"
          className="h-full w-full rounded-md object-cover"
          src="/record.png"
        />
      </div>
    </div>
  );
}
