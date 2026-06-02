'use client';

import { useState } from 'react';
import { Share2, RotateCcw, Check, Zap, User, Star, Heart } from 'lucide-react';
import type { FaceAnalysis } from '@/types/analysis';
import StatBar from './StatBar';
import { cn } from '@/lib/utils';

interface Props {
  analysis: FaceAnalysis;
  imagePreview: string;
  onReset: () => void;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
  accent?: 'cyan' | 'pink';
}

// Tier helpers — drive colour and label changes based on score
function scoreTier(score: number): 'low' | 'mid' | 'high' {
  if (score <= 4) return 'low';
  if (score <= 7) return 'mid';
  return 'high';
}

const TIER_COLORS = {
  low:  { primary: '#ff6b35', glow: '#ff6b3530' },   // amber-orange — honest but not harsh
  mid:  { primary: '#00f5ff', glow: '#00f5ff30' },   // cyan — neutral
  high: { primary: '#00ff88', glow: '#00ff8830' },   // green — celebratory
};

const ATTRACTIVENESS_LABELS: Record<'low' | 'mid' | 'high', string> = {
  low:  'Below average',
  mid:  'Average — solid',
  high: 'Above average',
};

const CONFIDENCE_LABELS: Record<'low' | 'mid' | 'high', string> = {
  low:  'Low confidence',
  mid:  'Moderate confidence',
  high: 'High confidence',
};

