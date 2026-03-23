import type React from "react";
import { LocalClock } from "../clock/local-clock";
import { Header } from "./header";

export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-6 py-12 pb-12 md:py-16">
      <div className="pointer-events-none fixed top-0 right-0 left-0 z-50 h-20 w-full blur-gradient-top" />
      <div className="flex justify-end">
        <LocalClock location="CEST" timezone="Europe/Zurich" />
      </div>
      <Header description="Developer + (Designer)" title="Alessio Tortora" />
      {children}
    </div>
  );
}
