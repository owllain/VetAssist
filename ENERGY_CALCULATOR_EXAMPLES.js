// Example Usage and Test Cases for Energy Calculator
// Casos de uso típicos veterinarios con resultados esperados

/**
 * CASO 1: Perro adulto castrado - Peso ideal
 * 
 * INPUT:
 * - Tipo: Perro
 * - Peso: 25 kg
 * - BCS: 5/9 (Ideal)
 * - Estado: Adulto castrado
 * - Comidas: 2 por día
 * - Alimento: Purina Pro Plan Chicken & Rice (384 kcal/taza)
 * 
 * CÁLCULOS:
 * RER = 70 × (25)^0.75 = 70 × 8.55 ≈ 598 kcal/día
 * MER = 598 × 1.6 (castrado) = 957 kcal/día
 * Agua = 957 mL/día
 * Ración = 957 ÷ 384 ≈ 2.5 tazas/día
 * Por comida = 2.5 ÷ 2 ≈ 1.25 tazas por comida
 * 
 * RECOMENDACIÓN:
 * "Dividido en 2 tomas (mañana y noche): 1.25 tazas cada una"
 * "Proporcionar 957 mL de agua al día"
 */

/**
 * CASO 2: Cachorro pequeño - En crecimiento
 * 
 * INPUT:
 * - Tipo: Perro
 * - Peso: 8 kg (cachorro en crecimiento)
 * - BCS: 4/9 (Ligeramente bajo peso - normal en cachorros)
 * - Estado: Cachorro > 4 meses
 * - Comidas: 3 por día
 * - Alimento: Pedigree Cachorro Pollo (360 kcal/taza)
 * 
 * CÁLCULOS:
 * RER = 70 × (8)^0.75 = 70 × 4.28 ≈ 299 kcal/día
 * MER = 299 × 2.0 (cachorro >4m) = 598 kcal/día
 * Agua = 598 mL/día
 * Ración = 598 ÷ 360 ≈ 1.66 tazas/día
 * Por comida = 1.66 ÷ 3 ≈ 0.55 tazas
 * 
 * RECOMENDACIÓN:
 * "Dividido en 3 tomas: 0.55 tazas cada una"
 * "Asegurar crecimiento controlado, no acelerar"
 */

/**
 * CASO 3: Gato adulto entero - Peso ideal
 * 
 * INPUT:
 * - Tipo: Gato
 * - Peso: 4.5 kg
 * - BCS: 5/9 (Ideal)
 * - Estado: Adulto entero
 * - Comidas: 2 por día
 * - Alimento Manual: 160 kcal/lata (Hill's c/d)
 * 
 * CÁLCULOS:
 * RER = 70 × (4.5)^0.75 = 70 × 2.57 ≈ 180 kcal/día
 * MER = 180 × 1.4 (entero) = 252 kcal/día
 * Agua = 252 mL/día
 * Ración = 252 ÷ 160 ≈ 1.58 latas/día
 * Por comida = 1.58 ÷ 2 ≈ 0.79 latas
 * 
 * RECOMENDACIÓN:
 * "Dividido en 2 tomas: 0.79 latas cada una (aproximadamente 1 lata alternando días)"
 * "Fomentar consumo de agua, mantener varios puntos de acceso"
 */

/**
 * CASO 4: Perro con sobrepeso - Control de peso
 * 
 * INPUT:
 * - Tipo: Perro
 * - Peso: 35 kg (sobrepesado, debería ser 28-30)
 * - BCS: 7/9 (Sobrepeso)
 * - Estado: Propensión a la obesidad (1.4x RER)
 * - Comidas: 2 por día
 * - Alimento: Hill's w/d (Control de peso - 270 kcal/taza)
 * 
 * CÁLCULOS:
 * RER = 70 × (35)^0.75 = 70 × 11.15 ≈ 780 kcal/día
 * MER = 780 × 1.4 (obesidad) = 1092 kcal/día
 * Agua = 1092 mL/día
 * Ración = 1092 ÷ 270 ≈ 4.04 tazas/día
 * Por comida = 4.04 ÷ 2 ≈ 2.02 tazas
 * 
 * RECOMENDACIÓN:
 * "Dieta de control de peso (w/d). Monitor mensual de peso"
 * "Meta: perder 0.5-1 kg/mes"
 * "Incrementar actividad física gradualmente"
 * "Usar alimento terapéutico formulado para saciedad"
 */

