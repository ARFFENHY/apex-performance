import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isSameDay, isToday, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Plus, CalendarDays, Clock, Trash2, Bell, CheckCircle2, Circle,
} from "lucide-react";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, GOAL_COLORS, type UserGoal } from "@/hooks/useGoals";
import { useScheduledNotification } from "@/hooks/usePWA";
import { cn } from "@/lib/utils";

export function GoalsCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { data: goals = [] } = useGoals(currentMonth);
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const { scheduleDaily } = useScheduledNotification();

  // New goal form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newColor, setNewColor] = useState("blue");
  const [newReminder, setNewReminder] = useState(false);

  const goalsForDate = goals.filter((g) =>
    isSameDay(new Date(g.date + "T00:00:00"), selectedDate)
  );

  const datesWithGoals = goals.reduce<Record<string, string[]>>((acc, g) => {
    acc[g.date] = acc[g.date] || [];
    if (!acc[g.date].includes(g.color)) acc[g.date].push(g.color);
    return acc;
  }, {});

  const handleCreateGoal = () => {
    if (!newTitle.trim()) return;

    createGoal.mutate({
      title: newTitle.trim(),
      description: newDesc.trim() || null,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: newTime || null,
      completed: false,
      reminder: newReminder,
      color: newColor,
    });

    if (newReminder) {
      scheduleDaily("🎯 Recordatorio de meta", newTitle.trim());
    }

    setNewTitle("");
    setNewDesc("");
    setNewTime("");
    setNewColor("blue");
    setNewReminder(false);
    setDialogOpen(false);
  };

  const toggleComplete = (goal: UserGoal) => {
    updateGoal.mutate({ id: goal.id, completed: !goal.completed });
  };

  const upcomingGoals = goals
    .filter((g) => !g.completed && !isBefore(new Date(g.date + "T23:59:59"), startOfDay(new Date())))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" /> Calendario de Metas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            onMonthChange={setCurrentMonth}
            locale={es}
            className={cn("p-2 pointer-events-auto w-full")}
            classNames={{
              day_today: "bg-primary text-primary-foreground font-bold",
              day_selected: "bg-energy text-energy-foreground",
            }}
            components={{
              DayContent: ({ date }) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const colors = datesWithGoals[dateStr];
                return (
                  <div className="relative flex flex-col items-center">
                    <span>{date.getDate()}</span>
                    {colors && (
                      <div className="flex gap-0.5 absolute -bottom-1">
                        {colors.slice(0, 3).map((c, i) => {
                          const colorObj = GOAL_COLORS.find((gc) => gc.key === c);
                          return (
                            <div
                              key={i}
                              className="h-1 w-1 rounded-full"
                              style={{ backgroundColor: colorObj?.value || "hsl(217, 91%, 60%)" }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Selected Date Goals */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              {isToday(selectedDate)
                ? "Hoy"
                : format(selectedDate, "d 'de' MMMM", { locale: es })}
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 text-xs gap-1 gradient-primary text-primary-foreground">
                  <Plus className="h-3 w-3" /> Meta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[360px]">
                <DialogHeader>
                  <DialogTitle className="text-base">
                    Nueva meta — {format(selectedDate, "d MMM yyyy", { locale: es })}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">Título *</Label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ej: Correr 5km"
                      onKeyDown={(e) => e.key === "Enter" && handleCreateGoal()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Descripción</Label>
                    <Textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Detalles opcionales..."
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Hora
                      </Label>
                      <Input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Color</Label>
                      <div className="flex gap-1.5 mt-1.5">
                        {GOAL_COLORS.map((c) => (
                          <button
                            key={c.key}
                            onClick={() => setNewColor(c.key)}
                            className={`h-6 w-6 rounded-full transition-all ${
                              newColor === c.key ? "ring-2 ring-offset-1 ring-foreground scale-110" : ""
                            }`}
                            style={{ backgroundColor: c.value }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newReminder}
                      onCheckedChange={setNewReminder}
                      id="reminder"
                    />
                    <Label htmlFor="reminder" className="text-xs flex items-center gap-1">
                      <Bell className="h-3 w-3" /> Recordatorio
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" size="sm">Cancelar</Button>
                  </DialogClose>
                  <Button
                    size="sm"
                    onClick={handleCreateGoal}
                    disabled={!newTitle.trim() || createGoal.isPending}
                    className="gradient-primary text-primary-foreground"
                  >
                    Guardar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="popLayout">
            {goalsForDate.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground text-center py-4"
              >
                Sin metas para este día. ¡Agrega una! 🎯
              </motion.p>
            ) : (
              <div className="space-y-2">
                {goalsForDate.map((goal) => {
                  const colorObj = GOAL_COLORS.find((c) => c.key === goal.color);
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      layout
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all ${
                        goal.completed ? "opacity-60 bg-accent/30" : "bg-card"
                      }`}
                    >
                      <button
                        onClick={() => toggleComplete(goal)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <Circle
                            className="h-4 w-4"
                            style={{ color: colorObj?.value }}
                          />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${goal.completed ? "line-through" : ""}`}>
                          {goal.title}
                        </p>
                        {goal.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {goal.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {goal.time && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {goal.time}
                            </span>
                          )}
                          {goal.reminder && (
                            <Bell className="h-2.5 w-2.5 text-energy" />
                          )}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => deleteGoal.mutate(goal.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Upcoming Goals */}
      {upcomingGoals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-energy" /> Próximas metas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {upcomingGoals.map((goal) => {
                const colorObj = GOAL_COLORS.find((c) => c.key === goal.color);
                return (
                  <div
                    key={goal.id}
                    className="flex items-center gap-2 text-xs p-1.5 rounded-md hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedDate(new Date(goal.date + "T00:00:00"))}
                  >
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colorObj?.value }}
                    />
                    <span className="font-medium flex-1 truncate">{goal.title}</span>
                    <span className="text-muted-foreground">
                      {format(new Date(goal.date + "T00:00:00"), "d MMM", { locale: es })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
