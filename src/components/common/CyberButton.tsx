import React from 'react';
import { Link } from '@tanstack/react-router';

export interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  href?: string;
  to?: string;
  children: React.ReactNode;
}

export const CyberButton = React.forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ variant = 'primary', href, to, children, className = '', ...props }, ref) => {
    const baseClasses = "group relative inline-flex items-center justify-center font-mono text-[12px] md:text-[13px] uppercase tracking-widest transition-all duration-300 h-[52px] md:h-[48px] px-8 min-w-[44px] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--obsidian)] active:scale-98";
    
    const variants = {
      primary: "bg-[var(--cyan)] text-black hover:bg-[#20D9F5]/90 hover:shadow-[0_0_20px_rgba(32,217,245,0.4)] hover:-translate-y-0.5",
      secondary: "border border-[var(--line)] bg-[var(--obsidian)] text-[var(--chrome)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] hover:bg-[var(--cyan)]/5 hover:shadow-[0_0_15px_rgba(32,217,245,0.2)] hover:-translate-y-0.5",
      tertiary: "bg-transparent text-[var(--chrome)] hover:text-[var(--cyan)] px-0 h-auto hover:-translate-y-0.5"
    };

    const content = (
      <>
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        {variant === 'tertiary' && (
          <span className="absolute left-0 bottom-[-4px] h-[1px] w-0 bg-[var(--cyan)] transition-all duration-300 group-hover:w-full" />
        )}
      </>
    );

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
  }
);
CyberButton.displayName = 'CyberButton';
