import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, BookOpen, Info, Mail, MessageSquare, Scale, Shield } from "lucide-react";
import { VentingShowcase } from "@/components/landing/venting-showcase";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata: Metadata = {
  title: {
    absolute: "Venting – Anonymous Emotional Wellness & Safe Venting Space",
  },
  description:
    "Venting is a safe, anonymous space to write out what you feel, track your mood, and read supportive stories from a moderated community.",
  alternates: {
    canonical: "https://venting.in/",
  },
  openGraph: {
    title: "Venting – Anonymous Emotional Wellness & Safe Venting Space",
    description:
      "Write out what you feel, track your mood, and read supportive stories from a moderated community.",
    url: "https://venting.in/",
    siteName: "Venting.in",
    images: [{ url: "https://venting.in/og-image.png", width: 1200, height: 630, alt: "Venting.in" }],
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const exploreLinks = [
  { href: "/feed", label: "Community Feed", description: "Read vents the community has chosen to share.", icon: MessageSquare },
  { href: "/guides", label: "Guides", description: "Practical reading on stress, journaling and venting.", icon: BookOpen },
  { href: "/about", label: "About Venting", description: "What Venting is, and what it is not.", icon: Info },
  { href: "/contact", label: "Contact", description: "Questions, reports and data requests.", icon: Mail },
  { href: "/legal/privacy-policy", label: "Privacy Policy", description: "How your data, cookies and ads are handled.", icon: Shield },
  { href: "/legal/terms-of-service", label: "Terms of Service", description: "Community rules and moderation.", icon: Scale },
];

/**
 * Public landing page. Guests (and crawlers) get real content here instead of a
 * login wall; signed-in users are sent on to the feed by AuthProvider.
 */
export default function HomePage() {
  return (
    <>
      <main className="flex-1">
        <VentingShowcase mode="pre-auth" />
        <section aria-labelledby="explore-heading" className="container mx-auto px-4 md:px-8 py-12">
          <h2 id="explore-heading" className="text-2xl sm:text-3xl font-headline font-bold text-center mb-8">
            Explore Venting
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {exploreLinks.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-4 rounded-xl border bg-card/60 p-5 backdrop-blur-md transition-colors hover:bg-card"
              >
                <Icon className="h-5 w-5 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="flex items-center gap-1 font-semibold">
                    {label}
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </span>
                  <span className="block text-sm text-muted-foreground">{description}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter hasBottomNav={false} />
    </>
  );
}
