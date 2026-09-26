import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-bold tracking-widest uppercase cursor-pointer transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#00D9FF] text-[#02060D] hover:bg-[#00F0FF] shadow-[0_0_20px_rgba(0,217,255,0.12)] hover:shadow-[0_0_28px_rgba(0,217,255,0.22)]",
        destructive:
          "bg-[#FF4D5E] text-[#F5FAFF] hover:bg-[#FF3347] shadow-[0_0_12px_rgba(255,77,94,0.15)] hover:shadow-[0_0_20px_rgba(255,77,94,0.25)]",
        outline:
          "bg-transparent text-[#00D9FF] border border-[#00D9FF] hover:bg-[#00D9FF]/10 shadow-[inset_0_0_12px_rgba(0,217,255,0.08)]",
        secondary:
          "bg-[#0B1624] text-[#F5FAFF] border border-[#123047] hover:bg-[#0B1624]/80 shadow-[0_0_12px_rgba(0,217,255,0.05)]",
        ghost: "hover:bg-[#0B1624] hover:text-[#00D9FF] text-foreground",
        link: "text-[#00D9FF] underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[44px] px-5 py-2",
        sm: "min-h-[40px] rounded-md px-3 text-[10px]",
        lg: "min-h-[48px] rounded-md px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
