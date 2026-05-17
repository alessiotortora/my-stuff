import { useEffect, useMemo, useRef } from "react";

const TOTAL_CARDS = 16;
const FRICTION = 0.9;
const TOUCH_SENSITIVITY = 0.8;
const WHEEL_SENSITIVITY = 0.8;
const TRACKPAD_SENSITIVITY = 1.0;
const MIN_VELOCITY = 0.5;
const TOUCH_VELOCITY_SMOOTHING = 0.4;
const CACHE_THRESHOLD = 0.25;
const TRACKPAD_DELTA_THRESHOLD = 50;
const TRACKPAD_RESET_MS = 500;
const WHEEL_HISTORY_SIZE = 5;
const WILL_CHANGE_RADIUS = 2;

const CARD_WIDTH = 120;
const CARD_HEIGHT = 180;
const CARD_SPACING = 65;
const DIAGONAL_X_PER_Z = -0.25;
const DIAGONAL_Y_PER_Z = 0;

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
  "Lambda",
  "Mu",
  "Nu",
  "Xi",
  "Omicron",
  "Pi",
];

const mod = (n: number, m: number) => ((n % m) + m) % m;

const wrapCentered = (value: number, range: number) => {
  const half = range / 2;
  return mod(value + half, range) - half;
};

const toPx = (value: number) => `${Math.round(value * 100) / 100}px`;

const circularDistance = (a: number, b: number, size: number) => {
  const direct = Math.abs(a - b);
  return Math.min(direct, size - direct);
};

