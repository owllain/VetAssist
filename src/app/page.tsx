'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { SlotText } from 'slot-text/react';
import {
  HeartPulse,
  Pill,
  Stethoscope,
  Shield,
  Syringe,
  Calculator,
  Menu,
  Scale,
  MedicalKit,
  Paw,
  CircleInfo,
  ClipboardText,
  Star,
  Clock,
  Printer,
} from 'reicon-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import MedicationCalculator from '@/components/vet/MedicationCalculator';
import FreeModeCalculator from '@/components/vet/FreeModeCalculator';
import FoodCalculator from '@/components/vet/FoodCalculator';

type TabId = 'medicamentos' | 'modo-libre' | 'alimentos' | 'acerca';

const TABS: { id: TabId; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'medicamentos',
    label: 'Medicamentos',
    icon: <Pill size={16} weight="outline" />,
    desc: '27 medicamentos en 8 categorías',
  },
  {
    id: 'modo-libre',
    label: 'Modo Libre',
    icon: <Calculator size={16} weight="outline" />,
    desc: 'Dosis personalizada por kg',
  },
  {
    id: 'alimentos',
    label: 'Alimentos',
    icon: <Scale size={16} weight="outline" />,
    desc: 'Ración diaria en gramos, onzas y tazas',
  },
  {
    id: 'acerca',
    label: 'Acerca de',
    icon: <CircleInfo size={16} weight="outline" />,
    desc: 'Información y aviso legal',
  },
];

