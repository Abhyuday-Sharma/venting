import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, Clock } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GUIDES, readingMinutes } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides on Venting, Journaling & Everyday Stress",
  description:
    "Practical, plain-language guides on venting, journaling, and handling everyday stress, written by the Venting team.",
  alternates: {
    canonical: "https://venting.in/guides",
  },
  openGraph: {
    title: "Guides on Venting, Journaling & Everyday Stress | Venting.in",
    description: "Practical, plain-language guides on venting, journaling, and handling everyday stress.",
    url: "https://venting.in/guides",
    siteName: "Venting.in",
    images: [{ url: "https://venting.in/og-image.png", width: 1200, height: 630, alt: "Venting Guides" }],
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const dateFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default function GuidesIndexPage() {
  const guides = [...GUIDES].sort((a, b) => b.published.localeCompare(a.published));

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-headline">Guides</h1>
          <p className="text-muted-foreground">
            Short, practical reading on venting, journaling, and getting through stressful days. These guides are general
            information, not medical advice.
          </p>
        </header>
        <div className="space-y-4">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group block">
              <Card className="bg-card/60 backdrop-blur-md transition-colors group-hover:bg-card">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {guide.title}
                    <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </CardTitle>
                  <CardDescription className="text-sm">{guide.description}</CardDescription>
                  <p className="flex items-center gap-3 text-xs text-muted-foreground">
                    <time dateTime={guide.published}>{dateFormat.format(new Date(guide.published))}</time>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {readingMinutes(guide)} min read
                    </span>
                  </p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
