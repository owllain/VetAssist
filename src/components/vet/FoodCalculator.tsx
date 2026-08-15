'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, CircleInfo, AlertTriangle,
  Calculator, Printer, Repeat, Clock,
  Copy, Trash, User, Check,
} from 'reicon-react';
import AnimalIcon from './AnimalIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { FoodCalculationResult, PetType, ActivityLevel } from '@/lib/food-data';
import { useHistory, useAddHistory, useClearHistory } from '@/lib/use-history-store';
import PatientProfiles from './PatientProfiles';
import type { Patient } from '@/lib/use-patients-store';
import BodyConditionScore from './BodyConditionScore';
import { useVetToast } from './VetToast';

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
    <div className="flex items-center gap-2.5 mb-2.5">
      <span className="w-6 h-6 rounded-lg bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
        {num}
      </span>
      <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">{children}</h3>
    </div>
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
  const { addToast } = useVetToast();
  const [showPatientPanel, setShowPatientPanel] = useState(false);
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
    <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Recent History */}
      {history.length > 0 && !result && (
        <div className="no-print">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Clock size={15} weight="Outline" className="text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Consultas recientes</span>
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

      {/* Weight Converter Widget */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 sm:p-4 no-print">
        <div className="flex items-center gap-2 mb-2.5">
          <Repeat size={16} color="oklch(0.55 0.15 165)" weight="Outline" />
          <span className="text-xs sm:text-sm font-semibold">Conversor Rápido de Peso</span>
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
          <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
            <div className="bg-card rounded-lg p-2 border border-border/50">
              <p className="text-base font-bold text-primary">{convertedWeight.kg}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">kg</p>
            </div>
            <div className="bg-card rounded-lg p-2 border border-border/50">
              <p className="text-base font-bold text-primary">{convertedWeight.lb}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">lb</p>
            </div>
            <div className="bg-card rounded-lg p-2 border border-border/50">
              <p className="text-base font-bold text-primary">{convertedWeight.oz}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">oz</p>
            </div>
          </div>
        )}
      </div>

      {/* Step 1: Pet Type */}
      <div>
        <StepHeading num={1}>Tipo de Mascota</StepHeading>
        <div className="grid grid-cols-2 gap-3">
          {(['perro', 'gato'] as const).map((type) => (
            <button key={type}
              onClick={() => { setPetType(type); setResult(null); }}
              className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                petType === type
                  ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                  : 'border-border hover:border-primary/30 bg-card'
              }`}>
              <AnimalIcon type={type} size={36} active={petType === type} />
              <span className={`font-semibold text-sm ${petType === type ? 'text-primary' : 'text-muted-foreground'}`}>
                {type === 'perro' ? 'Perro' : 'Gato'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Weight */}
      <div>
        <StepHeading num={2}>Peso de la Mascota</StepHeading>
        <div className="flex gap-2.5 items-center">
          <Input type="number" placeholder="Ej: 5" value={weight}
            onChange={(e) => { setWeight(e.target.value); setResult(null); }}
            min="0.1" step="0.1" className="flex-1 h-11 text-base sm:text-lg" />
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['kg', 'lb'] as const).map((u) => (
              <button key={u} onClick={() => setWeightUnit(u)}
                className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
                  weightUnit === u ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'
                }`}>
                {u}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className={`h-11 w-11 flex-shrink-0 rounded-xl transition-colors ${showPatientPanel ? 'bg-primary/10 border-primary/30 text-primary' : ''}`}
            onClick={() => setShowPatientPanel(!showPatientPanel)}
            title="Perfiles de pacientes"
          >
            <User size={18} weight={showPatientPanel ? 'Fill' : 'Outline'} />
          </Button>
        </div>
      </div>

      {/* Patient Profiles */}
      <Collapsible open={showPatientPanel} onOpenChange={setShowPatientPanel}>
        <CollapsibleContent>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <PatientProfiles
                  species={petType}
                  onSelectPatient={(patient: Patient) => {
                    setWeight(String(patient.weight));
                    setWeightUnit(patient.weightUnit);
                    setPetType(patient.species);
                    setResult(null);
                  }}
                  currentWeight={weight}
                />
              </CardContent>
            </Card>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>

      {/* Step 3: Activity Level */}
      <div>
        <StepHeading num={3}>Nivel de Actividad</StepHeading>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {ACTIVITY_LEVELS.map((lvl) => (
            <button key={lvl.value}
              onClick={() => { setActivity(lvl.value); setResult(null); setBcs(null); }}
              className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 ${
                effectiveActivity === lvl.value
                  ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                  : 'border-border hover:border-primary/30 bg-card'
              }`}>
              <span className="text-2xl">{lvl.emoji}</span>
              <span className={`font-semibold text-xs sm:text-sm ${effectiveActivity === lvl.value ? 'text-primary' : 'text-foreground'}`}>
                {lvl.label}
              </span>
              <span className="text-[10px] text-muted-foreground">{lvl.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 4: Meals per Day */}
      <div>
        <StepHeading num={4}>Comidas por Día</StepHeading>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button key={n}
              onClick={() => { setMealsPerDay(n); setResult(null); }}
              className={`flex-shrink-0 w-11 h-11 rounded-xl border-2 flex items-center justify-center font-bold text-base transition-all duration-200 ${
                mealsPerDay === n
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
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
            <CircleInfo size={13} weight="Outline" color="oklch(0.55 0.15 165)" className="mt-0.5 flex-shrink-0" />
            <span>
              {bcs <= 3
                ? `BCS ${bcs}/9 detectado: la actividad se ajustó automáticamente a «Bajo» para aumentar la ingesta calórica recomendada.`
                : `BCS ${bcs}/9 detectado: la actividad se ajustó automáticamente a «Alto» para reducir la ingesta calórica recomendada.`}
            </span>
          </motion.div>
        )}
      </div>

      {/* Calculate Button */}
      <div className="pt-2 no-print">
        <Button
          size="lg"
          onClick={handleCalculate}
          disabled={!weight || loading}
          className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20 transition-all"
        >
          {loading ? (
            <span className="flex items-center gap-2"><span className="animate-spin">⚙️</span>Calculando...</span>
          ) : (
            <span className="flex items-center gap-2"><Calculator size={18} weight="Outline" />CALCULAR ALIMENTACIÓN</span>
          )}
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
            initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }} transition={{ duration: 0.25 }}>
            <Card className="result-card shadow-lg card-shine result-glow border-primary/20">
              <CardHeader className="pb-3 border-b border-primary/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-primary text-lg sm:text-xl font-bold">
                    <Scale size={20} weight="Outline" />
                    Alimentación Diaria Recomendada
                  </CardTitle>
                  <div className="flex items-center gap-1 no-print">
                    <Button
                      variant="ghost" size="icon"
                      className="w-8 h-8 rounded-lg"
                      onClick={() => {
                        const text = `VetAssist\nAlimentación Diaria\nEspecie: ${petType} | Peso: ${result.weightKg}kg\nGramos/día: ${result.dailyGrams.recommended}g (${result.dailyGrams.min}-${result.dailyGrams.max}g)\nOnzas/día: ${result.dailyOunces}oz\nTazas/día: ${result.dailyCups}\nComidas/día: ${result.mealsPerDay} (${result.perMealGrams.recommended}g/comida)\nActividad: ${ACTIVITY_LABEL_MAP[effectiveActivity]}\n---\nCalculado con VetAssist`;
                        navigator.clipboard.writeText(text);
                        setCopied(true);
                        addToast('Resultado copiado al portapapeles', 'success');
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      title="Copiar resultado"
                    >
                      {copied ? <Check size={16} weight="Bold" className="text-emerald-500" /> : <Copy size={16} weight="Outline" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  <div className="bg-muted/40 rounded-xl p-2.5 sm:p-3 border border-border/50">
                    <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase">Mínimo</span>
                    <p className="text-base sm:text-xl font-bold text-foreground mt-0.5">{result.dailyGrams.min}g</p>
                    <span className="text-[10px] text-muted-foreground">{result.perMealGrams.min}g/comida</span>
                  </div>
                  <div className="bg-primary/10 rounded-xl p-2.5 sm:p-3 border border-primary/30 ring-1 ring-primary/20">
                    <span className="text-[10px] sm:text-xs font-bold text-primary uppercase">Recomendado</span>
                    <p className="text-lg sm:text-2xl font-black text-primary mt-0.5">{result.dailyGrams.recommended}g</p>
                    <span className="text-[10px] font-semibold text-primary/80">{result.perMealGrams.recommended}g/comida</span>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-2.5 sm:p-3 border border-border/50">
                    <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase">Máximo</span>
                    <p className="text-base sm:text-xl font-bold text-foreground mt-0.5">{result.dailyGrams.max}g</p>
                    <span className="text-[10px] text-muted-foreground">{result.perMealGrams.max}g/comida</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-card rounded-xl p-3 border border-border/60">
                    <span className="text-xs text-muted-foreground block font-medium">Equivalencia en Onzas</span>
                    <p className="text-lg font-bold text-foreground mt-0.5">{result.dailyOunces} oz/día</p>
                  </div>
                  <div className="bg-card rounded-xl p-3 border border-border/60">
                    <span className="text-xs text-muted-foreground block font-medium">Equivalencia en Tazas</span>
                    <p className="text-lg font-bold text-foreground mt-0.5">~{result.dailyCups} tazas/día</p>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-3 text-xs space-y-1 border border-border/40">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requerimiento Energético en Reposo (RER):</span>
                    <strong className="text-foreground">{result.rer} kcal/día</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requerimiento de Mantenimiento (DER):</span>
                    <strong className="text-foreground">{result.der} kcal/día</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comidas programadas:</span>
                    <strong className="text-foreground">{result.mealsPerDay} por día</strong>
                  </div>
                </div>

                <div className="flex gap-2 no-print pt-2">
                  <Button variant="outline" onClick={() => setResult(null)} className="flex-1 rounded-xl">
                    Nuevo Cálculo
                  </Button>
                  <Button variant="outline" onClick={() => window.print()} className="px-4 rounded-xl">
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