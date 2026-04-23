import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { GymMember } from "@/hooks/useGymMembers";

interface CreateClientDialogProps {
  gymId: string;
  gymName?: string;
  coaches?: GymMember[];
  coachId?: string; // pre-assigned coach (for coach creating own clients)
  trigger?: React.ReactNode;
}

const OBJECTIVES = [
  "Bajar de peso", "Ganar masa muscular", "Tonificar",
  "Mejorar resistencia", "Flexibilidad", "Rehabilitación",
  "Preparación deportiva", "Bienestar general",
];

export default function CreateClientDialog({ gymId, gymName, coaches = [], coachId, trigger }: CreateClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [selectedCoachId, setSelectedCoachId] = useState(coachId || "");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const resetForm = () => {
    setName(""); setEmail(""); setDni("");
    setObjetivo(""); setSelectedCoachId(coachId || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const finalCoachId = coachId || (selectedCoachId && selectedCoachId !== "none" ? selectedCoachId : undefined);

      // Save current session before signUp (signUp changes the active session)
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData?.session;

      const { error } = await supabase.auth.signUp({
        email,
        password: dni, // La contraseña es el DNI del usuario
        options: {
          data: {
            full_name: name,
            role: "client",
            gym_id: gymId,
            coach_id: finalCoachId,
            dni,
            objetivo,
          },
        },
      });

      if (error) throw error;

      // Restore the current user session
      if (currentSession) {
        await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
        });
      }

      toast.success(`Cliente "${name}" creado exitosamente`);
      qc.invalidateQueries({ queryKey: ["gym_members"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["gyms_admin"] });
      resetForm();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error al crear cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-1.5">
            <UserPlus className="h-3.5 w-3.5" /> Nuevo Cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2 col-span-2">
              <Label>Nombre completo *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del cliente" required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Email (Usa el sufijo de tu gym ej: @zeuzgym.com) *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={`cliente@${gymName?.toLowerCase().replace(/\s+/g, '') || 'gym'}.com`} required />
            </div>
            <div className="space-y-2">
              <Label>DNI / Documento (Contraseña) *</Label>
              <Input value={dni} onChange={(e) => setDni(e.target.value)} placeholder="Ej: 12345678" required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label>Objetivo</Label>
              <Select value={objetivo} onValueChange={setObjetivo}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {OBJECTIVES.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!coachId && coaches.length > 0 && (
              <div className="space-y-2 col-span-2">
                <Label>Asignar a coach</Label>
                <Select value={selectedCoachId} onValueChange={setSelectedCoachId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sin coach asignado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin coach</SelectItem>
                    {coaches.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Se asignará a: <strong>{gymName || "este gimnasio"}</strong>
          </p>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
            Crear Cliente
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
