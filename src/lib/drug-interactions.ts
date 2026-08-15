export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'alta' | 'media' | 'baja';
  description: string;
  recommendation: string;
}

export const drugInteractions: DrugInteraction[] = [
  // ============================================
  // EXISTING 7 INTERACTIONS
  // ============================================
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
    drug1: 'acepromacina',
    drug2: 'tramadol',
    severity: 'media',
    description: 'Efecto sedante aditivo. Puede causar hipotensión excesiva.',
    recommendation: 'Reducir dosis de acepromacina si se combina con tramadol. Monitorear presión arterial.',
  },
  {
    drug1: 'prednisona',
    drug2: 'furosemida',
    severity: 'media',
    description: 'Riesgo aumentado de hipokalemia y pérdida excesiva de potasio.',
    recommendation: 'Monitorear electrolitos. Suplementar con potasio si es necesario.',
  },

  // ============================================
  // NEW INTERACTIONS (14 added)
  // ============================================
  {
    drug1: 'carprofeno',
    drug2: 'prednisona',
    severity: 'alta',
    description: 'La combinación de AINE con corticosteroide aumenta drásticamente el riesgo de úlcera gástrica perforada y sangrado GI severo.',
    recommendation: 'Contraindicada. Usar gastroprotección obligatoria (omeprazol + sucralfato) si no hay alternativa. Limitar a máx. 2-3 días.',
  },
  {
    drug1: 'carprofeno',
    drug2: 'dexametasona',
    severity: 'alta',
    description: 'Riesgo elevado de gastropatía hemorrágica y nefrotoxicidad aditiva por inhibición dual de prostaglandinas protectoras.',
    recommendation: 'No combinar. Seleccionar un solo agente antiinflamatorio. Si es imprescindible, proteger con IBP y monitorear BUN/creatinina.',
  },
  {
    drug1: 'metilprednisolona',
    drug2: 'meloxicam',
    severity: 'alta',
    description: 'Efecto supresor aditivo sobre la síntesis de prostaglandinas gástricas y renales. Alto riesgo de ulceración y falla renal aguda.',
    recommendation: 'Evitar la combinación. En protocolos post-quirúrgicos, espaciar al menos 24h entre ambos medicamentos.',
  },
  {
    drug1: 'enrofloxacina',
    drug2: 'sucralfato',
    severity: 'alta',
    description: 'El sucralfato quelara las fluoroquinolonas en el tracto GI, reduciendo drásticamente su absorción y eficacia antibacteriana.',
    recommendation: 'Administrar con al menos 2 horas de separación. Preferir omeprazol como gastroprotector si se usa enrofloxacina.',
  },
  {
    drug1: 'ivermectina',
    drug2: 'milbemicina-oxima',
    severity: 'alta',
    description: 'Ambos son lactonas macrocíclicas que actúan sobre los canales de cloruro GABA. Riesgo de neurotoxicidad aditiva grave, especialmente en razas MDR1.',
    recommendation: 'No administrar simultáneamente. Esperar al menos 2 semanas entre tratamientos con diferentes lactonas macrocíclicas.',
  },
  {
    drug1: 'xilacina',
    drug2: 'acepromacina',
    severity: 'media',
    description: 'Sedación aditiva con riesgo de bradicardia e hipotensión marcada. Ambos deprimen el SNC por vías diferentes.',
    recommendation: 'Reducir la dosis de cada fármaco en un 30-50% si se combinan. Monitorear frecuencia cardíaca y presión arterial.',
  },
  {
    drug1: 'ketamina',
    drug2: 'acepromacina',
    severity: 'media',
    description: 'Potenciación del efecto sedante y aumento del riesgo de convulsiones en pacientes predispuestos. La acepromacina baja el umbral convulsivo.',
    recommendation: 'No usar en animales con historial de convulsiones. Reducir dosis de ketamina si se premedica con acepromacina.',
  },
  {
    drug1: 'buprenorfina',
    drug2: 'acepromacina',
    severity: 'media',
    description: 'Depresión del SNC aditiva. La acepromacina potencia el efecto sedante de los opioides y puede enmascarar signos de dolor.',
    recommendation: 'Vigilar profundidad de sedación. Ajustar dosis de buprenorfina según la respuesta clínica del paciente.',
  },
  {
    drug1: 'tramadol',
    drug2: 'morfina',
    severity: 'media',
    description: 'Depresión respiratoria y del SNC aditiva. Ambos actúan sobre receptores opioides mu con riesgo de apnea.',
    recommendation: 'No combinar rutinariamente. Si se requiere analgesia multimodal, reducir dosis de cada opioide y monitorear SpO2 y frecuencia respiratoria.',
  },
  {
    drug1: 'doxiciclina',
    drug2: 'sucralfato',
    severity: 'media',
    description: 'El sucralfato forma complejos con las tetraciclinas en el tracto GI, reduciendo significativamente su absorción sistémica.',
    recommendation: 'Separar la administración por al menos 2 horas. Administrar doxiciclina primero y esperar antes de dar sucralfato.',
  },
  {
    drug1: 'omeprazol',
    drug2: 'sucralfato',
    severity: 'media',
    description: 'El omeprazol eleva el pH gástrico, pero el sucralfato requiere un medio ácido (pH < 4) para polimerizarse y adherirse a la mucosa.',
    recommendation: 'Administrar sucralfato 1 hora antes de las comidas y omeprazol 30 min antes, con al menos 2 horas de separación entre ambos.',
  },
  {
    drug1: 'ketamina',
    drug2: 'xilacina',
    severity: 'media',
    description: 'Sedación neuroleptoanalgesia sinérgica con depresión cardiovascular significativa (bradicardia, hipotensión, arritmias).',
    recommendation: 'Usar solo en pacientes estabilizados hemodinámicamente. Tener atipamezol disponible para revertir. Monitorear ECG.',
  },
  {
    drug1: 'enrofloxacina',
    drug2: 'metronidazol',
    severity: 'baja',
    description: 'Ambos tienen potencial neurotóxico a dosis altas (cefalea, convulsiones). La combinación teóricamente aumenta este riesgo.',
    recommendation: 'Combinación aceptable en infecciones mixtas aerobio-anaerobias. No exceder 5 mg/kg de enrofloxacina en gatos.',
  },
  {
    drug1: 'doxiciclina',
    drug2: 'omeprazol',
    severity: 'baja',
    description: 'El omeprazol puede reducir ligeramente la absorción de doxiciclina al elevar el pH gástrico.',
    recommendation: 'Efecto clínico mínimo. Administrar doxiciclina con alimento y omeprazol 30 min antes de las comidas para minimizar la interacción.',
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
  alta: { color: 'oklch(0.6 0.2 25)', bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-200 dark:border-red-800/40', label: 'Alta' },
  media: { color: 'oklch(0.7 0.18 75)', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800/40', label: 'Media' },
  baja: { color: 'oklch(0.65 0.2 145)', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800/40', label: 'Baja' },
} as const;
