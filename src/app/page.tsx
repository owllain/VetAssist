'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill,
  Stethoscope,
  Shield,
  Syringe,
  Calculator,
  Menu,
  Scale,
  MedicalKit,
  CircleInfo,
  ClipboardText,
  Printer,
  Sun,
  Moon,
  Database,
  ArrowUp,
  Notebook,
  Drop,
  CalendarCheck,
  Warning,
  Repeat,
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
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const TabSkeleton = () => (
  <div className="space-y-4 max-w-2xl mx-auto">
    <Skeleton className="h-8 w-64 mx-auto" />
    <Skeleton className="h-4 w-96 mx-auto" />
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

const MedicationCalculator = dynamic(() => import('@/components/vet/MedicationCalculator'), { loading: () => <TabSkeleton />, ssr: false });
const FrequentProtocols = dynamic(() => import('@/components/vet/FrequentProtocols'), { loading: () => <TabSkeleton />, ssr: false });
const FreeModeCalculator = dynamic(() => import('@/components/vet/FreeModeCalculator'), { loading: () => <TabSkeleton />, ssr: false });
const FoodCalculator = dynamic(() => import('@/components/vet/FoodCalculator'), { loading: () => <TabSkeleton />, ssr: false });
const IVFluidCalculator = dynamic(() => import('@/components/vet/IVFluidCalculator'), { loading: () => <TabSkeleton />, ssr: false });
const DoseSchedule = dynamic(() => import('@/components/vet/DoseSchedule'), { loading: () => <TabSkeleton />, ssr: false });
const DataManager = dynamic(() => import('@/components/vet/DataManager'), { loading: () => <TabSkeleton />, ssr: false });
const ClinicalNotes = dynamic(() => import('@/components/vet/ClinicalNotes'), { loading: () => <TabSkeleton />, ssr: false });
const EmergencyReference = dynamic(() => import('@/components/vet/EmergencyReference'), { loading: () => <TabSkeleton />, ssr: false });
const QuickConverter = dynamic(() => import('@/components/vet/QuickConverter'), { loading: () => <TabSkeleton />, ssr: false });

type TabId =
  | 'medicamentos'
  | 'protocolos'
  | 'modo-libre'
  | 'conversor'
  | 'alimentos'
  | 'fluidos'
  | 'horarios'
  | 'emergencias'
  | 'acerca';

const TABS: { id: TabId; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'medicamentos',
    label: 'Medicamentos',
    icon: <Pill size={16} weight="Outline" />,
    desc: '27 medicamentos en 8 categorías',
  },
  {
    id: 'protocolos',
    label: 'Protocolos Frecuentes',
    icon: <ClipboardText size={16} weight="Outline" />,
    desc: 'Protocolos anestésicos, analgésicos y clínicos',
  },
  {
    id: 'modo-libre',
    label: 'Modo Libre',
    icon: <Calculator size={16} weight="Outline" />,
    desc: 'Dosis personalizada por kg',
  },
  {
    id: 'conversor',
    label: 'Conversor',
    icon: <Repeat size={16} weight="Outline" />,
    desc: 'Conversión rápida de unidades',
  },
  {
    id: 'alimentos',
    label: 'Alimentos',
    icon: <Scale size={16} weight="Outline" />,
    desc: 'Ración diaria en gramos, onzas y tazas',
  },
  {
    id: 'fluidos',
    label: 'Fluidoterapia',
    icon: <Drop size={16} weight="Outline" />,
    desc: 'Tasa de infusión IV y gotas por minuto',
  },
  {
    id: 'horarios',
    label: 'Horarios',
    icon: <CalendarCheck size={16} weight="Outline" />,
    desc: 'Generador de horarios de medicación',
  },
  {
    id: 'emergencias',
    label: 'Emergencias',
    icon: <Warning size={16} weight="Outline" />,
    desc: 'Fármacos de emergencia rápida referencia',
  },
  {
    id: 'acerca',
    label: 'Acerca de',
    icon: <CircleInfo size={16} weight="Outline" />,
    desc: 'Información y aviso legal',
  },
];

const tabVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.2 },
};

