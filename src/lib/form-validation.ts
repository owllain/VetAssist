/**
 * Utilidades de validación mejorada para formularios veterinarios
 * Valida: pesos, decimales, ranges, valores vacíos, etc.
 */

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Valida peso (número positivo, dentro de rangos razonables)
 */
export function validateWeight(
  weight: string | number,
  animalType: 'perro' | 'gato',
  fieldName: string = 'Peso'
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Chequeo de vacío
  if (!weight || weight === '') {
    errors.push({
      field: fieldName,
      message: `${fieldName} es requerido`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  const w = typeof weight === 'string' ? parseFloat(weight) : weight;

  // Chequeo de valor válido
  if (isNaN(w) || !isFinite(w)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} debe ser un número válido`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  // Chequeo de valor positivo
  if (w <= 0) {
    errors.push({
      field: fieldName,
      message: `${fieldName} debe ser mayor a 0`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  // Chequeo de rango según especie
  if (animalType === 'perro') {
    if (w < 0.5) {
      warnings.push({
        field: fieldName,
        message: `Peso muy bajo para un perro (${w} kg). Verifique que sea un neonato.`,
        severity: 'warning',
      });
    }
    if (w > 150) {
      errors.push({
        field: fieldName,
        message: `Peso inusualmente alto para un perro (${w} kg). Verifique el valor ingresado.`,
        severity: 'error',
      });
      return { isValid: false, errors, warnings };
    }
  } else if (animalType === 'gato') {
    if (w < 1) {
      warnings.push({
        field: fieldName,
        message: `Peso muy bajo para un gato (${w} kg). Verifique que sea un gatito.`,
        severity: 'warning',
      });
    }
    if (w > 15) {
      warnings.push({
        field: fieldName,
        message: `Peso inusualmente alto para un gato (${w} kg). Puede indicar sobrepeso.`,
        severity: 'warning',
      });
    }
  }

  // Chequeo de decimales (máximo 2 decimales)
  if (!/^\d+(\.\d{1,2})?$/.test(weight.toString())) {
    warnings.push({
      field: fieldName,
      message: `${fieldName} tiene más de 2 decimales. Se redondeará a 2 decimales.`,
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valida dosis (número positivo, sin valores extremos)
 */
export function validateDose(
  dose: string | number,
  fieldName: string = 'Dosis'
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Chequeo de vacío
  if (!dose || dose === '') {
    errors.push({
      field: fieldName,
      message: `${fieldName} es requerida`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  const d = typeof dose === 'string' ? parseFloat(dose) : dose;

  // Chequeo de valor válido
  if (isNaN(d) || !isFinite(d)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} debe ser un número válido`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  // Chequeo de valor positivo
  if (d <= 0) {
    errors.push({
      field: fieldName,
      message: `${fieldName} debe ser mayor a 0`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  // Chequeo de valor muy alto
  if (d > 10000) {
    warnings.push({
      field: fieldName,
      message: `${fieldName} es inusualmente alta (${d}). Verifique la unidad.`,
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valida concentración (número positivo)
 */
export function validateConcentration(
  concentration: string | number,
  fieldName: string = 'Concentración'
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Chequeo de vacío
  if (!concentration || concentration === '') {
    errors.push({
      field: fieldName,
      message: `${fieldName} es requerida`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  const c = typeof concentration === 'string' ? parseFloat(concentration) : concentration;

  // Chequeo de valor válido
  if (isNaN(c) || !isFinite(c)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} debe ser un número válido`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  // Chequeo de valor positivo
  if (c <= 0) {
    errors.push({
      field: fieldName,
      message: `${fieldName} debe ser mayor a 0`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valida volumen (número positivo)
 */
export function validateVolume(
  volume: string | number,
  fieldName: string = 'Volumen'
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Chequeo de vacío
  if (!volume || volume === '') {
    errors.push({
      field: fieldName,
      message: `${fieldName} es requerido`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  const v = typeof volume === 'string' ? parseFloat(volume) : volume;

  // Chequeo de valor válido
  if (isNaN(v) || !isFinite(v)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} debe ser un número válido`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  // Chequeo de valor positivo
  if (v <= 0) {
    errors.push({
      field: fieldName,
      message: `${fieldName} debe ser mayor a 0`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  // Chequeo de valor muy alto
  if (v > 10000) {
    warnings.push({
      field: fieldName,
      message: `${fieldName} es inusualmente alto (${v} mL). Verifique.`,
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valida BCS (número entre 1-9)
 */
export function validateBCS(bcs: number | null, fieldName: string = 'BCS'): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (bcs === null || bcs === undefined) {
    warnings.push({
      field: fieldName,
      message: `${fieldName} no seleccionado. Se usa valor por defecto.`,
      severity: 'warning',
    });
    return { isValid: true, errors, warnings };
  }

  if (!Number.isInteger(bcs) || bcs < 1 || bcs > 9) {
    errors.push({
      field: fieldName,
      message: `${fieldName} debe ser un número entero entre 1 y 9`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  return {
    isValid: true,
    errors,
    warnings,
  };
}

/**
 * Valida comidas por día
 */
export function validateMealsPerDay(
  meals: string | number,
  fieldName: string = 'Comidas por día'
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Chequeo de vacío
  if (!meals || meals === '') {
    errors.push({
      field: fieldName,
      message: `${fieldName} es requerida`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  const m = typeof meals === 'string' ? parseInt(meals, 10) : meals;

  // Chequeo de valor válido
  if (isNaN(m) || !Number.isInteger(m)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} debe ser un número entero`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  // Chequeo de rango
  if (m < 1 || m > 6) {
    errors.push({
      field: fieldName,
      message: `${fieldName} debe estar entre 1 y 6`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  return {
    isValid: true,
    errors,
    warnings,
  };
}

/**
 * Valida un valor de kcal por unidad
 */
export function validateKcalPerUnit(
  kcal: string | number,
  fieldName: string = 'kcal/unidad'
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Chequeo de vacío
  if (!kcal || kcal === '') {
    errors.push({
      field: fieldName,
      message: `${fieldName} es requerida`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  const k = typeof kcal === 'string' ? parseFloat(kcal) : kcal;

  // Chequeo de valor válido
  if (isNaN(k) || !isFinite(k)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} debe ser un número válido`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  // Chequeo de valor positivo
  if (k <= 0) {
    errors.push({
      field: fieldName,
      message: `${fieldName} debe ser mayor a 0`,
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  // Chequeo de rango de densidad energética (típicamente 100-500 kcal/unidad)
  if (k < 50) {
    warnings.push({
      field: fieldName,
      message: `${fieldName} es muy baja (${k} kcal). Verifique la unidad.`,
      severity: 'warning',
    });
  }
  if (k > 5000) {
    warnings.push({
      field: fieldName,
      message: `${fieldName} es muy alta (${k} kcal). Verifique la unidad.`,
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Redondea número a 2 decimales máximo
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Formatea número para mostrar en UI (con decimales apropiados)
 */
export function formatNumberForDisplay(value: number, decimals: number = 2): string {
  return value.toLocaleString('es-CR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Crea mensaje de error para mostrar al usuario
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  return errors.map((e) => e.message).join('\n');
}

/**
 * Crea mensaje de advertencia para mostrar al usuario
 */
export function formatValidationWarnings(warnings: ValidationError[]): string {
  if (warnings.length === 0) return '';
  return warnings.map((w) => w.message).join('\n');
}
