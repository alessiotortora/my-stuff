import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/animations")({
  component: AnimationsLayout,
});

function AnimationsLayout() {
  return (
    <main className="relative min-h-screen">
      <Link
        className="absolute top-6 left-6 z-50 font-mono text-sm tabular-nums opacity-50 transition-opacity hover:opacity-100"
        to="/"
      >
        ← back
      </Link>
      <div className="flex min-h-screen items-center justify-center p-8">
        <Outlet />
      </div>
    </main>
  );
}
