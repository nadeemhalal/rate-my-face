'use client';

import { useEffect, useState } from 'react';

const MESSAGES = [
  'Reading your aura...',
  'Consulting the vibe oracle...',
  'Estimating your rizz levels...',
  'Checking celebrity database...',
  'Running attractiveness algorithm...',
  'Scanning facial geometry...',
  'Calibrating confidence meter...',
  'Decoding relationship energy...',
];

export default function LoadingState() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">
      {/* Scanner animation */}
      <div className="relative w-32 h-32 rounded-full border border-[#1a1a2e] overflow-hidden bg-[#0d0d18]">
        {/* Rotating ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00f5ff] animate-spin"
          style={{ animationDuration: '1.2s' }}
        />
        <div
          className="absolute inset-2 rounded-full border border-transparent border-b-[#ff2d78] animate-spin"
          style={{ animationDuration: '1.8s', animationDirection: 'reverse' }}
        />
        {/* Scan line */}
        <div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent opacity-80"
          style={{
            animation: 'scanline 1.4s ease-in-out infinite',
            top: '50%',
          }}
        />
        {/* Centre dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#00f5ff] shadow-[0_0_8px_#00f5ff]" />
        </div>
      </div>

      {/* Rotating message */}
      <p
        className="text-sm text-[#00f5ff] tracking-widest uppercase text-center min-h-[1.5rem] transition-opacity duration-300"
        style={{
          fontFamily: 'var(--font-space-mono)',
          opacity: visible ? 1 : 0,
        }}
      >
        {MESSAGES[index]}
      </p>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#1a1a2e]"
            style={{
              animation: `glow-pulse 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              backgroundColor: '#00f5ff',
              opacity: 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
