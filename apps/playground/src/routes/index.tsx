import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="p-4">
      <h1 className="font-bold text-2xl">Playground</h1>
      <p>Code experiments and interactive demos.</p>
    </div>
  );
}
