'use client';

import { motion } from 'framer-motion';
import { Activity, Heart } from 'reicon-react';
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
  // Each SVG path shows a progressively fatter dog silhouette in profile (side view)
  // 80x50 viewBox. Clean outline style.
  const paths: Record<number, string> = {
    // BCS 1: Emaciated — very thin, visible hip bones, deeply sunken abdomen, protruding spine
    1: 'M8,28 L12,22 L14,16 L18,13 L24,11 L30,10 L36,10 L42,11 L48,13 L52,16 L56,20 L58,25 L60,28 L60,35 L58,38 L54,40 L50,41 L46,40 L42,38 L38,37 L34,38 L30,39 L26,40 L22,41 L18,40 L14,38 L10,35 Z',
    // BCS 2: Thin — narrow, slight waist, ribs visible
    2: 'M8,27 L12,22 L14,17 L18,14 L24,12 L30,11 L36,11 L42,12 L48,14 L52,17 L55,21 L57,26 L58,30 L58,36 L56,38 L52,40 L48,41 L44,40 L40,38 L36,37 L32,37 L28,38 L24,39 L20,40 L16,41 L12,39 L9,36 Z',
    // BCS 3: Slightly thin — lean but not skeletal, visible waist
    3: 'M8,27 L12,22 L14,18 L18,15 L24,13 L30,12 L36,12 L42,13 L48,15 L52,18 L55,22 L57,27 L57,33 L56,37 L52,40 L48,41 L44,40 L40,38 L36,37 L32,37 L28,38 L24,39 L20,40 L16,41 L12,39 L9,36 Z',
    // BCS 4: Ideal low — proportional with visible waist tuck
    4: 'M8,27 L12,23 L14,19 L18,16 L24,14 L30,13 L36,13 L42,14 L48,16 L52,19 L55,23 L56,28 L56,34 L55,37 L52,40 L48,42 L44,41 L40,38 L36,37 L32,37 L28,38 L24,39 L20,41 L16,42 L12,40 L9,37 Z',
    // BCS 5: Ideal — well-proportioned, defined waist, smooth outline
    5: 'M8,27 L12,23 L14,19 L18,16 L24,14 L30,14 L36,14 L42,16 L48,19 L52,23 L54,28 L54,34 L53,37 L50,40 L46,42 L42,41 L38,38 L34,37 L30,37 L26,38 L22,39 L18,41 L14,42 L10,40 L9,37 Z',
    // BCS 6: Slightly overweight — less defined waist, rounder belly
    6: 'M8,27 L12,23 L14,20 L18,17 L24,16 L30,15 L36,16 L42,17 L48,20 L51,24 L53,28 L53,33 L52,37 L50,40 L46,42 L42,41 L38,39 L34,38 L30,38 L26,39 L22,40 L18,41 L14,42 L10,40 L9,37 Z',
    // BCS 7: Overweight — no visible waist, rounder body
    7: 'M8,27 L12,24 L14,21 L18,18 L24,17 L30,17 L36,17 L42,18 L48,21 L51,25 L52,29 L52,34 L51,37 L49,40 L46,42 L42,42 L38,40 L34,39 L30,39 L26,40 L22,41 L18,42 L14,42 L10,41 L9,38 Z',
    // BCS 8: Obese — very round, no waist, fat deposits visible
    8: 'M8,27 L12,25 L14,22 L18,19 L24,18 L30,18 L36,18 L42,19 L48,22 L51,26 L51,30 L51,35 L50,38 L48,41 L45,43 L41,42 L37,41 L33,40 L30,40 L27,41 L23,42 L19,43 L15,42 L11,40 L9,37 Z',
    // BCS 9: Severely obese — extremely round, barrel-shaped body
    9: 'M8,27 L12,25 L14,23 L18,20 L24,19 L30,19 L36,19 L42,20 L48,23 L51,27 L51,31 L50,36 L49,39 L47,42 L44,44 L40,43 L36,42 L32,41 L30,41 L28,42 L24,43 L20,44 L16,43 L12,41 L9,38 Z',
  };

  // Head, legs, ear, tail — consistent across all BCS levels
  const headLegs = (
    <g>
      {/* Head */}
      <ellipse cx="7" cy="22" rx="6" ry="7" />
      {/* Ear */}
      <path d="M4,16 L3,10 L8,15" fill={color} stroke={color} strokeWidth="1.5" />
      {/* Eye */}
      <circle cx="9" cy="20" r="1" fill={color} stroke="none" />
      {/* Nose */}
      <ellipse cx="3" cy="23" rx="1.5" ry="1" fill={color} stroke="none" />
      {/* Front legs */}
      <line x1="22" y1="42" x2="22" y2="49" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="34" y1="42" x2="34" y2="49" strokeWidth="2.5" strokeLinecap="round" />
      {/* Back legs */}
      <line x1="46" y1="42" x2="46" y2="49" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="54" y1="40" x2="55" y2="49" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tail */}
      <path d="M58,37 Q63,30 66,25" fill="none" strokeWidth="2" strokeLinecap="round" />
      {/* Paws */}
      <ellipse cx="22" cy="49.5" rx="3" ry="1" fill={color} stroke="none" opacity="0.3" />
      <ellipse cx="34" cy="49.5" rx="3" ry="1" fill={color} stroke="none" opacity="0.3" />
      <ellipse cx="46" cy="49.5" rx="3" ry="1" fill={color} stroke="none" opacity="0.3" />
      <ellipse cx="55" cy="49.5" rx="3" ry="1" fill={color} stroke="none" opacity="0.3" />
    </g>
  );

  return (
    <svg
      viewBox="0 0 72 52"
      className="w-full h-auto"
      aria-label={`Perro con condición corporal ${score}/9`}
      role="img"
    >
      {/* Body silhouette */}
      <path
        d={paths[score]}
        fill={color}
        fillOpacity={0.12}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Head, legs, tail overlay */}
      {headLegs}
    </svg>
  );
}

