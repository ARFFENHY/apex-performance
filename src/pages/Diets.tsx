import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Apple, Plus, ChevronDown, ChevronUp, Flame, Trash2, Loader2, Search, Filter, Beef, Wheat, Droplets, BookOpen, ShieldCheck, UserPlus } from "lucide-react";
import { getFoodImage } from "@/lib/foodImages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiets, useCreateDietWithMeals, useDeleteDiet, type Diet } from "@/hooks/useDiets";
import { RECIPE_CATALOG, MEAL_TYPES, RECIPE_CATEGORIES, type RecipeEntry } from "@/hooks/useRecipeCatalog";
import { useRecipeImageMap } from "@/hooks/useRecipeImages";
import { useSaveMeal } from "@/hooks/useMealLogs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Play, ClipboardList, CheckCircle } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "sonner";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function getSmartMealSlot() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return { num: 1, label: "Desayuno" };
  if (hour >= 11 && hour < 16) return { num: 2, label: "Almuerzo" };
  if (hour >= 16 && hour < 19) return { num: 4, label: "Snack 1" };
  if (hour >= 19 || hour < 5) return { num: 3, label: "Cena" };
  return { num: 5, label: "Snack 2" };
}

function RecipeCard({ recipe, uploadedImageMap }: { recipe: RecipeEntry, uploadedImageMap: Map<string, string> }) {
  const saveMeal = useSaveMeal();
  const smartMeal = getSmartMealSlot();
  
  const categoryLabel = RECIPE_CATEGORIES.find(c => c.value === recipe.category)?.label || recipe.category;
  const mealLabel = MEAL_TYPES.find(m => m.value === recipe.meal_type)?.label || recipe.meal_type;

  const normalize = (v: string) => v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const uploaded = uploadedImageMap.get(normalize(recipe.name));
  const imageUrl = uploaded || getFoodImage(recipe.name, recipe.meal_type);

  return (
    <motion.div variants={item} className="rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all group">
      <div className="relative h-36 overflow-hidden">
        <img
          src={imageUrl}
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex gap-1">
          <Badge className="bg-black/50 text-white border-0 text-[10px] backdrop-blur-sm">{mealLabel}</Badge>
          <Badge className="bg-primary/80 text-primary-foreground border-0 text-[10px] backdrop-blur-sm">{categoryLabel}</Badge>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-sm text-foreground leading-tight">{recipe.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{recipe.ingredients}</p>
        <div className="grid grid-cols-4 gap-1 pt-1">
          <div className="text-center p-1.5 rounded-lg bg-accent/50">
            <p className="text-xs font-bold">{recipe.calories}</p>
            <p className="text-[9px] text-muted-foreground">kcal</p>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-accent/50">
            <p className="text-xs font-bold text-primary">{recipe.protein_g}g</p>
            <p className="text-[9px] text-muted-foreground">Prot</p>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-accent/50">
            <p className="text-xs font-bold text-energy">{recipe.carbs_g}g</p>
            <p className="text-[9px] text-muted-foreground">Carbs</p>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-accent/50">
            <p className="text-xs font-bold text-success">{recipe.fat_g}g</p>
            <p className="text-[9px] text-muted-foreground">Grasas</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1 h-9 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 text-[11px] font-bold gap-2"
            variant="outline"
            onClick={() => {
              saveMeal.mutate({
                log_date: new Date().toISOString().split('T')[0],
                meal_number: smartMeal.num,
                meal_label: smartMeal.label,
                description: recipe.name,
                calories: recipe.calories,
                protein: recipe.protein_g,
                carbs: recipe.carbs_g,
                fat: recipe.fat_g
              });
            }}
            disabled={saveMeal.isPending}
          >
            {saveMeal.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ClipboardList className="h-3.5 w-3.5" />}
            REGISTRAR EN {smartMeal.label.toUpperCase()}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 border-muted text-muted-foreground">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <p className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Registrar en...</p>
              {MEAL_TYPES.filter(m => m.value !== 'all').map((m, idx) => (
                <DropdownMenuItem 
                  key={m.value}
                  className="text-xs cursor-pointer"
                  onClick={() => {
                    saveMeal.mutate({
                      log_date: new Date().toISOString().split('T')[0],
                      meal_number: idx + 1,
                      meal_label: m.label,
                      description: recipe.name,
                      calories: recipe.calories,
                      protein: recipe.protein_g,
                      carbs: recipe.carbs_g,
                      fat: recipe.fat_g
                    });
                  }}
                >
                  {m.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}

function RecipeCatalogView() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mealFilter, setMealFilter] = useState("all");
  const uploadedImageMap = useRecipeImageMap();

  const filtered = useMemo(() => {
    return RECIPE_CATALOG.filter((r) => {
      const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.ingredients.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || r.category === categoryFilter || r.category === "all";
      const matchMeal = mealFilter === "all" || r.meal_type === mealFilter;
      return matchSearch && matchCategory && matchMeal;
    });
  }, [search, categoryFilter, mealFilter]);

  const groupedByMeal = useMemo(() => {
    const groups: Record<string, RecipeEntry[]> = {};
    filtered.forEach((r) => {
      const label = MEAL_TYPES.find(m => m.value === r.meal_type)?.label || r.meal_type;
      if (!groups[label]) groups[label] = [];
      groups[label].push(r);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar receta o ingrediente..." className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-3.5 w-3.5 mr-2" />
            <SelectValue placeholder="Objetivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los objetivos</SelectItem>
            {RECIPE_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={mealFilter} onValueChange={setMealFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tipo de comida" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {MEAL_TYPES.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} de {RECIPE_CATALOG.length} recetas</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Apple className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-sm text-muted-foreground">No se encontraron recetas</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByMeal).map(([group, recipes]) => (
            <div key={group}>
              <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
                <Apple className="h-4 w-4 text-primary" />
                {group}
                <Badge variant="secondary" className="text-xs">{recipes.length}</Badge>
              </h2>
              <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recipes.map((r) => <RecipeCard key={r.name} recipe={r} uploadedImageMap={uploadedImageMap} />)}
              </motion.div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DietCard({ diet, onDelete }: { diet: Diet; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();
  const meals = (diet.diet_meals ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  const isTemplate = (diet as any).is_template;
  const canDelete = !isTemplate || diet.coach_id === user?.id;

  return (
    <motion.div variants={item} className="rounded-xl border bg-card p-4 space-y-3 relative overflow-hidden">
      {isTemplate && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary/20 text-primary px-2 py-1 flex items-center gap-1 rounded-bl-lg">
            <ShieldCheck className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Oficial</span>
          </div>
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="pr-16">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            {diet.title}
          </h3>
          {diet.description && <p className="text-sm text-muted-foreground mt-1">{diet.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {diet.objective && (
            <Badge 
              variant="outline" 
              className={`h-6 text-[10px] font-bold border-0 ${
                diet.objective.toLowerCase() === 'deficit' ? 'bg-amber-500/10 text-amber-600' :
                diet.objective.toLowerCase() === 'maintenance' || diet.objective.toLowerCase() === 'mantenimiento' ? 'bg-emerald-500/10 text-emerald-600' :
                'bg-indigo-500/10 text-indigo-600'
              }`}
            >
              {diet.objective.toUpperCase()}
            </Badge>
          )}
          {diet.calories_target && (
            <Badge variant="secondary" className="gap-1 h-6">
              <Flame className="h-3 w-3" /> {diet.calories_target} kcal
            </Badge>
          )}
          {canDelete && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(diet.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {meals.length > 0 && (
        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {meals.length} comidas
        </Button>
      )}

      {expanded && (
        <div className="space-y-2 mt-2">
          {meals.map((meal: any) => (
            <div key={meal.id} className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{meal.meal_name}</span>
                <span className="text-xs text-muted-foreground">{meal.time_of_day}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{meal.foods}</p>
              {(meal.calories || meal.protein_g) && (
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                  {meal.calories && <span>{meal.calories} kcal</span>}
                  {meal.protein_g && <span>{meal.protein_g}g prot</span>}
                  {meal.carbs_g && <span>{meal.carbs_g}g carbs</span>}
                  {meal.fat_g && <span>{meal.fat_g}g grasas</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function CreateDietDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [caloriesTarget, setCaloriesTarget] = useState("");
  const [mealName, setMealName] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [mealFoods, setMealFoods] = useState("");
  const [meals, setMeals] = useState<any[]>([]);
  const createDiet = useCreateDietWithMeals();
  const { user } = useAuth();

  const addMeal = () => {
    if (!mealName.trim() || !mealFoods.trim()) return;
    setMeals([...meals, { meal_name: mealName, time_of_day: mealTime, foods: mealFoods }]);
    setMealName("");
    setMealTime("");
    setMealFoods("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createDiet.mutateAsync({
        diet: {
          client_id: user!.id,
          coach_id: null,
          title,
          description: description || undefined,
          calories_target: caloriesTarget ? parseInt(caloriesTarget) : null,
        },
        meals,
      });
      toast.success("Dieta creada exitosamente");
      setOpen(false);
      setTitle("");
      setDescription("");
      setCaloriesTarget("");
      setMeals([]);
    } catch {
      toast.error("Error al crear la dieta");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nueva Dieta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Plan de Dieta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Plan de definición" required />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción del plan..." />
          </div>
          <div className="space-y-2">
            <Label>Calorías objetivo (opcional)</Label>
            <Input type="number" value={caloriesTarget} onChange={(e) => setCaloriesTarget(e.target.value)} placeholder="2000" />
          </div>

          <div className="border-t pt-4 space-y-3">
            <Label className="font-semibold">Comidas ({meals.length})</Label>
            {meals.map((m, i) => (
              <div key={i} className="text-sm bg-muted/50 rounded-lg p-2 flex justify-between items-center">
                <span>{m.meal_name} — {m.foods}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setMeals(meals.filter((_, j) => j !== i))}>✕</Button>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <Input value={mealName} onChange={(e) => setMealName(e.target.value)} placeholder="Comida (ej: Desayuno)" />
              <Input value={mealTime} onChange={(e) => setMealTime(e.target.value)} placeholder="Hora (ej: 8:00 AM)" />
            </div>
            <Textarea value={mealFoods} onChange={(e) => setMealFoods(e.target.value)} placeholder="Alimentos..." />
            <Button type="button" variant="outline" size="sm" onClick={addMeal}>+ Agregar comida</Button>
          </div>

          <Button type="submit" className="w-full" disabled={createDiet.isPending}>
            {createDiet.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Crear Dieta
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function DietsPage() {
  const { user } = useAuth();
  const { data: diets, isLoading } = useDiets(undefined, user?.id);
  const deleteDiet = useDeleteDiet();
  const { role, isSuperAdmin } = useTenant();
  const canCreate = isSuperAdmin || role === "admin" || role === "coach";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Apple className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Dietas y Recetas</h1>
              <p className="text-sm text-muted-foreground">Planes de alimentación y catálogo de recetas fitness</p>
            </div>
          </div>
          {canCreate && <CreateDietDialog />}
        </div>

        <Tabs defaultValue="recipes" className="w-full">
          <TabsList>
            <TabsTrigger value="recipes" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Catálogo de Recetas ({RECIPE_CATALOG.length})
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-2">
              <Apple className="h-4 w-4" />
              Mis Dietas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="mt-4">
            <RecipeCatalogView />
          </TabsContent>

          <TabsContent value="plans" className="mt-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
            ) : !diets || diets.length === 0 ? (
              <div className="text-center py-16">
                <Apple className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-1">Sin dietas</h3>
                <p className="text-sm text-muted-foreground">Crea tu primer plan de alimentación</p>
              </div>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                {diets.map((diet) => (
                  <DietCard key={diet.id} diet={diet} onDelete={(id) => deleteDiet.mutate(id)} />
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
