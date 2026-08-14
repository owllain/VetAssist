'use client';

import { useState, useMemo, useCallback } from 'react';
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
  ChevronDown,
  Search,
  Printer,
  Clock,
  Star,
  ClipboardList,
  Copy,
  Trash,
} from 'reicon-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
  type Medication,
  type AnimalType,
  medicationCategories,
  getMedicationsByCategory,
  medications,
} from '@/lib/medications';
import { addFavorite, removeFavorite, isFavorite } from '@/lib/favorites';
import type { FavoriteMed } from '@/lib/favorites';
import FavoritesPanel from './FavoritesPanel';
import DoseReferenceTable from './DoseReferenceTable';
import { useHistory, useAddHistory, useClearHistory } from '@/lib/use-history-store';

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



function StepHeading({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold mb-3 flex items-center gap-2.5">
      <span className="step-number">{num}</span>
      {children}
    </h3>
  );
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
  const [searchQuery, setSearchQuery] = useState('');
  const history = useHistory('medication');
  const addHistory = useAddHistory();
  const [showFavorites, setShowFavorites] = useState(false);
  const [showRefTable, setShowRefTable] = useState(false);
  const [favTick, setFavTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const clearHistory = useClearHistory();

  const handleSelectFavorite = useCallback((fav: FavoriteMed) => {
    setSelectedCategory(fav.category);
    setSearchQuery('');
    const med = medications.find((m) => m.id === fav.medicationId);
    if (med) {
      setSelectedMedication(med);
      setResult(null);
    }
  }, []);

  const toggleFav = useCallback((med: Medication) => {
    if (isFavorite(med.id)) {
      removeFavorite(med.id);
    } else {
      addFavorite({
        medicationId: med.id,
        name: med.name,
        genericName: med.genericName,
        category: med.categoryId,
        species: med.species,
      });
    }
    setFavTick((t) => t + 1);
  }, []);

  const filteredMedications = useMemo(() => {
    if (!selectedCategory) return [];
    let meds = getMedicationsByCategory(selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      meds = meds.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.genericName.toLowerCase().includes(q) ||
          (m.brandNames && m.brandNames.some((b) => b.toLowerCase().includes(q)))
      );
    }
    return meds;
  }, [selectedCategory, searchQuery, favTick]);

  const canCalculate = selectedMedication && weight && parseFloat(weight) > 0;

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
      // Save to history
      const unit = data.calculatedDose.unit.split('/')[0];
      addHistory({
        type: 'medication',
        timestamp: Date.now(),
        summary: `${data.medication.name} | ${animalType} ${data.weightKg}kg | ${data.calculatedDose.recommended}${unit}`,
      });
      // history auto-updates via useSyncExternalStore
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
            {history.slice(0, 5).map((h, i) => (
              <div
                key={i}
                className="flex-shrink-0 bg-muted/60 rounded-lg px-3 py-1.5 text-xs text-muted-foreground border border-border/50"
              >
                {h.summary}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Animal Type */}
      <div>
        <StepHeading num={1}>Tipo de Animal</StepHeading>
        <div className="grid grid-cols-2 gap-3">
          {(['perro', 'gato'] as const).map((type) => (
            <button
              key={type}
              onClick={() => { setAnimalType(type); setSelectedMedication(null); setResult(null); }}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                animalType === type
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {type === 'perro' ? (
                <span className="text-4xl">🐕</span>
              ) : (
                <Cat size={36} weight="outline" color={animalType === 'gato' ? 'oklch(0.55 0.15 165)' : 'oklch(0.5 0.02 165)'} />
              )}
              <span className={`font-semibold ${animalType === type ? 'text-primary' : 'text-muted-foreground'}`}>
                {type === 'perro' ? 'Perro' : 'Gato'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Weight */}
      <div>
        <StepHeading num={2}>Peso del Animal</StepHeading>
        <div className="flex gap-3 items-center">
          <Input
            type="number"
            placeholder="Ej: 5"
            value={weight}
            onChange={(e) => { setWeight(e.target.value); setResult(null); }}
            min="0.1"
            step="0.1"
            className="flex-1 h-12 text-lg"
          />
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['kg', 'lb'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setWeightUnit(u)}
                className={`px-4 py-3 text-sm font-semibold transition-colors ${
                  weightUnit === u ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 3: Category Selection */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <StepHeading num={3}>Categoría de Medicamento</StepHeading>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFavorites(true)}
            className="flex-shrink-0 gap-1.5 text-xs no-print"
          >
            <Star size={14} weight="fill" className="text-amber-500" />
            Favoritos
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-print">
          {medicationCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id === selectedCategory ? null : cat.id);
                setSelectedMedication(null);
                setResult(null);
                setSearchQuery('');
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                  : 'bg-card border-border hover:border-primary/30 hover:bg-primary/5'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 4: Medication List with Search */}
      <AnimatePresence mode="wait">
        {selectedCategory && filteredMedications.length > 0 && (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <StepHeading num={4}>Seleccione un Medicamento</StepHeading>
              <div className="relative w-40 flex-shrink-0 no-print">
                <Search size={14} weight="outline" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-sm pl-8"
                />
              </div>
            </div>

            {/* Dose Reference Table - collapsible */}
            <Collapsible open={showRefTable} onOpenChange={setShowRefTable} className="mb-3 no-print">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between gap-2 text-xs text-muted-foreground hover:text-foreground h-8 px-2"
                >
                  <span className="flex items-center gap-1.5">
                    <ClipboardList size={14} weight="outline" />
                    Ver tabla de referencia
                  </span>
                  <motion.span
                    animate={{ rotate: showRefTable ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={14} weight="outline" />
                  </motion.span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DoseReferenceTable categoryId={selectedCategory} animalType={animalType} />
                </motion.div>
              </CollapsibleContent>
            </Collapsible>

            <div className="grid gap-2.5 max-h-[400px] overflow-y-auto pr-1">
              {filteredMedications.map((med) => {
                const isAvailable = med.species.includes(animalType);
                const isSelected = selectedMedication?.id === med.id;
                const medIsFav = isFavorite(med.id);

                return (
                  <Card
                    key={med.id}
                    className={`med-card cursor-pointer ${isSelected ? 'selected' : ''} ${
                      !isAvailable ? 'opacity-40 pointer-events-none' : ''
                    }`}
                    onClick={() => {
                      if (!isAvailable) return;
                      setSelectedMedication(isSelected ? null : med);
                      setResult(null);
                    }}
                  >
                    <CardContent className="p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm">{med.name}</h4>
                            {med.species.map((s) => (
                              <Badge
                                key={s}
                                variant={s === animalType ? 'default' : 'secondary'}
                                className="text-[10px] px-1.5 py-0"
                              >
                                {s === 'perro' ? '🐕' : '🐈'} {s}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{med.genericName}</p>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] font-semibold text-primary border-primary/30">
                              {med.doseMin === med.doseMax
                                ? `${med.doseMin} ${med.unit}`
                                : `${med.doseMin}–${med.doseMax} ${med.unit}`}
                            </Badge>
                            {med.route.map((r) => (
                              <Badge key={r} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFav(med);
                            }}
                            className={`p-1 rounded-md transition-all hover:bg-amber-100 dark:hover:bg-amber-900/30 ${
                              medIsFav ? 'text-amber-500' : 'text-muted-foreground/30 hover:text-amber-400'
                            }`}
                            title={medIsFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                          >
                            <Star size={16} weight={medIsFav ? 'fill' : 'outline'} />
                          </button>
                          <ChevronRight
                            size={18} weight="outline"
                            className={`transition-all ${isSelected ? 'text-primary rotate-90' : 'text-muted-foreground/40'}`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}
        {selectedCategory && filteredMedications.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            <Search size={32} weight="outline" className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No se encontraron medicamentos</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calculate Button */}
      <AnimatePresence>
        {selectedMedication && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-3 no-print"
          >
            <Button
              size="lg"
              onClick={handleCalculate}
              disabled={!canCalculate || loading}
              className="vet-pulse text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20"
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
            <p className="text-sm text-muted-foreground">
              {selectedMedication.name} — {selectedMedication.genericName}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="result-card shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Stethoscope size={18} weight="outline" />
                    </div>
                    Resultado del Cálculo
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    {result.medication.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const med = medications.find((m) => m.id === result.medication.id);
                          if (med) toggleFav(med);
                        }}
                        className={`no-print h-8 w-8 ${
                          isFavorite(result.medication.id)
                            ? 'text-amber-500'
                            : 'text-muted-foreground/40 hover:text-amber-400'
                        }`}
                        title={
                          isFavorite(result.medication.id)
                            ? 'Quitar de favoritos'
                            : 'Agregar a favoritos'
                        }
                      >
                        <Star
                          size={16}
                          weight={isFavorite(result.medication.id) ? 'fill' : 'outline'}
                        />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const unit = result.calculatedDose.unit.split('/')[0];
                        const text = `VetCalc CR\nMedicamento: ${result.medication.name}\nEspecie: ${animalType} | Peso: ${result.weightKg}kg\nDosis recomendada: ${result.calculatedDose.recommended} ${unit}\nRango: ${result.calculatedDose.min}-${result.calculatedDose.max} ${unit}\nVía: ${result.routes.join(', ')}\nFrecuencia: ${result.frequency.join(', ')}\n---\nCalculado con VetCalc CR`;
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.print()}
                      className="no-print h-8 w-8 text-muted-foreground hover:text-primary"
                      title="Imprimir"
                    >
                      <Printer size={16} weight="outline" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Medication Info */}
                <div className="dose-highlight p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Pill size={24} color="oklch(0.55 0.15 165)" weight="outline" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg leading-tight">{result.medication.name}</h4>
                      <p className="text-sm text-muted-foreground">{result.medication.genericName}</p>
                    </div>
                  </div>
                </div>

                {/* Dose Results */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-primary/5 rounded-xl p-3 text-center border border-primary/10">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Mínima</p>
                    <p className="text-2xl font-extrabold text-primary mt-1">
                      {result.calculatedDose.min}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {result.calculatedDose.unit.split('/')[0]}
                    </p>
                  </div>
                  <div className="bg-accent/10 rounded-xl p-3 text-center border border-accent/20">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Recomendada</p>
                    <p className="text-2xl font-extrabold text-accent mt-1">
                      {result.calculatedDose.recommended}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {result.calculatedDose.unit.split('/')[0]}
                    </p>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-3 text-center border border-primary/10">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Máxima</p>
                    <p className="text-2xl font-extrabold text-primary mt-1">
                      {result.calculatedDose.max}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {result.calculatedDose.unit.split('/')[0]}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Syringe size={14} color="oklch(0.55 0.15 165)" weight="outline" />
                      <p className="font-semibold text-xs uppercase tracking-wider">Vía de Administración</p>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {result.routes.map((r) => (
                        <Badge key={r} variant="outline" className="text-xs font-medium">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <HeartPulse size={14} color="oklch(0.55 0.15 165)" weight="outline" />
                      <p className="font-semibold text-xs uppercase tracking-wider">Frecuencia</p>
                    </div>
                    {result.frequency.map((f) => (
                      <p key={f} className="text-muted-foreground text-xs">{f}</p>
                    ))}
                  </div>
                </div>

                {/* Weight note */}
                <p className="text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2 flex items-center gap-1.5">
                  <CircleInfo size={13} weight="outline" />
                  <span>Peso utilizado: <strong>{result.weightKg} kg</strong></span>
                </p>

                {/* Notes Warning */}
                {result.notes && (
                  <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                    <AlertTriangle size={18} weight="outline" className="text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                      {result.notes}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Brand Names */}
                {result.medication.brandNames && result.medication.brandNames.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Shield size={14} color="oklch(0.55 0.15 165)" weight="outline" />
                      <p className="text-xs font-semibold uppercase tracking-wider">Nombres Comerciales en CR</p>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {result.medication.brandNames.map((b) => (
                        <Badge key={b} variant="secondary" className="text-xs font-medium">
                          {b}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 no-print">
                  <Button variant="outline" onClick={handleReset} className="flex-1">
                    Calcular Otro Medicamento
                  </Button>
                  <Button variant="outline" onClick={() => window.print()} className="px-4">
                    <Printer size={16} weight="outline" className="mr-1.5" />
                    Imprimir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorites Panel */}
      <FavoritesPanel
        onSelectMedication={handleSelectFavorite}
        currentMedicationId={selectedMedication?.id}
        open={showFavorites}
        onOpenChange={setShowFavorites}
      />
    </div>
  );
}
