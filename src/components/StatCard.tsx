import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  variant?: "primary" | "success" | "energy" | "default";
}

const variantStyles = {
  primary: "gradient-primary text-primary-foreground",
  success: "gradient-success text-success-foreground",
  energy: "gradient-energy text-energy-foreground",
  default: "bg-card text-card-foreground shadow-card",
};

const iconBg = {
  primary: "bg-white/20",
  success: "bg-white/20",
  energy: "bg-white/20",
  default: "bg-primary/10",
};

export function StatCard({ title, value, subtitle, icon, trend, variant = "default" }: StatCardProps) {
  const isColored = variant !== "default";

  return (
    <div className={cn("rounded-xl p-5 transition-all hover:shadow-card-hover", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-xs font-medium uppercase tracking-wide", isColored ? "text-white/80" : "text-muted-foreground")}>
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold font-display">{value}</p>
          {subtitle && (
            <p className={cn("mt-1 text-sm", isColored ? "text-white/70" : "text-muted-foreground")}>
              {subtitle}
            </p>
          )}
          {trend && (
            <p className={cn("mt-2 text-xs font-medium", isColored ? "text-white/90" : trend.positive ? "text-success" : "text-destructive")}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconBg[variant])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
