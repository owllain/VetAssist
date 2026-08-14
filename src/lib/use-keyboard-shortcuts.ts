'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  const handler = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger when typing in inputs
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) {
      // Only allow Enter key in inputs
      if (e.key === 'Enter' && 'enter' in shortcuts) {
        e.preventDefault();
        shortcuts['enter']();
      }
      return;
    }

    const key = e.key.toLowerCase();
    const combo: string[] = [];
    if (e.ctrlKey || e.metaKey) combo.push('ctrl');
    if (e.shiftKey) combo.push('shift');
    if (e.altKey) combo.push('alt');
    combo.push(key);

    const comboStr = combo.join('+');
    const keyStr = key;

    if (shortcuts[comboStr]) {
      e.preventDefault();
      shortcuts[comboStr]();
    } else if (shortcuts[keyStr]) {
      e.preventDefault();
      shortcuts[keyStr]();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
