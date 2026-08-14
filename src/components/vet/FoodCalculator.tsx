'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cat,
  Scale,
  Paw,
  CircleInfo,
  AlertTriangle,
  Calculator,
  Heart,
} from 'reicon-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { FoodCalculationResult, PetType, ActivityLevel } from '@/lib/food-data';

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; emoji: string; desc: string }[] = [
  { value: 'bajo', label: 'Bajo', emoji: '🛋️', desc: 'Sedentario' },
  { value: 'normal', label: 'Normal', emoji: '🏃', desc: 'Actividad moderada' },
  { value: 'alto', label: 'Alto', emoji: '🏋️', desc: 'Muy activo' },
];

export default function FoodCalculator() {
  const [petType, setPetType] = useState<PetType>('perro');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [activity, setActivity] = useState<ActivityLevel>('normal');
  const [mealsPerDay, setMealsPerDay] = useState(2);
  const [result, setResult] = useState<FoodCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    const w = parseFloat(weight);
    if (!w || w <= 0) {
      setError('Ingrese un peso válido mayor a 0');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/calculate-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petType,
          weight: w,
          weightUnit,
          mealsPerDay,
          activity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al calcular la alimentación');
        return;
      }

      setResult(data);
    } catch {
      setError('Error de conexión. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Decorative images */}
      <div className="relative flex justify-between items-center">
        <img
          src="/images/image-sRbFNlfdBngPHNF1Qansq4jMo87xtP.png"
          alt="Perro divertido"
          className="w-24 opacity-20 vet-float hidden md:block"
        />
        <img
          src="/images/image-75mXdfvt3lvbs8fSCmASg9n6biV6Q5.png"
          alt="Dispensador de comida"
          className="w-24 opacity-20 vet-float hidden md:block"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      {/* Step 1: Pet Type */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Paw size={20} color="oklch(0.55 0.15 165)" weight="outline" />
          1. Tipo de Mascota
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setPetType('perro');
              setResult(null);
            }}
            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 vet-card-hover ${
              petType === 'perro'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <span className="text-4xl">🐕</span>
            <span
              className={`font-semibold ${
                petType === 'perro' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Perro
            </span>
          </button>
          <button
            onClick={() => {
              setPetType('gato');
              setResult(null);
            }}
            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 vet-card-hover ${
              petType === 'gato'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <Cat size={36} weight="outline" color={petType === 'gato' ? 'oklch(0.55 0.15 165)' : 'oklch(0.5 0.02 165)'} />
            <span
              className={`font-semibold ${
                petType === 'gato' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Gato
            </span>
          </button>
        </div>
      </div>

      {/* Step 2: Weight */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Scale size={20} color="oklch(0.55 0.15 165)" weight="outline" />
          2. Peso de la Mascota
        </h3>
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
            step="0.1"
            className="flex-1 h-12 text-lg"
          />
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setWeightUnit('kg')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                weightUnit === 'kg'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-muted'
              }`}
            >
              kg
            </button>
            <button
              onClick={() => setWeightUnit('lb')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                weightUnit === 'lb'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-muted'
              }`}
            >
              lb
            </button>
          </div>
        </div>
      </div>

      {/* Step 3: Activity Level */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Heart size={20} color="oklch(0.55 0.15 165)" weight="outline" />
          3. Nivel de Actividad
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {ACTIVITY_LEVELS.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => {
                setActivity(lvl.value);
                setResult(null);
              }}
              className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 vet-card-hover ${
                activity === lvl.value
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <span className="text-2xl">{lvl.emoji}</span>
              <span
                className={`font-semibold text-sm ${
                  activity === lvl.value ? 'text-primary' : 'text-foreground'
                }`}
              >
                {lvl.label}
              </span>
              <span className="text-xs text-muted-foreground">{lvl.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 4: Meals Per Day */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          🍽️ 4. Comidas por Día
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => {
                setMealsPerDay(n);
                setResult(null);
              }}
              className={`flex-shrink-0 w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                mealsPerDay === n
                  ? 'border-primary bg-primary text-primary-foreground shadow-md'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex flex-col items-center gap-3">
        <Button
          size="lg"
          onClick={handleCalculate}
          disabled={!weight || loading}
          className="vet-pulse text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⚙️</span>
              Calculando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Calculator size={22} weight="outline" />
              CALCULAR ALIMENTACIÓN
            </span>
          )}
        </Button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card border-primary/20 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Scale size={22} weight="outline" />
                  Resultado — Alimentación Diaria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Daily Amount Summary */}
                <div className="bg-primary/5 rounded-xl p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground font-medium">Gramos/Día</p>
                      <p className="text-2xl font-bold text-primary">
                        {result.dailyGrams.recommended}g
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ({result.dailyGrams.min}–{result.dailyGrams.max}g)
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground font-medium">Onzas/Día</p>
                      <p className="text-2xl font-bold text-primary">
                        {result.dailyOunces}oz
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground font-medium">Tazas/Día</p>
                      <p className="text-2xl font-bold text-primary">
                        {result.dailyCups}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground font-medium">Por Comida</p>
                      <p className="text-2xl font-bold text-accent">
                        {result.perMealGrams.recommended}g
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ({result.perMealGrams.min}–{result.perMealGrams.max}g)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Per Meal Detail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      🍽️ Comidas por Día
                    </p>
                    <p className="text-2xl font-bold mt-1">{result.mealsPerDay}</p>
                    <p className="text-sm text-muted-foreground">
                      {result.perMealGrams.recommended}g por comida
                    </p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      📊 Nivel de Actividad
                    </p>
                    <p className="text-sm mt-1 text-muted-foreground">{result.activity}</p>
                  </div>
                </div>

                {/* Weight info */}
                <p className="text-sm text-muted-foreground">
                  <CircleInfo size={14} weight="outline" className="inline mr-1" />
                  Peso utilizado: <strong>{result.weightKg} kg</strong> ({petType})
                </p>

                {/* Info Note */}
                <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                  <AlertTriangle size={18} weight="outline" className="text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                    Esta estimación se basa en alimento seco (croquetas) con ~3.5 kcal/g. 
                    Ajuste según el alimento específico, la condición corporal y las necesidades 
                    individuales del paciente.
                  </AlertDescription>
                </Alert>

                <Button
                  variant="outline"
                  onClick={() => setResult(null)}
                  className="w-full"
                >
                  Nueva Consulta
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
