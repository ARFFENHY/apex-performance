import { Progress } from '@/components/ui/progress';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MacroProgressBarProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  icon: LucideIcon;
}

export function MacroProgressBar({ label, value, target, unit, icon: Icon }: MacroProgressBarProps) {
  const pct = target > 0 ? (value / target) * 100 : 0;
  const exceeded = pct > 100;
  const warning = pct >= 90 && pct <= 100;
  const remaining = Math.max(target - value, 0);

  return (
    <div className={cn(
      "rounded-xl border p-3 space-y-2 transition-colors",
      exceeded ? "border-destructive/50 bg-destructive/5" : 
      warning ? "border-energy/40 bg-energy/5" : 
      "border-border/40"
    )}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Icon className="h-3 w-3" /> {label}
        </span>
        <span className={cn(
          "text-[10px] font-medium",
          exceeded ? "text-destructive" : "text-muted-foreground"
        )}>
          {value}/{target}{unit}
        </span>
      </div>
      <Progress 
        value={Math.min(pct, 100)} 
        className={cn(
          "h-1.5",
          exceeded ? "[&>div]:bg-destructive" : 
          warning ? "[&>div]:bg-energy" : 
          "[&>div]:bg-primary"
        )} 
      />
      {exceeded && (
        <div className="flex items-center gap-1.5 text-destructive">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span className="text-[10px] font-semibold">
            ¡Excedido por {Math.round(value - target)}{unit}!
          </span>
        </div>
      )}
      {!exceeded && (
        <p className="text-[10px] text-muted-foreground">
          Faltan <span className="font-semibold text-foreground">{Math.round(remaining)}{unit}</span>
        </p>
      )}
    </div>
  );
}
