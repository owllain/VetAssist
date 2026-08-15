'use client';

import { motion } from 'framer-motion';
import { Activity, Heart, InfoSquare } from 'reicon-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BCS_DATA = [
  { score: 1, label: 'Muy delgado', color: 'oklch(0.6 0.15 250)', desc: 'Costillas, vértebras y huesos pélvicos visibles. Sin grasa detectable.' },
  { score: 2, label: 'Delgado', color: 'oklch(0.6 0.12 230)', desc: 'Costillas fáciles de palpar. Mínima cobertura muscular.' },
  { score: 3, label: 'Ligero déficit', color: 'oklch(0.65 0.12 200)', desc: 'Costillas palpables con ligera cobertura de grasa.' },
  { score: 4, label: 'Peso ideal bajo', color: 'oklch(0.7 0.15 155)', desc: 'Contorno abdominal visible. Grasa mínima sobre costillas.' },
  { score: 5, label: 'PESO IDEAL', color: 'oklch(0.65 0.2 145)', desc: 'Contorno corporal bien definido. Costillas palpables sin exceso de grasa.' },
  { score: 6, label: 'Ligero exceso', color: 'oklch(0.7 0.18 95)', desc: 'Costillas palpables con dificultad. Acumulación ligera de grasa abdominal.' },
  { score: 7, label: 'Sobrepeso', color: 'oklch(0.72 0.18 75)', desc: 'Cintura barely visible. Depósitos de grasa sobre columna y base de cola.' },
  { score: 8, label: 'Obeso', color: 'oklch(0.7 0.18 50)', desc: 'Cintura no visible. Grasa abundante sobre tórax y columna.' },
  { score: 9, label: 'Obesidad severa', color: 'oklch(0.6 0.2 25)', desc: 'Grasa excesiva en todo el cuerpo. Dificultad para palpar costillas.' },
];

interface BodyConditionScoreProps {
  value: number | null;
  onChange: (score: number) => void;
}

