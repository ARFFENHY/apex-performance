import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export interface AchievementCelebration {
  title: string;
  label: string;
  icon: string;
  description: string;
}

export function AchievementOverlay() {
  const [celebration, setCelebration] = useState<AchievementCelebration | null>(null);

  useEffect(() => {
    const handleCelebrate = (e: CustomEvent<AchievementCelebration>) => {
      setCelebration(e.detail);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00d053', '#00a843', '#ffffff']
      });
    };

    window.addEventListener('celebrate-achievement' as any, handleCelebrate);
    return () => window.removeEventListener('celebrate-achievement' as any, handleCelebrate);
  }, []);

  if (!celebration) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.5, y: 20, rotate: -5 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="bg-card border-4 border-primary p-8 rounded-3xl shadow-[0_0_50px_rgba(0,208,83,0.3)] text-center max-w-sm relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-[60px]" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-energy/20 rounded-full blur-[60px]" />

          <button 
            onClick={() => setCelebration(null)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-2xl gradient-primary flex items-center justify-center shadow-neon">
                <span className="text-5xl">{celebration.icon}</span>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-3 -right-3"
              >
                <Trophy className="h-10 w-10 text-yellow-500 drop-shadow-lg" />
              </motion.div>
            </div>
          </div>

          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">¡Logro Desbloqueado!</h3>
          <h2 className="text-3xl font-black italic tracking-tighter mb-4 uppercase">{celebration.label}</h2>
          
          <div className="bg-muted/50 rounded-xl p-4 mb-8">
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {celebration.description}
            </p>
          </div>

          <Button 
            onClick={() => setCelebration(null)}
            variant="premium" 
            className="w-full h-12 font-black italic shadow-lg shadow-primary/20 uppercase tracking-widest"
          >
            ¡ASOMBROSO!
          </Button>
          
          <div className="mt-4 flex items-center justify-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <Star className="h-3 w-3 fill-muted-foreground" />
            <span>Sigue así, vas por buen camino</span>
            <Star className="h-3 w-3 fill-muted-foreground" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper to trigger celebration
export const celebrateAchievement = (data: AchievementCelebration) => {
  window.dispatchEvent(new CustomEvent('celebrate-achievement', { detail: data }));
};
