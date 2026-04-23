import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Exercise {
  nombre: string;
  series: number;
  reps: string;
  peso_sugerido: string;
  descanso_seg: number;
  animacion: string;
}

interface MuscleBlock {
  musculo: string;
  ejercicios: Exercise[];
}

// ── Exercise database with level/objective modifiers ──

const exerciseDB: Record<string, Exercise[]> = {
  pecho: [
    { nombre: "Press de Banca", series: 4, reps: "8-10", peso_sugerido: "60kg", descanso_seg: 90, animacion: "/animations/press_de_banca.glb" },
    { nombre: "Press Inclinado con Mancuernas", series: 3, reps: "10-12", peso_sugerido: "20kg", descanso_seg: 60, animacion: "/animations/press_inclinado.glb" },
    { nombre: "Aperturas con Mancuernas", series: 3, reps: "12-15", peso_sugerido: "14kg", descanso_seg: 60, animacion: "/animations/aperturas.glb" },
    { nombre: "Fondos en Paralelas", series: 3, reps: "8-12", peso_sugerido: "Peso corporal", descanso_seg: 90, animacion: "/animations/fondos.glb" },
    { nombre: "Press Declinado", series: 3, reps: "10-12", peso_sugerido: "50kg", descanso_seg: 60, animacion: "/animations/press_declinado.glb" },
    { nombre: "Crossover en Polea", series: 3, reps: "12-15", peso_sugerido: "15kg", descanso_seg: 45, animacion: "/animations/crossover.glb" },
    { nombre: "Pullover con Mancuerna", series: 3, reps: "10-12", peso_sugerido: "18kg", descanso_seg: 60, animacion: "/animations/pullover.glb" },
  ],
  espalda: [
    { nombre: "Dominadas", series: 4, reps: "6-10", peso_sugerido: "Peso corporal", descanso_seg: 90, animacion: "/animations/dominadas.glb" },
    { nombre: "Remo con Barra", series: 4, reps: "8-10", peso_sugerido: "60kg", descanso_seg: 90, animacion: "/animations/remo_barra.glb" },
    { nombre: "Remo con Mancuerna", series: 3, reps: "10-12", peso_sugerido: "22kg", descanso_seg: 60, animacion: "/animations/remo_mancuerna.glb" },
    { nombre: "Jalón al Pecho", series: 3, reps: "10-12", peso_sugerido: "50kg", descanso_seg: 60, animacion: "/animations/jalon_pecho.glb" },
    { nombre: "Remo en Polea Baja", series: 3, reps: "10-12", peso_sugerido: "45kg", descanso_seg: 60, animacion: "/animations/remo_polea.glb" },
    { nombre: "Peso Muerto Rumano", series: 4, reps: "8-10", peso_sugerido: "70kg", descanso_seg: 90, animacion: "/animations/peso_muerto_rumano.glb" },
    { nombre: "Face Pull", series: 3, reps: "12-15", peso_sugerido: "15kg", descanso_seg: 45, animacion: "/animations/face_pull.glb" },
  ],
  piernas: [
    { nombre: "Sentadilla con Barra", series: 4, reps: "8-10", peso_sugerido: "80kg", descanso_seg: 120, animacion: "/animations/sentadilla.glb" },
    { nombre: "Prensa de Pierna", series: 4, reps: "10-12", peso_sugerido: "120kg", descanso_seg: 90, animacion: "/animations/prensa.glb" },
    { nombre: "Peso Muerto", series: 4, reps: "6-8", peso_sugerido: "100kg", descanso_seg: 120, animacion: "/animations/peso_muerto.glb" },
    { nombre: "Extensión de Cuádriceps", series: 3, reps: "12-15", peso_sugerido: "40kg", descanso_seg: 60, animacion: "/animations/extension_quad.glb" },
    { nombre: "Curl de Pierna", series: 3, reps: "10-12", peso_sugerido: "35kg", descanso_seg: 60, animacion: "/animations/curl_pierna.glb" },
    { nombre: "Zancadas con Mancuernas", series: 3, reps: "10 c/u", peso_sugerido: "16kg", descanso_seg: 60, animacion: "/animations/zancadas.glb" },
    { nombre: "Elevación de Pantorrillas", series: 4, reps: "15-20", peso_sugerido: "30kg", descanso_seg: 45, animacion: "/animations/pantorrillas.glb" },
    { nombre: "Hip Thrust", series: 4, reps: "10-12", peso_sugerido: "80kg", descanso_seg: 90, animacion: "/animations/hip_thrust.glb" },
    { nombre: "Sentadilla Búlgara", series: 3, reps: "10 c/u", peso_sugerido: "14kg", descanso_seg: 60, animacion: "/animations/sentadilla_bulgara.glb" },
  ],
  hombros: [
    { nombre: "Press Militar", series: 4, reps: "8-10", peso_sugerido: "40kg", descanso_seg: 90, animacion: "/animations/press_militar.glb" },
    { nombre: "Elevaciones Laterales", series: 3, reps: "12-15", peso_sugerido: "10kg", descanso_seg: 45, animacion: "/animations/laterales.glb" },
    { nombre: "Elevaciones Frontales", series: 3, reps: "12-15", peso_sugerido: "10kg", descanso_seg: 45, animacion: "/animations/frontales.glb" },
    { nombre: "Pájaros", series: 3, reps: "12-15", peso_sugerido: "8kg", descanso_seg: 45, animacion: "/animations/pajaros.glb" },
    { nombre: "Press Arnold", series: 3, reps: "10-12", peso_sugerido: "16kg", descanso_seg: 60, animacion: "/animations/press_arnold.glb" },
    { nombre: "Encogimientos de Hombros", series: 4, reps: "12-15", peso_sugerido: "30kg", descanso_seg: 60, animacion: "/animations/encogimientos.glb" },
  ],
  biceps: [
    { nombre: "Curl con Barra", series: 4, reps: "8-10", peso_sugerido: "30kg", descanso_seg: 60, animacion: "/animations/curl_barra.glb" },
    { nombre: "Curl con Mancuernas Alterno", series: 3, reps: "10-12", peso_sugerido: "14kg", descanso_seg: 60, animacion: "/animations/curl_alterno.glb" },
    { nombre: "Curl Martillo", series: 3, reps: "10-12", peso_sugerido: "14kg", descanso_seg: 60, animacion: "/animations/curl_martillo.glb" },
    { nombre: "Curl en Banco Scott", series: 3, reps: "10-12", peso_sugerido: "20kg", descanso_seg: 60, animacion: "/animations/curl_scott.glb" },
    { nombre: "Curl Concentrado", series: 3, reps: "12-15", peso_sugerido: "10kg", descanso_seg: 45, animacion: "/animations/curl_concentrado.glb" },
  ],
  triceps: [
    { nombre: "Press Francés", series: 4, reps: "8-10", peso_sugerido: "25kg", descanso_seg: 60, animacion: "/animations/press_frances.glb" },
    { nombre: "Extensión en Polea Alta", series: 3, reps: "10-12", peso_sugerido: "25kg", descanso_seg: 60, animacion: "/animations/extension_polea.glb" },
    { nombre: "Fondos en Banco", series: 3, reps: "10-15", peso_sugerido: "Peso corporal", descanso_seg: 60, animacion: "/animations/fondos_banco.glb" },
    { nombre: "Patada de Tríceps", series: 3, reps: "12-15", peso_sugerido: "8kg", descanso_seg: 45, animacion: "/animations/patada_triceps.glb" },
    { nombre: "Press Cerrado", series: 4, reps: "8-10", peso_sugerido: "50kg", descanso_seg: 90, animacion: "/animations/press_cerrado.glb" },
    { nombre: "Extensión Overhead", series: 3, reps: "10-12", peso_sugerido: "16kg", descanso_seg: 60, animacion: "/animations/extension_overhead.glb" },
  ],
  abdomen: [
    { nombre: "Crunch Abdominal", series: 3, reps: "15-20", peso_sugerido: "Peso corporal", descanso_seg: 30, animacion: "/animations/crunch.glb" },
    { nombre: "Plancha", series: 3, reps: "30-60s", peso_sugerido: "Peso corporal", descanso_seg: 30, animacion: "/animations/plancha.glb" },
    { nombre: "Elevación de Piernas", series: 3, reps: "12-15", peso_sugerido: "Peso corporal", descanso_seg: 45, animacion: "/animations/elevacion_piernas.glb" },
    { nombre: "Russian Twist", series: 3, reps: "20", peso_sugerido: "8kg", descanso_seg: 30, animacion: "/animations/russian_twist.glb" },
    { nombre: "Rueda Abdominal", series: 3, reps: "10-12", peso_sugerido: "Peso corporal", descanso_seg: 60, animacion: "/animations/rueda_ab.glb" },
    { nombre: "Bicicleta Abdominal", series: 3, reps: "20", peso_sugerido: "Peso corporal", descanso_seg: 30, animacion: "/animations/bicicleta.glb" },
  ],
  antebrazos: [
    { nombre: "Curl de muñeca pronado", series: 4, reps: "12-15", peso_sugerido: "15kg", descanso_seg: 45, animacion: "/animations/curl_prono.glb" },
    { nombre: "Curl de muñeca supino con mancuernas", series: 4, reps: "15-20", peso_sugerido: "10kg", descanso_seg: 45, animacion: "/animations/curl_supino.glb" },
    { nombre: "Rodillo de muñeca (Wrist Roller)", series: 3, reps: "Al fallo", peso_sugerido: "5kg", descanso_seg: 60, animacion: "/animations/wrist_roller.glb" },
    { nombre: "Paseo del granjero con barra", series: 3, reps: "40 metros", peso_sugerido: "60kg", descanso_seg: 90, animacion: "/animations/farmers.glb" },
    { nombre: "Curl Zottman", series: 3, reps: "10-12", peso_sugerido: "14kg", descanso_seg: 60, animacion: "/animations/zottman.glb" },
  ],
};

