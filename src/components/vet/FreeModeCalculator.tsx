'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Scale,
  Paw,
  CircleInfo,
  AlertTriangle,
  Warning,
  MedicalKit,
  Printer,
  Clock,
  Copy,
  Trash,
} from 'reicon-react';
import AnimalIcon from './AnimalIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type AnimalType } from '@/lib/medications';
import { validateDose } from '@/lib/dose-validation';
import { useHistory, useAddHistory, useClearHistory } from '@/lib/use-history-store';
import { useVetToast } from './VetToast';
import { validateWeight, validateDose as validateDoseInput, validateConcentration, formatValidationErrors, formatValidationWarnings } from '@/lib/form-validation';

const DOSE_UNITS = [
  { value: 'mg/kg', label: 'mg/kg' },
  { value: 'mcg/kg', label: 'mcg/kg' },
  { value: 'g/kg', label: 'g/kg' },
  { value: 'UI/kg', label: 'UI/kg' },
  { value: 'mL/kg', label: 'mL/kg' },
];

const CONCENTRATION_UNITS = [
  { value: 'mg/mL', label: 'mg/mL' },
  { value: 'mcg/mL', label: 'mcg/mL' },
  { value: 'mg/tablet', label: 'mg/tableta' },
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
    default:
      return 'mL';
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

function StepHeading({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-2.5">
      <span className="w-6 h-6 rounded-lg bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
        {num}
      </span>
      <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">{children}</h3>
    </div>
  );
}

export default function FreeModeCalculator() {
  const [animalType, setAnimalType] = useState<AnimalType>('perro');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [dosePerKg, setDosePerKg] = useState('');
  const [doseUnit, setDoseUnit] = useState('mg/kg');
  const [concentration, setConcentration] = useState('');
  const [concentrationUnit, setConcentrationUnit] = useState<ConcentrationUnit>('mg/mL');
  const [result, setResult] = useState<{ total: number; unit: string; weightKg: number; formula: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory('free');
  const addHistory = useAddHistory();
  const clearHistory = useClearHistory();
  const [copied, setCopied] = useState(false);
  const { addToast } = useVetToast();

  const requiresConcentration = doseUnit !== 'UI/kg' && doseUnit !== 'mL/kg';

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    // Validar peso
    const weightValidation = validateWeight(weight, animalType, 'Peso');
    if (!weightValidation.isValid) {
      setError(formatValidationErrors(weightValidation.errors));
      addToast({
        title: 'Error de Validación',
        description: formatValidationErrors(weightValidation.errors),
        variant: 'destructive',
      });
      return;
    }

    // Mostrar advertencias si existen
    if (weightValidation.warnings.length > 0) {
      addToast({
        title: 'Advertencia',
        description: formatValidationWarnings(weightValidation.warnings),
        variant: 'default',
      });
    }

    // Validar dosis por kg
    const doseValidation = validateDoseInput(dosePerKg, 'Dosis por kg');
    if (!doseValidation.isValid) {
      setError(formatValidationErrors(doseValidation.errors));
      addToast({
        title: 'Error de Validación',
        description: formatValidationErrors(doseValidation.errors),
        variant: 'destructive',
      });
      return;
    }

    // Validar concentración si es necesaria
    if (requiresConcentration) {
      const concValidation = validateConcentration(concentration, 'Concentración');
      if (!concValidation.isValid) {
        setError(formatValidationErrors(concValidation.errors));
        addToast({
          title: 'Error de Validación',
          description: formatValidationErrors(concValidation.errors),
          variant: 'destructive',
        });
        return;
      }
    }

    const w = parseFloat(weight);
    const d = parseFloat(dosePerKg);
    const c = parseFloat(concentration);

    const weightKg = weightUnit === 'lb' ? w * 0.453592 : w;
    const totalDose = d * weightKg;
    const roundedWeightKg = Math.round(weightKg * 100) / 100;

    let total = totalDose;
    let displayUnit = doseUnit.split('/')[0] || doseUnit;
    let formula = `${d} ${doseUnit} × ${roundedWeightKg} kg`;

    if (requiresConcentration) {
      let convertedDose = totalDose;

      if (doseUnit.startsWith('mg')) {
        convertedDose = concentrationUnit.startsWith('mcg') ? totalDose * 1000 : totalDose;
      } else if (doseUnit.startsWith('mcg')) {
        convertedDose = concentrationUnit.startsWith('mcg') ? totalDose : totalDose / 1000;
      } else if (doseUnit.startsWith('g')) {
        convertedDose = concentrationUnit.startsWith('mcg') ? totalDose * 1000000 : totalDose * 1000;
      }

      total = convertedDose / c;
      displayUnit = getVolumeUnit(concentrationUnit);
      formula = `${d} ${doseUnit} × ${roundedWeightKg} kg ÷ ${c} ${concentrationUnit}`;
    }

    const finalTotal = Math.round(total * 1000) / 1000;
    setResult({ total: finalTotal, unit: displayUnit, weightKg: roundedWeightKg, formula });

    addHistory({
      type: 'free',
      timestamp: Date.now(),
      summary: `Modo libre | ${animalType} ${weightKg.toFixed(1)}kg | ${d}${doseUnit} ${requiresConcentration ? `÷ ${c}${concentrationUnit}` : ''} = ${finalTotal}${displayUnit}`,
    });
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Recent History */}
      {history.length > 0 && !result && (
        <div className="no-print">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Clock size={16} weight="Outline" className="text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Consultas recientes</span>
            </div>
            <button
              onClick={clearHistory}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              title="Limpiar historial"
            >
              <Trash size={12} weight="Outline" />
              Limpiar
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {history.slice(0, 4).map((h, i) => (
              <div key={i} className="flex-shrink-0 bg-muted/60 rounded-lg px-3 py-1.5 text-xs text-muted-foreground border border-border/50">
                {h.summary}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1 */}
      <div>
        <StepHeading num={1}>Tipo de Animal</StepHeading>
        <div className="grid grid-cols-2 gap-3">
          {(['perro', 'gato'] as const).map((type) => (
            <button
              key={type}
              onClick={() => { setAnimalType(type); setResult(null); }}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                animalType === type
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <AnimalIcon type={type} size={36} active={animalType === type} />
              <span className={`font-semibold ${animalType === type ? 'text-primary' : 'text-muted-foreground'}`}>
                {type === 'perro' ? 'Perro' : 'Gato'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 */}
      <div>
        <StepHeading num={2}>Peso del Animal</StepHeading>
        <div className="flex gap-3 items-center">
          <Input
            type="number" placeholder="Ej: 5" value={weight}
            onChange={(e) => { setWeight(e.target.value); setResult(null); }}
            min="0.1" step="0.1" className="flex-1 h-12 text-lg"
          />
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['kg', 'lb'] as const).map((u) => (
              <button key={u} onClick={() => setWeightUnit(u)}
                className={`px-4 py-3 text-sm font-semibold transition-colors ${
                  weightUnit === u ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'
                }`}>
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div>
        <StepHeading num={3}>Dosis Personalizada</StepHeading>
        <div className="flex gap-3 items-center">
          <Input
            type="number" placeholder="Ej: 10" value={dosePerKg}
            onChange={(e) => { setDosePerKg(e.target.value); setResult(null); }}
            min="0.001" step="0.1" className="flex-1 h-12 text-lg"
          />
          <Select value={doseUnit} onValueChange={(val) => { setDoseUnit(val); setResult(null); setConcentration(''); if (val === 'UI/kg' || val === 'mL/kg') { setConcentrationUnit('mg/mL'); } }}>
            <SelectTrigger className="w-28 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOSE_UNITS.map((u) => (
                <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {requiresConcentration && (
        <div>
          <StepHeading num={4}>Concentración</StepHeading>
          <div className="flex gap-3 items-center">
            <Input
              type="number" placeholder="Ej: 50" value={concentration}
              onChange={(e) => { setConcentration(e.target.value); setResult(null); }}
              min="0.001" step="0.1" className="flex-1 h-12 text-lg"
            />
            <Select value={concentrationUnit} onValueChange={(val) => { setConcentrationUnit(val as ConcentrationUnit); setResult(null); }}>
              <SelectTrigger className="w-30 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONCENTRATION_UNITS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {!requiresConcentration && (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          La concentración no aplica para dosis en UI/kg o mL/kg.
        </div>
      )}

      {/* Calculate Button */}
      <div className="flex flex-col items-center gap-3 no-print">
        <Button
          size="lg" onClick={handleCalculate} disabled={!weight || !dosePerKg}
          className="vet-pulse text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20"
        >
          <span className="flex items-center gap-2">
            <Calculator size={22} weight="Outline" />
            CALCULAR DOSIS LIBRE
          </span>
        </Button>
      </div>

      {/* Error */}
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

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.3 }}
          >
            <Card className="result-card shadow-lg card-shine">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calculator size={18} weight="Outline" />
                    </div>
                    Resultado — Modo Libre
                  </CardTitle>
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => {
                      const text = `VetAssist\nModo Libre\nEspecie: ${animalType} | Peso: ${result.weightKg}kg\nFórmula: ${result.formula} = ${result.total} ${result.unit}\n---\nCalculado con VetAssist`;
                      navigator.clipboard.writeText(text);
                      setCopied(true);
                      addToast('Resultado copiado al portapapeles', 'success');
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="no-print h-8 w-8 text-muted-foreground hover:text-primary relative"
                    title="Copiar resultado"
                  >
                    <Copy size={16} weight={copied ? 'Fill' : 'Outline'} />
                    {copied && (
                      <motion.span
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap"
                      >
                        Copiado!
                      </motion.span>
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => window.print()}
                    className="no-print h-8 w-8 text-muted-foreground hover:text-primary">
                    <Printer size={16} weight="Outline" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="dose-highlight p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Dosis Total</p>
                      <p className="text-4xl font-extrabold text-primary mt-1">{result.total}</p>
                      <p className="text-sm text-muted-foreground font-medium">{result.unit}</p>
                    </div>
                    <div className="bg-card/60 rounded-lg p-3 flex flex-col justify-center">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Fórmula</p>
                      <p className="text-sm font-mono mt-2 font-medium break-all">
                        {result.formula}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        = <strong className="text-foreground">{result.total} {result.unit}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2 flex items-center gap-1.5">
                  <CircleInfo size={13} weight="Outline" />
                  <span>Peso utilizado: <strong>{result.weightKg} kg</strong> ({animalType})</span>
                </p>

                {/* Dose Range Validation */}
                {(() => {
                  const validation = validateDose({ weightKg: result.weightKg, animalType });
                  const IconComponent = validation.icon === 'Warning' ? Warning : validation.icon === 'AlertTriangle' ? AlertTriangle : CircleInfo;
                  return (
                    <Alert className={validation.colorClass}>
                      <IconComponent
                        size={18}
                        weight="Outline"
                        className={
                          validation.status === 'warning'
                            ? 'text-red-600 dark:text-red-400'
                            : validation.status === 'caution'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                        }
                      />
                      <AlertDescription
                        className={`text-sm leading-relaxed ${
                          validation.status === 'warning'
                            ? 'text-red-800 dark:text-red-200'
                            : validation.status === 'caution'
                              ? 'text-amber-800 dark:text-amber-200'
                              : 'text-emerald-800 dark:text-emerald-200'
                        }`}
                      >
                        {validation.message}
                        {validation.status !== 'normal' && (
                          <span className="block mt-1.5 text-xs opacity-75 font-medium">
                            Ajuste la dosis según criterio clínico profesional
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  );
                })()}

                <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                  <AlertTriangle size={18} weight="Outline" className="text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                    Este es un cálculo de referencia. Siempre verifique con las guías de dosificación
                    oficiales del medicamento y la condición clínica del paciente.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2 no-print">
                  <Button variant="outline" onClick={() => setResult(null)} className="flex-1">
                    Nueva Consulta
                  </Button>
                  <Button variant="outline" onClick={() => window.print()} className="px-4">
                    <Printer size={16} weight="Outline" className="mr-1.5" />
                    Imprimir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
