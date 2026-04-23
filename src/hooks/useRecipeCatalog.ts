export interface RecipeEntry {
  name: string;
  category: 'deficit' | 'maintenance' | 'surplus' | 'all';
  meal_type: 'desayuno' | 'almuerzo' | 'cena' | 'snack' | 'pre_entreno' | 'post_entreno';
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  ingredients: string;
}

export const MEAL_TYPES = [
  { value: "desayuno", label: "Desayuno" },
  { value: "almuerzo", label: "Almuerzo" },
  { value: "cena", label: "Cena" },
  { value: "snack", label: "Snack" },
  { value: "pre_entreno", label: "Pre-entreno" },
  { value: "post_entreno", label: "Post-entreno" },
];

export const RECIPE_CATEGORIES = [
  { value: "deficit", label: "Déficit calórico" },
  { value: "maintenance", label: "Mantenimiento" },
  { value: "surplus", label: "Superávit calórico" },
];

export const RECIPE_CATALOG: RecipeEntry[] = [
  // ═══════════════════ DESAYUNOS ═══════════════════
  // Déficit
  { name: "Claras de huevo revueltas con espinaca", category: "deficit", meal_type: "desayuno", calories: 180, protein_g: 26, carbs_g: 4, fat_g: 2, ingredients: "6 claras de huevo, espinaca, sal, pimienta" },
  { name: "Avena con proteína whey y canela", category: "deficit", meal_type: "desayuno", calories: 280, protein_g: 30, carbs_g: 35, fat_g: 4, ingredients: "40g avena, 1 scoop whey, canela, agua" },
  { name: "Yogur griego con frutos rojos", category: "deficit", meal_type: "desayuno", calories: 200, protein_g: 20, carbs_g: 18, fat_g: 5, ingredients: "200g yogur griego 0%, 80g frutos rojos" },
  { name: "Tortilla de claras con champiñones", category: "deficit", meal_type: "desayuno", calories: 160, protein_g: 24, carbs_g: 5, fat_g: 3, ingredients: "5 claras, 100g champiñones, cebolla" },
  { name: "Tostada integral con pavo y tomate", category: "deficit", meal_type: "desayuno", calories: 220, protein_g: 18, carbs_g: 25, fat_g: 5, ingredients: "1 pan integral, 60g pechuga de pavo, tomate" },
  { name: "Batido de proteína con espinaca y plátano", category: "deficit", meal_type: "desayuno", calories: 250, protein_g: 28, carbs_g: 28, fat_g: 3, ingredients: "1 scoop whey, espinaca, ½ plátano, agua" },
  { name: "Huevos pochados sobre tostada integral", category: "deficit", meal_type: "desayuno", calories: 240, protein_g: 16, carbs_g: 22, fat_g: 10, ingredients: "2 huevos, 1 pan integral, sal" },
  // Mantenimiento
  { name: "Avena con plátano, miel y almendras", category: "maintenance", meal_type: "desayuno", calories: 420, protein_g: 14, carbs_g: 62, fat_g: 14, ingredients: "60g avena, 1 plátano, miel, 15g almendras" },
  { name: "Huevos revueltos con pan integral y aguacate", category: "maintenance", meal_type: "desayuno", calories: 450, protein_g: 22, carbs_g: 30, fat_g: 28, ingredients: "3 huevos, 2 panes integrales, ½ aguacate" },
  { name: "Pancakes de avena con proteína", category: "maintenance", meal_type: "desayuno", calories: 380, protein_g: 32, carbs_g: 45, fat_g: 8, ingredients: "60g avena, 1 huevo, 1 scoop whey, leche" },
  { name: "Tostadas francesas integrales", category: "maintenance", meal_type: "desayuno", calories: 400, protein_g: 20, carbs_g: 48, fat_g: 14, ingredients: "2 panes integrales, 2 huevos, canela, leche" },
  { name: "Bowl de açaí con granola y frutas", category: "maintenance", meal_type: "desayuno", calories: 380, protein_g: 8, carbs_g: 60, fat_g: 12, ingredients: "Açaí, 30g granola, plátano, fresas" },
  // Superávit
  { name: "Avena con mantequilla de maní y plátano", category: "surplus", meal_type: "desayuno", calories: 580, protein_g: 22, carbs_g: 72, fat_g: 22, ingredients: "80g avena, 30g mantequilla de maní, 1 plátano, miel" },
  { name: "Tortilla de 4 huevos con queso y pan", category: "surplus", meal_type: "desayuno", calories: 620, protein_g: 38, carbs_g: 35, fat_g: 36, ingredients: "4 huevos, 40g queso, 2 panes, mantequilla" },
  { name: "Batido hipercalórico casero", category: "surplus", meal_type: "desayuno", calories: 700, protein_g: 40, carbs_g: 85, fat_g: 22, ingredients: "2 scoops whey, 80g avena, 1 plátano, leche entera, mantequilla de maní" },
  { name: "Pancakes de avena con miel y frutos secos", category: "surplus", meal_type: "desayuno", calories: 550, protein_g: 28, carbs_g: 65, fat_g: 20, ingredients: "80g avena, 2 huevos, whey, miel, nueces" },
  { name: "Granola casera con yogur y miel", category: "surplus", meal_type: "desayuno", calories: 520, protein_g: 18, carbs_g: 68, fat_g: 20, ingredients: "60g granola, 200g yogur, miel, almendras" },
  // ═══════════════════ ALMUERZOS ═══════════════════
  // Déficit
  { name: "Pechuga de pollo a la plancha con ensalada", category: "deficit", meal_type: "almuerzo", calories: 300, protein_g: 42, carbs_g: 8, fat_g: 10, ingredients: "200g pechuga de pollo, lechuga, tomate, pepino, limón" },
  { name: "Atún en lata con vegetales y limón", category: "deficit", meal_type: "almuerzo", calories: 220, protein_g: 35, carbs_g: 6, fat_g: 6, ingredients: "1 lata de atún en agua, lechuga, tomate, cebolla, limón" },
  { name: "Filete de tilapia con brócoli al vapor", category: "deficit", meal_type: "almuerzo", calories: 250, protein_g: 38, carbs_g: 10, fat_g: 6, ingredients: "200g tilapia, 200g brócoli, limón, ajo" },
  { name: "Ensalada de pollo con espinaca y pepino", category: "deficit", meal_type: "almuerzo", calories: 280, protein_g: 36, carbs_g: 10, fat_g: 10, ingredients: "180g pollo, espinaca, pepino, vinagreta light" },
  { name: "Wrap de lechuga con pavo y mostaza", category: "deficit", meal_type: "almuerzo", calories: 200, protein_g: 28, carbs_g: 6, fat_g: 6, ingredients: "Hojas de lechuga, 150g pavo, mostaza, tomate" },
  { name: "Pollo con calabacín salteado", category: "deficit", meal_type: "almuerzo", calories: 270, protein_g: 38, carbs_g: 8, fat_g: 9, ingredients: "200g pollo, 200g calabacín, ajo, aceite oliva spray" },
  { name: "Pechuga de pollo con arroz de coliflor", category: "deficit", meal_type: "almuerzo", calories: 260, protein_g: 40, carbs_g: 8, fat_g: 7, ingredients: "200g pollo, 200g coliflor rallada, especias" },
  // Mantenimiento
  { name: "Pollo con arroz integral y vegetales", category: "maintenance", meal_type: "almuerzo", calories: 450, protein_g: 40, carbs_g: 50, fat_g: 10, ingredients: "200g pollo, 80g arroz integral, brócoli, zanahoria" },
  { name: "Salmón con quinoa y espárragos", category: "maintenance", meal_type: "almuerzo", calories: 480, protein_g: 38, carbs_g: 40, fat_g: 18, ingredients: "180g salmón, 70g quinoa, espárragos, limón" },
  { name: "Carne molida con pasta integral", category: "maintenance", meal_type: "almuerzo", calories: 500, protein_g: 35, carbs_g: 55, fat_g: 14, ingredients: "150g carne molida magra, 80g pasta integral, salsa de tomate" },
  { name: "Lomo de cerdo con batata y ensalada", category: "maintenance", meal_type: "almuerzo", calories: 460, protein_g: 35, carbs_g: 45, fat_g: 14, ingredients: "180g lomo de cerdo, 200g batata, ensalada verde" },
  { name: "Bowl de pollo teriyaki con arroz", category: "maintenance", meal_type: "almuerzo", calories: 480, protein_g: 38, carbs_g: 55, fat_g: 10, ingredients: "200g pollo, 80g arroz, salsa teriyaki, vegetales" },
  { name: "Tacos de pescado con repollo", category: "maintenance", meal_type: "almuerzo", calories: 420, protein_g: 32, carbs_g: 38, fat_g: 14, ingredients: "180g pescado blanco, tortillas de maíz, repollo, salsa" },
  { name: "Pechuga de pollo con puré de papa", category: "maintenance", meal_type: "almuerzo", calories: 440, protein_g: 38, carbs_g: 42, fat_g: 12, ingredients: "200g pollo, 200g papa, leche, mantequilla light" },
  { name: "Estofado de lentejas con vegetales", category: "maintenance", meal_type: "almuerzo", calories: 380, protein_g: 22, carbs_g: 55, fat_g: 6, ingredients: "80g lentejas, zanahoria, papa, apio, tomate" },
  // Superávit
  { name: "Carne con arroz, frijoles y plátano", category: "surplus", meal_type: "almuerzo", calories: 700, protein_g: 45, carbs_g: 85, fat_g: 18, ingredients: "200g carne, 100g arroz, 80g frijoles, plátano maduro" },
  { name: "Pasta con pollo y salsa alfredo", category: "surplus", meal_type: "almuerzo", calories: 680, protein_g: 42, carbs_g: 70, fat_g: 24, ingredients: "200g pollo, 120g pasta, crema, queso parmesano" },
  { name: "Pollo con arroz y aguacate", category: "surplus", meal_type: "almuerzo", calories: 650, protein_g: 42, carbs_g: 65, fat_g: 22, ingredients: "200g pollo, 100g arroz blanco, 1 aguacate" },
  { name: "Hamburguesa casera doble con papas", category: "surplus", meal_type: "almuerzo", calories: 750, protein_g: 48, carbs_g: 60, fat_g: 35, ingredients: "250g carne molida, pan, lechuga, tomate, papas al horno" },
  { name: "Salmón con pasta y aceite de oliva", category: "surplus", meal_type: "almuerzo", calories: 680, protein_g: 40, carbs_g: 65, fat_g: 28, ingredients: "200g salmón, 100g pasta, aceite de oliva, ajo" },
  { name: "Pollo con batata y mantequilla de maní", category: "surplus", meal_type: "almuerzo", calories: 620, protein_g: 42, carbs_g: 60, fat_g: 22, ingredients: "200g pollo, 250g batata, 20g mantequilla de maní" },
  // ═══════════════════ CENAS ═══════════════════
  // Déficit
  { name: "Pechuga de pollo con vegetales al vapor", category: "deficit", meal_type: "cena", calories: 260, protein_g: 40, carbs_g: 10, fat_g: 6, ingredients: "200g pollo, brócoli, zanahoria, calabacín al vapor" },
  { name: "Filete de merluza con ensalada verde", category: "deficit", meal_type: "cena", calories: 220, protein_g: 35, carbs_g: 6, fat_g: 6, ingredients: "200g merluza, lechuga, rúcula, tomate cherry" },
  { name: "Omelette de claras con espárragos", category: "deficit", meal_type: "cena", calories: 180, protein_g: 28, carbs_g: 6, fat_g: 3, ingredients: "6 claras, espárragos, cebolla" },
  { name: "Sopa de pollo con vegetales", category: "deficit", meal_type: "cena", calories: 200, protein_g: 25, carbs_g: 15, fat_g: 4, ingredients: "150g pollo, zanahoria, apio, cebolla, calabaza" },
  { name: "Ensalada de salmón ahumado", category: "deficit", meal_type: "cena", calories: 280, protein_g: 30, carbs_g: 8, fat_g: 14, ingredients: "120g salmón ahumado, rúcula, alcaparras, cebolla morada" },
  { name: "Pavo a la plancha con espinacas salteadas", category: "deficit", meal_type: "cena", calories: 230, protein_g: 36, carbs_g: 6, fat_g: 7, ingredients: "200g pechuga de pavo, espinacas, ajo" },
  // Mantenimiento
  { name: "Salmón al horno con batata", category: "maintenance", meal_type: "cena", calories: 450, protein_g: 35, carbs_g: 38, fat_g: 18, ingredients: "180g salmón, 200g batata, limón, hierbas" },
  { name: "Pollo al horno con vegetales asados", category: "maintenance", meal_type: "cena", calories: 400, protein_g: 38, carbs_g: 30, fat_g: 14, ingredients: "200g pollo, pimiento, cebolla, calabacín, berenjena" },
  { name: "Revuelto de huevos con vegetales y tortilla integral", category: "maintenance", meal_type: "cena", calories: 380, protein_g: 24, carbs_g: 30, fat_g: 18, ingredients: "3 huevos, pimiento, cebolla, tortilla integral" },
  { name: "Atún a la plancha con ensalada César", category: "maintenance", meal_type: "cena", calories: 400, protein_g: 42, carbs_g: 15, fat_g: 20, ingredients: "200g atún fresco, lechuga romana, parmesano, aderezo light" },
  { name: "Chili de carne con arroz", category: "maintenance", meal_type: "cena", calories: 460, protein_g: 32, carbs_g: 50, fat_g: 14, ingredients: "150g carne, frijoles, tomate, arroz, especias" },
  // Superávit
  { name: "Carne con puré de papa y mantequilla", category: "surplus", meal_type: "cena", calories: 650, protein_g: 42, carbs_g: 55, fat_g: 28, ingredients: "220g carne, 300g papa, mantequilla, leche" },
  { name: "Pasta con albóndigas y queso", category: "surplus", meal_type: "cena", calories: 700, protein_g: 40, carbs_g: 72, fat_g: 26, ingredients: "200g carne molida, 120g pasta, salsa tomate, queso" },
  { name: "Pollo con arroz, frijoles y plátano frito", category: "surplus", meal_type: "cena", calories: 720, protein_g: 42, carbs_g: 82, fat_g: 22, ingredients: "200g pollo, arroz, frijoles negros, plátano maduro" },
  { name: "Burrito de carne y frijoles", category: "surplus", meal_type: "cena", calories: 680, protein_g: 38, carbs_g: 65, fat_g: 28, ingredients: "200g carne, frijoles, arroz, tortilla grande, queso, guacamole" },
  { name: "Pizza casera de pollo", category: "surplus", meal_type: "cena", calories: 650, protein_g: 40, carbs_g: 60, fat_g: 26, ingredients: "Masa integral, pollo desmenuzado, mozzarella, tomate, cebolla" },
  // ═══════════════════ SNACKS ═══════════════════
  // Déficit
  { name: "Yogur griego con semillas de chía", category: "deficit", meal_type: "snack", calories: 150, protein_g: 18, carbs_g: 10, fat_g: 4, ingredients: "150g yogur griego 0%, 10g semillas de chía" },
  { name: "Rodajas de pepino con hummus", category: "deficit", meal_type: "snack", calories: 120, protein_g: 6, carbs_g: 12, fat_g: 6, ingredients: "1 pepino, 40g hummus" },
  { name: "Palitos de apio con queso cottage", category: "deficit", meal_type: "snack", calories: 100, protein_g: 14, carbs_g: 5, fat_g: 2, ingredients: "Apio, 100g queso cottage bajo en grasa" },
  { name: "Gelatina proteica", category: "deficit", meal_type: "snack", calories: 80, protein_g: 15, carbs_g: 2, fat_g: 0, ingredients: "Gelatina sin azúcar con 1/2 scoop de whey" },
  { name: "Manzana con canela", category: "deficit", meal_type: "snack", calories: 95, protein_g: 0, carbs_g: 25, fat_g: 0, ingredients: "1 manzana, canela" },
  { name: "Edamames al vapor", category: "deficit", meal_type: "snack", calories: 120, protein_g: 11, carbs_g: 9, fat_g: 5, ingredients: "100g edamames, sal" },
  { name: "Rollitos de pavo con pepino", category: "deficit", meal_type: "snack", calories: 100, protein_g: 16, carbs_g: 4, fat_g: 2, ingredients: "80g pechuga de pavo, pepino" },
  // Mantenimiento
  { name: "Manzana con mantequilla de almendras", category: "maintenance", meal_type: "snack", calories: 250, protein_g: 6, carbs_g: 30, fat_g: 14, ingredients: "1 manzana, 20g mantequilla de almendras" },
  { name: "Mix de frutos secos y pasas", category: "maintenance", meal_type: "snack", calories: 280, protein_g: 8, carbs_g: 30, fat_g: 16, ingredients: "30g almendras, 20g nueces, 20g pasas" },
  { name: "Tostada integral con aguacate", category: "maintenance", meal_type: "snack", calories: 250, protein_g: 6, carbs_g: 25, fat_g: 16, ingredients: "1 pan integral, ½ aguacate, sal, limón" },
  { name: "Batido de frutas con yogur", category: "maintenance", meal_type: "snack", calories: 220, protein_g: 12, carbs_g: 38, fat_g: 4, ingredients: "150g yogur, plátano, fresas, leche" },
  { name: "Queso cottage con piña", category: "maintenance", meal_type: "snack", calories: 180, protein_g: 18, carbs_g: 20, fat_g: 3, ingredients: "150g queso cottage, 80g piña" },
  // Superávit
  { name: "Batido de plátano con avena y whey", category: "surplus", meal_type: "snack", calories: 450, protein_g: 32, carbs_g: 58, fat_g: 10, ingredients: "1 plátano, 50g avena, 1 scoop whey, leche entera" },
  { name: "Tostadas con mantequilla de maní y miel", category: "surplus", meal_type: "snack", calories: 400, protein_g: 14, carbs_g: 48, fat_g: 18, ingredients: "2 panes integrales, 30g mantequilla de maní, miel" },
  { name: "Granola con yogur y plátano", category: "surplus", meal_type: "snack", calories: 420, protein_g: 14, carbs_g: 62, fat_g: 14, ingredients: "50g granola, 200g yogur, 1 plátano" },
  { name: "Arroz con leche casero", category: "surplus", meal_type: "snack", calories: 380, protein_g: 10, carbs_g: 60, fat_g: 12, ingredients: "80g arroz, leche entera, canela, azúcar" },
  { name: "Trail mix energético", category: "surplus", meal_type: "snack", calories: 450, protein_g: 14, carbs_g: 40, fat_g: 28, ingredients: "Almendras, nueces, chocolate oscuro, arándanos secos, semillas" },
  // ═══════════════════ PRE-ENTRENO ═══════════════════
  { name: "Plátano con mantequilla de maní", category: "all", meal_type: "pre_entreno", calories: 300, protein_g: 8, carbs_g: 38, fat_g: 14, ingredients: "1 plátano, 20g mantequilla de maní" },
  { name: "Avena rápida con miel", category: "all", meal_type: "pre_entreno", calories: 250, protein_g: 8, carbs_g: 45, fat_g: 4, ingredients: "50g avena, miel, canela" },
  { name: "Tostada con mermelada y café", category: "all", meal_type: "pre_entreno", calories: 200, protein_g: 4, carbs_g: 38, fat_g: 3, ingredients: "1 pan integral, mermelada sin azúcar, café" },
  { name: "Batata al horno", category: "all", meal_type: "pre_entreno", calories: 180, protein_g: 4, carbs_g: 42, fat_g: 0, ingredients: "200g batata, canela" },
  { name: "Arroz con pollo (porción pequeña)", category: "all", meal_type: "pre_entreno", calories: 320, protein_g: 22, carbs_g: 42, fat_g: 6, ingredients: "120g pollo, 60g arroz" },
  { name: "Galletas de arroz con miel", category: "all", meal_type: "pre_entreno", calories: 160, protein_g: 2, carbs_g: 36, fat_g: 1, ingredients: "3 galletas de arroz, miel" },
  { name: "Smoothie de frutas con avena", category: "all", meal_type: "pre_entreno", calories: 280, protein_g: 6, carbs_g: 52, fat_g: 4, ingredients: "Plátano, mango, 30g avena, agua" },
  // ═══════════════════ POST-ENTRENO ═══════════════════
  { name: "Batido de whey con plátano", category: "all", meal_type: "post_entreno", calories: 280, protein_g: 30, carbs_g: 32, fat_g: 3, ingredients: "1 scoop whey, 1 plátano, agua" },
  { name: "Pollo con arroz blanco", category: "all", meal_type: "post_entreno", calories: 420, protein_g: 40, carbs_g: 48, fat_g: 6, ingredients: "200g pollo, 80g arroz blanco" },
  { name: "Atún con papa cocida", category: "all", meal_type: "post_entreno", calories: 350, protein_g: 35, carbs_g: 38, fat_g: 5, ingredients: "1 lata atún, 200g papa cocida" },
  { name: "Claras con avena y fruta", category: "all", meal_type: "post_entreno", calories: 320, protein_g: 28, carbs_g: 40, fat_g: 4, ingredients: "5 claras, 40g avena, 1 plátano" },
  { name: "Yogur griego con granola y miel", category: "all", meal_type: "post_entreno", calories: 300, protein_g: 22, carbs_g: 40, fat_g: 6, ingredients: "200g yogur griego, 30g granola, miel" },
  { name: "Sándwich de pavo con pan blanco", category: "all", meal_type: "post_entreno", calories: 320, protein_g: 28, carbs_g: 35, fat_g: 8, ingredients: "100g pavo, 2 panes blancos, lechuga, tomate" },
  { name: "Batido de proteína con avena y fresas", category: "all", meal_type: "post_entreno", calories: 340, protein_g: 32, carbs_g: 40, fat_g: 5, ingredients: "1 scoop whey, 40g avena, fresas, leche" },
  // ═══════════════════ MÁS ALMUERZOS/CENAS UNIVERSALES ═══════════════════
  { name: "Arroz con pollo y vegetales salteados", category: "all", meal_type: "almuerzo", calories: 450, protein_g: 38, carbs_g: 50, fat_g: 10, ingredients: "200g pollo, 80g arroz, pimiento, cebolla, zanahoria" },
  { name: "Carne asada con yuca", category: "surplus", meal_type: "almuerzo", calories: 580, protein_g: 40, carbs_g: 55, fat_g: 20, ingredients: "200g carne, 200g yuca hervida, ensalada" },
  { name: "Pechuga de pavo al horno con quinoa", category: "maintenance", meal_type: "almuerzo", calories: 420, protein_g: 40, carbs_g: 38, fat_g: 12, ingredients: "200g pavo, 70g quinoa, vegetales asados" },
  { name: "Filete de pescado con puré de coliflor", category: "deficit", meal_type: "cena", calories: 240, protein_g: 35, carbs_g: 10, fat_g: 6, ingredients: "200g pescado, 200g coliflor, ajo, sal" },
  { name: "Ensalada de garbanzos con atún", category: "maintenance", meal_type: "almuerzo", calories: 380, protein_g: 30, carbs_g: 38, fat_g: 10, ingredients: "80g garbanzos, 1 lata atún, tomate, cebolla, limón" },
  { name: "Bowl de arroz con salmón y aguacate", category: "surplus", meal_type: "almuerzo", calories: 620, protein_g: 35, carbs_g: 55, fat_g: 28, ingredients: "180g salmón, 80g arroz, ½ aguacate, pepino, salsa soy" },
  { name: "Wrap integral de pollo con hummus", category: "maintenance", meal_type: "almuerzo", calories: 400, protein_g: 32, carbs_g: 38, fat_g: 14, ingredients: "150g pollo, tortilla integral, hummus, lechuga, tomate" },
  { name: "Ceviche de pescado", category: "deficit", meal_type: "almuerzo", calories: 200, protein_g: 30, carbs_g: 12, fat_g: 3, ingredients: "200g pescado blanco, limón, cebolla morada, cilantro, ají" },
  { name: "Lomo saltado con arroz", category: "surplus", meal_type: "almuerzo", calories: 600, protein_g: 38, carbs_g: 60, fat_g: 20, ingredients: "200g lomo, cebolla, tomate, papa frita, arroz" },
  { name: "Pollo a la brasa con ensalada", category: "maintenance", meal_type: "cena", calories: 420, protein_g: 42, carbs_g: 12, fat_g: 22, ingredients: "1/4 pollo a la brasa, ensalada mixta" },
  { name: "Tortilla española de papa", category: "maintenance", meal_type: "cena", calories: 350, protein_g: 18, carbs_g: 28, fat_g: 18, ingredients: "3 huevos, 150g papa, cebolla, aceite de oliva" },
  { name: "Crema de calabaza con pollo", category: "deficit", meal_type: "cena", calories: 230, protein_g: 28, carbs_g: 22, fat_g: 4, ingredients: "200g calabaza, 120g pollo, cebolla, ajo" },
  { name: "Ensalada de quinoa con vegetales", category: "deficit", meal_type: "almuerzo", calories: 280, protein_g: 12, carbs_g: 42, fat_g: 6, ingredients: "60g quinoa, pimiento, pepino, tomate, limón" },
  { name: "Bowl de proteína con frijoles negros", category: "maintenance", meal_type: "almuerzo", calories: 440, protein_g: 28, carbs_g: 55, fat_g: 12, ingredients: "Arroz, frijoles negros, pollo, aguacate, maíz" },
  { name: "Sopa de lentejas con espinaca", category: "deficit", meal_type: "cena", calories: 220, protein_g: 16, carbs_g: 32, fat_g: 3, ingredients: "60g lentejas, espinaca, zanahoria, cebolla, ajo" },
  // ═══════════════════ MÁS SNACKS ═══════════════════
  { name: "Huevo duro con sal y pimienta", category: "deficit", meal_type: "snack", calories: 70, protein_g: 6, carbs_g: 0, fat_g: 5, ingredients: "1 huevo duro" },
  { name: "Proteína en barra casera", category: "all", meal_type: "snack", calories: 220, protein_g: 20, carbs_g: 22, fat_g: 8, ingredients: "Avena, whey, miel, mantequilla de maní" },
  { name: "Cottage con tomate y orégano", category: "deficit", meal_type: "snack", calories: 120, protein_g: 16, carbs_g: 6, fat_g: 3, ingredients: "120g queso cottage, tomate, orégano" },
  { name: "Dátiles rellenos de mantequilla de almendras", category: "surplus", meal_type: "snack", calories: 300, protein_g: 6, carbs_g: 45, fat_g: 12, ingredients: "4 dátiles, 20g mantequilla de almendras" },
  { name: "Pudding de chía", category: "maintenance", meal_type: "snack", calories: 220, protein_g: 8, carbs_g: 25, fat_g: 10, ingredients: "30g semillas de chía, 200ml leche, miel, frutos rojos" },
  { name: "Tiras de pimiento con guacamole", category: "maintenance", meal_type: "snack", calories: 200, protein_g: 4, carbs_g: 14, fat_g: 16, ingredients: "1 pimiento, ½ aguacate, limón, sal" },
  { name: "Pancakes de proteína (mini)", category: "surplus", meal_type: "snack", calories: 350, protein_g: 28, carbs_g: 35, fat_g: 10, ingredients: "1 scoop whey, 1 huevo, 30g avena, plátano" },
  { name: "Chips de batata al horno", category: "all", meal_type: "snack", calories: 160, protein_g: 2, carbs_g: 35, fat_g: 2, ingredients: "200g batata en rodajas, aceite spray, sal" },
  { name: "Bolitas energéticas de avena y cacao", category: "surplus", meal_type: "snack", calories: 250, protein_g: 8, carbs_g: 30, fat_g: 12, ingredients: "Avena, mantequilla de maní, cacao, miel, coco" },
  { name: "Palomitas de maíz naturales", category: "deficit", meal_type: "snack", calories: 90, protein_g: 3, carbs_g: 18, fat_g: 1, ingredients: "30g maíz para palomitas, sal" },
  // ═══════════════════ COMIDAS ADICIONALES ═══════════════════
  { name: "Omelette de espinaca con queso feta", category: "maintenance", meal_type: "desayuno", calories: 320, protein_g: 24, carbs_g: 4, fat_g: 24, ingredients: "3 huevos, espinaca, 30g queso feta" },
  { name: "Tazón de acai con proteína", category: "surplus", meal_type: "desayuno", calories: 480, protein_g: 25, carbs_g: 60, fat_g: 14, ingredients: "Açaí, plátano, granola, whey, miel" },
  { name: "Waffles proteicos", category: "surplus", meal_type: "desayuno", calories: 450, protein_g: 30, carbs_g: 50, fat_g: 14, ingredients: "Harina integral, whey, huevos, leche, miel" },
  { name: "Shakshuka (huevos en salsa de tomate)", category: "maintenance", meal_type: "desayuno", calories: 300, protein_g: 18, carbs_g: 18, fat_g: 18, ingredients: "3 huevos, salsa tomate, cebolla, pimiento, especias" },
  { name: "Overnight oats con proteína", category: "maintenance", meal_type: "desayuno", calories: 350, protein_g: 28, carbs_g: 42, fat_g: 8, ingredients: "50g avena, 1 scoop whey, leche, chía, frutos rojos" },
  { name: "Poke bowl de atún", category: "maintenance", meal_type: "almuerzo", calories: 450, protein_g: 35, carbs_g: 48, fat_g: 12, ingredients: "150g atún crudo, arroz, aguacate, pepino, salsa soy, sésamo" },
  { name: "Fajitas de pollo con pimiento", category: "maintenance", meal_type: "cena", calories: 420, protein_g: 35, carbs_g: 32, fat_g: 16, ingredients: "200g pollo, pimientos, cebolla, tortillas, especias" },
  { name: "Albóndigas de pavo en salsa", category: "deficit", meal_type: "cena", calories: 280, protein_g: 32, carbs_g: 12, fat_g: 10, ingredients: "200g pavo molido, salsa tomate, ajo, hierbas" },
  { name: "Curry de pollo con arroz integral", category: "maintenance", meal_type: "almuerzo", calories: 480, protein_g: 35, carbs_g: 52, fat_g: 14, ingredients: "200g pollo, leche de coco light, curry, arroz integral" },
  { name: "Ensalada niçoise", category: "deficit", meal_type: "almuerzo", calories: 300, protein_g: 28, carbs_g: 15, fat_g: 14, ingredients: "Atún, huevo duro, judías verdes, aceitunas, tomate" },
  { name: "Tofu salteado con vegetales y arroz", category: "maintenance", meal_type: "almuerzo", calories: 380, protein_g: 22, carbs_g: 48, fat_g: 12, ingredients: "200g tofu, brócoli, zanahoria, arroz, salsa soy" },
  { name: "Crema de brócoli con pechuga", category: "deficit", meal_type: "cena", calories: 220, protein_g: 30, carbs_g: 14, fat_g: 5, ingredients: "200g brócoli, 120g pollo, cebolla, caldo" },
  { name: "Filete de res con espárragos", category: "maintenance", meal_type: "cena", calories: 380, protein_g: 42, carbs_g: 8, fat_g: 20, ingredients: "200g filete de res, espárragos, aceite de oliva" },
  { name: "Arroz frito con camarones", category: "surplus", meal_type: "cena", calories: 550, protein_g: 30, carbs_g: 62, fat_g: 18, ingredients: "200g camarones, arroz, huevo, vegetales, salsa soy" },
  { name: "Pasta con pesto y pollo", category: "surplus", meal_type: "almuerzo", calories: 620, protein_g: 38, carbs_g: 60, fat_g: 24, ingredients: "180g pollo, 100g pasta, pesto de albahaca, parmesano" },
  { name: "Crêpes de avena con frutas", category: "maintenance", meal_type: "desayuno", calories: 350, protein_g: 18, carbs_g: 48, fat_g: 10, ingredients: "50g avena, 1 huevo, leche, frutas, miel" },
  { name: "Ensalada César con pollo grillado", category: "deficit", meal_type: "almuerzo", calories: 320, protein_g: 35, carbs_g: 12, fat_g: 14, ingredients: "200g pollo, lechuga romana, aderezo light, crutones integrales" },
  { name: "Milanesa de pollo al horno con ensalada", category: "maintenance", meal_type: "cena", calories: 400, protein_g: 38, carbs_g: 28, fat_g: 16, ingredients: "200g pechuga empanizada al horno, ensalada mixta" },
  { name: "Tacos de carne molida con guacamole", category: "surplus", meal_type: "cena", calories: 600, protein_g: 32, carbs_g: 42, fat_g: 32, ingredients: "200g carne molida, tortillas, guacamole, queso, salsa" },
  { name: "Pad Thai con pollo", category: "surplus", meal_type: "almuerzo", calories: 580, protein_g: 30, carbs_g: 65, fat_g: 22, ingredients: "150g pollo, fideos de arroz, huevo, maní, brotes de soja" },
  { name: "Gazpacho con pan integral", category: "deficit", meal_type: "cena", calories: 180, protein_g: 6, carbs_g: 28, fat_g: 5, ingredients: "Tomate, pepino, pimiento, ajo, aceite oliva, pan" },
  { name: "Hamburguesa de lentejas", category: "maintenance", meal_type: "cena", calories: 380, protein_g: 18, carbs_g: 48, fat_g: 12, ingredients: "Lentejas, avena, cebolla, pan integral, ensalada" },
  { name: "Risotto de champiñones con pollo", category: "surplus", meal_type: "cena", calories: 580, protein_g: 35, carbs_g: 62, fat_g: 18, ingredients: "150g pollo, arroz arborio, champiñones, caldo, parmesano" },
  { name: "Empanadas de atún al horno", category: "maintenance", meal_type: "snack", calories: 280, protein_g: 18, carbs_g: 30, fat_g: 10, ingredients: "Masa integral, atún, cebolla, pimiento, huevo" },
  { name: "Sándwich de pollo con aguacate", category: "surplus", meal_type: "almuerzo", calories: 520, protein_g: 35, carbs_g: 40, fat_g: 24, ingredients: "Pan integral, 150g pollo, aguacate, lechuga, tomate" },
  { name: "Brochetas de pollo con vegetales", category: "maintenance", meal_type: "cena", calories: 350, protein_g: 36, carbs_g: 15, fat_g: 16, ingredients: "200g pollo, pimiento, cebolla, calabacín, aceite" },
  { name: "Arepa con pollo y aguacate", category: "surplus", meal_type: "desayuno", calories: 480, protein_g: 30, carbs_g: 45, fat_g: 20, ingredients: "Arepa de maíz, pollo desmenuzado, aguacate" },
  { name: "Tostón con carne mechada", category: "surplus", meal_type: "almuerzo", calories: 550, protein_g: 32, carbs_g: 50, fat_g: 22, ingredients: "Plátano verde frito, carne mechada, ensalada" },
];
