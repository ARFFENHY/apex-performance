import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Flame, Plus, Save, Trash2, Camera, Check, ChevronDown, ChevronUp, Search, Apple, Beef, Wheat, Droplets, BookOpen, Filter, RotateCcw, Trophy, CheckCircle2 } from 'lucide-react';
import { useMealLogs, useSaveMeal, useDeleteMeal, type MealLog } from '@/hooks/useMealLogs';
import { FoodScanner } from './FoodScanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RECIPE_CATALOG, type RecipeEntry, RECIPE_CATEGORIES } from '@/hooks/useRecipeCatalog';
import { useRecipeImageMap } from '@/hooks/useRecipeImages';
import { getFoodImage } from '@/lib/foodImages';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MEAL_LABELS: Record<number, string> = {
  1: 'Desayuno',
  2: 'Almuerzo',
  3: 'Cena',
  4: 'Snack 1',
  5: 'Snack 2',
};

interface MealForm {
  id?: string;
  meal_number: number;
  meal_label: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ai_analysis: string;
  image_url: string;
  saved: boolean;
}

interface MealLoggerProps {
  selectedDate: string;
  displayDate: (d: string) => string;
  mealsPerDay: number;
  onTotalsChange: (totals: { calories: number; protein: number; carbs: number; fat: number }) => void;
  onFinalizeChange?: (finalized: boolean) => void;
}

function RecipeSearchDialog({ onSelect, onClose, defaultMealType }: { onSelect: (recipe: RecipeEntry) => void; onClose: () => void; defaultMealType?: string }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState(defaultMealType || "all");
  const uploadedImageMap = useRecipeImageMap();

  const handleSelect = (recipe: RecipeEntry) => {
    onSelect(recipe);
    onClose();
  };

  const filtered = useMemo(() => {
    return RECIPE_CATALOG.filter((r) => {
      const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.ingredients.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || r.category === categoryFilter || r.category === "all";
      const matchType = typeFilter === "all" || r.meal_type === typeFilter;
      return matchSearch && matchCategory && matchType;
    });
  }, [search, categoryFilter, typeFilter]);

  const normalize = (v: string) => v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
      <DialogHeader className="p-6 bg-gradient-to-br from-primary/10 via-background to-background border-b border-primary/10">
        <DialogTitle className="text-2xl font-display font-black flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Apple className="h-5 w-5 text-primary" />
          </div>
          Buscador de Recetas
        </DialogTitle>
      </DialogHeader>

      <div className="p-4 bg-muted/30 border-b border-border/50 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Buscar por nombre o ingrediente..." 
              className="pl-9 h-11 bg-background border-primary/20 focus:border-primary shadow-sm"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] h-11 bg-background border-primary/20">
              <Filter className="h-3.5 w-3.5 mr-2" />
              <SelectValue placeholder="Objetivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Ver todo</SelectItem>
              {RECIPE_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] h-11 bg-background border-primary/20">
              <Apple className="h-3.5 w-3.5 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier momento</SelectItem>
              <SelectItem value="desayuno">Desayuno</SelectItem>
              <SelectItem value="almuerzo">Almuerzo</SelectItem>
              <SelectItem value="cena">Cena</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
              <SelectItem value="pre_entreno">Pre-entreno</SelectItem>
              <SelectItem value="post_entreno">Post-entreno</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
          {filtered.map((recipe) => {
            const uploaded = uploadedImageMap.get(normalize(recipe.name));
            const imageUrl = uploaded || getFoodImage(recipe.name, recipe.meal_type);
            const categoryLabel = RECIPE_CATEGORIES.find(c => c.value === recipe.category)?.label || recipe.category;

            return (
              <div 
                key={recipe.name} 
                className="group relative rounded-2xl border bg-card hover:border-primary/50 hover:shadow-xl transition-all overflow-hidden cursor-pointer"
                onClick={() => handleSelect(recipe)}
              >
                <div className="relative h-32 overflow-hidden">
                  <img src={imageUrl} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      variant="premium" 
                      size="sm" 
                      className="rounded-full font-bold shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(recipe);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> AGREGAR
                    </Button>
                  </div>

                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between group-hover:opacity-0 transition-opacity">
                    <Badge className="bg-primary hover:bg-primary text-[10px] font-bold border-none shadow-lg">
                      {categoryLabel}
                    </Badge>
                    <span className="text-white font-black text-sm drop-shadow-md">
                      {recipe.calories} <span className="text-[10px] font-medium opacity-70">kcal</span>
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-sm leading-tight text-foreground line-clamp-1">{recipe.name}</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-[10px] font-bold text-muted-foreground">{recipe.protein_g}P</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-energy" />
                      <span className="text-[10px] font-bold text-muted-foreground">{recipe.carbs_g}C</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-success" />
                      <span className="text-[10px] font-bold text-muted-foreground">{recipe.fat_g}G</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed">
            <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">No se encontraron recetas que coincidan</p>
          </div>
        )}
      </ScrollArea>
    </DialogContent>
  );
}