function DogSilhouette({ score, color }: { score: number; color: string }) {
  const paths: Record<number, string> = {
    1: 'M8,28 L12,22 L14,16 L18,13 L24,11 L30,10 L36,10 L42,11 L48,13 L52,16 L56,20 L58,25 L60,28 L60,35 L58,38 L54,40 L50,41 L46,40 L42,38 L38,37 L34,38 L30,39 L26,40 L22,41 L18,40 L14,38 L10,35 Z',
    2: 'M8,27 L12,22 L14,17 L18,14 L24,12 L30,11 L36,11 L42,12 L48,14 L52,17 L55,21 L57,26 L58,30 L58,36 L56,38 L52,40 L48,41 L44,40 L40,38 L36,37 L32,37 L28,38 L24,39 L20,40 L16,41 L12,39 L9,36 Z',
    3: 'M8,27 L12,22 L14,18 L18,15 L24,13 L30,12 L36,12 L42,13 L48,15 L52,18 L55,22 L57,27 L57,33 L56,37 L52,40 L48,41 L44,40 L40,38 L36,37 L32,37 L28,38 L24,39 L20,40 L16,41 L12,39 L9,36 Z',
    4: 'M8,27 L12,23 L14,19 L18,16 L24,14 L30,13 L36,13 L42,14 L48,16 L52,19 L55,23 L56,28 L56,34 L55,37 L52,40 L48,42 L44,41 L40,38 L36,37 L32,37 L28,38 L24,39 L20,41 L16,42 L12,40 L9,37 Z',
    5: 'M8,27 L12,23 L14,19 L18,16 L24,14 L30,14 L36,14 L42,16 L48,19 L52,23 L54,28 L54,34 L53,37 L50,40 L46,42 L42,41 L38,38 L34,37 L30,37 L26,38 L22,39 L18,41 L14,42 L10,40 L9,37 Z',
    6: 'M8,27 L12,23 L14,20 L18,17 L24,16 L30,15 L36,16 L42,17 L48,20 L51,24 L53,28 L53,33 L52,37 L50,40 L46,42 L42,41 L38,39 L34,38 L30,38 L26,39 L22,40 L18,41 L14,42 L10,40 L9,37 Z',
    7: 'M8,27 L12,24 L14,21 L18,18 L24,17 L30,17 L36,17 L42,18 L48,21 L51,25 L52,29 L52,34 L51,37 L49,40 L46,42 L42,42 L38,40 L34,39 L30,39 L26,40 L22,41 L18,42 L14,42 L10,41 L9,38 Z',
    8: 'M8,27 L12,25 L14,22 L18,19 L24,18 L30,18 L36,18 L42,19 L48,22 L51,26 L51,30 L51,35 L50,38 L48,41 L45,43 L41,42 L37,41 L33,40 L30,40 L27,41 L23,42 L19,43 L15,42 L11,40 L9,37 Z',
    9: 'M8,27 L12,25 L14,23 L18,20 L24,19 L30,19 L36,19 L42,20 L48,23 L51,27 L51,31 L50,36 L49,39 L47,42 L44,44 L40,43 L36,42 L32,41 L30,41 L28,42 L24,43 L20,44 L16,43 L12,41 L9,38 Z',
  };

  return (
    <svg
      viewBox="0 0 72 52"
      className="w-full h-auto max-h-12"
      aria-label={`Perro con condición corporal ${score}/9`}
      role="img"
    >
      <path
        d={paths[score]}
        fill={color}
        fillOpacity={0.15}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <g>
        <ellipse cx="7" cy="22" rx="6" ry="7" fill={color} fillOpacity={0.2} stroke={color} strokeWidth="1" />
        <path d="M4,16 L3,10 L8,15" fill={color} stroke={color} strokeWidth="1.5" />
        <circle cx="9" cy="20" r="1" fill={color} stroke="none" />
        <ellipse cx="3" cy="23" rx="1.5" ry="1" fill={color} stroke="none" />
        <line x1="22" y1="42" x2="22" y2="49" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="34" y1="42" x2="34" y2="49" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="46" y1="42" x2="46" y2="49" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="54" y1="40" x2="55" y2="49" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M58,37 Q63,30 66,25" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default function BodyConditionScore({ value, onChange }: BodyConditionScoreProps) {
  const selectedItem = value ? BCS_DATA.find((item) => item.score === value) : null;

  return (
    <Card className="border-primary/10">
      <CardContent className="p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart size={14} weight="Outline" color="oklch(0.55 0.15 165)" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Condición Corporal (BCS 1-9)</h4>
              <p className="text-[10px] text-muted-foreground">Escala visual para ajuste calórico</p>
            </div>
          </div>
          {value && (
            <Badge
              variant="outline"
              className="text-xs font-bold px-2 py-0.5"
              style={{
                borderColor: selectedItem?.color,
                color: selectedItem?.color,
                backgroundColor: `${selectedItem?.color}15`,
              }}
            >
              BCS {value}/9: {selectedItem?.label}
            </Badge>
          )}
        </div>

        {/* Responsive Grid: 3 cols on mobile, 5 cols on tablet, 9 cols on wide desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 sm:gap-2">
          {BCS_DATA.map((item) => {
            const isSelected = value === item.score;
            return (
              <button
                key={item.score}
                type="button"
                onClick={() => onChange(item.score)}
                className={`relative rounded-xl p-2 border-2 transition-all text-center flex flex-col items-center justify-between gap-1 min-h-[90px] overflow-hidden ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40'
                    : 'border-border/60 bg-card hover:bg-muted/50 hover:border-border'
                }`}
                style={isSelected ? { borderColor: item.color } : undefined}
              >
                {/* Top color indicator */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: item.color }}
                />

                {/* Score Number */}
                <span
                  className="text-base sm:text-lg font-black leading-none pt-1"
                  style={{ color: item.color }}
                >
                  {item.score}
                </span>

                {/* Silhouette SVG */}
                <div className="w-full max-w-[48px] mx-auto flex items-center justify-center">
                  <DogSilhouette score={item.score} color={item.color} />
                </div>

                {/* Status Label with text wrapping prevention */}
                <span
                  className="text-[10px] font-semibold leading-tight px-1 py-0.5 rounded w-full truncate"
                  style={{
                    color: isSelected ? item.color : 'inherit',
                  }}
                  title={item.label}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected BCS Detailed Description Box */}
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl border flex items-start gap-2.5"
            style={{
              borderColor: `${selectedItem.color}40`,
              backgroundColor: `${selectedItem.color}10`,
            }}
          >
            <Activity size={16} weight="Outline" color={selectedItem.color} className="mt-0.5 flex-shrink-0" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-foreground">
                <span style={{ color: selectedItem.color }}>Nivel {selectedItem.score}/9 — {selectedItem.label}</span>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {selectedItem.desc}
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
