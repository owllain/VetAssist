import { NextResponse } from 'next/server';
import { calculateFoodAmount, type PetType, type WeightUnit, type DogCondition, type DogAge, type CatCondition, type CatAge } from '@/lib/food-data';

interface FoodCalcRequest {
  petType: PetType;
  weight: number;
  weightUnit: WeightUnit;
  mealsPerDay: number;
  dogCondition?: DogCondition;
  dogAge?: DogAge;
  catCondition?: CatCondition;
  catAge?: CatAge;
}

export async function POST(request: Request) {
  try {
    const body: FoodCalcRequest = await request.json();
    const { petType, weight, weightUnit, mealsPerDay, dogCondition, dogAge, catCondition, catAge } = body;

    // Validate required fields
    if (!petType || weight === undefined || !weightUnit || !mealsPerDay) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: petType, weight, weightUnit, mealsPerDay' },
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

    // Validate dog-specific fields
    if (petType === 'perro') {
      if (dogAge && !['adulto', 'cachorro_menor_4m', 'cachorro_mayor_4m'].includes(dogAge)) {
        return NextResponse.json(
          { error: 'dogAge debe ser "adulto", "cachorro_menor_4m" o "cachorro_mayor_4m"' },
          { status: 400 }
        );
      }
      if (dogCondition && !['entero', 'castrado', 'obeso'].includes(dogCondition)) {
        return NextResponse.json(
          { error: 'dogCondition debe ser "entero", "castrado" u "obeso"' },
          { status: 400 }
        );
      }
    }

    // Validate cat-specific fields
    if (petType === 'gato') {
      if (catAge && !['adulto', 'gatito'].includes(catAge)) {
        return NextResponse.json(
          { error: 'catAge debe ser "adulto" o "gatito"' },
          { status: 400 }
        );
      }
      if (catCondition && !['entero', 'castrado', 'obeso'].includes(catCondition)) {
        return NextResponse.json(
          { error: 'catCondition debe ser "entero", "castrado" u "obeso"' },
          { status: 400 }
        );
      }
    }

    const result = calculateFoodAmount(
      petType,
      weight,
      weightUnit,
      mealsPerDay,
      dogCondition,
      dogAge,
      catCondition,
      catAge
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 400 }
    );
  }
}
