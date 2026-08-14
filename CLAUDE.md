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

There is a known bug documented in the README: `checkVent()` short-circuits on medium/high severity and discards the `self_harm_risk` action (safety flag + support message + comments off), withholding the vent instead. `src/lib/safety.test.ts` pins the current behaviour with a comment pointing at this. If you fix the short-circuit, update that test in the same change.

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
