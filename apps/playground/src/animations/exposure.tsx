import {
  clamp,
  frame,
  type MotionValue,
  mix,
  motion,
  progress,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const ACCENT = "#f4d845";
const EXPOSURE_VALUES = Array.from({ length: 41 }, (_, i) => -100 + i * 5);

const colorFor = (value: number) => (value > 0 ? ACCENT : "#000");

type NotchState = "ACTIVE" | "WAS_ACTIVE" | "INACTIVE";

function ExposureNotch({
  baseOpacity,
  index,
  totalItems,
  pixelOffset,
}: {
  baseOpacity: number;
  index: number;
  totalItems: number;
  pixelOffset: number;
}) {
  const [state, setState] = useState<NotchState>("INACTIVE");
  const prevOffset = useRef(pixelOffset);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const latest = pixelOffset;
    const prev = prevOffset.current;
    prevOffset.current = latest;

    const threshold = 6.5;
    let isCurrentlyActive = false;
    let crossedActiveZone = false;
    const edgeThreshold = 1;

    if (index === 0) {
      isCurrentlyActive = latest >= -edgeThreshold;
      crossedActiveZone = prev < -edgeThreshold && latest >= -edgeThreshold;
    } else if (index === totalItems - 1) {
      isCurrentlyActive = latest <= edgeThreshold;
      crossedActiveZone = prev > edgeThreshold && latest <= edgeThreshold;
    } else {
      isCurrentlyActive = Math.abs(latest) < threshold;
      const wasInside = Math.abs(prev) < threshold;
      const signChanged = prev * latest <= 0;
      crossedActiveZone = (wasInside || signChanged) && !isCurrentlyActive;
    }

    let nextState: NotchState | null = null;
    const currentState = stateRef.current;

    if (isCurrentlyActive) {
      nextState = "ACTIVE";
    } else if (currentState === "ACTIVE") {
      nextState = "WAS_ACTIVE";
    } else if (crossedActiveZone) {
      frame.postRender(() => {
        setState("ACTIVE");
        frame.postRender(() => setState("WAS_ACTIVE"));
      });
      return;
    }

    if (nextState && currentState !== nextState) {
      const finalState = nextState;
      frame.postRender(() => setState(finalState));
    }
  }, [pixelOffset, index, totalItems]);

  return (
    <motion.div
      animate={{
        clipPath: state === "ACTIVE" ? "inset(0% 0 0 0)" : "inset(50% 0 0 0)",
        opacity: state === "ACTIVE" ? 1 : baseOpacity,
      }}
      className="exp-notch"
      initial={{ clipPath: "inset(50% 0 0 0)", opacity: baseOpacity }}
      onAnimationComplete={() => {
        if (state === "WAS_ACTIVE") {
          setState("INACTIVE");
        }
      }}
      style={{
        backgroundColor: state === "ACTIVE" ? ACCENT : "#000",
        willChange: "clip-path, opacity",
      }}
      transition={
        state === "ACTIVE"
          ? { type: false }
          : { type: "spring", bounce: 0.2, duration: 0.8 }
      }
    />
  );
}

function ProgressIndicator({ value }: { value: MotionValue<number> }) {
  const [color, setColor] = useState(colorFor(value.get()));
  const displayValue = useTransform(() => Math.round(value.get() * 100));
  const positiveProgress = useTransform(displayValue, [0, 100], [0, 1]);
  const negativeProgress = useTransform(displayValue, [-100, 0], [1, 0]);

  useMotionValueEvent(displayValue, "change", (v) => {
    setColor(colorFor(v));
  });

  const radius = 48;

  return (
    <motion.div
      animate={{ "--exp-color": color } as unknown as Record<string, string>}
      className="exp-progress"
    >
      <svg viewBox="0 0 100 100">
        <title>Exposure indicator</title>
        <circle className="exp-circle-border" cx="50" cy="50" r={radius} />
        <motion.circle
          className="exp-indicator exp-positive"
          cx="50"
          cy="50"
          r={radius}
          style={{ pathLength: positiveProgress, rotate: -90 }}
        />
        <motion.circle
          className="exp-indicator exp-negative"
          cx="50"
          cy="50"
          r={radius}
          style={{ pathLength: negativeProgress, rotate: -90, scaleX: -1 }}
        />
      </svg>
      <motion.div
        className="exp-progress-value"
        style={{ color: "var(--exp-color)" }}
      >
        {displayValue}
      </motion.div>
    </motion.div>
  );
}

