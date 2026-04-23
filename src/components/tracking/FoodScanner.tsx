import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Loader2, Check, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ScanResult {
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  suggestion: string;
}

interface FoodScannerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { description: string; calories: number; protein: number; carbs: number; fat: number; ai_analysis: string }) => void;
}

export function FoodScanner({ open, onClose, onConfirm }: FoodScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<ScanResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Convert to base64
    const base64 = await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onload = () => {
        const b64 = (r.result as string).split(',')[1];
        resolve(b64);
      };
      r.readAsDataURL(file);
    });

    setScanning(true);
    setResult(null);
    setEditValues(null);

    try {
      const { data, error } = await supabase.functions.invoke('scan-food', {
        body: { image_base64: base64, mime_type: file.type },
      });
      if (error) throw error;
      const scanResult = data as ScanResult;
      setResult(scanResult);
      setEditValues(scanResult);
    } catch (err) {
      console.error('Food scan error:', err);
      setResult(null);
    } finally {
      setScanning(false);
    }
  };

  const handleConfirm = () => {
    if (!editValues) return;
    onConfirm({
      description: editValues.description,
      calories: editValues.calories,
      protein: editValues.protein,
      carbs: editValues.carbs,
      fat: editValues.fat,
      ai_analysis: editValues.suggestion,
    });
    setResult(null);
    setEditValues(null);
    setPreview(null);
    onClose();
  };

  const reset = () => {
    setResult(null);
    setEditValues(null);
    setPreview(null);
    setScanning(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm uppercase tracking-wider">
            <Camera className="h-4 w-4 text-primary" />
            Escáner de Alimentos IA
          </DialogTitle>
        </DialogHeader>

        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />

        {!preview && !scanning && (
          <div className="text-center space-y-4 py-6">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Camera className="h-10 w-10 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Toma una foto de tu comida y la IA estimará los macros automáticamente</p>
            <Button onClick={() => fileRef.current?.click()} variant="premium" className="gap-2">
              <Camera className="h-4 w-4" /> Escanear comida
            </Button>
          </div>
        )}

        {preview && (
          <div className="rounded-xl overflow-hidden border border-border/40">
            <img src={preview} alt="Food" className="w-full h-48 object-cover" />
          </div>
        )}

        {scanning && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analizando tu comida...</p>
          </div>
        )}

        {editValues && !scanning && (
          <div className="space-y-4">
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Análisis IA</span>
              </div>
              <p className="text-sm text-foreground">{result?.description}</p>
              {result?.suggestion && (
                <p className="text-xs text-muted-foreground mt-2 italic">💡 {result.suggestion}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Descripción</Label>
              <Input value={editValues.description} onChange={e => setEditValues({ ...editValues, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Calorías (kcal)</Label>
                <Input type="number" value={editValues.calories} onChange={e => setEditValues({ ...editValues, calories: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Proteína (g)</Label>
                <Input type="number" value={editValues.protein} onChange={e => setEditValues({ ...editValues, protein: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Carbos (g)</Label>
                <Input type="number" value={editValues.carbs} onChange={e => setEditValues({ ...editValues, carbs: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Grasas (g)</Label>
                <Input type="number" value={editValues.fat} onChange={e => setEditValues({ ...editValues, fat: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => fileRef.current?.click()} className="flex-1 gap-2">
                <Camera className="h-4 w-4" /> Re-escanear
              </Button>
              <Button variant="premium" onClick={handleConfirm} className="flex-1 gap-2">
                <Check className="h-4 w-4" /> Confirmar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
