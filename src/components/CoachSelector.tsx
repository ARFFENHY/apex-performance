import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shuffle, UserCheck } from "lucide-react";
import { type CoachProfile } from "@/hooks/useInvitations";

interface CoachSelectorProps {
  coaches: CoachProfile[];
  onSelect: (coachId: string) => void;
  isLoading?: boolean;
}

export function CoachSelector({ coaches, onSelect, isLoading }: CoachSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleRandomCoach = () => {
    if (coaches.length === 0) return;
    const random = coaches[Math.floor(Math.random() * coaches.length)];
    setSelectedId(random.id);
    onSelect(random.id);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelect(id);
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-display font-bold">Elige tu entrenador</h3>
        <p className="text-sm text-muted-foreground">
          Selecciona el coach con quien quieres entrenar
        </p>
      </div>

      <div className="space-y-2 max-h-60 overflow-auto">
        {coaches.map((coach, i) => (
          <motion.div
            key={coach.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedId === coach.id
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-accent/50"
              }`}
              onClick={() => handleSelect(coach.id)}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-lg flex-shrink-0">
                  {coach.avatar_url ? (
                    <img
                      src={coach.avatar_url}
                      alt={coach.full_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span>🏋️</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {coach.full_name || "Entrenador"}
                  </p>
                  <p className="text-xs text-muted-foreground">Coach certificado</p>
                </div>
                {selectedId === coach.id && (
                  <UserCheck className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={handleRandomCoach}
        disabled={isLoading || coaches.length === 0}
      >
        <Shuffle className="h-4 w-4" />
        Quiero al coach al azar
      </Button>
    </div>
  );
}
