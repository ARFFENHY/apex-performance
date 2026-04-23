import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Copy, Send, Clock, CheckCircle, XCircle, UserPlus, RefreshCw, Trash2, MessageCircle } from "lucide-react";
import {
  useSendInvitation, useInvitations, useResendInvitation, useDeleteInvitation,
  buildInviteLink, buildMailtoLink, buildWhatsAppLink, type Invitation,
} from "@/hooks/useInvitations";
import { useUserRole } from "@/hooks/useUserRole";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { validateEmail } from "@/lib/emailValidation";

const statusConfig: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
  pending: { icon: <Clock className="h-3 w-3" />, label: "Pendiente", className: "text-energy" },
  accepted: { icon: <CheckCircle className="h-3 w-3" />, label: "Aceptada", className: "text-success" },
  expired: { icon: <XCircle className="h-3 w-3" />, label: "Expirada", className: "text-destructive" },
};

export function InviteClientDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [invitedRole, setInvitedRole] = useState<"coach" | "client">("client");
  const sendInvitation = useSendInvitation();
  const { data: invitations = [] } = useInvitations();
  const { data: userRole } = useUserRole();
  const resendInvitation = useResendInvitation();
  const deleteInvitation = useDeleteInvitation();

  const isAdmin = userRole === "admin";
  const canInviteCoach = isAdmin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const check = validateEmail(email);
    if (!check.valid) {
      toast.error(check.error || "Email inválido");
      return;
    }

    await sendInvitation.mutateAsync({ email, invitedRole });
    setEmail("");
  };

  const copyLink = (token: string) => {
    const link = buildInviteLink(token);
    navigator.clipboard.writeText(link);
    toast.success("Enlace copiado al portapapeles");
  };

  const sendEmail = (inv: Invitation) => {
    const url = buildMailtoLink(inv.email, inv.token, inv.invited_role || "client");
    window.open(url, "_blank");
  };

  const sendWhatsApp = (inv: Invitation) => {
    const url = buildWhatsAppLink(inv.email, inv.token, inv.invited_role || "client");
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <UserPlus className="h-4 w-4" /> Invitar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Enviar Invitación</DialogTitle>
          <DialogDescription>
            {isAdmin
              ? "Invita coaches o clientes. Al registrarse quedarán vinculados automáticamente."
              : "Envía un enlace de registro a tu cliente. Al registrarse, quedará vinculado contigo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {canInviteCoach && (
            <div className="space-y-2">
              <Label className="text-xs">Rol del invitado</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={invitedRole === "client" ? "default" : "outline"}
                  size="sm"
                  className={invitedRole === "client" ? "gradient-primary text-primary-foreground" : ""}
                  onClick={() => setInvitedRole("client")}
                >
                  💪 Cliente
                </Button>
                <Button
                  type="button"
                  variant={invitedRole === "coach" ? "default" : "outline"}
                  size="sm"
                  className={invitedRole === "coach" ? "gradient-success text-success-foreground" : ""}
                  onClick={() => setInvitedRole("coach")}
                >
                  🏋️ Entrenador
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="invite-email">Email del {invitedRole === "coach" ? "entrenador" : "cliente"}</Label>
            <div className="flex gap-2">
              <Input
                id="invite-email"
                type="email"
                placeholder={invitedRole === "coach" ? "coach@email.com" : "cliente@email.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                maxLength={255}
              />
              <Button
                type="submit"
                disabled={sendInvitation.isPending || !email.trim()}
                className="gradient-primary text-primary-foreground gap-1"
              >
                <Send className="h-4 w-4" />
                {sendInvitation.isPending ? "..." : "Enviar"}
              </Button>
            </div>
          </div>
        </form>

        {invitations.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Invitaciones recientes
            </h4>
            <div className="space-y-2 max-h-56 overflow-auto">
              {invitations.slice(0, 8).map((inv) => {
                const status = statusConfig[inv.status];
                const roleBadge = inv.invited_role === "coach" ? "Coach" : "Cliente";
                return (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg bg-accent/50 p-2.5 gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">{inv.email}</p>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 flex-shrink-0">
                          {roleBadge}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`flex items-center gap-1 text-[10px] font-medium ${status.className}`}>
                          {status.icon} {status.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0">
                      {inv.status === "pending" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => copyLink(inv.token)} title="Copiar enlace">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => sendEmail(inv)} title="Enviar por email">
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-success" onClick={() => sendWhatsApp(inv)} title="Enviar por WhatsApp">
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      {inv.status === "expired" && (
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => resendInvitation.mutate(inv.id)}
                          disabled={resendInvitation.isPending}
                          title="Renovar invitación"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {inv.status !== "accepted" && (
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteInvitation.mutate(inv.id)}
                          disabled={deleteInvitation.isPending}
                          title="Eliminar invitación"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
