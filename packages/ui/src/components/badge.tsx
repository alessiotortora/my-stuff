import { Slot } from "@radix-ui/react-slot";
import { cn } from "@repo/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const badgeVariants = cva(
  "inline-flex h-6 items-center gap-1.5 rounded-full text-xs transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        muted: "bg-muted text-muted-foreground",
        success: "bg-success text-success-foreground",
        warning: "bg-warning text-warning-foreground",
        info: "bg-info text-info-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "px-2.5 py-0.5",
        sm: "px-2 py-0.5 text-[0.6875rem]",
        lg: "px-3 py-1 text-sm",
      },
      hasIcon: {
        true: "w-6 justify-center pr-0 pl-0 md:w-auto md:justify-start md:pr-3 md:pl-2.5",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      hasIcon: false,
    },
  }
);

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge = ({
  className,
  variant,
  size,
  icon,
  asChild = false,
  ...props
}: BadgeProps) => {
  const hasIcon = Boolean(icon);
  // biome-ignore lint/suspicious/noExplicitAny: Radix Slot ref type narrowing issue with React 19
  const Comp: any = asChild ? Slot : "span";

  return (
    <Comp
      className={cn(badgeVariants({ variant, size, hasIcon }), className)}
      data-slot="badge"
      {...props}
    >
      {icon && (
        <span className="flex size-4 shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      <span className={cn(hasIcon && "hidden md:block")}>{props.children}</span>
    </Comp>
  );
};

export { badgeVariants };
