import { NextResponse } from 'next/server';
import { medications, type AnimalType, type Frequency } from '@/lib/medications';

interface MedicationCalcRequest {
  medicationId: string;
  animalType: AnimalType;
  weight: number;
  weightUnit: 'kg' | 'lb';
  doseValue?: number;
}

const LB_TO_KG = 0.453592;

const frequencyLabels: Record<Frequency, string> = {
  UNA_VEZ: 'Una vez (dosis única)',
  SID: 'Una vez al día',
  BID: 'Cada 12 horas (2 veces al día)',
  TID: 'Cada 8 horas (3 veces al día)',
  CADA_8H: 'Cada 8 horas',
  CADA_12H: 'Cada 12 horas',
  CADA_24H: 'Cada 24 horas',
  POR_3_DIAS: 'Por 3 días consecutivos',
  POR_5_DIAS: 'Por 5 días consecutivos',
};

export async function POST(request: Request) {
  try {
    const body: MedicationCalcRequest = await request.json();
    const { medicationId, animalType, weight, weightUnit, doseValue } = body;

    // Validate required fields
    if (!medicationId || !animalType || !weight || !weightUnit) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: medicationId, animalType, weight, weightUnit' },
        { status: 400 }
      );
    }

    // Validate animal type
    if (animalType !== 'perro' && animalType !== 'gato') {
      return NextResponse.json(
        { error: 'animalType debe ser "perro" o "gato"' },
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

    // Find medication
    const medication = medications.find((m) => m.id === medicationId);

    if (!medication) {
      return NextResponse.json(
        { error: `Medicamento no encontrado: ${medicationId}` },
        { status: 400 }
      );
    }

    // Check if medication is available for the requested species
    if (!medication.species.includes(animalType)) {
      return NextResponse.json(
        { error: `${medication.name} no está indicado para ${animalType === 'perro' ? 'perros' : 'gatos'}` },
        { status: 400 }
      );
    }

    // Convert weight to kg
    const weightKg = weightUnit === 'lb' ? weight * LB_TO_KG : weight;

    // Calculate dose
    let doseMin: number;
    let doseMax: number;
    let doseRecommended: number;

    if (doseValue !== undefined) {
      // Free mode: use the provided dose value directly as mg/kg or whatever the unit is
      doseMin = Math.round(doseValue * weightKg * 100) / 100;
      doseMax = doseMin;
      doseRecommended = doseMin;
    } else {
      doseMin = Math.round(medication.doseMin * weightKg * 100) / 100;
      doseMax = Math.round(medication.doseMax * weightKg * 100) / 100;
      doseRecommended = Math.round((medication.doseMin + medication.doseMax) / 2 * weightKg * 100) / 100;
    }

    // Map frequency to human-readable labels
    const frequencyLabelsList = medication.frequency.map((f) => frequencyLabels[f] || f);

    return NextResponse.json({
      medication: {
        id: medication.id,
        name: medication.name,
        genericName: medication.genericName,
        category: medication.category,
        brandNames: medication.brandNames || [],
      },
      calculatedDose: {
        min: doseMin,
        max: doseMax,
        recommended: doseRecommended,
        unit: medication.unit,
      },
      weightKg: Math.round(weightKg * 100) / 100,
      routes: medication.route,
      frequency: frequencyLabelsList,
      notes: medication.notes,
    });
  } catch {
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 400 }
    );
  }
}
