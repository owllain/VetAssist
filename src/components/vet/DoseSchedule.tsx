'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Calendar,
  Copy,
  Printer,
  Check,
  Plus,
  Trash,
  CircleInfo,
} from 'reicon-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

// ─── Types ───────────────────────────────────────────────────────

interface MedicationEntry {
  id: string;
  name: string;
  dose: string;
  unit: string;
}

interface ScheduleCell {
  hour: number;
  minute: number;
  day: number;
  medications: MedicationEntry[];
}

interface DoseCheckState {
  [key: string]: boolean; // "day-hour-minute" → checked
}

// ─── Constants ───────────────────────────────────────────────────

const FREQUENCY_OPTIONS = [
  { value: 'SID', label: 'SID (1×/día)', hours: 24 },
  { value: 'BID', label: 'BID (2×/día)', hours: 12 },
  { value: 'TID', label: 'TID (3×/día)', hours: 8 },
  { value: 'QID', label: 'QID (4×/día)', hours: 6 },
  { value: 'q8h', label: 'q8h (c/8h)', hours: 8 },
  { value: 'q6h', label: 'q6h (c/6h)', hours: 6 },
  { value: 'q4h', label: 'q4h (c/4h)', hours: 4 },
  { value: 'custom', label: 'Personalizado', hours: 0 },
] as const;

const UNITS = ['mg', 'mL', 'mcg', 'UI', 'g', 'gotas', 'tabletas'] as const;

type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

const TIME_PERIODS: { label: string; value: TimePeriod; color: string; bg: string; border: string }[] = [
  { label: 'Mañana', value: 'morning', color: 'oklch(0.75 0.15 75)', bg: 'oklch(0.75 0.15 75 / 0.1)', border: 'oklch(0.75 0.15 75 / 0.3)' },
  { label: 'Tarde', value: 'afternoon', color: 'oklch(0.55 0.15 165)', bg: 'oklch(0.55 0.15 165 / 0.1)', border: 'oklch(0.55 0.15 165 / 0.3)' },
  { label: 'Noche', value: 'evening', color: 'oklch(0.55 0.15 250)', bg: 'oklch(0.55 0.15 250 / 0.1)', border: 'oklch(0.55 0.15 250 / 0.3)' },
  { label: 'Madrugada', value: 'night', color: 'oklch(0.55 0.15 290)', bg: 'oklch(0.55 0.15 290 / 0.1)', border: 'oklch(0.55 0.15 290 / 0.3)' },
];

function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

function getTimePeriodMeta(period: TimePeriod) {
  return TIME_PERIODS.find((t) => t.value === period)!;
}

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Component ───────────────────────────────────────────────────

