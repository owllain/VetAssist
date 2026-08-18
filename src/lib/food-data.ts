// Food calculation data for dogs and cats based on RER formula and veterinary MER guidelines
// RER (Resting Energy Requirement) = 70 × (weight_kg ^ 0.75)
// MER (Metabolizable Energy Requirement) = RER × multiplier (based on clinical guidelines)

export type PetType = 'perro' | 'gato';
export type WeightUnit = 'kg' | 'lb';
export type FoodMeasureUnit = 'gramos' | 'onzas' | 'tazas';
export type DogCondition = 'entero' | 'castrado' | 'obeso';
export type DogAge = 'adulto' | 'cachorro_menor_4m' | 'cachorro_mayor_4m';
export type CatCondition = 'entero' | 'castrado' | 'obeso';
export type CatAge = 'adulto' | 'gatito';

export interface FoodGuideline {
  petType: PetType;
  weightRange: { min: number; max: number };
  dailyGrams: { min: number; max: number };
  condition: string;
}

export interface FoodCalculationResult {
  petType: PetType;
  weight: number;
  weightUnit: WeightUnit;
  weightKg: number;
  rer: number;
  mer: number;
  dailyGrams: { min: number; max: number; recommended: number };
  dailyOunces: number;
  dailyCups: number;
  perMealGrams: { min: number; max: number; recommended: number };
  mealsPerDay: number;
  condition: string;
  merMultiplier: number;
  dailyWaterMl: number;
  mealSuggestions: string;
}

export interface FoodPortionWithProduct {
  kcalPerUnit: number;
  unitType: 'taza' | 'lata' | 'kg' | 'manual';
  unitName: string;
  portionPerDay: number;
  portionPerMeal: number;
  kcalPerDay: number;
  mealsPerDay: number;
}

// Constants
const KCAL_PER_GRAM = 3.5; // Average dry food ~3500 kcal/kg = 3.5 kcal/g
const GRAMS_PER_OUNCE = 28.35;
const GRAMS_PER_CUP = 105; // 1 cup ≈ 100-110g for dry kibble, using 105g

/**
 * Calculate RER (Resting Energy Requirement) in kcal/día
 * Formula: RER = 70 × (weight_kg ^ 0.75)
 */
function calculateRER(weightKg: number): number {
  return Math.round(70 * Math.pow(weightKg, 0.75));
}

/**
 * Get MER (Metabolizable Energy Requirement) multiplier based on veterinary guidelines
 * 
 * Perros adultos sanos:
 * - Enteros: 1.8 × RER
 * - Castrados: 1.6 × RER
 * - Propensión a obesidad: 1.4 × RER
 * 
 * Cachorros sanos:
 * - <4 meses: 3 × RER
 * - >4 meses: 2 × RER
 * 
 * Gatos adultos sanos:
 * - Enteros: 1.4 × RER
 * - Castrados: 1.2 × RER
 * - Propensión a obesidad: 1 × RER
 * 
 * Gatitos sanos:
 * - 2.5 × RER
 */
function getMERMultiplier(
  petType: PetType,
  dogCondition?: DogCondition,
  dogAge?: DogAge,
  catCondition?: CatCondition,
  catAge?: CatAge
): { multiplier: number; description: string } {
  if (petType === 'perro') {
    // Handle dogs by age first
    if (dogAge === 'cachorro_menor_4m') {
      return { multiplier: 3.0, description: 'Cachorro < 4 meses' };
    }
    if (dogAge === 'cachorro_mayor_4m') {
      return { multiplier: 2.0, description: 'Cachorro > 4 meses' };
    }

    // Handle adult dogs by condition
    switch (dogCondition) {
      case 'entero':
        return { multiplier: 1.8, description: 'Perro adulto entero' };
      case 'castrado':
        return { multiplier: 1.6, description: 'Perro adulto castrado' };
      case 'obeso':
        return { multiplier: 1.4, description: 'Perro con propensión a obesidad' };
      default:
        return { multiplier: 1.6, description: 'Perro adulto castrado' };
    }
  }

  // Handle cats
  if (catAge === 'gatito') {
    return { multiplier: 2.5, description: 'Gatito sano' };
  }

  // Handle adult cats by condition
  switch (catCondition) {
    case 'entero':
      return { multiplier: 1.4, description: 'Gato adulto entero' };
    case 'castrado':
      return { multiplier: 1.2, description: 'Gato adulto castrado' };
    case 'obeso':
      return { multiplier: 1.0, description: 'Gato con propensión a obesidad' };
    default:
      return { multiplier: 1.2, description: 'Gato adulto castrado' };
  }
}

