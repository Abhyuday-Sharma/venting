# AdSense setup

The codebase is prepared for AdSense but **serves no ads yet**. Every identifier is a placeholder, and ad units render nothing until real values are set. Approval is Google's decision; this file covers what the code does and what has to happen outside it.

## Placeholders to replace before production

| Where | Placeholder | Replace with |
|---|---|---|
| `public/ads.txt` | `pub-XXXXXXXXXXXXXXXX` | Your publisher ID, without `ca-` (then delete the comment line) |
| Env `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | falls back to `ca-pub-XXXXXXXXXXXXXXXX` (`src/lib/ads-config.ts`) | `ca-pub-…` |
| Env `NEXT_PUBLIC_ADSENSE_SLOT_GUIDE` | empty, so no ad | Ad unit ID for the guide-article slot |
| Env `NEXT_PUBLIC_ADSENSE_SLOT_FEED` | empty, so no ad | Ad unit ID for the in-feed slot |
| `src/lib/site-config.ts` `CONTACT_EMAIL` | `support@venting.in` (already used on the account-deletion page) | Confirm it's a monitored inbox |

`NEXT_PUBLIC_*` values are compiled into the bundle at build time, so rebuild after changing them.

With only the client ID set, the loader script and the `google-adsense-account` meta tag carry your real ID. That's what AdSense site verification needs, and it still shows no ads. Ad units only appear once the slot IDs are set too.

## Where ads can appear

The rules live in `src/lib/ad-policy.ts` (with tests). An ad shows only if **both** of these hold:

1. the route is on the allowlist: `/`, `/showcase`, `/about`, `/updates`, `/guides/*`, `/feed`, and
2. the page renders an `<AdSlot>` (`src/components/ads/ad-slot.tsx`).

Right now only the guide articles and the feed render slots. Blocked routes always win over allowed ones. They include the vent composer, dashboard, mood tracking, moments, login and signup, onboarding, settings, legal pages, contact, account deletion, support and donations, and profiles. In the feed, an ad goes after every 6th card, and only when neither neighbouring vent is safety-flagged. `AdSlot` is hidden in the installed app (TWA/PWA) through the `is-standalone` class.

**Keep Auto ads OFF** in the AdSense dashboard. Auto ads ignore these rules and could place ads on the vent composer or next to crisis content. The loader injects a hidden `ins.adsbygoogle-noablate` element; that is Google's hook for Auto-ads overlay formats and stays unused while Auto ads are off.

After approval, go to **Blocking controls → Sensitive categories** and block the categories that are inappropriate next to mental-health content. At minimum: gambling, dating, alcohol, weight loss, and get-rich-quick.

## Consent (EEA / UK / Switzerland, US states)

Consent is **not implemented in code and is not complete**. Google requires a Google-certified CMP when serving ads to users in the EEA, UK, and Switzerland. The simplest route is AdSense's own:

- **AdSense → Privacy & messaging → European regulations**: create and publish the consent message for venting.in.
- **Privacy & messaging → US state regulations**: optional, recommended.

These messages are served by the same `adsbygoogle.js` tag, so no code change is needed. Until they are published, don't serve personalised ads in those regions.

## Crawling and the feed

- Signed-out visitors, and therefore crawlers, never receive safety-flagged vents. They are filtered on the server (`src/lib/guest-feed.ts`) and on the client (`isVisibleToGuests` in `public-feed.tsx`). Signed-in users see the feed as before.
- Incognito vents are sent to guests without the author's uid.
- `robots.ts` leaves `Mediapartners-Google` (the AdSense crawler) unrestricted.

## Before applying

1. Deploy, then check `https://venting.in/ads.txt`, `/robots.txt` and `/sitemap.xml`.
2. In Google Search Console, run URL Inspection on `/`, `/feed` and a guide, and confirm the rendered HTML contains the content.
3. Add more original guides in `src/lib/guides.ts`. Three is a start, not enough. Follow the editorial rules at the top of that file.