export default function DoseSchedule() {
  // Hydration-safe: null initial state
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [frequency, setFrequency] = useState('BID');
  const [customHours, setCustomHours] = useState('');
  const [startHour, setStartHour] = useState(8);
  const [startMinute, setStartMinute] = useState(0);
  const [startAmPm, setStartAmPm] = useState<'AM' | 'PM'>('AM');
  const [duration, setDuration] = useState(3);
  const [medications, setMedications] = useState<MedicationEntry[]>([
    { id: makeId(), name: '', dose: '', unit: 'mg' },
  ]);
  const [checkedDoses, setCheckedDoses] = useState<DoseCheckState>({});
  const [copied, setCopied] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.getHours() * 60 + now.getMinutes());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Compute interval hours
  const intervalHours = useMemo(() => {
    if (frequency === 'custom') {
      const val = parseFloat(customHours);
      return val > 0 ? val : null;
    }
    const opt = FREQUENCY_OPTIONS.find((f) => f.value === frequency);
    return opt ? opt.hours : null;
  }, [frequency, customHours]);

  // Compute start time in 24h format
  const startMinutes24 = useMemo(() => {
    let h = startHour;
    if (startAmPm === 'PM' && h !== 12) h += 12;
    if (startAmPm === 'AM' && h === 12) h = 0;
    return h * 60 + startMinute;
  }, [startHour, startMinute, startAmPm]);

  // Generate dose times for 24h from start
  const doseTimes = useMemo(() => {
    if (intervalHours === null) return [];
    const intervalMin = Math.round(intervalHours * 60);
    if (intervalMin <= 0) return [];

    const times: number[] = [];
    let t = startMinutes24;
    // Generate times for 24h starting from start time
    for (let i = 0; i < 24 * 60; i++) {
      if (t >= 24 * 60) t -= 24 * 60;
      if (times.includes(t)) break; // prevent infinite loop
      times.push(t);
      t += intervalMin;
      if (times.length > 24) break; // safety limit
    }
    return times.sort((a, b) => a - b);
  }, [intervalHours, startMinutes24]);

  // Can generate
  const canGenerate = useMemo(() => {
    if (intervalHours === null) return false;
    const hasMed = medications.some((m) => m.name.trim() !== '' && m.dose.trim() !== '');
    return hasMed && doseTimes.length > 0;
  }, [intervalHours, medications, doseTimes]);

  // Medication handlers
  const addMedication = useCallback(() => {
    setMedications((prev) => [
      ...prev,
      { id: makeId(), name: '', dose: '', unit: 'mg' },
    ]);
  }, []);

  const removeMedication = useCallback((id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMedication = useCallback((id: string, field: keyof MedicationEntry, value: string) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  }, []);

  // Check/uncheck dose
  const toggleDose = useCallback((key: string) => {
    setCheckedDoses((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Generate schedule
  const handleGenerate = useCallback(() => {
    if (!canGenerate) return;
    setShowSchedule(true);
  }, [canGenerate]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!canGenerate || doseTimes.length === 0) return;

    const validMeds = medications.filter((m) => m.name.trim() !== '' && m.dose.trim() !== '');
    const freqLabel = FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.label || frequency;
    const st = formatTime(Math.floor(startMinutes24 / 60), startMinutes24 % 60);

    let text = `📅 Horario de Medicación - VetCalc CR\n`;
    text += `Frecuencia: ${freqLabel} | Inicio: ${st} | Duración: ${duration} día(s)\n`;
    text += `${'─'.repeat(40)}\n`;

    for (const t of doseTimes) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      const period = getTimePeriod(h);
      const meta = getTimePeriodMeta(period);
      text += `\n⏰ ${formatTime(h, m)} [${meta.label}]\n`;
      for (const med of validMeds) {
        text += `   ✓ ${med.name} — ${med.dose} ${med.unit}\n`;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copiado', description: 'Horario copiado al portapapeles.' });
    } catch {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar al portapapeles.',
        variant: 'destructive',
      });
    }
  }, [canGenerate, doseTimes, medications, frequency, startMinutes24, duration]);

  // Print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Count checked / total for progress
  const progressInfo = useMemo(() => {
    let total = 0;
    let checked = 0;
    for (let d = 1; d <= duration; d++) {
      for (const t of doseTimes) {
        const h = Math.floor(t / 60);
        const m = t % 60;
        const key = `${d}-${h}-${m}`;
        total++;
        if (checkedDoses[key]) checked++;
      }
    }
    return { total, checked, pct: total > 0 ? Math.round((checked / total) * 100) : 0 };
  }, [duration, doseTimes, checkedDoses]);

  // Don't render until currentTime is set (avoids hydration bugs)
  if (currentTime === null) {
    return (
      <div className="result-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar size={18} weight="Outline" className="text-primary/70" />
          </div>
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const validMeds = medications.filter((m) => m.name.trim() !== '' && m.dose.trim() !== '');

  return (
    <div className="result-card rounded-2xl overflow-hidden card-shine">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2 border-b border-border/50">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Calendar size={18} weight="Outline" className="text-primary/70" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Generador de Horario</h3>
          <p className="text-[10px] text-muted-foreground">Planifique la administración de medicamentos</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Row 1: Frequency + Start Time + Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Frequency */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Clock size={11} weight="Outline" className="text-primary/60" />
              Frecuencia
            </label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="h-9 text-sm" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Time */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Clock size={11} weight="Outline" className="text-primary/60" />
              Hora de inicio
            </label>
            <div className="flex gap-1.5">
              <Input
                type="number"
                min={1}
                max={12}
                value={startHour}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 0;
                  setStartHour(Math.min(12, Math.max(1, v)));
                }}
                className="h-9 text-sm w-14 text-center"
              />
              <span className="flex items-center text-sm font-bold text-muted-foreground">:</span>
              <Input
                type="number"
                min={0}
                max={59}
                value={startMinute}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 0;
                  setStartMinute(Math.min(59, Math.max(0, v)));
                }}
                className="h-9 text-sm w-14 text-center"
              />
              <Select value={startAmPm} onValueChange={(v) => setStartAmPm(v as 'AM' | 'PM')}>
                <SelectTrigger className="h-9 text-sm w-[68px]" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Calendar size={11} weight="Outline" className="text-primary/60" />
              Duración (días)
            </label>
            <Input
              type="number"
              min={1}
              max={14}
              value={duration}
              onChange={(e) => {
                const v = parseInt(e.target.value) || 1;
                setDuration(Math.min(14, Math.max(1, v)));
              }}
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* Custom hours (if custom frequency) */}
        <AnimatePresence>
          {frequency === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Intervalo personalizado (horas)
                </label>
                <Input
                  type="number"
                  min={0.5}
                  max={24}
                  step={0.5}
                  placeholder="Ej: 3.5"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  className="h-9 text-sm max-w-[200px]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Medications */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <CircleInfo size={11} weight="Outline" className="text-primary/60" />
              Medicamentos
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={addMedication}
              className="h-7 text-[11px] gap-1 text-primary hover:text-primary/80 hover:bg-primary/5"
            >
              <Plus size={13} weight="Outline" />
              Agregar
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {medications.map((med, idx) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex gap-2 items-center"
              >
                <Input
                  placeholder="Nombre"
                  value={med.name}
                  onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                  className="h-8 text-xs flex-1"
                />
                <Input
                  placeholder="Dosis"
                  value={med.dose}
                  onChange={(e) => updateMedication(med.id, 'dose', e.target.value)}
                  className="h-8 text-xs w-20"
                />
                <Select
                  value={med.unit}
                  onValueChange={(v) => updateMedication(med.id, 'unit', v)}
                >
                  <SelectTrigger className="h-8 text-xs w-[80px]" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {medications.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMedication(med.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 shrink-0"
                  >
                    <Trash size={14} weight="Outline" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full h-10 gap-2 hover-tap neon-border"
        >
          <Calendar size={16} weight="Outline" />
          Generar Horario
        </Button>

        {/* ─── SCHEDULE DISPLAY ─── */}
        <AnimatePresence>
          {showSchedule && canGenerate && doseTimes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="space-y-4 micro-bounce"
            >
              {/* Time period legend */}
              <div className="flex flex-wrap gap-2">
                {TIME_PERIODS.map((tp) => (
                  <div
                    key={tp.value}
                    className="flex items-center gap-1.5 text-[10px]"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: tp.color }}
                    />
                    <span className="text-muted-foreground font-medium">{tp.label}</span>
                  </div>
                ))}
                {currentTime !== null && (
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="w-2.5 h-0.5 rounded-full inline-block bg-red-500" />
                    <span className="text-muted-foreground font-medium">Ahora</span>
                  </div>
                )}
              </div>

              {/* 24-hour Timeline Bar */}
              <Card className="depth-shadow overflow-hidden" style={{ borderRadius: 12 }}>
                <CardContent className="p-3">
                  <div className="relative h-10 w-full bg-muted/30 rounded-lg overflow-hidden">
                    {/* Time period backgrounds */}
                    <div className="absolute inset-0 flex">
                      {/* Night 0-6 */}
                      <div
                        className="h-full border-r border-border/30"
                        style={{
                          width: '25%',
                          background: 'oklch(0.55 0.15 290 / 0.08)',
                        }}
                      />
                      {/* Morning 6-12 */}
                      <div
                        className="h-full border-r border-border/30"
                        style={{
                          width: '25%',
                          background: 'oklch(0.75 0.15 75 / 0.08)',
                        }}
                      />
                      {/* Afternoon 12-18 */}
                      <div
                        className="h-full border-r border-border/30"
                        style={{
                          width: '25%',
                          background: 'oklch(0.55 0.15 165 / 0.08)',
                        }}
                      />
                      {/* Evening 18-22 + Night 22-24 */}
                      <div
                        className="h-full flex"
                        style={{ width: '25%' }}
                      >
                        <div
                          className="h-full border-r border-border/30"
                          style={{
                            width: '4/24 * 100%',
                            background: 'oklch(0.55 0.15 250 / 0.08)',
                            flex: '4 0 0',
                          }}
                        />
                        <div
                          className="h-full"
                          style={{
                            background: 'oklch(0.55 0.15 290 / 0.08)',
                            flex: '2 0 0',
                          }}
                        />
                      </div>
                    </div>

                    {/* Hour labels */}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between px-1">
                      {[0, 6, 12, 18].map((h) => (
                        <span key={h} className="text-[8px] text-muted-foreground/70 font-mono">
                          {h.toString().padStart(2, '0')}
                        </span>
                      ))}
                    </div>

                    {/* Dose time markers */}
                    {doseTimes.map((t) => {
                      const h = Math.floor(t / 60);
                      const m = t % 60;
                      const pct = (t / (24 * 60)) * 100;
                      const period = getTimePeriod(h);
                      const meta = getTimePeriodMeta(period);
                      return (
                        <div
                          key={t}
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                          style={{ left: `${pct}%` }}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-150 cursor-pointer"
                            style={{ backgroundColor: meta.color }}
                          />
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-popover text-popover-foreground text-[9px] font-medium shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {formatTime(h, m)}
                          </div>
                        </div>
                      );
                    })}

                    {/* Current time indicator */}
                    {currentTime !== null && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                        style={{ left: `${(currentTime / (24 * 60)) * 100}%` }}
                      >
                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Progress bar */}
              {progressInfo.total > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Progreso de administración
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: progressInfo.pct === 100 ? 'oklch(0.65 0.2 145)' : undefined }}>
                      {progressInfo.checked}/{progressInfo.total} ({progressInfo.pct}%)
                    </span>
                  </div>
                  <div className="progress-mini">
                    <div
                      className="progress-mini-fill"
                      style={{ width: `${progressInfo.pct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Schedule Table */}
              <Card className="depth-shadow overflow-hidden" style={{ borderRadius: 12 }}>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2">
                    <Clock size={14} weight="Outline" className="text-primary/70" />
                    Tabla de Horario
                    <Badge variant="outline" className="ml-auto text-[9px] font-normal duration-badge">
                      {duration} {duration === 1 ? 'día' : 'días'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="overflow-x-auto max-h-96 overflow-y-auto -mx-3 px-3">
                    <table className="w-full text-[11px] border-collapse">
                      <thead className="sticky top-0 z-10">
                        <tr>
                          <th className="text-left py-1.5 px-2 bg-background border-b border-border/50 font-semibold text-muted-foreground whitespace-nowrap min-w-[70px]">
                            Hora
                          </th>
                          {Array.from({ length: duration }, (_, i) => i + 1).map((d) => (
                            <th
                              key={d}
                              className="text-center py-1.5 px-1.5 bg-background border-b border-border/50 font-semibold text-muted-foreground whitespace-nowrap min-w-[48px]"
                            >
                              Día {d}
                            </th>
                          ))}
                          <th className="text-center py-1.5 px-2 bg-background border-b border-border/50 font-semibold text-muted-foreground whitespace-nowrap min-w-[50px]">
                            Período
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {doseTimes.map((t) => {
                          const h = Math.floor(t / 60);
                          const m = t % 60;
                          const period = getTimePeriod(h);
                          const meta = getTimePeriodMeta(period);
                          return (
                            <tr
                              key={t}
                              className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                            >
                              {/* Time column */}
                              <td className="py-1.5 px-2 font-mono font-semibold whitespace-nowrap">
                                <span style={{ color: meta.color }}>
                                  {formatTime(h, m)}
                                </span>
                              </td>

                              {/* Day cells */}
                              {Array.from({ length: duration }, (_, i) => i + 1).map((d) => {
                                const key = `${d}-${h}-${m}`;
                                const isChecked = !!checkedDoses[key];
                                return (
                                  <td
                                    key={d}
                                    className="py-1 px-1 text-center"
                                  >
                                    <div className="flex flex-col items-center gap-0.5">
                                      {validMeds.length > 0 && (
                                        <span
                                          className="text-[9px] leading-tight font-medium truncate max-w-[48px]"
                                          style={{ color: isChecked ? 'oklch(0.4 0 0 / 0.4)' : meta.color }}
                                        >
                                          {validMeds.map((med) => med.name).join(', ')}
                                        </span>
                                      )}
                                      <span
                                        className="text-[9px] leading-tight"
                                        style={{ color: isChecked ? 'oklch(0.4 0 0 / 0.3)' : undefined }}
                                      >
                                        {validMeds.length > 0
                                          ? validMeds.map((med) => `${med.dose}${med.unit}`).join(', ')
                                          : '—'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => toggleDose(key)}
                                        className="w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all mt-0.5 hover-tap"
                                        style={{
                                          backgroundColor: isChecked ? meta.color : 'transparent',
                                          borderColor: isChecked ? meta.color : 'oklch(0 0 0 / 0.2)',
                                        }}
                                        aria-label={`Marcar dosis día ${d} a las ${formatTime(h, m)}`}
                                      >
                                        {isChecked && (
                                          <Check
                                            size={10}
                                            weight="Fill"
                                            className="text-white"
                                          />
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                );
                              })}

                              {/* Period badge */}
                              <td className="py-1.5 px-2 text-center">
                                <span
                                  className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                                  style={{
                                    color: meta.color,
                                    backgroundColor: meta.bg,
                            border: `1px solid ${meta.border}`,
                                  }}
                                >
                                  {meta.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2 no-print">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex-1 h-9 gap-1.5 text-xs hover-tap"
                >
                  {copied ? (
                    <>
                      <Check size={14} weight="Fill" className="copy-success" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy size={14} weight="Outline" />
                      Copiar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex-1 h-9 gap-1.5 text-xs hover-tap"
                >
                  <Printer size={14} weight="Outline" />
                  Imprimir
                </Button>
              </div>

              {/* Info note */}
              <p className="text-[10px] text-muted-foreground/70 flex items-start gap-1 leading-tight">
                <CircleInfo size={11} weight="Outline" className="mt-0.5 flex-shrink-0" />
                <span>
                  Las marcas de verificación son temporales y se pierden al recargar la página. Use «Copiar» para guardar el horario.
                </span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