/**
 * Convert weight to kg from given unit
 */
function toKg(weight: number, unit: WeightUnit): number {
  if (unit === 'lb') {
    return weight * 0.453592;
  }
  return weight;
}

/**
 * Calculate daily water requirement in mL
 * Formula: 1 mL of water per 1 kcal of MER
 */
export function calculateDailyWater(mer: number): number {
  return mer; // 1 mL water per 1 kcal
}

/**
 * Generate meal suggestions based on meals per day
 */
function generateMealSuggestions(mealsPerDay: number): string {
  if (mealsPerDay === 1) return 'Una sola toma al día';
  if (mealsPerDay === 2) return 'Dividido en 2 tomas (mañana y noche)';
  if (mealsPerDay === 3) return 'Dividido en 3 tomas (mañana, tarde, noche)';
  if (mealsPerDay === 4) return 'Dividido en 4 tomas (cada 6 horas)';
  return `Dividido en ${mealsPerDay} tomas`;
}

/**
 * Calculate food amount for a pet based on veterinary MER formula
 *
 * RER = 70 × (weight_kg ^ 0.75)
 * MER = RER × multiplier (based on age, condition, and species)
 * Grams = MER / kcal_per_gram
 */
export function calculateFoodAmount(
  petType: PetType,
  weight: number,
  weightUnit: WeightUnit,
  mealsPerDay: number,
  dogCondition?: DogCondition,
  dogAge?: DogAge,
  catCondition?: CatCondition,
  catAge?: CatAge
): FoodCalculationResult {
  const weightKg = toKg(weight, weightUnit);
  const rer = calculateRER(weightKg);
  const { multiplier: merMultiplier, description } = getMERMultiplier(
    petType,
    dogCondition,
    dogAge,
    catCondition,
    catAge
  );
  const mer = Math.round(rer * merMultiplier);

  const recommendedGrams = Math.round(mer / KCAL_PER_GRAM);
  const minGrams = Math.round(recommendedGrams * 0.85);
  const maxGrams = Math.round(recommendedGrams * 1.15);

  const dailyOunces = Math.round((recommendedGrams / GRAMS_PER_OUNCE) * 10) / 10;
  const dailyCups = Math.round((recommendedGrams / GRAMS_PER_CUP) * 10) / 10;

  const safeMealsPerDay = Math.max(1, mealsPerDay);
  const dailyWaterMl = calculateDailyWater(mer);
  const mealSuggestions = generateMealSuggestions(safeMealsPerDay);

  return {
    petType,
    weight,
    weightUnit,
    weightKg: Math.round(weightKg * 100) / 100,
    rer,
    mer,
    dailyGrams: {
      min: minGrams,
      max: maxGrams,
      recommended: recommendedGrams,
    },
    dailyOunces,
    dailyCups,
    perMealGrams: {
      min: Math.round(minGrams / safeMealsPerDay),
      max: Math.round(maxGrams / safeMealsPerDay),
      recommended: Math.round(recommendedGrams / safeMealsPerDay),
    },
    mealsPerDay: safeMealsPerDay,
    condition: description,
    merMultiplier,
    dailyWaterMl,
    mealSuggestions,
  };
}

/**
 * Calculate food portion based on specific product energy content
 */
export function calculateFoodPortion(
  mer: number,
  kcalPerUnit: number,
  unitName: string = 'taza',
  mealsPerDay: number = 2
): FoodPortionWithProduct {
  const portionPerDay = Math.round((mer / kcalPerUnit) * 100) / 100;
  const portionPerMeal = Math.round((portionPerDay / mealsPerDay) * 100) / 100;
  const kcalPerDay = Math.round(portionPerDay * kcalPerUnit);

  return {
    kcalPerUnit,
    unitType: unitName as any,
    unitName,
    portionPerDay,
    portionPerMeal,
    kcalPerDay,
    mealsPerDay,
  };
}
