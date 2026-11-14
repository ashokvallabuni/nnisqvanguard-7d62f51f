import React from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "cyber-glow" | "text";
  size?: "sm" | "md" | "lg" | "xl";
  to?: string;
  href?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  pulse?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      to,
      href,
      icon,
      iconRight,
      loading = false,
      pulse = false,
      fullWidth = false,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-9 px-3.5 text-xs gap-1.5",
      md: "h-11 px-5 text-sm gap-2 min-h-[44px]",
      lg: "h-12 px-6 text-sm md:text-base gap-2.5 min-h-[48px]",
      xl: "h-14 px-8 text-base md:text-lg gap-3 min-h-[52px]",
    };

    const baseClasses =
      "relative inline-flex items-center justify-center font-mono font-semibold tracking-wide rounded-xl select-none transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A7CFF] dark:focus-visible:ring-[#00B8FF] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#050B14] disabled:opacity-50 disabled:pointer-events-none";

    const variantClasses = {
      primary:
        "bg-gradient-to-r from-[#0A7CFF] to-[#00B8FF] text-white shadow-[0_4px_16px_rgba(10,124,255,0.28)] dark:shadow-[0_0_20px_rgba(10,124,255,0.35)] hover:shadow-[0_6px_22px_rgba(10,124,255,0.4)] dark:hover:shadow-[0_0_28px_rgba(0,184,255,0.55)] hover:brightness-105 active:brightness-95 border border-white/20 group",
      "cyber-glow":
        "bg-gradient-to-r from-[#0A7CFF] via-[#00B8FF] to-[#0A7CFF] bg-[length:200%_auto] animate-[gradientShift_6s_ease_infinite] text-white shadow-[0_4px_20px_rgba(0,184,255,0.35)] dark:shadow-[0_0_25px_rgba(0,184,255,0.45)] hover:shadow-[0_6px_28px_rgba(0,184,255,0.55)] dark:hover:shadow-[0_0_35px_rgba(0,184,255,0.7)] hover:scale-[1.02] border border-[#00B8FF]/60 group",
      secondary:
        "bg-[#EAF4FF] dark:bg-[#081522] text-[#0A7CFF] dark:text-[#38BDF8] border border-[#0A7CFF]/30 dark:border-[#00B8FF]/40 hover:border-[#0A7CFF] dark:hover:border-[#00B8FF] hover:bg-[#0A7CFF]/15 dark:hover:bg-[#00B8FF]/10 shadow-xs dark:shadow-card group",
      outline:
        "bg-white dark:bg-transparent text-[#050B14] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#16283A] hover:border-[#0A7CFF] dark:hover:border-[#38BDF8]/60 hover:bg-[#EAF4FF] dark:hover:bg-[#081522] hover:text-[#0A7CFF] dark:hover:text-[#00B8FF] group",
      text:
        "bg-transparent text-[#0A7CFF] dark:text-[#38BDF8] hover:text-[#00B8FF] hover:underline underline-offset-4 px-2 py-1 shadow-none",
    };

    const combinedClasses = cn(
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      fullWidth ? "w-full" : "w-full sm:w-auto",
      className
    );

    const content = (
      <>
        {/* Animated Light Shimmer Sweep */}
        {(variant === "primary" || variant === "cyber-glow") && (
          <span
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-[shimmerSweep_0.85s_ease-out]"
            aria-hidden="true"
          />
        )}

        {/* Live Energy Pulse Ring */}
        {pulse && (
          <span
            className="absolute -inset-0.5 rounded-xl bg-[#00B8FF] opacity-40 blur-sm animate-pulse -z-10"
            aria-hidden="true"
          />
        )}

        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          icon && <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">{icon}</span>
        )}

        <span className="relative z-10 truncate">{children}</span>

        {!loading && iconRight && (
          <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-1">{iconRight}</span>
        )}
      </>
    );

    if (to) {
      return (
        <Link to={to as any} className={combinedClasses} tabIndex={disabled ? -1 : undefined}>
          {content}
        </Link>
      );
    }

    if (href) {
      return (
        <a href={href} className={combinedClasses} tabIndex={disabled ? -1 : undefined}>
          {content}
        </a>
      );
    }

    return (
      <button ref={ref} disabled={disabled || loading} className={combinedClasses} {...props}>
        {content}
      </button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";
