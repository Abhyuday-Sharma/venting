# CLAUDE.md

Guidance for Claude Code working in this repo. See [README.md](README.md) for the full architecture tour; this file covers the things that are easy to get wrong.

## Commands

```bash
npm run dev          # port 9002, not 3000
npm run lint         # eslint . — must stay at 0 errors
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run genkit:dev   # Genkit inspector for the AI flows
```

Run `npm run lint && npm run typecheck && npm test` before declaring work done. All three currently pass; `npm run build` also passes but is slow, so reserve it for changes that touch config, module-scope initialisation, or server/client boundaries.

## Conventions that are already established — follow them

- **Firestore access goes in `src/lib/firebase.ts`.** Components import named functions (`getPublicVents`, `addCommentToVent`, …) and never call the Firestore SDK directly. Keep new data access there.
- **AI is reached through `src/actions/ai.ts`**, never by importing a flow into a component. The server actions are also where the fail-open fallbacks live.
- **UI primitives are shadcn/ui** in `src/components/ui/`. Compose these rather than hand-rolling; add new primitives with the shadcn generator so `components.json` stays accurate.
- **Paths use the `@/` alias** → `src/`. Configured in `tsconfig.json`, mirrored in `vitest.config.ts`.
- **Types live in `src/lib/types.ts`.** `Vent`, `Comment`, `UserProfile`, `Report`, `Notification`, `AuditLog`, `FeedbackItem`. Extend these rather than defining local shapes.
- **Timestamps are read through `src/lib/date-utils.ts`.** `getDate()` / `toMillis()` absorb every shape a Firestore timestamp arrives in — hydrated `Timestamp`, raw `{seconds, nanoseconds}` after a server/client hop, millis, ISO string. Don't call `.toDate()` directly; it throws on the raw shape.

## Safety code — handle with care

`src/lib/safety.ts` and the `ai-safety-moderation` flow decide what happens when someone writes about self-harm. Two rules:

1. **Fail open.** Every AI safety path returns a permissive result when the call errors (see `analyzeContentSafety` in `src/actions/ai.ts`). This is deliberate — someone in crisis must not hit an error. Don't "fix" it into a fail-closed default.
2. **Don't silently change severity handling.** The mapping from intent → action is a product decision, not an implementation detail. If a change alters who gets blocked, flagged, or shown the support modal, say so explicitly.

`checkVent()` withholds every medium/high vent match from the feed. For `self_harm_risk` it keeps the vent private *and* returns `safetyFlag` + `showSupportMessage`, so the crisis support modal opens before the save. The owner decided this on 2026-09-24: private plus support, rather than the taxonomy's publish-with-comments-off. `src/lib/safety.test.ts` pins it, and the README's safety model explains it. Don't turn it back into a silent withhold. Someone writing about self-harm must always see the support modal.

## AI calls — no-wastage policy

Groq credits are limited and the app has little traffic. Every model call is a cost, both in the running app and while developing.

**In app code**
- **No call without a reason.** A model call needs either a user action (a button) or new content (a vent being saved). Never call on mount, refresh, tab focus, or re-render. The mood-insights card's manual trigger plus 5-minute cooldown is the pattern to follow.
- **Never re-call with identical input.** Key effects on the fields actually sent to the model (`vent.text`, `vent.mood`, …), never on an object's identity. Firestore subscriptions (`getVentsForUser`, etc.) hand back fresh objects on every snapshot. See `reflection-prompt-card.tsx`.
- **Batch rather than call per chunk.** For example, one call per finished input, not one per speech segment.
- **Prefer code when code is enough.** Regex, lookups, and arithmetic come first. A model is for judgments code can't make.
- **Before adding or re-enabling an AI call,** state how many calls it makes per user action, and on which model, and get the owner's OK. The comment empathy and comment AI-safety checks in `comment-sheet.tsx` are switched off deliberately to save cost. Don't turn them back on as a side effect.
- Rate limits for AI actions live in `src/actions/ai.ts`. Keep new actions behind `assertRateLimit`.

**While developing**
- **Don't make live model calls to see if something works** when reading the code, `npm run typecheck`, or a unit test would answer the question.
- **When a live call is needed,** use the fewest inputs that prove the point, often one representative case. Save the outputs to reuse rather than regenerating them. Report how many calls you made.
- **Driving the app end-to-end triggers real calls** (posting a vent → reflection prompts). Don't re-run those flows more than needed.
- **Listing Groq models is free:** `GET https://api.groq.com/openai/v1/models`. Check it before changing a model id. `llama-3.3-70b-versatile` was retired without warning.
- **TypeSafe/Jev (`TYPESAFE_API_KEY` in `.env`)** is for dev-time quality checks of prompt changes. Adding it to the running app needs the owner's sign-off.

## Testing

Vitest, node environment, `src/**/*.test.ts` colocated with the module. Existing suites cover `safety.ts`, `date-utils.ts`, `incognito.ts`.

No React or DOM testing is set up yet — component tests would need `@vitejs/plugin-react` and `jsdom` added to `vitest.config.ts`. Firestore functions would need the Firebase emulator. Don't stub either in a way that pretends to test real behaviour.

## Gotchas

- **`next.config.ts` sets `eslint.ignoreDuringBuilds: true`.** A green build says nothing about lint. Run `npm run lint` separately.
- **ESLint is at 0 errors and ~99 warnings.** `no-explicit-any` and `no-unused-vars` are warnings on purpose (Firestore payloads and speech-recognition events are untyped upstream). Keep errors at zero; don't bulk-fix the warnings as a side quest.
- **`next lint` is deprecated** in Next 15.5 — the `lint` script calls `eslint .` directly against the flat config in `eslint.config.mjs`.
- **Firebase initialises at module scope** in `src/lib/firebase.ts`, so `NEXT_PUBLIC_FIREBASE_*` must be present even to build.
- **Stripe and Genkit degrade instead of failing.** Missing `STRIPE_SECRET_KEY` disables donations; missing AI keys just warn. Absent keys locally are normal, not a bug to chase.
- **Guest mode is real.** `vent-form.tsx` writes to `localStorage` for unauthenticated users. Changes to the submit path need to work on both branches.
- **`(main)` is a route group** — the authenticated shell with bottom navigation. `login`, `create-username`, `legal`, `support`, `about` sit outside it and have no nav chrome.
