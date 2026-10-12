import React from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  href?: string;
  to?: string;
  children: React.ReactNode;
}

/**
 * Legacy-named button kept for existing call sites. Renders the NISQ design-system
 * buttons: primary (solid blue), secondary (white + blue outline), tertiary (text link).
 */
export const CyberButton = React.forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ variant = "primary", href, to, children, className = "", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-[10px] text-sm font-semibold transition-all duration-200 ease-out min-h-[44px] w-full sm:w-auto whitespace-nowrap cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nisq-blue-soft focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-nisq-blue text-nisq-white px-6 py-2.5 shadow-card hover:bg-nisq-blue-bright hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
      secondary:
        "bg-nisq-white text-nisq-blue border border-nisq-blue/50 px-6 py-2.5 hover:bg-nisq-blue-tint hover:border-nisq-blue hover:-translate-y-0.5 active:translate-y-0",
      tertiary:
        "text-nisq-blue px-3 py-1.5 hover:underline underline-offset-4 hover:bg-nisq-blue-tint/50 rounded-lg active:opacity-80",
    };

    const cls = cn(base, variants[variant], className);

    if (to) {
      return (
        <Link to={to} className={cls}>
          {children}
        </Link>
      );
    }

    if (href) {
      return (
        <a href={href} className={cls}>
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} className={cls} {...props}>
        {children}
      </button>
    );
  },
);
CyberButton.displayName = "CyberButton";
