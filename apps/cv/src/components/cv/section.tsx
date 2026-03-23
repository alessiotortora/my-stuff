import { cn } from "@repo/ui/lib/utils";
import type { ReactNode } from "react";
import { Heading } from "./heading";

interface SectionProps {
  children: ReactNode;
  className?: string;
  title: string;
}

export function Section({ title, children, className = "" }: SectionProps) {
  return (
    <div className="space-y-4">
      <Heading>{title}</Heading>
      <div className={cn("space-y-4", className)}>{children}</div>
    </div>
  );
}
