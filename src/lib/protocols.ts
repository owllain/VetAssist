export interface ProtocolDrug {
  medicationId: string;
  name: string;
  doseNote: string;
  doseMin?: number; // mg/kg or mcg/kg
  doseMax?: number; // mg/kg or mcg/kg
  unit?: string;
  route?: string;
}

export interface Protocol {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  species: ('perro' | 'gato')[];
  drugs: ProtocolDrug[];
  notes: string;
}

export const protocols: Protocol[] = [
  {
    id: 'pre-quirurgico-canino',
    name: 'Pre-quirúrgico Canino',
    description: 'Protocolo estándar de pre-anestesia y analgesia preventiva para caninos',
    icon: '🩺',
    color: 'oklch(0.55 0.15 165)',
    species: ['perro'],
    drugs: [
      {
        medicationId: 'acepromacina',
        name: 'Acepromacina',
        doseNote: '0.02-0.05 mg/kg IM, 30-45 min antes del procedimiento',
        doseMin: 0.02,
        doseMax: 0.05,
        unit: 'mg',
        route: 'IM',
      },
      {
        medicationId: 'atropina',
        name: 'Atropina Sulfato',
        doseNote: '0.02-0.04 mg/kg IM/SC, premedicación anticolinérgica',
        doseMin: 0.02,
        doseMax: 0.04,
        unit: 'mg',
        route: 'IM/SC',
      },
      {
        medicationId: 'meloxicam',
        name: 'Meloxicam',
        doseNote: '0.1 mg/kg SC, analgesia preoperatoria',
        doseMin: 0.1,
        doseMax: 0.1,
        unit: 'mg',
        route: 'SC',
      },
    ],
    notes: 'Ajustar según estado clínico, raza y edad. No usar acepromacina en animales con antecedentes de epilepsia o hipovolemia severa.',
  },
  {
    id: 'pre-quirurgico-felino',
    name: 'Pre-quirúrgico Felino',
    description: 'Protocolo estándar de inducción y premedicación en felinos',
    icon: '🐈',
    color: 'oklch(0.6 0.15 250)',
    species: ['gato'],
    drugs: [
      {
        medicationId: 'ketamina',
        name: 'Ketamina Clorhidrato',
        doseNote: '5-10 mg/kg IM, combinada con benzodiacepina',
        doseMin: 5,
        doseMax: 10,
        unit: 'mg',
        route: 'IM',
      },
      {
        medicationId: 'atropina',
        name: 'Atropina Sulfato',
        doseNote: '0.02-0.04 mg/kg IM/SC, control de bradicardia e hipersecreción',
        doseMin: 0.02,
        doseMax: 0.04,
        unit: 'mg',
        route: 'IM/SC',
      },
    ],
    notes: 'En gatos, siempre asociar ketamina con benzodiacepinas para relajación muscular. Precaución en pacientes con insuficiencia renal o cardiopatía hipertrófica.',
  },
  {
    id: 'desparasitacion-interna-canino',
    name: 'Desparasitación Interna Canino',
    description: 'Protocolo antiparasitario interno estándar de amplio espectro para caninos',
    icon: '🛡️',
    color: 'oklch(0.55 0.18 145)',
    species: ['perro'],
    drugs: [
      {
        medicationId: 'fenbendazol',
        name: 'Fenbendazol',
        doseNote: '50 mg/kg VO cada 24h por 3-5 días consecutivos',
        doseMin: 50,
        doseMax: 50,
        unit: 'mg',
        route: 'PO',
      },
      {
        medicationId: 'ivermectina',
        name: 'Ivermectina',
        doseNote: '0.2-0.3 mg/kg SC/PO dosis única (verificar mutación MDR1)',
        doseMin: 0.2,
        doseMax: 0.3,
        unit: 'mg',
        route: 'SC/PO',
      },
    ],
    notes: 'Verificar susceptibilidad genética MDR1 en razas Collie, Pastor Australiano y cruces. Repetir según el ciclo biológico del parásito diagnosticado.',
  },
  {
    id: 'desparasitacion-interna-felino',
    name: 'Desparasitación Interna Felino',
    description: 'Protocolo antiparasitario interno seguro para felinos',
    icon: '🛡️',
    color: 'oklch(0.6 0.15 130)',
    species: ['gato'],
    drugs: [
      {
        medicationId: 'fenbendazol',
        name: 'Fenbendazol',
        doseNote: '50 mg/kg VO cada 24h por 3-5 días consecutivos',
        doseMin: 50,
        doseMax: 50,
        unit: 'mg',
        route: 'PO',
      },
      {
        medicationId: 'pirantel-pamoato',
        name: 'Pirantel Pamoato',
        doseNote: '5-10 mg/kg PO dosis única para nemátodos',
        doseMin: 5,
        doseMax: 10,
        unit: 'mg',
        route: 'PO',
      },
    ],
    notes: 'No usar ivermectina a dosis altas en gatos por riesgo de neurotoxicidad. Para Toxocara cati, repetir a los 14-21 días.',
  },
  {
    id: 'post-operatorio-analgesia',
    name: 'Post-operatorio — Analgesia Multimodal',
    description: 'Protocolo analgésico post-quirúrgico multimodal para dolor moderado a severo',
    icon: '💊',
    color: 'oklch(0.7 0.15 75)',
    species: ['perro', 'gato'],
    drugs: [
      {
        medicationId: 'meloxicam',
        name: 'Meloxicam',
        doseNote: '0.05-0.1 mg/kg SC/PO una vez al día (en gatos dosis única conservadora)',
        doseMin: 0.05,
        doseMax: 0.1,
        unit: 'mg',
        route: 'SC/PO',
      },
      {
        medicationId: 'tramadol',
        name: 'Tramadol Clorhidrato',
        doseNote: '2-5 mg/kg PO cada 8-12h según nivel de dolor',
        doseMin: 2,
        doseMax: 5,
        unit: 'mg',
        route: 'PO',
      },
    ],
    notes: 'En felinos, limitar el uso de meloxicam a dosis única o con monitoreo renal estricto. Mantener hidratación adecuada antes de administrar AINEs.',
  },
  {
    id: 'tratamiento-dermatologia',
    name: 'Dermatología — Pioderma Superficial',
    description: 'Protocolo antimicrobiano y antiséptico para infecciones dérmicas bacterianas',
    icon: '🧴',
    color: 'oklch(0.6 0.18 15)',
    species: ['perro', 'gato'],
    drugs: [
      {
        medicationId: 'amoxicilina-clavulanato',
        name: 'Amoxicilina + Ácido Clavulánico',
        doseNote: '12.5-25 mg/kg PO cada 12h durante 21 a 28 días',
        doseMin: 12.5,
        doseMax: 25,
        unit: 'mg',
        route: 'PO',
      },
      {
        medicationId: 'clorhexidina',
        name: 'Shampoo Clorhexidina 2-4%',
        doseNote: 'Tópico: Baño terapéutico con tiempo de contacto de 10 min, 2 veces por semana',
        doseMin: undefined,
        doseMax: undefined,
        unit: 'Tópico',
        route: 'Tópica',
      },
    ],
    notes: 'Continuar el tratamiento antibiótico al menos 7 días después de la resolución clínica completa de las lesiones para evitar recidivas y resistencia bacteriana.',
  },
];
