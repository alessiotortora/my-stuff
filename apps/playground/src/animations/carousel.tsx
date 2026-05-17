import { useEffect, useRef } from "react";

const COLORS = [
  "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
  "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
  "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)",
  "linear-gradient(135deg, #6366f1 0%, #14b8a6 100%)",
  "linear-gradient(135deg, #db2777 0%, #f97316 100%)",
  "linear-gradient(135deg, #84cc16 0%, #22d3ee 100%)",
  "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
  "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
  "linear-gradient(135deg, #facc15 0%, #f43f5e 100%)",
];

const FRICTION = 0.9;
const WHEEL_SENS = 0.6;
const DRAG_SENS = 1.0;
const MAX_ROTATION = 28;
const MAX_DEPTH = 140;
const MIN_SCALE = 0.92;
const SCALE_RANGE = 0.1;
const GAP = 28;

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export default function Carousel() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const state = useRef({
    items: [] as { el: HTMLDivElement | null; pos: number }[],
    positions: new Float32Array(COLORS.length),
    cardW: 300,
    cardH: 400,
    step: 0,
    track: 0,
    scrollPos: 0,
    v: 0,
    vwHalf: 0,
    rafId: null as number | null,
    lastTime: 0,
  });

  const dragState = useRef({
    dragging: false,
    lastPos: 0,
    lastT: 0,
    lastDelta: 0,
  });

  useEffect(() => {
    const measure = () => {
      const sample = cardRefs.current[0];
      if (!sample) {
        return;
      }
      const rect = sample.getBoundingClientRect();
      const s = state.current;
      s.cardW = rect.width || 300;
      s.cardH = rect.height || 400;
      s.step = s.cardW + GAP;
      s.track = COLORS.length * s.step;
      s.vwHalf = window.innerWidth * 0.5;
      s.items = COLORS.map((_, i) => ({
        el: cardRefs.current[i] ?? null,
        pos: i * s.step,
      }));
      s.positions = new Float32Array(COLORS.length);
    };

    const transformFor = (screenPos: number) => {
      const s = state.current;
      const norm = Math.max(-1, Math.min(1, screenPos / s.vwHalf));
      const absNorm = Math.abs(norm);
      const invNorm = 1 - absNorm;
      const rotation = -norm * MAX_ROTATION;
      const tz = invNorm * MAX_DEPTH;
      const scale = MIN_SCALE + invNorm * SCALE_RANGE;
      return {
        transform: `translate3d(${screenPos}px, -50%, ${tz}px) rotateY(${rotation}deg) scale(${scale})`,
        z: tz,
        norm,
      };
    };

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: physics loop with branch-heavy per-frame logic
    const update = () => {
      const s = state.current;
      const half = s.track / 2;
      let closestIdx = -1;
      let closestDist = Number.POSITIVE_INFINITY;

      for (let i = 0; i < s.items.length; i++) {
        const item = s.items[i];
        if (!item) {
          continue;
        }
        let pos = item.pos - s.scrollPos;
        if (pos < -half) {
          pos += s.track;
        }
        if (pos > half) {
          pos -= s.track;
        }
        s.positions[i] = pos;
        const dist = Math.abs(pos);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }

      const prevIdx = (closestIdx - 1 + s.items.length) % s.items.length;
      const nextIdx = (closestIdx + 1) % s.items.length;

      for (let i = 0; i < s.items.length; i++) {
        const item = s.items[i];
        if (!item) {
          continue;
        }
        const pos = s.positions[i] ?? 0;
        const { transform, z, norm } = transformFor(pos);
        if (item.el) {
          item.el.style.transform = transform;
          item.el.style.zIndex = String(1000 + Math.round(z));
          const isCore = i === closestIdx || i === prevIdx || i === nextIdx;
          const blur = isCore ? 0 : 2 * Math.abs(norm) ** 1.1;
          item.el.style.filter = `blur(${blur.toFixed(2)}px)`;
        }
      }
    };

    const tick = (t: number) => {
      const s = state.current;
      const dt = s.lastTime ? (t - s.lastTime) / 1000 : 0;
      s.lastTime = t;
      s.scrollPos = mod(s.scrollPos + s.v * dt, s.track);
      const decay = FRICTION ** (dt * 60);
      s.v *= decay;
      if (Math.abs(s.v) < 0.02) {
        s.v = 0;
      }
      if (s.v === 0 && !dragState.current.dragging) {
        s.rafId = null;
        return;
      }
      update();
      s.rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      const s = state.current;
      if (s.rafId) {
        return;
      }
      s.lastTime = 0;
      update();
      s.rafId = requestAnimationFrame(tick);
    };

    const stop = () => {
      const s = state.current;
      if (s.rafId) {
        cancelAnimationFrame(s.rafId);
        s.rafId = null;
      }
    };

    measure();
    update();
    start();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const s = state.current;
        const prevStep = s.step || 1;
        const ratio = s.scrollPos / (COLORS.length * prevStep);
        measure();
        s.scrollPos = mod(ratio * s.track, s.track);
        update();
      }, 150);
    };

    const stage = stageRef.current;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = state.current;
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      s.v += delta * WHEEL_SENS * 20;
      if (!s.rafId) {
        start();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!stage) {
        return;
      }
      const drag = dragState.current;
      drag.dragging = true;
      drag.lastPos = e.clientX;
      drag.lastT = performance.now();
      drag.lastDelta = 0;
      stage.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const drag = dragState.current;
      if (!drag.dragging) {
        return;
      }
      const s = state.current;
      const now = performance.now();
      const dPos = e.clientX - drag.lastPos;
      const dt = Math.max(1, now - drag.lastT) / 1000;
      s.scrollPos = mod(s.scrollPos - dPos * DRAG_SENS, s.track);
      drag.lastDelta = dPos / dt;
      drag.lastPos = e.clientX;
      drag.lastT = now;
      update();
    };

    const onPointerUp = (e: PointerEvent) => {
      const drag = dragState.current;
      if (!drag.dragging) {
        return;
      }
      drag.dragging = false;
      stage?.releasePointerCapture(e.pointerId);
      state.current.v = -drag.lastDelta * DRAG_SENS;
      if (!state.current.rafId && state.current.v !== 0) {
        start();
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);
    stage?.addEventListener("wheel", onWheel, { passive: false });
    stage?.addEventListener("pointerdown", onPointerDown);
    stage?.addEventListener("pointermove", onPointerMove);
    stage?.addEventListener("pointerup", onPointerUp);

    return () => {
      stop();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      stage?.removeEventListener("wheel", onWheel);
      stage?.removeEventListener("pointerdown", onPointerDown);
      stage?.removeEventListener("pointermove", onPointerMove);
      stage?.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  return (
    <div
      className="relative h-[80vh] w-full max-w-6xl cursor-grab select-none overflow-hidden rounded-lg active:cursor-grabbing"
      ref={stageRef}
      style={{ perspective: "1800px", touchAction: "none" }}
    >
      <div
        className="absolute inset-0 z-10"
        style={{ transformStyle: "preserve-3d" }}
      >
        {COLORS.map((bg, index) => (
          <div
            className="absolute top-1/2 left-1/2 isolate aspect-[4/5] w-[min(26vw,360px)] will-change-[transform,filter]"
            key={bg}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            style={{
              backfaceVisibility: "hidden",
              transformStyle: "preserve-3d",
              transformOrigin: "90% center",
            }}
          >
            <div
              className="h-full w-full rounded-2xl shadow-2xl ring-1 ring-white/10"
              style={{ background: bg }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
