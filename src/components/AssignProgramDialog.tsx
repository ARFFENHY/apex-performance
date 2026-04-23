import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FolderOpen, Loader2, UserPlus, Sparkles } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { usePrograms } from "@/hooks/usePrograms";
import { useAssignProgram } from "@/hooks/useClientWorkouts";
import { motion, AnimatePresence } from "framer-motion";

interface AssignProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedClientId?: string;
  preselectedProgramId?: string;
}

const PROGRESSIVE_OVERLOAD_MESSAGE = `La sobrecarga progresiva es el principio más importante del entrenamiento. Si levantas siempre el mismo peso por las mismas repeticiones, tu cuerpo no tiene razones para cambiar.

3 Formas de Aplicarla:
1. Más Peso: Cuando llegues al máximo de repeticiones indicadas con buena técnica, sube la carga (ej: +2.5kg o +1 disco).
2. Más Repeticiones: Si no puedes subir el peso, intenta hacer 1 o 2 reps más que la semana anterior con el mismo peso.
3. Menos Descanso: Reduce el descanso entre series (ej: de 90s a 60s) manteniendo el mismo peso.

Semáforo de la Técnica:
🟢 Verde: Técnica perfecta, podías hacer 2+ reps. ¡Sube el peso!
🟡 Amarillo: Técnica aceptable, últimas reps lentas. Mantén el peso.
🔴 Rojo: Perdiste la postura o necesitaste ayuda. Baja el peso un 10%.`;

export function AssignProgramDialog({ open, onOpenChange, preselectedClientId, preselectedProgramId }: AssignProgramDialogProps) {
  const { data: clients = [], isLoading: loadingClients } = useClients();
  const { data: programs = [], isLoading: loadingPrograms } = usePrograms();
  const assignProgram = useAssignProgram();

  const [selectedClients, setSelectedClients] = useState<Set<string>>(
    preselectedClientId ? new Set([preselectedClientId]) : new Set()
  );
  const [selectedProgramId, setSelectedProgramId] = useState(preselectedProgramId || "");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");

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
    if (!selectedProgramId || selectedClients.size === 0) return;
    try {
      await assignProgram.mutateAsync({
        clientIds: Array.from(selectedClients),
        programId: selectedProgramId,
        startDate,
        notes: notes.trim() || undefined,
      });
      setSelectedClients(new Set());
      setNotes("");
      onOpenChange(false);
    } catch {
      // handled by hook
    }
  };

  const isLoading = loadingClients || loadingPrograms;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Asignar Programa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Program selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Programa</Label>
            <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un programa" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start date */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha de inicio</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          {/* Client selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clientes</Label>
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
              <p className="text-xs text-muted-foreground text-center py-4">No se encontraron clientes.</p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <AnimatePresence>
                  {filteredClients.map((client) => (
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
                        <AvatarFallback className="text-[10px]">
                          {client.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm flex-1">{client.full_name}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Notes */}
          {selectedClients.size > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nota / Instrucciones</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-[10px] gap-1 text-primary hover:text-primary-foreground hover:bg-primary/20"
                  onClick={() => setNotes(PROGRESSIVE_OVERLOAD_MESSAGE)}
                >
                  <Sparkles className="h-3 w-3" /> Cargar Guía Progresiva
                </Button>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Iniciar con semana de adaptación..."
                maxLength={2000}
                rows={4}
                className="text-sm resize-none"
              />
              <p className="text-[10px] text-right text-muted-foreground">
                {notes.length}/2000 caracteres
              </p>
            </div>
          )}
        </div>

        <Button
          className="w-full gradient-primary text-primary-foreground gap-2"
          disabled={selectedClients.size === 0 || !selectedProgramId || assignProgram.isPending}
          onClick={handleAssign}
        >
          {assignProgram.isPending ? (
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