/**
 * CASO 5: Gatito en crecimiento
 * 
 * INPUT:
 * - Tipo: Gato
 * - Peso: 0.8 kg (gatito de 6-8 semanas)
 * - BCS: 5/9 (Ideal para edad)
 * - Estado: Gatito
 * - Comidas: LIBRE CONSUMO (aviso del sistema)
 * - Alimento: Purina Pro Plan Kitten (175 kcal/lata)
 * 
 * CÁLCULOS:
 * RER = 70 × (0.8)^0.75 = 70 × 0.59 ≈ 41 kcal/día
 * MER = 41 × 2.5 (gatito) = 102 kcal/día
 * Agua = 102 mL/día
 * Ración = 102 ÷ 175 ≈ 0.58 latas/día
 * 
 * RECOMENDACIÓN:
 * "⚠️ Los gatitos pueden alimentarse alternativamente a libre consumo"
 * "Si dosificación: 0.58 latas/día en múltiples pequeñas porciones"
 * "Transición gradual a alimento adulto a los 12 meses"
 */

/**
 * CASO 6: Perro pequeño castrado - Sedentario
 * 
 * INPUT:
 * - Tipo: Perro
 * - Peso: 5 kg (Toy/Pequeño)
 * - BCS: 6/9 (Ligeramente sobrepeso)
 * - Estado: Adulto castrado
 * - Comidas: 1 por día
 * - Alimento: Diamond Naturals Chicken & Rice (370 kcal/taza)
 * 
 * CÁLCULOS:
 * RER = 70 × (5)^0.75 = 70 × 2.42 ≈ 169 kcal/día
 * MER = 169 × 1.6 (castrado) = 270 kcal/día
 * Agua = 270 mL/día
 * Ración = 270 ÷ 370 ≈ 0.73 tazas/día
 * Por comida = 0.73 ÷ 1 = 0.73 tazas
 * 
 * RECOMENDACIÓN:
 * "Una sola toma al día: 0.73 tazas"
 * "Perro pequeño. Vigilar ganancia/pérdida de peso"
 * "Considerar actividad moderada diaria"
 */

/**
 * VARIACIONES Y CONSIDERACIONES
 */

// 1. PERRO EN RECUPERACIÓN POR ENFERMEDAD
// Multiplicar MER × 1.1 a 1.2 para cubrir incremento metabólico
// Usar dietas terapéuticas según condición

// 2. GATO CON DIABETES
// Usar Hill's j/d o Royal Canin Diabetic
// Energía más controlada, proteína alta
// Frecuencia: según régimen de insulina (típicamente 2x día)

// 3. PERRO CON ENFERMEDAD RENAL
// Usar Hill's k/d o Royal Canin Renal
// Proteína reducida, minerales controlados
// No agregar suplementos sin supervisión

// 4. LACTANCIA EN PERRAS
// Multiplicar RER × 2.0-4.0 según número de cachorros
// Alimento de alta densidad energética
// Acceso constante a agua

// 5. ANIMAL GERIÁTRICO
// RER puede disminuir 10-15%
// Considerar problemas digestivos
// Menos calorías pero misma calidad nutricional

/**
 * VALIDACIONES IMPORTANTES EN LA INTERFAZ
 */

// ✓ Peso debe ser > 0
// ✓ Peso máximo razonable: 100 kg (perros) / 15 kg (gatos)
// ✓ BCS debe estar entre 1-9
// ✓ Comidas por día: 1-6 (mínimo 1, máximo 6)
// ✓ Densidad energética de alimento > 0
// ✓ Avisos para gatitos en libre consumo
// ✓ Avisos para condiciones de sobrepeso/obesidad

/**
 * FÓRMULAS DE CONVERSIÓN ÚTILES
 */

// 1 taza aprox = 105g (kibble seco típico)
// 1 lata estándar = 369-425g (húmedo)
// 1 kg = 2.20462 lb
// 1 oz = 28.35g
// 1 mL agua ≈ 1g

/**
 * RECOMENDACIONES FINALES DE LA HERRAMIENTA
 */

// "Los resultados para el MER son ESTIMACIONES; los animales individuales 
// pueden variar hasta en un 50% con respecto a los valores predichos. 
// Todo cálculo es solo un punto de partida y debe modificarse según 
// la respuesta clínica del paciente."
