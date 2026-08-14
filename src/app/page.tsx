'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'medicamentos',
    label: 'Medicamentos',
    icon: <Pill size={16} weight="outline" />,
  },
  {
    id: 'modo-libre',
    label: 'Modo Libre',
    icon: <Calculator size={16} weight="outline" />,
  },
  {
    id: 'alimentos',
    label: 'Alimentos',
    icon: <Scale size={16} weight="outline" />,
  },
  {
    id: 'acerca',
    label: 'Acerca de',
    icon: <CircleInfo size={16} weight="outline" />,
  },
];

const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('medicamentos');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTabChange = useCallback(
    (tab: TabId) => {
      setActiveTab(tab);
      setMobileOpen(false);
    },
    []
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-border">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse size={28} color="oklch(0.55 0.15 165)" weight="outline" />
            <span className="text-xl font-bold text-teal-700">
              VetCalc CR
            </span>
          </div>

          {/* Desktop nav tabs */}
          <div className="hidden md:flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </header>

      <main className="flex-1">
        {/* ========== HERO SECTION ========== */}
        <section className="vet-gradient relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 hospital-stripe" />
          <div className="container relative mx-auto px-4 py-12 md:py-20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-teal-800 leading-tight">
                  <SlotText
                    text="Calculadora Veterinaria"
                    options={{ rollBy: 'word', stagger: 60, duration: 350 }}
                  />
                </h1>
                <p className="mt-4 text-lg text-teal-600 max-w-lg">
                  Herramienta profesional para cálculo de dosis de medicamentos y
                  alimentación para perros y gatos en Costa Rica
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    onClick={() => handleTabChange('medicamentos')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground vet-pulse rounded-xl"
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
                    className="rounded-xl"
                  >
                    Más información
                  </Button>
                </div>
                {/* Trust badges */}
                <div className="mt-6 flex gap-4 flex-wrap">
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                    <Shield size={14} weight="outline" color="oklch(0.55 0.15 165)" />
                    27 Medicamentos
                  </Badge>
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                    <Syringe size={14} weight="outline" color="oklch(0.55 0.15 165)" />
                    8 Categorías
                  </Badge>
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                    <Paw size={14} weight="outline" color="oklch(0.55 0.15 165)" />
                    Perros y Gatos
                  </Badge>
                </div>
              </div>

              {/* Hero images */}
              <div className="relative flex justify-center items-end min-h-[280px] md:min-h-[360px]">
                <img
                  src="/images/image-DAl3X5KYHo7tfhJ37GYdi3IFMbtgDy.png"
                  alt="Gatito lindo"
                  className="w-48 md:w-64 vet-float relative z-10"
                />
                <img
                  src="/images/image-mq50sdliTKLbR8pLTjQHnMsozKTjol.png"
                  alt="Pastor Alemán"
                  className="w-48 md:w-64 vet-float absolute right-0 bottom-0"
                  style={{ animationDelay: '1s' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========== MAIN CONTENT TABS ========== */}
        <AnimatePresence mode="wait">
          {activeTab === 'medicamentos' && (
            <motion.section
              key="medicamentos"
              id="medicamentos"
              className="py-12 relative"
              {...sectionVariants}
            >
              <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                    <Pill size={28} color="oklch(0.55 0.15 165)" weight="outline" />
                    <SlotText
                      text="Calculadora de Medicamentos"
                      options={{ rollBy: 'word', stagger: 50, duration: 300 }}
                    />
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Seleccione un medicamento y calcule la dosis exacta para su paciente
                  </p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <MedicationCalculator />
                </div>
              </div>
              {/* Decoration: Maine Coon */}
              <img
                src="/images/image-SNWiaDnaZNy4wyUYuQkRujeWhGg8dB.png"
                alt=""
                className="absolute top-12 right-4 w-24 opacity-20 vet-float hidden lg:block"
                aria-hidden="true"
              />
            </motion.section>
          )}

          {activeTab === 'modo-libre' && (
            <motion.section
              key="modo-libre"
              id="modo-libre"
              className="py-12 bg-gradient-to-b from-teal-50 to-transparent relative"
              {...sectionVariants}
            >
              <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                    <Calculator size={28} color="oklch(0.55 0.15 165)" weight="outline" />
                    <SlotText
                      text="Modo Libre"
                      options={{ rollBy: 'word', stagger: 50, duration: 300 }}
                    />
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Ingrese cualquier dosis personalizada por kilogramo de peso
                  </p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <FreeModeCalculator />
                </div>
              </div>
              {/* Decoration: Pomeranian */}
              <img
                src="/images/image-ly2ke4dipmCnYtX9BC9iqRGJSIcsV8.png"
                alt=""
                className="absolute bottom-12 left-4 w-20 opacity-20 vet-float hidden lg:block"
                style={{ animationDelay: '2s' }}
                aria-hidden="true"
              />
            </motion.section>
          )}

          {activeTab === 'alimentos' && (
            <motion.section
              key="alimentos"
              id="alimentos"
              className="py-12 relative"
              {...sectionVariants}
            >
              <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                    <Scale size={28} color="oklch(0.55 0.15 165)" weight="outline" />
                    <SlotText
                      text="Calculadora de Alimentos"
                      options={{ rollBy: 'word', stagger: 50, duration: 300 }}
                    />
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Calcule la cantidad diaria de alimento según peso, actividad y número de comidas
                  </p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <FoodCalculator />
                </div>
              </div>
              {/* Decoration: Dachshund */}
              <img
                src="/images/image-m4itMs7R4FPhQzkRJCPAY1oHA04XQw.png"
                alt=""
                className="absolute top-16 right-8 w-24 opacity-20 vet-float hidden lg:block"
                style={{ animationDelay: '1.5s' }}
                aria-hidden="true"
              />
            </motion.section>
          )}

          {activeTab === 'acerca' && (
            <motion.section
              key="acerca"
              id="acerca"
              className="py-12 bg-gradient-to-b from-teal-50 to-transparent"
              {...sectionVariants}
            >
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <img
                    src="/images/image-ViY6rawiI2uiV9tsy3QGZXdyngtXrC.png"
                    alt="Doctor veterinario"
                    className="w-32 mx-auto mb-6"
                  />
                  <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
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
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    <Card className="vet-card-hover">
                      <CardContent className="p-4 text-center">
                        <Pill size={28} color="oklch(0.55 0.15 165)" weight="outline" className="mx-auto" />
                        <h3 className="font-semibold mt-2">27 Medicamentos</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Base de datos con dosificaciones verificadas
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="vet-card-hover">
                      <CardContent className="p-4 text-center">
                        <Shield size={28} color="oklch(0.55 0.15 165)" weight="outline" className="mx-auto" />
                        <h3 className="font-semibold mt-2">8 Categorías</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Desde anestésicos hasta analgésicos
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="vet-card-hover">
                      <CardContent className="p-4 text-center">
                        <Scale size={28} color="oklch(0.55 0.15 165)" weight="outline" className="mx-auto" />
                        <h3 className="font-semibold mt-2">Alimentación RER/DER</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Cálculo basado en estándares veterinarios
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Legal Disclaimer */}
                  <div className="mt-8">
                    <Alert variant="destructive">
                      <Syringe size={18} weight="outline" />
                      <AlertTitle>Aviso Legal Importante</AlertTitle>
                      <AlertDescription className="text-sm mt-2">
                        Esta herramienta es <strong>solo de referencia</strong> y no sustituye el criterio
                        clínico profesional. Las dosis mostradas se basan en formularios veterinarios estándar,
                        pero cada paciente es único. Siempre verifique la dosificación con las guías
                        actualizadas, considere la condición clínica individual, y siga los protocolos
                        establecidos por el COLEGIO DE MÉDICOS VETERINARIOS DE COSTA RICA. El uso de esta
                        herramienta es responsabilidad exclusiva del profesional que la consulta.
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
      <footer className="bg-teal-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <HeartPulse size={20} weight="outline" color="white" />
                VetCalc CR
              </h3>
              <p className="mt-2 text-teal-200 text-sm">
                Herramienta profesional veterinaria para cálculo de dosis y alimentación
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold">Recursos</h3>
              <ul className="mt-2 space-y-2 text-sm text-teal-200">
                <li>
                  <button
                    onClick={() => handleTabChange('medicamentos')}
                    className="hover:text-white transition-colors"
                  >
                    Medicamentos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('alimentos')}
                    className="hover:text-white transition-colors"
                  >
                    Calculadora de Alimentos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('modo-libre')}
                    className="hover:text-white transition-colors"
                  >
                    Modo Libre
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold">Aviso</h3>
              <p className="mt-2 text-teal-200 text-sm">
                Solo para uso profesional veterinario. Herramienta de referencia que no
                sustituye el criterio clínico.
              </p>
            </div>
          </div>
          <div className="border-t border-teal-700 mt-6 pt-4 text-center text-sm text-teal-300">
            © 2025 VetCalc CR — Herramienta de referencia para veterinarios en Costa Rica
          </div>
        </div>
      </footer>
    </div>
  );
}
