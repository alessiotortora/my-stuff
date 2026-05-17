import { ReactLenis, useLenis } from "lenis/react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

const TOTAL_CARDS = 10;
const CARD_WIDTH = 120;
const CARD_HEIGHT = 180;

const TITLES = [
  "Alpha",
  "Beta",
  "Gamma",
  "Delta",
  "Epsilon",
  "Zeta",
  "Eta",
  "Theta",
  "Iota",
  "Kappa",
];

const getCardColor = (index: number) => {
  const hue = (index * 137.508) % 360;
  const saturation = 60 + (index % 30);
  const lightness = 50 + (index % 20);
  return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.7)`;
};

function remap(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
) {
  return ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;
}

interface DriftCardProps {
  children: React.ReactNode;
  containerHeight: number;
  containerWidth: number;
  count: number;
  index: number;
}

function DriftCard({
  index,
  count,
  containerWidth,
  containerHeight,
  children,
}: DriftCardProps) {
  const scrollProgress = useMotionValue(0);
  const isTouch =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  const cardOffset = index / count;
  const initialZIndex = Math.floor((cardOffset % 1) * count);
  const [relativeZIndex, setRelativeZIndex] = useState(initialZIndex);
  const scale = useMotionValue(1);
  const springScale = useSpring(scale, {
    stiffness: 100,
    damping: 10,
    mass: 0.5,
  });

  const loopedProgress = useTransform(
    scrollProgress,
    (p: number) => (p + index / count) % 1
  );

  useMotionValueEvent(loopedProgress, "change", (latest) => {
    setRelativeZIndex(Math.floor(latest * count));
  });

  const x = useTransform(loopedProgress, (p: number) =>
    remap(p, 0, 1, containerWidth, -CARD_WIDTH - CARD_WIDTH / 2)
  );
  const y = useTransform(loopedProgress, (p: number) =>
    remap(p, 0, 1, -CARD_HEIGHT, containerHeight + CARD_HEIGHT / 2)
  );

  useLenis((lenis: { progress: number; velocity: number }) => {
    scrollProgress.set(isTouch ? 1 - lenis.progress : lenis.progress);
  });

  const transform = useMotionTemplate`translate(${x}px, ${y}px) skewY(10deg) scale(${springScale})`;

  return (
    <motion.div
      className="absolute flex items-center justify-center"
      style={{
        height: CARD_HEIGHT,
        width: CARD_WIDTH,
        top: -CARD_HEIGHT / 2,
        zIndex: relativeZIndex,
        transform,
      }}
    >
      {children}
    </motion.div>
  );
}

function DriftCards({ width, height }: { width: number; height: number }) {
  return (
    <div className="relative h-full w-full">
      <ReactLenis
        className="scrollbar-none h-full w-full overflow-hidden rounded-sm"
        options={{
          infinite: true,
          syncTouch: true,
          syncTouchLerp: 0.2,
          duration: 2,
        }}
      >
        <div className="h-[1000px] w-full" />
        <div className="absolute top-0 right-0 mx-auto flex h-full w-full flex-col items-center overflow-hidden rounded-sm">
          {Array.from({ length: TOTAL_CARDS }).map((_, i) => (
            <DriftCard
              containerHeight={height}
              containerWidth={width}
              count={TOTAL_CARDS}
              index={i}
              // biome-ignore lint/suspicious/noArrayIndexKey: stable order
              key={i}
            >
              <div
                className="flex h-full w-full items-center justify-center rounded-sm border border-white/10 font-semibold text-[10px] text-white drop-shadow-lg"
                style={{ backgroundColor: getCardColor(i) }}
              >
                {TITLES[i]}
              </div>
            </DriftCard>
          ))}
        </div>
      </ReactLenis>
    </div>
  );
}

export default function Drift() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="relative h-96 w-96 overflow-auto rounded-lg bg-black/95"
      ref={containerRef}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <DriftCards height={dimensions.height} width={dimensions.width} />
      )}
    </div>
  );
}
