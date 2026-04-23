import { useState, useMemo, useRef } from "react";
import { Search, Upload, Trash2, ImageIcon, Check, Apple, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RECIPE_CATALOG, RECIPE_CATEGORIES, MEAL_TYPES, type RecipeEntry } from "@/hooks/useRecipeCatalog";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useRecipeImages, useUploadRecipeImage, useDeleteRecipeImage, useGenerateRecipeImage } from "@/hooks/useRecipeImages";
import { toast } from "sonner";
import { MassGenerationManager } from "@/components/MassGenerationManager";
import { Sparkles, Sparkles as SparklesIcon } from "lucide-react";
import { motion } from "framer-motion";

function RecipeAdminCard({
  recipe,
  imageUrl,
  onUpload,
  onGenerate,
  onDelete,
  isUploading,
  isGenerating,
  onPreview,
}: {
  recipe: RecipeEntry;
  imageUrl: string | null;
  onUpload: (file: File) => void;
  onGenerate: () => void;
  onDelete: () => void;
  isUploading: boolean;
  isGenerating: boolean;
  onPreview: (url: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Solo imágenes"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Máximo 5MB"); return; }
    onUpload(file);
    e.target.value = "";
  };

  const mealLabel = MEAL_TYPES.find(m => m.value === recipe.meal_type)?.label || recipe.meal_type;

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div 
            className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0"
            onClick={() => imageUrl && onPreview(imageUrl)}
          >
            {imageUrl ? (
              <img src={imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
            ) : (
              <Apple className="h-6 w-6 text-muted-foreground/30" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm leading-tight truncate">{recipe.name}</h3>
            <div className="flex gap-1 mt-0.5">
              <Badge variant="outline" className="text-[9px]">{mealLabel}</Badge>
              {imageUrl && (
                <Badge className="bg-emerald-500/90 text-white border-0 text-[8px] px-1 py-0">
                  <Check className="h-2 w-2 mr-0.5" />OK
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 px-2" 
            onClick={() => fileRef.current?.click()}
            disabled={isUploading || isGenerating}
          >
            <Upload className="h-3.5 w-3.5" />
          </Button>
          <Button 
            size="sm" 
            variant="default" 
            className="h-8 px-2 gradient-primary" 
            onClick={onGenerate}
            disabled={isUploading || isGenerating}
          >
            {isGenerating ? "..." : <Sparkles className="h-3.5 w-3.5" />}
          </Button>
          {imageUrl && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 px-2 text-destructive" 
              onClick={onDelete}
              disabled={isUploading || isGenerating}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 text-xs text-muted-foreground space-y-1 border-t border-border/10 mt-1">
          <p><strong>Ingredientes:</strong> {recipe.ingredients}</p>
          <div className="flex gap-3 pt-1">
            <span><strong>Kcal:</strong> {recipe.calories}</span>
            <span><strong>P:</strong> {recipe.protein_g}g</span>
            <span><strong>C:</strong> {recipe.carbs_g}g</span>
            <span><strong>G:</strong> {recipe.fat_g}g</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecipeImageAdminPage() {
  const [search, setSearch] = useState("");
  const [mealFilter, setMealFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: images = [] } = useRecipeImages();
  const uploadMutation = useUploadRecipeImage();
  const generateMutation = useGenerateRecipeImage();
  const deleteMutation = useDeleteRecipeImage();
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showMassGenerator, setShowMassGenerator] = useState(false);

  const imageMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const img of images) {
      m.set(img.recipe_name, img.image_url);
    }
    return m;
  }, [images]);

  const filtered = useMemo(() => {
    return RECIPE_CATALOG.filter((r) => {
      const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.ingredients.toLowerCase().includes(search.toLowerCase());
      const matchMeal = mealFilter === "all" || r.meal_type === mealFilter;
      const hasImg = imageMap.has(r.name);
      const matchStatus = statusFilter === "all" || (statusFilter === "complete" ? hasImg : !hasImg);
      return matchSearch && matchMeal && matchStatus;
    });
  }, [search, mealFilter, statusFilter, imageMap]);

  const handleUpload = async (name: string, file: File) => {
    setUploadingKey(name);
    try {
      await uploadMutation.mutateAsync({ recipeName: name, file });
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Apple className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Imágenes de Recetas</h1>
              <p className="text-sm text-muted-foreground">
                {images.length} de {RECIPE_CATALOG.length} recetas con imagen
              </p>
            </div>
          </div>
          <Button 
            variant={showMassGenerator ? "secondary" : "default"} 
            className="gradient-primary text-white"
            onClick={() => setShowMassGenerator(!showMassGenerator)}
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            {showMassGenerator ? "Cerrar Generador" : "Generación Masiva"}
          </Button>
        </div>

        {showMassGenerator && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <MassGenerationManager 
              items={RECIPE_CATALOG}
              onGenerateItem={async (item) => {
                if (imageMap.has(item.name)) return;
                setGeneratingKey(item.name);
                await generateMutation.mutateAsync({
                  recipeName: item.name,
                  ingredients: item.ingredients
                });
                setGeneratingKey(null);
              }}
              title="Generador de Recetas"
              type="recipe"
            />
          </motion.div>
        )}

        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all" 
            style={{ width: `${(images.length / RECIPE_CATALOG.length) * 100}%` }} 
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar receta..." className="pl-9" />
          </div>
          <Select value={mealFilter} onValueChange={setMealFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de comida" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {MEAL_TYPES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="complete">Con imagen</SelectItem>
              <SelectItem value="empty">Sin imagen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((r) => (
            <RecipeAdminCard
              key={r.name}
              recipe={r}
              imageUrl={imageMap.get(r.name) || null}
              onUpload={(file) => handleUpload(r.name, file)}
              onGenerate={async () => {
                setGeneratingKey(r.name);
                try {
                  await generateMutation.mutateAsync({ recipeName: r.name, ingredients: r.ingredients });
                } finally {
                  setGeneratingKey(null);
                }
              }}
              onDelete={() => deleteMutation.mutate(r.name)}
              isUploading={uploadingKey === r.name}
              isGenerating={generatingKey === r.name}
              onPreview={setPreviewUrl}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Apple className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">No se encontraron recetas</p>
          </div>
        )}
      </div>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vista previa</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
