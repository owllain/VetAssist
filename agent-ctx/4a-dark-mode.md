---
Task ID: 4a
Agent: Main Agent
Task: Add dark mode toggle with ThemeProvider

Work Log:
- Edited /src/app/layout.tsx: imported ThemeProvider from 'next-themes', wrapped {children} and <Toaster /> in <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
- Edited /src/app/page.tsx:
  - Added `import { useTheme } from 'next-themes'`
  - Added `Sun, Moon` to reicon-react imports
  - Added `const { theme, setTheme } = useTheme()` in Home component
  - Added dark mode toggle Button between print button and mobile menu button (with `no-print` class)
  - Added dark mode toggle in mobile Sheet menu (after nav tabs, with border separator)
- Fixed lint error: restored missing </SheetContent> closing tag
- Lint passes clean (exit 0)

Stage Summary:
- 2 files changed: layout.tsx, page.tsx
- Dark mode toggle appears in both desktop header and mobile Sheet menu
- Uses `theme === 'dark'` directly (no isDark or resolvedTheme)
- All buttons have `no-print` class
- Dev server compiles and serves GET / 200
