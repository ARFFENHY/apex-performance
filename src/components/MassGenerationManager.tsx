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
    const total = (EXERCISE_CATALOG.length * 2) + RECIPE_CATALOG.length; // 2 genders per exercise + recipes

    try {
      setStatus('Comenzando regeneración de ejercicios...');
      for (const ex of EXERCISE_CATALOG) {
        if (!isGenerating) break;

        // Generar para ambos géneros
        for (const gender of ['male', 'female'] as const) {
          if (!isGenerating) break;
          
          setStatus(`Generando: ${ex.name} (${gender === 'male' ? 'Hombre' : 'Mujer'})...`);
          
          try {
            const { data, error } = await supabase.functions.invoke('generate-exercise-image', {
              body: { 
                exerciseName: ex.name, 
                description: ex.description, 
                muscles: ex.muscles, 
                position: 'start', 
                gender: gender, 
                force: true 
              },
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            
            completed++;
            setProgress((completed / total) * 100);
          } catch (err: any) {
            console.error(`Falló ejercicio ${ex.name} (${gender}):`, err);
            toast.error(`Error en ${ex.name} (${gender}): ${err.message}`);
            // No detenemos el proceso completo, solo saltamos este
          }
          
          // Pequeño retardo para no saturar la API
          await new Promise(r => setTimeout(r, 800));
        }
      }

      setStatus('Comenzando regeneración de recetas...');
      for (const rec of RECIPE_CATALOG) {
        if (!isGenerating) break;
        setStatus(`Generando: ${rec.name} (Recetas)...`);
        try {
          const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
            body: { recipe_name: rec.name, ingredients: rec.ingredients, force: true },
          });
          if (error) throw error;
          if (data?.error) throw new Error(data.error);
          
          completed++;
          setProgress((completed / total) * 100);
        } catch (err: any) {
          console.error(`Falló receta ${rec.name}:`, err);
          toast.error(`Error en receta ${rec.name}: ${err.message}`);
          // Continuamos con la siguiente
        }
        
        await new Promise(r => setTimeout(r, 800));
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
