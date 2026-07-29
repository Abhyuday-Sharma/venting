import { VentingShowcase } from "@/components/landing/venting-showcase";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Venting – Safe Anonymous Emotional Wellness Space",
  description: "Learn about our mission to provide a private, empathetic, and judgment-free platform for emotional healing, mood tracking, and self-expression.",
  alternates: {
    canonical: "https://venting.in/about",
  },
  openGraph: {
    title: "About Venting – Safe Anonymous Emotional Wellness Space",
    description: "Learn about our mission to provide a private, empathetic, and judgment-free platform for emotional healing, mood tracking, and self-expression.",
    url: "https://venting.in/about",
    siteName: "Venting.in",
    images: [
      {
        url: "https://venting.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "About Venting.in",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Venting – Safe Anonymous Emotional Wellness Space",
    description: "Learn about our mission to provide a private, empathetic, and judgment-free platform for emotional healing, mood tracking, and self-expression.",
    images: ["https://venting.in/og-image.png"],
    creator: "@venting_in",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <div>
      <div className="container mx-auto px-4 pt-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to App</span>
          </Link>
        </Button>
      </div>
      <VentingShowcase mode="post-auth" />
    </div>
  );
}
