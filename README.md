# Rate My Face

A fun web app that uses Claude Vision to analyse a photo of your face and return a tongue-in-cheek profile card with vibe-based stats.

All outputs are entertainment only — nothing is stored.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Anthropic API (claude-sonnet-4-6 with vision)
- No database, no auth

## Setup

### 1. Clone and install

```bash
cd rate-my-face
npm install
```

### 2. Add your API key

```bash
cp .env.example .env.local
```

Open `.env.local` and set your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment — Cloudflare Pages

### Option A: Connect via GitHub (recommended)

1. Go to [Cloudflare Pages](https://pages.cloudflare.com) → **Create a project → Connect to Git**
2. Select the `rate-my-face` repo
3. Set build settings:
   - **Framework preset**: None
   - **Build command**: `npm run cf:build`
   - **Build output directory**: `.open-next/assets`
4. Add environment variable:
   - `ANTHROPIC_API_KEY` = your key (set in Settings → Environment variables)
5. Deploy

### Option B: Deploy from CLI

```bash
npm run cf:deploy
```

You'll be prompted to log in to Cloudflare on first run. Add `ANTHROPIC_API_KEY` in the Cloudflare Pages dashboard under Settings → Environment Variables after the first deploy.

### Local preview with Cloudflare runtime

```bash
npm run cf:preview
```

## Key constraints

- Images never leave the request/response cycle — not written to disk or any database
- API key is server-side only, never sent to the client
- Basic in-memory rate limiting: 10 requests per minute per IP
- All outputs are framed as entertainment, not factual claims
