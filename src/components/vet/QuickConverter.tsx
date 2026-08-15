'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Repeat, Copy, CircleInfo } from 'reicon-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type CategoryId = 'peso' | 'volumen' | 'temperatura' | 'concentracion';

interface Conversion {
  fromUnit: string;
  toUnit: string;
  factor: number;
  label: string;
}

interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  conversions: Conversion[];
}

const CATEGORIES: Category[] = [
  {
    id: 'peso',
    label: 'Peso',
    icon: '⚖️',
    conversions: [
      { fromUnit: 'kg', toUnit: 'lb', factor: 2.20462, label: 'kg → lb' },
      { fromUnit: 'kg', toUnit: 'g', factor: 1000, label: 'kg → g' },
      { fromUnit: 'lb', toUnit: 'oz', factor: 16, label: 'lb → oz' },
      { fromUnit: 'g', toUnit: 'mg', factor: 1000, label: 'g → mg' },
      { fromUnit: 'mg', toUnit: 'mcg', factor: 1000, label: 'mg → mcg' },
    ],
  },
  {
    id: 'volumen',
    label: 'Volumen',
    icon: '🧪',
    conversions: [
      { fromUnit: 'mL', toUnit: 'L', factor: 0.001, label: 'mL → L' },
      { fromUnit: 'mL', toUnit: 'cc', factor: 1, label: 'mL → cc' },
      { fromUnit: 'fl oz', toUnit: 'mL', factor: 29.5735, label: 'fl oz → mL' },
      { fromUnit: 'tsp', toUnit: 'mL', factor: 4.92892, label: 'tsp → mL' },
      { fromUnit: 'tbsp', toUnit: 'mL', factor: 14.7868, label: 'tbsp → mL' },
    ],
  },
  {
    id: 'temperatura',
    label: 'Temperatura',
    icon: '🌡️',
    conversions: [
      { fromUnit: '°C', toUnit: '°F', factor: 0, label: '°C → °F' },
    ],
  },
  {
    id: 'concentracion',
    label: 'Concentración',
    icon: '💊',
    conversions: [
      { fromUnit: '%', toUnit: 'mg/mL', factor: 10, label: '% → mg/mL' },
      { fromUnit: 'mcg/mL', toUnit: 'mg/L', factor: 0.001, label: 'mcg/mL → mg/L' },
    ],
  },
];

function sigFigs(n: number, figs = 4): string {
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1000) return n.toLocaleString('es-CR', { maximumFractionDigits: 2 });
  if (abs >= 1) return n.toLocaleString('es-CR', { maximumFractionDigits: figs - 1 });
  if (abs >= 0.01) return n.toPrecision(figs);
  return n.toExponential(figs - 1);
}

function computeResult(inputVal: string, conversion: Conversion, swapped: boolean, categoryId: CategoryId): string {
  const raw = inputVal.trim();
  const num = parseFloat(raw.replace(',', '.'));
  if (isNaN(num)) return '';

  // Determine the actual source and target units depending on swap
  const fromUnit = swapped ? conversion.toUnit : conversion.fromUnit;
  const toUnit = swapped ? conversion.fromUnit : conversion.toUnit;

  // Temperature special-casing
  if (categoryId === 'temperatura') {
    if (fromUnit === '°C' && toUnit === '°F') return sigFigs(num * 9 / 5 + 32);
    if (fromUnit === '°F' && toUnit === '°C') return sigFigs((num - 32) * 5 / 9);
    return '';
  }

  // Unit maps to a common base for robust bidirectional conversion
  const weightToGram: Record<string, number> = {
    kg: 1000,
    g: 1,
    mg: 0.001,
    mcg: 0.000001,
    lb: 453.59237,
    oz: 28.349523125,
  };

  const volumeToMl: Record<string, number> = {
    'mL': 1,
    'L': 1000,
    'cc': 1,
    'fl oz': 29.5735,
    'tsp': 4.92892,
    'tbsp': 14.7868,
  };

  if (categoryId === 'peso') {
    const fFrom = weightToGram[fromUnit];
    const fTo = weightToGram[toUnit];
    if (fFrom == null || fTo == null) return '';
    const inGrams = num * fFrom;
    return sigFigs(inGrams / fTo);
  }

  if (categoryId === 'volumen') {
    const fFrom = volumeToMl[fromUnit];
    const fTo = volumeToMl[toUnit];
    if (fFrom == null || fTo == null) return '';
    const inMl = num * fFrom;
    return sigFigs(inMl / fTo);
  }

  // Concentration: fall back to explicit factor when provided
  if (categoryId === 'concentracion') {
    if (conversion.factor && conversion.factor !== 0) {
      const factor = swapped ? 1 / conversion.factor : conversion.factor;
      return sigFigs(num * factor);
    }
    return '';
  }

  // Generic fallback
  const factor = swapped ? 1 / conversion.factor : conversion.factor;
  return sigFigs(num * factor);
}

