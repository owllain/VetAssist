# Task 5a - BCS Component, Copy/Clear Features

## Files Created
1. **`/src/components/vet/BodyConditionScore.tsx`** — New BCS (Body Condition Score) visual chart component
   - 1-9 scale with oklch color gradient (blue→green→amber→red)
   - Horizontal on desktop (`md:flex-row`), vertical on mobile (`flex-col`)
   - Clickable segments with framer-motion spring animation on selection
   - Mobile: shows selected BCS description below the bar
   - Desktop: descriptions shown inline with `line-clamp-2`
   - Uses shadcn Card, Badge; reicon-react Activity, Heart icons

## Files Modified

### 2. **`/src/components/vet/MedicationCalculator.tsx`**
- Added `Copy`, `Trash` icons from reicon-react
- Imported `useClearHistory` from history store
- Added `copied` state + `clearHistory` hook
- **Copy button**: Next to Print button on result card header; copies formatted text to clipboard; shows "Copiado!" tooltip for 2s
- **Clear history button**: "Limpiar" button with Trash icon (size 12) next to "Consultas recientes" header

### 3. **`/src/components/vet/FreeModeCalculator.tsx`**
- Same Copy button and Clear history button additions as MedicationCalculator
- Copy format: `VetCalc CR\nModo Libre\nEspecie: ... | Peso: ...\nDosis: ...\n---\nCalculado con VetCalc CR`

### 4. **`/src/components/vet/FoodCalculator.tsx`**
- Imported `BodyConditionScore` component
- Added `Copy`, `Trash` icons; imported `useClearHistory`
- Added `bcs` state (number | null) and `copied` state
- Added `handleBcsChange` callback using `useCallback`:
  - BCS 1-3 → auto-sets activity to 'bajo'
  - BCS 4-5 → leaves activity as-is
  - BCS 6-9 → auto-sets activity to 'alto'
- BCS widget placed as Step 5 between Step 4 (meals) and Calculate button
- Info note shown when BCS overrides activity (explains the adjustment)
- Activity buttons highlight based on `effectiveActivity` (BCS-aware)
- Copy format includes species, weight, grams, ounces, cups, meals, activity level
- Clear history button added
- Removed unused imports (`Paw`, `Heart`, `Badge`)

## Lint Status
- `bun run lint` passes clean (exit 0, no output)
- No existing functionality changed
- All components use 'use client' directive
- All icons from reicon-react