const getCardColor = (index: number) => {
  const hue = (index * 137.508) % 360;
  const saturation = 60 + (index % 30);
  const lightness = 50 + (index % 20);
  return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.7)`;
};

export default function Stack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRef = useRef(0);

  const transformCache = useRef({
    z: [] as number[],
    dx: [] as number[],
    dy: [] as number[],
    zIndex: [] as number[],
    willChange: [] as string[],
  });

  const momentum = useRef({
    velocity: 0,
    touchStartY: null as number | null,
    lastTime: 0,
  });

  const wheel = useRef({
    deltaHistory: [] as number[],
    isTrackpad: false,
    lastTime: 0,
  });

  const geometry = useRef({
    baseZ: [] as number[],
    totalRange: TOTAL_CARDS * CARD_SPACING,
  });

  const animation = useRef({
    rafId: null as number | null,
    lastFrameTime: 0,
  });

  const cardData = useMemo(
    () =>
      Array.from({ length: TOTAL_CARDS }, (_, i) => ({
        color: getCardColor(i),
        title: TITLES[i % TITLES.length],
      })),
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const recomputeGeometry = () => {
      const totalRange = TOTAL_CARDS * CARD_SPACING;
      const halfRange = totalRange / 2;
      geometry.current.totalRange = totalRange;
      geometry.current.baseZ = Array.from(
        { length: TOTAL_CARDS },
        (_, i) => i * CARD_SPACING - halfRange
      );
    };

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: physics loop is naturally branchy; refactoring would harm readability
    const applyTransforms = () => {
      const scrollPos = scrollRef.current;
      const totalRange = geometry.current.totalRange;
      const halfRange = totalRange / 2;
      const cache = transformCache.current;

      animation.current.lastFrameTime = performance.now();

      const centerIdx = mod(
        Math.round((halfRange - scrollPos) / CARD_SPACING),
        TOTAL_CARDS
      );

      for (let i = 0; i < TOTAL_CARDS; i++) {
        const el = cardRefs.current[i];
        if (!el) {
          continue;
        }

        const baseZ = geometry.current.baseZ[i] ?? i * CARD_SPACING - halfRange;
        const z = wrapCentered(baseZ + scrollPos, totalRange);
        const dx = z * DIAGONAL_X_PER_Z;
        const dy = z * DIAGONAL_Y_PER_Z;
        const zIndex = 10_000 - Math.floor(Math.abs(z));
        const willChangeValue =
          circularDistance(i, centerIdx, TOTAL_CARDS) <= WILL_CHANGE_RADIUS
            ? "transform"
            : "auto";

        const cachedZ = cache.z[i];
        if (
          cachedZ !== undefined &&
          Math.abs(z - cachedZ) < CACHE_THRESHOLD &&
          Math.abs(dx - (cache.dx[i] ?? 0)) < CACHE_THRESHOLD &&
          Math.abs(dy - (cache.dy[i] ?? 0)) < CACHE_THRESHOLD &&
          cache.zIndex[i] === zIndex &&
          cache.willChange[i] === willChangeValue
        ) {
          continue;
        }

        el.style.transform = `translate3d(calc(-50% + ${toPx(dx)}), calc(-50% + ${toPx(dy)}), ${toPx(z)})`;
        if (cache.willChange[i] !== willChangeValue) {
          el.style.willChange = willChangeValue;
          cache.willChange[i] = willChangeValue;
        }
        if (cache.zIndex[i] !== zIndex) {
          el.style.zIndex = String(zIndex);
          cache.zIndex[i] = zIndex;
        }
        cache.z[i] = z;
        cache.dx[i] = dx;
        cache.dy[i] = dy;
      }
    };

    const animationLoop = (time: number) => {
      const maxOffset = geometry.current.totalRange;
      let needsMoreFrames = false;

      const v = momentum.current.velocity;
      if (Math.abs(v) >= MIN_VELOCITY) {
        const lastTime = momentum.current.lastTime || time;
        const dt = Math.max(0.001, (time - lastTime) / 1000);
        momentum.current.lastTime = time;
        scrollRef.current = mod(scrollRef.current + v * dt, maxOffset);
        momentum.current.velocity = v * FRICTION ** (dt * 60);
        needsMoreFrames = true;
      } else if (v !== 0) {
        momentum.current.velocity = 0;
      }

      applyTransforms();

      if (needsMoreFrames) {
        animation.current.rafId = requestAnimationFrame(animationLoop);
      } else {
        animation.current.rafId = null;
      }
    };

    const scheduleLoop = () => {
      if (animation.current.rafId) {
        return;
      }
      animation.current.rafId = requestAnimationFrame(animationLoop);
    };

    const updateScrollOffset = (delta: number) => {
      scrollRef.current = mod(
        scrollRef.current + delta,
        geometry.current.totalRange
      );
      scheduleLoop();
    };

    const stopMomentum = () => {
      momentum.current.velocity = 0;
    };

    const startMomentum = () => {
      if (Math.abs(momentum.current.velocity) >= MIN_VELOCITY) {
        momentum.current.lastTime = performance.now();
        scheduleLoop();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      const timeSinceLastWheel = now - wheel.current.lastTime;
      if (timeSinceLastWheel > TRACKPAD_RESET_MS) {
        wheel.current.deltaHistory = [];
      }
      wheel.current.lastTime = now;
      const history = wheel.current.deltaHistory;
      history.push(Math.abs(e.deltaY));
      if (history.length > WHEEL_HISTORY_SIZE) {
        history.shift();
      }
      const allSmall =
        history.length >= WHEEL_HISTORY_SIZE &&
        history.every((d) => d < TRACKPAD_DELTA_THRESHOLD) &&
        e.deltaMode === 0;
      wheel.current.isTrackpad = allSmall;
      const sensitivity = wheel.current.isTrackpad
        ? TRACKPAD_SENSITIVITY
        : WHEEL_SENSITIVITY;
      updateScrollOffset(e.deltaY * sensitivity);
    };

    const handleTouchStart = (e: TouchEvent) => {
      stopMomentum();
      const first = e.touches[0];
      if (first) {
        momentum.current.touchStartY = first.clientY;
        momentum.current.lastTime = performance.now();
        momentum.current.velocity = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const first = e.touches[0];
      if (momentum.current.touchStartY === null || !first) {
        return;
      }
      e.preventDefault();
      const currentY = first.clientY;
      const now = performance.now();
      const deltaY = momentum.current.touchStartY - currentY;
      const timeDelta = Math.max(1, now - momentum.current.lastTime) / 1000;
      const instantVelocity = deltaY / timeDelta;
      momentum.current.velocity =
        momentum.current.velocity * (1 - TOUCH_VELOCITY_SMOOTHING) +
        instantVelocity * TOUCH_VELOCITY_SMOOTHING * TOUCH_SENSITIVITY;
      updateScrollOffset(deltaY * TOUCH_SENSITIVITY);
      momentum.current.touchStartY = currentY;
      momentum.current.lastTime = now;
    };

    const handleTouchEnd = () => {
      startMomentum();
      momentum.current.touchStartY = null;
    };

    recomputeGeometry();
    transformCache.current = {
      z: [],
      dx: [],
      dy: [],
      zIndex: [],
      willChange: [],
    };
    animation.current.lastFrameTime = performance.now();
    applyTransforms();

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchEnd, {
      passive: true,
    });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
      stopMomentum();
      if (animation.current.rafId) {
        cancelAnimationFrame(animation.current.rafId);
        animation.current.rafId = null;
      }
    };
  }, []);

  return (
    <div
      className="relative h-96 w-96 cursor-pointer touch-none overflow-hidden rounded-lg bg-black/95"
      ref={containerRef}
    >
      <div className="transform-3d pointer-events-none absolute inset-0 -rotate-x-39 -rotate-y-18 rotate-z-18 overflow-visible">
        {cardData.map((card, index) => (
          <div
            className="transform-3d pointer-events-auto absolute top-1/2 left-1/2"
            key={card.title}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              transform: "translate3d(-50%, -50%, 0px)",
            }}
          >
            <div
              className="absolute inset-0 flex -rotate-z-18 items-center justify-center rounded-sm border border-white/10"
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                backgroundColor: card.color,
              }}
            >
              <span className="select-none font-semibold text-[10px] text-white drop-shadow-lg">
                {card.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
