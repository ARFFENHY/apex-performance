import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PhoneInput from "@/components/PhoneInput";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface CreateCoachDialogProps {
  gymId: string;
  gymName?: string;
  trigger?: React.ReactNode;
}

const SPECIALTIES = [
  "Musculación", "CrossFit", "Yoga", "Pilates", "Funcional",
  "Cardio", "Natación", "Artes marciales", "Running", "Otro",
];

export default function CreateCoachDialog({ gymId, gymName, trigger }: CreateCoachDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const resetForm = () => {
    setName(""); setEmail(""); setDocumento("");
    setTelefono(""); setEspecialidad("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    try {
      // Save current session before signUp (signUp changes the active session)
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData?.session;

      const { error } = await supabase.auth.signUp({
        email,
        password: crypto.randomUUID().slice(0, 12) + "Aa1!",
        options: {
          data: {
            full_name: name,
            role: "coach",
            gym_id: gymId,
            documento,
            telefono,
            especialidad,
          },
        },
      });

      if (error) throw error;

      // Restore the super_admin / current user session
      if (currentSession) {
        await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
        });
      }

      toast.success(`Coach "${name}" creado exitosamente`);
      qc.invalidateQueries({ queryKey: ["gym_members"] });
      qc.invalidateQueries({ queryKey: ["gyms_admin"] });
      resetForm();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error al crear coach");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1.5">
            <UserPlus className="h-3.5 w-3.5" /> Nuevo Coach
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Coach</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2 col-span-2">
              <Label>Nombre completo *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del coach" required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Email *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="coach@email.com" required />
            </div>
            <div className="space-y-2">
              <Label>Documento / DNI</Label>
              <Input value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="12345678" />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <PhoneInput value={telefono} onChange={setTelefono} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Especialidad</Label>
              <Select value={especialidad} onValueChange={setEspecialidad}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Se asignará a: <strong>{gymName || "este gimnasio"}</strong>. Se enviará un email de verificación.
          </p>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
            Crear Coach
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