function StatItem({ icon, label, value, delay, accent = 'cyan' }: StatItemProps) {
  const color = accent === 'cyan' ? '#00f5ff' : '#ff2d78';
  return (
    <div
      className="flex items-start gap-3 py-2.5 border-b border-[#1a1a2e] last:border-0"
      style={{ animation: 'fade-up 0.5s ease-out both', animationDelay: `${delay}ms` }}
    >
      <div className="mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center" style={{ color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className="text-[10px] uppercase tracking-widest text-[#5a6480] mb-0.5"
          style={{ fontFamily: 'var(--font-space-mono)' }}
        >
          {label}
        </p>
        <p
          className="text-sm text-slate-200 leading-snug"
          style={{ fontFamily: 'var(--font-space-mono)' }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

interface ScoreBadgeProps {
  score: number;
  label: string;
}

function ScoreBadge({ score, label }: ScoreBadgeProps) {
  const tier = scoreTier(score);
  const { primary, glow } = TIER_COLORS[tier];
  return (
    <div
      className="flex flex-col items-center justify-center py-3 rounded-xl border bg-[#131325]"
      style={{ borderColor: `${primary}40`, boxShadow: `0 0 12px ${glow}` }}
    >
      <span
        className="text-2xl font-bold tabular-nums leading-none mb-0.5"
        style={{ fontFamily: 'var(--font-space-mono)', color: primary }}
      >
        {score}
        <span className="text-sm text-[#5a6480]">/10</span>
      </span>
      <span
        className="text-[9px] uppercase tracking-widest mt-1"
        style={{ fontFamily: 'var(--font-space-mono)', color: primary, opacity: 0.7 }}
      >
        {label}
      </span>
    </div>
  );
}

interface RoastBoxProps {
  roast: string;
  attractiveness: number;
}

function RoastBox({ roast, attractiveness }: RoastBoxProps) {
  const isLow = attractiveness <= 4;
  const isHigh = attractiveness >= 8;

  const borderColor = isLow ? '#ff2d78' : '#ff2d7830';
  const bgColor = isLow ? '#ff2d780f' : '#ff2d780a';
  const labelColor = isLow ? '#ff2d78' : '#ff2d7880';

  const label = isLow
    ? '🔥 Roasted'
    : isHigh
    ? 'Backhanded compliment'
    : 'Roast';

  return (
    <div
      className="rounded-xl px-4 py-3 space-y-2"
      style={{
        border: `1px solid ${borderColor}`,
        background: bgColor,
        boxShadow: isLow ? '0 0 16px #ff2d7820' : 'none',
        animation: 'fade-up 0.5s ease-out 800ms both',
      }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-[10px] uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-space-mono)', color: labelColor }}
        >
          {label}
        </p>
        {isLow && (
          <span
            className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{
              fontFamily: 'var(--font-space-mono)',
              background: '#ff2d7820',
              color: '#ff2d78',
              border: '1px solid #ff2d7840',
            }}
          >
            No survivors
          </span>
        )}
      </div>
      <p
        className="text-sm leading-relaxed"
        style={{
          fontFamily: 'var(--font-space-mono)',
          color: isLow ? '#fca5a5' : '#cbd5e1',
          fontStyle: 'italic',
          fontWeight: isLow ? 500 : 400,
        }}
      >
        &ldquo;{roast}&rdquo;
      </p>
    </div>
  );
}

export default function ResultCard({ analysis, imagePreview, onReset }: Props) {
  const [copied, setCopied] = useState(false);

  const attractTier = scoreTier(analysis.attractiveness);
  const confTier = scoreTier(analysis.confidence);
  const { primary: attractColor } = TIER_COLORS[attractTier];

  const shareText = `My face analysis: ${analysis.vibe} | Attractiveness: ${analysis.attractiveness}/10 | Looks like: ${analysis.celebrity_lookalike} | Roast: ${analysis.roast}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Rate My Face Result', text: shareText });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-[#1a1a2e] bg-[#0d0d18]"
      style={{
        boxShadow: `0 0 40px ${TIER_COLORS[attractTier].glow}, 0 0 80px ${TIER_COLORS[attractTier].glow}50`,
        animation: 'fade-up 0.4s ease-out both',
      }}
    >
      {/* Header image strip */}
      <div className="relative h-44 overflow-hidden bg-[#131325]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagePreview} alt="Your photo" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d1800] via-transparent to-[#0d0d18]" />

        {/* Scan overlay lines */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="absolute left-0 right-0 h-px bg-[#00f5ff08]" style={{ top: `${(i + 1) * (100 / 7)}%` }} />
          ))}
        </div>

        {/* Corner brackets — colour matches attractiveness tier */}
        {(['top-2 left-2 border-t-2 border-l-2', 'top-2 right-2 border-t-2 border-r-2', 'bottom-2 left-2 border-b-2 border-l-2', 'bottom-2 right-2 border-b-2 border-r-2'] as const).map((pos, i) => (
          <span key={i} className={`absolute w-4 h-4 ${pos}`} style={{ borderColor: `${attractColor}60` }} />
        ))}

        {/* Vibe badge */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <span
            className="px-3 py-1 rounded-full bg-[#0a0a0f] text-xs"
            style={{
              fontFamily: 'var(--font-space-mono)',
              border: `1px solid ${attractColor}40`,
              color: attractColor,
              animation: 'decrypt 0.8s ease-out 200ms both',
            }}
          >
            {analysis.vibe}
          </span>
        </div>
      </div>

      <div className="px-5 pt-4 pb-5 space-y-5">
        {/* Identity row */}
        <div className="grid grid-cols-3 gap-2" style={{ animation: 'fade-up 0.5s ease-out 100ms both' }}>
          {[
            { label: 'Age', value: analysis.age },
            { label: 'Gender', value: analysis.gender },
            { label: 'Ethnicity', value: analysis.ethnicity },
          ].map(({ label, value }) => (
            <div key={label} className="text-center py-2 rounded-lg bg-[#131325] border border-[#1a1a2e]">
              <p className="text-[9px] uppercase tracking-widest text-[#5a6480] mb-0.5" style={{ fontFamily: 'var(--font-space-mono)' }}>
                {label}
              </p>
              <p className="text-xs text-slate-200 leading-tight" style={{ fontFamily: 'var(--font-space-mono)' }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Score badges + bars */}
        <div className="space-y-4 py-3 border-y border-[#1a1a2e]" style={{ animation: 'fade-up 0.5s ease-out 200ms both' }}>
          <div className="grid grid-cols-2 gap-3">
            <ScoreBadge score={analysis.attractiveness} label={ATTRACTIVENESS_LABELS[attractTier]} />
            <ScoreBadge score={analysis.confidence} label={CONFIDENCE_LABELS[confTier]} />
          </div>
          <div className="space-y-3">
            <StatBar
              label="Attractiveness"
              score={analysis.attractiveness}
              color={attractTier === 'high' ? 'green' : attractTier === 'low' ? 'orange' : 'cyan'}
              delay={300}
            />
            <StatBar
              label="Confidence"
              score={analysis.confidence}
              color={confTier === 'high' ? 'green' : confTier === 'low' ? 'orange' : 'pink'}
              delay={450}
            />
          </div>
        </div>

        {/* Info rows */}
        <div style={{ animation: 'fade-up 0.5s ease-out 350ms both' }}>
          <StatItem icon={<Heart className="w-4 h-4" />} label="Relationship status" value={analysis.relationshipStatus} delay={400} accent="pink" />
          <StatItem icon={<Star className="w-4 h-4" />} label="Celebrity twin" value={analysis.celebrity_lookalike} delay={500} />
          <StatItem icon={<Zap className="w-4 h-4" />} label="Energy" value={analysis.energy} delay={600} />
          <StatItem icon={<User className="w-4 h-4" />} label="Summary" value={analysis.summary} delay={700} />
        </div>

        {/* Roast box — escalates visually for low scorers */}
        <RoastBox roast={analysis.roast} attractiveness={analysis.attractiveness} />

        {/* Action buttons */}
        <div className="flex gap-3 pt-1" style={{ animation: 'fade-up 0.5s ease-out 900ms both' }}>
          <button
            onClick={handleShare}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs transition-all duration-200',
              'border border-[#00f5ff40] bg-[#00f5ff0a] text-[#00f5ff]',
              'hover:bg-[#00f5ff18] hover:border-[#00f5ff80] hover:shadow-[0_0_12px_#00f5ff20]',
              'active:scale-95'
            )}
            style={{ fontFamily: 'var(--font-space-mono)' }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button
            onClick={onReset}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs transition-all duration-200',
              'border border-[#1a1a2e] bg-[#131325] text-[#5a6480]',
              'hover:border-[#2a2a3e] hover:text-slate-300',
              'active:scale-95'
            )}
            style={{ fontFamily: 'var(--font-space-mono)' }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Another
          </button>
        </div>
      </div>
    </div>
  );
}
