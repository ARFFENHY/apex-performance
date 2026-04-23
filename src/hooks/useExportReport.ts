import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface ClientReportData {
  clientId: string;
  clientName: string;
}

export function useExportReport() {
  const exportPDF = useCallback(async ({ clientId, clientName }: ClientReportData) => {
    // Dynamic import to avoid loading jspdf on every page
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    const margin = 20;
    let y = margin;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // primary blue
    doc.text('GymManager', margin, y);
    y += 10;
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text(`Reporte de Progreso — ${clientName}`, margin, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
    y += 12;

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, 190, y);
    y += 10;

    // 1. Body progress
    const { data: progress } = await supabase
      .from('body_progress')
      .select('weight, body_fat, muscle_mass, date')
      .eq('user_id', clientId)
      .order('date', { ascending: true });

    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text('📊 Evolución Corporal', margin, y);
    y += 8;

    if (progress && progress.length > 0) {
      const first = progress[0];
      const last = progress[progress.length - 1];

      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);

      const rows = [
        ['Métrica', 'Inicio', 'Actual', 'Cambio'],
        ['Peso (kg)', first.weight?.toString() || '—', last.weight?.toString() || '—',
          first.weight && last.weight ? `${(last.weight - first.weight).toFixed(1)}` : '—'],
        ['Grasa (%)', first.body_fat?.toString() || '—', last.body_fat?.toString() || '—',
          first.body_fat != null && last.body_fat != null ? `${(last.body_fat - first.body_fat).toFixed(1)}` : '—'],
        ['Músculo (kg)', first.muscle_mass?.toString() || '—', last.muscle_mass?.toString() || '—',
          first.muscle_mass != null && last.muscle_mass != null ? `${(last.muscle_mass - first.muscle_mass).toFixed(1)}` : '—'],
      ];

      rows.forEach((row, i) => {
        const isHeader = i === 0;
        if (isHeader) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
        }
        doc.text(row[0], margin, y);
        doc.text(row[1], margin + 50, y);
        doc.text(row[2], margin + 85, y);
        doc.text(row[3], margin + 120, y);
        y += 6;
      });

      y += 4;
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Total de registros: ${progress.length}`, margin, y);
      y += 4;
      doc.text(`Período: ${progress[0].date} a ${progress[progress.length - 1].date}`, margin, y);
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Sin registros de progreso', margin, y);
    }
    y += 12;

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, 190, y);
    y += 10;

    // 2. Nutrition plan
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text('🥗 Plan Nutricional', margin, y);
    y += 8;

    const { data: plans } = await supabase
      .from('nutrition_plans')
      .select('name, calories, protein, carbs, fat')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (plans && plans.length > 0) {
      const plan = plans[0];
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(`Plan: ${plan.name}`, margin, y); y += 6;
      doc.text(`Calorías: ${plan.calories} kcal/día`, margin, y); y += 6;
      doc.text(`Proteína: ${plan.protein}g | Carbos: ${plan.carbs}g | Grasas: ${plan.fat}g`, margin, y);
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Sin plan nutricional asignado', margin, y);
    }
    y += 12;

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, 190, y);
    y += 10;

    // 3. Achievements
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text('🏆 Logros', margin, y);
    y += 8;

    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('key, type, unlocked_at')
      .eq('user_id', clientId);

    if (achievements && achievements.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      achievements.forEach((a) => {
        doc.text(`✅ ${a.key} (${a.type}) — ${new Date(a.unlocked_at).toLocaleDateString('es-ES')}`, margin, y);
        y += 6;
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Sin logros desbloqueados aún', margin, y);
    }

    // Footer
    y = 280;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Generado por GymManager', margin, y);

    doc.save(`reporte_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  }, []);

  return { exportPDF };
}
