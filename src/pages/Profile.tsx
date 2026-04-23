import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile, useUpdateProfile, useUpdateGymProfile, type UserProfile } from "@/hooks/useProfile";
import { useAchievements, useTrainingStreak, STREAK_MILESTONES } from "@/hooks/useAchievements";
import { useGenerateMotivationalMessage } from "@/hooks/useMotivationalMessage";
import { useNotificationPermission, useScheduledNotification } from "@/hooks/usePWA";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Edit3, Check, X, RefreshCw, Star, Trophy, ChevronDown, Sparkles,
  Target, Flame, Heart, Zap, Brain, Dumbbell, Share2, Bell, BellOff, Camera, Loader2,
} from "lucide-react";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { AvatarCropper } from "@/components/AvatarCropper";
import { ShareButton } from "@/components/ShareButton";
import { GoalsCalendar } from "@/components/GoalsCalendar";
import { useTenant } from "@/contexts/TenantContext";
import confetti from "canvas-confetti";

const AVATAR_EMOJIS = ["💪", "🏋️", "🧘", "🏃", "⚡", "🔥", "🦁", "🐺", "🦅", "🎯", "👑", "💎"];
const INTEREST_OPTIONS = ["Fuerza", "Cardio", "Yoga", "Nutrición", "Meditación", "Running", "Crossfit", "Natación"];
const GOAL_OPTIONS = ["Perder peso", "Ganar músculo", "Mejorar resistencia", "Flexibilidad", "Bienestar mental", "Competir"];
const GENDER_OPTIONS = [
  { key: "male", label: "Hombre", emoji: "🧔" },
  { key: "female", label: "Mujer", emoji: "👩" },
  { key: "neutral", label: "Prefiero no decir", emoji: "🧑" },
];

