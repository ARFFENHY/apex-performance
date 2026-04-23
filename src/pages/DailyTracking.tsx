import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MacroProgressBar } from '@/components/tracking/MacroProgressBar';
import { WorkoutLogger } from '@/components/tracking/WorkoutLogger';
import { MealLogger } from '@/components/tracking/MealLogger';
import {
  Flame, Beef, Wheat, Droplets, GlassWater, Save, Target,
  ChevronLeft, ChevronRight, TrendingUp, AlertTriangle, CheckCircle2,
  Info, Scale, ArrowRight, Trophy, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useActiveFitnessGoal } from '@/hooks/useFitnessGoals';
import { useDailyLog, useWeeklyLogs, useSaveDailyLog, useWeightHistory, useSaveWeight } from '@/hooks/useDailyLogs';
import { useSmartMessages } from '@/hooks/useSmartMessages';
import { useUnlockAchievement, useAchievements } from '@/hooks/useAchievements';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function displayDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function DailyTracking() {
  const navigate = useNavigate();
  const { data: goal, isLoading: loadingGoal } = useActiveFitnessGoal();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const { data: todayLog, isLoading: loadingLog } = useDailyLog(selectedDate);
  const { data: weeklyLogs = [] } = useWeeklyLogs();
  const { data: weightHistory = [] } = useWeightHistory();
  const saveDailyLog = useSaveDailyLog();
  const saveWeight = useSaveWeight();
  const insights = useSmartMessages(goal, todayLog, weeklyLogs);

  const [water, setWater] = useState('0');
  const [newWeight, setNewWeight] = useState('');
  const [mealTotals, setMealTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [workoutFinalized, setWorkoutFinalized] = useState(false);
  const [mealsFinalized, setMealsFinalized] = useState(false);

  const unlockAchievement = useUnlockAchievement();
  const { data: achievements = [] } = useAchievements();


  // Sync states from todayLog
  useEffect(() => {
    if (todayLog) {
      setWater(String(todayLog.water_liters || 0));
      setWorkoutFinalized(todayLog.workout_completed || false);
      setMealsFinalized(todayLog.meals_completed || false);
    }
  }, [todayLog]);

  const handleMealTotals = useCallback((totals: { calories: number; protein: number; carbs: number; fat: number }) => {
    setMealTotals(totals);
  }, []);




  const navigateDate = (dir: number) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + dir);
    if (d <= new Date()) setSelectedDate(formatDate(d));
  };

  const handleSaveDaily = () => {
    // Cuando el usuario pulsa el gran botón verde de "GUARDAR RESUMEN DIARIO", 
    // asumimos que quiere finalizar su día completamente.
    setWorkoutFinalized(true);
    setMealsFinalized(true);
    
    saveDailyLog.mutate({
      log_date: selectedDate,
      calories_consumed: mealTotals.calories,
      protein_consumed: mealTotals.protein,
      carbs_consumed: mealTotals.carbs,
      fat_consumed: mealTotals.fat,
      water_liters: parseFloat(water) || 0,
      workout_completed: true,
      meals_completed: true,
      training_type: todayLog?.training_type || null,
      training_duration_min: todayLog?.training_duration_min || null,
    });
  };

  const handleSaveWeight = () => {
    const w = parseFloat(newWeight);
    if (w > 0) {
      saveWeight.mutate(w);
      setNewWeight('');
    }
  };

  const updateCompletionStatus = useCallback((type: 'workout' | 'meals', status: boolean) => {
    saveDailyLog.mutate({
      log_date: selectedDate,
      calories_consumed: type === 'meals' ? mealTotals.calories : (todayLog?.calories_consumed || 0),
      protein_consumed: type === 'meals' ? mealTotals.protein : (todayLog?.protein_consumed || 0),
      carbs_consumed: type === 'meals' ? mealTotals.carbs : (todayLog?.carbs_consumed || 0),
      fat_consumed: type === 'meals' ? mealTotals.fat : (todayLog?.fat_consumed || 0),
      water_liters: todayLog?.water_liters || parseFloat(water) || 0,
      workout_completed: type === 'workout' ? status : (todayLog?.workout_completed || false),
      meals_completed: type === 'meals' ? status : (todayLog?.meals_completed || false),
    });
  }, [selectedDate, mealTotals, todayLog, water, saveDailyLog]);

  const handleWorkoutFinalize = useCallback((val: boolean) => {
    setWorkoutFinalized(val);
    if (val !== todayLog?.workout_completed) updateCompletionStatus('workout', val);
  }, [todayLog?.workout_completed, updateCompletionStatus]);

  const handleMealsFinalize = useCallback((val: boolean) => {
    setMealsFinalized(val);
    if (val !== todayLog?.meals_completed) updateCompletionStatus('meals', val);
  }, [todayLog?.meals_completed, updateCompletionStatus]);

  const isDirty = todayLog ? (
    parseFloat(water) !== (todayLog.water_liters || 0) ||
    workoutFinalized !== (todayLog.workout_completed || false) ||
    mealsFinalized !== (todayLog.meals_completed || false) ||
    Math.round(mealTotals.calories) !== Math.round(todayLog.calories_consumed || 0) ||
    Math.round(mealTotals.protein) !== Math.round(todayLog.protein_consumed || 0) ||
    Math.round(mealTotals.carbs) !== Math.round(todayLog.carbs_consumed || 0) ||
    Math.round(mealTotals.fat) !== Math.round(todayLog.fat_consumed || 0)
  ) : true;

  const isLocked = todayLog?.workout_completed && todayLog?.meals_completed;

  if (loadingGoal) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!goal) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center py-20 space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mx-auto">
            <Target className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-display">Primero configura tu plan</h2>
            <p className="text-muted-foreground text-sm mt-2">Necesitas calcular tus macros antes de iniciar el seguimiento diario.</p>
          </div>
          <Button onClick={() => navigate('/calculator')} variant="premium" size="lg" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            Ir a la calculadora
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const weekChartData = weeklyLogs.map(l => ({
    date: new Date(l.log_date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' }),
    Calorías: l.calories_consumed,
    Objetivo: goal.calories,
  }));

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-display font-black italic uppercase tracking-[0.3em] text-primary">Estado del Día</p>
            <h1 className="text-3xl md:text-5xl font-display font-black italic tracking-tighter uppercase leading-none">SEGUIMIENTO</h1>
            <p className="text-sm font-display font-black italic text-muted-foreground/60 uppercase tracking-widest mt-1">
              Registro del {displayDate(selectedDate)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateDate(-1)} className="h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm"
              onClick={() => setSelectedDate(formatDate(new Date()))}
              disabled={selectedDate === formatDate(new Date())}
              className="text-xs"
            >
              Hoy
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateDate(1)}
              disabled={selectedDate >= formatDate(new Date())} className="h-9 w-9">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Smart insights */}
        {insights.length > 0 && (
          <div className="space-y-2">
            {insights.map((msg, i) => (
              <div key={i} className={`rounded-xl px-4 py-3 flex items-center gap-3 text-sm border ${
                msg.type === 'success' ? 'bg-success/5 border-success/20 text-success' :
                msg.type === 'warning' ? 'bg-energy/5 border-energy/20 text-energy' :
                'bg-primary/5 border-primary/20 text-primary'
              }`}>
                {msg.type === 'success' ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> :
                 msg.type === 'warning' ? <AlertTriangle className="h-4 w-4 flex-shrink-0" /> :
                 <Info className="h-4 w-4 flex-shrink-0" />}
                <p className="text-foreground text-sm">{msg.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Macro progress with red alerts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MacroProgressBar label="Calorías" value={mealTotals.calories} target={goal.calories} unit="kcal" icon={Flame} />
          <MacroProgressBar label="Proteína" value={mealTotals.protein} target={goal.protein} unit="g" icon={Beef} />
          <MacroProgressBar label="Carbos" value={mealTotals.carbs} target={goal.carbs} unit="g" icon={Wheat} />
          <MacroProgressBar label="Grasas" value={mealTotals.fat} target={goal.fat} unit="g" icon={Droplets} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MealLogger 
            selectedDate={selectedDate} 
            displayDate={displayDate}
            mealsPerDay={goal.meals_per_day || 3}
            onTotalsChange={handleMealTotals}
            onFinalizeChange={handleMealsFinalize}
            initialFinalized={todayLog?.meals_completed}
          />

          {/* Workout Logger */}
          <WorkoutLogger 
            selectedDate={selectedDate} 
            displayDate={displayDate}
            onFinalizeChange={handleWorkoutFinalize}
            initialFinalized={todayLog?.workout_completed}
          />
        </div>




        {/* Water + Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 space-y-3">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
                <GlassWater className="h-3 w-3" /> Agua (litros)
              </Label>
              <Input type="number" value={water} onChange={e => setWater(e.target.value)} min="0" step="0.1" disabled={isLocked} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 space-y-3">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
                <Scale className="h-3 w-3" /> Actualizar peso (kg)
              </Label>
              <div className="flex gap-2">
                <Input type="number" placeholder="Ej: 70.5" value={newWeight} onChange={e => setNewWeight(e.target.value)} min="30" step="0.1" disabled={isLocked} />
                <Button variant="outline" size="sm" onClick={handleSaveWeight} disabled={!newWeight || saveWeight.isPending || isLocked}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
              {weightHistory.length > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  Último peso: <span className="font-semibold text-foreground">{weightHistory[weightHistory.length - 1]?.weight} kg</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Save summary button */}
        <Button
          onClick={handleSaveDaily}
          variant={isDirty ? "premium" : "outline"}
          className={`w-full h-13 text-base font-extrabold gap-2 rounded-2xl transition-all duration-300 ${
            !isDirty ? 'opacity-50 grayscale cursor-not-allowed border-white/5 bg-white/5' : ''
          }`}
          disabled={!isDirty || saveDailyLog.isPending}
        >
          <Save className={`h-5 w-5 ${isDirty ? 'animate-pulse' : ''}`} />
          {saveDailyLog.isPending ? 'Guardando...' : 
           !isDirty ? 'RESUMEN GUARDADO' : 'GUARDAR RESUMEN DIARIO'}
        </Button>

        {/* Weekly chart */}
        {weekChartData.length > 1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-wider">
                <TrendingUp className="h-4 w-4 text-primary" />
                Progreso semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weekChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                  <Legend />
                  <Bar dataKey="Calorías" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Objetivo" fill="hsl(var(--muted))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Weight history chart */}
        {weightHistory.length > 1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-wider">
                <Scale className="h-4 w-4 text-primary" />
                Evolución de peso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={weightHistory.map(w => ({
                  date: new Date(w.recorded_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                  Peso: w.weight,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={['auto', 'auto']} fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="Peso" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
