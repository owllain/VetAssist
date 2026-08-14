'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Warning, AlertTriangle, Information, ChevronDown, Shield, Check,
} from 'reicon-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { medications } from '@/lib/medications';
import { checkInteraction, getInteractionsForDrug, severityConfig } from '@/lib/drug-interactions';
import type { DrugInteraction } from '@/lib/drug-interactions';

const severityIcon = {
  alta: Warning,
  media: AlertTriangle,
  baja: Information,
} as const;

interface DrugInteractionCheckerProps {
  selectedMedicationId?: string;
}

export default function DrugInteractionChecker({ selectedMedicationId }: DrugInteractionCheckerProps) {
  const [selectedDrug, setSelectedDrug] = useState<string>(selectedMedicationId || '');
  const [compareDrug, setCompareDrug] = useState<string>('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const medOptions = medications.map((m) => ({
    value: m.id,
    label: `${m.name} (${m.genericName})`,
    species: m.species,
  }));

  const currentDrug = selectedDrug || selectedMedicationId;
  const drugInteractions = currentDrug ? getInteractionsForDrug(currentDrug) : [];

  const pairResult = currentDrug && compareDrug ? checkInteraction(currentDrug, compareDrug) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Shield size={16} weight="Outline" color="oklch(0.6 0.2 25)" />
        <span className="text-sm font-semibold">Verificador de Interacciones</span>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        {/* Current drug indicator */}
        {currentDrug && (
          <div className="flex items-center gap-2 text-xs">
            <Check size={14} weight="Outline" className="text-emerald-500" />
            <span className="text-muted-foreground">
              Analizando: <strong className="text-foreground">{medications.find(m => m.id === currentDrug)?.name}</strong>
            </span>
          </div>
        )}

        {/* Pair comparison */}
        <div className="flex gap-2 items-center">
          <select
            value={compareDrug}
            onChange={(e) => setCompareDrug(e.target.value)}
            className="flex-1 h-9 text-sm rounded-lg border border-border bg-background px-3"
          >
            <option value="">Comparar con...</option>
            {medOptions
              .filter((m) => m.value !== currentDrug)
              .map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
          </select>
        </div>

        {/* Pair result */}
        <AnimatePresence>
          {pairResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`${severityConfig[pairResult.severity].bg} ${severityConfig[pairResult.severity].border} border rounded-xl p-3`}
            >
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const Icon = severityIcon[pairResult.severity];
                  return <Icon size={16} weight={pairResult.severity === 'alta' ? 'Fill' : 'Outline'} style={{ color: severityConfig[pairResult.severity].color }} />;
                })()}
                <Badge
                  className="text-[10px]"
                  style={{ backgroundColor: severityConfig[pairResult.severity].color, color: '#fff' }}
                >
                  {severityConfig[pairResult.severity].label}
                </Badge>
              </div>
              <p className="text-sm font-medium mb-1">{pairResult.description}</p>
              <p className="text-xs text-muted-foreground">{pairResult.recommendation}</p>
            </motion.div>
          )}
          {compareDrug && !pairResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400"
            >
              <Check size={14} weight="Outline" />
              No se encontraron interacciones conocidas entre estos medicamentos.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Known interactions list */}
        {drugInteractions.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Interacciones conocidas ({drugInteractions.length})
            </p>
            <div className="space-y-2">
              {drugInteractions.map((interaction: DrugInteraction) => {
                const otherDrug = interaction.drug1 === currentDrug ? interaction.drug2 : interaction.drug1;
                const otherMed = medications.find(m => m.id === otherDrug);
                const key = `${interaction.drug1}-${interaction.drug2}`;
                const isExpanded = expanded === key;
                const config = severityConfig[interaction.severity];
                const SeverityIcon = severityIcon[interaction.severity];

                return (
                  <div key={key}>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : key)}
                      className="w-full flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <SeverityIcon
                          size={14}
                          weight={interaction.severity === 'alta' ? 'Fill' : 'Outline'}
                          className="flex-shrink-0"
                          style={{ color: config.color }}
                        />
                        <span className="text-xs font-medium truncate">{otherMed?.name || otherDrug}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-[9px] px-1 py-0" style={{ color: config.color, borderColor: config.color }}>
                          {interaction.severity}
                        </Badge>
                        <motion.span animate={{ rotate: isExpanded ? 180 : 0 }}>
                          <ChevronDown size={12} weight="Outline" className="text-muted-foreground" />
                        </motion.span>
                      </div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-4 mt-1 mb-1 text-[11px] text-muted-foreground leading-relaxed">
                            <p className="mb-1">{interaction.description}</p>
                            <p className="text-primary">{interaction.recommendation}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentDrug && drugInteractions.length === 0 && !pairResult && (
          <div className="text-center py-4 text-xs text-muted-foreground">
            <Shield size={24} weight="Outline" className="mx-auto mb-1.5 opacity-20" />
            No hay interacciones registradas para este medicamento.
          </div>
        )}

        {!currentDrug && (
          <div className="text-center py-4 text-xs text-muted-foreground">
            <Shield size={24} weight="Outline" className="mx-auto mb-1.5 opacity-20" />
            Seleccione un medicamento para verificar interacciones.
          </div>
        )}
      </div>
    </div>
  );
}
