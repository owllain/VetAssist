'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse,
  Pill,
  Stethoscope,
  Shield,
  Syringe,
  Cat,
  Scale,
  Calculator,
  AlertTriangle,
  CircleInfo,
  MedicalKit,
  Paw,
  ChevronRight,
} from 'reicon-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  type Medication,
  type AnimalType,
  medicationCategories,
  getMedicationsByCategory,
} from '@/lib/medications';

interface CalcResult {
  medication: {
    id: string;
    name: string;
    genericName: string;
    category: string;
    brandNames: string[];
  };
  calculatedDose: {
    min: number;
    max: number;
    recommended: number;
    unit: string;
  };
  weightKg: number;
  routes: string[];
  frequency: string[];
  notes: string;
}

export default function MedicationCalculator() {
  const [animalType, setAnimalType] = useState<AnimalType>('perro');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredMedications = useMemo(() => {
    if (!selectedCategory) return [];
    return getMedicationsByCategory(selectedCategory);
  }, [selectedCategory]);

  const canCalculate =
    selectedMedication && weight && parseFloat(weight) > 0;

  const handleCalculate = async () => {
    if (!selectedMedication || !weight) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/calculate-medication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: selectedMedication.id,
          animalType,
          weight: parseFloat(weight),
          weightUnit,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al calcular la dosis');
        return;
      }

      setResult(data);
    } catch {
      setError('Error de conexión. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedMedication(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Decorative medical image */}
      <div className="relative flex justify-end">
        <img
          src="/images/image-nOUH6YKKp7g0jxLsV9hiwFszoZaMyR.png"
          alt="Elementos médicos"
          className="w-28 opacity-30 vet-float hidden md:block"
        />
      </div>

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
              setSelectedMedication(null);
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
              setSelectedMedication(null);
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

      {/* Step 3: Category Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MedicalKit size={20} color="oklch(0.55 0.15 165)" weight="outline" />
          3. Categoría de Medicamento
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {medicationCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id === selectedCategory ? null : cat.id);
                setSelectedMedication(null);
                setResult(null);
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-card border-border hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 4: Medication List */}
      <AnimatePresence mode="wait">
        {selectedCategory && filteredMedications.length > 0 && (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Pill size={20} color="oklch(0.55 0.15 165)" weight="outline" />
              4. Seleccione un Medicamento
            </h3>
            <div className="grid gap-3 max-h-96 overflow-y-auto pr-1">
              {filteredMedications.map((med) => {
                const isAvailable = med.species.includes(animalType);
                const isSelected = selectedMedication?.id === med.id;

                return (
                  <Card
                    key={med.id}
                    className={`vet-card-hover cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 ring-primary shadow-md'
                        : ''
                    } ${
                      !isAvailable ? 'opacity-50' : ''
                    }`}
                    onClick={() => {
                      if (!isAvailable) return;
                      setSelectedMedication(
                        isSelected ? null : med
                      );
                      setResult(null);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-base">{med.name}</h4>
                            {med.species.map((s) => (
                              <Badge
                                key={s}
                                variant={
                                  s === animalType
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {s === 'perro' ? '🐕' : '🐈'} {s}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {med.genericName}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
                              {med.doseMin === med.doseMax
                                ? `${med.doseMin} ${med.unit}`
                                : `${med.doseMin}-${med.doseMax} ${med.unit}`}
                            </Badge>
                            {med.route.map((r) => (
                              <Badge key={r} variant="secondary" className="text-xs">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <ChevronRight
                          size={20}
                          className={`flex-shrink-0 mt-1 transition-colors ${
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          }`}
                          weight="outline"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calculate Button */}
      <AnimatePresence>
        {selectedMedication && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-3"
          >
            <Button
              size="lg"
              onClick={handleCalculate}
              disabled={!canCalculate || loading}
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
                  CALCULAR DOSIS
                </span>
              )}
            </Button>
            {selectedMedication && (
              <p className="text-sm text-muted-foreground">
                {selectedMedication.name} — {selectedMedication.genericName}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
                  <Stethoscope size={22} weight="outline" />
                  Resultado del Cálculo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Medication Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Pill size={20} color="oklch(0.55 0.15 165)" weight="outline" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{result.medication.name}</h4>
                    <p className="text-sm text-muted-foreground">{result.medication.genericName}</p>
                  </div>
                </div>

                {/* Dose Results */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-primary/5 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground font-medium">Dosis Mínima</p>
                    <p className="text-2xl font-bold text-primary">
                      {result.calculatedDose.min}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.calculatedDose.unit.split('/')[0]}
                    </p>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground font-medium">Dosis Recomendada</p>
                    <p className="text-2xl font-bold text-accent">
                      {result.calculatedDose.recommended}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.calculatedDose.unit.split('/')[0]}
                    </p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground font-medium">Dosis Máxima</p>
                    <p className="text-2xl font-bold text-primary">
                      {result.calculatedDose.max}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.calculatedDose.unit.split('/')[0]}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Syringe size={16} color="oklch(0.55 0.15 165)" weight="outline" className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Vía de Administración</p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {result.routes.map((r) => (
                          <Badge key={r} variant="outline" className="text-xs">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <HeartPulse size={16} color="oklch(0.55 0.15 165)" weight="outline" className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Frecuencia</p>
                      {result.frequency.map((f) => (
                        <p key={f} className="text-muted-foreground">{f}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weight note */}
                <p className="text-sm text-muted-foreground">
                  <CircleInfo size={14} weight="outline" className="inline mr-1" />
                  Peso utilizado: <strong>{result.weightKg} kg</strong>
                </p>

                {/* Notes Warning */}
                {result.notes && (
                  <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                    <AlertTriangle size={18} weight="outline" className="text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                      {result.notes}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Brand Names */}
                {result.medication.brandNames && result.medication.brandNames.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Shield size={16} color="oklch(0.55 0.15 165)" weight="outline" className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Nombres Comerciales en CR</p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {result.medication.brandNames.map((b) => (
                          <Badge key={b} variant="secondary" className="text-xs">
                            {b}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full mt-2"
                >
                  Calcular Otro Medicamento
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative pill image */}
      <div className="relative flex justify-start">
        <img
          src="/images/image-6YCD688sjOC1kmBZgegAoQNGOCBOuQ.png"
          alt="Medicina"
          className="w-24 opacity-20 vet-float hidden md:block"
          style={{ animationDelay: '2s' }}
        />
      </div>
    </div>
  );
}
