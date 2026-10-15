import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { prefersReducedMotion } from "@/lib/motion";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Entry transition for route content.
 *
 * Deliberately does NOT key/remount the subtree: it animates the existing
 * container with the Web Animations API whenever the *resolved* pathname
 * changes (i.e. after loaders finished and the new page is rendered).
 * This avoids the blank frame / double render of exit-based transitions,
 * keeps component state for same-route param changes intact, and lets the
 * router's own scroll restoration run untouched.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({
    select: (s) => s.resolvedLocation?.pathname ?? s.location.pathname,
  });
  const first = useRef(true);

  useIsoLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return; // never animate the server-rendered first paint
    }
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof el.animate !== "function") return;
    const anim = el.animate(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    return () => anim.cancel();
  }, [pathname]);

  return (
    <div ref={ref} className="relative">
      {children}
    </div>
  );
}

/**
 * Thin top progress bar shown only for navigations that take longer than
 * ~120ms, so instant navigations never flicker. Reflects real router state.
 */
export function RouteProgress() {
  const pending = useRouterState({ select: (s) => s.status === "pending" });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pending) {
      setVisible(false);
      return;
    }
    const t = window.setTimeout(() => setVisible(true), 120);
    return () => window.clearTimeout(t);
  }, [pending]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="route-progress"
          role="progressbar"
          aria-label="Loading page"
          className="nv-route-progress"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.85, transition: { duration: 2.4, ease: [0.1, 0.6, 0.3, 1] } }}
          exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.25 } }}
        />
      )}
    </AnimatePresence>
  );
}
