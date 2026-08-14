'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTheme } from 'next-themes';

import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useKeyboardShortcuts } from '@/lib/use-keyboard-shortcuts';
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
  Sun,
  Moon,
  Database,
  ArrowUp,
  Notebook,
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
import DataManager from '@/components/vet/DataManager';
import ClinicalNotes from '@/components/vet/ClinicalNotes';

type TabId = 'medicamentos' | 'modo-libre' | 'alimentos' | 'acerca';

const TABS: { id: TabId; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'medicamentos',
    label: 'Medicamentos',
    icon: <Pill size={16} weight="Outline" />,
    desc: '27 medicamentos en 8 categorías',
  },
  {
    id: 'modo-libre',
    label: 'Modo Libre',
    icon: <Calculator size={16} weight="Outline" />,
    desc: 'Dosis personalizada por kg',
  },
  {
    id: 'alimentos',
    label: 'Alimentos',
    icon: <Scale size={16} weight="Outline" />,
    desc: 'Ración diaria en gramos, onzas y tazas',
  },
  {
    id: 'acerca',
    label: 'Acerca de',
    icon: <CircleInfo size={16} weight="Outline" />,
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
    <div className="group flex items-center gap-3 bg-card/70 backdrop-blur-sm rounded-xl px-4 py-3 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 hover-lift relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/40 via-chart-3/40 to-primary/40" aria-hidden="true" />
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold">
          <span className="gradient-text">
            <AnimatedCounter target={value} suffix={suffix} />
          </span>
        </p>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('medicamentos');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dataManagerOpen, setDataManagerOpen] = useState(false);
  const [clinicalNotesOpen, setClinicalNotesOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { theme, setTheme } = useTheme();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update tab indicator position
  useEffect(() => {
    const idx = TABS.findIndex(t => t.id === activeTab);
    const btn = tabRefs.current[idx];
    if (btn) {
      const parent = btn.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        setIndicatorStyle({
          left: btnRect.left - parentRect.left,
          width: btnRect.width,
        });
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      setShowScrollTop(scrollTop > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setMobileOpen(false);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Keyboard shortcuts
  const shortcuts = useMemo(() => ({
    'ctrl+1': () => handleTabChange('medicamentos'),
    'ctrl+2': () => handleTabChange('modo-libre'),
    'ctrl+3': () => handleTabChange('alimentos'),
    'ctrl+4': () => handleTabChange('acerca'),
    'ctrl+p': handlePrint,
    'ctrl+d': () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  }), [handleTabChange, handlePrint, theme, setTheme]);
  useKeyboardShortcuts(shortcuts);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Scroll progress bar */}
      <div
        className="scroll-progress-bar no-print"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '3px',
          zIndex: 60,
          background: 'linear-gradient(90deg, oklch(0.55 0.15 165), oklch(0.6 0.12 145))',
          width: `${scrollProgress}%`,
          transition: 'width 0.1s linear',
          pointerEvents: 'none',
        }}
      />
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-primary/10 shadow-sm">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveTab('medicamentos'); }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <HeartPulse size={20} color="white" weight="Outline" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground leading-tight">VetCalc CR</span>
              <span className="text-[10px] text-muted-foreground leading-tight tracking-wide uppercase">Veterinaria Costa Rica</span>
            </div>
          </button>

          {/* Desktop nav tabs with sliding indicator */}
          <div className="hidden md:flex gap-1 bg-muted/50 rounded-xl p-1 border border-border/30 tab-indicator-track relative">
            <motion.div
              className="tab-indicator"
              animate={indicatorStyle}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
            {TABS.map((tab, idx) => (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[idx] = el; }}
                onClick={() => handleTabChange(tab.id)}
                className={`relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                <span className="hidden xl:inline">{tab.label}</span>
                <kbd className="hidden lg:inline text-[9px] ml-1 px-1 py-0.5 rounded bg-foreground/5 text-muted-foreground font-mono">
                  Ctrl+{TABS.indexOf(tab) + 1}
                </kbd>
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
              <Printer size={18} weight="Outline" className="text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="no-print"
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={18} weight="Outline" /> : <Moon size={18} weight="Outline" />}
            </Button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu size={24} weight="Outline" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-primary">
                    <HeartPulse size={22} weight="Outline" color="oklch(0.55 0.15 165)" />
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
                  <div className="border-t border-border mt-2 pt-2">
                    <button
                      onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-muted w-full"
                    >
                      {theme === 'dark' ? <Sun size={18} weight="Outline" /> : <Moon size={18} weight="Outline" />}
                      {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                    </button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ========== HERO SECTION ========== */}
        <section className="vet-gradient heartbeat-line particles-bg hero-vignette relative overflow-hidden">
          {/* Morph blobs */}
          <div className="morph-blob" style={{ top: '10%', left: '5%', background: 'oklch(0.55 0.15 165)' }} />
          <div className="morph-blob" style={{ top: '40%', right: '8%', background: 'oklch(0.6 0.12 145)', animationDelay: '-4s', width: '160px', height: '160px' }} />
          <div className="morph-blob" style={{ bottom: '10%', left: '40%', background: 'oklch(0.65 0.2 30)', animationDelay: '-8s', width: '140px', height: '140px', opacity: 0.05 }} />
          <div className="absolute inset-0 hospital-stripe" />
          <div className="container relative mx-auto px-4 py-10 md:py-16 lg:py-20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-4">
                  <Star size={14} weight="Fill" color="oklch(0.75 0.15 85)" />
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
                  <div className="relative inline-block">
                    <span className="absolute -inset-1.5 rounded-xl bg-primary/25 blur-md -z-10 breathe" aria-hidden="true" />
                    <Button
                      size="lg"
                      onClick={() => handleTabChange('medicamentos')}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground vet-pulse ripple-btn rounded-xl shadow-lg shadow-primary/20"
                    >
                      <span className="flex items-center gap-2">
                        <Stethoscope size={18} weight="Outline" />
                        Comenzar
                      </span>
                    </Button>
                  </div>
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

        {/* Section divider */}
        <div className="section-divider no-print" aria-hidden="true" />

        {/* ========== QUICK INFO BAR ========== */}
        <div className="quick-info-bar no-print vet-texture">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={<Pill size={20} color="oklch(0.55 0.15 165)" weight="Outline" />}
                value={27} suffix="" label="Medicamentos"
              />
              <StatCard
                icon={<ClipboardText size={20} color="oklch(0.6 0.12 145)" weight="Outline" />}
                value={6} suffix="" label="Protocolos rápidos"
              />
              <StatCard
                icon={<Shield size={20} color="oklch(0.7 0.15 75)" weight="Outline" />}
                value={21} suffix="" label="Interacciones registradas"
              />
              <StatCard
                icon={<Database size={20} color="oklch(0.55 0.2 290)" weight="Outline" />}
                value={10} suffix="" label="Herramientas integradas"
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
                    <Pill size={28} color="oklch(0.55 0.15 165)" weight="Outline" />
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
                    <Calculator size={28} color="oklch(0.55 0.15 165)" weight="Outline" />
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
                    <Scale size={28} color="oklch(0.55 0.15 165)" weight="Outline" />
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
                    <MedicalKit size={28} color="oklch(0.55 0.15 165)" weight="Outline" />
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
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-in">
                    <div style={{ '--i': 0 } as React.CSSProperties}>
                    <Card className="vet-card-hover-enhanced hover-lift overflow-hidden glow-ring relative card-shine">
                      <div className="h-1.5 bg-gradient-to-r from-primary to-primary/40" />
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" aria-hidden="true" />
                      <CardContent className="p-5 text-center relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                          <Pill size={24} color="oklch(0.55 0.15 165)" weight="Outline" />
                        </div>
                        <h3 className="font-bold">27 Medicamentos</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Base de datos con dosificaciones verificadas para la práctica veterinaria en CR
                        </p>
                      </CardContent>
                    </Card>
                    </div>
                    <div style={{ '--i': 1 } as React.CSSProperties}>
                    <Card className="vet-card-hover-enhanced hover-lift overflow-hidden glow-ring relative card-shine">
                      <div className="h-1.5 bg-gradient-to-r from-chart-3 to-chart-3/40" />
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-chart-3/5 to-transparent pointer-events-none" aria-hidden="true" />
                      <CardContent className="p-5 text-center relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center mx-auto mb-3">
                          <Shield size={24} color="oklch(0.6 0.12 145)" weight="Outline" />
                        </div>
                        <h3 className="font-bold">8 Categorías</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Desde anestésicos hasta analgésicos — cobertura terapéutica completa
                        </p>
                      </CardContent>
                    </Card>
                    </div>
                    <div style={{ '--i': 2 } as React.CSSProperties}>
                    <Card className="vet-card-hover-enhanced hover-lift overflow-hidden glow-ring relative card-shine">
                      <div className="h-1.5 bg-gradient-to-r from-chart-2 to-chart-2/40" />
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-chart-2/5 to-transparent pointer-events-none" aria-hidden="true" />
                      <CardContent className="p-5 text-center relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center mx-auto mb-3">
                          <Scale size={24} color="oklch(0.65 0.2 30)" weight="Outline" />
                        </div>
                        <h3 className="font-bold">Alimentación RER/DER</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Cálculo basado en estándares veterinarios con soporte para onzas y tazas
                        </p>
                      </CardContent>
                    </Card>
                    </div>
                    <div style={{ '--i': 3 } as React.CSSProperties}>
                    <Card className="vet-card-hover-enhanced hover-lift overflow-hidden glow-ring relative card-shine">
                      <div className="h-1.5 bg-gradient-to-r from-amber-400 to-amber-400/40" />
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-400/5 to-transparent pointer-events-none" aria-hidden="true" />
                      <CardContent className="p-5 text-center relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-3">
                          <ClipboardText size={24} color="oklch(0.7 0.18 75)" weight="Outline" />
                        </div>
                        <h3 className="font-bold">6 Protocolos Rápidos</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pre-quirúrgicos, desparasitación, analgesia post-op y más — listos para usar
                        </p>
                      </CardContent>
                    </Card>
                    </div>
                    <div style={{ '--i': 4 } as React.CSSProperties}>
                    <Card className="vet-card-hover-enhanced hover-lift overflow-hidden glow-ring relative card-shine">
                      <div className="h-1.5 bg-gradient-to-r from-red-400 to-red-400/40" />
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-red-400/5 to-transparent pointer-events-none" aria-hidden="true" />
                      <CardContent className="p-5 text-center relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-3">
                          <Syringe size={24} color="oklch(0.6 0.2 25)" weight="Outline" />
                        </div>
                        <h3 className="font-bold">Verificador de Interacciones</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Detecte interacciones medicamentosas peligrosas antes de prescribir
                        </p>
                      </CardContent>
                    </Card>
                    </div>
                    <div style={{ '--i': 5 } as React.CSSProperties}>
                    <Card className="vet-card-hover-enhanced hover-lift overflow-hidden glow-ring relative card-shine">
                      <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-400/40" />
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-emerald-400/5 to-transparent pointer-events-none" aria-hidden="true" />
                      <CardContent className="p-5 text-center relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-3">
                          <HeartPulse size={24} color="oklch(0.65 0.2 145)" weight="Outline" />
                        </div>
                        <h3 className="font-bold">BCS + Herramientas</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Condición corporal, conversor de peso, historial y atajos de teclado
                        </p>
                      </CardContent>
                    </Card>
                    </div>
                    <div style={{ '--i': 6 } as React.CSSProperties}>
                    <Card className="vet-card-hover-enhanced hover-lift overflow-hidden glow-ring relative card-shine">
                      <div className="h-1.5 bg-gradient-to-r from-violet-400 to-violet-400/40" />
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-violet-400/5 to-transparent pointer-events-none" aria-hidden="true" />
                      <CardContent className="p-5 text-center relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center mx-auto mb-3">
                          <Database size={24} color="oklch(0.55 0.2 290)" weight="Outline" />
                        </div>
                        <h3 className="font-bold">Gestor de Datos</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">
                          Exporte, importe o elimine sus favoritos e historial de consultas
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDataManagerOpen(true)}
                          className="gap-1.5 text-xs"
                        >
                          <Database size={14} weight="Outline" />
                          Abrir Gestor
                        </Button>
                      </CardContent>
                    </Card>
                    </div>
                  </div>

                  {/* Legal Disclaimer */}
                  <div className="mt-8">
                    <Alert variant="destructive" className="text-left">
                      <Syringe size={18} weight="Outline" />
                      <AlertTitle className="flex items-center gap-2">
                        <ClipboardText size={16} weight="Outline" />
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

      {/* Data Manager Sheet */}
      <DataManager open={dataManagerOpen} onOpenChange={setDataManagerOpen} />

      {/* Clinical Notes Panel */}
      <ClinicalNotes open={clinicalNotesOpen} onOpenChange={setClinicalNotesOpen} />

      {/* Floating Clinical Notes FAB */}
      <AnimatePresence>
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={() => setClinicalNotesOpen(true)}
          className="no-print fab fixed bottom-20 right-5 z-50"
          title="Notas Clínicas"
          aria-label="Abrir notas clínicas"
        >
          <Notebook size={24} weight="Outline" />
        </motion.button>
      </AnimatePresence>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="no-print fixed bottom-20 left-5 z-50 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:bg-primary/90 transition-colors"
            title="Volver arriba"
            aria-label="Volver arriba"
          >
            <ArrowUp size={20} weight="Outline" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Section divider before footer */}
      <div className="section-divider no-print" aria-hidden="true" />

      {/* ========== FOOTER ========== */}
      <footer className="footer-wave bg-[#115459] text-white pt-12 pb-8 mt-auto no-print">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                  <HeartPulse size={20} weight="Outline" color="white" />
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
                    className="text-teal-200/80 hover:text-white transition-colors text-sm flex items-center gap-2 animated-underline"
                  >
                    <Pill size={14} weight="Outline" />
                    <span>Calculadora de Medicamentos</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('alimentos')}
                    className="text-teal-200/80 hover:text-white transition-colors text-sm flex items-center gap-2 animated-underline"
                  >
                    <Scale size={14} weight="Outline" />
                    <span>Calculadora de Alimentos</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('modo-libre')}
                    className="text-teal-200/80 hover:text-white transition-colors text-sm flex items-center gap-2 animated-underline"
                  >
                    <Calculator size={14} weight="Outline" />
                    <span>Modo Libre</span>
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
                    className="text-teal-200/80 hover:text-white transition-colors text-sm flex items-center gap-2 animated-underline"
                  >
                    <CircleInfo size={14} weight="Outline" />
                    <span>Acerca de</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={handlePrint}
                    className="text-teal-200/80 hover:text-white transition-colors text-sm flex items-center gap-2 animated-underline"
                  >
                    <Printer size={14} weight="Outline" />
                    <span>Imprimir resultado</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/15 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-teal-300/70">
            <div className="flex items-center gap-3">
              <p>© 2025 VetCalc CR — Herramienta de referencia para veterinarios en Costa Rica</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-teal-300 text-[10px] font-mono font-semibold tracking-wider">
                v2.0
              </span>
            </div>
            <p className="flex items-center gap-1.5">
              <Shield size={12} weight="Outline" />
              Solo para uso profesional veterinario
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
