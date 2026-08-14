'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Download,
  Upload,
  Trash3,
  Star,
  Clock,
  FileCheck,
  FileError,
  CircleInfo,
} from 'reicon-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useFavorites } from '@/lib/use-favorites-store';
import { useHistory } from '@/lib/use-history-store';

const FAVORITES_KEY = 'vetcalc-favorites';
const HISTORY_KEY = 'vetcalc-history';

interface ExportData {
  version: 1;
  exportDate: string;
  favorites: unknown[];
  history: {
    medication: unknown[];
    freeMode: unknown[];
    food: unknown[];
  };
}

interface DataManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DataManager({ open, onOpenChange }: DataManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const favorites = useFavorites();
  const history = useHistory();

  const medicationCount = history.filter((h) => h.type === 'medication').length;
  const freeModeCount = history.filter((h) => h.type === 'freemode').length;
  const foodCount = history.filter((h) => h.type === 'food').length;
  const totalHistory = history.length;

  const handleExport = useCallback(() => {
    try {
      const favsRaw = localStorage.getItem(FAVORITES_KEY) || '[]';
      const histRaw = localStorage.getItem(HISTORY_KEY) || '[]';
      const favs: unknown[] = JSON.parse(favsRaw);
      const histAll: { type: string; timestamp: number; summary: string }[] = JSON.parse(histRaw);

      const exportData: ExportData = {
        version: 1,
        exportDate: new Date().toISOString(),
        favorites: favs,
        history: {
          medication: histAll.filter((h) => h.type === 'medication'),
          freeMode: histAll.filter((h) => h.type === 'freemode'),
          food: histAll.filter((h) => h.type === 'food'),
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vetcalc-cr-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Exportación exitosa',
        description: `Se exportaron ${favs.length} favoritos y ${totalHistory} consultas.`,
      });
    } catch {
      toast({
        title: 'Error al exportar',
        description: 'No se pudo generar el archivo de respaldo.',
        variant: 'destructive',
      });
    }
  }, [favorites.length, totalHistory]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const processImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result;
        if (typeof raw !== 'string') throw new Error('Archivo vacío');

        const data = JSON.parse(raw);

        // Validate structure
        if (!data || typeof data !== 'object') throw new Error('Formato inválido');
        if (data.version !== 1) throw new Error('Versión de archivo no soportada');
        if (!Array.isArray(data.favorites)) throw new Error('Datos de favoritos inválidos');
        if (!data.history || typeof data.history !== 'object') throw new Error('Datos de historial inválidos');
        if (!Array.isArray(data.history.medication) || !Array.isArray(data.history.freeMode) || !Array.isArray(data.history.food)) {
          throw new Error('Estructura de historial incompleta');
        }

        // Restore favorites
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(data.favorites));

        // Merge history: combine all types, deduplicate by timestamp, sort by newest, limit to 20
        const merged = [
          ...data.history.medication,
          ...data.history.freeMode,
          ...data.history.food,
        ]
          .filter((h: { timestamp?: unknown }) => typeof h.timestamp === 'number')
          .sort((a: { timestamp: number }, b: { timestamp: number }) => b.timestamp - a.timestamp)
          .slice(0, 20);

        localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));

        // Trigger re-renders by dispatching storage events
        window.dispatchEvent(new StorageEvent('storage', { key: FAVORITES_KEY }));
        window.dispatchEvent(new StorageEvent('storage', { key: HISTORY_KEY }));

        const totalImported = data.favorites.length + data.history.medication.length + data.history.freeMode.length + data.history.food.length;
        toast({
          title: 'Importación exitosa',
          description: `Se restauraron ${data.favorites.length} favoritos y ${data.history.medication.length + data.history.freeMode.length + data.history.food.length} consultas.`,
        });
      } catch (err) {
        toast({
          title: 'Error al importar',
          description: err instanceof Error ? err.message : 'El archivo no es un respaldo válido de VetCalc CR.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);

    // Reset file input so the same file can be imported again
    e.target.value = '';
  }, []);

  const handleClearAll = useCallback(() => {
    localStorage.setItem(FAVORITES_KEY, '[]');
    localStorage.setItem(HISTORY_KEY, '[]');
    window.dispatchEvent(new StorageEvent('storage', { key: FAVORITES_KEY }));
    window.dispatchEvent(new StorageEvent('storage', { key: HISTORY_KEY }));
    toast({
      title: 'Datos eliminados',
      description: 'Se borraron todos los favoritos y el historial de consultas.',
    });
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database size={18} weight="Outline" color="oklch(0.55 0.15 165)" />
            </div>
            Gestor de Datos
          </SheetTitle>
          <SheetDescription>
            Exporte, importe o elimine sus datos almacenados en VetCalc CR.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Stats summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-muted/50 rounded-xl p-4 space-y-3"
          >
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CircleInfo size={14} weight="Outline" className="text-muted-foreground" />
              Resumen de Datos
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-card rounded-lg p-3 border border-border/50">
                <Star size={16} weight="Fill" className="text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-lg font-bold leading-none">{favorites.length}</p>
                  <p className="text-[10px] text-muted-foreground">Favoritos</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-card rounded-lg p-3 border border-border/50">
                <Clock size={16} weight="Outline" className="text-primary flex-shrink-0" />
                <div>
                  <p className="text-lg font-bold leading-none">{totalHistory}</p>
                  <p className="text-[10px] text-muted-foreground">Consultas</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="text-[10px] text-muted-foreground bg-card px-2 py-1 rounded-md border border-border/50">
                Medicamentos: {medicationCount}
              </span>
              <span className="text-[10px] text-muted-foreground bg-card px-2 py-1 rounded-md border border-border/50">
                Modo Libre: {freeModeCount}
              </span>
              <span className="text-[10px] text-muted-foreground bg-card px-2 py-1 rounded-md border border-border/50">
                Alimentos: {foodCount}
              </span>
            </div>
          </motion.div>

          <Separator />

          {/* Export */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Download size={16} weight="Outline" className="text-emerald-600" />
              Exportar Datos
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Descargue todos sus favoritos e historial de consultas como un archivo JSON de respaldo.
            </p>
            <Button
              onClick={handleExport}
              className="w-full justify-center gap-2"
              disabled={favorites.length === 0 && totalHistory === 0}
            >
              <Download size={16} weight="Outline" />
              Descargar Respaldo
            </Button>
          </motion.div>

          <Separator />

          {/* Import */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Upload size={16} weight="Outline" className="text-blue-600" />
              Importar Datos
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Restaure sus datos desde un archivo de respaldo previamente exportado. Los datos importados se combinan con los existentes.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={processImport}
              className="hidden"
              aria-label="Seleccionar archivo de respaldo"
            />
            <Button
              variant="outline"
              onClick={handleImport}
              className="w-full justify-center gap-2"
            >
              <Upload size={16} weight="Outline" />
              Cargar Archivo JSON
            </Button>
          </motion.div>

          <Separator />

          {/* Clear All */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Trash3 size={16} weight="Outline" className="text-red-500" />
              Eliminar Todo
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Borre permanentemente todos los favoritos y el historial de consultas. Esta acción no se puede deshacer.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full justify-center gap-2"
                  disabled={favorites.length === 0 && totalHistory === 0}
                >
                  <Trash3 size={16} weight="Outline" />
                  Eliminar Todos los Datos
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Trash3 size={18} weight="Outline" className="text-red-500" />
                    ¿Eliminar todos los datos?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente todos sus{' '}
                    <strong>{favorites.length} favoritos</strong> y{' '}
                    <strong>{totalHistory} consultas en historial</strong>.{' '}
                    Esta operación no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Sí, eliminar todo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
