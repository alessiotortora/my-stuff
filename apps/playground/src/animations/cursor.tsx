import { motion, useSpring } from "motion/react";

export default function Cursor() {
  const x = useSpring(0, { mass: 0.1 });
  const y = useSpring(0, { mass: 0.1 });
  const opacity = useSpring(0);

  return (
    <div className="h-72 w-full max-w-2xl overflow-hidden rounded-md border border-muted-foreground/20">
      <div
        className="h-full w-full overflow-hidden"
        onPointerEnter={() => opacity.set(1)}
        onPointerLeave={() => opacity.set(0)}
        onPointerMove={(e) => {
          const bounds = e.currentTarget.getBoundingClientRect();
          x.set(e.clientX - bounds.left - 24);
          y.set(e.clientY - bounds.top - 24);
        }}
      >
        <motion.div
          className="h-10 w-10 rounded-full bg-red-500"
          style={{ x, y, opacity }}
        />
      </div>
    </div>
  );
}
