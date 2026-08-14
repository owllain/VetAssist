'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Drop,
  Clock,
  Flask,
  Warning,
  Calculator,
  CircleInfo,
  ArrowRight,
  Plus,
  Minus,
  ChevronDown,
  AlertTriangle,
} from 'reicon-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/* ─── Types ─────────────────────────────────────────────── */

type Species = 'perro' | 'gato';
type FluidMethod = 'standard' | 'simplified';
type DripSet = '15' | '20' | '60';

interface DehydrationOption {
  value: number;
  label: string;
  severity: string;
  severityColor: string;
}

interface OngoingLossOption {
  value: number;
  label: string;
  desc: string;
}

interface SurgeryRateOption {
  value: number;
  label: string;
}

interface FluidResult {
  species: Species;
  weightKg: number;
  method: FluidMethod;
  maintenanceDaily: number;
  maintenanceHourly: number;
  maintenanceHourlyMin: number;
  maintenanceHourlyMax: number;
  dehydrationVolume: number;
  ongoingLossRate: number;
  surgeryRate: number;
  correctionHourly: number;
  ongoingHourly: number;
  surgeryHourly: number;
  totalDaily: number;
  totalHourly: number;
  dropsPerMinute: number;
  infusionTimes: Record<string, number>;
  formulaUsed: string;
  weightRange: string;
  weightRangeRate: string;
}

/* ─── Constants ──────────────────────────────────────────── */

const DEHYDRATION_OPTIONS: DehydrationOption[] = [
  { value: 0, label: 'Ninguna (0%)', severity: 'Normal', severityColor: 'bg-emerald-100 text-emerald-700' },
  { value: 5, label: 'Leve (5%)', severity: 'Leve', severityColor: 'bg-amber-100 text-amber-700' },
  { value: 8, label: 'Moderada (8%)', severity: 'Moderada', severityColor: 'bg-orange-100 text-orange-700' },
  { value: 12, label: 'Severa (12%)', severity: 'Severa', severityColor: 'bg-red-100 text-red-700' },
];

const ONGOING_LOSS_OPTIONS: OngoingLossOption[] = [
  { value: 0, label: 'Ninguna', desc: 'Sin pérdidas adicionales' },
  { value: 5, label: 'Leve (5 mL/kg/hr)', desc: 'Vómitos/diarrea leve' },
  { value: 7, label: 'Moderada (7 mL/kg/hr)', desc: 'Vómitos/diarrea moderada' },
  { value: 10, label: 'Severa (10 mL/kg/hr)', desc: 'Vómitos/diarrea severa' },
];

const SURGERY_RATE_OPTIONS: SurgeryRateOption[] = [
  { value: 0, label: 'Ninguno', desc: 'Sin tasa perioperatoria' },
  { value: 2, label: 'Bajo (2 mL/kg/hr)', desc: 'Procedimiento menor' },
  { value: 3, label: 'Medio (3 mL/kg/hr)', desc: 'Cirugía estándar' },
  { value: 5, label: 'Alto (5 mL/kg/hr)', desc: 'Cirugía mayor' },
];

const BAG_SIZES = [250, 500, 1000];

/* ─── Weight-based maintenance lookup ───────────────────── */

function getWeightBasedRate(weightKg: number): {
  dailyMin: number;
  dailyMax: number;
  hourlyMin: number;
  hourlyMax: number;
  range: string;
} {
  if (weightKg <= 2) {
    return {
      dailyMin: 120, dailyMax: 150,
      hourlyMin: 5, hourlyMax: 6,
      range: '0–2 kg',
    };
  }
  if (weightKg <= 5) {
    return {
      dailyMin: 80, dailyMax: 100,
      hourlyMin: 3, hourlyMax: 4,
      range: '2–5 kg',
    };
  }
  if (weightKg <= 10) {
    return {
      dailyMin: 60, dailyMax: 80,
      hourlyMin: 2.5, hourlyMax: 3.5,
      range: '5–10 kg',
    };
  }
  if (weightKg <= 20) {
    return {
      dailyMin: 50, dailyMax: 60,
      hourlyMin: 2, hourlyMax: 2.5,
      range: '10–20 kg',
    };
  }
  // 20+ kg
  return {
    dailyMin: 40, dailyMax: 50,
    hourlyMin: 1.5, hourlyMax: 2,
    range: '>20 kg',
  };
}

