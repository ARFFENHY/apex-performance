import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface ClientRowProps {
  name: string;
  avatar: string;
  weightChange: number;
  fatLost: number;
  musclGained: number;
  lastActive: string;
}

export function ClientRow({ name, avatar, weightChange, fatLost, musclGained, lastActive }: ClientRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-accent/50">
      <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-sm font-semibold text-primary-foreground shrink-0">
        {avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{name}</p>
        <p className="text-xs text-muted-foreground">Activo {lastActive}</p>
      </div>
      <div className="hidden sm:flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1 w-20">
          {weightChange < 0 ? (
            <TrendingDown className="h-3.5 w-3.5 text-success" />
          ) : weightChange > 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-energy" />
          ) : (
            <Minus className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className={cn("font-medium", weightChange < 0 ? "text-success" : weightChange > 0 ? "text-energy" : "text-muted-foreground")}>
            {weightChange > 0 ? "+" : ""}{weightChange} kg
          </span>
        </div>
        <div className="w-20 text-center">
          <span className="text-success font-medium">-{fatLost}%</span>
          <p className="text-[10px] text-muted-foreground">Grasa</p>
        </div>
        <div className="w-20 text-center">
          <span className="text-primary font-medium">+{musclGained} kg</span>
          <p className="text-[10px] text-muted-foreground">Músculo</p>
        </div>
      </div>
    </div>
  );
}
