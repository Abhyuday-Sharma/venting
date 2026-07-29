import { PrivacyPolicyText } from "@/components/auth/legal-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy & Data Protection",
  description: "Read how Venting.in protects your personal data, guarantees zero AI model training, and enforces strict serverless privacy standards.",
  alternates: {
    canonical: "https://venting.in/legal/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy & Data Protection | Venting.in",
    description: "Read how Venting.in protects your personal data, guarantees zero AI model training, and enforces strict serverless privacy standards.",
    url: "https://venting.in/legal/privacy-policy",
    siteName: "Venting.in",
    images: [
      {
        url: "https://venting.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Venting Privacy Policy",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy & Data Protection | Venting.in",
    description: "Read how Venting.in protects your personal data, guarantees zero AI model training, and enforces strict serverless privacy standards.",
    images: ["https://venting.in/og-image.png"],
    creator: "@venting_in",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
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
          <CardTitle className="text-3xl font-headline">Privacy Policy</CardTitle>
          <CardDescription>
            Last Updated: July 2026 (Including AI Data Protection Guarantees)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrivacyPolicyText />
        </CardContent>
      </Card>
    </div>
  );
}
