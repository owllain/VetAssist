// Body Condition Score (BCS) data for dogs and cats
// Based on Purina Body Condition System (9-point scale)

export interface BCSLevel {
  score: number;
  title: string;
  description: string;
  recommendations: string[];
  petType: 'perro' | 'gato' | 'ambos';
}

export const DOG_BCS_LEVELS: BCSLevel[] = [
  {
    score: 1,
    title: 'Extremadamente delgado',
    description:
      'Costillas visibles a distancia, sin grasa palpable, pérdida evidente de masa muscular, huesos de la columna y la pelvis muy prominentes.',
    recommendations: [
      'Aumentar cantidad de alimento gradualmente',
      'Considerar evaluación veterinaria para descartar enfermedad',
      'Proporcionar alimento de mayor densidad energética',
    ],
    petType: 'perro',
  },
  {
    score: 2,
    title: 'Delgado',
    description:
      'Costillas fácilmente visibles, mínima masa muscular, columna y pelvis óseas obvias con evidencia de otros puntos óseos. Cintura abdominal mínima, sin grasa palpable.',
    recommendations: [
      'Aumentar raciones gradualmente',
      'Evaluar problemas de salud subyacentes',
      'Monitorear ganancia de peso',
    ],
    petType: 'perro',
  },
  {
    score: 3,
    title: 'Bajo peso',
    description:
      'Costillas fácilmente palpables con mínima cobertura de grasa, cintura ósea visible, pequeña masa abdominal, cintura visible detrás de las costillas.',
    recommendations: [
      'Aumentar cantidad de comida moderadamente',
      'Suministrar 2-3 porciones diarias',
      'Proporcionar alimentos ricos en proteína',
    ],
    petType: 'perro',
  },
  {
    score: 4,
    title: 'Ligeramente bajo peso',
    description:
      'Costillas palpables con mínima cobertura de grasa, cintura visible desde arriba, pequeña depresión abdominal visible, definición muscular evidente.',
    recommendations: [
      'Aumentar ligeramente la porción',
      'Mantener actividad física moderada',
      'Monitorear peso regularmente',
    ],
    petType: 'perro',
  },
  {
    score: 5,
    title: 'Condición corporal ideal',
    description:
      'Costillas palpables sin exceso de grasa, cintura visible desde arriba, abdomen tucked up desde el lado, proporcionado y muscular.',
    recommendations: [
      'Mantener el actual nivel de alimentación',
      'Continuar con ejercicio regular',
      'Realizar evaluaciones mensuales de peso',
    ],
    petType: 'perro',
  },
  {
    score: 6,
    title: 'Ligeramente sobrepeso',
    description:
      'Costillas palpables con ligera cobertura de grasa, cintura abdominal mínima pero no obvia, depresión abdominal mínima pero visible, ligera acumulación de grasa.',
    recommendations: [
      'Reducir porción en 10-20%',
      'Aumentar actividad física',
      'Cambiar a alimento de control de peso si es necesario',
    ],
    petType: 'perro',
  },
  {
    score: 7,
    title: 'Sobrepeso',
    description:
      'Costillas no fácilmente palpables con cobertura moderada de grasa, cintura no obvia, depresión abdominal ausente, notable redondeamiento abdominal, acumulación de grasa moderada.',
    recommendations: [
      'Reducir calorías en 20-30%',
      'Implementar programa de ejercicio regular',
      'Usar alimento terapéutico para control de peso',
      'Monitorear progreso mensualmente',
    ],
    petType: 'perro',
  },
  {
    score: 8,
    title: 'Obeso',
    description:
      'Costillas no palpables bajo exceso de grasa, cintura ausente, depresión abdominal ausente, marcada acumulación de grasa sobre lumbares y base de cola.',
    recommendations: [
      'Consultar con veterinario para plan de pérdida de peso',
      'Reducir calorías en 25-30% bajo supervisión',
      'Aumentar ejercicio gradualmente',
      'Alimentación controlada, no ad libitum',
    ],
    petType: 'perro',
  },
  {
    score: 9,
    title: 'Severamente obeso',
    description:
      'Costillas no palpables bajo heavy grasa cover, cintura ausente, depresión abdominal ausente, acumulación masiva de grasa sobre tórax, columna y base de cola.',
    recommendations: [
      'Evaluación veterinaria inmediata',
      'Programa formal de pérdida de peso supervisado',
      'Considerar dieta terapéutica prescrita',
      'Ejercicio moderado adaptado a capacidad',
    ],
    petType: 'perro',
  },
];

