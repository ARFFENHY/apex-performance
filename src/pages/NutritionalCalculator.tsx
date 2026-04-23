import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calculator, Flame, Beef, Wheat, Droplets, Info, Utensils,
  TrendingDown, Equal, TrendingUp, UserCheck, ArrowRight,
  Edit3, Zap, Target, Heart, Brain,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useCreateNutritionPlan } from '@/hooks/useNutritionPlans';
import { ClientSelectorForCalculator } from '@/components/ClientSelectorForCalculator';
import { useActiveFitnessGoal, useSaveFitnessGoal, type GoalType } from '@/hooks/useFitnessGoals';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useEffect } from 'react';

type Gender = 'male' | 'female';
type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

const ACTIVITY_LABELS: Record<Activity, string> = {
  sedentary: 'Sedentario (poco o nada de ejercicio)',
  light: 'Ligero (1-3 días/semana)',
  moderate: 'Moderado (3-5 días/semana)',
  active: 'Activo (6-7 días/semana)',
  very_active: 'Muy activo (2x al día)',
};

const ACTIVITY_FACTORS: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_CONFIG: Record<GoalType, { label: string; modifier: number; icon: React.ReactNode; color: string; description: string }> = {
  aggressive_loss: {
    label: 'Pérdida agresiva',
    modifier: -750,
    icon: <TrendingDown className="h-4 w-4" />,
    color: 'text-red-500',
    description: 'Déficit agresivo de 750 kcal. Solo recomendado por periodos cortos y bajo supervisión.',
  },
  definition: {
    label: 'Definición',
    modifier: -500,
    icon: <TrendingDown className="h-4 w-4" />,
    color: 'text-orange-500',
    description: 'Déficit moderado de 500 kcal. Ideal para perder grasa preservando músculo.',
  },
  maintenance: {
    label: 'Mantenimiento',
    modifier: 0,
    icon: <Equal className="h-4 w-4" />,
    color: 'text-primary',
    description: 'Consumes lo que gastas. Tu peso se mantiene estable.',
  },
  lean_bulk: {
    label: 'Volumen limpio',
    modifier: 200,
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'text-emerald-500',
    description: 'Superávit controlado de 200 kcal. Ganancia muscular con mínima grasa.',
  },
  bulk: {
    label: 'Volumen',
    modifier: 300,
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'text-green-600',
    description: 'Superávit de 300 kcal. Para maximizar ganancia muscular.',
  },
};

function getMacroSplit(goal: GoalType) {
  switch (goal) {
    case 'aggressive_loss': return { p: 0.40, c: 0.30, f: 0.30 };
    case 'definition': return { p: 0.35, c: 0.35, f: 0.30 };
    case 'maintenance': return { p: 0.30, c: 0.40, f: 0.30 };
    case 'lean_bulk': return { p: 0.30, c: 0.45, f: 0.25 };
    case 'bulk': return { p: 0.28, c: 0.47, f: 0.25 };
  }
}

