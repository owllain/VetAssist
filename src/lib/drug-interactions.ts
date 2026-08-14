export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'alta' | 'media' | 'baja';
  description: string;
  recommendation: string;
}

export const drugInteractions: DrugInteraction[] = [
  {
    drug1: 'meloxicam',
    drug2: 'prednisona',
    severity: 'alta',
    description: 'Riesgo de ulceración gastrointestinal severa y sangrado.',
    recommendation: 'Evitar la combinación. Si es necesario, usar gastroprotección (omeprazol/sucralfato) y monitorear heces.',
  },
  {
    drug1: 'meloxicam',
    drug2: 'dexametasona',
    severity: 'alta',
    description: 'Aumenta significativamente el riesgo de efectos gastrointestinales y nefrotoxicidad.',
    recommendation: 'No combinar AINEs con corticoesteroides. Si debe usarse, máx. 1-2 días con protección gástrica.',
  },
  {
    drug1: 'ivermectina',
    drug2: 'spinosad',
    severity: 'alta',
    description: 'Aumenta riesgo de toxicidad neurológica (temblores, ataxia, convulsiones).',
    recommendation: 'No administrar ivermectina con spinosad. Esperar al menos 1 mes entre tratamientos.',
  },
  {
    drug1: 'ketamina',
    drug2: 'tramadol',
    severity: 'media',
    description: 'Puede potenciar depresión respiratoria y effects sedantes.',
    recommendation: 'Reducir dosis de tramadol en un 25-50% cuando se combina con ketamina. Monitorear respiración.',
  },
  {
    drug1: 'amoxicilina-clavulanato',
    drug2: 'metronidazol',
    severity: 'baja',
    description: 'Interacción farmacodinámica leve. Amplio espectro antibacterial.',
    recommendation: 'Combinación aceptable y frecuentemente usada. Monitorear por diarrea por alteración de flora.',
  },
  {
    drug1: 'acepromazina',
    drug2: 'tramadol',
    severity: 'media',
    description: 'Efecto sedante aditivo. Puede causar hipotensión excesiva.',
    recommendation: 'Reducir dosis de acepromazina si se combina con tramadol. Monitorear presión arterial.',
  },
  {
    drug1: 'prednisona',
    drug2: 'furosemida',
    severity: 'media',
    description: 'Riesgo aumentado de hipokalemia y pérdida excesiva de potasio.',
    recommendation: 'Monitorear electrolitos. Suplementar con potasio si es necesario.',
  },
];

export function checkInteraction(drug1Id: string, drug2Id: string): DrugInteraction | null {
  return drugInteractions.find(
    (i) =>
      (i.drug1 === drug1Id && i.drug2 === drug2Id) ||
      (i.drug1 === drug2Id && i.drug2 === drug1Id)
  ) || null;
}

export function getInteractionsForDrug(drugId: string): DrugInteraction[] {
  return drugInteractions.filter(
    (i) => i.drug1 === drugId || i.drug2 === drugId
  );
}

export const severityConfig = {
  alta: { color: 'oklch(0.6 0.2 25)', bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-200 dark:border-red-800/40', label: '⚠️ Alta' },
  media: { color: 'oklch(0.7 0.18 75)', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800/40', label: '⚡ Media' },
  baja: { color: 'oklch(0.65 0.2 145)', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800/40', label: 'ℹ️ Baja' },
} as const;
