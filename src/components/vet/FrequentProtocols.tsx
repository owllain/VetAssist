'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardText,
  Pill,
  AlertTriangle,
  Check,
  Copy,
  Calculator,
  Shield,
  CircleInfo,
  User,
  Scale,
  Sparkles,
} from 'reicon-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import AnimalIcon, { AnimalBadge } from './AnimalIcon';
import { protocols, type Protocol, type ProtocolDrug } from '@/lib/protocols';
import { medications, type AnimalType } from '@/lib/medications';
import PatientProfiles from './PatientProfiles';
import type { Patient } from '@/lib/use-patients-store';
import { useVetToast } from './VetToast';

const LB_TO_KG = 0.453592;

interface CalculatedDrug {
  drug: ProtocolDrug;
  doseMinMg: number | null;
  doseMaxMg: number | null;
  doseRecMg: number | null;
  unit: string;
  route: string;
  notes: string;
  brandNames: string[];
}

export default function FrequentProtocols() {
  const [animalType, setAnimalType] = useState<AnimalType>('perro');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [showPatientPanel, setShowPatientPanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addToast } = useVetToast();

  const filteredProtocols = protocols.filter((p) => p.species.includes(animalType));

  const weightKg = parseFloat(weight)
    ? weightUnit === 'lb'
      ? parseFloat(weight) * LB_TO_KG
      : parseFloat(weight)
    : 0;

  // Calculate doses for all drugs in selected protocol
  const calculatedDrugs: CalculatedDrug[] = selectedProtocol && weightKg > 0
    ? selectedProtocol.drugs.map((drug) => {
        const med = medications.find((m) => m.id === drug.medicationId);
        if (med) {
          const doseMinMg = Math.round(med.doseMin * weightKg * 100) / 100;
          const doseMaxMg = Math.round(med.doseMax * weightKg * 100) / 100;
          const doseRecMg = Math.round(((med.doseMin + med.doseMax) / 2) * weightKg * 100) / 100;
          return {
            drug,
            doseMinMg,
            doseMaxMg,
            doseRecMg,
            unit: med.unit.split('/')[0] || 'mg',
            route: med.route.join(', '),
            notes: med.notes || '',
            brandNames: med.brandNames || [],
          };
        }
        return {
          drug,
          doseMinMg: null,
          doseMaxMg: null,
          doseRecMg: null,
          unit: 'dosis estándar',
          route: 'Según indicación',
          notes: '',
          brandNames: [],
        };
      })
    : [];

  const handleCopyProtocol = () => {
    if (!selectedProtocol || weightKg <= 0) return;
    const lines = [
      `VetAssist — Protocolo: ${selectedProtocol.name}`,
      `Especie: ${animalType === 'perro' ? 'Canino' : 'Felino'} | Peso: ${weightKg.toFixed(2)} kg`,
      `Objetivo: ${selectedProtocol.description}`,
      '---',
      ...calculatedDrugs.map((cd) => {
        const doseStr = cd.doseRecMg !== null
          ? `${cd.doseRecMg} ${cd.unit} (Rango: ${cd.doseMinMg}-${cd.doseMaxMg} ${cd.unit})`
          : 'Dosis según indicación';
        return `• ${cd.drug.name}: ${doseStr} | Vía/Instrucción: ${cd.drug.doseNote}`;
      }),
      '---',
      `Notas: ${selectedProtocol.notes}`,
      'Calculado con VetAssist — Asistente veterinario',
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    addToast('Protocolo clínico copiado al portapapeles', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ClipboardText size={20} color="oklch(0.55 0.15 165)" weight="Outline" />
            Protocolos de Uso Frecuente
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Seleccione el peso del paciente y aplique protocolos clínicos preconfigurados
          </p>
        </div>
        <Badge variant="secondary" className="self-start sm:self-center text-xs px-2.5 py-1">
          {filteredProtocols.length} disponibles para {animalType === 'perro' ? 'perros' : 'gatos'}
        </Badge>
      </div>

      {/* Step 1: Species & Weight Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Species */}
        <div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="w-6 h-6 rounded-lg bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
              1
            </span>
            <h4 className="text-sm font-semibold text-foreground">Tipo de Animal</h4>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {(['perro', 'gato'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setAnimalType(type);
                  setSelectedProtocol(null);
                }}
                className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2.5 ${
                  animalType === type
                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                    : 'border-border hover:border-primary/30 bg-card'
                }`}
              >
                <AnimalIcon type={type} size={28} active={animalType === type} />
                <span className={`font-semibold text-sm ${animalType === type ? 'text-primary' : 'text-muted-foreground'}`}>
                  {type === 'perro' ? 'Perro' : 'Gato'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Weight */}
        <div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="w-6 h-6 rounded-lg bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
              2
            </span>
            <h4 className="text-sm font-semibold text-foreground">Peso del Paciente</h4>
          </div>
          <div className="flex gap-2.5 items-center">
            <Input
              type="number"
              placeholder="Ej: 8.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="0.1"
              step="0.1"
              className="flex-1 h-11 text-base"
            />
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(['kg', 'lb'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setWeightUnit(u)}
                  className={`px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                    weightUnit === u ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className={`h-11 w-11 flex-shrink-0 rounded-xl transition-colors ${
                showPatientPanel ? 'bg-primary/10 border-primary/30' : ''
              }`}
              onClick={() => setShowPatientPanel(!showPatientPanel)}
              title="Perfiles de pacientes"
            >
              <User size={18} weight={showPatientPanel ? 'Fill' : 'Outline'} className={showPatientPanel ? 'text-primary' : ''} />
            </Button>
          </div>
        </div>
      </div>

      {/* Patient Profiles Collapsible */}
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
                  }}
                  currentWeight={weight}
                />
              </CardContent>
            </Card>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>

      {/* Step 2: Protocol Selection */}
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-6 h-6 rounded-lg bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
            3
          </span>
          <h4 className="text-sm font-semibold text-foreground">Seleccione el Protocolo a Utilizar</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredProtocols.map((protocol) => {
            const isSelected = selectedProtocol?.id === protocol.id;
            return (
              <button
                key={protocol.id}
                onClick={() => setSelectedProtocol(protocol)}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 flex flex-col justify-between gap-3 relative overflow-hidden ${
                  isSelected
                    ? 'border-primary bg-primary/[0.04] shadow-md shadow-primary/10 ring-1 ring-primary/30'
                    : 'border-border/70 hover:border-primary/40 bg-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: `${protocol.color}20` }}
                  >
                    {protocol.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-foreground leading-tight truncate">
                        {protocol.name}
                      </h4>
                      {isSelected && (
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                          <Check size={12} weight="Bold" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {protocol.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                  <span className="text-muted-foreground font-medium">
                    {protocol.drugs.length} fármacos incluidos
                  </span>
                  <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                    {isSelected ? 'Protocolo Activo' : 'Usar Protocolo →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calculated Protocol Results */}
      <AnimatePresence mode="wait">
        {selectedProtocol && (
          <motion.div
            key={selectedProtocol.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 pt-2"
          >
            <Card className="result-card shadow-lg card-shine result-glow border-primary/25">
              <CardHeader className="pb-3 border-b border-primary/15">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: `${selectedProtocol.color}25` }}
                    >
                      {selectedProtocol.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
                        {selectedProtocol.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedProtocol.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyProtocol}
                      disabled={weightKg <= 0}
                      className="gap-1.5 text-xs h-9"
                    >
                      {copied ? <Check size={14} weight="Bold" className="text-emerald-500" /> : <Copy size={14} weight="Outline" />}
                      <span>{copied ? 'Copiado' : 'Copiar Resumen'}</span>
                    </Button>
                  </div>
                </div>

                {weightKg > 0 ? (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                    <Scale size={14} weight="Outline" color="oklch(0.55 0.15 165)" />
                    <span>
                      Cálculos ajustados para paciente <strong>{animalType === 'perro' ? 'Canino' : 'Felino'}</strong> de{' '}
                      <strong className="text-foreground">{weightKg.toFixed(2)} kg</strong> ({weight} {weightUnit})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/40 text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={14} weight="Outline" />
                    <span>Ingrese el peso del paciente arriba para calcular las dosis exactas en mg / mL.</span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Pill size={14} color="oklch(0.55 0.15 165)" weight="Outline" />
                    Fármacos del Protocolo y Dosificación Calculada
                  </h4>

                  <div className="grid gap-3">
                    {calculatedDrugs.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-card rounded-xl p-3.5 sm:p-4 border border-border/70 hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground">
                              {item.drug.name}
                            </span>
                            {item.route && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/40">
                                {item.route}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {item.drug.doseNote}
                          </p>
                          {item.brandNames && item.brandNames.length > 0 && (
                            <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                              <Shield size={11} weight="Outline" className="text-primary/70" />
                              Marcas en CR: {item.brandNames.slice(0, 3).join(', ')}
                            </p>
                          )}
                        </div>

                        {weightKg > 0 && item.doseRecMg !== null ? (
                          <div className="bg-primary/10 rounded-xl px-4 py-2 text-right sm:min-w-[140px] flex sm:flex-col items-center sm:items-end justify-between border border-primary/20">
                            <span className="text-[10px] uppercase font-semibold text-primary/80">
                              Dosis calculada
                            </span>
                            <span className="text-base sm:text-lg font-extrabold text-primary leading-tight">
                              {item.doseRecMg} {item.unit}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ({item.doseMinMg} - {item.doseMaxMg} {item.unit})
                            </span>
                          </div>
                        ) : (
                          <div className="bg-muted/40 rounded-xl px-3 py-2 text-xs text-muted-foreground text-center">
                            {weightKg > 0 ? 'Dosis fija / tópica' : 'Requiere peso'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Protocol Warning Notes */}
                {selectedProtocol.notes && (
                  <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200">
                    <AlertTriangle size={16} weight="Outline" className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <AlertDescription className="text-xs leading-relaxed">
                      <strong>Consideraciones Clínicas:</strong> {selectedProtocol.notes}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
