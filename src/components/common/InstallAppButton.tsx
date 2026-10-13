import { Download } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { cn } from "@/lib/utils";

interface InstallAppButtonProps {
  variant?: "header" | "drawer" | "mobile-header";
  className?: string;
}

/**
 * PWA Install Button
 * Strictly hidden by default until Chrome fires the 'beforeinstallprompt' event.
 */
export function InstallAppButton({
  variant = "header",
  className,
}: InstallAppButtonProps) {
  const { canInstall, promptInstall } = usePwaInstall();

  // Hidden by default until beforeinstallprompt fires and is captured
  if (!canInstall) {
    return null;
  }

  if (variant === "drawer") {
    return (
      <button
        type="button"
        onClick={() => void promptInstall()}
        className={cn(
          "flex items-center justify-center gap-2 w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-nisq-blue hover:bg-nisq-blue-bright text-white text-sm font-semibold tracking-wide active:scale-[0.98] transition-all shadow-card cursor-pointer select-none",
          className,
        )}
        aria-label="Install NISQ Vanguard App"
      >
        <Download className="w-4 h-4 shrink-0 text-white" />
        <span>Install NISQ Vanguard App</span>
      </button>
    );
  }

  if (variant === "mobile-header") {
    return (
      <button
        type="button"
        onClick={() => void promptInstall()}
        className={cn(
          "flex items-center gap-1 px-2.5 h-10 rounded-lg bg-white/15 hover:bg-white/25 border border-[#00B8FF]/40 text-white text-xs font-bold tracking-wide active:scale-95 transition-all cursor-pointer shadow-xs",
          className,
        )}
        aria-label="Install NISQ Vanguard App"
      >
        <Download className="w-3.5 h-3.5 text-[#00B8FF]" />
        <span>Install</span>
      </button>
    );
  }

  // Default: Header button
  return (
    <button
      type="button"
      onClick={() => void promptInstall()}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 border border-[#00B8FF]/40 text-white text-xs font-semibold tracking-wide active:scale-[0.98] transition-all cursor-pointer select-none shadow-xs animate-in fade-in duration-300",
        className,
      )}
      aria-label="Install NISQ Vanguard App"
    >
      <Download className="w-3.5 h-3.5 text-[#00B8FF] shrink-0" />
      <span>Install App</span>
    </button>
  );
}
