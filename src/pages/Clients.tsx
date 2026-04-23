import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, TrendingDown, TrendingUp, FileText, MoreHorizontal, FolderOpen, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useClients } from "@/hooks/useClients";
import { InviteClientDialog } from "@/components/InviteClientDialog";
import { AssignProgramDialog } from "@/components/AssignProgramDialog";
import { ClientProgressView } from "@/components/ClientProgressView";
import CreateClientDialog from "@/components/CreateClientDialog";
import { useExportReport } from "@/hooks/useExportReport";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const Clients = () => {
  const { gym, role } = useTenant();
  const { data: clients = [], isLoading } = useClients(gym?.id);
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const { exportPDF } = useExportReport();

  // Assign program dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignClientId, setAssignClientId] = useState<string | undefined>();

  // Progress view dialog
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressClient, setProgressClient] = useState<{ id: string; name: string } | null>(null);

  const filtered = clients.filter((c) =>
    c.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = async (clientId: string, clientName: string) => {
    try {
      await exportPDF({ clientId, clientName });
      toast.success(`Reporte de ${clientName} descargado`);
    } catch {
      toast.error("Error al generar el reporte");
    }
  };

  const openAssign = (clientId?: string) => {
    setAssignClientId(clientId);
    setAssignOpen(true);
  };

  const openProgress = (clientId: string, clientName: string) => {
    setProgressClient({ id: clientId, name: clientName });
    setProgressOpen(true);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display">Clientes</h1>
            <p className="text-sm text-muted-foreground mt-1">{clients.length} clientes registrados</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => openAssign()}
            >
              <FolderOpen className="h-4 w-4" /> Asignar Programa
            </Button>
            {role === 'coach' && gym?.id && (
              <CreateClientDialog
                gymId={gym.id}
                gymName={gym.name}
                coachId={user?.id}
                trigger={
                  <Button className="gradient-primary text-primary-foreground shadow-primary hover:opacity-90 gap-2">
                    <Plus className="h-4 w-4" /> Nuevo Cliente
                  </Button>
                }
              />
            )}
            {role !== 'coach' && (
              <InviteClientDialog
                trigger={
                  <Button className="gradient-primary text-primary-foreground shadow-primary hover:opacity-90 gap-2">
                    <Plus className="h-4 w-4" /> Invitar Cliente
                  </Button>
                }
              />
            )}
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cliente..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl bg-card p-10 shadow-card text-center">
            <p className="text-muted-foreground text-sm">
              {search ? "No se encontraron clientes" : "Aún no tienes clientes vinculados. Invita a tu primer cliente para comenzar."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((client) => {
              const weightDiff = client.weight && client.start_weight ? client.weight - client.start_weight : 0;
              const losing = weightDiff < 0;
              return (
                <motion.div
                  key={client.id}
                  whileHover={{ y: -2 }}
                  className="rounded-xl bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {getInitials(client.full_name)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{client.full_name}</p>
                        <p className="text-xs text-muted-foreground">{client.email || "Sin email"}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openAssign(client.id)}>
                          <FolderOpen className="h-3.5 w-3.5 mr-2" /> Asignar Programa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openProgress(client.id, client.full_name)}>
                          <Activity className="h-3.5 w-3.5 mr-2" /> Ver Progreso
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(client.id, client.full_name)}>
                          <FileText className="h-3.5 w-3.5 mr-2" /> Exportar Reporte PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-accent/50 p-2">
                      <div className="flex items-center justify-center gap-1">
                        {losing ? (
                          <TrendingDown className="h-3 w-3 text-success" />
                        ) : (
                          <TrendingUp className="h-3 w-3 text-energy" />
                        )}
                        <span className="text-sm font-bold">{client.weight ?? "—"} kg</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Peso</p>
                    </div>
                    <div className="rounded-lg bg-accent/50 p-2">
                      <span className="text-sm font-bold">{client.body_fat != null ? `${client.body_fat}%` : "—"}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Grasa</p>
                    </div>
                    <div className="rounded-lg bg-accent/50 p-2">
                      <span className="text-sm font-bold">{client.muscle_mass != null ? `${client.muscle_mass} kg` : "—"}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Músculo</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      <AssignProgramDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        preselectedClientId={assignClientId}
      />

      {progressClient && (
        <ClientProgressView
          clientId={progressClient.id}
          clientName={progressClient.name}
          open={progressOpen}
          onOpenChange={(val) => {
            setProgressOpen(val);
            if (!val) setProgressClient(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default Clients;
