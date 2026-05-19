import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Tile {
  gridIndex: number;
  gridX: number;
  gridY: number;
  id: number;
}

interface ChunkUpdate {
  cx: number;
  cy: number;
}

function hypot(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function gridIndex(gridX: number, gridY: number): number {
  // biome-ignore lint/suspicious/noBitwiseOperators: integer hash for stable per-cell seed
  return ((gridX * 73_856_093) ^ (gridY * 19_349_663)) >>> 0;
}

function gridKey(x: number, y: number): number {
  // biome-ignore lint/suspicious/noBitwiseOperators: pack two 16-bit grid coords into one numeric Map key
  return ((x + 0x80_00) << 16) | ((y + 0x80_00) & 0xff_ff);
}

const CELL_W = 424;
const CELL_H = 289;
const BUFFER = 1;
const DRAG_THRESHOLD = 2;
const SAMPLE_WINDOW = 6;
const STOP_SPEED = 0.02;
const FRICTION_BASE = 0.995;
const TILE_UPDATE_THROTTLE_NORMAL = 16;
const TILE_UPDATE_THROTTLE_FAST = 50;

export default function InfiniteWorld() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);

  const p = useRef({ x: 0, y: 0 });
  const v = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);
  const lastRafT = useRef(0);

  const isDown = useRef(false);
  const exceeded = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const startPt = useRef({ x: 0, y: 0 });
  const lastSamplePt = useRef({ x: 0, y: 0 });
  const lastSampleT = useRef(0);
  const samples = useRef<{ x: number; y: number }[]>([]);

  const scheduled = useRef(false);
  const viewport = useRef({ width: 0, height: 0 });
  const lastCenter = useRef({ x: 999_999, y: 999_999 });
  const nextId = useRef(1);

  const tilesRef = useRef<Tile[]>([]);
  const [renderTick, setRenderTick] = useState(0);
  const lastTileHash = useRef(0);

  const pendingChunkUpdate = useRef<ChunkUpdate | null>(null);
  const lastChunkUpdate = useRef(0);

  const isTouchDevice = useMemo(
    () =>
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0),
    []
  );

  const applyTransform = useCallback(() => {
    const el = worldRef.current;
    if (!el) {
      return;
    }
    el.style.transform = `translate3d(${p.current.x}px, ${p.current.y}px, 0)`;
  }, []);

  const computeTiles = useCallback(() => {
    const { width: W, height: H } = viewport.current;
    if (W === 0 || H === 0) {
      return;
    }

    const centerX = -Math.round(p.current.x / CELL_W);
    const centerY = -Math.round(p.current.y / CELL_H);

    if (
      centerX === lastCenter.current.x &&
      centerY === lastCenter.current.y &&
      tilesRef.current.length > 0
    ) {
      return;
    }

    pendingChunkUpdate.current = { cx: centerX, cy: centerY };
  }, []);

  const updateTiles = useCallback((newTiles: Tile[]) => {
    tilesRef.current = newTiles;
  }, []);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: tile-recycling reconciliation kept in one pass for cache locality
  const applyPendingChunkUpdate = useCallback(() => {
    if (!pendingChunkUpdate.current) {
      return false;
    }

    const now = performance.now();
    const speed = hypot(v.current.x, v.current.y);
    const isFastPan = speed > 0.1;
    const throttleMs = isFastPan
      ? TILE_UPDATE_THROTTLE_FAST
      : TILE_UPDATE_THROTTLE_NORMAL;

    if (now - lastChunkUpdate.current < throttleMs) {
      return false;
    }

    const { cx, cy } = pendingChunkUpdate.current;
    pendingChunkUpdate.current = null;
    lastChunkUpdate.current = now;
    lastCenter.current.x = cx;
    lastCenter.current.y = cy;

    const { width: W, height: H } = viewport.current;
    if (W === 0 || H === 0) {
      return false;
    }

    const visibleCols = Math.ceil(W / CELL_W);
    const visibleRows = Math.ceil(H / CELL_H);
    const halfCols = Math.ceil(visibleCols / 2) + BUFFER;
    const halfRows = Math.ceil(visibleRows / 2) + BUFFER;

    const need = new Map<number, { x: number; y: number }>();
    for (let gy = cy - halfRows; gy <= cy + halfRows; gy++) {
      for (let gx = cx - halfCols; gx <= cx + halfCols; gx++) {
        need.set(gridKey(gx, gy), { x: gx, y: gy });
      }
    }

    const keep: Tile[] = [];
    const free: Tile[] = [];

    for (const tile of tilesRef.current) {
      const key = gridKey(tile.gridX, tile.gridY);
      if (need.has(key)) {
        keep.push(tile);
        need.delete(key);
      } else {
        free.push(tile);
      }
    }

    const out = keep;

    for (const { x, y } of need.values()) {
      const recycled = free.pop();
      if (recycled) {
        recycled.gridX = x;
        recycled.gridY = y;
        recycled.gridIndex = gridIndex(x, y);
        out.push(recycled);
      } else {
        out.push({
          id: nextId.current++,
          gridX: x,
          gridY: y,
          gridIndex: gridIndex(x, y),
        });
      }
    }

    updateTiles(out);

    let hash = 0;
    for (const tile of out) {
      // biome-ignore lint/suspicious/noBitwiseOperators: coerce sum into 32-bit int for stable hash comparison
      hash = (hash + tile.gridIndex) | 0;
    }

    if (hash !== lastTileHash.current) {
      lastTileHash.current = hash;
      setRenderTick((n) => n + 1);
    }

    return true;
  }, [updateTiles]);

  const runUpdate = useCallback(() => {
    scheduled.current = false;
    computeTiles();
    applyPendingChunkUpdate();
  }, [computeTiles, applyPendingChunkUpdate]);

  const scheduleUpdate = useCallback(() => {
    if (scheduled.current) {
      return;
    }
    scheduled.current = true;
    requestAnimationFrame(runUpdate);
  }, [runUpdate]);

  const inertiaTick = useCallback(() => {
    const now = performance.now();
    const dt = now - lastRafT.current;
    lastRafT.current = now;

    const vel = v.current;

    if (hypot(vel.x, vel.y) < STOP_SPEED) {
      vel.x = 0;
      vel.y = 0;
      scheduleUpdate();
      raf.current = null;
      return;
    }

    p.current.x += vel.x * dt;
    p.current.y += vel.y * dt;

    const decay = FRICTION_BASE ** dt;
    vel.x *= decay;
    vel.y *= decay;

    applyTransform();
    scheduleUpdate();

    raf.current = requestAnimationFrame(inertiaTick);
  }, [applyTransform, scheduleUpdate]);

  const stopInertia = useCallback(() => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
    }
    raf.current = null;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const stage = stageRef.current;
      if (!stage) {
        return;
      }

      stopInertia();

      isDown.current = true;
      exceeded.current = false;

      const cx = e.clientX;
      const cy = e.clientY;

      offset.current.x = cx - p.current.x;
      offset.current.y = cy - p.current.y;

      startPt.current.x = cx;
      startPt.current.y = cy;

      v.current.x = 0;
      v.current.y = 0;
      lastSamplePt.current.x = cx;
      lastSamplePt.current.y = cy;
      lastSampleT.current = performance.now();
      samples.current.length = 0;

      stage.setPointerCapture?.(e.pointerId);
      stage.classList.add("grabbing");
    },
    [stopInertia]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDown.current) {
        return;
      }

      const cx = e.clientX;
      const cy = e.clientY;

      if (!exceeded.current) {
        const dx0 = cx - startPt.current.x;
        const dy0 = cy - startPt.current.y;
        if (Math.abs(dx0) > DRAG_THRESHOLD || Math.abs(dy0) > DRAG_THRESHOLD) {
          exceeded.current = true;
        }
      }

      const now = performance.now();
      const dt = Math.max(1, now - lastSampleT.current);

      const instX = (cx - lastSamplePt.current.x) / dt;
      const instY = (cy - lastSamplePt.current.y) / dt;

      samples.current.push({ x: instX, y: instY });
      if (samples.current.length > SAMPLE_WINDOW) {
        samples.current.shift();
      }

      let ax = 0;
      let ay = 0;
      for (const s of samples.current) {
        ax += s.x;
        ay += s.y;
      }
      const len = samples.current.length;
      v.current.x = ax / len;
      v.current.y = ay / len;

      p.current.x = cx - offset.current.x;
      p.current.y = cy - offset.current.y;

      applyTransform();
      scheduleUpdate();

      lastSampleT.current = now;
      lastSamplePt.current.x = cx;
      lastSamplePt.current.y = cy;
    },
    [applyTransform, scheduleUpdate]
  );

  const onPointerUp = useCallback(() => {
    if (!isDown.current) {
      return;
    }
    isDown.current = false;

    stageRef.current?.classList.remove("grabbing");

    const vel = v.current;

    if (hypot(vel.x, vel.y) > STOP_SPEED) {
      lastRafT.current = performance.now();
      raf.current = requestAnimationFrame(inertiaTick);
      return;
    }

    vel.x = 0;
    vel.y = 0;
    scheduleUpdate();
  }, [inertiaTick, scheduleUpdate]);

  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      p.current.x -= e.deltaX;
      p.current.y -= e.deltaY;
      v.current.x = 0;
      v.current.y = 0;
      applyTransform();
      scheduleUpdate();
    },
    [applyTransform, scheduleUpdate]
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    const ro = new ResizeObserver(() => {
      const rect = stage.getBoundingClientRect();
      viewport.current.width = Math.round(rect.width);
      viewport.current.height = Math.round(rect.height);
      scheduleUpdate();
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, [scheduleUpdate]);

  useEffect(() => {
    applyTransform();
    scheduleUpdate();
    return () => stopInertia();
  }, [applyTransform, scheduleUpdate, stopInertia]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: renderTick is an intentional invalidation trigger
  const tiles = useMemo(() => tilesRef.current, [renderTick]);

  return (
    <>
      <style>{`
        .infinite-stage { cursor: grab; }
        .infinite-stage.grabbing { cursor: grabbing; }
      `}</style>
      <div
        className="infinite-stage relative h-[80vh] w-full max-w-6xl overflow-hidden rounded-lg bg-[#0b0b0c]"
        onPointerCancel={onPointerUp}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        ref={stageRef}
        style={{
          touchAction: "none",
          contain: "layout style paint",
        }}
      >
        <div style={{ position: "absolute", left: "50%", top: "50%" }}>
          <div
            ref={worldRef}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              willChange: "transform",
            }}
          >
            {tiles.map((tile) => {
              const xPx = tile.gridX * CELL_W;
              const yPx = tile.gridY * CELL_H;
              return (
                <div
                  key={tile.id}
                  style={{
                    position: "absolute",
                    width: CELL_W,
                    height: CELL_H,
                    marginLeft: -CELL_W / 2,
                    marginTop: -CELL_H / 2,
                    transform: `translate3d(${xPx}px, ${yPx}px, 0)`,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "rgba(255,255,255,0.9)",
                    fontFamily: "ui-sans-serif, system-ui",
                    userSelect: "none",
                  }}
                >
                  <div style={{ fontSize: 14, opacity: 0.9 }}>Tile</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>
                    {tile.gridX}, {tile.gridY}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 10 }}>
                    index: {tile.gridIndex}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-white/75 text-xs">
          pos: {Math.round(p.current.x)}, {Math.round(p.current.y)} | tiles:{" "}
          {tiles.length} | speed: {hypot(v.current.x, v.current.y).toFixed(2)} |{" "}
          {isTouchDevice ? "touch" : "mouse"}
        </div>
      </div>
    </>
  );
}
