# Reviu

An agentic GitHub pull request reviewer with RAG context, intent verification, and a self-serve configuration dashboard. Built as a production alternative to CodeRabbit, designed for teams that want reviewers that actually understand their codebase rather than reviewing diffs in a vacuum.

---

## Overview

Most AI code reviewers look at a diff and apply general heuristics. Reviu indexes your entire repository into a vector database before reviewing anything, so when a PR touches a file, the reviewer already has semantic context about how that file fits into the larger system. It also separately verifies whether the code change actually matches what the PR description claims to do.

Reviews are delivered as GitHub Check Runs with inline PR comments, structured into findings that were introduced by the diff versus pre-existing issues in the surrounding context. Every finding carries a confidence score, and you control the threshold per repository.

---

## Architecture

```
GitHub PR Event
      |
      v
POST /webhook  -->  200 OK (immediate)
      |
      v
Celery Task (Redis queue)
      |
      +-- Check repo_settings.enabled
      +-- Fetch per-repo mode and confidence threshold
      +-- Create GitHub Check Run ("AI Review in progress...")
      +-- Fetch PR diff and metadata
      |
      +-- Repo indexing
      |     +-- First PR: full index (synchronous)
      |     +-- Stale >24h: reindex (background task)
      |     +-- Push event: incremental index (changed files only)
      |
      +-- pgvector semantic search (top 5 relevant files)
      +-- Intent verification (Gemini call)
      +-- Code review (Gemini call)
      |     +-- diff_findings: issues introduced in this PR
      |     +-- context_findings: pre-existing issues worth surfacing
      |
      +-- Post review comment to PR
      +-- Update GitHub Check Run (pass / fail)
      +-- Increment total_reviews in repo_settings
```

### Why a job queue

The GitHub webhook endpoint returns 200 immediately. All heavy work -- indexing, LLM calls, GitHub API writes -- runs in a Celery worker on a separate Railway service. This keeps webhook delivery reliable and decouples the review pipeline from request timeouts.

### Why RAG

A diff is a poor unit of context. A function that looks fine in isolation may be duplicating logic defined elsewhere, missing error handling patterns established in other modules, or violating conventions the rest of the codebase follows. Indexing the repo into pgvector lets the reviewer retrieve relevant surrounding files before forming an opinion.

### Why separate intent verification

Code review and intent checking are different tasks. The intent check is a focused Gemini call that answers one question: does this code change do what the PR description says it does? Keeping it separate produces cleaner signal than asking a single prompt to do both jobs.

---

## Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI (Python) |
| Job Queue | Celery + Redis Cloud |
| LLM | Gemini 2.5 Flash (Google AI Studio) |
| Embeddings | gemini-embedding-001, 768 dimensions |
| Vector Database | Supabase + pgvector |
| Backend Hosting | Railway (web + worker services) |
| Dashboard | Next.js 15 + NextAuth v5 |
| Dashboard Hosting | Vercel |
| Authentication | GitHub OAuth |

---

## Repository Structure

### Backend (`pr-reviewer`)

```
app/
  main.py              FastAPI app, health endpoint
  webhook.py           GitHub webhook receiver, HMAC verification, Celery dispatch
  github_client.py     GitHub App JWT auth, installation token generation,
                       diff fetching, review posting
  reviewer.py          Gemini review logic, junior/senior mode,
                       diff vs context findings, confidence scoring
  intent_checker.py    Separate Gemini call for PR intent verification
  indexer.py           Full and incremental repo indexing into pgvector,
                       semantic search via RPC
  checks.py            GitHub Checks API integration
  tasks.py             Celery task definitions with retry logic
  celery_app.py        Celery + Redis configuration
  repo_settings.py     Per-repo settings read/write via Supabase
Procfile               Railway process definitions (web + worker)
railway.toml           Railway build configuration
requirements.txt       Dependencies
```

### Dashboard (`reviu-dashboard`)

```
app/
  page.tsx                       Landing page
  layout.tsx                     Root layout, design tokens
  globals.css                    CSS variables, fonts, background
  api/
    auth/[...nextauth]/route.ts  NextAuth GitHub OAuth handler
    repos/route.ts               Fetches user repos and merges with settings
    settings/route.ts            Read/write repo settings to Supabase
    github/callback/route.ts     Post-install callback handler
  dashboard/
    page.tsx                     Server component with auth guard
    DashboardClient.tsx          Repo list, enable/disable, search
  repo/[owner]/[repo]/page.tsx   Per-repo settings (mode, threshold, stats)
lib/
  auth.ts                        NextAuth config
  supabase.ts                    Supabase client
```

