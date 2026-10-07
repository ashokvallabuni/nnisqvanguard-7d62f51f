/**
 * Palette constants for JS/Canvas/SVG consumers that cannot read Tailwind classes.
 * Mirrors the CSS custom properties in src/styles.css. Hex values are allowed in
 * this token file only.
 */
export const PALETTE = {
  blue: "#0A7CFF",
  blueBright: "#00B8FF",
  blueSoft: "#38BDF8",
  blueTint: "#EAF4FF",
  white: "#FFFFFF",
  offwhite: "#F8FAFC",
  ink: "#0F172A",
  text: "#334155",
  muted: "#64748B",
  ash: "#94A3B8",
  border: "#E2E8F0",
  navy: "#050B14",
  danger: "#DC2626",
} as const;

/** Blue-shades + ash only, for charts. */
export const CHART_COLORS = [
  PALETTE.blue,
  PALETTE.blueSoft,
  PALETTE.blueBright,
  PALETTE.ash,
  PALETTE.text,
] as const;