// ── Split templates by days ──

const splitTemplates: Record<number, string[][]> = {
  3: [
    ["pecho", "triceps", "antebrazos"],
    ["espalda", "biceps", "abdomen"],
    ["piernas", "hombros"],
  ],
  4: [
    ["pecho", "antebrazos"],
    ["espalda", "abdomen"],
    ["piernas"],
    ["hombros", "biceps", "triceps"],
  ],
  5: [
    ["pecho"],
    ["espalda", "antebrazos"],
    ["piernas"],
    ["hombros", "abdomen"],
    ["biceps", "triceps"],
  ],
  6: [
    ["pecho"],
    ["espalda"],
    ["piernas"],
    ["hombros", "antebrazos"],
    ["biceps", "triceps"],
    ["abdomen", "piernas"],
  ],
};

// ── Level & objective modifiers ──

interface Modifiers {
  seriesMultiplier: number;
  repsOverride?: string;
  pesoMultiplier: number;
  descansoMultiplier: number;
  exercisesPerMuscle: number;
}

function getModifiers(objetivo: string, nivel: string): Modifiers {
  const base: Modifiers = {
    seriesMultiplier: 1,
    pesoMultiplier: 1,
    descansoMultiplier: 1,
    exercisesPerMuscle: 4,
  };

  // Objective
  switch (objetivo) {
    case "fuerza":
      base.seriesMultiplier = 1.0;
      base.repsOverride = "3-5";
      base.pesoMultiplier = 1.4; // Exigencia absoluta (RPE 9-10)
      base.descansoMultiplier = 3.0; // Descansos masivos de 3 a 5 minutos (180s - 300s)
      base.exercisesPerMuscle = 3;
      break;
    case "hipertrofia":
      base.seriesMultiplier = 1;
      base.pesoMultiplier = 1;
      base.descansoMultiplier = 1;
      base.exercisesPerMuscle = 5;
      break;
    case "resistencia":
      base.seriesMultiplier = 0.75;
      base.repsOverride = "15-20";
      base.pesoMultiplier = 0.6;
      base.descansoMultiplier = 0.7;
      base.exercisesPerMuscle = 5;
      break;
  }

  // Level
  switch (nivel) {
    case "principiante":
      base.seriesMultiplier *= 0.75;
      base.pesoMultiplier *= 0.5;
      base.exercisesPerMuscle = Math.min(base.exercisesPerMuscle, 3);
      break;
    case "intermedio":
      break; // default
    case "avanzado":
      base.seriesMultiplier *= 1.2;
      base.pesoMultiplier *= 1.3;
      base.exercisesPerMuscle = Math.min(base.exercisesPerMuscle + 1, 6);
      break;
  }

  return base;
}

