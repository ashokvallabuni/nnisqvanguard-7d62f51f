import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[0.65rem] font-mono font-semibold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-primary",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive/15 text-destructive",
        outline: "text-foreground border-border",
        success: "border-success/30 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/10 text-warning",
        info: "border-primary/30 bg-primary/10 text-primary",
        accent: "border-accent/30 bg-accent/10 text-accent-foreground",
        active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
        locked: "border-destructive/30 bg-destructive/5 text-destructive",
        "coming-soon": "border-warning/40 bg-warning/10 text-warning",
        "in-progress": "border-primary/40 bg-primary/10 text-primary",
        completed: "border-success/40 bg-success/10 text-success",
        admin: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
        learner: "border-violet-500/40 bg-violet-500/10 text-violet-400",
        organization: "border-amber-500/40 bg-amber-500/10 text-amber-400",
        college: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
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
