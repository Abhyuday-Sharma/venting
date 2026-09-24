import { PublicFeed } from "@/components/feed/public-feed";
import { Metadata } from "next";
import { getGuestFeedVents } from "@/lib/guest-feed";

// PublicFeed reads useSearchParams (?ventId=…). On a statically rendered route
// that forces client-only rendering, so the server HTML would hold no vents.
// Rendering per request keeps them in the HTML; getGuestFeedVents is cached, so
// Firestore isn't hit every time. There is deliberately no <Suspense> around
// PublicFeed: a boundary here streamed the vents in a hidden segment behind a
// "Loading feed..." fallback, instead of in the page markup itself.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community Feed & Anonymous Vents",
  description: "Read, connect, and share empathy with anonymous thoughts and vents shared by community members in a safe, judgment-free space.",
  alternates: {
    canonical: "https://venting.in/feed",
  },
  openGraph: {
    title: "Community Feed & Anonymous Vents | Venting",
    description: "Read, connect, and share empathy with anonymous thoughts and vents shared by community members.",
    url: "https://venting.in/feed",
    siteName: "Venting",
    images: [
      {
        url: "https://venting.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Venting Community Feed",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Feed & Anonymous Vents | Venting",
    description: "Read, connect, and share empathy with anonymous thoughts and vents shared by community members.",
    images: ["https://venting.in/og-image.png"],
    creator: "@venting_in",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function FeedPage() {
  const initialVents = await getGuestFeedVents();

  return (
    <PublicFeed initialVents={initialVents} />
  );
}
