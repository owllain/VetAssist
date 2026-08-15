'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse,
  Pill,
  Stethoscope,
  Shield,
  Syringe,
  Scale,
  Calculator,
  AlertTriangle,
  CircleInfo,
  Warning,
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
  User,
  Notebook,
} from 'reicon-react';
import AnimalIcon, { AnimalBadge } from './AnimalIcon';
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
import type { FavoriteMed } from '@/lib/favorites';
import { useToggleFavorite, useFavorites } from '@/lib/use-favorites-store';
import FavoritesPanel from './FavoritesPanel';
import DoseReferenceTable from './DoseReferenceTable';
import DrugInteractionChecker from './DrugInteractionChecker';
import { useHistory, useAddHistory, useClearHistory } from '@/lib/use-history-store';
import PatientProfiles from './PatientProfiles';
import type { Patient } from '@/lib/use-patients-store';
import { validateDose } from '@/lib/dose-validation';
import ConcentrationCalculator from './ConcentrationCalculator';
import { useVetToast } from './VetToast';

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

interface MedicationCalculatorProps {
  onOpenNotes?: () => void;
}

function StepHeading({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-2.5">
      <span className="w-6 h-6 rounded-lg bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
        {num}
      </span>
      <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
        {children}
      </h3>
    </div>
  );
}