export default function NutritionalCalculator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: role } = useUserRole();
  const createNutritionPlan = useCreateNutritionPlan();
  const { data: activeGoal, isLoading: loadingGoal } = useActiveFitnessGoal();
  const saveFitnessGoal = useSaveFitnessGoal();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const isCoachOrAdmin = role === 'coach' || role === 'admin';

  // Form state
  const [gender, setGender] = useState<Gender>('male');

  // Sync gender with profile once it loads
  useEffect(() => {
    if (profile?.gender && (profile.gender === 'male' || profile.gender === 'female')) {
      setGender(profile.gender as Gender);
    } else if (activeGoal?.gender && (activeGoal.gender === 'male' || activeGoal.gender === 'female')) {
      setGender(activeGoal.gender as Gender);
    }
  }, [profile?.gender, activeGoal?.gender]);

  const [age, setAge] = useState('25');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [activity, setActivity] = useState<Activity>('moderate');
  const [goal, setGoal] = useState<GoalType>('maintenance');
  const [mealsPerDay, setMealsPerDay] = useState('3');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState('');

  // If user has active goal and hasn't clicked edit, show summary
  const hasActiveGoal = !!activeGoal && !showCalculator;

  const results = useMemo(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    const a = parseInt(age) || 0;
    if (!w || !h || !a) return null;

    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    const tdee = bmr * ACTIVITY_FACTORS[activity];
    const cfg = GOAL_CONFIG[goal];
    const targetCalories = Math.round(tdee + cfg.modifier);
    const split = getMacroSplit(goal);
    const protein = Math.round((targetCalories * split.p) / 4);
    const carbs = Math.round((targetCalories * split.c) / 4);
    const fat = Math.round((targetCalories * split.f) / 9);

    return { bmr: Math.round(bmr), tdee: Math.round(tdee), targetCalories, protein, carbs, fat };
  }, [gender, age, weight, height, activity, goal]);

  const handleCalculate = async () => {
    if (!results) return;

    // Save fitness goal
    try {
      await saveFitnessGoal.mutateAsync({
        calories: results.targetCalories,
        protein: results.protein,
        carbs: results.carbs,
        fat: results.fat,
        goal_type: goal,
        meals_per_day: parseInt(mealsPerDay),
        weight: parseFloat(weight),
        height: parseFloat(height),
        gender,
        age: parseInt(age),
        activity_level: activity,
        bmr: results.bmr,
        tdee: results.tdee,
      });

      // Persist gender to user profile for global exercise filtering
      if (!selectedClientId) {
        await updateProfile.mutateAsync({ gender });
      }

      // If coach saving for client
      if (isCoachOrAdmin && selectedClientId) {
        await createNutritionPlan.mutateAsync({
          client_id: selectedClientId,
          name: `${GOAL_CONFIG[goal].label} - ${selectedClientName} (${results.targetCalories} kcal)`,
          calories: results.targetCalories,
          protein: results.protein,
          carbs: results.carbs,
          fat: results.fat,
        });
        toast.success(`Plan guardado para ${selectedClientName}`);
      }

      setCalculated(true);
    } catch {
      // Error handled in hook
    }
  };

  const meals = parseInt(mealsPerDay) || 3;
  const displayData = hasActiveGoal ? activeGoal : (calculated && results ? {
    calories: results.targetCalories,
    protein: results.protein,
    carbs: results.carbs,
    fat: results.fat,
    bmr: results.bmr,
    tdee: results.tdee,
    goal_type: goal,
    meals_per_day: meals,
  } : null);

  if (loadingGoal) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <Calculator className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Tu Plan Nutricional</h1>
              <p className="text-sm text-muted-foreground">Tu entrenador digital personalizado</p>
            </div>
          </div>
          {hasActiveGoal && (
            <Button variant="outline" size="sm" onClick={() => setShowCalculator(true)} className="gap-2">
              <Edit3 className="h-4 w-4" />
              Editar objetivos
            </Button>
          )}
        </div>

        {/* Coach client selector */}
        {isCoachOrAdmin && (
          <ClientSelectorForCalculator
            selectedClientId={selectedClientId}
            onSelectClient={(id, name) => { setSelectedClientId(id); setSelectedClientName(name); }}
          />
        )}
        {isCoachOrAdmin && selectedClientId && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-3 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <p className="text-sm">Calculando para: <strong>{selectedClientName}</strong></p>
              <Button variant="ghost" size="sm" className="ml-auto text-xs"
                onClick={() => { setSelectedClientId(null); setSelectedClientName(''); }}>
                Quitar selección
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ACTIVE GOAL SUMMARY */}
        {hasActiveGoal && displayData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Macro cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 bg-blue-500 text-white">
                <CardContent className="pt-4 pb-4 text-center">
                  <Flame className="h-6 w-6 mx-auto mb-2 opacity-80" />
                  <p className="text-3xl font-bold">{displayData.calories}</p>
                  <p className="text-xs opacity-80">kcal / día</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-red-500 text-white">
                <CardContent className="pt-4 pb-4 text-center">
                  <Beef className="h-6 w-6 mx-auto mb-2 opacity-80" />
                  <p className="text-3xl font-bold">{displayData.protein}g</p>
                  <p className="text-xs opacity-80">Proteína</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-yellow-500 text-white">
                <CardContent className="pt-4 pb-4 text-center">
                  <Wheat className="h-6 w-6 mx-auto mb-2 opacity-80" />
                  <p className="text-3xl font-bold">{displayData.carbs}g</p>
                  <p className="text-xs opacity-80">Carbohidratos</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-green-500 text-white">
                <CardContent className="pt-4 pb-4 text-center">
                  <Droplets className="h-6 w-6 mx-auto mb-2 opacity-80" />
                  <p className="text-3xl font-bold">{displayData.fat}g</p>
                  <p className="text-xs opacity-80">Grasas</p>
                </CardContent>
              </Card>
            </div>

            {/* Goal badge */}
            <Card>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Objetivo actual</p>
                    <p className="text-xs text-muted-foreground">{GOAL_CONFIG[displayData.goal_type as GoalType]?.label}</p>
                  </div>
                </div>
                <Badge variant="secondary">{displayData.meals_per_day} comidas/día</Badge>
              </CardContent>
            </Card>

            {/* Meal distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-primary" />
                  Distribución por comida ({displayData.meals_per_day} comidas/día)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-center">
                    <p className="text-lg font-bold text-blue-600">{Math.round(displayData.calories / displayData.meals_per_day)}</p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                  <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-center">
                    <p className="text-lg font-bold text-red-600">{Math.round(displayData.protein / displayData.meals_per_day)}g</p>
                    <p className="text-xs text-muted-foreground">Proteína</p>
                  </div>
                  <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-3 text-center">
                    <p className="text-lg font-bold text-yellow-600">{Math.round(displayData.carbs / displayData.meals_per_day)}g</p>
                    <p className="text-xs text-muted-foreground">Carbos</p>
                  </div>
                  <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3 text-center">
                    <p className="text-lg font-bold text-green-600">{Math.round(displayData.fat / displayData.meals_per_day)}g</p>
                    <p className="text-xs text-muted-foreground">Grasas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* YOUR PLAN - action steps */}
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Tu plan a seguir
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Según tu objetivo de <strong>{GOAL_CONFIG[displayData.goal_type as GoalType]?.label}</strong>, esto es lo que debes hacer cada día:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/40 items-center justify-center text-xs font-bold text-blue-600 mt-0.5 flex-shrink-0">1</span>
                    <p><strong>Come {displayData.calories} kcal al día</strong> — divididas en {displayData.meals_per_day} comidas de ~{Math.round(displayData.calories / displayData.meals_per_day)} kcal cada una.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/40 items-center justify-center text-xs font-bold text-red-600 mt-0.5 flex-shrink-0">2</span>
                    <p><strong>Consume {displayData.protein}g de proteína</strong> — pollo, pescado, huevos, legumbres. Sin proteína no hay músculo.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 items-center justify-center text-xs font-bold text-yellow-600 mt-0.5 flex-shrink-0">3</span>
                    <p><strong>Incluye {displayData.carbs}g de carbohidratos</strong> — arroz, avena, pasta integral, frutas. Son tu energía para entrenar.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/40 items-center justify-center text-xs font-bold text-green-600 mt-0.5 flex-shrink-0">4</span>
                    <p><strong>No bajes de {displayData.fat}g de grasas</strong> — aguacate, aceite de oliva, frutos secos. Tus hormonas las necesitan.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 items-center justify-center text-xs font-bold text-cyan-600 mt-0.5 flex-shrink-0">5</span>
                    <p><strong>Bebe mínimo 2 litros de agua al día</strong> — la hidratación es clave para el rendimiento y la recuperación.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900/40 items-center justify-center text-xs font-bold text-purple-600 mt-0.5 flex-shrink-0">6</span>
                    <p><strong>Registra todo en el seguimiento diario</strong> — lo que no se mide, no se mejora. La constancia es el secreto.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart message */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm text-foreground">
                    Con estos valores y constancia en entrenamiento, podrás ver cambios progresivos en tu cuerpo en las próximas semanas. Mantén el enfoque y registra tu progreso diario.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Button
              size="lg"
              className="w-full gradient-primary text-primary-foreground gap-3 h-14 text-lg font-bold"
              onClick={() => navigate('/tracking')}
            >
              <ArrowRight className="h-5 w-5" />
              Comenzar seguimiento
            </Button>
          </motion.div>
        )}

        {/* CALCULATOR FORM */}
        {(!hasActiveGoal || showCalculator) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tus datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Género</Label>
                    <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Edad</Label>
                    <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} min="10" max="100" />
                  </div>
                  <div className="space-y-2">
                    <Label>Peso (kg)</Label>
                    <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} min="30" max="300" step="0.1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Altura (cm)</Label>
                    <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} min="100" max="250" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nivel de actividad</Label>
                  <Select value={activity} onValueChange={(v) => setActivity(v as Activity)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Objetivo</Label>
                  <Select value={goal} onValueChange={(v) => setGoal(v as GoalType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(GOAL_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          <span className="flex items-center gap-2">{v.icon} {v.label} ({v.modifier > 0 ? '+' : ''}{v.modifier} kcal)</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{GOAL_CONFIG[goal].description}</p>
                </div>

                <div className="space-y-2">
                  <Label>Comidas al día</Label>
                  <Select value={mealsPerDay} onValueChange={setMealsPerDay}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} {n === 1 ? 'comida' : 'comidas'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {results && (
                  <Button
                    onClick={handleCalculate}
                    className="w-full gradient-primary text-primary-foreground gap-2 h-12 text-base font-bold"
                    disabled={saveFitnessGoal.isPending}
                  >
                    <Calculator className="h-5 w-5" />
                    {saveFitnessGoal.isPending ? 'Guardando...' : 'Calcular'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Live results */}
            <div className="space-y-4">
              {results ? (
                <>
                  {/* Macro cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="border-0 bg-blue-500 text-white">
                      <CardContent className="pt-4 pb-4 text-center">
                        <Flame className="h-5 w-5 mx-auto mb-1 opacity-80" />
                        <p className="text-3xl font-bold">{results.targetCalories}</p>
                        <p className="text-xs opacity-80">kcal / día</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-red-500 text-white">
                      <CardContent className="pt-4 pb-4 text-center">
                        <Beef className="h-5 w-5 mx-auto mb-1 opacity-80" />
                        <p className="text-3xl font-bold">{results.protein}g</p>
                        <p className="text-xs opacity-80">Proteína</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-yellow-500 text-white">
                      <CardContent className="pt-4 pb-4 text-center">
                        <Wheat className="h-5 w-5 mx-auto mb-1 opacity-80" />
                        <p className="text-3xl font-bold">{results.carbs}g</p>
                        <p className="text-xs opacity-80">Carbohidratos</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-green-500 text-white">
                      <CardContent className="pt-4 pb-4 text-center">
                        <Droplets className="h-5 w-5 mx-auto mb-1 opacity-80" />
                        <p className="text-3xl font-bold">{results.fat}g</p>
                        <p className="text-xs opacity-80">Grasas</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Meal distribution */}
                  <Card>
                    <CardContent className="pt-4 pb-4">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-primary" />
                        Distribución por comida ({mealsPerDay} comidas/día)
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-2">
                          <p className="font-bold text-blue-600">{Math.round(results.targetCalories / meals)}</p>
                          <p className="text-muted-foreground">kcal</p>
                        </div>
                        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-2">
                          <p className="font-bold text-red-600">{Math.round(results.protein / meals)}g</p>
                          <p className="text-muted-foreground">Prot</p>
                        </div>
                        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-2">
                          <p className="font-bold text-yellow-600">{Math.round(results.carbs / meals)}g</p>
                          <p className="text-muted-foreground">Carbs</p>
                        </div>
                        <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-2">
                          <p className="font-bold text-green-600">{Math.round(results.fat / meals)}g</p>
                          <p className="text-muted-foreground">Grasas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* BMR/TDEE info */}
                  <Card>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">BMR (metabolismo basal)</span>
                        <span className="font-semibold">{results.bmr} kcal</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">TDEE (gasto total)</span>
                        <span className="font-semibold">{results.tdee} kcal</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calculator className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Ingresa tus datos para ver los resultados</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* EXPLANATION SECTION - always visible */}
        {(calculated || hasActiveGoal) && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  ¿Qué significan estos valores?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Heart className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">TMB — Tasa Metabólica Basal</p>
                      <p className="text-muted-foreground">Son las calorías que tu cuerpo quema solo por estar vivo: respirar, que tu corazón lata, mantener tu temperatura. Es como la "gasolina mínima" que necesitas sin moverte.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <Flame className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Calorías objetivo</p>
                      <p className="text-muted-foreground">Es tu TMB ajustada por cuánto te mueves + tu objetivo. Si quieres perder grasa, comes por debajo. Si quieres ganar músculo, comes por encima. Así de simple.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <Beef className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Proteínas → Construyen tu músculo</p>
                      <p className="text-muted-foreground">Cada vez que entrenas, tus músculos se "rompen". La proteína los repara más fuertes. Sin ella, entrenas para nada. Fuentes: pollo, huevos, pescado, legumbres.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                    <Zap className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Carbohidratos → Tu gasolina</p>
                      <p className="text-muted-foreground">Son tu fuente principal de energía. Sin ellos te sentirás débil, cansado y sin fuerza para entrenar. Fuentes: arroz, avena, papa, frutas.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 md:col-span-2">
                    <Brain className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Grasas → Tus hormonas te lo agradecen</p>
                      <p className="text-muted-foreground">Las grasas saludables producen testosterona, estrógenos y ayudan a absorber vitaminas. Sin ellas tu cuerpo no funciona bien. Fuentes: aguacate, aceite de oliva, frutos secos, pescado graso.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
