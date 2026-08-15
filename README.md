# VetAssist 🐾🇨🇷 — Asistente para Cálculos de Uso Veterinario

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Costa Rica Open Source](https://img.shields.io/badge/Costa_Rica-Open_Source-red?style=flat-square)](https://github.com)

**VetAssist** es una herramienta de apoyo para el cálculo con precisión de dosis de medicamentos y alimentación para animales menores (caninos y felinos), desarrollada para médicos veterinarios, clínicas, hospitales veterinarios y estudiantes en **Costa Rica** y Latinoamérica.

---

## 🚀 Características Principales

### 💊 1. Calculadora de Medicamentos y Dosis
- **Dosificación por Peso:** Cálculo preciso en `mg`, `mL`, `UI` o `comprimidos` según el peso corporal (`kg` o `lb`).
- **Límites de Seguridad Terapéutica:** Muestra rangos de dosis mínima, recomendada y máxima según la literatura científica.
- **Frecuencias y Vías de Administración:** Soporte para vías IV, IM, SC, PO y frecuencias estandarizadas (SID, BID, TID, QID, c/8h, c/12h, c/24h).
- **Vademécum Integrado:** Base de datos con analgésicos, AINEs, antibióticos, anestésicos, antieméticos y corticoides comunes en Costa Rica.

### 📋 2. Protocolos de Uso Frecuente
- **Cálculo Simultáneo por Paciente:** Al ingresar el peso del animal, calcula de inmediato todos los fármacos del protocolo seleccionado (pre-quirúrgico, analgesia post-op, sedación, desparasitación interna, pioderma).
- **Exportación Rápida:** Botón para copiar el protocolo clínico calculado directamente al portapapeles.

### 💧 3. Calculadora de Fluidoterapia Infusiva
- **Tasa de Mantenimiento:** Cálculo exponencial metabólico ($RER = 70 \times \text{peso}^{0.75}$) y fórmula lineal.
- **Corrección de Deshidratación:** Cálculo del déficit de fluidos según porcentaje de deshidratación clínica ($% \text{ deshidratación} \times \text{peso kg} \times 1000 \text{ mL}$).
- **Pérdidas Continuas:** Estimación de pérdidas por vómito, diarrea o efusiones.
- **Tasa de Infusión y Goteo:** Conversión automática a `mL/h`, `mL/kg/h` y tasa de gotas por minuto para Macrogoteros (10, 15, 20 gtt/mL) y Microgoteros (60 gtt/mL).

### 🥩 4. Calculadora Nutricional / Calórica (RER & MER)
- **Requerimiento Energético en Reposo (RER):** Ajuste preciso por especie (perro/gato).
- **Requerimiento Energético de Mantenimiento (MER):** Factores multiplicadores por etapa de vida, actividad y condición corporal.
- **Distribución de Raciones:** División del alimento diario en gramos, onzas y tazas.

### ⚠️ 5. Verificador de Interacciones Fármaco-Fármaco
- Matriz de seguridad en tiempo real para evitar combinaciones potencialmente peligrosas o contraindicadas.

### 🐾 6. Evaluación de Condición Corporal (BCS 1-9)
- Guía interactiva visual basada en la escala estandarizada de 1 a 9 para evaluación física y nutricional.

### 📐 7. Convertidor Rápido de Unidades y Concentraciones
- Conversión rápida de concentraciones en porcentaje (`%`) a `mg/mL`.
- Fórmulas de dilución para preparación de soluciones clínicas ($C_1 V_1 = C_2 V_2$).
- Conversión instantánea entre kilogramos, libras y onzas.

### 🚑 8. Guía de Emergencia y Resucitación (RCP)
- Acceso inmediato a algoritmos de soporte vital cardiovascular avanzado en paro cardiorrespiratorio.
- Calculadora rápida de drogas de paro (Adrenalina, Atropina, Lidocaína, Naloxona, Gluconato de Calcio).

### 📑 9. Expediente Local y Privacidad de Datos (Offline-First)
- **Privacidad Total:** Todos los datos del paciente y notas clínicas se almacenan localmente en el navegador (`LocalStorage`). No se envían datos a servidores externos.

---

## 🛠️ Tecnología y Arquitectura

- **Framework Web:** [Next.js 16](https://nextjs.org/) (App Router)
- **Lenguaje:** [TypeScript 5](https://www.typescriptlang.org/)
- **Biblioteca UI:** [React 19](https://react.dev/)
- **Estilos CSS:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Componentes:** [Shadcn UI](https://ui.shadcn.com/) & Radix UI
- **Animaciones:** [Framer Motion](https://www.framer.com/motion/)
- **Gestión de Estado:** [Zustand](https://github.com/pmndrs/zustand)
- **Iconografía:** Lucide React & Reicon React

---

## 💻 Guía de Instalación y Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/vetassist.git
cd vetassist

# 2. Instalar las dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```
Navega a [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📜 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo en `http://localhost:3000`.
- `npm run build`: Compila la aplicación para producción.
- `npm run start`: Inicia el servidor Next.js en modo producción.
- `npm run lint`: Ejecuta el analizador de código ESLint.

---

## ⚠️ Descargo de Responsabilidad Médica (Medical Disclaimer)

> **AVISO LEGAL IMPORTANTE:** Esta herramienta es solo de referencia y no sustituye el criterio clínico profesional. Las dosis mostradas se basan en formularios veterinarios estándar, pero cada paciente es único. Siempre verifique la dosificación con las guías actualizadas, considere la condición clínica individual, y siga los protocolos establecidos por el Colegio de Médicos Veterinarios de Costa Rica. El uso de esta herramienta es responsabilidad exclusiva del profesional que la consulta, es importante tener en cuenta que está herramienta está dirigida a profesionales formados en medicina veterinaria y no al público general, no automedique a su mascota.

---

## 📄 Créditos y Licencia

- **Autor:** Elaborado por Ing. Alvaro Enrique Cascante Moraga, CPIC#12549
- **Licencia:** MIT.
