import { MotionConfig, motion, type Transition } from "motion/react";
import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

const transition: Transition = { type: "spring", bounce: 0, duration: 0.4 };

const Context = createContext<{
  status: string;
  setStatus: Dispatch<SetStateAction<string>>;
}>({ status: "", setStatus: () => null });

function InnerContent() {
  const ctx = useContext(Context);
  const isOpen = ctx.status === "open";

  return (
    <button
      className="relative aspect-[1.3] h-40 border-0 bg-transparent p-0 md:h-64"
      onClick={() => {
        if (isOpen) {
          ctx.setStatus("idle");
          return;
        }
        ctx.setStatus("open");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (isOpen) {
            ctx.setStatus("idle");
            return;
          }
          ctx.setStatus("open");
        }
      }}
      type="button"
    >
      <motion.div
        animate={
          isOpen
            ? {
                backgroundImage:
                  "linear-gradient(to bottom right, #b4e0fa 0%, #399ee6 80%)",
              }
            : {}
        }
        className="absolute bottom-0 left-0 h-[140px] w-full rounded-[16px] rounded-tl-none shadow-[0_32px_32px_-12px_rgba(0,0,0,0.46)] ring-1 ring-white/25 md:h-[220px] md:rounded-[22px] md:shadow-[0_48px_48px_-16px_rgba(0,0,0,0.46)]"
        initial={{
          backgroundImage:
            "linear-gradient(to bottom right, #b4e0fa 0%, #4eb1e7 100%)",
        }}
        style={{ backgroundAttachment: "fixed" }}
      >
        <motion.div
          animate={
            isOpen
              ? {
                  backgroundImage:
                    "linear-gradient(to bottom right, #b4e0fa 0%, #399ee6 80%)",
                }
              : {}
          }
          className="absolute -top-4 left-0 h-4 w-[40%] rounded-tl-[16px] rounded-tr-[8px] md:-top-5 md:h-10 md:rounded-tl-[22px] md:rounded-tr-[12px]"
          initial={{
            backgroundImage:
              "linear-gradient(to bottom right, #b4e0fa 0%, #4eb1e7 100%)",
          }}
          style={{ backgroundAttachment: "fixed" }}
        >
          <motion.div
            animate={
              isOpen
                ? {
                    backgroundImage:
                      "linear-gradient(to bottom right, #b4e0fa 0%, #399ee6 100%)",
                  }
                : {}
            }
            className="absolute top-2 -right-2 size-2 md:top-3 md:-right-3 md:size-3"
            initial={{
              backgroundImage:
                "linear-gradient(to bottom right, #b4e0fa 0%, #4eb1e7 100%)",
            }}
            style={{
              backgroundAttachment: "fixed",
              maskImage:
                "radial-gradient(circle 8px at 8px 0px, transparent 0, transparent 8px, black 8px)",
            }}
          />
        </motion.div>
      </motion.div>
      <motion.div
        animate={
          isOpen
            ? {
                transform: "perspective(1100px) rotateX(-70deg)",
              }
            : {}
        }
        className="absolute bottom-0 left-0 grid h-32 w-full origin-bottom place-items-center rounded-[22px] bg-gradient-to-br from-[#b4e0fa] to-[#4eb1e7] shadow-[0_-1px_1px_1px_rgba(0,0,0,0.06),0_-6px_6px_3px_rgba(0,0,0,0.06),0_-3px_3px_1.5px_rgba(0,0,0,0.06),0_-12px_12px_6px_rgba(0,0,0,0.06),0_-24px_24px_12px_rgba(0,0,0,0.06)] ring-1 ring-white/20 md:h-52"
        initial={{
          transform: "perspective(1100px) rotateX(0deg)",
        }}
        whileTap={{
          transform: "perspective(1100px) rotateX(-10deg)",
        }}
      />
    </button>
  );
}

export default function Folder() {
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setStatus("idle");
      }
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <Context.Provider value={{ status, setStatus }}>
      <MotionConfig transition={transition}>
        <main className="relative flex h-72 w-full max-w-2xl items-center justify-center rounded-md border border-muted-foreground/20">
          <InnerContent />
        </main>
      </MotionConfig>
    </Context.Provider>
  );
}
