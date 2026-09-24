import { VentingShowcase } from "@/components/landing/venting-showcase";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { PublicFooter } from "@/components/layout/public-footer";

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
    siteName: "Venting",
    images: [
      {
        url: "https://venting.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "About Venting",
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
          <Link href="/">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to home</span>
          </Link>
        </Button>
      </div>
      <section aria-labelledby="about-heading" className="container mx-auto px-4 md:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-6 text-foreground/80 leading-relaxed">
          <h1 id="about-heading" className="text-3xl md:text-4xl font-bold font-headline text-foreground">About Venting</h1>
          <p>
            Venting is a place to write down what you are feeling. That might be a hard day at work,
            a relationship that is weighing on you, or something you have not said out loud. You can keep a vent private, share it
            with the community, or post it anonymously. You can also write as a guest without an account; guest vents
            stay on your own device.
          </p>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">How the community is kept safe</h2>
            <p>
              Public vents and comments pass through automated safety checks when they are posted. Anyone signed in can
              report a post, and reports are reviewed by our moderators. Posts that show signs of serious distress may
              have interactions limited or be held back, and the author may be shown support information. Harassment and content that
              encourages self-harm are not allowed. The full rules are in our{" "}
              <Link href="/legal/terms-of-service" className="underline hover:text-foreground">Terms of Service</Link>.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">What Venting is not</h2>
            <p>
              Venting is a self-help tool, not a medical or mental-health service. It does not diagnose, treat, or offer
              emergency help. If you are in danger or thinking about harming yourself, contact your local emergency
              services or a crisis line in your country.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Your privacy</h2>
            <p>
              Private vents are never shown publicly. We never use your vents, mood logs, or AI safety results to
              target ads. Our{" "}
              <Link href="/legal/privacy-policy" className="underline hover:text-foreground">Privacy Policy</Link> explains
              what we collect and why. Questions? <Link href="/contact" className="underline hover:text-foreground">Contact us</Link>.
            </p>
          </div>
        </div>
      </section>
      <VentingShowcase mode="post-auth" />
      <PublicFooter />
    </div>
  );
}
