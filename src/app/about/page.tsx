
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
        <Button asChild variant="ghost" size="icon" className="mb-4">
            <Link href="/dashboard">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back to App</span>
            </Link>
        </Button>
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="items-center">
            <Image
                src="/ventingmain.png"
                alt="Venting Logo"
                width={727}
                height={213}
                priority
                className="w-40 h-auto mb-4 dark:invert"
            />
          <CardTitle className="text-3xl font-headline text-center">About the Venting Platform</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-foreground/90">
          
          <section>
            <h2 className="text-2xl font-bold font-headline mb-4">What is Venting?</h2>
            <p className="mb-4">
              Venting is the act of expressing one’s thoughts, emotions, or frustrations in a safe and non-judgmental space. It allows individuals to release emotional stress by putting their feelings into words, without fear of criticism or social pressure. Venting does not aim to provide solutions or professional advice; instead, it focuses on emotional expression and self-reflection, which can help users feel lighter, calmer, and more aware of their emotional state.
            </p>
            <p>
              A digital venting platform provides users with an environment where they can openly express emotions at any time. By associating vents with mood levels, users can better understand emotional patterns and changes over time. In some cases, sharing emotions publicly can also help individuals feel less alone by realizing that others relate to similar experiences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-4">About the Venting Platform</h2>
            <p className="mb-4">
              I created this platform from a personal need, a need for a quiet corner on the internet. Life can be demanding. School is hard, work is stressful, and the pressure to always be "on" can be exhausting. I found that in the middle of that pressure, the simple act of writing down my thoughts, without any intention of showing them to anyone, was a powerful way to untangle them. It created a moment of clarity.
            </p>
            <p className="mb-4">
              This platform is my attempt to build that quiet corner for everyone. It’s a secure, minimal, and emotionally safe web application designed to help you express your feelings, your way. You are in complete control. Your entries can be a private diary, visible only to you, where you can track your mood and reflect on your journey. Or, if you choose, you can share a thought publicly, either with your username or anonymously. The public feed is a place for shared human experience, a space to see that you aren’t alone in what you’re feeling, and to offer quiet support to others.
            </p>
            <p>
                The system prioritizes emotional safety, privacy, and simplicity. Social interactions are carefully designed to prevent judgment, harassment, or harmful behavior. This is not another social network chasing likes and trends; it is a tool for emotional support and self-reflection.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-4">Our Goal</h2>
            <p>
              The primary goal of this platform is to provide a calm, respectful, and judgment-free digital space where you can express your emotions openly and feel understood. By enabling both private reflection and optional public sharing, the platform aims to reduce the emotional burden of modern life and help users realize they are not alone in their experiences.
            </p>
            <p>
              It is crucial to remember that this platform is a tool for expression, <strong>not a replacement for professional mental health services.</strong> If you are in crisis, please seek help from a qualified professional.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline mb-4">Objectives of the Platform</h2>
            <ul className="space-y-6">
              <li>
                <h3 className="font-semibold text-lg">To provide a safe space for emotional expression</h3>
                <p className="text-muted-foreground">Enable users to vent their thoughts without fear of exposure, judgment, or ridicule, whether they choose to share privately or publicly.</p>
              </li>
              <li>
                <h3 className="font-semibold text-lg">To encourage empathy and emotional support</h3>
                <p className="text-muted-foreground">Allow users to view and respond to public vents in a supportive manner, helping individuals feel heard, understood, and less isolated.</p>
              </li>
              <li>
                <h3 className="font-semibold text-lg">To support emotional awareness</h3>
                <p className="text-muted-foreground">Allow users to associate each vent with a mood level, helping them recognize emotional patterns and changes over time.</p>
              </li>
              <li>
                <h3 className="font-semibold text-lg">To ensure user privacy and security</h3>
                <p className="text-muted-foreground">Protect user data through secure authentication, private data storage, and anonymity options, while giving users control over the visibility of their vents.</p>
              </li>
               <li>
                <h3 className="font-semibold text-lg">To promote mental clarity and self-reflection</h3>
                <p className="text-muted-foreground">Encourage users to reflect on their emotions by revisiting past vents and observing mood trends, both individually and through shared experiences.</p>
              </li>
              <li>
                <h3 className="font-semibold text-lg">To offer a simple and calming user experience</h3>
                <p className="text-muted-foreground">Design the platform with minimal visuals and distraction-free interaction to keep the focus on emotional expression and meaningful support.</p>
              </li>
              <li>
                <h3 className="font-semibold text-lg">To build a scalable and future-ready system</h3>
                <p className="text-muted-foreground">Structure the platform so advanced features such as emotion analysis, reminders, moderation tools, and emotional insights can be added in the future.</p>
              </li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
