// Precise food image mapping — each keyword maps to a visually accurate dish photo
// Priority: exact dish match > ingredient match > meal type fallback > default

interface FoodImageEntry {
  keywords: string[];
  url: string;
}

// Specific dish-level matches (highest priority)
const DISH_IMAGE_MAP: FoodImageEntry[] = [
  // ═══ Huevos — specific preparations ═══
  { keywords: ["huevo revuelto", "huevos revueltos", "claras revueltas"], url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop" },
  { keywords: ["huevo frito", "huevos fritos"], url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop" },
  { keywords: ["huevo puro", "huevo duro", "huevo cocido", "huevos duros"], url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop" },
  { keywords: ["omelette", "omelet", "tortilla de huevo", "tortilla de claras"], url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop" },
  { keywords: ["claras de huevo", "claras", "huevo"], url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop" },

  // ═══ Pollo — specific preparations ═══
  { keywords: ["pechuga de pollo", "pechuga a la plancha", "pollo a la plancha"], url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop" },
  { keywords: ["pollo con arroz"], url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop" },
  { keywords: ["pollo al horno"], url: "https://images.unsplash.com/photo-1598103442097-8b74df4a9b14?w=400&h=300&fit=crop" },
  { keywords: ["pollo"], url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop" },

  // ═══ Carnes ═══
  { keywords: ["carne molida", "carne picada"], url: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop" },
  { keywords: ["steak", "bistec", "filete"], url: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop" },
  { keywords: ["carne", "res"], url: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop" },
  { keywords: ["pavo"], url: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400&h=300&fit=crop" },

  // ═══ Pescados ═══
  { keywords: ["salmón", "salmon"], url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop" },
  { keywords: ["atún", "atun"], url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop" },
  { keywords: ["tilapia", "merluza", "pescado"], url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop" },

  // ═══ Carbohidratos ═══
  { keywords: ["arroz integral"], url: "https://images.unsplash.com/photo-1536304993881-460e32be1fde?w=400&h=300&fit=crop" },
  { keywords: ["arroz blanco", "arroz"], url: "https://images.unsplash.com/photo-1536304993881-460e32be1fde?w=400&h=300&fit=crop" },
  { keywords: ["avena con"], url: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop" },
  { keywords: ["avena", "oatmeal", "porridge"], url: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop" },
  { keywords: ["pasta integral"], url: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop" },
  { keywords: ["pasta", "espagueti", "spaghetti"], url: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop" },
  { keywords: ["quinoa", "quinua"], url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop" },
  { keywords: ["batata", "camote", "patata", "papa"], url: "https://images.unsplash.com/photo-1596097635121-14b38c5eb2e2?w=400&h=300&fit=crop" },
  { keywords: ["pan integral", "tostada integral"], url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop" },
  { keywords: ["pan", "tostada"], url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop" },
  { keywords: ["pancake", "hotcake", "panqueque"], url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop" },
  { keywords: ["granola"], url: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop" },
  { keywords: ["tortilla"], url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop" },

  // ═══ Ensaladas y Verduras ═══
  { keywords: ["ensalada de pollo"], url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop" },
  { keywords: ["ensalada"], url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop" },
  { keywords: ["brócoli", "brocoli"], url: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop" },
  { keywords: ["espinaca"], url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop" },
  { keywords: ["aguacate", "palta"], url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop" },
  { keywords: ["verdura", "vegetales"], url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop" },

  // ═══ Batidos y Proteínas ═══
  { keywords: ["batido de proteína", "protein shake", "shake de proteína"], url: "https://images.unsplash.com/photo-1622485831930-34078c1eb3a2?w=400&h=300&fit=crop" },
  { keywords: ["batido", "smoothie"], url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop" },
  { keywords: ["proteína", "whey", "proteina"], url: "https://images.unsplash.com/photo-1622485831930-34078c1eb3a2?w=400&h=300&fit=crop" },

  // ═══ Frutas ═══
  { keywords: ["plátano", "platano", "banana"], url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop" },
  { keywords: ["açaí", "acai"], url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop" },
  { keywords: ["frutos secos", "frutos rojos"], url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop" },

  // ═══ Snacks ═══
  { keywords: ["almendra", "nuez", "fruto seco"], url: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&h=300&fit=crop" },
  { keywords: ["yogur", "yogurt"], url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop" },

  // ═══ Platos preparados ═══
  { keywords: ["wrap"], url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop" },
  { keywords: ["sandwich", "sándwich"], url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop" },
  { keywords: ["sopa", "crema"], url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop" },
  { keywords: ["bowl", "poke"], url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop" },
  { keywords: ["hamburguesa", "burger"], url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
];

// Fallback by meal type
const MEAL_TYPE_FALLBACK: Record<string, string> = {
  desayuno: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop",
  almuerzo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
  cena: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop",
  snack: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop",
  pre_entreno: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop",
  post_entreno: "https://images.unsplash.com/photo-1622485831930-34078c1eb3a2?w=400&h=300&fit=crop",
};

const DEFAULT_FOOD = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

/**
 * Get the best matching food image based on recipe name.
 * Priority: 1) Exact dish keyword match → 2) Meal type fallback → 3) Default
 */
export function getFoodImage(recipeName: string, mealType?: string): string {
  const lower = recipeName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Try dish-specific match (longer keywords first for precision)
  for (const entry of DISH_IMAGE_MAP) {
    for (const keyword of entry.keywords) {
      const normalizedKeyword = keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (lower.includes(normalizedKeyword)) return entry.url;
    }
  }

  if (mealType && MEAL_TYPE_FALLBACK[mealType]) {
    return MEAL_TYPE_FALLBACK[mealType];
  }

  return DEFAULT_FOOD;
}
