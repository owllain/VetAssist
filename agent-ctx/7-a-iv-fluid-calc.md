---
Task ID: 7-a
Agent: Main Agent
Task: Create IV Fluid Rate Calculator component

Work Log:
- Read worklog.md for project context and conventions
- Read globals.css for available CSS utility classes (result-card, dose-highlight, step-number, hover-tap, card-shine, neon-border, depth-shadow, micro-bounce, glass-card, vet-pulse)
- Checked available reicon-react icons (Droplet, Flask, Clock, Warning, Calculator, CircleInfo, ArrowRight, Plus, Minus, ChevronDown, AlertTriangle)
- Confirmed icon weight props: 'Outline' or 'Fill' (capitalized)
- Studied FoodCalculator.tsx and ConcentrationCalculator.tsx for component patterns
- Created IVFluidCalculator.tsx with full feature set
- Ran ESLint — passed with 0 errors

Stage Summary:
- File created: /src/components/vet/IVFluidCalculator.tsx
- Pure client-side calculation (no API, no localStorage)
- Uses simple useState(null) for results (no hydration bugs)
- All labels in Spanish (Costa Rica)
- Lint: PASS
