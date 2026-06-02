'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  score: number;
  color?: 'cyan' | 'pink' | 'green' | 'orange';
  delay?: number;
}

export default function StatBar({ label, score, color = 'cyan', delay = 0 }: Props) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), delay + 100);
    return () => clearTimeout(t);
  }, [delay]);

  const pct = `${Math.round((score / 10) * 100)}%`;
  const BAR_COLORS: Record<string, { bar: string; glow: string }> = {
    cyan:   { bar: '#00f5ff', glow: '#00f5ff40' },
    pink:   { bar: '#ff2d78', glow: '#ff2d7840' },
    green:  { bar: '#00ff88', glow: '#00ff8840' },
    orange: { bar: '#ff6b35', glow: '#ff6b3540' },
  };
  const { bar: barColor, glow: glowColor } = BAR_COLORS[color ?? 'cyan'];

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span
          className="text-xs uppercase tracking-widest text-[#5a6480]"
          style={{ fontFamily: 'var(--font-space-mono)' }}
        >
          {label}
        </span>
        <span
          className={cn('text-sm font-bold tabular-nums')}
          style={{ fontFamily: 'var(--font-space-mono)', color: barColor }}
        >
          {score}
          <span className="text-[#5a6480] text-xs">/10</span>
        </span>
      </div>
      <div className="relative h-1.5 rounded-full bg-[#1a1a2e] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{
            width: filled ? pct : '0%',
            transitionDuration: '900ms',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            background: `linear-gradient(90deg, ${barColor}80, ${barColor})`,
            boxShadow: filled ? `0 0 8px ${glowColor}` : 'none',
          }}
        />
      </div>
    </div>
  );
}
