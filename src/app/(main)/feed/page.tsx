import { PublicFeed } from "@/components/feed/public-feed";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Feed & Anonymous Vents",
  description: "Read, connect, and share empathy with anonymous thoughts and vents shared by community members in a safe, judgment-free space.",
  alternates: {
    canonical: "https://venting.in/feed",
  },
  openGraph: {
    title: "Community Feed & Anonymous Vents | Venting.in",
    description: "Read, connect, and share empathy with anonymous thoughts and vents shared by community members.",
    url: "https://venting.in/feed",
    siteName: "Venting.in",
    images: [
      {
        url: "https://venting.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Venting.in Community Feed",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Feed & Anonymous Vents | Venting.in",
    description: "Read, connect, and share empathy with anonymous thoughts and vents shared by community members.",
    images: ["https://venting.in/og-image.png"],
    creator: "@venting_in",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4 md:p-8">Loading feed...</div>}>
        <PublicFeed />
    </Suspense>
  );
}
