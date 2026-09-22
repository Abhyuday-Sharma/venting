import { VentingShowcase } from "@/components/landing/venting-showcase";
import { Metadata } from "next";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata: Metadata = {
  title: "Discover Venting – Emotional Wellness & Growth Platform",
  description: "Explore Venting: a safe space for emotional expression, AI-powered growth tools, mood tracking, and a supportive anonymous community.",
  alternates: {
    // Same content as the landing page at "/", which is the canonical copy.
    canonical: "https://venting.in/",
  },
  openGraph: {
    title: "Discover Venting – Emotional Wellness & Growth Platform",
    description: "Explore Venting: a safe space for emotional expression, AI-powered growth tools, mood tracking, and a supportive anonymous community.",
    url: "https://venting.in/showcase",
    siteName: "Venting.in",
    images: [
      {
        url: "https://venting.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Venting Platform Showcase",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover Venting – Emotional Wellness & Growth Platform",
    description: "Explore Venting: a safe space for emotional expression, AI-powered growth tools, mood tracking, and a supportive anonymous community.",
    images: ["https://venting.in/og-image.png"],
    creator: "@venting_in",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ShowcasePage() {
  return (
    <>
      <VentingShowcase mode="pre-auth" />
      <PublicFooter />
    </>
  );
}
