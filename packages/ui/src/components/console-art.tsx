"use client";

import { useEffect } from "react";

interface ConsoleArtProps {
  art?: string;
  enabled?: boolean;
  message?: string;
  method?: "log" | "info" | "warn" | "error";
}

const DEFAULT_ART = `
██╗  ██╗██╗██████╗ ███████╗    ███╗   ███╗███████╗
██║  ██║██║██╔══██╗██╔════╝    ████╗ ████║██╔════╝
███████║██║██████╔╝█████╗      ██╔████╔██║█████╗  
██╔══██║██║██╔══██╗██╔══╝      ██║╚██╔╝██║██╔══╝  
██║  ██║██║██║  ██║███████╗    ██║ ╚═╝ ██║███████╗
╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝    ╚═╝     ╚═╝╚══════╝
`;

export function ConsoleArt({
  art = DEFAULT_ART,
  message = "App initialized successfully!",
  enabled = true,
  method = "log",
}: ConsoleArtProps) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    if (message) {
      const lines = message.split("\\n");
      for (const line of lines) {
        console[method](`%c${line}`, "font-weight: bold;");
      }
    }
    console[method](`%c${art}`, "font-family: monospace; font-weight: bold;");
  }, [art, message, enabled, method]);

  return null;
}

export type { ConsoleArtProps };
