# Graph Report - .  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 748 nodes · 1798 edges · 75 communities (26 shown, 49 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ba8faf57`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useAuth
- firebase.ts
- public-feed.tsx
- ai.ts
- useToast
- settings-form.tsx
- comment-sheet.tsx
- devDependencies
- carousel.tsx
- compilerOptions
- vent-form.tsx
- components.json
- cn
- notifications-dropdown.tsx
- menubar.tsx
- venting-showcase.tsx
- form.tsx
- dependencies
- manifest.json
- table.tsx
- use-intersection-animate.ts
- animejs
- camera-controls
- class-variance-authority
- clsx
- date-fns
- dotenv
- firebase
- genkit
- @genkit-ai/compat-oai
- @genkit-ai/next
- genkitx-groq
- @hookform/resolvers
- lucide-react
- next
- next.config.ts
- next-themes
- patch-package
- @radix-ui/react-accordion
- @radix-ui/react-alert-dialog
- @radix-ui/react-checkbox
- @radix-ui/react-collapsible
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-label
- @radix-ui/react-menubar
- @radix-ui/react-popover
- @radix-ui/react-progress
- @radix-ui/react-radio-group
- @radix-ui/react-select
- @radix-ui/react-separator
- @radix-ui/react-slider
- @radix-ui/react-slot
- @radix-ui/react-switch
- @radix-ui/react-tooltip
- react-day-picker
- react-dom
- react-hook-form
- @react-three/fiber
- recharts
- @shadergradient/react
- stripe
- tailwind-merge
- tailwindcss-animate
- three
- three-stdlib
- zod
- postcss.config.mjs
- placeholder-images.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 60 edges
2. `useAuth()` - 51 edges
3. `Button` - 39 edges
4. `useToast()` - 39 edges
5. `Card` - 24 edges
6. `CardHeader` - 23 edges
7. `CardContent` - 23 edges
8. `Vent` - 23 edges
9. `CardTitle` - 20 edges
10. `Skeleton()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `EndSessionAcknowledgement()` --references--> `react`  [EXTRACTED]
  src/components/layout/end-session-acknowledgement.tsx → package.json
- `useCarousel()` --references--> `react`  [EXTRACTED]
  src/components/ui/carousel.tsx → package.json
- `useChart()` --references--> `react`  [EXTRACTED]
  src/components/ui/chart.tsx → package.json
- `useFormField()` --references--> `react`  [EXTRACTED]
  src/components/ui/form.tsx → package.json
- `useToast()` --references--> `react`  [EXTRACTED]
  src/hooks/use-toast.ts → package.json

## Import Cycles
- None detected.

## Communities (75 total, 49 thin omitted)

### Community 0 - "useAuth"
Cohesion: 0.07
Nodes (38): createCheckoutSession(), verifyStripeSession(), metadata, metadata, metadata, metadata, AI_FEATURES, ReleaseNote (+30 more)

### Community 1 - "firebase.ts"
Cohesion: 0.07
Nodes (47): generateMicroActionItem(), generateMoodInsights(), generateReflectionPrompts(), getInitials(), UserProfilePage(), getInitials(), UserProfilePage(), AuthContext (+39 more)

### Community 2 - "public-feed.tsx"
Cohesion: 0.08
Nodes (47): VentHistoryProps, CommentWithReplies(), CommentWithRepliesProps, getInitials(), CommentSheetProps, createReactionNotification(), getInitials(), moodBadgeVariant() (+39 more)

### Community 3 - "ai.ts"
Cohesion: 0.06
Nodes (45): checkCommentEmpathy(), ActionItemInput, ActionItemInputSchema, ActionItemOutput, ActionItemOutputSchema, actionPrompt, generateActionItemFlow(), checkCommentEmpathy() (+37 more)

### Community 4 - "useToast"
Cohesion: 0.06
Nodes (44): metadata, viewport, InteractiveMomentCard(), AuthProvider(), MoodCheckInManager(), MoodTracksClient(), FirebaseErrorListener(), AppHeader() (+36 more)

### Community 5 - "settings-form.tsx"
Cohesion: 0.06
Nodes (34): imageModerationFlow, ImageModerationInput, ImageModerationInputSchema, ImageModerationOutput, ImageModerationOutputSchema, imageModerationPrompt, moderateImage(), LegalDocViewer() (+26 more)

### Community 6 - "comment-sheet.tsx"
Cohesion: 0.11
Nodes (27): CommentSheet(), findComment(), EmpathyNudge(), EmpathyNudgeProps, Alert, AlertDescription, AlertTitle, alertVariants (+19 more)

### Community 7 - "devDependencies"
Cohesion: 0.06
Nodes (30): genkit-cli, devDependencies, genkit-cli, postcss, tailwindcss, @types/animejs, @types/node, @types/react (+22 more)

### Community 8 - "carousel.tsx"
Cohesion: 0.07
Nodes (24): react, react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem (+16 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 10 - "vent-form.tsx"
Cohesion: 0.18
Nodes (12): analyzeContentSafety(), transliterateText(), Switch, Textarea, VentForm(), createBurnEmbers(), getVentById(), adjectives (+4 more)

### Community 11 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "cn"
Cohesion: 0.17
Nodes (11): EndSessionAcknowledgement(), EndSessionAcknowledgementProps, buttonVariants, Calendar(), CalendarProps, Checkbox, MenubarShortcut(), PopoverContent (+3 more)

### Community 13 - "notifications-dropdown.tsx"
Cohesion: 0.18
Nodes (13): ModeToggle(), NotificationsDropdown(), DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator (+5 more)

### Community 14 - "menubar.tsx"
Cohesion: 0.12
Nodes (10): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarSubContent (+2 more)

### Community 15 - "venting-showcase.tsx"
Cohesion: 0.22
Nodes (10): metadata, AIToolsSection(), CommunitySection(), CTASection(), MoodTrackingSection(), StatsSection(), useOnScreen(), VentingFeatureSection() (+2 more)

### Community 16 - "form.tsx"
Cohesion: 0.15
Nodes (11): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+3 more)

### Community 17 - "dependencies"
Cohesion: 0.18
Nodes (12): embla-carousel-react, @genkit-ai/google-genai, dependencies, embla-carousel-react, @genkit-ai/google-genai, @radix-ui/react-avatar, @radix-ui/react-scroll-area, @radix-ui/react-tabs (+4 more)

### Community 18 - "manifest.json"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 19 - "table.tsx"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

## Knowledge Gaps
- **256 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+251 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`, `carousel.tsx`, `animejs`, `camera-controls`, `class-variance-authority`, `clsx`, `date-fns`, `dotenv`, `firebase`, `genkit`, `@genkit-ai/compat-oai`, `@genkit-ai/next`, `genkitx-groq`, `@hookform/resolvers`, `lucide-react`, `next`, `next-themes`, `patch-package`, `@radix-ui/react-accordion`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-checkbox`, `@radix-ui/react-collapsible`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-menubar`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-radio-group`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slider`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-tooltip`, `react-day-picker`, `react-dom`, `react-hook-form`, `@react-three/fiber`, `recharts`, `@shadergradient/react`, `stripe`, `tailwind-merge`, `tailwindcss-animate`, `three`, `three-stdlib`, `zod`?**
  _High betweenness centrality (0.286) - this node is a cross-community bridge._
- **Why does `react` connect `carousel.tsx` to `dependencies`, `cn`, `useToast`?**
  _High betweenness centrality (0.262) - this node is a cross-community bridge._
- **Why does `useToast()` connect `useToast` to `useAuth`, `firebase.ts`, `public-feed.tsx`, `settings-form.tsx`, `comment-sheet.tsx`, `carousel.tsx`, `vent-form.tsx`?**
  _High betweenness centrality (0.204) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _256 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.06522320235231222 - nodes in this community are weakly interconnected._
- **Should `firebase.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07055630936227951 - nodes in this community are weakly interconnected._
- **Should `public-feed.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08134920634920635 - nodes in this community are weakly interconnected._