import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, staggerContainer } from "@/lib/motion";

type RevealGroupProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  /** Delay between children, seconds. */
  stagger?: number;
  /** Fraction of the element that must be visible before revealing. */
  amount?: number;
};

/**
 * Reveals its <RevealItem> children with a coordinated stagger the first time
 * the group scrolls into view. Runs once, so content never re-hides.
 * Reduced-motion users get instant content via the root <MotionConfig>.
 */
export function RevealGroup({ children, stagger = 0.06, amount = 0.15, ...rest }: RevealGroupProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={staggerContainer(stagger)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, ...rest }: HTMLMotionProps<"div"> & { children: ReactNode }) {
  return (
    <motion.div variants={fadeUp} {...rest}>
      {children}
    </motion.div>
  );
}