export default function MedicationCalculator({ onOpenNotes }: MedicationCalculatorProps) {
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
  const [showPatientPanel, setShowPatientPanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const clearHistory = useClearHistory();
  const toggleFav = useToggleFavorite();
  const favorites = useFavorites();
  const favIdSet = new Set(favorites.map((f) => f.medicationId));
  const { addToast } = useVetToast();

  const handleSelectFavorite = useCallback((fav: FavoriteMed) => {
    setSelectedCategory(fav.category);
    setSearchQuery('');
    const med = medications.find((m) => m.id === fav.medicationId);
    if (med) {
      setSelectedMedication(med);
      setResult(null);
    }
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
  }, [selectedCategory, searchQuery]);

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
      const unit = data.calculatedDose.unit.split('/')[0];
      addHistory({
        type: 'medication',
        timestamp: Date.now(),
        summary: `${data.medication.name} | ${animalType} ${data.weightKg}kg | ${data.calculatedDose.recommended}${unit}`,
      });
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
    <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Top Quick Actions Bar (Favoritos, Notas Rápidas, Pacientes) */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/40 no-print">
        <div className="flex items-center gap-2">
          <Pill size={18} color="oklch(0.55 0.15 165)" weight="Outline" />
          <span className="text-sm font-bold text-foreground">Dosificación de Fármacos</span>
        </div>

        {/* Square Rounded Action Toolbar */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFavorites(true)}
            className="w-9 h-9 rounded-xl border border-border/80 bg-card hover:bg-muted/80 shadow-sm transition-all"
            title="Medicamentos Favoritos"
            aria-label="Abrir favoritos"
          >
            <Star size={16} weight="Fill" className="text-amber-500" />
          </Button>

          {onOpenNotes && (
            <Button
              variant="outline"
              size="icon"
              onClick={onOpenNotes}
              className="w-9 h-9 rounded-xl border border-border/80 bg-card hover:bg-muted/80 shadow-sm transition-all"
              title="Notas Clínicas Rápidas"
              aria-label="Abrir notas clínicas"
            >
              <Notebook size={16} weight="Outline" className="text-primary" />
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowPatientPanel(!showPatientPanel)}
            className={`w-9 h-9 rounded-xl border shadow-sm transition-all ${
              showPatientPanel
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'border-border/80 bg-card hover:bg-muted/80 text-foreground'
            }`}
            title="Gestión de Pacientes"
            aria-label="Perfiles de pacientes"
          >
            <User size={16} weight={showPatientPanel ? 'Fill' : 'Outline'} />
          </Button>
        </div>
      </div>

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
              onClick={() => {
                setAnimalType(type);
                setSelectedMedication(null);
                setResult(null);
              }}
              className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                animalType === type
                  ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                  : 'border-border hover:border-primary/30 bg-card'
              }`}
            >
              <AnimalIcon type={type} size={36} active={animalType === type} />
              <span className={`font-semibold text-sm ${animalType === type ? 'text-primary' : 'text-muted-foreground'}`}>
                {type === 'perro' ? 'Perro' : 'Gato'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Weight */}
      <div>
        <StepHeading num={2}>Peso del Animal</StepHeading>
        <div className="flex gap-2.5 items-center">
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
            className="flex-1 h-11 text-base sm:text-lg"
          />
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['kg', 'lb'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setWeightUnit(u)}
                className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
                  weightUnit === u ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Profiles (collapsible) */}
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
                  species={animalType}
                  onSelectPatient={(patient: Patient) => {
                    setWeight(String(patient.weight));
                    setWeightUnit(patient.weightUnit);
                    setAnimalType(patient.species);
                    setResult(null);
                  }}
                  currentWeight={weight}
                />
              </CardContent>
            </Card>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>

      {/* Step 3: Category Selection */}
      <div>
        <StepHeading num={3}>Categoría de Medicamentos</StepHeading>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 no-print">
          {medicationCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id === selectedCategory ? null : cat.id);
                setSelectedMedication(null);
                setResult(null);
                setSearchQuery('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                  : 'bg-card border-border hover:border-primary/40 text-foreground'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 4: Medication Selection */}
      <AnimatePresence mode="wait">
        {selectedCategory && (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <StepHeading num={4}>Seleccione el Medicamento</StepHeading>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRefTable(!showRefTable)}
                className="text-xs h-7 gap-1 text-muted-foreground"
              >
                <ClipboardList size={13} weight="Outline" />
                {showRefTable ? 'Ocultar tabla' : 'Ver tabla de dosis'}
              </Button>
            </div>

            {/* Reference Table (collapsible) */}
            {showRefTable && (
              <DoseReferenceTable
                category={selectedCategory}
                species={animalType}
                onSelectMedication={(med) => {
                  setSelectedMedication(med);
                  setResult(null);
                  setShowRefTable(false);
                }}
              />
            )}

            {/* Search Input */}
            <div className="relative">
              <Search
                size={16}
                weight="Outline"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Buscar por nombre genérico o comercial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
            </div>

            {/* Medication List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {filteredMedications.map((med) => {
                const isSelected = selectedMedication?.id === med.id;
                const isFav = favIdSet.has(med.id);
                const isAvailableForSpecies = med.species.includes(animalType);

                return (
                  <button
                    key={med.id}
                    disabled={!isAvailableForSpecies}
                    onClick={() => {
                      setSelectedMedication(med);
                      setResult(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 relative ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : isAvailableForSpecies
                          ? 'border-border bg-card hover:border-primary/30'
                          : 'border-border/40 bg-muted/30 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-sm leading-tight text-foreground">
                          {med.name}
                        </span>
                        {med.species.map((s) => (
                          <AnimalBadge key={s} type={s} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {med.doseMin}-{med.doseMax} {med.unit}
                      </p>
                      {med.brandNames && med.brandNames.length > 0 && (
                        <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">
                          {med.brandNames.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFav(med.id, med.categoryId);
                        addToast(
                          isFav ? `${med.name} eliminado de favoritos` : `${med.name} añadido a favoritos`,
                          isFav ? 'info' : 'success'
                        );
                      }}
                      className="text-muted-foreground hover:text-amber-500 transition-colors p-1"
                      title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    >
                      <Star size={14} weight={isFav ? 'Fill' : 'Outline'} className={isFav ? 'text-amber-500' : ''} />
                    </button>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drug Interaction Warning */}
      {selectedMedication && (
        <DrugInteractionChecker currentMedicationId={selectedMedication.id} />
      )}

      {/* Calculate Button */}
      <div className="pt-2 no-print">
        <Button
          size="lg"
          onClick={handleCalculate}
          disabled={!canCalculate || loading}
          className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20 transition-all"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⚙️</span>
              Calculando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Calculator size={18} weight="Outline" />
              CALCULAR DOSIS
            </span>
          )}
        </Button>
      </div>

      {/* Error Message */}
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

      {/* Calculation Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="result-card shadow-lg card-shine result-glow border-primary/20">
              <CardHeader className="pb-3 border-b border-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2">
                      <Pill size={20} weight="Outline" />
                      {result.medication.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {result.medication.genericName} • {result.medication.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 no-print">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg"
                      onClick={() => {
                        const text = `VetAssist\n${result.medication.name}\nPaciente: ${animalType} (${result.weightKg} kg)\nDosis Recomendada: ${result.calculatedDose.recommended} ${result.calculatedDose.unit}\nRango: ${result.calculatedDose.min} - ${result.calculatedDose.max} ${result.calculatedDose.unit}\nVía: ${result.routes.join(', ')}\nFrecuencia: ${result.frequency.join(', ')}\n---\nCalculado con VetAssist`;
                        navigator.clipboard.writeText(text);
                        setCopied(true);
                        addToast('Dosis copiada al portapapeles', 'success');
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      title="Copiar resultado"
                    >
                      <Copy size={16} weight="Outline" className={copied ? 'text-emerald-500' : ''} />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-4">
                {/* Dose Cards */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  <div className="bg-muted/40 rounded-xl p-2.5 sm:p-3 border border-border/50">
                    <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase">Mínima</span>
                    <p className="text-base sm:text-xl font-bold text-foreground mt-0.5">
                      {result.calculatedDose.min}
                    </p>
                    <span className="text-[10px] text-muted-foreground">{result.calculatedDose.unit}</span>
                  </div>

                  <div className="bg-primary/10 rounded-xl p-2.5 sm:p-3 border border-primary/30 ring-1 ring-primary/20">
                    <span className="text-[10px] sm:text-xs font-bold text-primary uppercase">Recomendada</span>
                    <p className="text-lg sm:text-2xl font-black text-primary mt-0.5">
                      {result.calculatedDose.recommended}
                    </p>
                    <span className="text-[10px] font-semibold text-primary/80">{result.calculatedDose.unit}</span>
                  </div>

                  <div className="bg-muted/40 rounded-xl p-2.5 sm:p-3 border border-border/50">
                    <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase">Máxima</span>
                    <p className="text-base sm:text-xl font-bold text-foreground mt-0.5">
                      {result.calculatedDose.max}
                    </p>
                    <span className="text-[10px] text-muted-foreground">{result.calculatedDose.unit}</span>
                  </div>
                </div>

                {/* Concentration Calculator */}
                <ConcentrationCalculator calculatedDose={result.calculatedDose.recommended} />

                {/* Administration Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-card rounded-xl p-3 border border-border/60">
                    <span className="font-semibold text-foreground block mb-1">Vías de Administración:</span>
                    <div className="flex gap-1 flex-wrap">
                      {result.routes.map((r) => (
                        <Badge key={r} variant="secondary" className="text-xs">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card rounded-xl p-3 border border-border/60">
                    <span className="font-semibold text-foreground block mb-1">Frecuencia Habitual:</span>
                    <div className="space-y-0.5 text-muted-foreground">
                      {result.frequency.map((f) => (
                        <p key={f}>{f}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes Warning */}
                {result.notes && (
                  <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200">
                    <AlertTriangle size={16} weight="Outline" className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <AlertDescription className="text-xs leading-relaxed">
                      {result.notes}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Brand Names */}
                {result.medication.brandNames && result.medication.brandNames.length > 0 && (
                  <div className="bg-muted/30 rounded-xl p-3 border border-border/40">
                    <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                      <Shield size={13} color="oklch(0.55 0.15 165)" weight="Outline" />
                      Nombres Comerciales en Costa Rica:
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {result.medication.brandNames.map((b) => (
                        <Badge key={b} variant="secondary" className="text-xs">
                          {b}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 no-print pt-2">
                  <Button variant="outline" onClick={handleReset} className="flex-1 rounded-xl">
                    Calcular Otro Medicamento
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