const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = target;
    const duration = 1500;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function StatCard({ icon, value, suffix, label }: { icon: React.ReactNode; value: number; suffix: string; label: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/50 shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-primary">
          <AnimatedCounter target={value} suffix={suffix} />
        </p>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('medicamentos');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setMobileOpen(false);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-primary/10 shadow-sm">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveTab('medicamentos'); }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <HeartPulse size={20} color="white" weight="outline" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground leading-tight">VetCalc CR</span>
              <span className="text-[10px] text-muted-foreground leading-tight tracking-wide uppercase">Veterinaria Costa Rica</span>
            </div>
          </button>

          {/* Desktop nav tabs */}
          <div className="hidden md:flex gap-1 bg-muted/50 rounded-xl p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-primary-foreground bg-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Print + Mobile menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrint}
              className="hidden md:flex no-print"
              title="Imprimir resultado"
            >
              <Printer size={18} weight="outline" className="text-muted-foreground" />
            </Button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu size={24} weight="outline" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-primary">
                    <HeartPulse size={22} weight="outline" color="oklch(0.55 0.15 165)" />
                    VetCalc CR
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-6">
                  {TABS.map((tab) => (
                    <SheetClose asChild key={tab.id}>
                      <button
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {tab.icon}
                        <div className="text-left">
                          <div>{tab.label}</div>
                          <div className={`text-xs mt-0.5 ${activeTab === tab.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {tab.desc}
                          </div>
                        </div>
                      </button>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ========== HERO SECTION ========== */}
        <section className="vet-gradient heartbeat-line relative overflow-hidden">
          <div className="absolute inset-0 hospital-stripe" />
          <div className="container relative mx-auto px-4 py-10 md:py-16 lg:py-20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-4">
                  <Star size={14} weight="fill" color="oklch(0.75 0.15 85)" />
                  Herramienta profesional veterinaria
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-foreground leading-[1.1]">
                  <SlotText
                    text="Calculadora Veterinaria"
                    options={{ rollBy: 'word', stagger: 60, duration: 350 }}
                  />
                </h1>
                <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
                  Calcule con precisión dosis de medicamentos y alimentación para{' '}
                  <strong className="text-foreground">perros y gatos</strong>.{' '}
                  Base de datos actualizada con los fármacos de uso común en Costa Rica.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    onClick={() => handleTabChange('medicamentos')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground vet-pulse rounded-xl shadow-lg shadow-primary/20"
                  >
                    <span className="flex items-center gap-2">
                      <Stethoscope size={18} weight="outline" />
                      Comenzar
                    </span>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleTabChange('acerca')}
                    className="rounded-xl border-primary/20 hover:bg-primary/5"
                  >
                    Más información
                  </Button>
                </div>
              </div>

              {/* Hero images */}
              <div className="relative flex justify-center items-end min-h-[240px] md:min-h-[340px] lg:min-h-[380px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-primary/5 blur-3xl" />
                </div>
                <img
                  src="/images/image-DAl3X5KYHo7tfhJ37GYdi3IFMbtgDy.png"
                  alt="Gatito lindo"
                  className="w-40 sm:w-48 md:w-60 lg:w-64 vet-float relative z-10 drop-shadow-lg"
                />
                <img
                  src="/images/image-mq50sdliTKLbR8pLTjQHnMsozKTjol.png"
                  alt="Pastor Alemán"
                  className="w-40 sm:w-48 md:w-60 lg:w-64 vet-float absolute right-4 md:right-0 bottom-0 drop-shadow-lg"
                  style={{ animationDelay: '1s' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========== QUICK INFO BAR ========== */}
        <div className="quick-info-bar no-print">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={<Pill size={20} color="oklch(0.55 0.15 165)" weight="outline" />}
                value={27} suffix="" label="Medicamentos"
              />
              <StatCard
                icon={<Shield size={20} color="oklch(0.6 0.12 145)" weight="outline" />}
                value={8} suffix="" label="Categorías terapéuticas"
              />
              <StatCard
                icon={<Paw size={20} color="oklch(0.65 0.2 30)" weight="outline" />}
                value={2} suffix="" label="Especies (perros y gatos)"
              />
              <StatCard
                icon={<Clock size={20} color="oklch(0.7 0.15 75)" weight="outline" />}
                value={3} suffix="" label="Calculadoras disponibles"
              />
            </div>
          </div>
        </div>

        {/* ========== MAIN CONTENT TABS ========== */}
        <AnimatePresence mode="wait">
          {activeTab === 'medicamentos' && (
            <motion.section
              key="medicamentos"
              id="medicamentos"
              className="py-10 md:py-14 relative"
              {...sectionVariants}
            >
              <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                    <Pill size={28} color="oklch(0.55 0.15 165)" weight="outline" />
                    <SlotText
                      text="Calculadora de Medicamentos"
                      options={{ rollBy: 'word', stagger: 50, duration: 300 }}
                    />
                  </h2>
                  <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                    Seleccione un medicamento y calcule la dosis exacta para su paciente
                  </p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <MedicationCalculator />
                </div>
              </div>
              <img
                src="/images/image-SNWiaDnaZNy4wyUYuQkRujeWhGg8dB.png"
                alt=""
                className="absolute top-20 right-4 w-28 opacity-15 vet-float hidden lg:block"
                aria-hidden="true"
              />
            </motion.section>
          )}

          {activeTab === 'modo-libre' && (
            <motion.section
              key="modo-libre"
              id="modo-libre"
              className="py-10 md:py-14 section-alt"
              {...sectionVariants}
            >
              <div className="container relative mx-auto px-4">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                    <Calculator size={28} color="oklch(0.55 0.15 165)" weight="outline" />
                    <SlotText
                      text="Modo Libre"
                      options={{ rollBy: 'word', stagger: 50, duration: 300 }}
                    />
                  </h2>
                  <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                    Ingrese cualquier dosis personalizada por kilogramo de peso
                  </p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <FreeModeCalculator />
                </div>
              </div>
              <img
                src="/images/image-ly2ke4dipmCnYtX9BC9iqRGJSIcsV8.png"
                alt=""
                className="absolute bottom-16 left-4 w-24 opacity-15 vet-float hidden lg:block"
                style={{ animationDelay: '2s' }}
                aria-hidden="true"
              />
            </motion.section>
          )}

          {activeTab === 'alimentos' && (
            <motion.section
              key="alimentos"
              id="alimentos"
              className="py-10 md:py-14 relative"
              {...sectionVariants}
            >
              <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                    <Scale size={28} color="oklch(0.55 0.15 165)" weight="outline" />
                    <SlotText
                      text="Calculadora de Alimentos"
                      options={{ rollBy: 'word', stagger: 50, duration: 300 }}
                    />
                  </h2>
                  <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
                    Calcule la cantidad diaria de alimento según peso, actividad y número de comidas.
                    Incluye equivalencias en onzas y tazas.
                  </p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <FoodCalculator />
                </div>
              </div>
              <img
                src="/images/image-m4itMs7R4FPhQzkRJCPAY1oHA04XQw.png"
                alt=""
                className="absolute top-20 right-8 w-28 opacity-15 vet-float hidden lg:block"
                style={{ animationDelay: '1.5s' }}
                aria-hidden="true"
              />
            </motion.section>
          )}

          {activeTab === 'acerca' && (
            <motion.section
              key="acerca"
              id="acerca"
              className="py-10 md:py-14 section-alt"
              {...sectionVariants}
            >
              <div className="container relative mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <img
                    src="/images/image-ViY6rawiI2uiV9tsy3QGZXdyngtXrC.png"
                    alt="Doctor veterinario"
                    className="w-36 mx-auto mb-4 drop-shadow-lg"
                  />
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                    <MedicalKit size={28} color="oklch(0.55 0.15 165)" weight="outline" />
                    <SlotText
                      text="Acerca de VetCalc CR"
                      options={{ rollBy: 'word', stagger: 50, duration: 300 }}
                    />
                  </h2>
                  <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    VetCalc CR es una herramienta de apoyo diseñada para profesionales veterinarios en Costa Rica.
                    Permite calcular con precisión las dosis de medicamentos de uso común en medicina veterinaria
                    para perros y gatos, así como la cantidad diaria de alimento basada en requerimientos energéticos.
                  </p>

                  {/* Feature cards */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="vet-card-hover overflow-hidden">
                      <div className="h-1.5 bg-gradient-to-r from-primary to-primary/40" />
                      <CardContent className="p-5 text-center">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                          <Pill size={24} color="oklch(0.55 0.15 165)" weight="outline" />
                        </div>
                        <h3 className="font-bold">27 Medicamentos</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Base de datos con dosificaciones verificadas para la práctica veterinaria en CR
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="vet-card-hover overflow-hidden">
                      <div className="h-1.5 bg-gradient-to-r from-chart-3 to-chart-3/40" />
                      <CardContent className="p-5 text-center">
                        <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center mx-auto mb-3">
                          <Shield size={24} color="oklch(0.6 0.12 145)" weight="outline" />
                        </div>
                        <h3 className="font-bold">8 Categorías</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Desde anestésicos hasta analgésicos — cobertura terapéutica completa
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="vet-card-hover overflow-hidden">
                      <div className="h-1.5 bg-gradient-to-r from-chart-2 to-chart-2/40" />
                      <CardContent className="p-5 text-center">
                        <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center mx-auto mb-3">
                          <Scale size={24} color="oklch(0.65 0.2 30)" weight="outline" />
                        </div>
                        <h3 className="font-bold">Alimentación RER/DER</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Cálculo basado en estándares veterinarios con soporte para onzas y tazas
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Legal Disclaimer */}
                  <div className="mt-8">
                    <Alert variant="destructive" className="text-left">
                      <Syringe size={18} weight="outline" />
                      <AlertTitle className="flex items-center gap-2">
                        <ClipboardText size={16} weight="outline" />
                        Aviso Legal Importante
                      </AlertTitle>
                      <AlertDescription className="text-sm mt-2 leading-relaxed">
                        Esta herramienta es <strong>solo de referencia</strong> y no sustituye el criterio
                        clínico profesional. Las dosis mostradas se basan en formularios veterinarios estándar,
                        pero cada paciente es único. Siempre verifique la dosificación con las guías
                        actualizadas, considere la condición clínica individual, y siga los protocolos
                        establecidos por el <strong>Colegio de Médicos Veterinarios de Costa Rica</strong>.
                        El uso de esta herramienta es responsabilidad exclusiva del profesional que la consulta.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="footer-wave bg-[#115459] text-white pt-12 pb-8 mt-auto no-print">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                  <HeartPulse size={20} weight="outline" color="white" />
                </div>
                <div>
                  <span className="font-bold text-lg">VetCalc CR</span>
                  <p className="text-[10px] text-teal-300 uppercase tracking-wider">Veterinaria Costa Rica</p>
                </div>
              </div>
              <p className="text-teal-200/80 text-sm leading-relaxed">
                Herramienta profesional para el cálculo de dosis de medicamentos y
                alimentación en pequeños animales.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-teal-300 mb-3">Recursos</h3>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => handleTabChange('medicamentos')}
                    className="text-teal-200/80 hover:text-white transition-colors text-sm flex items-center gap-2"
                  >
                    <Pill size={14} weight="outline" />
                    Calculadora de Medicamentos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('alimentos')}
                    className="text-teal-200/80 hover:text-white transition-colors text-sm flex items-center gap-2"
                  >
                    <Scale size={14} weight="outline" />
                    Calculadora de Alimentos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('modo-libre')}
                    className="text-teal-200/80 hover:text-white transition-colors text-sm flex items-center gap-2"
                  >
                    <Calculator size={14} weight="outline" />
                    Modo Libre
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-teal-300 mb-3">Información</h3>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => handleTabChange('acerca')}
                    className="text-teal-200/80 hover:text-white transition-colors text-sm flex items-center gap-2"
                  >
                    <CircleInfo size={14} weight="outline" />
                    Acerca de
                  </button>
                </li>
                <li>
                  <button
                    onClick={handlePrint}
                    className="text-teal-200/80 hover:text-white transition-colors text-sm flex items-center gap-2"
                  >
                    <Printer size={14} weight="outline" />
                    Imprimir resultado
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/15 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-teal-300/70">
            <p>© 2025 VetCalc CR — Herramienta de referencia para veterinarios en Costa Rica</p>
            <p className="flex items-center gap-1.5">
              <Shield size={12} weight="outline" />
              Solo para uso profesional veterinario
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
