import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-nisq-border bg-nisq-white px-3 py-2 text-base text-nisq-ink shadow-card transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-nisq-ink placeholder:text-nisq-ash focus-visible:outline-none focus-visible:border-nisq-blue focus-visible:ring-2 focus-visible:ring-nisq-blue-soft disabled:cursor-not-allowed disabled:bg-nisq-offwhite disabled:opacity-60 aria-[invalid=true]:border-nisq-danger md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
