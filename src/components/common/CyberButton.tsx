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
    const baseClasses = "group relative inline-flex items-center justify-center font-mono text-[12px] md:text-[13px] font-bold uppercase tracking-widest transition-all duration-300 py-4 px-9 w-full sm:w-auto min-w-[180px] whitespace-nowrap border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D2FF] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-95";
    
    const variants = {
      primary: "bg-[#00D2FF] text-black border-[#00D2FF] hover:brightness-110",
      secondary: "bg-transparent text-white border-[#00D2FF] hover:bg-[#00D2FF]/10 hover:brightness-110",
      tertiary: "bg-transparent text-white border-transparent hover:text-[#00D2FF] px-0 py-0 min-w-0"
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
