'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Cat,
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

const DOSE_UNITS = [
  { value: 'mg/kg', label: 'mg/kg' },
  { value: 'mcg/kg', label: 'mcg/kg' },
  { value: 'g/kg', label: 'g/kg' },
  { value: 'UI/kg', label: 'UI/kg' },
  { value: 'mL/kg', label: 'mL/kg' },
];

function StepHeading({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold mb-3 flex items-center gap-2.5">
      <span className="step-number">{num}</span>
      {children}
    </h3>
  );
}

export default function FreeModeCalculator() {
  const [animalType, setAnimalType] = useState<AnimalType>('perro');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [dosePerKg, setDosePerKg] = useState('');
  const [doseUnit, setDoseUnit] = useState('mg/kg');
  const [result, setResult] = useState<{ total: number; unit: string; weightKg: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory('free');
  const addHistory = useAddHistory();
  const clearHistory = useClearHistory();
  const [copied, setCopied] = useState(false);
  const { addToast } = useVetToast();

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const w = parseFloat(weight);
    const d = parseFloat(dosePerKg);

    if (!w || w <= 0) { setError('Ingrese un peso válido mayor a 0'); return; }
    if (!d || d <= 0) { setError('Ingrese una dosis por kg válida mayor a 0'); return; }

    const weightKg = weightUnit === 'lb' ? w * 0.453592 : w;
    const total = Math.round(d * weightKg * 1000) / 1000;
    const displayUnit = doseUnit.split('/')[0] || doseUnit;

    setResult({ total, unit: displayUnit, weightKg: Math.round(weightKg * 100) / 100 });

    addHistory({
      type: 'free',
      timestamp: Date.now(),
      summary: `Modo libre | ${animalType} ${weightKg.toFixed(1)}kg | ${d}${doseUnit} = ${total}${displayUnit}`,
    });
  };

  return (
    <div className="space-y-6">
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
              {type === 'perro' ? (
                <span className="text-4xl">🐕</span>
              ) : (
                <Cat size={36} weight="Outline" color={animalType === 'gato' ? 'oklch(0.55 0.15 165)' : 'oklch(0.5 0.02 165)'} />
              )}
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
          <Select value={doseUnit} onValueChange={(val) => { setDoseUnit(val); setResult(null); }}>
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
                      const text = `VetCalc CR\nModo Libre\nEspecie: ${animalType} | Peso: ${result.weightKg}kg\nDosis: ${dosePerKg}${doseUnit} × ${result.weightKg}kg = ${result.total} ${result.unit}\n---\nCalculado con VetCalc CR`;
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
                      <p className="text-sm font-mono mt-2 font-medium">
                        {dosePerKg} {doseUnit} × {result.weightKg} kg
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
