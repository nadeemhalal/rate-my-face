'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onImage: (previewUrl: string, base64: string, mimeType: string) => void;
  disabled?: boolean;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;
const MAX_DIMENSION = 1024;

async function resizeImage(
  file: File
): Promise<{ base64: string; previewUrl: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const { width, height } = img;
      const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
      const w = Math.round(width * scale);
      const h = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, w, h);

      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, 0.85);
      const base64 = dataUrl.split(',')[1];
      resolve({ base64, previewUrl: dataUrl, mimeType });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = objectUrl;
  });
}

export default function UploadZone({ onImage, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!ACCEPTED.includes(file.type)) {
        setError('Only JPEG, PNG, or WEBP images are supported.');
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File must be under ${MAX_SIZE_MB}MB.`);
        return;
      }
      setProcessing(true);
      try {
        const { base64, previewUrl, mimeType } = await resizeImage(file);
        setPreview(previewUrl);
        onImage(previewUrl, base64, mimeType);
      } catch {
        setError('Could not process the image. Please try another file.');
      } finally {
        setProcessing(false);
      }
    },
    [onImage]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = '';
    },
    [handleFile]
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        type="button"
        disabled={disabled || processing}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          'relative w-full rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f5ff]',
          isDragging
            ? 'border-[#00f5ff] bg-[#00f5ff08] shadow-[0_0_24px_#00f5ff30]'
            : 'border-[#1a1a2e] bg-[#0d0d18] hover:border-[#00f5ff60] hover:bg-[#0d0d1e]',
          (disabled || processing) && 'opacity-50 cursor-not-allowed'
        )}
      >
        {preview ? (
          <div className="relative aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-center">
              <span
                className="text-[#00f5ff] text-xs font-space uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-space-mono)' }}
              >
                Click to change image
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 px-6 gap-4">
            <div
              className={cn(
                'p-4 rounded-full border border-[#1a1a2e] transition-all duration-300',
                isDragging
                  ? 'border-[#00f5ff] bg-[#00f5ff10] text-[#00f5ff]'
                  : 'bg-[#131325] text-[#5a6480]'
              )}
            >
              {processing ? (
                <div className="w-8 h-8 border-2 border-[#00f5ff] border-t-transparent rounded-full animate-spin" />
              ) : isDragging ? (
                <ImageIcon className="w-8 h-8" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>
            <div className="text-center space-y-1">
              <p
                className="text-sm text-slate-300"
                style={{ fontFamily: 'var(--font-syne)', fontWeight: 600 }}
              >
                {processing ? 'Processing...' : 'Drop your photo here'}
              </p>
              <p
                className="text-xs text-[#5a6480]"
                style={{ fontFamily: 'var(--font-space-mono)' }}
              >
                or click to browse — JPEG, PNG, WEBP up to 5MB
              </p>
            </div>
          </div>
        )}

        {/* Corner scan accents */}
        {!preview && (
          <>
            <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00f5ff30]" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00f5ff30]" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00f5ff30]" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00f5ff30]" />
          </>
        )}
      </button>

      {error && (
        <p
          className="mt-3 text-xs text-center text-[#ff2d78]"
          style={{ fontFamily: 'var(--font-space-mono)' }}
        >
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={onInputChange}
        className="sr-only"
        aria-label="Upload photo"
      />
    </div>
  );
}