/* ─── Simplified formula ─────────────────────────────────── */

function simplifiedFormula(weightKg: number): number {
  return 30 * weightKg + 70;
}

/* ─── Step heading ───────────────────────────────────────── */

function StepHeading({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold mb-3 flex items-center gap-2.5">
      <span className="step-number">{num}</span>
      {children}
    </h3>
  );
}

/* ─── Visual Fluid Bag ────────────────────────────────────── */

function FluidBagIndicator({ filled, total }: { filled: number; total: number }) {
  const pct = Math.min((filled / total) * 100, 100);
  return (
    <div className="relative w-16 h-24 flex-shrink-0">
      {/* Bag outline */}
      <div className="absolute inset-0 rounded-lg border-2 border-primary/40 bg-primary/5 overflow-hidden">
        {/* Fill level */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/60 to-primary/20"
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {/* Top port */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-primary/30 rounded-b" />
      </div>
      {/* Label */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-muted-foreground whitespace-nowrap">
        {total}mL
      </div>
    </div>
  );
}

/* ─── Infusion Time Card ─────────────────────────────────── */

function InfusionTimeCard({
  bagSize,
  hours,
  hourlyRate,
}: {
  bagSize: number;
  hours: number;
  hourlyRate: number;
}) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const needsMultipleBags = hours < hourlyRate > 0 && bagSize / hourlyRate < hours;

  return (
    <div className="flex items-center gap-3 hover-tap rounded-lg p-2 border border-border/50">
      <FluidBagIndicator filled={bagSize} total={bagSize} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">Bolsa {bagSize} mL</div>
        <div className="text-xs text-muted-foreground">
          {h > 0 ? `${h}h` : ''}{h > 0 && m > 0 ? ' ' : ''}{m > 0 ? `${m}min` : ''}
          {h === 0 && m === 0 ? ' < 1 min' : ''}
        </div>
      </div>
      <Badge variant="outline" className="text-[10px] font-mono flex-shrink-0">
        {h}:{m.toString().padStart(2, '0')}
      </Badge>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */

export default function IVFluidCalculator() {
  // Step 1: Species
  const [species, setSpecies] = useState<Species>('perro');

  // Step 2: Weight
  const [weight, setWeight] = useState('');

  // Step 3: Calculation method
  const [method, setMethod] = useState<FluidMethod>('standard');

  // Step 4: Drip set
  const [dripSet, setDripSet] = useState<DripSet>('20');

  // Advanced: Dehydration
  const [dehydration, setDehydration] = useState<number>(0);

  // Advanced: Ongoing losses
  const [ongoingLoss, setOngoingLoss] = useState<number>(0);

  // Advanced: Surgery rate
  const [surgeryRate, setSurgeryRate] = useState<number>(0);

  // Collapsible states
  const [showDehydration, setShowDehydration] = useState(false);
  const [showOngoingLoss, setShowOngoingLoss] = useState(false);
  const [showSurgery, setShowSurgery] = useState(false);

  // Results
  const [result, setResult] = useState<FluidResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Live calculation (no API, no localStorage)
  const calculatedResult = useMemo((): FluidResult | null => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return null;

    let maintenanceDaily: number;
    let formulaUsed: string;
    let maintenanceHourlyMin: number;
    let maintenanceHourlyMax: number;
    let weightRange: string;
    let weightRangeRate: string;

    if (method === 'standard') {
      const rate = getWeightBasedRate(w);
      maintenanceHourlyMin = rate.hourlyMin;
      maintenanceHourlyMax = rate.hourlyMax;
      // Use midpoint for calculation
      const hourlyRate = (rate.hourlyMin + rate.hourlyMax) / 2;
      maintenanceDaily = hourlyRate * w * 24;
      formulaUsed = `Rango por peso (${rate.range}): ${rate.dailyMin}–${rate.dailyMax} mL/kg/día`;
      weightRange = rate.range;
      weightRangeRate = `${rate.hourlyMin}–${rate.hourlyMax} mL/kg/hr`;
    } else {
      maintenanceDaily = simplifiedFormula(w);
      const hourlyRate = maintenanceDaily / 24;
      maintenanceHourlyMin = Math.round(hourlyRate * 10) / 10;
      maintenanceHourlyMax = Math.round(hourlyRate * 10) / 10;
      formulaUsed = `Fórmula simplificada: (30 × ${w}kg) + 70 = ${maintenanceDaily} mL/día`;
      weightRange = 'N/A';
      weightRangeRate = `${maintenanceHourlyMin.toFixed(1)} mL/kg/hr`;
    }

    const maintenanceHourly = maintenanceDaily / 24;

    // Dehydration correction
    const dehydrationVolume = w * (dehydration / 100) * 1000; // mL
    const correctionHourly = dehydration > 0 ? dehydrationVolume / 24 : 0;

    // Ongoing losses
    const ongoingLossRate = w * ongoingLoss; // mL/hr
    const ongoingHourly = ongoingLossRate;

    // Surgery additions
    const surgeryRateMl = w * surgeryRate; // mL/hr
    const surgeryHourly = surgeryRateMl;

    // Totals
    const totalDaily = maintenanceDaily + dehydrationVolume + (ongoingHourly * 24) + (surgeryHourly * 24);
    const totalHourly = totalDaily / 24;

    // Drops per minute
    const dripSetNum = parseInt(dripSet);
    const dropsPerMinute = (totalHourly * dripSetNum) / 60;

    // Infusion times for bag sizes
    const infusionTimes: Record<string, number> = {};
    for (const size of BAG_SIZES) {
      infusionTimes[String(size)] = totalHourly > 0 ? size / totalHourly : Infinity;
    }

    return {
      species,
      weightKg: w,
      method,
      maintenanceDaily: Math.round(maintenanceDaily * 10) / 10,
      maintenanceHourly: Math.round(maintenanceHourly * 100) / 100,
      maintenanceHourlyMin,
      maintenanceHourlyMax,
      dehydrationVolume: Math.round(dehydrationVolume * 10) / 10,
      ongoingLossRate: Math.round(ongoingLossRate * 100) / 100,
      surgeryRate: Math.round(surgeryRateMl * 100) / 100,
      correctionHourly: Math.round(correctionHourly * 100) / 100,
      ongoingHourly: Math.round(ongoingHourly * 100) / 100,
      surgeryHourly: Math.round(surgeryHourly * 100) / 100,
      totalDaily: Math.round(totalDaily * 10) / 10,
      totalHourly: Math.round(totalHourly * 100) / 100,
      dropsPerMinute: Math.round(dropsPerMinute * 100) / 100,
      infusionTimes,
      formulaUsed,
      weightRange,
      weightRangeRate,
    };
  }, [weight, species, method, dripSet, dehydration, ongoingLoss, surgeryRate]);

  const handleCalculate = () => {
    const w = parseFloat(weight);
    if (!w || w <= 0) {
      setError('Ingrese un peso válido mayor a 0');
      return;
    }
    if (w > 200) {
      setError('El peso máximo permitido es 200 kg');
      return;
    }
    setError(null);
    setResult(calculatedResult);
  };

  const handleReset = () => {
    setWeight('');
    setDehydration(0);
    setOngoingLoss(0);
    setSurgeryRate(0);
    setResult(null);
    setError(null);
    setShowDehydration(false);
    setShowOngoingLoss(false);
    setShowSurgery(false);
  };

  const hasAdvancedOptions = dehydration > 0 || ongoingLoss > 0 || surgeryRate > 0;

  const formatTime = (hours: number): string => {
    if (!isFinite(hours)) return '--:--';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5">
      {/* ─── Step 1: Species ─── */}
      <div>
        <StepHeading num={1}>Especie</StepHeading>
        <div className="grid grid-cols-2 gap-3">
          {(['perro', 'gato'] as const).map((type) => (
            <button
              key={type}
              onClick={() => { setSpecies(type); setResult(null); }}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                species === type
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <span className="text-4xl">{type === 'perro' ? '🐕' : '🐈'}</span>
              <span
                className={`font-semibold ${
                  species === type ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {type === 'perro' ? 'Perro' : 'Gato'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Step 2: Weight ─── */}
      <div>
        <StepHeading num={2}>Peso del Paciente</StepHeading>
        <div className="flex gap-3 items-center">
          <Input
            type="number"
            placeholder="Ej: 5"
            value={weight}
            onChange={(e) => {
              setWeight(e.target.value);
              setResult(null);
            }}
            min="0.1"
            max="200"
            step="0.1"
            className="flex-1 h-12 text-lg"
          />
          <div className="flex rounded-lg border border-border overflow-hidden bg-card">
            <span className="px-4 py-3 text-sm font-semibold bg-primary text-primary-foreground">
              kg
            </span>
          </div>
        </div>
      </div>

      {/* ─── Step 3: Calculation Method ─── */}
      <div>
        <StepHeading num={3}>Método de Cálculo</StepHeading>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setMethod('standard'); setResult(null); }}
            className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 ${
              method === 'standard'
                ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Drop size={22} weight="Outline" className="text-primary" />
            </div>
            <span className={`font-semibold text-sm ${method === 'standard' ? 'text-primary' : 'text-foreground'}`}>
              Estándar
            </span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              Por rango de peso
            </span>
          </button>
          <button
            onClick={() => { setMethod('simplified'); setResult(null); }}
            className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 ${
              method === 'simplified'
                ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Flask size={22} weight="Outline" className="text-primary" />
            </div>
            <span className={`font-semibold text-sm ${method === 'simplified' ? 'text-primary' : 'text-foreground'}`}>
              Simplificada
            </span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              (30 × kg) + 70
            </span>
          </button>
        </div>

        {/* Info box about the selected method */}
        {method === 'standard' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2.5 text-xs text-muted-foreground flex items-start gap-2"
          >
            <CircleInfo size={14} weight="Outline" color="oklch(0.55 0.15 165)" className="mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-foreground">Tabla de mantenimiento por peso:</strong>
              <div className="mt-1 space-y-0.5">
                <div>• 0–2 kg → 120–150 mL/kg/día (5–6 mL/kg/hr)</div>
                <div>• 2–5 kg → 80–100 mL/kg/día (3–4 mL/kg/hr)</div>
                <div>• 5–10 kg → 60–80 mL/kg/día (2.5–3.5 mL/kg/hr)</div>
                <div>• 10–20 kg → 50–60 mL/kg/día (2–2.5 mL/kg/hr)</div>
                <div>• &gt;20 kg → 40–50 mL/kg/día (1.5–2 mL/kg/hr)</div>
              </div>
            </div>
          </motion.div>
        )}
        {method === 'simplified' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2.5 text-xs text-muted-foreground flex items-start gap-2"
          >
            <CircleInfo size={14} weight="Outline" color="oklch(0.55 0.15 165)" className="mt-0.5 flex-shrink-0" />
            <span>
              <strong className="text-foreground">Fórmula simplificada:</strong> Volumen diario (mL) = (30 × peso en kg) + 70.
              Fórmula rápida útil para estimación general en animales &gt;5 kg.
            </span>
          </motion.div>
        )}
      </div>

      {/* ─── Step 4: Drip Set ─── */}
      <div>
        <StepHeading num={4}>Equipo de Infusión</StepHeading>
        <Select value={dripSet} onValueChange={(v) => { setDripSet(v as DripSet); setResult(null); }}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Seleccionar equipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">
              <div className="flex items-center gap-2">
                <Drop size={16} weight="Outline" className="text-primary" />
                <span>15 gotas/mL</span>
                <Badge variant="secondary" className="text-[10px] ml-1">Macrogotero</Badge>
              </div>
            </SelectItem>
            <SelectItem value="20">
              <div className="flex items-center gap-2">
                <Drop size={16} weight="Outline" className="text-primary" />
                <span>20 gotas/mL</span>
                <Badge variant="secondary" className="text-[10px] ml-1">Macrogotero estándar</Badge>
              </div>
            </SelectItem>
            <SelectItem value="60">
              <div className="flex items-center gap-2">
                <Drop size={16} weight="Outline" className="text-primary" />
                <span>60 gotas/mL</span>
                <Badge variant="secondary" className="text-[10px] ml-1">Microgotero</Badge>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ─── Advanced Options ─── */}
      <div className="space-y-3">
        {/* Dehydration Correction */}
        <Collapsible open={showDehydration} onOpenChange={setShowDehydration}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-between h-10 ${showDehydration ? 'neon-border' : ''}`}
            >
              <span className="flex items-center gap-2 text-sm">
                <Warning size={16} weight={dehydration > 0 ? 'Fill' : 'Outline'} className={dehydration > 0 ? 'text-amber-500' : 'text-muted-foreground'} />
                Corrección por Deshidratación
                {dehydration > 0 && (
                  <Badge className="bg-amber-100 text-amber-700 text-[10px] hover:bg-amber-100">
                    {dehydration}%
                  </Badge>
                )}
              </span>
              <ChevronDown
                size={16}
                weight="Outline"
                className={`transition-transform duration-200 ${showDehydration ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="glass-card mt-2">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CircleInfo size={14} weight="Outline" color="oklch(0.55 0.15 165)" className="mt-0.5 flex-shrink-0" />
                    <span>
                      Agrega volumen de corrección basado en el porcentaje estimado de deshidratación.
                      <br />
                      <strong>Fórmula:</strong> peso (kg) × % deshidratación × 1000 mL → repartido en 24 horas.
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {DEHYDRATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setDehydration(opt.value); setResult(null); }}
                        className={`p-2.5 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-1 ${
                          dehydration === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <span className="text-sm font-semibold">{opt.label}</span>
                        <Badge variant="secondary" className={`text-[10px] ${opt.severityColor}`}>
                          {opt.severity}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>

        {/* Ongoing Losses */}
        <Collapsible open={showOngoingLoss} onOpenChange={setShowOngoingLoss}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-between h-10 ${showOngoingLoss ? 'neon-border' : ''}`}
            >
              <span className="flex items-center gap-2 text-sm">
                <Drop size={16} weight={ongoingLoss > 0 ? 'Fill' : 'Outline'} className={ongoingLoss > 0 ? 'text-orange-500' : 'text-muted-foreground'} />
                Pérdidas Continuas
                {ongoingLoss > 0 && (
                  <Badge className="bg-orange-100 text-orange-700 text-[10px] hover:bg-orange-100">
                    {ongoingLoss} mL/kg/hr
                  </Badge>
                )}
              </span>
              <ChevronDown
                size={16}
                weight="Outline"
                className={`transition-transform duration-200 ${showOngoingLoss ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="glass-card mt-2">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CircleInfo size={14} weight="Outline" color="oklch(0.55 0.15 165)" className="mt-0.5 flex-shrink-0" />
                    <span>
                      Agrega tasa adicional por vómitos o diarrea activos.
                      <br />
                      <strong>Fórmula:</strong> tasa (mL/kg/hr) × peso (kg) = mL/hr adicionales.
                    </span>
                  </div>
                  <div className="space-y-2">
                    {ONGOING_LOSS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setOngoingLoss(opt.value); setResult(null); }}
                        className={`w-full p-2.5 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                          ongoingLoss === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <span className="text-sm font-semibold block">{opt.label}</span>
                          <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                        </div>
                        {ongoingLoss === opt.value && (
                          <Drop size={16} weight="Fill" className="text-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>

        {/* Surgery Additions */}
        <Collapsible open={showSurgery} onOpenChange={setShowSurgery}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-between h-10 ${showSurgery ? 'neon-border' : ''}`}
            >
              <span className="flex items-center gap-2 text-sm">
                <Flask size={16} weight={surgeryRate > 0 ? 'Fill' : 'Outline'} className={surgeryRate > 0 ? 'text-teal-500' : 'text-muted-foreground'} />
                Tasa Perioperatoria
                {surgeryRate > 0 && (
                  <Badge className="bg-teal-100 text-teal-700 text-[10px] hover:bg-teal-100">
                    {surgeryRate} mL/kg/hr
                  </Badge>
                )}
              </span>
              <ChevronDown
                size={16}
                weight="Outline"
                className={`transition-transform duration-200 ${showSurgery ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="glass-card mt-2">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CircleInfo size={14} weight="Outline" color="oklch(0.55 0.15 165)" className="mt-0.5 flex-shrink-0" />
                    <span>
                      Agrega tasa adicional para pacientes quirúrgicos perioperatorios.
                      <br />
                      <strong>Fórmula:</strong> tasa (mL/kg/hr) × peso (kg) = mL/hr adicionales.
                    </span>
                  </div>
                  <div className="space-y-2">
                    {SURGERY_RATE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSurgeryRate(opt.value); setResult(null); }}
                        className={`w-full p-2.5 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                          surgeryRate === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <span className="text-sm font-semibold block">{opt.label}</span>
                          <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                        </div>
                        {surgeryRate === opt.value && (
                          <Flask size={16} weight="Fill" className="text-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* ─── Calculate / Reset Buttons ─── */}
      <div className="flex flex-col items-center gap-3 no-print">
        <div className="flex gap-3">
          <Button
            size="lg"
            onClick={handleCalculate}
            disabled={!weight}
            className="vet-pulse text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20"
          >
            <span className="flex items-center gap-2">
              <Calculator size={22} weight="Outline" />
              CALCULAR TASA IV
            </span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleReset}
            className="px-6 py-6 rounded-xl"
          >
            <span className="flex items-center gap-2">
              <Minus size={18} weight="Outline" />
              Limpiar
            </span>
          </Button>
        </div>
      </div>

      {/* ─── Error ─── */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Alert variant="destructive">
              <AlertTriangle size={18} weight="Outline" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Result ─── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="result-card shadow-lg card-shine">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Drop size={18} weight="Outline" />
                    </div>
                    Tasa de Infusión IV
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {result.species === 'perro' ? '🐕' : '🐈'} {result.weightKg} kg
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* ── Primary Result (dose-highlight) ── */}
                <div className="dose-highlight p-4 micro-bounce">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Velocidad Total de Infusión
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-4xl font-bold text-primary">
                        {result.totalHourly}
                      </span>
                      <span className="text-lg font-semibold text-muted-foreground">mL/hr</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <ArrowRight size={14} weight="Outline" className="text-muted-foreground" />
                      <span className="text-sm font-semibold">
                        {result.totalDaily} mL/día
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Key Metrics Grid ── */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Drops per minute */}
                  <div className="depth-shadow rounded-xl p-3 text-center bg-card">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                      <Drop size={16} weight="Outline" className="text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground">Gotas/min</div>
                    <div className="text-xl font-bold text-primary mt-0.5">
                      {result.dropsPerMinute}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      ({dripSet} gotas/mL)
                    </div>
                  </div>

                  {/* Total daily volume */}
                  <div className="depth-shadow rounded-xl p-3 text-center bg-card">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                      <Clock size={16} weight="Outline" className="text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground">Volumen total/día</div>
                    <div className="text-xl font-bold text-primary mt-0.5">
                      {result.totalDaily}
                    </div>
                    <div className="text-[10px] text-muted-foreground">mL</div>
                  </div>
                </div>

                {/* ── Breakdown ── */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Plus size={14} weight="Outline" className="text-primary" />
                    Desglose del Cálculo
                  </h4>

                  {/* Formula used */}
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    <strong className="text-foreground">Fórmula usada:</strong> {result.formulaUsed}
                  </div>

                  {/* Maintenance rate */}
                  <div className="flex items-center justify-between text-sm py-1.5 border-b border-border/50">
                    <span className="flex items-center gap-2">
                      <Drop size={14} weight="Outline" className="text-primary" />
                      Mantenimiento
                      {result.method === 'standard' && (
                        <Badge variant="outline" className="text-[10px]">
                          {result.weightRange}: {result.weightRangeRate}
                        </Badge>
                      )}
                    </span>
                    <span className="font-mono font-semibold">
                      {result.maintenanceDaily} mL/día
                      <span className="text-muted-foreground font-sans ml-1">({result.maintenanceHourly} mL/hr)</span>
                    </span>
                  </div>

                  {/* Dehydration correction */}
                  {result.correctionHourly > 0 && (
                    <div className="flex items-center justify-between text-sm py-1.5 border-b border-border/50">
                      <span className="flex items-center gap-2">
                        <Warning size={14} weight="Fill" className="text-amber-500" />
                        Corrección deshidratación ({dehydration}%)
                      </span>
                      <span className="font-mono font-semibold">
                        {result.dehydrationVolume} mL
                        <span className="text-muted-foreground font-sans ml-1">({result.correctionHourly} mL/hr)</span>
                      </span>
                    </div>
                  )}

                  {/* Ongoing losses */}
                  {result.ongoingHourly > 0 && (
                    <div className="flex items-center justify-between text-sm py-1.5 border-b border-border/50">
                      <span className="flex items-center gap-2">
                        <Drop size={14} weight="Fill" className="text-orange-500" />
                        Pérdidas continuas ({ongoingLoss} mL/kg/hr)
                      </span>
                      <span className="font-mono font-semibold">
                        {result.ongoingHourly} mL/hr
                      </span>
                    </div>
                  )}

                  {/* Surgery rate */}
                  {result.surgeryHourly > 0 && (
                    <div className="flex items-center justify-between text-sm py-1.5 border-b border-border/50">
                      <span className="flex items-center gap-2">
                        <Flask size={14} weight="Fill" className="text-teal-500" />
                        Tasa perioperatoria ({surgeryRate} mL/kg/hr)
                      </span>
                      <span className="font-mono font-semibold">
                        {result.surgeryHourly} mL/hr
                      </span>
                    </div>
                  )}

                  {/* Total row */}
                  <div className="flex items-center justify-between text-sm py-2 font-bold">
                    <span>TOTAL</span>
                    <span className="font-mono">
                      {result.totalDaily} mL/día = {result.totalHourly} mL/hr
                    </span>
                  </div>
                </div>

                {/* ── Infusion Time for Bag Sizes ── */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Clock size={14} weight="Outline" className="text-primary" />
                    Tiempo de Infusión por Bolsa
                  </h4>
                  <div className="space-y-2">
                    {BAG_SIZES.map((size) => {
                      const hours = result.infusionTimes[String(size)];
                      return (
                        <InfusionTimeCard
                          key={size}
                          bagSize={size}
                          hours={hours}
                          hourlyRate={result.totalHourly}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* ── Quick Reference ── */}
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/30 px-3 py-2.5">
                  <Warning size={14} weight="Outline" className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
                    <strong>Importante:</strong> Estos valores son orientativos. Ajuste según la condición clínica
                    del paciente, monitorizando PVC, hidratación, diuresis y electrolitos. No reemplace el juicio
                    clínico profesional. Revise cada 4–6 horas.
                  </div>
                </div>

                {/* ── Print-friendly result summary ── */}
                <div className="print-only text-sm space-y-1 p-3 border border-border rounded-lg">
                  <div className="font-bold">VetCalc CR — Tasa IV</div>
                  <div>Especie: {result.species} | Peso: {result.weightKg} kg</div>
                  <div>Tasa total: {result.totalHourly} mL/hr ({result.totalDaily} mL/día)</div>
                  <div>Gotas/min: {result.dropsPerMinute} ({dripSet} gotas/mL)</div>
                  {hasAdvancedOptions && (
                    <div>Corrección: {result.dehydrationVolume} mL | Pérdidas: {result.ongoingHourly} mL/hr | Quirúrgico: {result.surgeryHourly} mL/hr</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
