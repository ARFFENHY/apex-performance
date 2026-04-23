import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePWAInstall, useNotificationPermission, useScheduledNotification } from "@/hooks/usePWA";
import { useProfile } from "@/hooks/useProfile";
import {
  Download, Bell, BellOff, Smartphone, CheckCircle2, Sparkles, Share2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Install = () => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const { permission, isSupported, requestPermission } = useNotificationPermission();
  const { scheduleDaily } = useScheduledNotification();
  const { data: profile } = useProfile();

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) {
      toast({ title: "¡App instalada!", description: "GymManager está en tu pantalla de inicio" });
    }
  };

  const handleEnableNotifications = async () => {
    const result = await requestPermission();
    if (result === "granted") {
      toast({ title: "¡Notificaciones activadas!", description: "Recibirás tu mensaje motivacional diario" });
      // Send a test notification
      scheduleDaily(
        "💪 GymManager",
        profile?.motivational_message || "¡Hoy es un gran día para superarte!"
      );
    } else {
      toast({
        title: "Permiso denegado",
        description: "Puedes habilitarlas desde la configuración de tu navegador",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold font-display">Instalar GymManager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lleva tu entrenamiento a todas partes
          </p>
        </div>

        {/* Install Card */}
        <Card className="overflow-hidden">
          <div className="gradient-primary p-6 text-center">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Smartphone className="h-16 w-16 text-primary-foreground mx-auto" />
            </motion.div>
          </div>
          <CardContent className="p-5 space-y-4">
            {isInstalled ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">¡App instalada correctamente!</span>
              </div>
            ) : isInstallable ? (
              <Button onClick={handleInstall} className="w-full gradient-primary text-primary-foreground" size="lg">
                <Download className="h-4 w-4 mr-2" />
                Instalar en mi dispositivo
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Para instalar la app en tu dispositivo:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <Badge variant="secondary" className="mt-0.5 text-[10px] px-1.5">iOS</Badge>
                    <span className="text-muted-foreground">
                      Toca <Share2 className="h-3.5 w-3.5 inline" /> y luego "Agregar a pantalla de inicio"
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Badge variant="secondary" className="mt-0.5 text-[10px] px-1.5">Android</Badge>
                    <span className="text-muted-foreground">
                      Toca el menú ⋮ y luego "Instalar aplicación"
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-energy" />
              Notificaciones motivacionales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Recibe cada día un mensaje motivacional personalizado para mantenerte en el camino.
            </p>

            {!isSupported ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-accent">
                <BellOff className="h-4 w-4" />
                Tu navegador no soporta notificaciones push
              </div>
            ) : permission === "granted" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 text-success">
                  <Bell className="h-5 w-5" />
                  <span className="text-sm font-medium">Notificaciones activadas ✓</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    scheduleDaily(
                      "💪 GymManager",
                      profile?.motivational_message || "¡Hoy es un gran día para superarte!"
                    )
                  }
                  className="w-full"
                >
                  <Bell className="h-3.5 w-3.5 mr-1.5" />
                  Enviar notificación de prueba
                </Button>
              </div>
            ) : permission === "denied" ? (
              <div className="flex items-center gap-2 text-sm text-destructive p-3 rounded-lg bg-destructive/10">
                <BellOff className="h-4 w-4" />
                Notificaciones bloqueadas. Habilítalas desde la configuración de tu navegador.
              </div>
            ) : (
              <Button
                onClick={handleEnableNotifications}
                className="w-full"
                variant="outline"
                size="lg"
              >
                <Bell className="h-4 w-4 mr-2" />
                Activar notificaciones diarias
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Install;
