import { NextResponse } from 'next/server';
import { calculateFoodAmount, type PetType, type WeightUnit, type ActivityLevel } from '@/lib/food-data';

interface FoodCalcRequest {
  petType: PetType;
  weight: number;
  weightUnit: WeightUnit;
  mealsPerDay: number;
  activity: ActivityLevel;
}

export async function POST(request: Request) {
  try {
    const body: FoodCalcRequest = await request.json();
    const { petType, weight, weightUnit, mealsPerDay, activity } = body;

    // Validate required fields
    if (!petType || weight === undefined || !weightUnit || !mealsPerDay || !activity) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: petType, weight, weightUnit, mealsPerDay, activity' },
        { status: 400 }
      );
    }

    // Validate pet type
    if (petType !== 'perro' && petType !== 'gato') {
      return NextResponse.json(
        { error: 'petType debe ser "perro" o "gato"' },
        { status: 400 }
      );
    }

    // Validate weight
    if (typeof weight !== 'number' || weight <= 0) {
      return NextResponse.json(
        { error: 'El peso debe ser un número mayor a 0' },
        { status: 400 }
      );
    }

    // Validate weight unit
    if (weightUnit !== 'kg' && weightUnit !== 'lb') {
      return NextResponse.json(
        { error: 'weightUnit debe ser "kg" o "lb"' },
        { status: 400 }
      );
    }

    // Validate meals per day
    if (typeof mealsPerDay !== 'number' || mealsPerDay < 1 || mealsPerDay > 6) {
      return NextResponse.json(
        { error: 'mealsPerDay debe ser un número entre 1 y 6' },
        { status: 400 }
      );
    }

    // Validate activity level
    const validActivities: ActivityLevel[] = ['bajo', 'normal', 'alto'];
    if (!validActivities.includes(activity)) {
      return NextResponse.json(
        { error: 'activity debe ser "bajo", "normal" o "alto"' },
        { status: 400 }
      );
    }

    const result = calculateFoodAmount(petType, weight, weightUnit, mealsPerDay, activity);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 400 }
    );
  }
}
