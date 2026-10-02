import React from "react";
import { Link } from "@tanstack/react-router";

export interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  href?: string;
  to?: string;
  children: React.ReactNode;
}

export const CyberButton = React.forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ variant = "primary", href, to, children, className = "", ...props }, ref) => {
    const baseClasses =
      "group relative inline-flex items-center justify-center font-body text-[13px] font-semibold transition-all duration-200 py-3 px-5 rounded-lg w-full sm:w-auto min-w-[150px] whitespace-nowrap border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C8FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060B1A] active:scale-[.98]";
    const variants = {
      primary:
        "bg-[#00C8FF] text-[#04101E] border-[#00C8FF] shadow-[0_8px_24px_rgba(0,200,255,.18)] hover:bg-[#66DFFF] hover:-translate-y-0.5",
      secondary:
        "bg-[#0A1831]/70 text-[#E8F6FF] border-[#00C8FF]/30 hover:border-[#00C8FF]/60 hover:bg-[#00C8FF]/10 hover:-translate-y-0.5",
      tertiary:
        "bg-transparent text-[#C1D2E3] border-transparent hover:text-[#62DDFF] px-0 py-0 min-w-0",
    };
    const content = <span className="relative z-10 flex items-center gap-2">{children}</span>;

    if (to) {
      return (
        <Link to={to} className={`${baseClasses} ${variants[variant]} ${className}`}>
          {content}
        </Link>
      );
    }
    if (href) {
      return (
        <a href={href} className={`${baseClasses} ${variants[variant]} ${className}`}>
          {content}
        </a>
      );
    }
    return (
      <button ref={ref} className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
        {content}
      </button>
    );
  },
);

CyberButton.displayName = "CyberButton";
