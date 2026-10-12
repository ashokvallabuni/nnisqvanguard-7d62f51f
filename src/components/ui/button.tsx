import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold cursor-pointer transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nisq-blue-soft focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-[10px] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-nisq-blue text-white shadow-card hover:bg-nisq-blue-bright hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        destructive:
          "bg-nisq-danger text-white shadow-card hover:bg-nisq-danger/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        outline:
          "bg-transparent text-nisq-btn-secondary-text border border-nisq-blue/40 hover:border-nisq-blue hover:bg-nisq-blue-tint hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        secondary:
          "bg-nisq-offwhite text-nisq-ink border border-nisq-border hover:border-nisq-blue/40 hover:bg-nisq-blue-tint hover:text-nisq-blue hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        ghost:
          "text-nisq-text hover:bg-nisq-blue-tint hover:text-nisq-blue active:scale-[0.98]",
        link:
          "text-nisq-blue underline-offset-4 hover:underline active:opacity-80",
      },
      size: {
        default: "min-h-[44px] px-5 py-2.5",
        sm: "min-h-[38px] px-3.5 py-1.5 text-xs",
        lg: "min-h-[50px] px-7 py-3 text-base",
        icon: "h-10 w-10 min-h-[40px] min-w-[40px]",
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
