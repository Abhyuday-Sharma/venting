import { LegalNotesText } from "@/components/auth/legal-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Notes & AI Disclosure",
  description: "Official legal notes, AI execution disclosures, intellectual property rights, and health disclaimers for Venting.in.",
  alternates: {
    canonical: "https://venting.in/legal/notes",
  },
  openGraph: {
    title: "Legal Notes & AI Disclosure | Venting.in",
    description: "Official legal notes, AI execution disclosures, intellectual property rights, and health disclaimers for Venting.in.",
    url: "https://venting.in/legal/notes",
    siteName: "Venting.in",
    images: [
      {
        url: "https://venting.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Venting Legal Notes",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Legal Notes & AI Disclosure | Venting.in",
    description: "Official legal notes, AI execution disclosures, intellectual property rights, and health disclaimers for Venting.in.",
    images: ["https://venting.in/og-image.png"],
    creator: "@venting_in",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LegalNotesPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Button asChild variant="ghost" size="icon" className="mb-4">
        <Link href="/dashboard">
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Back to App</span>
        </Link>
      </Button>
      <Card className="w-full max-w-4xl mx-auto shadow-lg bg-card/60 backdrop-blur-md border-white/10 dark:border-white/5">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Legal Notes & AI Disclosures</CardTitle>
          <CardDescription>
            Last Updated: July 2026
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LegalNotesText />
        </CardContent>
      </Card>
    </div>
  );
}
