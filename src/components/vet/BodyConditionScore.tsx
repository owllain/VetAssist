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

export default function BodyConditionScore({ value, onChange }: BodyConditionScoreProps) {
  return (
    <Card className="border-primary/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Heart size={14} weight="outline" color="oklch(0.55 0.15 165)" />
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
              <Activity size={14} weight="outline" color={BCS_DATA[value - 1].color} className="mt-0.5 flex-shrink-0" />
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
