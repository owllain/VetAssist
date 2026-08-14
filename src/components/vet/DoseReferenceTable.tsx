'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  type AnimalType,
  medicationCategories,
  getMedicationsByCategory,
} from '@/lib/medications';

interface DoseRefTableProps {
  categoryId: string;
  animalType: AnimalType;
}

export default function DoseReferenceTable({ categoryId, animalType }: DoseRefTableProps) {
  const category = medicationCategories.find((c) => c.id === categoryId);
  const meds = getMedicationsByCategory(categoryId);

  if (!category || meds.length === 0) return null;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span>{category.icon}</span>
          Tabla de Referencia Rápida — {category.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <div className="max-h-72 overflow-y-auto rounded-md border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/10 hover:bg-primary/10 border-primary/10">
                <TableHead className="text-xs font-semibold text-primary px-3 py-2">Medicamento</TableHead>
                <TableHead className="text-xs font-semibold text-primary px-3 py-2">Dosis Rango</TableHead>
                <TableHead className="text-xs font-semibold text-primary px-3 py-2">Unidad</TableHead>
                <TableHead className="text-xs font-semibold text-primary px-3 py-2">Vías</TableHead>
                <TableHead className="text-xs font-semibold text-primary px-3 py-2">Especies</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meds.map((med, index) => (
                <TableRow
                  key={med.id}
                  className={
                    !med.species.includes(animalType)
                      ? 'opacity-40'
                      : index % 2 === 0
                        ? 'bg-background'
                        : 'bg-muted/30'
                  }
                >
                  <TableCell className="px-3 py-2">
                    <div className="text-xs font-medium">{med.name}</div>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <span className="text-xs font-mono">
                      {med.doseMin === med.doseMax
                        ? `${med.doseMin}`
                        : `${med.doseMin}–${med.doseMax}`}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <span className="text-xs text-muted-foreground">{med.unit}</span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="flex gap-1 flex-wrap">
                      {med.route.map((r) => (
                        <Badge
                          key={r}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-5"
                        >
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="flex gap-1 flex-wrap">
                      {med.species.map((s) => (
                        <Badge
                          key={s}
                          variant={s === animalType ? 'default' : 'secondary'}
                          className="text-[10px] px-1.5 py-0 h-5"
                        >
                          {s === 'perro' ? '🐕' : '🐈'} {s}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
