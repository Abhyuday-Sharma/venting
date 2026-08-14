# Venting

**Express. Release. Grow.**

An anonymous emotional-wellness journal. Write a vent, set a mood, and choose how much of it the world sees — nothing, a pseudonym, or your username. An AI layer runs quietly alongside: it screens for crisis language, offers reflection prompts, and summarises mood trends over time.

Built with Next.js 15 (App Router) + React 19, Firebase (Auth/Firestore/Storage), and Genkit for the AI flows.

---

## Quick start

```bash
npm install
```

Create a `.env` in the repo root (see [Environment](#environment) below), then:

```bash
npm run dev
```

The dev server runs on **port 9002** (`http://localhost:9002`), not the Next.js default 3000.

To work on the AI flows with the Genkit inspector UI:

```bash
npm run genkit:dev
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next dev server with Turbopack on port 9002 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (flat config, `eslint.config.mjs`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest in watch mode |
| `npm run genkit:dev` | Genkit developer UI against `src/ai/dev.ts` |
| `npm run genkit:watch` | Same, with file watching |

## Environment

All of these go in `.env` (gitignored). The app degrades rather than crashes when the optional ones are missing.

**Firebase — required.** Without these the client cannot initialise.

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

These are publishable client keys. Access control lives in `firestore.rules`, not in keeping them secret.

**AI — at least one needed for the Genkit flows.** `src/ai/genkit.ts` prefers OpenAI-compatible (`gpt-4o-mini`) when `OPENAI_API_KEY` is set and falls back to Groq (`llama-3.3-70b-versatile`). With neither set it logs a warning and the flows fail — the app still runs, because every caller in `src/actions/ai.ts` catches and degrades.

```
GROQ_API_KEY
OPENAI_API_KEY
GEMINI_API_KEY
```

**Stripe — optional.** Absent, donations are disabled and `src/lib/stripe.ts` logs a warning at startup.

```
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

## Architecture

```
src/
  app/            App Router. (main) is the authenticated shell; login,
                  create-username, legal, support sit outside it.
  actions/        "use server" entry points — ai, vents, stripe, feedback.
  ai/
    genkit.ts     Plugin + default-model selection
    flows/        Six Genkit flows (see below)
    dev.ts        Entry point for the Genkit dev UI
  components/     Feature folders (vent, feed, dashboard, moments, …)
    ui/           shadcn/ui primitives
  lib/
    firebase.ts   All Firestore reads/writes and the realtime listeners
    safety.ts     Regex intent taxonomy — the client-side pre-filter
    types.ts      Vent, Comment, UserProfile, Report, Notification, …
  hooks/          use-auth, use-toast, use-debounce, animation hooks
firestore.rules   Access control (the real security boundary)
```

### The vent pipeline

`src/components/vent/vent-form.tsx` is the centre of the app. A submission goes:

1. **Compose** — typing, or Web Speech dictation. Hindi dictation is routed through the `ai-transliteration` flow before it lands in the textarea.
2. **Pre-filter** — `checkVent()` in `src/lib/safety.ts` matches a regex intent taxonomy client-side. Cheap and instant.
3. **AI moderation** — `analyzeContentSafety()` for semantic understanding the regex misses.
4. **Write** — private vent under `users/{uid}/vents`, public vent additionally to the top-level `publicVents`.

Three modes change the shape of that pipeline:

- **Burn & Release** — nothing is persisted at all; the text is destroyed on submit.
- **Incognito** — public post under a generated pseudonym (`Quiet Falcon`) with a DiceBear avatar derived from that name. The pseudonym is stable for an edited post so a vent doesn't change identity mid-thread.
- **Self-destruct** — `expiresAt` set on the document; the feed filters expired vents out.

Unauthenticated visitors can vent to `localStorage` under a cap, with no server round-trip.

### Safety model

Two layers, and **both fail open by design**: if the AI call throws, `src/actions/ai.ts` returns a permissive result rather than blocking the user. The reasoning is that a person in distress should never be met with an error page. The regex pre-filter has already run by that point.

Severity drives the response:

| Severity | Example intent | Effect |
|---|---|---|
| low | `self_harm_expression` | Publishes normally, no flag |
| medium | `self_harm_risk` | Intended: publish + safety flag + support message + comments off |
| high | `harassment_or_hate` | Withheld from the feed |
| critical | `self_harm_encouragement`, `self_harm_instruction` | Blocked, warning incremented, auto-ban after 1–2 strikes |

> **Known issue.** `checkVent()` short-circuits on `severity === 'high' || 'medium'` and returns a bare `{ publish: false }`, which discards the medium-severity action the taxonomy defines. A vent matching `self_harm_risk` is therefore silently withheld instead of being published with a safety flag and a support message. `src/lib/safety.test.ts` pins the current behaviour and is marked with the same caveat — update that test when the short-circuit is fixed.

### AI flows

All in `src/ai/flows/`, all reached through server actions in `src/actions/ai.ts`.

| Flow | Purpose |
|---|---|
| `ai-safety-moderation` | Semantic crisis/harassment screening; decides publish, flag, block, disable comments |
| `ai-reflection-prompter` | 1–2 follow-up questions from a vent |
| `ai-mood-summarizer` | Trend, triggers, strengths, gentle reframe — requires ≥3 vents |
| `ai-empathy-check` | Tone check on a comment before it posts |
| `ai-action-item` | One 5-minute micro-action |
| `ai-transliteration` | Romanized → native script for dictation |
| `ai-image-moderation` | Avatar screening |

### Data model

Private data is nested under the owner; public data is top-level so the feed can query it in one place.

```
users/{uid}                     profile, role, settings, ban status, cached insights
users/{uid}/vents/{id}          private vents
users/{uid}/notifications/{id}
users/{uid}/goals/{id}
usernames/{username}            uniqueness reservations
publicVents/{id}                the feed
publicVents/{id}/comments/{id}  threaded via parentId
publicVents/{id}/reports/{id}
reports/{id}                    global mirror, for the mod queue
auditLogs/{id}                  admin deletions
feedback/{id}
```

Roles are `owner` | `admin` | `moderator` | `user`, stored on the profile and enforced in `firestore.rules`.

Every Firestore call lives in `src/lib/firebase.ts` — components import functions from it rather than touching the SDK directly.

## Testing

Vitest, node environment, colocated as `*.test.ts` next to the module:

```bash
npm test
```

Current coverage is the pure-logic layer — `safety.ts`, `date-utils.ts`, `incognito.ts` — which is where the subtle behaviour is. Firestore access and React components are untested; that's the obvious next area, and would need `@vitejs/plugin-react` plus `jsdom` for component tests, or the Firebase emulator for data access.

## CI

`.github/workflows/ci.yml` runs lint → typecheck → test → build on pushes to `main`/`master` and on every PR.

The build step needs the `NEXT_PUBLIC_*` values as repository secrets, because `src/lib/firebase.ts` initialises at module scope. Lint, typecheck, and test need nothing.

Note that `next.config.ts` sets `eslint.ignoreDuringBuilds: true`, so the build itself won't catch lint problems — the separate lint step is what enforces them. ESLint is configured to fail on errors and report `no-explicit-any` / `no-unused-vars` as warnings, so the existing ~99 warnings don't block a merge while new errors do.

## Deployment

Vercel (`.vercel/` present). Firestore rules and indexes deploy separately:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```