function adjustWeight(original: string, multiplier: number): string {
  const match = original.match(/^(\d+(?:\.\d+)?)\s*(kg|lb)?$/i);
  if (!match) return original; // "Peso corporal" etc.
  const value = Math.round(parseFloat(match[1]) * multiplier);
  return `${value}${match[2] || "kg"}`;
}

function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const dayNames = ["Día 1", "Día 2", "Día 3", "Día 4", "Día 5", "Día 6"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const objetivo: string = (body.objetivo || body.objective || "hipertrofia").toLowerCase();
    const nivel: string = (body.nivel || body.level || "intermedio").toLowerCase();
    const diasSemana: number = Math.max(3, Math.min(6, body.dias_semana || body.days_per_week || 4));
    // muscle param for backward compat (single muscle suggestions)
    const singleMuscle: string | undefined = body.muscle;

    const mods = getModifiers(objetivo, nivel);

    // ── Single muscle mode (backward compatible) ──
    if (singleMuscle) {
      const key = singleMuscle.toLowerCase();
      const exercises = exerciseDB[key];
      if (!exercises) {
        return new Response(
          JSON.stringify({ error: `Grupo muscular no soportado: ${singleMuscle}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const picked = shuffleAndPick(exercises, Math.min(body.count || 5, exercises.length));
      const adjusted = picked.map((ex) => ({
        name: ex.nombre,
        sets: Math.round(ex.series * mods.seriesMultiplier),
        reps: mods.repsOverride || ex.reps,
        rest_seconds: Math.round(ex.descanso_seg * mods.descansoMultiplier),
        peso_sugerido: adjustWeight(ex.peso_sugerido, mods.pesoMultiplier),
        animacion: ex.animacion,
      }));
      return new Response(JSON.stringify(adjusted), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Full routine generation mode ──
    const split = splitTemplates[diasSemana] || splitTemplates[4];

    const rutina = split.map((muscles, dayIdx) => {
      const bloques: MuscleBlock[] = muscles.map((musculo) => {
        const pool = exerciseDB[musculo] || [];
        const picked = shuffleAndPick(pool, Math.min(mods.exercisesPerMuscle, pool.length));
        const ejercicios: Exercise[] = picked.map((ex) => ({
          nombre: ex.nombre,
          series: Math.round(ex.series * mods.seriesMultiplier),
          reps: mods.repsOverride || ex.reps,
          peso_sugerido: adjustWeight(ex.peso_sugerido, mods.pesoMultiplier),
          descanso_seg: Math.round(ex.descanso_seg * mods.descansoMultiplier),
          animacion: ex.animacion,
        }));
        return { musculo, ejercicios };
      });

      return {
        dia: dayNames[dayIdx],
        nombre: `${dayNames[dayIdx]} – ${muscles.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(" + ")}`,
        bloques,
      };
    });

    const response = {
      objetivo,
      nivel,
      dias_semana: diasSemana,
      rutina,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-exercises error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
