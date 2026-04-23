import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { EXERCISE_CATALOG } from '@/hooks/useExerciseCatalog';
import { RECIPE_CATALOG } from '@/hooks/useRecipeCatalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export function MassGenerationManager() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const runGeneration = async () => {
    setIsGenerating(true);
    let completed = 0;
    const total = EXERCISE_CATALOG.length + RECIPE_CATALOG.length; // 1 position per exercise for mass speed

    try {
      setStatus('Comenzando regeneración de ejercicios...');
      for (const ex of EXERCISE_CATALOG) {
        if (!isGenerating) break; // Allow cancel? no mechanism yet, but good practice
        setStatus(`Generando: ${ex.name} (Ejercicios)...`);
        try {
          const { data, error } = await supabase.functions.invoke('generate-exercise-image', {
            body: { 
              exerciseName: ex.name, 
              description: ex.description, 
              muscles: ex.muscles, 
              position: 'start', 
              gender: 'male', 
              force: true 
            },
          });
          if (error) throw error;
          if (data?.error) throw new Error(data.error);
        } catch (err: any) {
          console.error(`Falló ejercicio ${ex.name}:`, err);
          toast.error(`Error en ${ex.name}: ${err.message}`);
          setStatus(`Error crítico alcanzado.`);
          setIsGenerating(false);
          return; // Detenemos en caso de error para no bombardear
        }
        completed++;
        setProgress((completed / total) * 100);
        // Pequeño retardo para no saturar
        await new Promise(r => setTimeout(r, 600));
      }

      setStatus('Comenzando regeneración de recetas...');
      for (const rec of RECIPE_CATALOG) {
        setStatus(`Generando: ${rec.name} (Recetas)...`);
        try {
          const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
            body: { recipe_name: rec.name, ingredients: rec.ingredients, force: true },
          });
          if (error) throw error;
          if (data?.error) throw new Error(data.error);
        } catch (err: any) {
          console.error(`Falló receta ${rec.name}:`, err);
          toast.error(`Error en receta ${rec.name}: ${err.message}`);
          setStatus(`Error crítico alcanzado en recetas.`);
          setIsGenerating(false);
          return;
        }
        completed++;
        setProgress((completed / total) * 100);
        await new Promise(r => setTimeout(r, 600));
      }

      toast.success('¡Generación masiva completada exitosamente!');
      setStatus('¡Todo listo! Catálogo 100% regenerado.');
      
      // Auto refresh para que se vean las imágenes
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      toast.error('Error general del script.');
      setStatus('Proceso detenido.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto my-8 border-primary/20">
      <CardHeader>
        <CardTitle>Regeneración IA del Catálogo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Esto reemplazará todas las imágenes actuales generadas por IA utilizando la nueva plataforma Pollinations.ai (Gratis, Ilimitado). Se descargarán fotos en 8K ultra realistas.
        </p>
        <Progress value={progress} className="h-3" />
        <p className="text-xs text-center font-bold text-primary">{status}</p>
        <Button onClick={runGeneration} disabled={isGenerating} className="w-full" variant="premium">
          {isGenerating ? 'GENERANDO...' : 'INICIAR REGENERACIÓN MASIVA'}
        </Button>
      </CardContent>
    </Card>
  );
}