export default function QuickConverter() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('peso');
  const [leftValue, setLeftValue] = useState('');
  const [rightValue, setRightValue] = useState('');
  const [swapped, setSwapped] = useState(false);
  const [convIdx, setConvIdx] = useState(0);
  const { toast } = useToast();

  const [sourceUnit, setSourceUnit] = useState<string>('kg');
  const [results, setResults] = useState<Record<string, string>>({});

  const category = CATEGORIES.find(c => c.id === activeCategory)!;
  const conversion = category.conversions[convIdx] || category.conversions[0];
  const inputVal = leftValue;

  // sourceUnit is initialized on category change via handleCategoryChange

  function handleCategoryChange(catId: CategoryId) {
    setActiveCategory(catId);
    setConvIdx(0);
    setLeftValue('');
    setRightValue('');
    setSwapped(false);
    setResults({});
    setSourceUnit(CATEGORIES.find(c => c.id === catId)!.conversions[0].fromUnit);
  }

  function handleSwap() {
    // Preserve existing input values when swapping directions
    const lv = leftValue;
    const rv = rightValue;
    setSwapped(s => !s);
    setLeftValue(rv);
    setRightValue(lv);
  }

  function handleCopy() {
    if (rightValue) {
      navigator.clipboard.writeText(rightValue);
      toast({ title: 'Copiado', description: `${rightValue} copiado al portapapeles` });
    }
  }

  // Helper maps for conversions
  const weightToGram: Record<string, number> = {
    kg: 1000,
    g: 1,
    mg: 0.001,
    mcg: 0.000001,
    lb: 453.59237,
    oz: 28.349523125,
  };

  const volumeToMl: Record<string, number> = {
    'mL': 1,
    'L': 1000,
    'cc': 1,
    'fl oz': 29.5735,
    'tsp': 4.92892,
    'tbsp': 14.7868,
  };

  function convertBetween(num: number, fromUnit: string, toUnit: string, categoryId: CategoryId): string {
    if (categoryId === 'temperatura') {
      if (fromUnit === toUnit) return sigFigs(num);
      if (fromUnit === '°C' && toUnit === '°F') return sigFigs(num * 9 / 5 + 32);
      if (fromUnit === '°F' && toUnit === '°C') return sigFigs((num - 32) * 5 / 9);
      return '';
    }
    if (categoryId === 'peso') {
      const fFrom = weightToGram[fromUnit];
      const fTo = weightToGram[toUnit];
      if (fFrom == null || fTo == null) return '';
      const inGrams = num * fFrom;
      return sigFigs(inGrams / fTo);
    }
    if (categoryId === 'volumen') {
      const fFrom = volumeToMl[fromUnit];
      const fTo = volumeToMl[toUnit];
      if (fFrom == null || fTo == null) return '';
      const inMl = num * fFrom;
      return sigFigs(inMl / fTo);
    }
    if (categoryId === 'concentracion') {
      if (fromUnit === toUnit) return sigFigs(num);
      const direct = category.conversions.find(c => c.fromUnit === fromUnit && c.toUnit === toUnit);
      if (direct) return sigFigs(num * direct.factor);
      const inverse = category.conversions.find(c => c.fromUnit === toUnit && c.toUnit === fromUnit);
      if (inverse) return sigFigs(num / inverse.factor);
      return '';
    }
    return '';
  }

  function computeAll() {
    const raw = inputVal.trim();
    const num = parseFloat(raw.replace(',', '.'));
    if (isNaN(num)) {
      setResults({});
      return;
    }
    const units = Array.from(new Set(category.conversions.flatMap(c => [c.fromUnit, c.toUnit])));
    const map: Record<string, string> = {};
    for (const u of units) {
      map[u] = convertBetween(num, sourceUnit || units[0], u, category.id) || '';
    }
    setResults(map);
    const primaryTarget = category.conversions.find(c => c.fromUnit === (sourceUnit || ''))?.toUnit || units.find(u => u !== (sourceUnit || '')) || '';
    if (primaryTarget) setRightValue(map[primaryTarget] || '');
  }

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-scale-sm ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-md tab-glow'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Conversion Selector */}
      {category.conversions.length > 1 && (
        <div className="flex justify-center">
          <Select value={String(convIdx)} onValueChange={v => { const idx = Number(v); setConvIdx(idx); setLeftValue(''); setRightValue(''); setSourceUnit(category.conversions[idx].fromUnit); setResults({}); }}>
            <SelectTrigger className="w-64 glass-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {category.conversions.map((c, i) => (
                <SelectItem key={i} value={String(i)}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Converter Card */}
      <Card className="glass-card-strong overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-0 items-center">
            {/* Left Input */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Valor</label>
              <Input
                type="number"
                inputMode="decimal"
                value={leftValue}
                onChange={e => { setLeftValue(e.target.value); setRightValue(''); setResults({}); }}
                placeholder="0"
                className="text-lg font-semibold h-12 input-focus-glow text-center"
              />
              <div className="mt-2">
                <Select value={sourceUnit} onValueChange={v => setSourceUnit(String(v))}>
                  <SelectTrigger className="w-40 glass-card">
                    <SelectValue placeholder="Unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(category.conversions.flatMap(c => [c.fromUnit, c.toUnit]))).map((u, i) => (
                      <SelectItem key={i} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Convert Button */}
            <div className="px-2">
              <Button
                variant="ghost"
                onClick={computeAll}
                className="rounded-full px-3 py-2 hover:bg-primary/10 transition-colors flex items-center gap-2"
                title="Convertir"
              >
                <Repeat size={18} weight="Outline" className="text-primary" />
                <span className="text-sm font-medium">Convertir</span>
              </Button>
            </div>

            {/* Right Input (Primary Result) */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Resultado</label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={rightValue}
                  placeholder="0"
                  className="text-lg font-semibold h-12 input-focus-glow text-center result-glow pr-10"
                  readOnly
                />
                {rightValue && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { navigator.clipboard.writeText(rightValue); toast({ title: 'Copiado', description: `${rightValue} copiado al portapapeles` }); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 hover:bg-primary/10"
                    title="Copiar resultado"
                  >
                    <Copy size={14} weight="Outline" className="text-muted-foreground" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results — equivalencias calculadas */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CircleInfo size={14} weight="Outline" className="text-primary" />
            Resultados — {category.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {Object.keys(results).length === 0 && (
              <div className="text-muted-foreground">Presiona "Convertir" para ver equivalencias</div>
            )}
            {Object.entries(results).map(([u, v]) => (
              <div key={u} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/10">
                <div className="font-medium">{u}</div>
                <div className="flex items-center gap-2">
                  <div className="font-mono">{v}</div>
                  <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(v); toast({ title: 'Copiado', description: `${v} copiado` }); }}>
                    <Copy size={14} weight="Outline" className="text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference Table */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CircleInfo size={14} weight="Outline" className="text-primary" />
            Equivalencias rápidas — {category.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {category.conversions.map((c, i) => (
              <div
                key={i}
                onClick={() => { setConvIdx(i); setLeftValue(''); setRightValue(''); setSwapped(false); }}
                className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  convIdx === i
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/50'
                }`}
              >
                <span className="font-medium">{c.label}</span>
                <span className="text-muted-foreground font-mono text-xs">
                  {c.factor === 0 ? 'F = C×9/5+32' : c.factor === 1 ? '1:1' : `×${c.factor}`}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
