import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeRedirectPath(
  path: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!path || typeof path !== "string") return fallback;
  const trimmed = path.trim();
  // Ensure path is internal, not protocol-relative (//), and contains no backslashes or CRLF
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.includes("\\") &&
    !trimmed.includes("\r") &&
    !trimmed.includes("\n")
  ) {
    return trimmed;
  }
  return fallback;
}
