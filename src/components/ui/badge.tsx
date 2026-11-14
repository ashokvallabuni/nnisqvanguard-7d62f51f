import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-nisq-blue-soft focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-nisq-blue-tint text-nisq-blue",
        secondary: "border-nisq-border bg-nisq-offwhite text-nisq-text",
        destructive: "border-nisq-danger/30 bg-nisq-danger-tint text-nisq-danger",
        outline: "border-nisq-border bg-nisq-white text-nisq-text",
        success: "border-transparent bg-nisq-blue-tint text-nisq-blue",
        warning: "border-nisq-border bg-nisq-offwhite text-nisq-text",
        info: "border-transparent bg-nisq-blue-tint text-nisq-blue",
        accent: "border-transparent bg-nisq-blue-tint text-nisq-blue",
        active: "border-transparent bg-nisq-blue-tint text-nisq-blue",
        locked: "border-nisq-border bg-nisq-offwhite text-nisq-muted",
        "coming-soon": "border-nisq-border bg-nisq-offwhite text-nisq-muted",
        "in-progress": "border-transparent bg-nisq-blue-tint text-nisq-blue",
        completed: "border-transparent bg-nisq-blue text-nisq-white",
        admin: "border-transparent bg-nisq-blue-tint text-nisq-blue",
        learner: "border-transparent bg-nisq-blue-tint text-nisq-blue",
        organization: "border-nisq-border bg-nisq-offwhite text-nisq-text",
        college: "border-nisq-border bg-nisq-offwhite text-nisq-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
