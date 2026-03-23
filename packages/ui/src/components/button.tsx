"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "@repo/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        muted: "bg-muted text-muted-foreground shadow-xs hover:bg-muted/80",
        link: "!px-0 font-normal text-primary underline decoration-muted-foreground decoration-dashed underline-offset-4 hover:text-primary/80",
      },
      size: {
        default: "h-8 px-4 py-2 has-[>svg]:px-3",
        sm: "h-7 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-9 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function Button({
  children,
  className,
  variant,
  size,
  asChild = false,
  icon,
  ...props
}: ButtonProps) {
  // biome-ignore lint/suspicious/noExplicitAny: Radix Slot ref type narrowing issue with React 19
  const Comp: any = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      data-slot="button"
      type={asChild ? undefined : "button"}
      {...props}
    >
      {children}
      {icon && (
        <span className="flex shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
    </Comp>
  );
}

export { buttonVariants };
