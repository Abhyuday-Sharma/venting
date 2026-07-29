import { VentForm } from "@/components/vent/vent-form";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Express Yourself & Vent Anonymously",
  description: "Share your thoughts, feelings, and emotions safely and anonymously without fear of judgment on Venting.in.",
  alternates: {
    canonical: "https://venting.in/vent",
  },
  openGraph: {
    title: "Express Yourself & Vent Anonymously | Venting.in",
    description: "Share your thoughts, feelings, and emotions safely and anonymously without fear of judgment.",
    url: "https://venting.in/vent",
    siteName: "Venting.in",
    images: [
      {
        url: "https://venting.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vent Anonymously on Venting.in",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Express Yourself & Vent Anonymously | Venting.in",
    description: "Share your thoughts, feelings, and emotions safely and anonymously without fear of judgment.",
    images: ["https://venting.in/og-image.png"],
    creator: "@venting_in",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function VentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VentForm />
    </Suspense>
  );
}
