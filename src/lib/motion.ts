/**
 * NISQ Vanguard motion system.
 * Mirrors the CSS tokens in styles.css (--dur-*, --ease-*) so JS-driven
 * (framer-motion / WAAPI) and CSS-driven motion share one vocabulary.
 */
import type { Transition, Variants } from "framer-motion";

export const DURATION = {
  fast: 0.14,
  base: 0.22,
  slow: 0.32,
} as const;

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const baseTransition: Transition = { duration: DURATION.base, ease: EASE_OUT };

/** Layout-aware transition used for reordering/filtering and indicators. */
export const layoutTransition: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 42,
  mass: 0.9,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
};

export const staggerContainer = (stagger = 0.06, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
