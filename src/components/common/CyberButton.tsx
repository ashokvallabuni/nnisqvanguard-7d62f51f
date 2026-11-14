import React from "react";
import { PremiumButton, type PremiumButtonProps } from "./PremiumButton";

export interface CyberButtonProps extends Omit<PremiumButtonProps, "variant"> {
  variant?: "primary" | "secondary" | "tertiary" | "outline" | "cyber-glow" | "text";
}

/**
 * Universal CyberButton wrapper powered by the high-performance PremiumButton system.
 */
export const CyberButton = React.forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ variant = "primary", ...props }, ref) => {
    const mappedVariant = variant === "tertiary" ? "text" : variant;
    return <PremiumButton ref={ref} variant={mappedVariant} {...props} />;
  }
);

CyberButton.displayName = "CyberButton";
