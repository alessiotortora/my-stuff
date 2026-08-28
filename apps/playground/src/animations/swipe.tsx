import {
  animate,
  clamp,
  type MotionValue,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const ITEM_HEIGHT = 80;
const ITEM_MAX_WIDTH = 384;
const SPRING_OPTIONS = { damping: 80, stiffness: 900 };

interface IconProps {
  size?: number;
}

const MailIcon = ({ size = 24 }: IconProps) => (
  <svg
    fill="none"
    height={size}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width={size}
  >
    <title>Mail</title>
    <path d="M3 8l9 6 9-6" />
    <rect height="14" rx="2" width="18" x="3" y="5" />
  </svg>
);

const ClockIcon = ({ size = 24 }: IconProps) => (
  <svg
    fill="none"
    height={size}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width={size}
  >
    <title>Snooze</title>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const TrashIcon = ({ size = 24 }: IconProps) => (
  <svg
    fill="none"
    height={size}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width={size}
  >
    <title>Trash</title>
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

const FlagIcon = ({ size = 24 }: IconProps) => (
  <svg
    fill="none"
    height={size}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width={size}
  >
    <title>Flag</title>
    <path d="M4 21V4h12l-2 4 2 4H4" />
  </svg>
);

const styles = {
  actionCenterer: {
    alignItems: "center",
    display: "flex",
    height: "100%",
    justifyContent: "center",
    width: "25%",
  },
  actionContent: {
    alignItems: "center",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    fontSize: 12,
    gap: 4,
    justifyContent: "center",
  },
  actionFullWidth: {
    display: "flex",
    inset: 0,
    position: "absolute",
  },
  actionsGroup: {
    display: "flex",
    height: "100%",
    position: "absolute",
    userSelect: "none",
    WebkitUserSelect: "none",
    width: "100%",
  },
  avatar: {
    alignItems: "center",
    background: "linear-gradient(135deg, #f97316 0%, #db2777 100%)",
    borderRadius: 999,
    color: "#fff",
    display: "flex",
    flexShrink: 0,
    fontSize: 14,
    fontWeight: 600,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  mailBody: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
    userSelect: "none",
    WebkitUserSelect: "none",
  },
  mailPreview: {
    color: "rgba(245,245,245,0.5)",
    fontSize: 11,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  mailRow: {
    alignItems: "baseline",
    display: "flex",
    gap: 8,
    justifyContent: "space-between",
  },
  mailSender: {
    color: "#f5f5f5",
    fontSize: 13,
    fontWeight: 600,
  },
  mailSubject: {
    color: "rgba(245,245,245,0.85)",
    fontSize: 12,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  mailTime: {
    color: "rgba(245,245,245,0.5)",
    flexShrink: 0,
    fontSize: 11,
  },
  outerContainer: {
    cursor: "default",
    padding: 16,
  },
  swipeContainer: {
    backgroundColor: "black",
    border: "1px solid #1d2628",
    borderRadius: 12,
    height: ITEM_HEIGHT,
    maxWidth: ITEM_MAX_WIDTH,
    overflow: "hidden",
    position: "relative",
    touchAction: "none",
    width: "80dvw",
    zIndex: 0,
  },
  swipeItem: {
    alignItems: "center",
    backgroundColor: "#0b1011",
    display: "flex",
    gap: 12,
    inset: 0,
    paddingLeft: 14,
    paddingRight: 14,
    position: "absolute",
    zIndex: 10,
  },
} as const satisfies Record<string, React.CSSProperties>;

export default function Swipe() {
  const [isSwiping, setIsSwiping] = useState(false);
  const swipeItemRef = useRef<HTMLDivElement>(null);
  const swipeItemWidth = useRef(0);
  const swipeStartX = useRef(0);
  const swipeStartOffset = useRef(0);
  const fullSwipeSnapPosition = useRef<"left" | "right" | null>(null);
  const swipeContainerRef = useRef<HTMLDivElement>(null);

  const swipeAmount = useMotionValue(0);
  const swipeAmountSpring = useSpring(swipeAmount, SPRING_OPTIONS);
  const swipeProgress = useTransform(swipeAmount, (value) => {
    const itemWidth = swipeItemWidth.current;
    if (!itemWidth) {
      return 0;
    }
    return value / itemWidth;
  });

  useEffect(() => {
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: swipe gesture state machine
    const handlePointerMove = (info: PointerEvent) => {
      if (!isSwiping) {
        return;
      }
      const itemWidth = swipeItemWidth.current;
      if (!itemWidth) {
        return;
      }

      const swipeDelta =
        info.clientX - swipeStartX.current + swipeStartOffset.current;
      const fullSwipeThreshold = itemWidth * 0.8;
      const isBeyondThreshold = Math.abs(swipeDelta) > fullSwipeThreshold;
      const isLeft = swipeDelta < 0;

      if (fullSwipeSnapPosition.current) {
        const isBackToCenter = Math.abs(swipeDelta) < fullSwipeThreshold;
        if (isBackToCenter) {
          fullSwipeSnapPosition.current = null;
          swipeAmount.set(swipeDelta);
        } else {
          const snapPosition =
            fullSwipeSnapPosition.current === "left" ? -itemWidth : itemWidth;
          swipeAmount.set(snapPosition);
        }
        return;
      }

      if (isBeyondThreshold) {
        const snapDirection = isLeft ? "left" : "right";
        const snapPosition = isLeft ? -itemWidth : itemWidth;
        fullSwipeSnapPosition.current = snapDirection;
        swipeAmount.set(snapPosition);
      } else {
        swipeAmount.set(clamp(-itemWidth, itemWidth, swipeDelta));
      }
    };

    const handlePointerUp = () => {
      if (!isSwiping) {
        return;
      }
      const itemWidth = swipeItemWidth.current;
      if (!itemWidth) {
        return;
      }

      const currentOffset = swipeAmount.get();
      let targetOffset = 0;
      const snapThreshold = itemWidth * 0.25;

      if (Math.abs(currentOffset) > snapThreshold) {
        targetOffset = currentOffset > 0 ? itemWidth * 0.5 : itemWidth * -0.5;
      }

      const isFullySwiped = fullSwipeSnapPosition.current;
      if (isFullySwiped && swipeContainerRef.current) {
        animate([
          [
            swipeContainerRef.current,
            { pointerEvents: "none", scaleX: 0.95, scaleY: 1.05, y: -24 },
            { duration: 0.1, ease: "easeOut" },
          ],
          [
            swipeContainerRef.current,
            { pointerEvents: "auto", scaleX: 1, scaleY: 1, y: 0 },
            { duration: 0.6, type: "spring" },
          ],
        ]);
        targetOffset = 0;
        animate(swipeAmount, targetOffset, { delay: 0.3, duration: 0.5 });
      } else {
        swipeAmount.set(targetOffset);
      }

      setIsSwiping(false);
      fullSwipeSnapPosition.current = null;
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isSwiping, swipeAmount]);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = swipeItemRef.current?.getBoundingClientRect().width;
      if (!newWidth) {
        return;
      }
      swipeItemWidth.current = newWidth;
      const currentProgress = swipeProgress.get();
      const newOffset = currentProgress * newWidth;
      swipeAmount.jump(newOffset);
      swipeAmountSpring.jump(newOffset);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [swipeAmount, swipeAmountSpring, swipeProgress]);

  return (
    <div style={styles.outerContainer}>
      <motion.div
        onPointerDown={(info) => {
          setIsSwiping(true);
          swipeStartX.current = info.clientX;
          swipeStartOffset.current = swipeAmount.get();
        }}
        ref={swipeContainerRef}
        style={styles.swipeContainer}
      >
        <motion.div
          ref={swipeItemRef}
          style={{ ...styles.swipeItem, x: swipeAmountSpring }}
        >
          <SwipeItemContent swipeProgress={swipeProgress} />
        </motion.div>

        <ActionsGroup
          primaryAction={
            <Action
              bgColor="#0d63f8"
              primary
              side="left"
              swipeProgress={swipeProgress}
            >
              <ActionContent icon={<MailIcon />} label="Read" />
            </Action>
          }
          secondaryAction={
            <Action bgColor="#9911ff" side="left" swipeProgress={swipeProgress}>
              <ActionContent icon={<ClockIcon />} label="Remind me" />
            </Action>
          }
          side="left"
          swipeAmount={swipeAmountSpring}
        />

        <ActionsGroup
          primaryAction={
            <Action
              bgColor="#ef4444"
              primary
              side="right"
              swipeProgress={swipeProgress}
            >
              <ActionContent icon={<TrashIcon />} label="Trash" />
            </Action>
          }
          secondaryAction={
            <Action
              bgColor="#f97316"
              side="right"
              swipeProgress={swipeProgress}
            >
              <ActionContent icon={<FlagIcon />} label="Flag" />
            </Action>
          }
          side="right"
          swipeAmount={swipeAmountSpring}
        />
      </motion.div>
    </div>
  );
}

function ActionsGroup({
  swipeAmount,
  side,
  primaryAction,
  secondaryAction,
}: {
  swipeAmount: MotionValue<number>;
  side: "left" | "right";
  primaryAction: React.ReactNode;
  secondaryAction: React.ReactNode;
}) {
  return (
    <motion.div
      style={{
        ...styles.actionsGroup,
        left: side === "right" ? "100%" : undefined,
        right: side === "left" ? "100%" : undefined,
        x: swipeAmount,
      }}
    >
      {secondaryAction}
      {primaryAction}
    </motion.div>
  );
}

function Action({
  children,
  primary = false,
  swipeProgress,
  side,
  bgColor = "#0f1115",
}: {
  children: React.ReactNode;
  primary?: boolean;
  swipeProgress: MotionValue<number>;
  side: "left" | "right";
  bgColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const actionWidth = useRef(0);

  const calculateX = useCallback(
    (sp: number) => {
      const width = actionWidth.current;
      if (primary) {
        const abs = Math.abs(sp);
        if (abs >= 0.8) {
          return 0;
        }
        return ((sp * width) / 2) * -1;
      }
      return 0;
    },
    [primary]
  );

  const x = useSpring(0, SPRING_OPTIONS);
  useMotionValueEvent(swipeProgress, "change", (next) => {
    x.set(calculateX(next));
  });

  useEffect(() => {
    const update = () => {
      const w = ref.current?.getBoundingClientRect().width;
      if (!w) {
        return;
      }
      actionWidth.current = w;
      x.jump(calculateX(swipeProgress.get()));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [swipeProgress, x, calculateX]);

  const finalStateOpacity = primary ? 1 : 0;
  const _opacity = useTransform(
    swipeProgress,
    [-1, -0.8, -0.5, -0.25, 0.25, 0.5, 0.8, 1],
    [finalStateOpacity, 1, 1, 0, 0, 1, 1, finalStateOpacity]
  );
  const contentOpacity = useSpring(_opacity, SPRING_OPTIONS);

  const _contentX = useTransform(
    swipeProgress,
    [-1, -0.8, -0.5, 0.5, 0.8, 1],
    [0, 16, 0, 0, -16, 0]
  );
  const contentX = useSpring(_contentX, SPRING_OPTIONS);

  const _contentScale = useTransform(
    swipeProgress,
    [-1, -0.8, 0, 0.8, 1],
    [1, 0.8, 1, 0.8, 1]
  );
  const contentScale = useSpring(_contentScale, SPRING_OPTIONS);

  return (
    <motion.div
      ref={ref}
      style={{
        ...styles.actionFullWidth,
        backgroundColor: bgColor,
        justifyContent: side === "right" ? "flex-start" : "flex-end",
        x,
      }}
    >
      <motion.div style={styles.actionCenterer}>
        <motion.span
          style={{
            opacity: contentOpacity,
            scale: contentScale,
            transformOrigin: side === "right" ? "right" : "left",
            x: contentX,
          }}
        >
          {children}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

function ActionContent({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span style={styles.actionContent}>
      {icon}
      {label}
    </span>
  );
}

function SwipeItemContent({
  swipeProgress,
}: {
  swipeProgress: MotionValue<number>;
}) {
  const _opacity = useTransform(swipeProgress, [-0.5, 0, 0.5], [0, 1, 0]);
  const opacity = useSpring(_opacity, SPRING_OPTIONS);

  const _x = useTransform(swipeProgress, [-0.5, 0, 0.5], [40, 0, -40]);
  const x = useSpring(_x, SPRING_OPTIONS);

  return (
    <motion.div
      style={{
        alignItems: "center",
        display: "flex",
        gap: 12,
        opacity,
        width: "100%",
        x,
      }}
    >
      <div style={styles.avatar}>A</div>
      <div style={styles.mailBody}>
        <div style={styles.mailRow}>
          <span style={styles.mailSender}>Alessio</span>
          <span style={styles.mailTime}>9:42</span>
        </div>
        <span style={styles.mailSubject}>Coffee tomorrow?</span>
        <span style={styles.mailPreview}>
          Hey — same place at 9? I&apos;ll bring the new beans…
        </span>
      </div>
    </motion.div>
  );
}
