// Food calculation data for dogs and cats based on RER formula
// RER (Resting Energy Requirement) = 70 × (weight_kg ^ 0.75)
// DER (Daily Energy Requirement) = RER × multiplier

export type PetType = 'perro' | 'gato';
export type WeightUnit = 'kg' | 'lb';
export type FoodMeasureUnit = 'gramos' | 'onzas' | 'tazas';
export type ActivityLevel = 'bajo' | 'normal' | 'alto';

export interface FoodGuideline {
  petType: PetType;
  weightRange: { min: number; max: number };
  dailyGrams: { min: number; max: number };
  activity: ActivityLevel;
}

export interface FoodCalculationResult {
  petType: PetType;
  weight: number;
  weightUnit: WeightUnit;
  weightKg: number;
  dailyGrams: { min: number; max: number; recommended: number };
  dailyOunces: number;
  dailyCups: number;
  perMealGrams: { min: number; max: number; recommended: number };
  mealsPerDay: number;
  activity: string;
}

// Constants
const KCAL_PER_GRAM = 3.5; // Average dry food ~3500 kcal/kg = 3.5 kcal/g
const GRAMS_PER_OUNCE = 28.35;
const GRAMS_PER_CUP = 105; // 1 cup ≈ 100-110g for dry kibble, using 105g

/**
 * Calculate RER (Resting Energy Requirement) in kcal
 * Formula: RER = 70 × (weight_kg ^ 0.75)
 */
function calculateRER(weightKg: number): number {
  return 70 * Math.pow(weightKg, 0.75);
}

/**
 * Get DER multiplier based on pet type and activity level
 */
function getDERMultiplier(petType: PetType, activity: ActivityLevel): number {
  if (petType === 'gato') {
    // For cats, we use neutered as baseline with activity adjustment
    // 1.2 (neutered), 1.4 (intact), 0.8 (weight loss)
    switch (activity) {
      case 'bajo':
        return 1.0; // Sedentary/weight maintenance
      case 'normal':
        return 1.2; // Typical neutered cat
      case 'alto':
        return 1.4; // Active or intact cat
    }
  }

  // For dogs
  switch (activity) {
    case 'bajo':
      return 1.2;
    case 'normal':
      return 1.6;
    case 'alto':
      return 2.0;
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
 * Get activity level display name in Spanish
 */
function getActivityLabel(activity: ActivityLevel, petType: PetType): string {
  if (petType === 'gato') {
    switch (activity) {
      case 'bajo':
        return 'Bajo (sedentario / control de peso)';
      case 'normal':
        return 'Normal (castrado, actividad moderada)';
      case 'alto':
        return 'Alto (activo / entero)';
    }
  }
  switch (activity) {
    case 'bajo':
      return 'Bajo (sedentario)';
    case 'normal':
      return 'Normal (actividad moderada)';
    case 'alto':
      return 'Alto (muy activo / trabajo)';
  }
}

/**
 * Calculate food amount for a pet based on RER formula
 *
 * RER = 70 × (weight_kg ^ 0.75)
 * DER = RER × activity_multiplier
 * Grams = DER / kcal_per_gram
 */
export function calculateFoodAmount(
  petType: PetType,
  weight: number,
  weightUnit: WeightUnit,
  mealsPerDay: number,
  activity: ActivityLevel
): FoodCalculationResult {
  const weightKg = toKg(weight, weightUnit);
  const rer = calculateRER(weightKg);
  const derMultiplier = getDERMultiplier(petType, activity);
  const der = rer * derMultiplier;

  const recommendedGrams = Math.round(der / KCAL_PER_GRAM);
  const minGrams = Math.round(recommendedGrams * 0.85);
  const maxGrams = Math.round(recommendedGrams * 1.15);

  const dailyOunces = Math.round((recommendedGrams / GRAMS_PER_OUNCE) * 10) / 10;
  const dailyCups = Math.round((recommendedGrams / GRAMS_PER_CUP) * 10) / 10;

  const safeMealsPerDay = Math.max(1, mealsPerDay);

  return {
    petType,
    weight,
    weightUnit,
    weightKg: Math.round(weightKg * 100) / 100,
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
    activity: getActivityLabel(activity, petType),
  };
}
