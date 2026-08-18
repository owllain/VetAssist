# Calculadora de Requerimientos Energéticos Veterinarios

## 📋 Descripción General

Esta es una herramienta completa para calcular los requerimientos energéticos de perros y gatos, basada en:
- **RER (Requerimiento Energético en Reposo):** Fórmula exponencial estándar
- **MER (Requerimiento Energético de Mantenimiento):** Multiplicadores según estado fisiológico
- **Índice de Condición Corporal (BCS):** Escala de 1-9 puntos con descripción detallada
- **Catálogo de Alimentos:** Base de datos con marcas y productos disponibles en Costa Rica
- **Cálculo de Agua:** Requerimiento diario basado en MER

---

## 🏗️ Estructura de Archivos

```
src/
├── components/vet/
│   ├── EnergyCalculator.tsx          # ✨ NUEVO: Componente principal de la calculadora
│   ├── BodyConditionScore.tsx        # Selector visual de BCS mejorado
│   └── [otros componentes...]
├── lib/
│   ├── food-data.ts                  # ✨ ACTUALIZADO: Funciones de cálculo ampliadas
│   ├── food-catalog.ts               # ✨ NUEVO: Catálogo de 70+ alimentos
│   ├── bcs-levels.ts                 # ✨ NUEVO: Niveles de BCS con recomendaciones
│   └── [otros archivos...]
└── app/
    └── page.tsx                       # ✨ ACTUALIZADO: Integración en página principal
```

---

## 🎯 Flujo de la Calculadora

### **Paso 1: Seleccionar Tipo de Paciente**
- 🐕 Perro o 🐈 Gato
- Define opciones disponibles en pasos posteriores

### **Paso 2: Ingresar Peso**
- Input numérico con unidad (kg o lb)
- Conversión automática a 3 unidades (kg, lb, oz)
- Validación de peso mayor a 0

### **Paso 3: Índice de Condición Corporal (BCS)**
- Selector visual interactivo 1-9
- Descripciones detalladas y recomendaciones
- Información sobre cada nivel

### **Paso 4: Criterios del Paciente**
- **Para Perros:**
  - Cachorro < 4 meses (3x RER)
  - Cachorro > 4 meses (2x RER)
  - Adulto entero (1.8x RER)
  - Adulto castrado (1.6x RER)
  - Propensión a la obesidad (1.4x RER)

- **Para Gatos:**
  - Gatito (2.5x RER) - con aviso de libre consumo
  - Adulto entero (1.4x RER)
  - Adulto castrado (1.2x RER)
  - Propensión a la obesidad (1.0x RER)

- Selector de comidas por día (1-6)

### **Paso 5: Ver Resultados de Energía**
Muestra en tarjetas:
- **RER:** Energía en reposo (kcal/día)
- **MER:** Energía de mantenimiento (kcal/día)
- **Agua:** Requerimiento diario en mL
- **Distribución:** Número de comidas sugerido

### **Paso 6: Seleccionar Alimento**
Dos modos:

**Modo Manual:**
- Ingresa densidad energética (kcal por taza/lata/kg)
- Obtiene ración automática

**Modo Catálogo:**
- Selecciona marca de lista completa
- Elige producto específico
- Sistema obtiene valores energéticos guardados

---

## 🔬 Fórmulas Utilizadas

### RER (Requerimiento Energético en Reposo)
```
RER = 70 × (peso_kg)^0.75
```

### MER (Requerimiento Energético de Mantenimiento)
```
MER = RER × multiplicador

Multiplicador según:
- Especie (perro/gato)
- Edad (cachorro/adulto/gatito)
- Estado fisiológico (entero/castrado/obeso)
```

### Agua Diaria
```
Agua (mL) = 1 mL por 1 kcal de MER
Ejemplo: MER = 450 kcal → 450 mL agua/día
```

### Ración de Alimento
```
Ración (tazas) = MER ÷ kcal_por_taza
Porción por comida = Ración ÷ comidas_por_día
```

---

## 📦 Base de Datos de Alimentos

### Marcas Incluidas (70+ productos)

**Premium/Veterinaria:**
- Purina Pro Plan / Veterinary Diets
- Hill's Science Diet / Prescription Diet
- Royal Canin / Royal Canin Veterinary
- Eukanuba
- Diamond / Diamond Naturals
- Kirkland Signature
- Taste of the Wild

**Comercial:**
- Pedigree / Whiskas
- Dog Chow / Cat Chow / Friskies / Fancy Feast

