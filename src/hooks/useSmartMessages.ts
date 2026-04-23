import { useMemo } from 'react';
import type { FitnessGoal } from './useFitnessGoals';
import type { DailyLog } from './useDailyLogs';

interface SmartInsight {
  type: 'success' | 'warning' | 'info';
  message: string;
}

export function useSmartMessages(
  goal: FitnessGoal | null | undefined,
  todayLog: DailyLog | null | undefined,
  weeklyLogs: DailyLog[]
): SmartInsight[] {
  return useMemo(() => {
    if (!goal) return [];
    const insights: SmartInsight[] = [];

    if (todayLog) {
      const calRatio = todayLog.calories_consumed / goal.calories;
      if (calRatio >= 0.9 && calRatio <= 1.1) {
        insights.push({ type: 'success', message: 'Vas bien, estás dentro de tu rango calórico objetivo.' });
      } else if (calRatio < 0.5) {
        insights.push({ type: 'warning', message: 'Llevas pocas calorías hoy. Recuerda alimentarte bien.' });
      } else if (calRatio > 1.15) {
        insights.push({ type: 'warning', message: 'Has superado tu objetivo calórico. Modera las porciones restantes.' });
      }

      if (todayLog.protein_consumed < goal.protein * 0.7) {
        insights.push({ type: 'warning', message: 'Te falta proteína hoy. Prioriza fuentes como pollo, huevos o legumbres.' });
      } else if (todayLog.protein_consumed >= goal.protein * 0.9) {
        insights.push({ type: 'success', message: 'Excelente ingesta de proteína hoy.' });
      }

      if (todayLog.water_liters < 1.5) {
        insights.push({ type: 'warning', message: 'Bebe más agua. Recomendación mínima: 2 litros/día.' });
      } else if (todayLog.water_liters >= 2.5) {
        insights.push({ type: 'success', message: 'Gran hidratación hoy.' });
      }

      if (todayLog.training_type) {
        insights.push({ type: 'success', message: `Entrenamiento registrado: ${todayLog.training_type}. ¡Sigue así!` });
      }
    }

    // Weekly analysis
    if (weeklyLogs.length >= 3) {
      const trainingDays = weeklyLogs.filter(l => l.training_type).length;
      if (trainingDays >= 4) {
        insights.push({ type: 'success', message: `Gran consistencia esta semana: ${trainingDays} días de entrenamiento.` });
      } else if (trainingDays <= 1) {
        insights.push({ type: 'warning', message: 'Has entrenado poco esta semana. Intenta ser más consistente.' });
      }

      const avgCals = weeklyLogs.reduce((s, l) => s + l.calories_consumed, 0) / weeklyLogs.length;
      const calDiff = Math.abs(avgCals - goal.calories);
      if (calDiff < goal.calories * 0.1) {
        insights.push({ type: 'success', message: 'Tu promedio calórico semanal está excelente.' });
      }
    }

    if (insights.length === 0) {
      insights.push({
        type: 'info',
        message: 'Con estos valores y constancia en entrenamiento, podrás ver cambios progresivos en tu cuerpo en las próximas semanas.',
      });
    }

    return insights;
  }, [goal, todayLog, weeklyLogs]);
}
