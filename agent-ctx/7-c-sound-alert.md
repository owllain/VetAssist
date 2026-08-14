# Task 7-c: Sound Alert System for Drug Interaction Checker

## Files Created
- `/home/z/my-project/src/lib/sound-alert.ts` — Web Audio API sound alert module

## Files Modified
- `/home/z/my-project/src/components/vet/DrugInteractionChecker.tsx` — Integrated sound alerts + toggle button

## Implementation Details

### sound-alert.ts
- `playAlertSound(severity)` generates tones using Web Audio API (OscillatorNode + GainNode with exponential ramp)
  - **alta**: 3 rapid beeps at 880Hz, 200ms on / 100ms off
  - **media**: 2 medium beeps at 660Hz, 150ms on / 100ms off
  - **baja**: 1 soft beep at 440Hz, 200ms
- `isSoundEnabled()` / `toggleSound()` use module-level boolean for global state
- Wrapped in try/catch to silently handle browser autoplay blocks
- AudioContext auto-closes after sounds finish

### DrugInteractionChecker.tsx
- Added `Speaker` (on) / `VolumeSlash` (off) toggle button in header with Tooltip showing 'Sonido activado' / 'Sonido desactivado'
- `useRef` tracks which drug already had its alert played (`soundPlayedRef`)
- `useEffect` fires `playAlertSound('alta')` exactly once per drug when alta-severity interactions are present
- Reset logic clears the ref when switching to a drug without alta interactions

## Verification
- `bun run lint` passes with zero errors
- Dev server compiles successfully (no warnings)
