import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useCreateNutritionPlan } from "@/hooks/useNutritionPlans";
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function CreateNutritionPlanDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [calories, setCalories] = useState(2000);
  const [protein, setProtein] = useState(150);
  const [carbs, setCarbs] = useState(200);
  const [fat, setFat] = useState(70);
  const { data: clients = [] } = useClients();
  const createPlan = useCreateNutritionPlan();
  const queryClient = useQueryClient();

  const resetForm = () => {
    setClientId("");
    setName("");
    setCalories(2000);
    setProtein(150);
    setCarbs(200);
    setFat(70);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !name.trim()) return;

    try {
      await createPlan.mutateAsync({
        client_id: clientId,
        name: name.trim().slice(0, 100),
        calories: Math.max(0, Math.min(10000, calories)),
        protein: Math.max(0, Math.min(1000, protein)),
        carbs: Math.max(0, Math.min(1000, carbs)),
        fat: Math.max(0, Math.min(1000, fat)),
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard_stats"] });
      toast.success("Plan nutricional creado exitosamente");
      resetForm();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error al crear el plan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gradient-success text-success-foreground gap-2">
            <Plus className="h-4 w-4" /> Nuevo Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Nuevo Plan Nutricional</DialogTitle>
          <DialogDescription>Asigna un plan alimenticio a uno de tus clientes.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes clientes vinculados. Invita a un cliente primero.</p>
            ) : (
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-name">Nombre del plan</Label>
            <Input
              id="plan-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Definición - Fase 1"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-calories">Calorías diarias (kcal)</Label>
            <Input
              id="plan-calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              min={0}
              max={10000}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Proteína (g)</Label>
              <Input
                type="number"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                min={0}
                max={1000}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Carbos (g)</Label>
              <Input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                min={0}
                max={1000}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Grasas (g)</Label>
              <Input
                type="number"
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                min={0}
                max={1000}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gradient-success text-success-foreground"
            disabled={createPlan.isPending || !clientId || !name.trim()}
          >
            {createPlan.isPending ? "Guardando..." : "Crear Plan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
