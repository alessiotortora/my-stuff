import {
  AnimatePresence,
  motion,
  type Transition,
  type Variants,
} from "motion/react";
import { useState } from "react";

const NAV_ITEMS = [
  { id: "brews", label: "Brews" },
  { id: "pastries", label: "Pastries" },
  { id: "beans", label: "Beans" },
];

const MENUS = {
  brews: [
    {
      title: "Espresso",
      items: ["Single shot", "Double shot", "Lungo", "Ristretto"],
    },
    {
      title: "Filter",
      items: ["V60", "Chemex", "Aeropress", "French press"],
    },
    {
      title: "Cold",
      items: ["Cold brew", "Nitro", "Sparkling", "Iced latte"],
    },
  ],
  pastries: [
    {
      title: "Sweet",
      items: ["Croissant", "Kouign-amann", "Cinnamon roll", "Canelé"],
    },
    {
      title: "Savoury",
      items: ["Ham & cheese", "Mushroom toast", "Feta danish"],
    },
    {
      title: "Daily",
      items: ["Monday cookie", "Tuesday loaf", "Weekend tart"],
    },
  ],
  beans: [
    {
      title: "Ethiopia",
      items: ["Yirgacheffe", "Sidamo", "Guji"],
    },
    {
      title: "Colombia",
      items: ["Huila", "Nariño", "Tolima"],
    },
    {
      title: "Guatemala",
      items: ["Huehuetenango", "Antigua", "Atitlán"],
    },
  ],
};

const indicatorTransition: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 35,
};
const contentTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};
const columnTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};
const panelEnterTransition: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 35,
};
const panelExitTransition: Transition = { duration: 0.15, ease: "easeOut" };

const contentOffsetX = 40;
const columnOffsetY = 8;
const panelOffsetY = -8;
const columnStagger = 0.04;

export default function Menu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);

  const contentVariants: Variants = {
    enter: (d: number) => ({
      opacity: 0,
      x: d ? d * contentOffsetX : 0,
    }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({
      opacity: 0,
      x: d ? d * -contentOffsetX : 0,
    }),
  };

  const handleHover = (id: string) => {
    if (activeMenu !== null && activeMenu !== id) {
      const oldIdx = NAV_ITEMS.findIndex((n) => n.id === activeMenu);
      const newIdx = NAV_ITEMS.findIndex((n) => n.id === id);
      setDirection(newIdx > oldIdx ? 1 : -1);
    } else {
      setDirection(0);
    }
    setActiveMenu(id);
  };

  const handleLeave = () => {
    setDirection(0);
    setActiveMenu(null);
  };

  return (
    <div className="flex min-h-[420px] w-full items-start justify-center pt-10">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: hover-driven mega menu — leave handler on shell wrapper is intentional */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: same as above */}
      <div className="relative w-[560px] pb-2" onMouseLeave={handleLeave}>
        <nav className="flex gap-0.5 rounded-xl border border-[#1d2628] bg-[#0b1011] p-1.5">
          {NAV_ITEMS.map((item) => (
            <button
              className="relative flex-1 cursor-pointer border-none bg-transparent px-4 py-2.5 font-medium text-sm transition-colors"
              key={item.id}
              onMouseEnter={() => handleHover(item.id)}
              style={{
                color:
                  activeMenu === item.id ? "#f5f5f5" : "rgba(245,245,245,0.5)",
              }}
              type="button"
            >
              {activeMenu === item.id && (
                <motion.div
                  className="absolute inset-0.5 rounded-lg bg-[rgba(131,230,247,0.06)]"
                  layoutId="menu-indicator"
                  transition={indicatorTransition}
                />
              )}
              <span className="relative z-10 inline-flex items-center">
                {item.label}
                <motion.svg
                  animate={{ rotate: activeMenu === item.id ? 180 : 0 }}
                  className="ml-1.5"
                  fill="none"
                  height="6"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  viewBox="0 0 10 6"
                  width="10"
                >
                  <path
                    d="M1 1l4 4 4-4"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </motion.svg>
              </span>
            </button>
          ))}
        </nav>

        <AnimatePresence>
          {activeMenu && (
            <motion.div
              animate={{
                opacity: 1,
                y: 0,
                transition: panelEnterTransition,
              }}
              className="absolute top-full right-0 left-0 mt-1 overflow-hidden rounded-xl border border-[#1d2628] bg-[#0b1011] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
              exit={{
                opacity: 0,
                y: panelOffsetY,
                transition: panelExitTransition,
              }}
              initial={{ opacity: 0, y: panelOffsetY }}
              key="panel"
              style={{ transformOrigin: "top center" }}
            >
              <AnimatePresence custom={direction} mode="popLayout">
                <motion.div
                  animate="center"
                  className="grid grid-cols-3 gap-5"
                  custom={direction}
                  exit="exit"
                  initial="enter"
                  key={activeMenu}
                  transition={contentTransition}
                  variants={contentVariants}
                >
                  {MENUS[activeMenu as keyof typeof MENUS].map((col, i) => (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      initial={{
                        opacity: 0,
                        y: direction ? 0 : columnOffsetY,
                      }}
                      key={col.title}
                      transition={{
                        ...columnTransition,
                        delay: i * columnStagger,
                      }}
                    >
                      <div className="px-2.5 pb-3 font-semibold text-[rgba(245,245,245,0.5)] text-xs uppercase tracking-wider">
                        {col.title}
                      </div>
                      {col.items.map((link) => (
                        <div
                          className="cursor-pointer rounded-md px-2.5 py-2 text-[#f5f5f5] text-sm transition-colors hover:bg-white/[0.08]"
                          key={link}
                        >
                          {link}
                        </div>
                      ))}
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
