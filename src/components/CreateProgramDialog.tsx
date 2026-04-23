import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateProgram, useUpdateProgram, type Program } from "@/hooks/usePrograms";

interface Props {
  trigger: React.ReactNode;
  editProgram?: Program | null;
  onClose?: () => void;
}

export function CreateProgramDialog({ trigger, editProgram, onClose }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(editProgram?.name || "");
  const [description, setDescription] = useState(editProgram?.description || "");

  const createMutation = useCreateProgram();
  const updateMutation = useUpdateProgram();
  const isEdit = !!editProgram;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEdit) {
      await updateMutation.mutateAsync({ id: editProgram.id, name, description });
    } else {
      await createMutation.mutateAsync({ name, description });
    }
    setName("");
    setDescription("");
    setOpen(false);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) onClose?.(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Programa" : "Nuevo Programa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prog-name">Nombre</Label>
            <Input id="prog-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Programa Fuerza 12 semanas" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prog-desc">Descripción</Label>
            <Textarea id="prog-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción del programa..." rows={3} />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? "Guardar Cambios" : "Crear Programa"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
