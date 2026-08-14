'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Cat,
  Scale,
  Paw,
  CircleInfo,
  AlertTriangle,
  MedicalKit,
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

const DOSE_UNITS = [
  { value: 'mg/kg', label: 'mg/kg' },
  { value: 'mcg/kg', label: 'mcg/kg' },
  { value: 'g/kg', label: 'g/kg' },
  { value: 'UI/kg', label: 'UI/kg' },
  { value: 'mL/kg', label: 'mL/kg' },
];

export default function FreeModeCalculator() {
  const [animalType, setAnimalType] = useState<AnimalType>('perro');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [dosePerKg, setDosePerKg] = useState('');
  const [doseUnit, setDoseUnit] = useState('mg/kg');
  const [result, setResult] = useState<{ total: number; unit: string; weightKg: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const w = parseFloat(weight);
    const d = parseFloat(dosePerKg);

    if (!w || w <= 0) {
      setError('Ingrese un peso válido mayor a 0');
      return;
    }
    if (!d || d <= 0) {
      setError('Ingrese una dosis por kg válida mayor a 0');
      return;
    }

    const weightKg = weightUnit === 'lb' ? w * 0.453592 : w;
    const total = Math.round(d * weightKg * 1000) / 1000;
    const displayUnit = doseUnit.split('/')[0] || doseUnit;

    setResult({ total, unit: displayUnit, weightKg: Math.round(weightKg * 100) / 100 });
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Animal Type */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Paw size={20} color="oklch(0.55 0.15 165)" weight="outline" />
          1. Tipo de Animal
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setAnimalType('perro');
              setResult(null);
            }}
            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 vet-card-hover ${
              animalType === 'perro'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <span className="text-4xl">🐕</span>
            <span
              className={`font-semibold ${
                animalType === 'perro' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Perro
            </span>
          </button>
          <button
            onClick={() => {
              setAnimalType('gato');
              setResult(null);
            }}
            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 vet-card-hover ${
              animalType === 'gato'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <Cat size={36} weight="outline" color={animalType === 'gato' ? 'oklch(0.55 0.15 165)' : 'oklch(0.5 0.02 165)'} />
            <span
              className={`font-semibold ${
                animalType === 'gato' ? 'text-primary' : 'text-muted-foreground'
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
          2. Peso del Animal
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

      {/* Step 3: Custom Dose */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MedicalKit size={20} color="oklch(0.55 0.15 165)" weight="outline" />
          3. Dosis Personalizada
        </h3>
        <div className="flex gap-3 items-center">
          <Input
            type="number"
            placeholder="Ej: 10"
            value={dosePerKg}
            onChange={(e) => {
              setDosePerKg(e.target.value);
              setResult(null);
            }}
            min="0.001"
            step="0.1"
            className="flex-1 h-12 text-lg"
          />
          <Select
            value={doseUnit}
            onValueChange={(val) => {
              setDoseUnit(val);
              setResult(null);
            }}
          >
            <SelectTrigger className="w-28 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOSE_UNITS.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex flex-col items-center gap-3">
        <Button
          size="lg"
          onClick={handleCalculate}
          disabled={!weight || !dosePerKg}
          className="vet-pulse text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
        >
          <span className="flex items-center gap-2">
            <Calculator size={22} weight="outline" />
            CALCULAR DOSIS LIBRE
          </span>
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
                  <Calculator size={22} weight="outline" />
                  Resultado — Modo Libre
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-primary/5 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground font-medium">Dosis Total</p>
                    <p className="text-3xl font-bold text-primary mt-1">
                      {result.total}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{result.unit}</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground font-medium">Fórmula</p>
                    <p className="text-sm font-medium mt-2">
                      {dosePerKg} {doseUnit} × {result.weightKg} kg
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      = {result.total} {result.unit}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  <CircleInfo size={14} weight="outline" className="inline mr-1" />
                  Peso utilizado: <strong>{result.weightKg} kg</strong>
                </p>

                <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                  <AlertTriangle size={18} weight="outline" className="text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                    Este es un cálculo de referencia. Siempre verifique con las guías de dosificación
                    oficiales del medicamento y la condición clínica del paciente.
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
