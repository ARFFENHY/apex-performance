// === EXACT exercise image imports (AI-generated, per-exercise) ===
// PECHO
import benchPressBarbellImg from "@/assets/exercises/exact/bench-press-barbell.png";
import inclineBenchPressBarbellImg from "@/assets/exercises/exact/incline-bench-press-barbell.png";
import declineBenchPressBarbellImg from "@/assets/exercises/exact/decline-bench-press-barbell-v2.png";
import inclineDumbbellPressImg from "@/assets/exercises/exact/incline-dumbbell-press.png";
import flatDumbbellPressImg from "@/assets/exercises/exact/flat-dumbbell-press-v2.png";
import declineDumbbellPressImg from "@/assets/exercises/exact/decline-dumbbell-press-v2.png";
import flatDumbbellFlyesImg from "@/assets/exercises/exact/flat-dumbbell-flyes.png";
import inclineDumbbellFlyesImg from "@/assets/exercises/exact/incline-dumbbell-flyes.png";
import cableCrossoverHighImg from "@/assets/exercises/exact/cable-crossover-high.png";
import cableCrossoverLowImg from "@/assets/exercises/exact/cable-crossover-low.png";
import smithMachinePressImg from "@/assets/exercises/exact/smith-machine-press.png";
import hammerStrengthPressImg from "@/assets/exercises/exact/hammer-strength-press.png";
import pecDeckImg from "@/assets/exercises/exact/pec-deck.png";
import dumbbellPulloverImg from "@/assets/exercises/exact/dumbbell-pullover.png";
import chestDipsImg from "@/assets/exercises/exact/chest-dips.png";
import pushUpsImg from "@/assets/exercises/exact/push-ups.png";
import diamondPushUpsImg from "@/assets/exercises/exact/diamond-push-ups.png";
import declinePushUpsImg from "@/assets/exercises/exact/decline-push-ups.png";
import clapPushUpsImg from "@/assets/exercises/exact/clap-push-ups.png";
import svendPressImg from "@/assets/exercises/exact/svend-press.png";

// ESPALDA
import pullUpPronatedImg from "@/assets/exercises/exact/pull-up-pronated.png";
import chinUpSupinatedImg from "@/assets/exercises/exact/chin-up-supinated.png";
import pullUpNeutralImg from "@/assets/exercises/exact/pull-up-neutral.png";
import pullUpWideImg from "@/assets/exercises/exact/pull-up-wide.png";
import barbellRowPronatedImg from "@/assets/exercises/exact/barbell-row-pronated.png";
import barbellRowSupinatedImg from "@/assets/exercises/exact/barbell-row-supinated.png";
import singleArmDumbbellRowImg from "@/assets/exercises/exact/single-arm-dumbbell-row.png";
import tBarRowImg from "@/assets/exercises/exact/t-bar-row.png";
import seatedCableRowImg from "@/assets/exercises/exact/seated-cable-row.png";
import latPulldownWideImg from "@/assets/exercises/exact/lat-pulldown-wide.png";
import latPulldownCloseImg from "@/assets/exercises/exact/lat-pulldown-close.png";
import latPulldownBehindNeckImg from "@/assets/exercises/exact/lat-pulldown-behind-neck.png";
import conventionalDeadliftImg from "@/assets/exercises/exact/conventional-deadlift.png";
import sumoDeadliftImg from "@/assets/exercises/exact/sumo-deadlift.png";
import hammerRowMachineImg from "@/assets/exercises/exact/hammer-row-machine.png";
import cablePulloverImg from "@/assets/exercises/exact/cable-pullover.png";
import facePullImg from "@/assets/exercises/exact/face-pull.png";
import hyperextensionsImg from "@/assets/exercises/exact/hyperextensions.png";
import invertedRowImg from "@/assets/exercises/exact/inverted-row.png";
import muscleUpImg from "@/assets/exercises/exact/muscle-up.png";

// === Generic fallback imports ===
import benchPressGeneric from "@/assets/exercises/bench-press.jpg";
import barbellRow from "@/assets/exercises/barbell-row.jpg";
import bicepCurl from "@/assets/exercises/bicep-curl.jpg";
import deadlift from "@/assets/exercises/deadlift.jpg";
import hipThrust from "@/assets/exercises/hip-thrust.jpg";
import lateralRaise from "@/assets/exercises/lateral-raise.jpg";
import legPress from "@/assets/exercises/leg-press.jpg";
import pullups from "@/assets/exercises/pullups.jpg";
import shoulderPress from "@/assets/exercises/shoulder-press.jpg";
import squat from "@/assets/exercises/squat.jpg";
import tricepPushdown from "@/assets/exercises/tricep-pushdown.jpg";

export type Gender = "male" | "female" | "neutral";

const normalize = (v: string) =>
  v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

// ═══════════════════════════════════════════════════════════════
// EXACT NAME → IMAGE MAP (highest priority, 1:1 per exercise)
// ═══════════════════════════════════════════════════════════════
const EXACT_NAME_MAP: Record<string, string> = {};
const addExact = (name: string, img: string) => { EXACT_NAME_MAP[normalize(name)] = img; };

