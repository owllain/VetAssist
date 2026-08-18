'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp, ChevronDown, Calculator, Copy, Check, Eye, EyeOff,
  Droplet, Clock, AlertCircle, InfoSquare, Plus, Minus,
} from 'reicon-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import BodyConditionScore from './BodyConditionScore';
import { calculateFoodAmount, calculateFoodPortion, type PetType, type DogAge, type DogCondition, type CatAge, type CatCondition } from '@/lib/food-data';
import { FOOD_CATALOG, searchFoodProducts, getUniqueBrands, getProductsByBrand, type FoodProduct } from '@/lib/food-catalog';
import { getBCSLevel, type BCSLevel } from '@/lib/bcs-levels';
import { useVetToast } from './VetToast';
import { validateWeight, validateMealsPerDay, validateKcalPerUnit, formatValidationErrors, formatValidationWarnings } from '@/lib/form-validation';

interface StepProps {
  number: number;
  title: string;
  children: React.ReactNode;
  isComplete?: boolean;
}

function Step({ number, title, children, isComplete }: StepProps) {
  const [isOpen, setIsOpen] = useState(number <= 2);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3.5 rounded-lg border-2 transition-all ${
          isOpen
            ? 'border-primary bg-primary/5'
            : 'border-border/60 bg-muted/30 hover:border-border'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-sm transition-all ${
              isComplete
                ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                : 'bg-primary/15 text-primary'
            }`}
          >
            {isComplete ? '✓' : number}
          </div>
          <h3 className="font-semibold text-sm sm:text-base text-left">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp size={18} weight="Bold" />
        ) : (
          <ChevronDown size={18} weight="Bold" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-11 pr-3.5 pb-3 space-y-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface EnergyCalculatorResult {
  rer: number;
  mer: number;
  dailyWaterMl: number;
  condition: string;
  merMultiplier: number;
}

export default function EnergyCalculator() {
  // State - Step 1: Pet type
  const [petType, setPetType] = useState<PetType>('perro');

  // State - Step 2: Weight
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');

  // State - Step 3: BCS
  const [bcs, setBcs] = useState<number | null>(null);

  // State - Step 4: Patient criteria
  const [dogAge, setDogAge] = useState<DogAge>('adulto');
  const [dogCondition, setDogCondition] = useState<DogCondition>('castrado');
  const [catAge, setCatAge] = useState<CatAge>('adulto');
  const [catCondition, setCatCondition] = useState<CatCondition>('castrado');
  const [mealsPerDay, setMealsPerDay] = useState(2);

  // State - Step 5: Food selection
  const [foodMode, setFoodMode] = useState<'manual' | 'catalog'>('manual');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<FoodProduct | null>(null);
  const [customKcalPerUnit, setCustomKcalPerUnit] = useState('');
  const [customUnitName, setCustomUnitName] = useState('taza');

  // State - Results
  const [result, setResult] = useState<EnergyCalculatorResult | null>(null);
  const [bcsInfo, setBcsInfo] = useState<BCSLevel | null>(null);

  // State - UI
  const [copied, setCopied] = useState(false);
  const { addToast } = useVetToast();

  // Get available brands
  const brands = getUniqueBrands();
  const productsByBrand = selectedBrand ? getProductsByBrand(selectedBrand) : [];

  // Calculate RER and MER
  const handleCalculate = () => {
    // Validar peso
    const weightValidation = validateWeight(weight, petType, 'Peso');
    if (!weightValidation.isValid) {
      addToast({
        title: 'Error de Validación',
        description: formatValidationErrors(weightValidation.errors),
        variant: 'destructive',
      });
      return;
    }

    // Mostrar advertencias si existen
    if (weightValidation.warnings.length > 0) {
      addToast({
        title: 'Advertencia',
        description: formatValidationWarnings(weightValidation.warnings),
        variant: 'default',
      });
    }

    // Validar comidas por día
    const mealsValidation = validateMealsPerDay(mealsPerDay, 'Comidas por día');
    if (!mealsValidation.isValid) {
      addToast({
        title: 'Error de Validación',
        description: formatValidationErrors(mealsValidation.errors),
        variant: 'destructive',
      });
      return;
    }

    const w = parseFloat(weight);

    const calculatedResult = calculateFoodAmount(
      petType,
      w,
      weightUnit,
      mealsPerDay,
      petType === 'perro' ? dogCondition : undefined,
      petType === 'perro' ? dogAge : undefined,
      petType === 'gato' ? catCondition : undefined,
      petType === 'gato' ? catAge : undefined
    );

    setResult({
      rer: calculatedResult.rer,
      mer: calculatedResult.mer,
      dailyWaterMl: calculatedResult.dailyWaterMl,
      condition: calculatedResult.condition,
      merMultiplier: calculatedResult.merMultiplier,
    });

    if (bcs) {
      const bcsLevel = getBCSLevel(petType, bcs);
      setBcsInfo(bcsLevel || null);
    }
  };

  // Format number to locale string
  const formatNumber = (n: number) => n.toLocaleString('es-CR');

  // Generate results text for copying
  const generateResultsText = () => {
    if (!result) return '';
    const lines = [
      `CALCULADORA DE REQUERIMIENTOS ENERGÉTICOS`,
      ``,
      `Paciente: ${petType === 'perro' ? 'Perro' : 'Gato'} - ${result.condition}`,
      `Peso: ${weight} ${weightUnit.toUpperCase()}`,
      `BCS: ${bcs}/9${bcsInfo ? ` - ${bcsInfo.title}` : ''}`,
      ``,
      `RESULTADOS:`,
      `RER (Requerimiento Energético en Reposo): ${formatNumber(result.rer)} kcal/día`,
      `MER (Requerimiento Energético de Mantenimiento): ${formatNumber(result.mer)} kcal/día (${result.merMultiplier}x RER)`,
      `Agua requerida: ${formatNumber(result.dailyWaterMl)} mL/día`,
      ``,
      `Comidas por día: ${mealsPerDay}`,
    ];

    if (selectedProduct) {
      const portion = calculateFoodPortion(
        result.mer,
        selectedProduct.kcalPerCup || selectedProduct.kcalPerCan || 0,
        selectedProduct.kcalPerCup ? 'taza' : 'lata',
        mealsPerDay
      );
      lines.push(
        ``,
        `ALIMENTO SELECCIONADO:`,
        `Marca: ${selectedProduct.brand}`,
        `Producto: ${selectedProduct.name}`,
        `Tipo: ${selectedProduct.type}`,
        `Porción: ${portion.portionPerDay} ${portion.unitName}s por día`,
        `Porción por comida: ${portion.portionPerMeal} ${portion.unitName}s`
      );
    } else if (customKcalPerUnit) {
      const portion = calculateFoodPortion(
        result.mer,
        parseFloat(customKcalPerUnit),
        customUnitName,
        mealsPerDay
      );
      lines.push(
        ``,
        `ALIMENTO MANUAL:`,
        `Energía: ${customKcalPerUnit} kcal/${customUnitName}`,
        `Porción: ${portion.portionPerDay} ${customUnitName}s por día`,
        `Porción por comida: ${portion.portionPerMeal} ${customUnitName}s`
      );
    }

    lines.push(
      ``,
      `NOTA: ${result.merMultiplier < 1.5 ? 'Los resultados para el MER son ESTIMACIONES; los animales individuales pueden variar hasta en un 50% con respecto a los valores predichos. Todo cálculo es solo un punto de partida y debe modificarse según la respuesta clínica del paciente.' : 'Monitorear peso y condición corporal mensualmente.'}`
    );

    return lines.join('\n');
  };

  const handleCopyResults = () => {
    const text = generateResultsText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({
      title: 'Copiado',
      description: 'Resultados copiados al portapapeles',
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Calculator size={20} weight="Bold" className="text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">Calculadora de Requerimientos Energéticos</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Calcula RER, MER y raciones de alimento para perros y gatos
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Steps Container */}
      <div className="space-y-2.5">
        {/* Step 1: Pet Type */}
        <Step
          number={1}
          title="Tipo de Paciente"
          isComplete={Boolean(petType)}
        >
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant={petType === 'perro' ? 'default' : 'outline'}
              onClick={() => {
                setPetType('perro');
                setDogAge('adulto');
                setDogCondition('castrado');
              }}
              className="h-12 text-sm"
            >
              🐕 Perro
            </Button>
            <Button
              type="button"
              variant={petType === 'gato' ? 'default' : 'outline'}
              onClick={() => {
                setPetType('gato');
                setCatAge('adulto');
                setCatCondition('castrado');
              }}
              className="h-12 text-sm"
            >
              🐈 Gato
            </Button>
          </div>
        </Step>

        {/* Step 2: Weight */}
        <Step
          number={2}
          title="Peso del Paciente"
          isComplete={Boolean(weight)}
        >
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs font-semibold mb-1.5 block">Peso</Label>
                <Input
                  type="number"
                  placeholder="Ingrese peso"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="h-10"
                  step="0.1"
                  min="0"
                />
              </div>
              <div className="w-20">
                <Label className="text-xs font-semibold mb-1.5 block">Unidad</Label>
                <Select value={weightUnit} onValueChange={(value: any) => setWeightUnit(value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Weight converter */}
            {weight && (
              <div className="p-2.5 bg-muted/40 rounded-lg text-xs space-y-1.5">
                <p className="font-semibold text-foreground">Conversiones:</p>
                {weightUnit === 'kg' && (
                  <>
                    <p>→ {(parseFloat(weight) * 2.20462).toFixed(2)} lb</p>
                    <p>→ {(parseFloat(weight) * 35.274).toFixed(1)} oz</p>
                  </>
                )}
                {weightUnit === 'lb' && (
                  <>
                    <p>→ {(parseFloat(weight) * 0.453592).toFixed(2)} kg</p>
                    <p>→ {(parseFloat(weight) * 16).toFixed(1)} oz</p>
                  </>
                )}
              </div>
            )}
          </div>
        </Step>

        {/* Step 3: BCS */}
        <Step
          number={3}
          title="Índice de Condición Corporal (BCS)"
          isComplete={Boolean(bcs)}
        >
          <BodyConditionScore value={bcs} onChange={setBcs} />
          {bcsInfo && (
            <Alert className="bg-blue-500/5 border-blue-500/20">
              <InfoSquare size={16} className="text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-xs space-y-1.5 ml-2">
                <p className="font-semibold text-foreground">{bcsInfo.title}</p>
                <p className="text-muted-foreground">{bcsInfo.description}</p>
              </AlertDescription>
            </Alert>
          )}
        </Step>

        {/* Step 4: Patient Criteria */}
        <Step
          number={4}
          title="Criterios del Paciente"
          isComplete={Boolean(weight && (petType === 'perro' ? dogAge && dogCondition : catAge && catCondition))}
        >
          <div className="space-y-3">
            {petType === 'perro' ? (
              <>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Edad/Etapa</Label>
                  <Select value={dogAge} onValueChange={(value: any) => setDogAge(value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cachorro_menor_4m">Cachorro &lt; 4 meses (3x RER)</SelectItem>
                      <SelectItem value="cachorro_mayor_4m">Cachorro &gt; 4 meses (2x RER)</SelectItem>
                      <SelectItem value="adulto">Adulto (seleccionar estado abajo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {dogAge === 'adulto' && (
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Estado del Perro Adulto</Label>
                    <Select value={dogCondition} onValueChange={(value: any) => setDogCondition(value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entero">Entero sano (1.8x RER)</SelectItem>
                        <SelectItem value="castrado">Castrado/Esterilizado (1.6x RER)</SelectItem>
                        <SelectItem value="obeso">Propensión a la obesidad (1.4x RER)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Edad/Etapa</Label>
                  <Select value={catAge} onValueChange={(value: any) => setCatAge(value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gatito">Gatito sano (2.5x RER)</SelectItem>
                      <SelectItem value="adulto">Adulto (seleccionar estado abajo)</SelectItem>
                    </SelectContent>
                  </Select>
                  {catAge === 'gatito' && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      Los gatitos pueden alimentarse alternativamente a libre consumo.
                    </p>
                  )}
                </div>
                {catAge === 'adulto' && (
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Estado del Gato Adulto</Label>
                    <Select value={catCondition} onValueChange={(value: any) => setCatCondition(value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entero">Entero sano (1.4x RER)</SelectItem>
                        <SelectItem value="castrado">Castrado/Esterilizado (1.2x RER)</SelectItem>
                        <SelectItem value="obeso">Propensión a la obesidad (1.0x RER)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div>
              <Label className="text-xs font-semibold mb-1.5 block flex items-center gap-2">
                <Clock size={14} />
                Comidas por día
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMealsPerDay(Math.max(1, mealsPerDay - 1))}
                >
                  <Minus size={16} />
                </Button>
                <Input
                  type="number"
                  value={mealsPerDay}
                  onChange={(e) => setMealsPerDay(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-10 text-center flex-1"
                  min="1"
                  max="6"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMealsPerDay(mealsPerDay + 1)}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full h-10" size="sm">
              <Calculator size={16} className="mr-2" />
              Calcular RER y MER
            </Button>
          </div>
        </Step>

        {/* Step 5: Results */}
        {result && (
          <Step
            number={5}
            title="Resultados de Energía"
            isComplete={true}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* RER Card */}
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-3.5">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    RER (Energía en Reposo)
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {formatNumber(result.rer)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    kcal/día
                  </p>
                </CardContent>
              </Card>

              {/* MER Card */}
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardContent className="p-3.5">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    MER (Energía de Mantenimiento)
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {formatNumber(result.mer)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    kcal/día ({result.merMultiplier}x RER)
                  </p>
                </CardContent>
              </Card>

              {/* Water Card */}
              <Card className="bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800">
                <CardContent className="p-3.5">
                  <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Droplet size={14} />
                    Agua Requerida
                  </p>
                  <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                    {formatNumber(result.dailyWaterMl)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    mL/día
                  </p>
                </CardContent>
              </Card>

              {/* Meals Suggestion Card */}
              <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-3.5">
                  <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Clock size={14} />
                    Distribución
                  </p>
                  <p className="text-sm font-bold text-purple-700 dark:text-purple-400 leading-tight">
                    {mealsPerDay} comida{mealsPerDay > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Dividido según patrón
                  </p>
                </CardContent>
              </Card>
            </div>

            <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <AlertCircle size={16} className="text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-xs text-amber-900 dark:text-amber-200 ml-2">
                Los resultados para el MER son ESTIMACIONES; los animales individuales pueden variar hasta en un 50% con respecto a los valores predichos. Todo cálculo es solo un punto de partida y debe modificarse según la respuesta clínica del paciente.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleCopyResults}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {copied ? (
                <>
                  <Check size={16} className="mr-2 text-green-600" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  Copiar resultados
                </>
              )}
            </Button>
          </Step>
        )}

        {/* Step 6: Food Selection */}
        {result && (
          <Step
            number={6}
            title="Seleccionar Alimento"
            isComplete={Boolean(selectedProduct || customKcalPerUnit)}
          >
            <Tabs value={foodMode} onValueChange={(value: any) => setFoodMode(value)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual</TabsTrigger>
                <TabsTrigger value="catalog">Catálogo</TabsTrigger>
              </TabsList>

              {/* Manual Mode */}
              <TabsContent value="manual" className="space-y-3 mt-3">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Tipo de Medida</Label>
                  <Select value={customUnitName} onValueChange={setCustomUnitName}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="taza">Taza</SelectItem>
                      <SelectItem value="lata">Lata</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="gramo">Gramo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Energía (kcal por {customUnitName})
                  </Label>
                  <Input
                    type="number"
                    placeholder="Ej: 380"
                    value={customKcalPerUnit}
                    onChange={(e) => setCustomKcalPerUnit(e.target.value)}
                    className="h-10"
                    step="1"
                    min="0"
                  />
                </div>
                {customKcalPerUnit && (
                  <FoodPortionDisplay
                    mer={result.mer}
                    kcalPerUnit={parseFloat(customKcalPerUnit)}
                    unitName={customUnitName}
                    mealsPerDay={mealsPerDay}
                  />
                )}
              </TabsContent>

              {/* Catalog Mode */}
              <TabsContent value="catalog" className="space-y-3 mt-3">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Marca</Label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Seleccione una marca..." />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBrand && (
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Producto</Label>
                    <Select
                      value={selectedProduct?.id || ''}
                      onValueChange={(productId) => {
                        const product = productsByBrand.find((p) => p.id === productId);
                        setSelectedProduct(product || null);
                      }}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Seleccione un producto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {productsByBrand.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedProduct && (
                  <>
                    <div className="p-2.5 bg-muted/40 rounded-lg text-xs space-y-1.5">
                      <p className="font-semibold text-foreground">{selectedProduct.name}</p>
                      <p>
                        Tipo: <Badge variant="outline" className="text-xs">{selectedProduct.type}</Badge>
                      </p>
                      {selectedProduct.kcalPerCup && (
                        <p>Energía: {selectedProduct.kcalPerCup} kcal/taza</p>
                      )}
                      {selectedProduct.kcalPerCan && (
                        <p>Energía: {selectedProduct.kcalPerCan} kcal/lata</p>
                      )}
                      {selectedProduct.specialFeatures && (
                        <p>Características: {selectedProduct.specialFeatures.join(', ')}</p>
                      )}
                    </div>

                    <FoodPortionDisplay
                      mer={result.mer}
                      kcalPerUnit={selectedProduct.kcalPerCup || selectedProduct.kcalPerCan || 0}
                      unitName={selectedProduct.kcalPerCup ? 'taza' : 'lata'}
                      mealsPerDay={mealsPerDay}
                    />
                  </>
                )}
              </TabsContent>
            </Tabs>
          </Step>
        )}
      </div>
    </div>
  );
}

interface FoodPortionDisplayProps {
  mer: number;
  kcalPerUnit: number;
  unitName: string;
  mealsPerDay: number;
}

function FoodPortionDisplay({
  mer,
  kcalPerUnit,
  unitName,
  mealsPerDay,
}: FoodPortionDisplayProps) {
  const portion = calculateFoodPortion(mer, kcalPerUnit, unitName, mealsPerDay);

  return (
    <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
      <CardContent className="p-3.5 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-0.5">Ración diaria</p>
            <p className="text-lg font-bold text-green-700 dark:text-green-400">
              {portion.portionPerDay}
            </p>
            <p className="text-xs text-muted-foreground">{unitName}s/día</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-0.5">Por comida</p>
            <p className="text-lg font-bold text-green-700 dark:text-green-400">
              {portion.portionPerMeal}
            </p>
            <p className="text-xs text-muted-foreground">{unitName}s ({mealsPerDay} tomas)</p>
          </div>
        </div>
        <div className="pt-2 border-t border-green-200 dark:border-green-800">
          <p className="text-xs text-muted-foreground">
            Total: {portion.kcalPerDay} kcal/día
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
