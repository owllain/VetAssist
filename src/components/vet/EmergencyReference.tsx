'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Warning, ChevronDown, CircleInfo } from 'reicon-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';

interface EmergencyDrug {
  name: string;
  indication: string;
  dose: string;
  route: string;
  species: { dog: boolean; cat: boolean; dogNote?: string; catNote?: string };
  severity: 'CRÍTICO' | 'IMPORTANTE' | 'SOPORTE';
  notes?: string;
}

const EMERGENCY_DRUGS: EmergencyDrug[] = [
  {
    name: 'Epinefrina',
    indication: 'Anafilaxia',
    dose: '0.01–0.02 mg/kg',
    route: 'IV / IM / IO',
    species: { dog: true, cat: true },
    severity: 'CRÍTICO',
  },
  {
    name: 'Atropina',
    indication: 'Bradicardia',
    dose: '0.02–0.04 mg/kg',
    route: 'IV',
    species: { dog: true, cat: true },
    severity: 'CRÍTICO',
  },
  {
    name: 'Diazepam',
    indication: 'Convulsiones',
    dose: 'Perro: 2–10 mg/kg rectal | Gato: 0.5–1 mg/kg rectal',
    route: 'IV (lento) / Rectal',
    species: { dog: true, cat: true },
    severity: 'CRÍTICO',
  },
  {
    name: 'Lidocaína',
    indication: 'Arritmias ventriculares',
    dose: '2–4 mg/kg',
    route: 'IV lento',
    species: { dog: true, cat: false, catNote: 'NO usar en gato' },
    severity: 'CRÍTICO',
    notes: 'Prohibido en gatos — riesgo de toxicidad cardiaca y neurológica',
  },
  {
    name: 'Dexametasona',
    indication: 'Shock',
    dose: '0.5–2 mg/kg',
    route: 'IV',
    species: { dog: true, cat: true },
    severity: 'IMPORTANTE',
  },
  {
    name: 'Fluidos cristaloides',
    indication: 'Shock hipovolémico',
    dose: '10–20 mL/kg bolo',
    route: 'IV',
    species: { dog: true, cat: true },
    severity: 'CRÍTICO',
  },
  {
    name: 'Naloxona',
    indication: 'Sobredosis de opioides',
    dose: '0.01–0.04 mg/kg',
    route: 'IV',
    species: { dog: true, cat: true },
    severity: 'IMPORTANTE',
  },
  {
    name: 'Dopamina',
    indication: 'Shock cardiogénico',
    dose: '2–5 mcg/kg/min',
    route: 'IV infusión',
    species: { dog: true, cat: false, catNote: 'No indicado' },
    severity: 'SOPORTE',
  },
];

const severityConfig = {
  'CRÍTICO': {
    border: 'border-l-red-500',
    bg: 'bg-red-500/10 dark:bg-red-950/20',
    badge: 'bg-red-500 text-white',
    dot: 'bg-red-500',
    glow: 'shadow-red-500/20',
  },
  'IMPORTANTE': {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/10 dark:bg-amber-950/20',
    badge: 'bg-amber-500 text-white',
    dot: 'bg-amber-500',
    glow: 'shadow-amber-500/20',
  },
  'SOPORTE': {
    border: 'border-l-teal-500',
    bg: 'bg-teal-500/10 dark:bg-teal-950/20',
    badge: 'bg-teal-600 text-white',
    dot: 'bg-teal-500',
    glow: 'shadow-teal-500/20',
  },
} as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function EmergencyReference() {
  const [expandedDrugs, setExpandedDrugs] = useState<Set<string>>(new Set());

  const toggleDrug = (name: string) => {
    setExpandedDrugs((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Warning Banner */}
      <motion.div variants={itemVariants} className="no-print">
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
          <Warning size={20} weight="Fill" className="flex-shrink-0 badge-pulse" />
          <p className="text-sm font-semibold leading-snug">
            SOLO PARA EMERGENCIAS - Verifique siempre con formularios actualizados
          </p>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div variants={itemVariants} className="no-print flex flex-wrap items-center gap-3 px-1">
        <span className="text-xs text-muted-foreground font-medium">Severidad:</span>
        {Object.entries(severityConfig).map(([label, cfg]) => (
          <span key={label} className="flex items-center gap-1.5 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
            <span className="font-medium">{label}</span>
          </span>
        ))}
        <span className="text-xs text-muted-foreground ml-auto hidden sm:inline flex items-center gap-1">
          <CircleInfo size={12} weight="Outline" />
          Haga clic en cada ficha para más detalles
        </span>
      </motion.div>

      {/* Drug Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {EMERGENCY_DRUGS.map((drug, i) => {
          const cfg = severityConfig[drug.severity];
          const isExpanded = expandedDrugs.has(drug.name);

          return (
            <motion.div key={drug.name} variants={itemVariants} style={{ '--i': i } as React.CSSProperties}>
              <Card
                className={`glass-card result-glow border-l-4 ${cfg.border} ${cfg.glow} shadow-sm hover-scale-sm cursor-pointer transition-all duration-200 overflow-hidden`}
                onClick={() => toggleDrug(drug.name)}
              >
                <CardContent className="p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-foreground">{drug.name}</h3>
                        <Badge className={`${cfg.badge} text-[10px] px-1.5 py-0 h-5 font-bold tracking-wide`}>
                          {drug.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">{drug.indication}</p>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 mt-0.5 text-muted-foreground"
                    >
                      <ChevronDown size={16} weight="Bold" />
                    </motion.div>
                  </div>

                  {/* Dose info always visible */}
                  <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{drug.dose}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-mono">
                      {drug.route}
                    </Badge>
                  </div>

                  {/* Species badges always visible */}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        drug.species.dog
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      }`}
                    >
                      <span>Perro</span>
                      <span>{drug.species.dog ? '✓' : '✗'}</span>
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        drug.species.cat
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      }`}
                    >
                      <span>Gato</span>
                      <span>{drug.species.cat ? '✓' : '✗'}</span>
                    </span>
                    {!drug.species.cat && drug.species.catNote && (
                      <span className="text-[10px] text-red-500 font-semibold">{drug.species.catNote}</span>
                    )}
                  </div>

                  {/* Expanded details via Collapsible */}
                  <Collapsible open={isExpanded} onOpenChange={() => toggleDrug(drug.name)}>
                    <CollapsibleContent>
                      {drug.notes && (
                        <div className={`mt-3 p-2.5 rounded-lg ${cfg.bg} border border-border/30`}>
                          <div className="flex items-start gap-2">
                            <CircleInfo size={14} weight="Fill" className="flex-shrink-0 mt-0.5 text-red-500" />
                            <p className="text-xs text-muted-foreground leading-relaxed">{drug.notes}</p>
                          </div>
                        </div>
                      )}
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <span className="text-muted-foreground font-medium">Indicación:</span>
                          <p className="font-semibold text-foreground mt-0.5">{drug.indication}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50">
                          <span className="text-muted-foreground font-medium">Vía:</span>
                          <p className="font-semibold text-foreground mt-0.5">{drug.route}</p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom disclaimer */}
      <motion.div variants={itemVariants} className="no-print">
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-muted/50 border border-border/30 text-muted-foreground">
          <CircleInfo size={16} weight="Outline" className="flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            Esta referencia es <strong>exclusivamente de emergencia</strong>. Las dosis pueden variar según
            formulaciones comerciales, condición del paciente y protocolos institucionales.
            Consulte siempre el formulario veterinario oficial y la bibliografía actualizada.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
