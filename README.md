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

## Deployment

Deploy to the **company Vercel team account** only. This project handles no real user data, but follow standard practice — do not deploy to personal Vercel accounts or unapproved hosts.

```bash
vercel --team <company-team-slug>
```

Add `ANTHROPIC_API_KEY` as an environment variable in the Vercel project settings.

## Key constraints

- Images never leave the request/response cycle — not written to disk or any database
- API key is server-side only, never sent to the client
- Basic in-memory rate limiting: 10 requests per minute per IP
- All outputs are framed as entertainment, not factual claims