---

## Database Schema

```sql
-- Stores vector embeddings of repository files for semantic search
create table repo_files (
  id            bigserial primary key,
  repo_full_name text not null,
  file_path     text not null,
  content       text not null,
  embedding     vector(768),
  indexed_at    timestamp with time zone default now()
);

-- Per-repository configuration and review statistics
create table repo_settings (
  id                  bigserial primary key,
  repo_full_name      text unique not null,
  review_mode         text default 'junior',
  confidence_threshold int default 70,
  enabled             boolean default true,
  installed_at        timestamp with time zone default now(),
  last_review_at      timestamp with time zone,
  total_reviews       int default 0
);
```

---

## Environment Variables

### Backend

```env
GITHUB_WEBHOOK_SECRET=
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY=          # Full PEM contents
GITHUB_INSTALLATION_ID=
GOOGLE_AI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
REDIS_URL=
REVIEW_MODE=junior           # Default mode (overridden per repo at runtime)
```

### Dashboard

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=                # Set to Vercel domain in production
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

---

## Review Modes

**Junior** mode writes reviews with explanations. Each finding describes not just what the problem is but why it matters, making it useful for developers earlier in their career or working in an unfamiliar part of the codebase.

**Senior** mode is direct and concise. Findings are brief and assume the reader can infer context. Better for experienced teams where verbose explanations add noise.

Mode is configurable per repository from the dashboard.

---

## Confidence Threshold

Every finding produced by the reviewer is assigned a confidence score between 0 and 100. Findings below the configured threshold for that repository are suppressed before the review is posted. The default threshold is 70.

Higher thresholds reduce false positives but may miss real issues. Lower thresholds surface more findings at the cost of more noise. Teams can tune this per repository based on signal quality in practice.

---

## GitHub App

The backend authenticates as a GitHub App rather than a personal access token. This gives it stable, installation-scoped access to repositories without tying credentials to an individual account. The App generates a fresh JWT on every request and exchanges it for a short-lived installation token.

**Required permissions:** Pull requests (read/write), Contents (read), Checks (read/write)

**Subscribed events:** Pull request, Push

---

## Infrastructure

The backend runs as two Railway services sharing the same codebase:

- **Web service** handles webhook delivery and the health endpoint
- **Worker service** runs the Celery consumer that processes review jobs

Both services read from the same environment variables. Redis Cloud is the message broker between them.

The dashboard runs on Vercel as a standard Next.js deployment. It communicates with Supabase directly from API routes using the service role key and never exposes it to the client.

---

## Development Setup

### Backend

```bash
git clone https://github.com/fysaio/pr-reviewer
cd pr-reviewer
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in credentials

# Terminal 1 -- API server
uvicorn app.main:app --reload

# Terminal 2 -- Celery worker
celery -A app.celery_app worker --loglevel=info

# Expose webhook endpoint for local GitHub delivery
ngrok http 8000
# Set GitHub App webhook URL to the ngrok URL + /webhook
```

### Dashboard

```bash
git clone https://github.com/fysaio/reviu-dashboard
cd reviu-dashboard
npm install
cp .env.local.example .env.local   # fill in credentials
npm run dev
```

---

## Deployment

### Backend (Railway)

1. Connect the `pr-reviewer` repository to a Railway project
2. Create two services: one for the web process, one for the worker
3. Set environment variables in Railway dashboard
4. Railway reads process types from `Procfile`

### Dashboard (Vercel)

1. Connect the `reviu-dashboard` repository to Vercel
2. Add all environment variables, setting `NEXTAUTH_URL` to the Vercel deployment URL
3. Update the GitHub OAuth App callback URL to match the Vercel domain
4. Update the GitHub App homepage URL to match

### Post-deployment

- Set the GitHub App **Setup URL** to `https://your-vercel-domain.com/api/github/callback` -- this is where GitHub redirects users after installing the App
- Set the GitHub App to **Public** so other users can install it on their repositories

---

## Roadmap

- Eval suite against known PRs to measure false positive and false negative rates
- Prompt tuning based on eval results
- Support for monorepos with selective indexing by subdirectory
- Review history and per-finding feedback stored in Supabase
- Public writeup covering architecture decisions, eval methodology, and results

---

## Built by

Oluwafisayo -- [fysaio](https://github.com/fysaio), Lagos.