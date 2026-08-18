// Food brands and products catalog for Costa Rica
// Energy values in kcal per standard measurement (cup, can, etc)

export interface FoodProduct {
  id: string;
  brand: string;
  name: string;
  type: 'seco' | 'húmedo' | 'semihúmedo';
  petType: 'perro' | 'gato' | 'ambos';
  ageGroup: string;
  specialFeatures?: string[];
  // Energy values
  kcalPerCup?: number;
  kcalPerCan?: number; // 369-425g can standard
  kcalPerKg?: number;
  measurementInfo?: string;
}

export const FOOD_CATALOG: FoodProduct[] = [
  // ============ PURINA ============
  {
    id: 'purina-proplan-chicken-rice',
    brand: 'Purina Pro Plan',
    name: 'Adult Chicken & Rice',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 384,
    kcalPerKg: 3647,
  },
  {
    id: 'purina-proplan-en',
    brand: 'Purina Veterinary Diets',
    name: 'EN (Gastroenteric)',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Terapéutica',
    kcalPerCup: 370,
    kcalPerKg: 3500,
  },
  {
    id: 'purina-proplan-nf',
    brand: 'Purina Veterinary Diets',
    name: 'NF (Kidney Function)',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Terapéutica',
    kcalPerCup: 340,
    kcalPerKg: 3220,
  },
  {
    id: 'purina-proplan-om',
    brand: 'Purina Veterinary Diets',
    name: 'OM (Obesity Management)',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Control de peso',
    kcalPerCup: 240,
    kcalPerKg: 2270,
  },
  {
    id: 'purina-proplan-ur',
    brand: 'Purina Veterinary Diets',
    name: 'UR (Urinary)',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Terapéutica',
    kcalPerCup: 330,
    kcalPerKg: 3120,
  },
  {
    id: 'purina-one-adult',
    brand: 'Purina ONE',
    name: 'Adult Chicken',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 395,
    kcalPerKg: 3742,
  },
  {
    id: 'purina-dogchow-adult',
    brand: 'Dog Chow',
    name: 'Adult Chicken',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 360,
    kcalPerKg: 3410,
  },
  {
    id: 'purina-dogchow-cachorro',
    brand: 'Dog Chow',
    name: 'Cachorro Pollo',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Cachorro',
    kcalPerCup: 380,
    kcalPerKg: 3600,
  },
  {
    id: 'purina-friskies-adulto',
    brand: 'Friskies',
    name: 'Adult Chicken & Fish',
    type: 'húmedo',
    petType: 'gato',
    ageGroup: 'Adulto',
    kcalPerCan: 160,
    kcalPerKg: 380,
    measurementInfo: 'Lata 400g',
  },
  {
    id: 'purina-fancyfeast-classic',
    brand: 'Fancy Feast',
    name: 'Classic Collection',
    type: 'húmedo',
    petType: 'gato',
    ageGroup: 'Adulto',
    kcalPerCan: 70,
    kcalPerKg: 350,
    measurementInfo: 'Lata 85g',
  },
  {
    id: 'purina-catchow-adulto',
    brand: 'Cat Chow',
    name: 'Adult Pollo',
    type: 'seco',
    petType: 'gato',
    ageGroup: 'Adulto',
    kcalPerCup: 150,
    kcalPerKg: 3600,
  },

  // ============ HILL'S ============
  {
    id: 'hills-sciencediet-adult',
    brand: "Hill's Science Diet",
    name: 'Adult Chicken',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 370,
    kcalPerKg: 3530,
  },
  {
    id: 'hills-sciencediet-puppy',
    brand: "Hill's Science Diet",
    name: 'Puppy Chicken Meal & Barley',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Cachorro',
    kcalPerCup: 380,
    kcalPerKg: 3600,
  },
  {
    id: 'hills-cd-canine',
    brand: "Hill's Prescription Diet",
    name: 'c/d Multicare (Urinary)',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Terapéutica',
    kcalPerCup: 360,
    kcalPerKg: 3410,
  },
  {
    id: 'hills-kd-canine',
    brand: "Hill's Prescription Diet",
    name: 'k/d (Renal)',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Terapéutica',
    kcalPerCup: 310,
    kcalPerKg: 2940,
  },
  {
    id: 'hills-jd-canine',
    brand: "Hill's Prescription Diet",
    name: 'j/d (Diabetes)',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Terapéutica',
    kcalPerCup: 340,
    kcalPerKg: 3220,
  },
  {
    id: 'hills-id-canine',
    brand: "Hill's Prescription Diet",
    name: 'i/d (Digestive)',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Terapéutica',
    kcalPerCup: 350,
    kcalPerKg: 3310,
  },
  {
    id: 'hills-wd-canine',
    brand: "Hill's Prescription Diet",
    name: 'w/d (Weight Management)',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Control de peso',
    kcalPerCup: 270,
    kcalPerKg: 2560,
  },
  {
    id: 'hills-zd-canine',
    brand: "Hill's Prescription Diet",
    name: 'z/d (Limited Ingredient)',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Terapéutica',
    kcalPerCup: 340,
    kcalPerKg: 3220,
  },
  {
    id: 'hills-sciencediet-kitten',
    brand: "Hill's Science Diet",
    name: 'Kitten Chicken Meal & Barley',
    type: 'seco',
    petType: 'gato',
    ageGroup: 'Gatito',
    kcalPerCup: 150,
    kcalPerKg: 3800,
  },
  {
    id: 'hills-sciencediet-adulto-gato',
    brand: "Hill's Science Diet",
    name: 'Adult Chicken Meal',
    type: 'seco',
    petType: 'gato',
    ageGroup: 'Adulto',
    kcalPerCup: 145,
    kcalPerKg: 3600,
  },
  {
    id: 'hills-cd-felino',
    brand: "Hill's Prescription Diet",
    name: 'c/d Multicare (Urinary Gato)',
    type: 'seco',
    petType: 'gato',
    ageGroup: 'Terapéutica',
    kcalPerCup: 155,
    kcalPerKg: 3850,
  },
  {
    id: 'hills-kd-felino',
    brand: "Hill's Prescription Diet",
    name: 'k/d (Renal Gato)',
    type: 'seco',
    petType: 'gato',
    ageGroup: 'Terapéutica',
    kcalPerCup: 135,
    kcalPerKg: 3350,
  },

  // ============ ROYAL CANIN ============
  {
    id: 'royalcanin-mini-adult',
    brand: 'Royal Canin',
    name: 'Mini Adult',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 340,
    kcalPerKg: 3750,
  },
  {
    id: 'royalcanin-medium-adult',
    brand: 'Royal Canin',
    name: 'Medium Adult',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 340,
    kcalPerKg: 3700,
  },
  {
    id: 'royalcanin-maxi-adult',
    brand: 'Royal Canin',
    name: 'Maxi Adult',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 340,
    kcalPerKg: 3680,
  },
  {
    id: 'royalcanin-renal',
    brand: 'Royal Canin Veterinary',
    name: 'Renal',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Terapéutica',
    kcalPerCup: 300,
    kcalPerKg: 3200,
  },
  {
    id: 'royalcanin-hepatic',
    brand: 'Royal Canin Veterinary',
    name: 'Hepatic',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Terapéutica',
    kcalPerCup: 290,
    kcalPerKg: 3100,
  },
  {
    id: 'royalcanin-urinary-so',
    brand: 'Royal Canin Veterinary',
    name: 'Urinary SO',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Terapéutica',
    kcalPerCup: 310,
    kcalPerKg: 3350,
  },
  {
    id: 'royalcanin-satiety',
    brand: 'Royal Canin Veterinary',
    name: 'Satiety',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Control de peso',
    kcalPerCup: 250,
    kcalPerKg: 2700,
  },
  {
    id: 'royalcanin-feline-adult',
    brand: 'Royal Canin',
    name: 'Feline Adult',
    type: 'seco',
    petType: 'gato',
    ageGroup: 'Adulto',
    kcalPerCup: 155,
    kcalPerKg: 4000,
  },
  {
    id: 'royalcanin-kitten',
    brand: 'Royal Canin',
    name: 'Kitten',
    type: 'seco',
    petType: 'gato',
    ageGroup: 'Gatito',
    kcalPerCup: 160,
    kcalPerKg: 4100,
  },
  {
    id: 'royalcanin-renal-gato',
    brand: 'Royal Canin Veterinary',
    name: 'Renal Feline',
    type: 'seco',
    petType: 'gato',
    ageGroup: 'Terapéutica',
    kcalPerCup: 140,
    kcalPerKg: 3600,
  },

  // ============ EUKANUBA ============
  {
    id: 'eukanuba-puppy',
    brand: 'Eukanuba',
    name: 'Puppy',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Cachorro',
    kcalPerCup: 390,
    kcalPerKg: 3800,
  },
  {
    id: 'eukanuba-adult',
    brand: 'Eukanuba',
    name: 'Adult',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 370,
    kcalPerKg: 3650,
  },
  {
    id: 'eukanuba-senior',
    brand: 'Eukanuba',
    name: 'Senior',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 350,
    kcalPerKg: 3450,
  },

  // ============ DIAMOND / DIAMOND NATURALS ============
  {
    id: 'diamond-naturals-chicken-rice',
    brand: 'Diamond Naturals',
    name: 'Chicken & Rice',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 370,
    kcalPerKg: 3650,
  },
  {
    id: 'diamond-beef-meal',
    brand: 'Diamond',
    name: 'Beef Meal & Rice',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 360,
    kcalPerKg: 3550,
  },

  // ============ KIRKLAND SIGNATURE ============
  {
    id: 'kirkland-superpremium-adult',
    brand: 'Kirkland Signature',
    name: 'Super Premium Adult',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 380,
    kcalPerKg: 3750,
  },
  {
    id: 'kirkland-superpremium-puppy',
    brand: 'Kirkland Signature',
    name: 'Super Premium Puppy',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Cachorro',
    kcalPerCup: 395,
    kcalPerKg: 3850,
  },
  {
    id: 'kirkland-natures-domain',
    brand: 'Kirkland Signature',
    name: "Nature's Domain Lamb & Rice",
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 370,
    kcalPerKg: 3680,
  },

  // ============ TASTE OF THE WILD ============
  {
    id: 'totw-high-prairie',
    brand: 'Taste of the Wild',
    name: 'High Prairie',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 370,
    kcalPerKg: 3680,
  },
  {
    id: 'totw-pacific-stream',
    brand: 'Taste of the Wild',
    name: 'Pacific Stream',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 360,
    kcalPerKg: 3600,
  },

  // ============ PEDIGREE / WHISKAS ============
  {
    id: 'pedigree-adulto',
    brand: 'Pedigree',
    name: 'Adulto Pollo',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Adulto',
    kcalPerCup: 340,
    kcalPerKg: 3400,
  },
  {
    id: 'pedigree-cachorro',
    brand: 'Pedigree',
    name: 'Cachorro Pollo',
    type: 'seco',
    petType: 'perro',
    ageGroup: 'Cachorro',
    kcalPerCup: 360,
    kcalPerKg: 3550,
  },
  {
    id: 'whiskas-adulto',
    brand: 'Whiskas',
    name: 'Adulto Pollo',
    type: 'seco',
    petType: 'gato',
    ageGroup: 'Adulto',
    kcalPerCup: 140,
    kcalPerKg: 3500,
  },
  {
    id: 'whiskas-gatito',
    brand: 'Whiskas',
    name: 'Gatito Pollo',
    type: 'seco',
    petType: 'gato',
    ageGroup: 'Gatito',
    kcalPerCup: 145,
    kcalPerKg: 3600,
  },
];

/**
 * Search products by brand or name
 */
export function searchFoodProducts(query: string): FoodProduct[] {
  const q = query.toLowerCase();
  return FOOD_CATALOG.filter(
    (product) =>
      product.brand.toLowerCase().includes(q) ||
      product.name.toLowerCase().includes(q)
  );
}

/**
 * Get products by pet type
 */
export function getFoodProductsByPetType(petType: 'perro' | 'gato'): FoodProduct[] {
  return FOOD_CATALOG.filter(
    (product) => product.petType === petType || product.petType === 'ambos'
  );
}

/**
 * Get unique brands
 */
export function getUniqueBrands(): string[] {
  const brands = new Set(FOOD_CATALOG.map((p) => p.brand));
  return Array.from(brands).sort();
}

/**
 * Get products by brand
 */
export function getProductsByBrand(brand: string): FoodProduct[] {
  return FOOD_CATALOG.filter((product) => product.brand === brand);
}
