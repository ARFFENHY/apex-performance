import { DashboardLayout } from "@/components/DashboardLayout";
import { Droplets, Wheat, Beef, Pencil, Trash2, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { useNutritionPlans, useUpdateNutritionPlan, useDeleteNutritionPlan, NutritionPlan } from "@/hooks/useNutritionPlans";
import { CreateNutritionPlanDialog } from "@/components/CreateNutritionPlanDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function EditNutritionPlanDialog({ plan, open, onOpenChange }: { plan: NutritionPlan; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = useState(plan.name);
  const [calories, setCalories] = useState(plan.calories);
  const [protein, setProtein] = useState(plan.protein);
  const [carbs, setCarbs] = useState(plan.carbs);
  const [fat, setFat] = useState(plan.fat);
  const updatePlan = useUpdateNutritionPlan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await updatePlan.mutateAsync({
        id: plan.id,
        name: name.trim().slice(0, 100),
        calories: Math.max(0, Math.min(10000, calories)),
        protein: Math.max(0, Math.min(1000, protein)),
        carbs: Math.max(0, Math.min(1000, carbs)),
        fat: Math.max(0, Math.min(1000, fat)),
      });
      toast.success("Plan actualizado");
      onOpenChange(false);
    } catch {
      toast.error("Error al actualizar el plan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Editar Plan – {plan.client_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre del plan</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>Calorías diarias (kcal)</Label>
            <Input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value))} min={0} max={10000} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Proteína (g)</Label>
              <Input type="number" value={protein} onChange={(e) => setProtein(Number(e.target.value))} min={0} max={1000} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Carbos (g)</Label>
              <Input type="number" value={carbs} onChange={(e) => setCarbs(Number(e.target.value))} min={0} max={1000} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Grasas (g)</Label>
              <Input type="number" value={fat} onChange={(e) => setFat(Number(e.target.value))} min={0} max={1000} />
            </div>
          </div>
          <Button type="submit" className="w-full gradient-success text-success-foreground" disabled={updatePlan.isPending}>
            {updatePlan.isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const NutritionPage = () => {
  const { data: plans = [], isLoading } = useNutritionPlans();
  const deletePlan = useDeleteNutritionPlan();
  const [editingPlan, setEditingPlan] = useState<NutritionPlan | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deletePlan.mutateAsync(deletingId);
      toast.success("Plan eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
    setDeletingId(null);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display">Nutrición</h1>
            <p className="text-sm text-muted-foreground mt-1">Planes alimenticios de tus clientes</p>
          </div>
          <CreateNutritionPlanDialog />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-xl bg-card p-10 shadow-card text-center">
            <p className="text-muted-foreground text-sm">Aún no has creado planes nutricionales. Crea uno para asignarlo a tus clientes.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ y: -2 }}
                className="rounded-xl bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gradient-success flex items-center justify-center text-sm font-bold text-success-foreground">
                      {getInitials(plan.client_name)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{plan.client_name}</p>
                      <p className="text-xs text-muted-foreground">{plan.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-1">
                      <p className="text-lg font-bold font-display">{plan.calories}</p>
                      <p className="text-[10px] text-muted-foreground">kcal/día</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingPlan(plan)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeletingId(plan.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-primary/5 p-3 text-center">
                    <Beef className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-sm font-bold">{plan.protein}g</p>
                    <p className="text-[10px] text-muted-foreground">Proteína</p>
                  </div>
                  <div className="rounded-lg bg-energy/5 p-3 text-center">
                    <Wheat className="h-4 w-4 mx-auto text-energy mb-1" />
                    <p className="text-sm font-bold">{plan.carbs}g</p>
                    <p className="text-[10px] text-muted-foreground">Carbos</p>
                  </div>
                  <div className="rounded-lg bg-success/5 p-3 text-center">
                    <Droplets className="h-4 w-4 mx-auto text-success mb-1" />
                    <p className="text-sm font-bold">{plan.fat}g</p>
                    <p className="text-[10px] text-muted-foreground">Grasas</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {editingPlan && (
        <EditNutritionPlanDialog
          plan={editingPlan}
          open={!!editingPlan}
          onOpenChange={(o) => !o && setEditingPlan(null)}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plan nutricional?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default NutritionPage;
