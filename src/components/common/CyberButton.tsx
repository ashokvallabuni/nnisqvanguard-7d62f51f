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
      "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 min-h-[44px] w-full sm:w-auto whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nisq-blue-soft focus-visible:ring-offset-2 disabled:bg-nisq-border disabled:text-nisq-ash disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-nisq-blue text-nisq-white px-6 py-3 shadow-card hover:bg-nisq-blue-bright hover:shadow-glow",
      secondary:
        "bg-nisq-white text-nisq-blue border border-nisq-blue px-6 py-3 hover:bg-nisq-blue-tint",
      tertiary: "text-nisq-blue px-2 hover:underline underline-offset-4",
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
