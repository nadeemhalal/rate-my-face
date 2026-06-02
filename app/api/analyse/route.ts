import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSystemPrompt } from '@/lib/analysePrompt';
import type { FaceAnalysis } from '@/types/analysis';

const client = new Anthropic();

// Simple in-memory rate limiter — max 10 req/min per IP
// Note: resets on serverless cold start; good enough for a demo
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

const VALID_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests — wait a minute and try again.' },
      { status: 429 }
    );
  }

  let body: { image?: string; mimeType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { image, mimeType = 'image/jpeg' } = body;

  if (!image || typeof image !== 'string') {
    return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
  }

  if (!VALID_MIME.has(mimeType)) {
    return NextResponse.json(
      { error: 'Unsupported image type. Use JPEG, PNG, or WEBP.' },
      { status: 400 }
    );
  }

  // ~4MB base64 limit (raw 5MB file becomes ~6.7MB base64 — cap here)
  if (image.length > 7_000_000) {
    return NextResponse.json({ error: 'Image too large.' }, { status: 400 });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: getSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
                data: image,
              },
            },
            {
              type: 'text',
              text: 'Analyse this face and return the JSON.',
            },
          ],
        },
      ],
    });

    const raw = response.content[0];
    if (raw.type !== 'text') {
      return NextResponse.json(
        { error: 'Unexpected response from AI.' },
        { status: 500 }
      );
    }

    // Strip any accidental markdown code fences
    const jsonText = raw.text
      .trim()
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '');

    const analysis: FaceAnalysis = JSON.parse(jsonText);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error('[analyse]', err);
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'AI returned an unexpected format. Please try again.' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
