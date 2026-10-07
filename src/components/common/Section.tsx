import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  children: ReactNode;
  id?: string;
  tone?: "white" | "offwhite" | "tint" | "blue";
  className?: string;
  innerClassName?: string;
  "aria-labelledby"?: string;
};

const TONES: Record<NonNullable<SectionProps["tone"]>, string> = {
  white: "bg-nisq-white",
  offwhite: "bg-nisq-offwhite",
  tint: "bg-nisq-blue-tint",
  blue: "bg-nisq-blue text-nisq-white",
};

/** Page section: consistent vertical rhythm (80-120px) and 1200px container. */
export function Section({
  children,
  id,
  tone = "white",
  className,
  innerClassName,
  ...rest
}: SectionProps) {
  return (
    <section id={id} className={cn("section-y", TONES[tone], className)} {...rest}>
      <div className={cn("container-nv", innerClassName)}>{children}</div>
    </section>
  );
}

/** Eyebrow + heading + lead used at the top of a section. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "center",
  inverted = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: string;
  align?: "center" | "left";
  inverted?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "")}>
      {eyebrow && (
        <span
          className={cn(
            "inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
            inverted ? "bg-nisq-white/15 text-nisq-white" : "bg-nisq-blue-tint text-nisq-blue",
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2 className={cn("mt-4", inverted && "text-nisq-white")}>{title}</h2>
      {lead && (
        <p className={cn("mt-4 text-lg", inverted ? "text-nisq-white/90" : "text-nisq-muted")}>
          {lead}
        </p>
      )}
    </div>
  );
}
