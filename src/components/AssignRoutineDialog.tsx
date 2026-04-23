import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Loader2, Check, UserPlus } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useAssignRoutine, useRoutineAssignments, useUnassignRoutine } from "@/hooks/useClientRoutines";
import { Routine } from "@/hooks/useRoutines";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface AssignRoutineDialogProps {
  routine: Routine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignRoutineDialog({ routine, open, onOpenChange }: AssignRoutineDialogProps) {
  const { data: clients = [], isLoading: loadingClients } = useClients();
  const { data: assignments = [], isLoading: loadingAssignments } = useRoutineAssignments(routine?.id || null);
  const assignRoutine = useAssignRoutine();
  const unassignRoutine = useUnassignRoutine();

  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");

  const assignedClientIds = new Set(assignments.map((a) => a.client_id));

  const filteredClients = clients.filter((c) =>
    c.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleClient = (clientId: string) => {
    setSelectedClients((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) next.delete(clientId);
      else next.add(clientId);
      return next;
    });
  };

  const handleAssign = async () => {
    if (!routine || selectedClients.size === 0) return;
    try {
      await assignRoutine.mutateAsync({
        routineId: routine.id,
        clientIds: Array.from(selectedClients),
        notes: notes.trim() || undefined,
      });
      toast.success(`Rutina asignada a ${selectedClients.size} cliente(s)`);
      setSelectedClients(new Set());
      setNotes("");
      onOpenChange(false);
    } catch {
      toast.error("Error al asignar la rutina");
    }
  };

  const handleUnassign = async (clientId: string) => {
    if (!routine) return;
    try {
      await unassignRoutine.mutateAsync({ routineId: routine.id, clientId });
      toast.success("Rutina desasignada");
    } catch {
      toast.error("Error al desasignar");
    }
  };

  const isLoading = loadingClients || loadingAssignments;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Asignar Rutina
          </DialogTitle>
        </DialogHeader>

        {routine && (
          <div className="rounded-lg bg-accent/50 p-3 mb-2">
            <p className="text-sm font-semibold">{routine.name}</p>
            <p className="text-xs text-muted-foreground">{routine.category} · {routine.duration_minutes} min · {routine.exercises.length} ejercicios</p>
          </div>
        )}

        {/* Already assigned */}
        {assignments.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Asignados actualmente</Label>
            <div className="space-y-1.5">
              {assignments.map((a) => {
                const client = clients.find((c) => c.id === a.client_id);
                return (
                  <motion.div
                    key={a.id}
                    layout
                    className="flex items-center justify-between rounded-md bg-primary/5 border border-primary/10 px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={client?.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px]">{client?.full_name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{client?.full_name || "Cliente"}</span>
                      <Badge variant="secondary" className="text-[9px] h-4">
                        <Check className="h-2.5 w-2.5 mr-0.5" /> Asignado
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] text-destructive hover:text-destructive"
                      onClick={() => handleUnassign(a.client_id)}
                      disabled={unassignRoutine.isPending}
                    >
                      Quitar
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Assign new clients */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Asignar a nuevos clientes</Label>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredClients.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              {clients.length === 0 ? "No tienes clientes aún. Invita a tu primer cliente." : "No se encontraron clientes."}
            </p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <AnimatePresence>
                {filteredClients
                  .filter((c) => !assignedClientIds.has(c.id))
                  .map((client) => (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 rounded-md hover:bg-accent/50 px-3 py-2 cursor-pointer transition-colors"
                      onClick={() => toggleClient(client.id)}
                    >
                      <Checkbox
                        checked={selectedClients.has(client.id)}
                        onCheckedChange={() => toggleClient(client.id)}
                      />
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={client.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px]">{client.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm flex-1">{client.full_name}</span>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          )}

          {selectedClients.size > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Nota para el cliente (opcional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Realizar 3 veces por semana..."
                maxLength={300}
                rows={2}
                className="text-sm"
              />
            </div>
          )}
        </div>

        <Button
          className="w-full gradient-primary text-primary-foreground gap-2"
          disabled={selectedClients.size === 0 || assignRoutine.isPending}
          onClick={handleAssign}
        >
          {assignRoutine.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          Asignar a {selectedClients.size} cliente{selectedClients.size !== 1 ? "s" : ""}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
