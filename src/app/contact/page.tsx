import Link from "next/link";
import { Metadata } from "next";
import { ChevronLeft, Flag, HelpCircle, LifeBuoy, Mail, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicFooter } from "@/components/layout/public-footer";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact Venting",
  description: "How to reach the Venting team for support, content reports, privacy and data requests, or partnership questions.",
  alternates: {
    canonical: "https://venting.in/contact",
  },
  openGraph: {
    title: "Contact Venting | Venting.in",
    description: "How to reach the Venting team for support, content reports, privacy and data requests.",
    url: "https://venting.in/contact",
    siteName: "Venting.in",
    images: [{ url: "https://venting.in/og-image.png", width: 1200, height: 630, alt: "Contact Venting" }],
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const reasons = [
  {
    icon: HelpCircle,
    title: "General questions & support",
    body: "Trouble signing in, a bug, or a question about how something works. Tell us what device and browser you were using.",
    subject: "Support request",
  },
  {
    icon: Flag,
    title: "Report content",
    body: "If you've seen a vent or comment that breaks our Terms, signed-in users can use the flag icon on it. Anyone can also email us with a link to the post and a short description.",
    subject: "Content report",
  },
  {
    icon: Shield,
    title: "Privacy & data requests",
    body: "Ask what data we hold about you, request a correction, or raise a privacy concern. Please email from the address linked to your account.",
    subject: "Privacy request",
  },
  {
    icon: Mail,
    title: "Press, partnerships & advertising",
    body: "For anything else, including media and partnership enquiries.",
    subject: "General enquiry",
  },
];

export default function ContactPage() {
  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <Button asChild variant="ghost" size="icon" className="mb-4">
          <Link href="/">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to home</span>
          </Link>
        </Button>
        <div className="max-w-3xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold font-headline">Contact us</h1>
            <p className="text-muted-foreground">
              Venting is run by a small team. The quickest way to reach us is by email at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline font-medium text-foreground">
                {CONTACT_EMAIL}
              </a>
              . We read every message and usually reply within a few working days.
            </p>
          </header>

          <Card className="border-amber-300/50 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-800/50">
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <LifeBuoy className="h-5 w-5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <div className="space-y-1">
                <CardTitle className="text-base">If you are in crisis</CardTitle>
                <CardDescription className="text-foreground/80">
                  Email is not monitored around the clock and is not an emergency service. If you are in danger or
                  thinking about harming yourself, contact your local emergency services or a crisis line in your
                  country right away.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {reasons.map(({ icon: Icon, title, body, subject }) => (
              <Card key={title} className="bg-card/60 backdrop-blur-md">
                <CardHeader className="space-y-2">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription>{body}</CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Email about this
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <Trash2 className="h-5 w-5 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <div className="space-y-1">
                <CardTitle className="text-base">Deleting your account</CardTitle>
                <CardDescription>
                  You can delete your account and data yourself from the{" "}
                  <Link href="/account-deletion" className="underline">Account Deletion</Link> page.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <section className="space-y-2 text-sm text-muted-foreground">
            <h2 className="text-base font-semibold text-foreground">Elsewhere</h2>
            <p>
              We also post updates on{" "}
              <a href={SOCIAL_LINKS.x} target="_blank" rel="noopener noreferrer" className="underline">X</a> and{" "}
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="underline">Instagram</a>.
              Please don&apos;t share personal details or report content through social media. Email keeps it private.
            </p>
            <p>
              See also our <Link href="/legal/privacy-policy" className="underline">Privacy Policy</Link> and{" "}
              <Link href="/legal/terms-of-service" className="underline">Terms of Service</Link>.
            </p>
          </section>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
