import React, { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Interactive3DCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  maxTilt?: number;
  interactive?: boolean;
}

export function Interactive3DCard({
  children,
  className = "",
  glowColor = "rgba(0, 184, 255, 0.15)",
  maxTilt = 6,
  interactive = true,
}: Interactive3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50, opacity: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || e.pointerType === "touch") return;
    const card = cardRef.current;
    if (!card) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`,
      transition: "transform 0.1s ease-out",
    });

    setGlowPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1,
    });
  };

  const handlePointerLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)",
      transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
    });
    setGlowPos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={style}
      className={cn(
        "relative rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#16283A] bg-white/95 dark:bg-[#081522]/90 backdrop-blur-md shadow-card dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-200 group",
        className
      )}
    >
      {/* Dynamic Specular Light Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 rounded-2xl"
        style={{
          opacity: glowPos.opacity,
          background: `radial-gradient(circle 260px at ${glowPos.x}% ${glowPos.y}%, ${glowColor || "var(--nisq-blue-tint)"}, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Cyber Corner Accents */}
      <div className="pointer-events-none absolute top-0 left-0 w-3 h-3 border-t border-l border-[#0A7CFF]/30 dark:border-[#00B8FF]/40 rounded-tl-lg transition-colors group-hover:border-[#0A7CFF] dark:group-hover:border-[#00B8FF]" aria-hidden="true" />
      <div className="pointer-events-none absolute top-0 right-0 w-3 h-3 border-t border-r border-[#0A7CFF]/30 dark:border-[#00B8FF]/40 rounded-tr-lg transition-colors group-hover:border-[#0A7CFF] dark:group-hover:border-[#00B8FF]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#0A7CFF]/30 dark:border-[#00B8FF]/40 rounded-bl-lg transition-colors group-hover:border-[#0A7CFF] dark:group-hover:border-[#00B8FF]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#0A7CFF]/30 dark:border-[#00B8FF]/40 rounded-br-lg transition-colors group-hover:border-[#0A7CFF] dark:group-hover:border-[#00B8FF]" aria-hidden="true" />

      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
