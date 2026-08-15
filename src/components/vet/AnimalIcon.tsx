'use client';

import { Dog, Cat } from 'lucide-react';
import type { AnimalType } from '@/lib/medications';

interface AnimalIconProps {
  type: AnimalType | 'perro' | 'gato';
  size?: number;
  active?: boolean;
  className?: string;
}

/**
 * Consistent lineart icon for dog & cat selection.
 * Uses Lucide Dog + Cat icons (same outline style) so they always match.
 */
export default function AnimalIcon({
  type,
  size = 36,
  active = false,
  className = '',
}: AnimalIconProps) {
  const color = active
    ? 'oklch(0.55 0.15 165)'
    : 'oklch(0.5 0.02 165)';

  const Icon = type === 'perro' ? Dog : Cat;

  return (
    <Icon
      size={size}
      strokeWidth={1.5}
      className={className}
      style={{ color }}
    />
  );
}

/* Small inline version for badges / list items */
export function AnimalBadge({ type, active = false }: { type: AnimalType | 'perro' | 'gato'; active?: boolean }) {
  return <AnimalIcon type={type} size={14} active={active} />;
}
