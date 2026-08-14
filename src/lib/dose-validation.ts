export interface DoseValidationResult {
  status: 'normal' | 'caution' | 'warning';
  level: string;
  message: string;
  colorClass: string;
  icon: string;
}

export function validateDose(params: {
  weightKg: number;
  animalType: 'perro' | 'gato';
}): DoseValidationResult {
  const { weightKg, animalType } = params;

  if (animalType === 'perro') {
    if (weightKg < 1) {
      return {
        status: 'warning',
        level: 'very-low',
        message: `Peso inusualmente bajo para un perro (${weightKg} kg). Esto puede corresponder a un neonato o un paciente de tamaño muy reducido. Revise la dosis cuidadosamente.`,
        colorClass: 'border-red-300 bg-red-50 dark:bg-red-950/30',
        icon: 'Warning',
      };
    }
    if (weightKg >= 1 && weightKg <= 3) {
      return {
        status: 'caution',
        level: 'small-breed',
        message: `Peso de raza pequeña (${weightKg} kg). Considere ajustar la dosis al límite inferior del rango y verificar la vía de administración adecuada.`,
        colorClass: 'border-amber-300 bg-amber-50 dark:bg-amber-950/30',
        icon: 'AlertTriangle',
      };
    }
    if (weightKg > 80 && weightKg <= 120) {
      return {
        status: 'caution',
        level: 'large-breed',
        message: `Peso de raza grande (${weightKg} kg). Puede requerir ajuste de dosis, especialmente para medicamentos con metabolismo hepático dependiente del peso.`,
        colorClass: 'border-amber-300 bg-amber-50 dark:bg-amber-950/30',
        icon: 'AlertTriangle',
      };
    }
    if (weightKg > 120) {
      return {
        status: 'warning',
        level: 'very-high',
        message: `Peso inusualmente alto para un perro (${weightKg} kg). Verifique que el peso ingresado sea correcto. Las dosis para pacientes de este tamaño pueden requerir cálculo especializado.`,
        colorClass: 'border-red-300 bg-red-50 dark:bg-red-950/30',
        icon: 'Warning',
      };
    }
    // Normal range: 3-80kg
    return {
      status: 'normal',
      level: 'normal',
      message: `Peso dentro del rango normal para un perro (${weightKg} kg).`,
      colorClass: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30',
      icon: 'CircleInfo',
    };
  }

  // Cat validation
  if (weightKg < 2) {
    return {
      status: 'warning',
      level: 'very-low',
      message: `Peso inusualmente bajo para un gato (${weightKg} kg). Esto puede corresponder a un cachorro o un paciente con condición especial. Revise la dosis con precaución.`,
      colorClass: 'border-red-300 bg-red-50 dark:bg-red-950/30',
      icon: 'Warning',
    };
  }
  if (weightKg >= 2 && weightKg <= 3.5) {
    return {
      status: 'caution',
      level: 'small-cat',
      message: `Gato de tamaño pequeño (${weightKg} kg). Considere ajustar la dosis al límite inferior del rango.`,
      colorClass: 'border-amber-300 bg-amber-50 dark:bg-amber-950/30',
      icon: 'AlertTriangle',
    };
  }
  if (weightKg > 8 && weightKg <= 12) {
    return {
      status: 'caution',
      level: 'overweight-risk',
      message: `Peso elevado para un gato (${weightKg} kg). Considere el posible sobrepeso del paciente al ajustar la dosis.`,
      colorClass: 'border-amber-300 bg-amber-50 dark:bg-amber-950/30',
      icon: 'AlertTriangle',
    };
  }
  if (weightKg > 12) {
    return {
      status: 'warning',
      level: 'very-high',
      message: `Peso inusualmente alto para un gato (${weightKg} kg). Verifique que el peso ingresado sea correcto. La dosificación puede requerir consideraciones especiales.`,
      colorClass: 'border-red-300 bg-red-50 dark:bg-red-950/30',
      icon: 'Warning',
    };
  }
  // Normal range: 3.5-8kg
  return {
    status: 'normal',
    level: 'normal',
    message: `Peso dentro del rango normal para un gato (${weightKg} kg).`,
    colorClass: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30',
    icon: 'CircleInfo',
  };
}
