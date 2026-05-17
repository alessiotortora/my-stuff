import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

const ANIMATIONS = [
  "3d-stack",
  "carousel",
  "cursor",
  "exposure",
  "fake-3d-stack",
  "folder",
  "menu",
  "morph",
  "swipe",
  "unfold",
] as const;

function Home() {
  return (
    <main className="min-h-screen px-6 py-12 font-mono sm:px-12 sm:py-20">
      <h1 className="mb-10 text-sm opacity-50">playground</h1>
      <ol className="flex flex-col gap-1">
        {ANIMATIONS.map((slug, i) => (
          <li key={slug}>
            <Link
              className="group flex items-baseline gap-6 text-base tabular-nums opacity-70 transition-opacity hover:opacity-100"
              params={{ slug }}
              to="/animations/$slug"
            >
              <span className="opacity-50 group-hover:opacity-100">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{slug}</span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