export const CAT_BCS_LEVELS: BCSLevel[] = [
  {
    score: 1,
    title: 'Extremadamente delgado',
    description:
      'Costillas, columna vertebral, pelvis y huesos pélvicos todos visibles a distancia. Pérdida obvia de masa muscular. Sin grasa palpable en ninguna parte del cuerpo.',
    recommendations: [
      'Aumentar calorías diarias',
      'Considerar alimento de mayor densidad energética',
      'Evaluación veterinaria para descartar enfermedad',
    ],
    petType: 'gato',
  },
  {
    score: 2,
    title: 'Delgado',
    description:
      'Costillas, columna vertebral y huesos pélvicos fácilmente visibles. Evidencia de otros puntos óseos prominentes. Sin grasa palpable.',
    recommendations: [
      'Aumentar cantidad de comida',
      'Evaluar condiciones de salud',
      'Monitorear ganancia de peso',
    ],
    petType: 'gato',
  },
  {
    score: 3,
    title: 'Bajo peso',
    description:
      'Costillas fácilmente palpables y visibles con mínima grasa. Huesos pélvicos óseos visibles con mínima grasa. Cintura visible desde arriba y depresión abdominal obvias.',
    recommendations: [
      'Aumentar porciones moderadamente',
      'Proporcionar múltiples comidas al día',
      'Usar alimentos palatables y nutritivos',
    ],
    petType: 'gato',
  },
  {
    score: 4,
    title: 'Ligeramente bajo peso',
    description:
      'Costillas fácilmente palpables con mínima cobertura de grasa. Huesos pélvicos óseos pero no visibles. Cintura visible desde arriba y depresión abdominal clara.',
    recommendations: [
      'Aumentar ligeramente la porción',
      'Mantener múltiples comidas pequeñas',
      'Monitorear peso regularmente',
    ],
    petType: 'gato',
  },
  {
    score: 5,
    title: 'Condición corporal ideal',
    description:
      'Costillas palpables sin exceso de grasa. Cintura visible desde arriba y depresión abdominal evidente. Proporcionado y bien musculado.',
    recommendations: [
      'Mantener actual nivel de alimentación',
      'Continuar con actividad de juego regular',
      'Evaluaciones mensuales de peso',
    ],
    petType: 'gato',
  },
  {
    score: 6,
    title: 'Ligeramente sobrepeso',
    description:
      'Costillas palpables con ligera cobertura de grasa. Cintura visible desde arriba pero no prominente. Depresión abdominal mínima. Ligera acumulación de grasa en abdomen.',
    recommendations: [
      'Reducir porción en 10%',
      'Aumentar tiempo de juego',
      'Cambiar a alimento con menos calorías',
    ],
    petType: 'gato',
  },
  {
    score: 7,
    title: 'Sobrepeso',
    description:
      'Costillas no fácilmente palpables con cobertura moderada de grasa. Cintura no visible desde arriba pero evidente desde el lado. Depresión abdominal ausente. Acumulación notable de grasa.',
    recommendations: [
      'Reducir calorías en 15-20%',
      'Programa de juego interactivo diario',
      'Cambiar a alimento de control de peso',
      'Monitoreo mensual de peso',
    ],
    petType: 'gato',
  },
  {
    score: 8,
    title: 'Obeso',
    description:
      'Costillas no palpables bajo grasa. Cintura ausente. Depresión abdominal ausente. Grasa evidente sobre lumbares y base de cola. Grosor abdominal.',
    recommendations: [
      'Consultar veterinario para plan de control de peso',
      'Reducir calorías en 20-25% bajo supervisión',
      'Alimento terapéutico para gatos con sobrepeso',
      'Aumentar actividad gradualmente',
    ],
    petType: 'gato',
  },
  {
    score: 9,
    title: 'Severamente obeso',
    description:
      'Costillas no palpables bajo heavy grasa. Cintura ausente. Depresión abdominal ausente. Acumulación masiva de grasa. Distensión abdominal evidente sin depresión abdominal.',
    recommendations: [
      'Evaluación veterinaria inmediata',
      'Programa formal de pérdida de peso',
      'Dieta terapéutica prescrita',
      'Monitoreo veterinario regular',
    ],
    petType: 'gato',
  },
];

/**
 * Get BCS levels for a specific pet type
 */
export function getBCSLevels(petType: 'perro' | 'gato'): BCSLevel[] {
  if (petType === 'gato') {
    return CAT_BCS_LEVELS;
  }
  return DOG_BCS_LEVELS;
}

/**
 * Get specific BCS level
 */
export function getBCSLevel(petType: 'perro' | 'gato', score: number): BCSLevel | undefined {
  const levels = getBCSLevels(petType);
  return levels.find((level) => level.score === score);
}

/**
 * Get BCS recommendations for a specific score
 */
export function getBCSRecommendations(petType: 'perro' | 'gato', score: number): string[] {
  const level = getBCSLevel(petType, score);
  return level?.recommendations || [];
}
