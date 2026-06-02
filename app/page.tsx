'use client';

import { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import LoadingState from '@/components/LoadingState';
import ResultCard from '@/components/ResultCard';
import type { FaceAnalysis } from '@/types/analysis';

type Stage = 'idle' | 'loading' | 'result' | 'error';

export default function Home() {
  const [stage, setStage] = useState<Stage>('idle');
  const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleImage(previewUrl: string, base64: string, mimeType: string) {
    setImagePreview(previewUrl);
    setStage('loading');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.');
        setStage('error');
        return;
      }

      setAnalysis(data as FaceAnalysis);
      setStage('result');
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStage('error');
    }
  }

  function handleReset() {
    setStage('idle');
    setAnalysis(null);
    setImagePreview(null);
    setErrorMsg(null);
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12 bg-[#0a0a0f]">
      {/* Header */}
      <div
        className="text-center mb-10 space-y-3"
        style={{ animation: 'fade-up 0.5s ease-out both' }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1a1a2e] bg-[#0d0d18] mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f5ff] shadow-[0_0_6px_#00f5ff]" />
          <span
            className="text-[10px] uppercase tracking-widest text-[#5a6480]"
            style={{ fontFamily: 'var(--font-space-mono)' }}
          >
            AI Face Analysis
          </span>
        </div>
        <h1
          className="text-4xl font-extrabold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          Rate My{' '}
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(135deg, #00f5ff, #ff2d78)',
            }}
          >
            Face
          </span>
        </h1>
        <p
          className="text-sm text-[#5a6480] max-w-xs mx-auto"
          style={{ fontFamily: 'var(--font-space-mono)' }}
        >
          Upload a photo. Get your vibe decoded by AI. All in good fun.
        </p>
      </div>

      {/* Content area */}
      <div className="w-full max-w-md">
        {stage === 'idle' && <UploadZone onImage={handleImage} />}
        {stage === 'loading' && <LoadingState />}
        {stage === 'result' && analysis && imagePreview && (
          <ResultCard
            analysis={analysis}
            imagePreview={imagePreview}
            onReset={handleReset}
          />
        )}
        {stage === 'error' && (
          <div
            className="rounded-xl border border-[#ff2d7840] bg-[#ff2d780a] p-6 text-center space-y-4"
            style={{ animation: 'fade-up 0.4s ease-out both' }}
          >
            <p
              className="text-[#ff2d78] text-sm"
              style={{ fontFamily: 'var(--font-space-mono)' }}
            >
              {errorMsg ?? 'Something went wrong.'}
            </p>
            <button
              onClick={handleReset}
              className="px-5 py-2 rounded-lg border border-[#1a1a2e] bg-[#131325] text-sm text-slate-300 hover:border-[#00f5ff40] hover:text-[#00f5ff] transition-colors"
              style={{ fontFamily: 'var(--font-space-mono)' }}
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p
        className="mt-10 text-[11px] text-[#5a6480] text-center max-w-sm leading-relaxed"
        style={{ fontFamily: 'var(--font-space-mono)' }}
      >
        For entertainment only. All readings are AI-generated guesses — not
        scientific, medical, or demographic facts. No images are stored.
      </p>
    </main>
  );
}
