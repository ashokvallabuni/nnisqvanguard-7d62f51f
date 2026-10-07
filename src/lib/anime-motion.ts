import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

interface RevealOptions {
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
}

export function useAnimeReveal<T extends HTMLElement>({
  delay = 0,
  duration = 620,
  distance = 18,
  once = true,
}: RevealOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    element.style.opacity = "0";
    element.style.transform = `translateY(${distance}px)`;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        animate(element, {
          opacity: [0, 1],
          translateY: [distance, 0],
          duration,
          delay,
          ease: "out(3)",
        });
        if (once) observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [delay, distance, duration, once]);

  return ref;
}

export function useAnimeStagger<T extends HTMLElement>(selector: string, delay = 70) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const parent = ref.current;
    if (!parent || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(parent.querySelectorAll<HTMLElement>(selector));
    if (!items.length) return;

    items.forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(18px)";
    });
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        animate(items, {
          opacity: [0, 1],
          translateY: [18, 0],
          duration: 560,
          delay: stagger(delay),
          ease: "out(3)",
        });
        observer.disconnect();
      },
      { threshold: 0.08 },
    );
    observer.observe(parent);
    return () => observer.disconnect();
  }, [delay, selector]);

  return ref;
}
