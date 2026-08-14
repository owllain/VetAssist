'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardText, ChevronRight, AlertTriangle, Pill, InfoSquare,
} from 'reicon-react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimalBadge } from './AnimalIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { protocols, type Protocol } from '@/lib/protocols';
import type { AnimalType } from '@/lib/medications';

interface ProtocolTemplatesProps {
  animalType: AnimalType;
  onSelectProtocol: (protocol: Protocol) => void;
}

export default function ProtocolTemplates({ animalType, onSelectProtocol }: ProtocolTemplatesProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const filtered = protocols.filter((p) => p.species.includes(animalType));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <ClipboardText size={16} weight="Outline" color="oklch(0.55 0.15 165)" />
        <span className="text-sm font-semibold">Protocolos Rápidos</span>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {filtered.length} disponibles
        </Badge>
      </div>
      <div className="grid gap-2">
        <AnimatePresence>
          {filtered.map((protocol, index) => {
            const isExpanded = expanded === protocol.id;
            return (
              <motion.div
                key={protocol.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="vet-card-hover cursor-pointer border border-primary/10 overflow-hidden"
                  onClick={() => setExpanded(isExpanded ? null : protocol.id)}
                >
                  <CardContent className="p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: `${protocol.color}15` }}
                        >
                          {protocol.icon}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm leading-tight truncate">{protocol.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{protocol.description}</p>
                          <div className="flex gap-1 mt-1.5">
                            {protocol.species.map((s) => (
                              <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">
                                <AnimalBadge type={s} /> {s}
                              </Badge>
                            ))}
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                              {protocol.drugs.length} meds
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <ChevronRight size={18} weight="Outline" className="text-muted-foreground/50" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mr-0 mt-1 p-3 rounded-xl border border-primary/10 bg-primary/[0.03] space-y-2">
                        {protocol.drugs.map((drug, di) => (
                          <div key={di} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Pill size={10} weight="Outline" color="oklch(0.55 0.15 165)" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{drug.name}</p>
                              <p className="text-xs text-muted-foreground">{drug.doseNote}</p>
                            </div>
                          </div>
                        ))}
                        {protocol.notes && (
                          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2.5 mt-1">
                            <AlertTriangle size={13} weight="Outline" className="text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">{protocol.notes}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <InfoSquare size={10} weight="Outline" />
                            Presione el medicamento para calcular dosis
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProtocol(protocol);
                            }}
                          >
                            Usar Protocolo
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