export default function BodyConditionScore({ value, onChange }: BodyConditionScoreProps) {
  return (
    <Card className="border-primary/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Heart size={14} weight="Outline" color="oklch(0.55 0.15 165)" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">Condición Corporal (BCS 1-9)</h4>
            <p className="text-[10px] text-muted-foreground">Escala de evaluación visual</p>
          </div>
        </div>

        {/* Horizontal on desktop, vertical on mobile */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-1.5">
          {BCS_DATA.map((item) => {
            const isSelected = value === item.score;
            return (
              <motion.button
                key={item.score}
                onClick={() => onChange(item.score)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex-1 min-w-0 group ${
                  isSelected ? 'z-10' : ''
                }`}
              >
                <motion.div
                  animate={{
                    y: isSelected ? -4 : 0,
                    boxShadow: isSelected
                      ? '0 8px 24px -4px oklch(0.55 0.15 165 / 0.3)'
                      : '0 0 0 0 oklch(0 0 0 / 0)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`rounded-xl p-2.5 md:p-2 border-2 transition-colors text-left ${
                    isSelected
                      ? 'border-foreground bg-card'
                      : 'border-transparent bg-muted/40 hover:bg-muted/70'
                  }`}
                  style={
                    isSelected
                      ? { borderColor: item.color, borderTopColor: item.color }
                      : undefined
                  }
                >
                  {/* Color bar on top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-col items-center md:items-start gap-0.5">
                    {/* SVG Dog Silhouette */}
                    <div className="w-full max-w-[72px] mx-auto md:mx-0">
                      <DogSilhouette score={item.score} color={item.color} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-lg font-extrabold leading-none"
                        style={{ color: item.color }}
                      >
                        {item.score}
                      </span>
                      <Badge
                        variant={isSelected ? 'default' : 'secondary'}
                        className="text-[9px] px-1.5 py-0 leading-tight font-semibold"
                        style={
                          isSelected
                            ? { backgroundColor: item.color, color: '#fff', borderColor: item.color }
                            : undefined
                        }
                      >
                        {item.label}
                      </Badge>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground leading-tight line-clamp-2 hidden sm:block">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected description for mobile */}
        {value && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 md:hidden"
          >
            <div className="flex items-start gap-2 bg-muted/40 rounded-lg p-2.5">
              <Activity size={14} weight="Outline" color={BCS_DATA[value - 1].color} className="mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong style={{ color: BCS_DATA[value - 1].color }}>
                  {value}/9 {BCS_DATA[value - 1].label}:
                </strong>{' '}
                {BCS_DATA[value - 1].desc}
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
