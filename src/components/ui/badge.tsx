import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-[#BAE6FD] bg-primary/10 text-primary",
        secondary: "border-border bg-muted text-muted-foreground",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
        outline: "border-border bg-muted text-foreground",
        success: "border-success/30 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/10 text-warning",
        info: "border-[#BAE6FD] bg-primary/10 text-primary",
        accent: "border-[#BAE6FD] bg-primary/10 text-primary",
        active: "border-success/30 bg-success/10 text-success",
        locked: "border-destructive/30 bg-destructive/10 text-destructive",
        "coming-soon": "border-border bg-muted text-muted-foreground",
        "in-progress": "border-[#BAE6FD] bg-primary/10 text-primary",
        completed: "border-success/30 bg-success/10 text-success",
        admin: "border-[#BAE6FD] bg-primary/10 text-primary",
        learner: "border-primary/30 bg-primary/10 text-primary",
        organization: "border-warning/30 bg-warning/10 text-warning",
        college: "border-success/30 bg-success/10 text-success",
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
