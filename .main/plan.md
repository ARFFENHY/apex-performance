## Plan: Seguimiento Diario Profesional

### 1. Alertas de macros excedidos
- Cuando calorías/proteína/carbos/grasas superen el objetivo de la calculadora → barra roja + mensaje de advertencia
- Cambiar color dinámicamente según % consumido (verde < 100%, amarillo 90-100%, rojo > 100%)

### 2. Registro manual de entrenamiento por sesión
- Campo para definir grupo muscular del día (ej: "Bíceps + Pecho")
- Tabla dinámica para agregar ejercicios con: nombre, series, repeticiones, peso (kg), descanso (seg)
- Botón para agregar más ejercicios
- Guardar todo el registro vinculado al día

### 3. Registro de comidas individuales
- Basado en la cantidad de comidas definidas en la calculadora (1-5)
- Cada comida se registra por separado (Desayuno, Almuerzo, Cena, Snack 1, Snack 2)
- Botón "Agregar comida extra" para registrar comidas adicionales
- Cada comida guarda: nombre/descripción, calorías, proteína, carbos, grasas
- Los totales se suman automáticamente y se comparan con los objetivos

### 4. Escáner IA de alimentos
- Botón con ícono de cámara para escanear comida
- Sube foto → Edge Function con Lovable AI analiza la imagen
- Devuelve: descripción del plato, estimación de macros, sugerencias
- El usuario puede aceptar los valores o editarlos manualmente
- Al confirmar se registra como una comida

### Archivos a crear/modificar:
- `src/components/tracking/MacroProgressBar.tsx` - Barra con alertas de color
- `src/components/tracking/WorkoutLogger.tsx` - Registro de entrenamiento manual
- `src/components/tracking/MealLogger.tsx` - Registro de comidas individuales  
- `src/components/tracking/FoodScanner.tsx` - Escáner IA
- `src/hooks/useMealLogs.ts` - Hook para comidas individuales
- `src/hooks/useWorkoutLogs.ts` - Hook para registro de entrenamiento
- `supabase/functions/scan-food/index.ts` - Edge function para análisis IA
- `src/pages/DailyTracking.tsx` - Refactorizar para usar nuevos componentes
- SQL: tablas `meal_logs` y `workout_session_logs`
