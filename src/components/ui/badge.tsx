import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-[#BAE6FD] bg-[#E0F2FE] text-[#0284C7]",
        secondary: "border-[#1E2D4A] bg-[#E2E8F0] text-[#94A3B8]",
        destructive: "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
        outline: "border-[#1E2D4A] bg-[#F0F4F9] text-[#F0F4F9]",
        success: "border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]",
        warning: "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]",
        info: "border-[#BAE6FD] bg-[#E0F2FE] text-[#0284C7]",
        accent: "border-[#BAE6FD] bg-[#E0F2FE] text-[#0284C7]",
        active: "border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]",
        locked: "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
        "coming-soon": "border-[#1E2D4A] bg-[#F1F5F9] text-[#94A3B8]",
        "in-progress": "border-[#BAE6FD] bg-[#E0F2FE] text-[#0284C7]",
        completed: "border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]",
        admin: "border-[#BAE6FD] bg-[#E0F2FE] text-[#0284C7]",
        learner: "border-[#DDD6FE] bg-[#F5F3FF] text-[#7C3AED]",
        organization: "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]",
        college: "border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]",
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
