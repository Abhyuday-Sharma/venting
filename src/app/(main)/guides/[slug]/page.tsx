import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ChevronLeft, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/ads/ad-slot";
import { AD_SLOTS } from "@/lib/ads-config";
import { GUIDES, getGuide, readingMinutes, type GuideBlock } from "@/lib/guides";
import { SITE_URL } from "@/lib/site-config";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  const url = `${SITE_URL}/guides/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${guide.title} | Venting.in`,
      description: guide.description,
      url,
      siteName: "Venting.in",
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: guide.title }],
      type: "article",
      publishedTime: guide.published,
      modifiedTime: guide.updated ?? guide.published,
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.title} | Venting.in`,
      description: guide.description,
      images: [`${SITE_URL}/og-image.png`],
    },
    robots: { index: true, follow: true },
  };
}

const dateFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "h2":
      return <h2 className="text-2xl font-semibold font-headline text-foreground pt-4">{block.text}</h2>;
    case "ul":
      return (
        <ul className="list-disc pl-6 space-y-2">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "note":
      return (
        <div role="note" className="flex gap-3 rounded-lg border bg-muted/40 p-4 text-sm">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <p>{block.text}</p>
        </div>
      );
    default:
      return <p>{block.text}</p>;
  }
}

export default async function GuidePage({ params }: { params: Params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const related = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.published,
    dateModified: guide.updated ?? guide.published,
    author: { "@type": "Organization", name: "Venting.in", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Venting.in", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/guides/${guide.slug}`,
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="max-w-3xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
          <Link href="/guides">
            <ChevronLeft className="h-4 w-4 mr-1" />
            All guides
          </Link>
        </Button>
        <header className="mb-8 space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold font-headline leading-tight">{guide.title}</h1>
          <p className="text-lg text-muted-foreground">{guide.description}</p>
          <p className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>By the Venting team</span>
            <time dateTime={guide.updated ?? guide.published}>
              {guide.updated ? "Updated " : ""}
              {dateFormat.format(new Date(guide.updated ?? guide.published))}
            </time>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {readingMinutes(guide)} min read
            </span>
          </p>
        </header>

        <div className="space-y-5 text-foreground/85 leading-relaxed">
          {guide.body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        <AdSlot slot={AD_SLOTS.guideArticle} className="mt-10" />

        <aside className="mt-10 rounded-xl border bg-card/60 p-5 text-sm text-muted-foreground">
          <p>
            Want to try it? You can{" "}
            <Link href="/vent" className="underline hover:text-foreground">write a vent</Link> privately. No account is
            needed to start. Read more about how we handle your writing in our{" "}
            <Link href="/legal/privacy-policy" className="underline hover:text-foreground">Privacy Policy</Link>.
          </p>
        </aside>

        {related.length > 0 && (
          <nav aria-label="More guides" className="mt-10">
            <h2 className="text-lg font-semibold mb-3">More guides</h2>
            <ul className="space-y-2">
              {related.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guides/${g.slug}`} className="underline-offset-4 hover:underline">
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </article>
    </div>
  );
}