// PECHO — 21 ejercicios
addExact("Press banca con barra", benchPressBarbellImg);
addExact("Press banca inclinado con barra", inclineBenchPressBarbellImg);
addExact("Press banca declinado con barra", declineBenchPressBarbellImg);
addExact("Press inclinado con mancuernas", inclineDumbbellPressImg);
addExact("Press plano con mancuernas", flatDumbbellPressImg);
addExact("Press declinado con mancuernas", declineDumbbellPressImg);
addExact("Aperturas con mancuernas plano", flatDumbbellFlyesImg);
addExact("Aperturas inclinadas con mancuernas", inclineDumbbellFlyesImg);
addExact("Crossover en polea alta", cableCrossoverHighImg);
addExact("Crossover en polea baja", cableCrossoverLowImg);
addExact("Press en máquina Smith", smithMachinePressImg);
addExact("Press en máquina convergente", hammerStrengthPressImg);
addExact("Pec deck (mariposa)", pecDeckImg);
addExact("Pullover con mancuerna", dumbbellPulloverImg);
addExact("Fondos en paralelas (pecho)", chestDipsImg);
addExact("Flexiones de pecho", pushUpsImg);
addExact("Flexiones diamante", diamondPushUpsImg);
addExact("Flexiones declinadas", declinePushUpsImg);
addExact("Flexiones con palmada", clapPushUpsImg);
addExact("Svend press", svendPressImg);

// ESPALDA — 20 ejercicios
addExact("Dominadas agarre prono", pullUpPronatedImg);
addExact("Dominadas agarre supino (chin-up)", chinUpSupinatedImg);
addExact("Dominadas agarre neutro", pullUpNeutralImg);
addExact("Dominadas agarre amplio", pullUpWideImg);
addExact("Remo con barra agarre prono", barbellRowPronatedImg);
addExact("Remo con barra agarre supino", barbellRowSupinatedImg);
addExact("Remo con mancuerna a una mano", singleArmDumbbellRowImg);
addExact("Remo en máquina T", tBarRowImg);
addExact("Remo sentado en polea baja", seatedCableRowImg);
addExact("Jalón al pecho agarre amplio", latPulldownWideImg);
addExact("Jalón al pecho agarre cerrado", latPulldownCloseImg);
addExact("Jalón tras nuca", latPulldownBehindNeckImg);
addExact("Peso muerto convencional", conventionalDeadliftImg);
addExact("Peso muerto sumo", sumoDeadliftImg);
addExact("Remo en máquina Hammer", hammerRowMachineImg);
addExact("Pullover en polea alta", cablePulloverImg);
addExact("Face pull", facePullImg);
addExact("Hiperextensiones", hyperextensionsImg);
addExact("Remo invertido (australian pull-up)", invertedRowImg);
addExact("Muscle up en barra", muscleUpImg);

// ═══════════════════════════════════════════════════════════════
// KEYWORD FALLBACK (for exercises without exact images yet)
// ═══════════════════════════════════════════════════════════════
type KWEntry = { keywords: string[]; img: string };
const KEYWORD_MAP: KWEntry[] = [
  { keywords: ["press militar", "press arnold", "push press", "press con mancuernas sentado", "press en maquina de hombros"], img: shoulderPress },
  { keywords: ["elevaciones laterales", "elevacion lateral", "elevaciones frontales", "pajaros", "pajaro"], img: lateralRaise },
  { keywords: ["dominadas", "pull-up", "pull up", "chin-up", "chin up", "jalon"], img: pullups },
  { keywords: ["remo", "face pull"], img: barbellRow },
  { keywords: ["curl", "biceps"], img: bicepCurl },
  { keywords: ["triceps", "pushdown", "press frances", "kickback", "extension de triceps", "fondos en banco"], img: tricepPushdown },
  { keywords: ["sentadilla", "zancada", "lunge", "step-up", "bulgara"], img: squat },
  { keywords: ["prensa", "leg press", "extensiones de pierna"], img: legPress },
  { keywords: ["peso muerto", "rdl", "good morning", "buenos dias"], img: deadlift },
  { keywords: ["hip thrust", "puente de gluteos", "glute bridge", "abduccion", "clamshell", "frog pump", "patada de gluteo"], img: hipThrust },
  { keywords: ["flexiones", "push-up", "fondos"], img: pushUpsImg },
  { keywords: ["press banca", "press plano", "press inclinado", "press declinado"], img: benchPressGeneric },
];

// ═══════════════════════════════════════════════════════════════
// MUSCLE GROUP FALLBACK (lowest priority)
// ═══════════════════════════════════════════════════════════════
const MUSCLE_FALLBACK: Record<string, string> = {
  Pecho: benchPressGeneric,
  Espalda: barbellRow,
  Hombros: shoulderPress,
  "Bíceps": bicepCurl,
  "Tríceps": tricepPushdown,
  "Cuádriceps": squat,
  Isquiotibiales: deadlift,
  "Glúteos": hipThrust,
  Pantorrillas: legPress,
  Abdominales: pushUpsImg,
  Core: pushUpsImg,
  Antebrazos: bicepCurl,
  Trapecio: barbellRow,
  "Cuerpo completo": squat,
};

const DEFAULT_IMG = benchPressGeneric;

/**
 * Returns the image for an exercise.
 * Priority: 1) Exact name match → 2) Keyword match → 3) Muscle group fallback → 4) Default
 */
export function getExerciseImage(
  exerciseName: string,
  muscleGroup: string,
  _gender: Gender = "neutral"
): string {
  const key = normalize(exerciseName);

  // 1. Exact name match (highest precision)
  const exact = EXACT_NAME_MAP[key];
  if (exact) return exact;

  // 2. Keyword match
  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some((kw) => key.includes(normalize(kw)))) {
      return entry.img;
    }
  }

  // 3. Muscle group fallback
  const mf = MUSCLE_FALLBACK[muscleGroup];
  if (mf) return mf;

  return DEFAULT_IMG;
}
