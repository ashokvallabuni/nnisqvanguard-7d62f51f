import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  badge?: string;
  badgeVariant?: "primary" | "accent" | "success" | "warning" | "destructive" | "muted";
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({
  badge,
  badgeVariant = "primary",
  title,
  subtitle,
  breadcrumbs,
  children,
  action,
}: PageHeaderProps) {
  const badgeStyles = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/15 text-accent-foreground border-accent/30",
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    destructive: "bg-destructive/15 text-destructive border-destructive/30",
    muted: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="relative border-b border-border bg-card/60 backdrop-blur-xs py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground mb-4 flex-wrap">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <div key={index} className="flex items-center gap-1.5">
                  {item.to && !isLast ? (
                    <Link
                      to={item.to}
                      className="hover:text-primary transition-colors truncate max-w-[160px] sm:max-w-none"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-foreground font-medium truncate max-w-[200px] sm:max-w-none" : ""}>
                      {item.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />}
                </div>
              );
            })}
          </nav>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            {badge && (
              <div className="inline-flex items-center">
                <span
                  className={`text-[0.65rem] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeStyles[badgeVariant]}`}
                >
                  {badge}
                </span>
              </div>
            )}
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            )}
            {children}
          </div>

          {action && <div className="shrink-0 flex items-center gap-2 pt-2 md:pt-0">{action}</div>}
        </div>
      </div>
    </div>
  );
}