### Estructura de Producto
```javascript
{
  id: string;                    // Identificador único
  brand: string;                 // Nombre de marca
  name: string;                  // Nombre del producto
  type: 'seco' | 'húmedo' | 'semihúmedo';
  petType: 'perro' | 'gato' | 'ambos';
  ageGroup: string;              // Edad/etapa recomendada
  specialFeatures?: string[];    // Características especiales
  kcalPerCup?: number;           // Energía por taza
  kcalPerCan?: number;           // Energía por lata (369-425g)
  kcalPerKg?: number;            // Energía por kg
  measurementInfo?: string;      // Info adicional de medida
}
```

---

## 🎨 Componentes Principales

### `EnergyCalculator.tsx`
Componente principal que integra todo el flujo. Características:
- Sistema de pasos expandible/colapsable
- Validación en tiempo real
- Resultados en tarjetas visuales
- Exportación de resultados al portapapeles
- Interfaz responsive

### `BodyConditionScore.tsx`
Selector visual mejorado:
- 9 siluetas personalizadas (perro/gato diferenciadas)
- Escala cromática de 1-9
- Descripciones y recomendaciones
- Información contextual del nivel seleccionado

### `food-catalog.ts`
Base de datos exportable:
- Array `FOOD_CATALOG` con todos los productos
- Funciones de búsqueda por marca/nombre
- Filtros por tipo de mascota
- Obtención de marcas únicas

### `bcs-levels.ts`
Información detallada de BCS:
- Descripción clínica de cada nivel
- Recomendaciones específicas por nivel
- Datos para perros y gatos
- Interfaz `BCSLevel` estructura datos

### `food-data.ts` (Actualizado)
Funciones de cálculo:
- `calculateRER()` - Energía en reposo
- `calculateFoodAmount()` - Cálculo completo RER/MER
- `calculateFoodPortion()` - Ración según alimento específico
- `calculateDailyWater()` - Agua requerida

---

## 💡 Características Destacadas

### ✅ Validaciones
- Peso > 0
- Selección obligatoria de criterios
- Avisos para gatitos y dietas restringidas

### 🎯 UX/UI
- Interfaz paso a paso clara
- Tarjetas de resultados con colores identificables
- Botón copiar resultados
- Responsive diseño
- Modo claro/oscuro compatible

### 📊 Precisión
- Fórmulas basadas en literatura veterinaria
- Avisos sobre variabilidad individual (±50%)
- Nota sobre supervisión clínica obligatoria

### 🌐 Multiidioma (Base)
- Interfaz en español (Costa Rica)
- Terminología veterinaria completa
- Unidades locales (tazas, latas)

---

## 🚀 Uso en la Aplicación

La calculadora se integra en la pestaña **"Energía"** de VetAssist:

```
1. Navegar a pestña "Energía" (Scale icon)
2. Seguir los 6 pasos progresivos
3. Copiar/imprimir resultados
4. Usar en consulta veterinaria
```

---

## 🔧 Personalización

### Agregar Nuevos Alimentos
```typescript
// En food-catalog.ts
FOOD_CATALOG.push({
  id: 'mi-producto-id',
  brand: 'Mi Marca',
  name: 'Mi Producto',
  type: 'seco',
  petType: 'perro',
  ageGroup: 'Adulto',
  kcalPerCup: 380,
  kcalPerKg: 3800,
});
```

### Modificar Multiplicadores RER
```typescript
// En food-data.ts -> getMERMultiplier()
// Actualizar valores según directrices veterinarias
```

### Agregar Nuevos Niveles BCS
```typescript
// En bcs-levels.ts
// Extender DOG_BCS_LEVELS o CAT_BCS_LEVELS
```

---

## 📚 Referencias Veterinarias

Basado en:
- **AAFCO** (Association of American Feed Control Officials) - Perfiles de nutrientes
- **NRC** (National Research Council) - Guías nutricionales
- **Purina Body Condition System** - Escala BCS 9 puntos
- **MSD Manual de Veterinaria** - Requerimientos energéticos

---

## ⚠️ Avisos Legales

> Los resultados son ESTIMACIONES. Los animales individuales pueden variar hasta en un 50% con respecto a los valores predichos.
>
> Todo cálculo es solo un punto de partida y debe modificarse según:
> - Respuesta clínica del paciente
> - Cambios de peso mensual
> - Estado de salud
> - Supervisión veterinaria directa

**Uso exclusivo profesional veterinario** 🏥

---

## 📞 Soporte

Para reportar errores, sugerir mejoras o agregar nuevos alimentos:
- Revisar base de datos existente en `food-catalog.ts`
- Validar fórmulas en `food-data.ts`
- Contactar equipo de desarrollo

---

**Última actualización:** Agosto 2026  
**Versión:** 2.0 (Con EnergyCalculator integrado)
