import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';

interface Lap {
  id: number;
  time: number;
}

export const Stopwatch3D: React.FC = () => {
  const [time, setTime] = useState(0); // in milliseconds
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const update = (now: number) => {
    if (startTimeRef.current === 0) startTimeRef.current = now - time;
    setTime(now - startTimeRef.current);
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      startTimeRef.current = 0;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning]);

  const toggleStartStop = () => setIsRunning(!isRunning);

  const reset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    startTimeRef.current = 0;
  };

  const addLap = () => {
    if (isRunning) {
      setLaps(prev => [{ id: prev.length + 1, time }, ...prev]);
    }
  };

  // Calculations for hands
  const milliseconds = time % 1000;
  const seconds = (time / 1000) % 60;
  const minutes = (time / (1000 * 60)) % 60;
  const hours = (time / (1000 * 60 * 60)) % 12;

  const secondsDeg = seconds * 6; // 360 / 60
  const minutesDeg = minutes * 6;
  const hoursDeg = hours * 30; // 360 / 12

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    const milli = Math.floor((ms % 1000) / 10);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${milli.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-gradient-to-br from-slate-900 to-black rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_-4px_10px_rgba(255,255,255,0.05)] border border-slate-800 scale-90 sm:scale-100 transition-transform">
      
      {/* Analog Face */}
      <div className="relative w-64 h-64 rounded-full bg-slate-900 shadow-[inset_0_10px_20px_rgba(0,0,0,0.8),0_5px_15px_rgba(0,0,0,0.5)] border-[8px] border-slate-800 flex items-center justify-center">
        
        {/* Ring markers */}
        {[...Array(60)].map((_, i) => (
          <div 
            key={i} 
            className={`absolute w-0.5 h-2 ${i % 5 === 0 ? 'bg-primary w-1 h-3' : 'bg-slate-700'}`}
            style={{ transform: `rotate(${i * 6}deg) translateY(-110px)` }}
          />
        ))}

        {/* Numbers */}
        {[60, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((num, i) => (
          <span 
            key={num} 
            className={`absolute text-[10px] font-black tracking-tighter ${num === 60 ? 'text-red-500' : 'text-slate-500'}`}
            style={{ 
              transform: `rotate(${i * 30}deg) translateY(-90px) rotate(-${i * 30}deg)` 
            }}
          >
            {num}
          </span>
        ))}

        {/* Inner small dial (Hours/Minutes) */}
        <div className="absolute w-32 h-32 rounded-full border border-slate-800/50 shadow-inner flex items-center justify-center">
           <div className="text-[10px] font-bold text-slate-700 opacity-20 uppercase tracking-[0.2em]">Timekeeper</div>
        </div>

        {/* The Hands */}
        {/* Hour Hand */}
        <div 
          className="absolute w-1.5 h-16 bg-slate-300 rounded-full shadow-lg"
          style={{ 
            transform: `rotate(${hoursDeg}deg) translateY(-32px)`,
            transformOrigin: 'bottom center'
          }}
        />
        {/* Minute Hand */}
        <div 
          className="absolute w-1 h-24 bg-slate-100 rounded-full shadow-lg"
          style={{ 
            transform: `rotate(${minutesDeg}deg) translateY(-48px)`,
            transformOrigin: 'bottom center'
          }}
        />
        {/* Seconds Hand (Red) */}
        <div 
          className="absolute w-0.5 h-28 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
          style={{ 
            transform: `rotate(${secondsDeg}deg) translateY(-56px)`,
            transformOrigin: 'bottom center'
          }}
        />

        {/* Center Pin */}
        <div className="absolute w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600 shadow-xl z-20" />
      </div>

      {/* Digital Display (LCD Style) */}
      <div className="w-full max-w-[280px] bg-black/40 rounded-2xl border border-slate-800 p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
        <div className="font-mono text-3xl font-black italic tracking-tighter text-primary/90 drop-shadow-[0_0_10px_rgba(var(--primary),0.3)] text-center tabular-nums">
          {formatTime(time)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Button 
          onClick={toggleStartStop}
          className={`h-16 w-16 rounded-full shadow-lg transition-all duration-300 active:scale-95 border-2 ${
            isRunning 
              ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20' 
              : 'bg-green-500/10 border-green-500/50 text-green-500 hover:bg-green-500/20'
          }`}
        >
          {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
        </Button>

        <Button 
          onClick={reset}
          variant="outline"
          className="h-16 w-16 rounded-full border-slate-700 bg-slate-900 shadow-lg text-slate-400 hover:text-white active:scale-95"
          title="Reset"
        >
          <RotateCcw className="h-6 w-6" />
        </Button>

        <Button 
          onClick={addLap}
          variant="outline"
          className="h-16 w-16 rounded-full border-slate-700 bg-slate-900 shadow-lg text-slate-400 hover:text-white active:scale-95 disabled:opacity-30"
          disabled={!isRunning}
          title="Lap"
        >
          <Flag className="h-6 w-6" />
        </Button>
      </div>

      {/* Laps List */}
      {laps.length > 0 && (
        <div className="w-full max-h-32 overflow-y-auto px-4 custom-scrollbar">
          {laps.map((lap, idx) => (
            <div key={lap.id} className="flex justify-between items-center py-2 border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-500 italic">
              <span>Vuelta {laps.length - idx}</span>
              <span className="text-slate-300 font-mono text-xs">{formatTime(lap.time)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
