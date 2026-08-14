'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Drop, ChevronDown, CircleInfo } from 'reicon-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CalcResult {
  calculatedDose: {
    min: number;
    max: number;
    recommended: number;
    unit: string;
  };
  weightKg: number;
}

const CONCENTRATION_UNITS = [
  { value: 'mg/mL', label: 'mg/mL' },
  { value: 'mg/tablet', label: 'mg/tableta' },
  { value: 'mcg/mL', label: 'mcg/mL' },
  { value: 'mcg/drop', label: 'mcg/gota' },
] as const;

type ConcentrationUnit = (typeof CONCENTRATION_UNITS)[number]['value'];

function getVolumeUnit(concUnit: ConcentrationUnit): string {
  switch (concUnit) {
    case 'mg/mL':
    case 'mcg/mL':
      return 'mL';
    case 'mg/tablet':
      return 'tabletas';
    case 'mcg/drop':
      return 'gotas';
  }
}

function getDecimalPlaces(concUnit: ConcentrationUnit): number {
  switch (concUnit) {
    case 'mg/tablet':
      return 1;
    default:
      return 2;
  }
}

function needsUnitConversion(doseUnit: string, concUnit: ConcentrationUnit): boolean {
  const doseIsMg = doseUnit.startsWith('mg');
  const doseIsMcg = doseUnit.startsWith('mcg');
  const concIsMg = concUnit.startsWith('mg');
  const concIsMcg = concUnit.startsWith('mcg');
  // If dose is mg but concentration is in mcg, or vice versa, need conversion
  return doseIsMg !== concIsMg;
}

export default function ConcentrationCalculator({ result }: { result: CalcResult }) {
  const [open, setOpen] = useState(false);
  const [concValue, setConcValue] = useState('');
  const [concUnit, setConcUnit] = useState<ConcentrationUnit>('mg/mL');

  const doseUnit = result.calculatedDose.unit.split('/')[0]; // e.g. "mg" or "mcg"

  const volumes = useMemo(() => {
    const val = parseFloat(concValue);
    if (!val || val <= 0) return null;

    let factor = 1;
    if (needsUnitConversion(doseUnit, concUnit)) {
      // dose is mg, conc is mcg → multiply dose by 1000 to get mcg
      // dose is mcg, conc is mg → multiply dose by 0.001 to get mg
      if (doseUnit === 'mg' && concUnit.startsWith('mcg')) {
        factor = 1000;
      } else {
        factor = 0.001;
      }
    }

    const places = getDecimalPlaces(concUnit);
    const volUnit = getVolumeUnit(concUnit);

    return {
      min: (result.calculatedDose.min * factor / val).toFixed(places),
      recommended: (result.calculatedDose.recommended * factor / val).toFixed(places),
      max: (result.calculatedDose.max * factor / val).toFixed(places),
      volUnit,
    };
  }, [concValue, concUnit, result.calculatedDose, doseUnit]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="glass-card rounded-xl overflow-hidden">
        <CollapsibleTrigger className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <Drop size={16} weight="Outline" className="text-primary/70" />
          <span>Calculadora de Concentración</span>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-auto"
          >
            <ChevronDown size={14} weight="Outline" />
          </motion.div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-1 space-y-3">
            {/* Concentration input row */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Ej: 50"
                value={concValue}
                onChange={(e) => setConcValue(e.target.value)}
                className="h-8 text-sm flex-1"
                min="0"
                step="any"
              />
              <Select value={concUnit} onValueChange={(v) => setConcUnit(v as ConcentrationUnit)}>
                <SelectTrigger className="h-8 text-sm w-[130px]" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONCENTRATION_UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Volume results */}
            {volumes && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-3 gap-2"
              >
                <div className="bg-primary/5 rounded-lg p-2 text-center border border-primary/10">
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Mínima</p>
                  <p className="text-lg font-extrabold text-primary mt-0.5">{volumes.min}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{volumes.volUnit}</p>
                </div>
                <div className="bg-accent/10 rounded-lg p-2 text-center border border-accent/20 ring-1 ring-accent/15">
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Recomendada</p>
                  <p className="text-lg font-extrabold text-accent mt-0.5">{volumes.recommended}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{volumes.volUnit}</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-2 text-center border border-primary/10">
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Máxima</p>
                  <p className="text-lg font-extrabold text-primary mt-0.5">{volumes.max}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{volumes.volUnit}</p>
                </div>
              </motion.div>
            )}

            {/* Info note */}
            <p className="text-[10px] text-muted-foreground/70 flex items-start gap-1 leading-tight">
              <CircleInfo size={11} weight="Outline" className="mt-0.5 flex-shrink-0" />
              <span>La concentración depende del producto comercial específico</span>
            </p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
