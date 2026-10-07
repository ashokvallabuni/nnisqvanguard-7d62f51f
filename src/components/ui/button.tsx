import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold cursor-pointer transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nisq-blue-soft focus-visible:ring-offset-2 focus-visible:ring-offset-nisq-white disabled:pointer-events-none disabled:bg-nisq-border disabled:text-nisq-ash disabled:border-nisq-border disabled:shadow-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-[10px]",
  {
    variants: {
      variant: {
        default:
          "bg-nisq-blue text-white shadow-card hover:bg-nisq-blue-bright hover:shadow-glow hover:-translate-y-[2px]",
        destructive:
          "bg-nisq-blue text-white shadow-card hover:bg-nisq-blue-bright hover:shadow-glow hover:-translate-y-[2px]",
        outline:
          "bg-transparent text-nisq-btn-secondary-text border border-nisq-blue hover:bg-nisq-blue-tint hover:-translate-y-[2px]",
        secondary:
          "bg-transparent text-nisq-btn-secondary-text border border-nisq-blue hover:bg-nisq-blue-tint hover:-translate-y-[2px]",
        ghost: "text-nisq-text hover:bg-nisq-blue-tint hover:text-nisq-blue hover:-translate-y-[2px]",
        link: "text-nisq-blue underline-offset-4 hover:underline hover:-translate-y-[2px]",
      },
      size: {
        default: "min-h-[44px] px-5 py-2",
        sm: "min-h-[40px] px-3 text-xs",
        lg: "min-h-[52px] px-8 text-base",
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