export function MealLogger({ selectedDate, displayDate, mealsPerDay, onTotalsChange, onFinalizeChange, initialFinalized = false }: MealLoggerProps & { initialFinalized?: boolean }) {
  const { data: savedMeals = [], isLoading } = useMealLogs(selectedDate);
  const saveMeal = useSaveMeal();
  const deleteMeal = useDeleteMeal();
  const [isFinalized, setIsFinalized] = useState(initialFinalized);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const lastReportedRef = useRef(initialFinalized);

  useEffect(() => {
    setIsFinalized(initialFinalized);
  }, [initialFinalized]);

  const uploadedImageMap = useRecipeImageMap();

  useEffect(() => {
    if (isFinalized !== lastReportedRef.current) {
      onFinalizeChange?.(isFinalized);
      lastReportedRef.current = isFinalized;
    }
  }, [isFinalized, onFinalizeChange]);

  const [meals, setMeals] = useState<MealForm[]>([]);
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<number>(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTarget, setSearchTarget] = useState<number>(0);
  const [showDetails, setShowDetails] = useState(false);

  // Check if today's log is already somehow finalized (we can use a local state or a convention)
  // For now, let's use a local state. In a real app, this would come from the DB.


  // Initialize meals based on mealsPerDay + saved data
  useEffect(() => {
    if (isLoading) return;

    const base: MealForm[] = [];
    const count = Math.max(mealsPerDay, 1);
    
    for (let i = 1; i <= count; i++) {
      const saved = savedMeals.find(m => m.meal_number === i);
      base.push({
        id: saved?.id,
        meal_number: i,
        meal_label: saved?.meal_label || MEAL_LABELS[i] || `Comida ${i}`,
        description: saved?.description || '',
        calories: saved?.calories || 0,
        protein: saved?.protein || 0,
        carbs: saved?.carbs || 0,
        fat: saved?.fat || 0,
        ai_analysis: saved?.ai_analysis || '',
        image_url: saved?.image_url || '',
        saved: !!saved,
      });
    }

    // Add extra meals that were saved beyond mealsPerDay
    savedMeals
      .filter(m => m.meal_number > count)
      .forEach(m => {
        base.push({
          id: m.id,
          meal_number: m.meal_number,
          meal_label: m.meal_label || `Comida extra`,
          description: m.description || '',
          calories: m.calories || 0,
          protein: m.protein || 0,
          carbs: m.carbs || 0,
          fat: m.fat || 0,
          ai_analysis: m.ai_analysis || '',
          image_url: m.image_url || '',
          saved: true,
        });
      });

    setMeals(base);
  }, [savedMeals, mealsPerDay, isLoading, selectedDate]);

  // Report totals
  useEffect(() => {
    const totals = meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    onTotalsChange(totals);
  }, [meals, onTotalsChange]);

  const updateMeal = (index: number, field: keyof MealForm, value: string | number) => {
    setMeals(prev => prev.map((m, i) => i === index ? { ...m, [field]: value, saved: false } : m));
  };

  const handleSaveMeal = (index: number) => {
    const m = meals[index];
    saveMeal.mutate({
      id: m.id,
      log_date: selectedDate,
      meal_number: m.meal_number,
      meal_label: m.meal_label,
      description: m.description,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
      ai_analysis: m.ai_analysis,
      image_url: m.image_url,
    });
  };

  const handleDeleteMeal = (index: number) => {
    const m = meals[index];
    if (m.id) {
      deleteMeal.mutate(m.id);
    }
    if (m.meal_number > mealsPerDay) {
      setMeals(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addExtraMeal = () => {
    const nextNum = Math.max(...meals.map(m => m.meal_number), 0) + 1;
    setMeals(prev => [...prev, {
      meal_number: nextNum,
      meal_label: 'Comida extra',
      description: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      ai_analysis: '',
      image_url: '',
      saved: false,
    }]);
    setExpandedMeal(meals.length);
  };

  const openScanner = (index: number) => {
    setScannerTarget(index);
    setScannerOpen(true);
  };

  const handleScanConfirm = (data: { description: string; calories: number; protein: number; carbs: number; fat: number; ai_analysis: string }) => {
    setMeals(prev => prev.map((m, i) => i === scannerTarget ? {
      ...m,
      description: data.description,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      ai_analysis: data.ai_analysis,
      image_url: data.description ? getFoodImage(data.description, 'almuerzo') : '',
      saved: false,
    } : m));
    setExpandedMeal(scannerTarget);
  };

  if (isLoading) return null;

  return (
    <>
      <Card>
      <div className="relative overflow-hidden rounded-t-[2rem] bg-slate-950 px-6 py-10 text-center min-h-[340px] flex flex-col justify-center">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-success/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-4xl md:text-5xl font-display font-black italic tracking-tighter text-white leading-none">
              NUTRICIÓN
            </h2>
            <div className="flex flex-col items-center gap-2 min-h-[60px] justify-center">
              <Badge className="bg-primary/20 text-primary border border-primary/30 font-black italic py-1 px-4 rounded-full text-[10px] mt-1">
                <Flame className="h-3.5 w-3.5 mr-1.5" /> {meals.length} COMIDAS REGISTRADAS
              </Badge>
              {isFinalized && (
                <Badge className="bg-[#00FF87] text-black border-0 shadow-xl shadow-[#00FF87]/20 font-black italic py-1 px-4 rounded-full text-[10px]">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> FINALIZADO
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm font-display font-black italic uppercase tracking-[0.2em] text-white/60">
            Control de ingesta diaria y macros
          </p>

          <div className="pt-4 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-success">Estado Vital</span>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
              <Apple className="h-4 w-4 text-success" />
              <span className="text-sm font-black text-white tracking-tighter capitalize">{displayDate(selectedDate)}</span>
            </div>
          </div>
        </div>
      </div>
        <CardContent className="space-y-2">
          {isFinalized && (
            <div className="pt-10 mt-0 border-none animate-in zoom-in duration-700">
               <div className="bg-[#EFFFF6] border border-success/10 rounded-[3.5rem] p-12 text-center shadow-[0_20px_50px_rgba(0,255,135,0.1)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Trophy className="h-40 w-40 text-success -rotate-12 translate-x-12 -translate-y-12" />
                  </div>
                  <div className="relative z-10">
                    <div className="h-24 w-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                      <Trophy className="h-12 w-12 text-success" />
                    </div>
                    <div className="min-h-[140px] flex flex-col justify-center">
                      <h4 className="text-5xl font-black italic text-success mb-4 tracking-tighter leading-none uppercase">¡NUTRICIÓN PRO!</h4>
                      <p className="text-sm text-muted-foreground font-black italic uppercase tracking-[0.2em] opacity-40">
                        Has completado la carga de nutrientes. ¡Disciplina pura!
                      </p>
                    </div>
                    <div className="pt-6 border-t border-success/10 min-h-[80px] flex items-center justify-center">
                      <p className="text-xs text-muted-foreground italic font-bold">
                        “Que tu medicina sea tu alimento, y tu alimento tu medicina.”
                      </p>
                    </div>
                  </div>
               </div>
               <div className="pt-8 flex flex-col items-center gap-6 mb-10">
                 <Button 
                   variant="outline"
                   className="h-12 px-10 rounded-full border-success/20 text-success font-black text-xs uppercase tracking-[0.3em] hover:bg-success/5 shadow-lg shadow-success/10"
                   onClick={() => setShowDetails(!showDetails)}
                 >
                   {showDetails ? 'OCULTAR REGISTRO' : 'VER REGISTRO'}
                 </Button>
                  {!initialFinalized && (
                    <Button 
                      variant="ghost" 
                      className="font-black text-[11px] uppercase tracking-[0.3em] opacity-30 hover:opacity-100 transition-all"
                      onClick={() => setIsFinalized(false)}
                    >
                      EDITAR COMIDAS
                    </Button>
                  )}
               </div>
            </div>
          )}

          {(isFinalized && showDetails || !isFinalized) && meals.map((meal, i) => {
            const isExpanded = expandedMeal === i;
            const canEdit = !isFinalized;
            return (
              <div key={i} className={`rounded-xl border transition-all ${
                meal.saved ? 'border-success/30 bg-success/5' : 'border-border/40'
              }`}>
                {/* Header */}
                <button 
                  onClick={() => setExpandedMeal(isExpanded ? null : i)}
                  className="w-full flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-2">
                    {meal.saved && <Check className="h-3.5 w-3.5 text-success" />}
                    <span className="text-sm font-semibold">{meal.meal_label}</span>
                    {meal.calories > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {meal.calories}kcal · {meal.protein}P · {meal.carbs}C · {meal.fat}G
                      </span>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>

                {/* Expanded form */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-border/20 pt-3">
                    {meal.image_url && (
                      <div className="relative h-40 w-full rounded-xl overflow-hidden mb-2">
                        <img src={meal.image_url} alt={meal.description} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    )}
                    
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Descripción</Label>
                          <Input 
                            value={meal.description} 
                            onChange={e => updateMeal(i, 'description', e.target.value)}
                            placeholder="¿Qué comiste?"
                            className="h-11 shadow-sm"
                            disabled={!canEdit}
                          />
                      </div>
                      {canEdit && (
                        <div className="flex gap-1.5">
                          <Dialog open={searchOpen && searchTarget === i} onOpenChange={(open) => {
                            setSearchOpen(open);
                            if (open) setSearchTarget(i);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon" className="h-11 w-11 border-primary/20 hover:border-primary hover:bg-primary/5 text-primary shadow-sm" title="Buscar en catálogo">
                                <BookOpen className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <RecipeSearchDialog 
                              defaultMealType={
                                meal.meal_label.toLowerCase().includes('desayuno') ? 'desayuno' :
                                meal.meal_label.toLowerCase().includes('almuerzo') ? 'almuerzo' :
                                meal.meal_label.toLowerCase().includes('cena') ? 'cena' :
                                meal.meal_label.toLowerCase().includes('snack') ? 'snack' :
                                undefined
                              }
                              onClose={() => setSearchOpen(false)}
                              onSelect={(recipe) => {
                                const normalize = (v: string) => v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                                const uploaded = uploadedImageMap.get(normalize(recipe.name));
                                const imageUrl = uploaded || getFoodImage(recipe.name, recipe.meal_type);

                                setMeals(prev => prev.map((m, idx) => idx === i ? {
                                  ...m,
                                  description: recipe.name,
                                  calories: recipe.calories,
                                  protein: recipe.protein_g,
                                  carbs: recipe.carbs_g,
                                  fat: recipe.fat_g,
                                  ai_analysis: recipe.ingredients,
                                  image_url: imageUrl,
                                  saved: false,
                                } : m));
                              }} 
                            />
                          </Dialog>
                          <Button variant="outline" size="icon" onClick={() => openScanner(i)} className="h-11 w-11 border-primary/20 hover:border-primary hover:bg-primary/5 text-primary shadow-sm" title="Escanear con IA">
                            <Camera className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {meal.ai_analysis && (
                      <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                        <div className="flex items-center gap-2 mb-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Ingredientes y Detalles</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                          "{meal.ai_analysis}"
                        </p>
                      </div>
                    )}

                      <div className="grid grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Calorías</Label>
                          <Input type="number" value={meal.calories} onChange={e => updateMeal(i, 'calories', parseFloat(e.target.value) || 0)} min="0" className="h-9 text-center bg-muted/20" disabled={!canEdit} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Proteína</Label>
                          <Input type="number" value={meal.protein} onChange={e => updateMeal(i, 'protein', parseFloat(e.target.value) || 0)} min="0" className="h-9 text-center bg-muted/20" disabled={!canEdit} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Carbos</Label>
                          <Input type="number" value={meal.carbs} onChange={e => updateMeal(i, 'carbs', parseFloat(e.target.value) || 0)} min="0" className="h-9 text-center bg-muted/20" disabled={!canEdit} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Grasas</Label>
                          <Input type="number" value={meal.fat} onChange={e => updateMeal(i, 'fat', parseFloat(e.target.value) || 0)} min="0" className="h-9 text-center bg-muted/20" disabled={!canEdit} />
                        </div>
                      </div>

                      {canEdit && (
                        <div className="flex gap-2">
                          <Button variant="premium" size="sm" onClick={() => handleSaveMeal(i)} disabled={saveMeal.isPending} className="flex-1 gap-2 font-bold uppercase text-[10px] tracking-widest h-10">
                            <Save className="h-4 w-4" /> Guardar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setMeals(prev => prev.map((m, idx) => idx === i ? {
                                ...m,
                                description: '',
                                calories: 0,
                                protein: 0,
                                carbs: 0,
                                fat: 0,
                                ai_analysis: '',
                                image_url: '',
                                saved: false,
                              } : m));
                            }} 
                            className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                            title="Limpiar campos"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          {meal.meal_number > mealsPerDay && (
                            <Button variant="outline" size="sm" onClick={() => handleDeleteMeal(i)} className="h-10 text-destructive gap-2 font-bold uppercase text-[10px] tracking-widest border-destructive/20 hover:bg-destructive/5">
                              <Trash2 className="h-4 w-4" /> Eliminar
                            </Button>
                          )}
                        </div>
                      )}
                  </div>
                )}
              </div>
            );
          })}

          {!isFinalized && (
            <Button 
              variant="outline" 
              onClick={addExtraMeal} 
              className="w-full gap-2 mt-2"
              disabled={isFinalized}
            >
              <Plus className="h-4 w-4" /> Agregar comida extra
            </Button>
          )}

          {!isFinalized && meals.length > 0 && (
            <div className="pt-6 border-t border-border/20 mt-6">
              <Button 
                onClick={() => {
                  setIsFinalized(true);
                  toast.success('¡Nutrición del día finalizada!', { icon: '🍎' });
                }}
                variant="premium" 
                className="w-full h-12 gap-2 font-black italic shadow-lg shadow-primary/20"
              >
                FINALIZAR COMIDAS DEL DÍA <CheckCircle2 className="h-4 w-4" />
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-widest font-bold opacity-60">
                Al finalizar se bloqueará la edición de hoy
              </p>
            </div>
          )}
        </CardContent>
      </Card>


      <FoodScanner 
        open={scannerOpen} 
        onClose={() => setScannerOpen(false)} 
        onConfirm={handleScanConfirm}
      />
    </>
  );
}
