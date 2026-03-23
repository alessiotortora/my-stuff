import type React from "react";
import { Header } from "./header";

export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-6 py-12 pb-12 md:py-16">
      <Header description="Developer + (Designer)" title="Alessio Tortora" />
      {children}
      <div className="mt-12 flex h-16 w-full flex-col items-end justify-end font-script">
        <span>Alessio Tortora</span>
        <span className="text-sm">
          {new Date().toLocaleDateString("en-DE", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
