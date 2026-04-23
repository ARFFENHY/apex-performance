import { Bell, Check, CheckCheck, MessageCircle, TrendingUp, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, useMarkNotificationRead, useMarkAllRead, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const iconMap: Record<string, React.ReactNode> = {
  message: <MessageCircle className="h-4 w-4 text-primary" />,
  progress: <TrendingUp className="h-4 w-4 text-success" />,
  new_client: <UserPlus className="h-4 w-4 text-energy" />,
  invitation: <UserPlus className="h-4 w-4 text-primary" />,
};

function NotificationItem({ n, onRead }: { n: Notification; onRead: (id: string) => void }) {
  return (
    <div
      onClick={() => !n.read && onRead(n.id)}
      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
        n.read ? "opacity-60" : "bg-primary/5 hover:bg-primary/10"
      }`}
    >
      <div className="mt-0.5 h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0">
        {iconMap[n.type] || <Bell className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{n.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
        </p>
      </div>
      {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
    </div>
  );
}

export function NotificationBell() {
  const { data: notifications = [], unreadCount } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full gradient-energy flex items-center justify-center text-[10px] font-bold text-energy-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-display font-semibold text-sm">Notificaciones</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary gap-1 h-7"
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="h-3 w-3" /> Marcar todo
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Sin notificaciones</p>
            </div>
          ) : (
            <div className="p-1 space-y-0.5">
              {notifications.map((n) => (
                <NotificationItem key={n.id} n={n} onRead={(id) => markRead.mutate(id)} />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
