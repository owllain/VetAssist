export interface ProtocolDrug {
  medicationId: string;
  name: string;
  doseNote: string;
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
    description: 'Protocolo estándar de pre-anestesia para caninos',
    icon: '🩺',
    color: 'oklch(0.55 0.15 165)',
    species: ['perro'],
    drugs: [
      { medicationId: 'acepromazina', name: 'Acepromazina', doseNote: '0.02-0.05 mg/kg IM, 30-45 min antes' },
      { medicationId: 'atropina', name: 'Atropina', doseNote: '0.02-0.04 mg/kg IM/SC, como premedicación' },
      { medicationId: 'meloxicam', name: 'Meloxicam', doseNote: '0.1 mg/kg SC, analgesia preoperatoria' },
    ],
    notes: 'Ajustar según estado clínico, raza y edad. No usar acepromazina en animales con epilepsia o hipovolemia.',
  },
  {
    id: 'pre-quirurgico-felino',
    name: 'Pre-quirúrgico Felino',
    description: 'Protocolo estándar de pre-anestesia para felinos',
    icon: '🐈',
    color: 'oklch(0.6 0.15 250)',
    species: ['gato'],
    drugs: [
      { medicationId: 'ketamina', name: 'Ketamina', doseNote: '5-10 mg/kg IM, combinada con midazolam' },
      { medicationId: 'atropina', name: 'Atropina', doseNote: '0.02-0.04 mg/kg IM/SC, como premedicación' },
    ],
    notes: 'En gatos, la ketamina se usa frecuentemente como agente inductor. Siempre combinar con benzodiacepina. No usar en gatos con enfermedad renal avanzada.',
  },
  {
    id: 'desparasitacion-interna-canino',
    name: 'Desparasitación Interna Canino',
    description: 'Protocolo antiparasitario interno estándar para caninos',
    icon: '🛡️',
    color: 'oklch(0.55 0.18 145)',
    species: ['perro'],
    drugs: [
      { medicationId: 'fenbendazol', name: 'Fenbendazol', doseNote: '50 mg/kg VO cada 24h por 3-5 días' },
      { medicationId: 'ivermectina', name: 'Ivermectina', doseNote: '0.3 mg/kg PO dosis única (precaución MDR1)' },
    ],
    notes: 'Verificar prueba MDR1 en razas Collie, Pastor Australiano y relacionadas. Repetir según ciclo de vida del parásito.',
  },
  {
    id: 'desparasitacion-interna-felino',
    name: 'Desparasitación Interna Felino',
    description: 'Protocolo antiparasitario interno estándar para felinos',
    icon: '🛡️',
    color: 'oklch(0.6 0.15 130)',
    species: ['gato'],
    drugs: [
      { medicationId: 'fenbendazol', name: 'Fenbendazol', doseNote: '50 mg/kg VO cada 24h por 3-5 días' },
      { medicationId: 'pirantel', name: 'Pirantel Pamoato', doseNote: '5-10 mg/kg PO dosis única' },
    ],
    notes: 'No usar ivermectina en gatos a dosis altas (neurotoxicidad). Para Toxocara, repetir a las 2-3 semanas.',
  },
  {
    id: 'post-operatorio-analgesia',
    name: 'Post-operatorio — Analgesia',
    description: 'Protocolo analgésico post-quirúrgico estándar',
    icon: '💊',
    color: 'oklch(0.7 0.15 75)',
    species: ['perro', 'gato'],
    drugs: [
      { medicationId: 'meloxicam', name: 'Meloxicam', doseNote: '0.1 mg/kg SC/VO el día de cirugía, luego 0.05 mg/kg VO' },
      { medicationId: 'tramadol', name: 'Tramadol', doseNote: '2-5 mg/kg VO cada 8-12h según necesidad' },
    ],
    notes: 'En gatos, meloxicam limitado a dosis única post-operatoria. Evaluar función renal antes y después. Duración máxima de AINEs: 3-5 días.',
  },
  {
    id: 'tratamiento-dermatologia',
    name: 'Dermatología — Pioderma',
    description: 'Protocolo para pioderma superficial bacteriana',
    icon: '🧴',
    color: 'oklch(0.6 0.18 15)',
    species: ['perro', 'gato'],
    drugs: [
      { medicationId: 'amoxicilina-clavulanato', name: 'Amoxicilina-Clavulanato', doseNote: '12.5-25 mg/kg VO cada 12h por 21-28 días' },
      { medicationId: 'clorhexidina', name: 'Clorhexidina 2-4%', doseNote: 'Baño semanal con shampoo de clorhexidina' },
    ],
    notes: 'Si no hay mejoría en 7 días, considerar cultivo y antibiograma. Tratar causa subyacente (alergias, endocrinas). No suspender antes de tiempo para evitar resistencia.',
  },
];