const Profile = () => {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: achievements = [] } = useAchievements();
  const { data: streak = 0 } = useTrainingStreak();
  const generateMessage = useGenerateMotivationalMessage();
  const { permission, isSupported, requestPermission } = useNotificationPermission();
  const { scheduleDaily } = useScheduledNotification();
  const { role, gym } = useTenant();
  
  const isClient = role === 'client';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isCoach = role === 'coach';

  const updateGymProfile = useUpdateGymProfile();

  const { uploadAvatar, uploading: avatarUploading } = useAvatarUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  // States for Gym Admin
  const [gymName, setGymName] = useState("");
  const [gymAddress, setGymAddress] = useState("");
  const [gymPhone, setGymPhone] = useState("");

  useEffect(() => {
    if (profile) setNameValue(profile.display_name);
  }, [profile?.display_name]);

  useEffect(() => {
    if (gym && isAdmin) {
      setGymName(gym.name || "");
      setGymAddress(gym.address || "");
      setGymPhone(gym.phone || "");
    }
  }, [gym, isAdmin]);

  // Auto-generate motivational message if outdated
  useEffect(() => {
    if (!profile) return;
    const today = new Date().toISOString().split("T")[0];
    if (profile.motivational_date !== today && !generateMessage.isPending) {
      generateMessage.mutate(profile);
    }
  }, [profile?.motivational_date]);

  const handleSaveName = () => {
    if (nameValue.trim()) {
      updateProfile.mutate({ display_name: nameValue.trim() });
      setEditingName(false);
    }
  };

  const handleSaveGymDetails = () => {
    if (isAdmin && gym?.id) {
      updateGymProfile.mutate({
        gymId: gym.id,
        updates: {
          name: gymName.trim(),
          address: gymAddress.trim(),
          phone: gymPhone.trim()
        }
      });
    }
  };

  const handleAvatarSelect = (emoji: string) => {
    updateProfile.mutate({ avatar_type: "emoji", avatar_value: emoji });
    setShowAvatarPicker(false);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.3 } });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result as string);
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCroppedImage = async (blob: Blob) => {
    setCropImageSrc(null);
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    const url = await uploadAvatar(file);
    if (url) {
      updateProfile.mutate({ avatar_type: "image", avatar_value: url });
      setShowAvatarPicker(false);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.3 } });
    }
  };

  const isImageAvatar = profile?.avatar_type === "image" && profile?.avatar_value?.startsWith("http");

  const toggleInterest = (interest: string) => {
    if (!profile) return;
    const current = profile.interests || [];
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    updateProfile.mutate({ interests: updated });
  };

  const toggleGoal = (goal: string) => {
    if (!profile) return;
    const current = profile.goals || [];
    const updated = current.includes(goal)
      ? current.filter((g) => g !== goal)
      : [...current, goal];
    updateProfile.mutate({ goals: updated });
  };



  const unlockedCount = achievements.length;
  const totalMilestones = STREAK_MILESTONES.length;
  const progressPct = Math.min((unlockedCount / Math.max(totalMilestones, 1)) * 100, 100);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-28 w-28 rounded-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Avatar & Name Section */}
        <div className="flex flex-col items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            className="relative h-28 w-28 rounded-full gradient-primary flex items-center justify-center text-5xl shadow-primary cursor-pointer group overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isImageAvatar ? (
                <motion.img
                  key={profile?.avatar_value}
                  src={profile?.avatar_value}
                  alt="Avatar"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="h-full w-full object-cover"
                />
              ) : (
                <motion.span
                  key={profile?.avatar_value}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {profile?.avatar_value || "💪"}
                </motion.span>
              )}
            </AnimatePresence>
            {avatarUploading && (
              <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary-foreground animate-spin" />
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
              <Edit3 className="h-5 w-5 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoUpload}
          />

          {/* Avatar Picker */}
          <AnimatePresence>
            {showAvatarPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-card rounded-xl p-4 shadow-card border space-y-3">
                  {/* Photo upload button */}
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                  >
                    {avatarUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    {avatarUploading ? "Subiendo..." : "Subir foto desde dispositivo"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-card px-2 text-muted-foreground">o elige un avatar</span>
                    </div>
                  </div>

                  {/* Emoji grid */}
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_EMOJIS.map((emoji) => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAvatarSelect(emoji)}
                        className={`text-2xl p-2 rounded-lg transition-colors ${
                          profile?.avatar_type === "emoji" && profile?.avatar_value === emoji
                            ? "bg-primary/20 ring-2 ring-primary"
                            : "hover:bg-accent"
                        }`}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Avatar Cropper Dialog */}
          <AvatarCropper
            open={!!cropImageSrc}
            imageSrc={cropImageSrc || ""}
            onClose={() => setCropImageSrc(null)}
            onCropComplete={handleCroppedImage}
          />

          {/* Name */}
          <div className="flex items-center gap-2">
            {editingName ? (
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                <Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  className="text-center text-xl font-display font-bold w-48"
                  autoFocus
                />
                <Button size="icon" variant="ghost" onClick={handleSaveName}><Check className="h-4 w-4 text-success" /></Button>
                <Button size="icon" variant="ghost" onClick={() => { setEditingName(false); setNameValue(profile?.display_name || ""); }}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setEditingName(true)}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <h1 className="text-2xl font-display font-bold">{profile?.display_name || "Usuario"}</h1>
                <Edit3 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            )}
          </div>

          {/* Streak Badge (Only Clients) */}
          {isClient && streak > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
              <Badge className="gap-1.5 px-3 py-1 bg-energy text-energy-foreground border-0">
                <Flame className="h-3.5 w-3.5" />
                {streak} {streak === 1 ? "día" : "días"} de racha
              </Badge>
            </motion.div>
          )}

          {/* Achievement Progress Bar (Only Clients) */}
          {isClient && (
            <div className="w-full max-w-xs">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1"><Trophy className="h-3 w-3" /> Logros</span>
                <span>{unlockedCount}/{totalMilestones}</span>
              </div>
              <div className="h-3 rounded-full bg-accent overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full gradient-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Configuraciones de la Empresa (Only Admins) */}
        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border border-primary/20 shadow-neon">
              <CardHeader className="pb-3 bg-primary/5 rounded-t-xl">
                <CardTitle className="text-base flex items-center gap-2 text-primary">
                  <Star className="h-4 w-4" /> Perfil Comercial del Gimnasio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Nombre de la Sucursal</label>
                  <Input value={gymName} onChange={(e) => setGymName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Dirección Física</label>
                  <Input value={gymAddress} onChange={(e) => setGymAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Teléfono de Contacto</label>
                  <Input value={gymPhone} onChange={(e) => setGymPhone(e.target.value)} />
                </div>
                <Button 
                  className="w-full mt-2 gradient-primary text-primary-foreground shadow-neon" 
                  onClick={handleSaveGymDetails}
                  disabled={updateGymProfile.isPending || !gymName.trim()}
                >
                  {updateGymProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Guardar Cambios de Sucursal
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Motivational Message (Clients and Coaches) */}
        {(isClient || isCoach) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border border-primary/30 bg-primary/10 shadow-[0_0_15px_rgba(37,99,235,0.15)] overflow-hidden relative">
              <div className="absolute top-2 right-2">
                <Sparkles className="h-12 w-12 text-primary/10" />
              </div>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-primary/80">
                      Mensaje del día
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={profile?.motivational_message}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-sm font-medium leading-relaxed text-foreground"
                      >
                        {profile?.motivational_message || "¡Hoy es un gran día para superarte! 💪"}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => profile && generateMessage.mutate(profile)}
                    disabled={generateMessage.isPending}
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 text-xs"
                  >
                    <RefreshCw className={`h-3 w-3 mr-1.5 ${generateMessage.isPending ? "animate-spin" : ""}`} />
                    Nuevo mensaje
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* All Gamification Sections (Client Only) */}
        {isClient && (
          <>
            {/* Gender Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Género
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  {GENDER_OPTIONS.map((g) => {
                    const selected = profile?.gender === g.key;
                    return (
                      <motion.button
                        key={g.key}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateProfile.mutate({ gender: g.key as UserProfile['gender'] })}
                        className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1.5 ${
                          selected
                            ? "gradient-primary text-primary-foreground shadow-primary"
                            : "bg-accent text-muted-foreground hover:bg-accent/80"
                        }`}
                      >
                        <span className="text-xl">{g.emoji}</span>
                        {g.label}
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Goals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" /> Mis Objetivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {GOAL_OPTIONS.map((goal) => {
                    const selected = profile?.goals?.includes(goal);
                    return (
                      <motion.button
                        key={goal}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleGoal(goal)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          selected
                            ? "gradient-primary text-primary-foreground shadow-primary"
                            : "bg-accent text-muted-foreground hover:bg-accent/80"
                        }`}
                      >
                        {goal}
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4 text-destructive" /> Intereses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => {
                    const selected = profile?.interests?.includes(interest);
                    return (
                      <motion.button
                        key={interest}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          selected
                            ? "gradient-success text-success-foreground"
                            : "bg-accent text-muted-foreground hover:bg-accent/80"
                        }`}
                      >
                        {interest}
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Goals Calendar */}
            <GoalsCalendar />



            {/* Notifications */}
            {isSupported && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" /> Notificaciones diarias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {permission === "granted" ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-success">
                        <Bell className="h-4 w-4" />
                        <span className="font-medium">Activadas ✓</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          scheduleDaily(
                            "💪 FitCoach Pro",
                            profile?.motivational_message || "¡Hoy es un gran día para superarte!"
                          )
                        }
                      >
                        Enviar notificación de prueba
                      </Button>
                    </div>
                  ) : permission === "denied" ? (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <BellOff className="h-4 w-4" /> Bloqueadas en tu navegador
                    </p>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const result = await requestPermission();
                        if (result === "granted") {
                          scheduleDaily(
                            "💪 FitCoach Pro",
                            profile?.motivational_message || "¡Hoy es un gran día para superarte!"
                          );
                        }
                      }}
                    >
                      <Bell className="h-4 w-4 mr-2" /> Activar notificaciones
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Achievements History */}
            <Collapsible open={achievementsOpen} onOpenChange={setAchievementsOpen}>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-energy" /> Logros desbloqueados
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <ShareButton
                        text={`🏆 ¡Llevo ${streak} días de racha y ${unlockedCount} logros desbloqueados en FitCoach Pro! 💪🔥`}
                        title="Mis logros"
                        variant="ghost"
                        size="icon"
                        iconOnly
                        className="h-7 w-7 text-muted-foreground"
                      />
                      <motion.div animate={{ rotate: achievementsOpen ? 180 : 0 }}>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    {achievements.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aún no tienes logros. ¡Comienza a entrenar! 🏋️
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {STREAK_MILESTONES.map((milestone) => {
                          const unlocked = achievements.some((a) => a.key === `streak_${milestone.days}`) || streak >= milestone.days;
                          return (
                            <motion.div
                              key={milestone.days}
                              whileHover={unlocked ? { scale: 1.05 } : {}}
                              className={`rounded-xl p-3 text-center transition-all ${
                                unlocked
                                  ? "bg-energy/10 border-2 border-energy/30"
                                  : "bg-accent/50 opacity-40 grayscale"
                              }`}
                            >
                              <span className="text-2xl">{milestone.icon}</span>
                              <p className="text-xs font-semibold mt-1">{milestone.label}</p>
                              <p className="text-[10px] text-muted-foreground">{milestone.days} {milestone.days === 1 ? "día" : "días"}</p>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Profile;
