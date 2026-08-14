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

function computeResult(inputVal: string, conversion: Conversion, swapped: boolean): string {
  const num = parseFloat(inputVal);
  if (isNaN(num)) return '';
  if (conversion.fromUnit === '°C' && conversion.toUnit === '°F') {
    return swapped ? sigFigs((num - 32) * 5 / 9) : sigFigs(num * 9 / 5 + 32);
  }
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

  const category = CATEGORIES.find(c => c.id === activeCategory)!;
  const conversion = category.conversions[convIdx] || category.conversions[0];
  const inputVal = swapped ? rightValue : leftValue;
  const result = computeResult(inputVal, conversion, swapped);
  const displayFrom = swapped ? conversion.toUnit : conversion.fromUnit;
  const displayTo = swapped ? conversion.fromUnit : conversion.toUnit;

  function handleCategoryChange(catId: CategoryId) {
    setActiveCategory(catId);
    setConvIdx(0);
    setLeftValue('');
    setRightValue('');
    setSwapped(false);
  }

  function handleSwap() {
    setSwapped(s => !s);
    setLeftValue('');
    setRightValue('');
  }

  function handleCopy() {
    if (result) {
      navigator.clipboard.writeText(result);
      toast({ title: 'Copiado', description: `${result} copiado al portapapeles` });
    }
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
          <Select value={String(convIdx)} onValueChange={v => { setConvIdx(Number(v)); setLeftValue(''); setRightValue(''); }}>
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
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">De ({displayFrom})</label>
              <Input
                type="number"
                inputMode="decimal"
                value={swapped ? (result || '') : leftValue}
                onChange={e => { setLeftValue(e.target.value); setRightValue(''); }}
                placeholder="0"
                className="text-lg font-semibold h-12 input-focus-glow text-center"
                readOnly={swapped}
              />
            </div>

            {/* Swap Button */}
            <div className="px-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSwap}
                className="rounded-full w-10 h-10 hover:bg-primary/10 transition-colors"
                title="Intercambiar unidades"
              >
                <motion.div
                  animate={{ rotate: swapped ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Repeat size={18} weight="Outline" className="text-primary" />
                </motion.div>
              </Button>
            </div>

            {/* Right Input (Result) */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">A ({displayTo})</label>
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={!swapped ? (result || '') : rightValue}
                  onChange={e => { setRightValue(e.target.value); setLeftValue(''); }}
                  placeholder="0"
                  className="text-lg font-semibold h-12 input-focus-glow text-center result-glow pr-10"
                  readOnly={!swapped}
                />
                {result && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
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
