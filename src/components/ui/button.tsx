import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nisq-blue-soft focus-visible:ring-offset-2 focus-visible:ring-offset-nisq-white disabled:pointer-events-none disabled:bg-nisq-border disabled:text-nisq-ash disabled:border-nisq-border disabled:shadow-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-nisq-blue text-nisq-white shadow-card hover:bg-nisq-blue-bright hover:shadow-glow",
        destructive:
          "bg-nisq-danger text-nisq-white shadow-card hover:bg-nisq-danger-tint/90",
        outline:
          "bg-nisq-white text-nisq-blue border border-nisq-blue hover:bg-nisq-blue-tint",
        secondary:
          "bg-nisq-white text-nisq-blue border border-nisq-blue hover:bg-nisq-blue-tint",
        ghost: "text-nisq-text hover:bg-nisq-blue-tint hover:text-nisq-blue",
        link: "text-nisq-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[44px] px-5 py-2",
        sm: "min-h-[40px] rounded-lg px-3 text-xs",
        lg: "min-h-[52px] rounded-lg px-8 text-base",
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
