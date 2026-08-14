'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash, StarFall2 } from 'reicon-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FavoriteMed } from '@/lib/favorites';
import { getFavorites, removeFavorite } from '@/lib/favorites';

interface FavoritesPanelProps {
  onSelectMedication: (med: FavoriteMed) => void;
  currentMedicationId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function FavoritesPanel({
  onSelectMedication,
  currentMedicationId,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: FavoritesPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = externalOnOpenChange ?? setInternalOpen;
  const [, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  const handleRemove = (medicationId: string) => {
    removeFavorite(medicationId);
    refresh();
  };

  const handleSelect = (med: FavoriteMed) => {
    onSelectMedication(med);
    setOpen(false);
  };

  // Read favorites from localStorage on each render (only shown when sheet is open)
  const favorites = getFavorites();

  return (
    <>
      {/* FAB */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg shadow-primary/30 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Star size={24} weight="fill" />
          <span className="sr-only">Favoritos</span>
        </Button>
      </motion.div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="p-0">
          <SheetHeader className="p-4 pb-2">
            <SheetTitle className="flex items-center gap-2">
              <Star size={20} weight="fill" className="text-amber-500" />
              Medicamentos Favoritos
            </SheetTitle>
            <SheetDescription>
              Acceso rápido a sus medicamentos guardados
            </SheetDescription>
          </SheetHeader>

          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <StarFall2 size={40} weight="outline" className="text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No hay medicamentos favoritos aún
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Toque la estrella en cualquier medicamento para guardarlo aquí
                </p>
              </motion.div>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="px-4 pb-4 space-y-2">
                <AnimatePresence>
                  {favorites.map((fav, index) => (
                    <motion.div
                      key={fav.medicationId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      layout
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelect(fav)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') handleSelect(fav);
                        }}
                        className={`group flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-primary/5 hover:border-primary/30 ${
                          currentMedicationId === fav.medicationId
                            ? 'border-primary bg-primary/5'
                            : 'border-border/60'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm truncate">{fav.name}</h4>
                            {fav.species.map((s) => (
                              <Badge
                                key={s}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {s === 'perro' ? '🐕' : '🐈'} {s}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {fav.genericName}
                          </p>
                          <div className="mt-1.5">
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {fav.category}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0 opacity-50 hover:opacity-100 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(fav.medicationId);
                          }}
                        >
                          <Trash size={14} weight="outline" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
