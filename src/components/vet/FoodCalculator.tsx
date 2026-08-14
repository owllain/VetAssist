'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cat, Scale, CircleInfo, AlertTriangle,
  Calculator, Printer, Repeat, Clock,
  Copy, Trash,
} from 'reicon-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { FoodCalculationResult, PetType, ActivityLevel } from '@/lib/food-data';
import { useHistory, useAddHistory, useClearHistory } from '@/lib/use-history-store';
import BodyConditionScore from './BodyConditionScore';

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; emoji: string; desc: string }[] = [
  { value: 'bajo', label: 'Bajo', emoji: '🛋️', desc: 'Sedentario' },
  { value: 'normal', label: 'Normal', emoji: '🏃', desc: 'Actividad moderada' },
  { value: 'alto', label: 'Alto', emoji: '🏋️', desc: 'Muy activo' },
];

const ACTIVITY_LABEL_MAP: Record<ActivityLevel, string> = {
  bajo: 'Bajo (sedentario)',
  normal: 'Normal (moderada)',
  alto: 'Alto (muy activo)',
};

function StepHeading({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold mb-3 flex items-center gap-2.5">
      <span className="step-number">{num}</span>
      {children}
    </h3>
  );
}

export default function FoodCalculator() {
  const [petType, setPetType] = useState<PetType>('perro');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [activity, setActivity] = useState<ActivityLevel>('normal');
  const [mealsPerDay, setMealsPerDay] = useState(2);
  const [result, setResult] = useState<FoodCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [converterInput, setConverterInput] = useState('');
  const [converterUnit, setConverterUnit] = useState<'kg' | 'lb' | 'oz'>('kg');
  const [bcs, setBcs] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const history = useHistory('food');
  const addHistory = useAddHistory();
  const clearHistory = useClearHistory();

  // Weight converter
  const convertedWeight = useMemo(() => {
    const v = parseFloat(converterInput);
    if (!v || v <= 0) return null;
    if (converterUnit === 'kg') return { kg: v, lb: +(v * 2.20462).toFixed(2), oz: +(v * 35.274).toFixed(1) };
    if (converterUnit === 'lb') return { kg: +(v * 0.453592).toFixed(2), lb: v, oz: +(v * 16).toFixed(1) };
    return { kg: +(v * 0.0283495).toFixed(3), lb: +(v * 0.0625).toFixed(3), oz: v };
  }, [converterInput, converterUnit]);

  // Sync converter with main weight input
  useEffect(() => {
    if (weight && !converterInput) {
      setConverterInput(weight);
      setConverterUnit(weightUnit === 'lb' ? 'lb' : 'kg');
    }
  }, [weight, weightUnit, converterInput]);

  // BCS change handler
  const handleBcsChange = useCallback((score: number) => {
    setBcs(score);
    setResult(null);
    if (score >= 1 && score <= 3) {
      setActivity('bajo');
    } else if (score >= 6 && score <= 9) {
      setActivity('alto');
    }
    // BCS 4-5 leaves activity as selected
  }, []);

  const handleCalculate = async () => {
    const w = parseFloat(weight);
    if (!w || w <= 0) { setError('Ingrese un peso válido mayor a 0'); return; }

    setLoading(true); setError(null); setResult(null);

    try {
      const res = await fetch('/api/calculate-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petType, weight: w, weightUnit, mealsPerDay, activity }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al calcular la alimentación'); return; }

      setResult(data);
      addHistory({
        type: 'food', timestamp: Date.now(),
        summary: `Alimento | ${petType} ${data.weightKg}kg | ${data.dailyGrams.recommended}g/día`,
      });
    } catch {
      setError('Error de conexión. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const effectiveActivity = bcs !== null && bcs >= 1 && bcs <= 3
    ? 'bajo'
    : bcs !== null && bcs >= 6 && bcs <= 9
      ? 'alto'
      : activity;

  return (
    <div className="space-y-6">
      {/* Recent History */}
      {history.length > 0 && !result && (
        <div className="no-print">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Clock size={16} weight="outline" className="text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Consultas recientes</span>
            </div>
            <button
              onClick={clearHistory}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              title="Limpiar historial"
            >
              <Trash size={12} weight="outline" />
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

      {/* Weight Converter Widget */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 no-print">
        <div className="flex items-center gap-2 mb-3">
          <Repeat size={16} color="oklch(0.55 0.15 165)" weight="outline" />
          <span className="text-sm font-semibold">Conversor de Peso Rápido</span>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            type="number" placeholder="Peso" value={converterInput}
            onChange={(e) => setConverterInput(e.target.value)}
            className="flex-1 h-10 text-sm"
          />
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['kg', 'lb', 'oz'] as const).map((u) => (
              <button key={u} onClick={() => setConverterUnit(u)}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                  converterUnit === u ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'
                }`}>
                {u}
              </button>
            ))}
          </div>
        </div>
        {convertedWeight && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="bg-card rounded-lg p-2 border border-border/50">
              <p className="text-lg font-bold text-primary">{convertedWeight.kg}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">kg</p>
            </div>
            <div className="bg-card rounded-lg p-2 border border-border/50">
              <p className="text-lg font-bold text-primary">{convertedWeight.lb}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">lb</p>
            </div>
            <div className="bg-card rounded-lg p-2 border border-border/50">
              <p className="text-lg font-bold text-primary">{convertedWeight.oz}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">oz</p>
            </div>
          </div>
        )}
      </div>

      {/* Step 1 */}
      <div>
        <StepHeading num={1}>Tipo de Mascota</StepHeading>
        <div className="grid grid-cols-2 gap-3">
          {(['perro', 'gato'] as const).map((type) => (
            <button key={type}
              onClick={() => { setPetType(type); setResult(null); }}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                petType === type
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                  : 'border-border hover:border-primary/30'
              }`}>
              {type === 'perro' ? (
                <span className="text-4xl">🐕</span>
              ) : (
                <Cat size={36} weight="outline" color={petType === 'gato' ? 'oklch(0.55 0.15 165)' : 'oklch(0.5 0.02 165)'} />
              )}
              <span className={`font-semibold ${petType === type ? 'text-primary' : 'text-muted-foreground'}`}>
                {type === 'perro' ? 'Perro' : 'Gato'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 */}
      <div>
        <StepHeading num={2}>Peso de la Mascota</StepHeading>
        <div className="flex gap-3 items-center">
          <Input type="number" placeholder="Ej: 5" value={weight}
            onChange={(e) => { setWeight(e.target.value); setResult(null); }}
            min="0.1" step="0.1" className="flex-1 h-12 text-lg" />
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
        <StepHeading num={3}>Nivel de Actividad</StepHeading>
        <div className="grid grid-cols-3 gap-3">
          {ACTIVITY_LEVELS.map((lvl) => (
            <button key={lvl.value}
              onClick={() => { setActivity(lvl.value); setResult(null); setBcs(null); }}
              className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 ${
                effectiveActivity === lvl.value
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                  : 'border-border hover:border-primary/30'
              }`}>
              <span className="text-2xl">{lvl.emoji}</span>
              <span className={`font-semibold text-sm ${effectiveActivity === lvl.value ? 'text-primary' : 'text-foreground'}`}>
                {lvl.label}
              </span>
              <span className="text-[10px] text-muted-foreground">{lvl.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 4 */}
      <div>
        <StepHeading num={4}>Comidas por Día</StepHeading>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button key={n}
              onClick={() => { setMealsPerDay(n); setResult(null); }}
              className={`flex-shrink-0 w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                mealsPerDay === n
                  ? 'border-primary bg-primary text-primary-foreground shadow-md'
                  : 'border-border bg-card hover:border-primary/40'
              }`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Step 5: BCS */}
      <div>
        <StepHeading num={5}>Condición Corporal (Opcional)</StepHeading>
        <BodyConditionScore value={bcs} onChange={handleBcsChange} />
        {bcs && (bcs <= 3 || bcs >= 6) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-start gap-2 text-xs text-muted-foreground bg-primary/5 border border-primary/10 rounded-lg px-3 py-2"
          >
            <CircleInfo size={13} weight="outline" color="oklch(0.55 0.15 165)" className="mt-0.5 flex-shrink-0" />
            <span>
              {bcs <= 3
                ? `BCS ${bcs}/9 detectado: la actividad se ajustó automáticamente a «Bajo» para aumentar la ingesta calórica recomendada.`
                : `BCS ${bcs}/9 detectado: la actividad se ajustó automáticamente a «Alto» para reducir la ingesta calórica recomendada.`}
            </span>
          </motion.div>
        )}
      </div>

      {/* Calculate Button */}
      <div className="flex flex-col items-center gap-3 no-print">
        <Button size="lg" onClick={handleCalculate} disabled={!weight || loading}
          className="vet-pulse text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20">
          {loading ? (
            <span className="flex items-center gap-2"><span className="animate-spin">⚙️</span>Calculando...</span>
          ) : (
            <span className="flex items-center gap-2"><Calculator size={22} weight="outline" />CALCULAR ALIMENTACIÓN</span>
          )}
        </Button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Alert variant="destructive">
              <AlertTriangle size={18} weight="outline" />
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
            exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.3 }}>
            <Card className="result-card shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Scale size={18} weight="outline" />
                    </div>
                    Alimentación Diaria
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => {
                        const text = `VetCalc CR\nAlimentación Diaria\nEspecie: ${petType} | Peso: ${result.weightKg}kg\nGramos/día: ${result.dailyGrams.recommended}g (${result.dailyGrams.min}-${result.dailyGrams.max}g)\nOnzas/día: ${result.dailyOunces}oz\nTazas/día: ${result.dailyCups}\nComidas/día: ${result.mealsPerDay} (${result.perMealGrams.recommended}g/comida)\nActividad: ${ACTIVITY_LABEL_MAP[effectiveActivity]}\n---\nCalculado con VetCalc CR`;
                        navigator.clipboard.writeText(text);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="no-print h-8 w-8 text-muted-foreground hover:text-primary relative"
                      title="Copiar resultado"
                    >
                      <Copy size={16} weight={copied ? 'fill' : 'outline'} />
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
                      <Printer size={16} weight="outline" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Main Grid */}
                <div className="dose-highlight p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Gramos/Día</p>
                      <p className="text-2xl font-extrabold text-primary mt-1">{result.dailyGrams.recommended}g</p>
                      <p className="text-[10px] text-muted-foreground">({result.dailyGrams.min}–{result.dailyGrams.max}g)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Onzas/Día</p>
                      <p className="text-2xl font-extrabold text-primary mt-1">{result.dailyOunces}oz</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Tazas/Día</p>
                      <p className="text-2xl font-extrabold text-primary mt-1">{result.dailyCups}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Por Comida</p>
                      <p className="text-2xl font-extrabold text-accent mt-1">{result.perMealGrams.recommended}g</p>
                      <p className="text-[10px] text-muted-foreground">({result.perMealGrams.min}–{result.perMealGrams.max}g)</p>
                    </div>
                  </div>
                </div>

                {/* Detail Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">🍽️</span>
                      <p className="text-xs font-semibold uppercase tracking-wider">Comidas por Día</p>
                    </div>
                    <p className="text-xl font-bold">{result.mealsPerDay}</p>
                    <p className="text-xs text-muted-foreground">{result.perMealGrams.recommended}g por comida</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">📊</span>
                      <p className="text-xs font-semibold uppercase tracking-wider">Nivel de Actividad</p>
                    </div>
                    <p className="text-sm mt-0.5 text-muted-foreground">{result.activity}</p>
                  </div>
                </div>

                {/* Weight note */}
                <p className="text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2 flex items-center gap-1.5">
                  <CircleInfo size={13} weight="outline" />
                  <span>Peso utilizado: <strong>{result.weightKg} kg</strong> ({petType})</span>
                </p>

                {/* Info Note */}
                <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                  <AlertTriangle size={18} weight="outline" className="text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                    Esta estimación se basa en alimento seco (croquetas) con ~3.5 kcal/g.
                    Ajuste según el alimento específico, la condición corporal y las necesidades
                    individuales del paciente.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2 no-print">
                  <Button variant="outline" onClick={() => setResult(null)} className="flex-1">Nueva Consulta</Button>
                  <Button variant="outline" onClick={() => window.print()} className="px-4">
                    <Printer size={16} weight="outline" className="mr-1.5" />Imprimir
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