function ExposureRail({ exposure }: { exposure: MotionValue<number> }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const notchRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [offsets, setOffsets] = useState<number[]>(() =>
    Array.from({ length: EXPOSURE_VALUES.length }, () => 0)
  );

  const measure = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) {
      return;
    }
    const rect = strip.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const next = EXPOSURE_VALUES.map((_, i) => {
      const el = notchRefs.current[i];
      if (!el) {
        return 0;
      }
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2 - center;
    });
    setOffsets(next);

    const maxInset = strip.scrollWidth - strip.clientWidth;
    if (maxInset <= 0) {
      return;
    }
    const newExposure = clamp(
      -1,
      1,
      mix(-1, 1, progress(0, maxInset, strip.scrollLeft))
    );
    exposure.set(newExposure);
  }, [exposure]);

  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip) {
      return;
    }

    const maxInset = strip.scrollWidth - strip.clientWidth;
    if (maxInset > 0) {
      strip.scrollLeft = mix(0, maxInset, 0.5);
      exposure.set(0);
    }

    strip.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(strip);
    window.addEventListener("resize", measure);
    measure();

    return () => {
      strip.removeEventListener("scroll", measure);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [exposure, measure]);

  return (
    <div className="exp-strip" ref={stripRef}>
      <div className="exp-strip-inner">
        {EXPOSURE_VALUES.map((value, index) => (
          <div
            className="exp-notch-container"
            key={value}
            ref={(el) => {
              notchRefs.current[index] = el;
            }}
          >
            <ExposureNotch
              baseOpacity={value % 50 === 0 ? 0.6 : 0.3}
              index={index}
              pixelOffset={offsets[index] ?? 0}
              totalItems={EXPOSURE_VALUES.length}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Exposure() {
  const exposure = useMotionValue(0);
  const filter = useTransform(
    exposure,
    [-1, 1],
    ["brightness(0%)", "brightness(200%)"]
  );

  return (
    <>
      <div className="exp-container">
        <div className="exp-subject">
          <motion.div
            className="exp-subject-fill"
            style={{
              filter,
              background:
                "linear-gradient(135deg, #f97316 0%, #db2777 35%, #6366f1 70%, #0ea5e9 100%)",
            }}
          />
        </div>
        <ProgressIndicator value={exposure} />
        <div className="exp-slider">
          <ExposureRail exposure={exposure} />
        </div>
      </div>
      <ExposureStyles />
    </>
  );
}

function ExposureStyles() {
  return (
    <style>{`
      .exp-container {
        max-width: 500px;
        width: 100%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        padding: 20px;
        --exp-color: #000;
      }
      .exp-subject {
        width: 100%;
        max-height: 300px;
        aspect-ratio: 16/10;
        border-radius: 8px;
        overflow: hidden;
      }
      .exp-subject-fill {
        width: 100%;
        height: 100%;
      }
      .exp-progress {
        width: 75px;
        height: 75px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .exp-progress svg {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }
      .exp-circle-border {
        fill: rgba(0,0,0,0.07);
        stroke: var(--exp-color);
        stroke-width: 3;
        opacity: 0.3;
      }
      .exp-indicator {
        fill: none;
        stroke-width: 3;
      }
      .exp-positive { stroke: ${ACCENT}; }
      .exp-negative { stroke: #000; }
      .exp-progress-value {
        font-size: 18px;
        font-weight: 600;
        position: absolute;
        font-variant-numeric: tabular-nums;
      }
      .exp-slider {
        position: relative;
        height: 40px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        mask-image: linear-gradient(to right, transparent 0%, #000 20%, #000 80%, transparent 100%);
        -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 20%, #000 80%, transparent 100%);
      }
      .exp-strip {
        height: 100%;
        width: 100%;
        padding: 0 calc(50% - 6.5px);
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
        box-sizing: border-box;
      }
      .exp-strip::-webkit-scrollbar { display: none; }
      .exp-strip-inner {
        display: flex;
        width: max-content;
      }
      .exp-notch-container { padding: 0 5px; }
      .exp-notch {
        width: 3px;
        height: 40px;
        background-color: rgba(0,0,0,0.3);
        border-radius: 1px;
      }
    `}</style>
  );
}