function StatCard({ icon, value, suffix, label }: { icon: React.ReactNode; value: number; suffix: string; label: string }) {
  return (
    <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-border/50 shadow-sm transition-all duration-200">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-foreground">
          {value}{suffix}
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
    const mainElement = document.getElementById('main-calculator-area');
    if (mainElement) {
      mainElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
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
          pointerEvents: 'none',
        }}
      />

      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/90 border-b border-border/40 shadow-xs">
        <nav className="container mx-auto px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveTab('medicamentos');
            }}
            className="flex items-center gap-2.5 text-left group"
          >
            {/* Custom Logo Image instead of Heart Icon */}
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/images/image-6YCD688sjOC1kmBZgegAoQNGOCBOuQ.png"
                alt="VetAssist Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-foreground leading-none">
                VetAssist
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase mt-0.5">
                Asistente para cálculos de uso veterinario
              </span>
            </div>
          </button>

          {/* Desktop Nav Tabs (Fast, Snappy) */}
          <div className="hidden lg:flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-border/40">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrint}
              className="hidden sm:flex w-9 h-9 rounded-xl no-print text-muted-foreground hover:text-foreground"
              title="Imprimir resultado"
            >
              <Printer size={18} weight="Outline" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-xl no-print text-muted-foreground hover:text-foreground"
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={18} weight="Outline" /> : <Moon size={18} weight="Outline" />}
            </Button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden w-9 h-9 rounded-xl">
                  <Menu size={22} weight="Outline" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-5">
                <SheetHeader className="pb-3 border-b border-border/40 text-left">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/image-6YCD688sjOC1kmBZgegAoQNGOCBOuQ.png"
                      alt="VetAssist Logo"
                      className="w-9 h-9 object-contain rounded-lg"
                    />
                    <SheetTitle className="text-xl font-bold text-foreground">
                      VetAssist
                    </SheetTitle>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Asistente para cálculos de uso veterinario</p>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-4 overflow-y-auto max-h-[calc(100vh-140px)]">
                  {TABS.map((tab) => (
                    <SheetClose asChild key={tab.id}>
                      <button
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <span className="flex-shrink-0">{tab.icon}</span>
                        <div className="text-left min-w-0 flex-1">
                          <div className="leading-tight truncate">{tab.label}</div>
                          <div className={`text-[11px] truncate mt-0.5 ${activeTab === tab.id ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>
                            {tab.desc}
                          </div>
                        </div>
                      </button>
                    </SheetClose>
                  ))}
                  <div className="border-t border-border mt-3 pt-3">
                    <button
                      onClick={() => {
                        setTheme(theme === 'dark' ? 'light' : 'dark');
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium hover:bg-muted text-foreground w-full"
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

        {/* Mobile Horizontal Quick Tab Bar */}
        <div className="lg:hidden flex overflow-x-auto gap-1 px-4 py-2 border-t border-border/30 bg-muted/30 no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-card border border-border/60 text-muted-foreground'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1">
        {/* ========== HERO SECTION ========== */}
        <section className="vet-gradient relative overflow-hidden border-b border-border/30">
          <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-[1.1] tracking-tight">
                  Asistente para cálculos de uso veterinario
                </h1>
                <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
                  Herramienta de apoyo para el cálculo con precisión de dosis de medicamentos y alimentación para animales menores.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    onClick={() => handleTabChange('medicamentos')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md shadow-primary/20 h-12 px-6"
                  >
                    <span className="flex items-center gap-2">
                      <Stethoscope size={18} weight="Outline" />
                      Comenzar Cálculo
                    </span>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleTabChange('protocolos')}
                    className="rounded-xl border-border hover:bg-muted font-semibold h-12 px-5"
                  >
                    <ClipboardText size={18} weight="Outline" className="mr-1.5" />
                    Protocolos Frecuentes
                  </Button>
                </div>
              </div>

              {/* Single Hero Image - Optimized, Larger, Clean */}
              <div className="flex justify-center items-center">
                <img
                  src="/images/image-m4itMs7R4FPhQzkRJCPAY1oHA04XQw.png"
                  alt="Atención veterinaria canina"
                  className="w-56 sm:w-64 md:w-80 lg:w-96 h-auto drop-shadow-xl rounded-2xl object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========== QUICK INFO STATS BAR ========== */}
        <div className="quick-info-bar no-print border-b border-border/40 bg-muted/20">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={<Pill size={20} color="oklch(0.55 0.15 165)" weight="Outline" />}
                value={27} suffix="" label="Medicamentos"
              />
              <StatCard
                icon={<ClipboardText size={20} color="oklch(0.6 0.12 145)" weight="Outline" />}
                value={6} suffix="" label="Protocolos clínicos"
              />
              <StatCard
                icon={<Shield size={20} color="oklch(0.7 0.15 75)" weight="Outline" />}
                value={21} suffix="" label="Interacciones evaluadas"
              />
              <StatCard
                icon={<Database size={20} color="oklch(0.55 0.2 290)" weight="Outline" />}
                value={100} suffix="%" label="Privacidad local (Offline)"
              />
            </div>
          </div>
        </div>

        {/* ========== MAIN TAB CONTENT AREA ========== */}
        <div id="main-calculator-area" className="py-8 md:py-12">
          <AnimatePresence mode="wait">
            {activeTab === 'medicamentos' && (
              <motion.section key="medicamentos" id="medicamentos" {...tabVariants}>
                <div className="container mx-auto px-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                      <Pill size={26} color="oklch(0.55 0.15 165)" weight="Outline" />
                      Calculadora de Medicamentos
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                      Seleccione especie, peso y fármaco para calcular dosis mínimas, recomendadas y máximas
                    </p>
                  </div>
                  <div className="max-w-2xl mx-auto">
                    <MedicationCalculator onOpenNotes={() => setClinicalNotesOpen(true)} />
                  </div>
                </div>
              </motion.section>
            )}

            {activeTab === 'protocolos' && (
              <motion.section key="protocolos" id="protocolos" {...tabVariants}>
                <div className="container mx-auto px-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                      <ClipboardText size={26} color="oklch(0.55 0.15 165)" weight="Outline" />
                      Protocolos de Uso Frecuente
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                      Cálculo simultáneo de todos los medicamentos de protocolos anestésicos, post-op y terapéuticos
                    </p>
                  </div>
                  <div className="max-w-3xl mx-auto">
                    <FrequentProtocols />
                  </div>
                </div>
              </motion.section>
            )}

            {activeTab === 'modo-libre' && (
              <motion.section key="modo-libre" id="modo-libre" {...tabVariants}>
                <div className="container mx-auto px-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                      <Calculator size={26} color="oklch(0.55 0.15 165)" weight="Outline" />
                      Modo Libre
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                      Ingrese cualquier dosis personalizada por kilogramo de peso corporal
                    </p>
                  </div>
                  <div className="max-w-2xl mx-auto">
                    <FreeModeCalculator />
                  </div>
                </div>
              </motion.section>
            )}

            {activeTab === 'conversor' && (
              <motion.section key="conversor" id="conversor" {...tabVariants}>
                <div className="container mx-auto px-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                      <Repeat size={26} color="oklch(0.55 0.15 165)" weight="Outline" />
                      Conversor Rápido de Unidades
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                      Conversión instantánea entre peso, volumen, concentraciones y diluciones
                    </p>
                  </div>
                  <div className="max-w-2xl mx-auto">
                    <QuickConverter />
                  </div>
                </div>
              </motion.section>
            )}

            {activeTab === 'alimentos' && (
              <motion.section key="alimentos" id="alimentos" {...tabVariants}>
                <div className="container mx-auto px-4">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                      <Scale size={26} color="oklch(0.55 0.15 165)" weight="Outline" />
                      Calculadora de Alimentos
                    </h2>
                    <div className="my-3 flex justify-center">
                      <img
                        src="/images/image-75mXdfvt3lvbs8fSCmASg9n6biV6Q5.png"
                        alt="Nutrición canina y felina"
                        className="w-28 sm:w-36 h-auto drop-shadow-md rounded-xl object-contain"
                      />
                    </div>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
                      Calcule la cantidad diaria de alimento según peso, actividad y número de comidas con soporte para onzas y tazas
                    </p>
                  </div>
                  <div className="max-w-2xl mx-auto">
                    <FoodCalculator />
                  </div>
                </div>
              </motion.section>
            )}

            {activeTab === 'fluidos' && (
              <motion.section key="fluidos" id="fluidos" {...tabVariants}>
                <div className="container mx-auto px-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                      <Drop size={26} color="oklch(0.55 0.15 165)" weight="Outline" />
                      Calculadora de Fluidoterapia IV
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
                      Tasa de infusión, corrección de deshidratación, pérdidas y gotas por minuto
                    </p>
                  </div>
                  <div className="max-w-2xl mx-auto">
                    <IVFluidCalculator />
                  </div>
                </div>
              </motion.section>
            )}

            {activeTab === 'horarios' && (
              <motion.section key="horarios" id="horarios" {...tabVariants}>
                <div className="container mx-auto px-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                      <CalendarCheck size={26} color="oklch(0.55 0.15 165)" weight="Outline" />
                      Generador de Horarios de Medicación
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
                      Planifique el calendario de tomas y seguimiento de administración
                    </p>
                  </div>
                  <div className="max-w-4xl mx-auto">
                    <DoseSchedule />
                  </div>
                </div>
              </motion.section>
            )}

            {activeTab === 'emergencias' && (
              <motion.section key="emergencias" id="emergencias" {...tabVariants}>
                <div className="container mx-auto px-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                      <Warning size={26} color="oklch(0.6 0.2 25)" weight="Outline" />
                      Referencia de Emergencias
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
                      Fichas rápidas de fármacos críticos para soporte vital en caninos y felinos
                    </p>
                  </div>
                  <EmergencyReference />
                </div>
              </motion.section>
            )}

            {activeTab === 'acerca' && (
              <motion.section key="acerca" id="acerca" {...tabVariants}>
                <div className="container mx-auto px-4">
                  <div className="max-w-3xl mx-auto text-center space-y-6">
                    <img
                      src="/images/image-ViY6rawiI2uiV9tsy3QGZXdyngtXrC.png"
                      alt="Doctor veterinario"
                      className="w-32 mx-auto drop-shadow-md rounded-2xl"
                    />
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                        <MedicalKit size={26} color="oklch(0.55 0.15 165)" weight="Outline" />
                        Acerca de VetAssist
                      </h2>
                    </div>

                    <div className="text-left space-y-4 bg-card rounded-2xl p-5 sm:p-7 border border-border shadow-xs text-sm sm:text-base leading-relaxed text-muted-foreground">
                      <p>
                        VetAssist es una herramienta de apoyo diseñada para profesionales veterinarios en Costa Rica. Permite calcular con precisión las dosis de medicamentos de uso común en medicina veterinaria para perros y gatos, así como la cantidad diaria de alimento basada en requerimientos energéticos.
                      </p>
                      <p>
                        Esta herramienta está dirigida a los profesionales en medicina veterinaria, como un apoyo estratégico a sus conocimientos. Permite calcular con precisión las dosis de medicamentos de uso común en medicina veterinaria para perros y gatos, así como la cantidad diaria de alimento basada en requerimientos energéticos.
                      </p>
                    </div>

                    {/* Data Manager Open Trigger */}
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setDataManagerOpen(true)}
                        className="rounded-xl gap-2 text-xs"
                      >
                        <Database size={15} weight="Outline" />
                        Abrir Gestor de Datos Locales
                      </Button>
                    </div>

                    {/* Legal Disclaimer Box */}
                    <div className="text-left space-y-6">
                      <Alert variant="destructive" className="rounded-2xl p-5">
                        <AlertTitle className="flex items-center gap-2 text-base font-bold">
                          <ClipboardText size={18} weight="Outline" />
                          Aviso Legal Importante
                        </AlertTitle>
                        <AlertDescription className="text-xs sm:text-sm mt-2 leading-relaxed text-destructive-foreground/90">
                          Esta herramienta es solo de referencia y no sustituye el criterio clínico profesional. Las dosis mostradas se basan en formularios veterinarios estándar, pero cada paciente es único. Siempre verifique la dosificación con las guías actualizadas, considere la condición clínica individual, y siga los protocolos establecidos por el Colegio de Médicos Veterinarios de Costa Rica. El uso de esta herramienta es responsabilidad exclusiva del profesional que la consulta, es importante tener en cuenta que está herramienta está dirigida a profesionales formados en medicina veterinaria y no al público general, no automedique a su mascota.
                        </AlertDescription>
                      </Alert>

                      {/* Image below Legal Disclaimer - Centered, Reasonable Size, Non-transparent */}
                      <div className="flex justify-center pt-2">
                        <img
                          src="/images/image-sRbFNlfdBngPHNF1Qansq4jMo87xtP.png"
                          alt="Atención médica veterinaria responsable"
                          className="w-48 sm:w-60 md:w-72 h-auto drop-shadow-md rounded-2xl object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Local Data Manager Drawer (lazy render to show loading fallback inside sheet) */}
      {dataManagerOpen && (
        <DataManager open={dataManagerOpen} onOpenChange={setDataManagerOpen} />
      )}

      {/* Clinical Notes Drawer (lazy render) */}
      {clinicalNotesOpen && (
        <ClinicalNotes open={clinicalNotesOpen} onOpenChange={setClinicalNotesOpen} />
      )}

      {/* Floating Clinical Notes FAB */}
      <button
        onClick={() => setClinicalNotesOpen(true)}
        className="no-print fixed bottom-20 right-5 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        title="Notas Clínicas Rápidas"
        aria-label="Abrir notas clínicas"
      >
        <Notebook size={22} weight="Outline" />
      </button>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="no-print fixed bottom-20 left-5 z-50 w-11 h-11 rounded-full bg-card border border-border text-foreground shadow-md flex items-center justify-center hover:bg-muted transition-colors"
          title="Volver arriba"
          aria-label="Volver arriba"
        >
          <ArrowUp size={18} weight="Outline" />
        </button>
      )}

      {/* ========== FOOTER ========== */}
      <footer className="bg-[#115459] text-white pt-10 pb-8 mt-auto no-print">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Col 1: Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/10">
                  <img
                    src="/images/image-6YCD688sjOC1kmBZgegAoQNGOCBOuQ.png"
                    alt="VetAssist Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="font-bold text-base">VetAssist</span>
                  <p className="text-[10px] text-teal-300 uppercase tracking-wider">Asistente para cálculos de uso veterinario</p>
                </div>
              </div>
              <p className="text-teal-100/80 text-xs sm:text-sm leading-relaxed">
                Herramienta de apoyo para el cálculo con precisión de dosis de medicamentos y alimentación para animales menores.
              </p>
            </div>

            {/* Col 2: Recursos */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-teal-300 mb-3">
                Recursos
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <button
                    onClick={() => handleTabChange('medicamentos')}
                    className="text-teal-100/80 hover:text-white transition-colors"
                  >
                    Calculadora de Medicamentos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('protocolos')}
                    className="text-teal-100/80 hover:text-white transition-colors"
                  >
                    Protocolos de Uso Frecuente
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('alimentos')}
                    className="text-teal-100/80 hover:text-white transition-colors"
                  >
                    Calculadora de Alimentos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('fluidos')}
                    className="text-teal-100/80 hover:text-white transition-colors"
                  >
                    Fluidoterapia IV
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('modo-libre')}
                    className="text-teal-100/80 hover:text-white transition-colors"
                  >
                    Modo Libre
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Información */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-teal-300 mb-3">
                Información
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <button
                    onClick={() => handleTabChange('acerca')}
                    className="text-teal-100/80 hover:text-white transition-colors"
                  >
                    Acerca de la herramienta
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('emergencias')}
                    className="text-teal-100/80 hover:text-white transition-colors"
                  >
                    Referencia de Emergencias
                  </button>
                </li>
                <li>
                  <button
                    onClick={handlePrint}
                    className="text-teal-100/80 hover:text-white transition-colors"
                  >
                    Imprimir resultado
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Professional Credits */}
          <div className="border-t border-white/15 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-teal-200/80">
            <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
              <span>© 2026 VetAssist — Herramienta de referencia para veterinarios en Costa Rica</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-mono">
                v2.2
              </span>
            </div>
            <p className="font-medium text-teal-100">
              Elaborado por Ing. Alvaro Enrique Cascante Moraga, CPIC#12549
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
