
"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Heart,
  HeartHandshake,
  Shield,
  Flame,
  Mic,
  BarChart3,
  BrainCircuit,
  Lightbulb,
  Target,
  ShieldCheck,
  TrendingUp,
  BookHeart,
  CalendarCheck,
  Eye,
  EyeOff,
  Timer,
  Phone,
  Bell,
  Smartphone,
  UserRound,
  MessageSquarePlus,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "./venting-showcase.css";

interface VentingShowcaseProps {
  mode: "pre-auth" | "post-auth";
}

/* ─── Reusable intersection hook (inline, keeps file self-contained) ──── */
function useOnScreen(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ─── Slide a feature row's text and visual in, then its pills ──── */
function animateFeatureRow(el: HTMLElement, reverse = false) {
  const from = reverse ? 40 : -40;
  anime.timeline({ easing: "easeOutCubic" }).add({
    targets: el.querySelector(".showcase-feature-text"),
    translateX: [from, 0],
    opacity: [0, 1],
    duration: 900,
  }).add({
    targets: el.querySelector(".showcase-feature-visual"),
    translateX: [-from, 0],
    opacity: [0, 1],
    duration: 900,
  }, "-=600").add({
    targets: el.querySelectorAll(".showcase-pill"),
    translateY: [12, 0],
    opacity: [0, 1],
    duration: 600,
    delay: anime.stagger(100),
  }, "-=400");
}

/* ─── Real app screenshot (from Sam's demo account) that follows the site theme ──── */
interface ThemedShotProps {
  /** Base name in /public/showcase: `${name}-light.webp` and `${name}-dark.webp`. */
  name: string;
  alt: string;
  width: number;
  height: number;
  /** Show only the top part of the shot, as a fraction of its height, fading out. */
  crop?: number;
  className?: string;
}

function ThemedShot({ name, alt, width, height, crop, className }: ThemedShotProps) {
  return (
    <div
      className={cn("showcase-shot", crop && "showcase-shot--crop", className)}
      style={crop ? { aspectRatio: `${width} / ${Math.round(height * crop)}` } : undefined}
    >
      {(["light", "dark"] as const).map((theme) => (
        <Image
          key={theme}
          src={`/showcase/${name}-${theme}.webp`}
          alt={alt}
          width={width}
          height={height}
          sizes="(min-width: 768px) 380px, 90vw"
          className={cn("w-full h-auto", theme === "light" ? "block dark:hidden" : "hidden dark:block")}
        />
      ))}
    </div>
  );
}

/* ===================================================================== */
/*  Section 1 – Hero                                                      */
/* ===================================================================== */
function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || !sectionRef.current) return;
    hasAnimated.current = true;

    const tl = anime.timeline({ easing: "easeOutExpo" });

    tl.add({
      targets: sectionRef.current.querySelectorAll(".hero-word"),
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 1000,
      delay: anime.stagger(180),
    })
      .add(
        {
          targets: sectionRef.current.querySelector(".hero-subtitle"),
          translateY: [25, 0],
          opacity: [0, 1],
          duration: 900,
        },
        "-=500"
      )
      .add(
        {
          targets: sectionRef.current.querySelector(".hero-scroll-hint"),
          opacity: [0, 0.6],
          duration: 800,
        },
        "-=400"
      )
      .add(
        {
          targets: sectionRef.current.querySelectorAll(".showcase-orb"),
          opacity: [0, 0.18],
          scale: [0.6, 1],
          duration: 2000,
          delay: anime.stagger(300),
          easing: "easeOutSine",
        },
        "-=1200"
      );

    // Float orbs perpetually
    anime({
      targets: sectionRef.current.querySelectorAll(".showcase-orb"),
      translateX: () => anime.random(-30, 30),
      translateY: () => anime.random(-30, 30),
      duration: () => anime.random(4000, 7000),
      easing: "easeInOutSine",
      direction: "alternate",
      loop: true,
    });
  }, []);

  return (
    <section ref={sectionRef} className="showcase-section showcase-hero">
      {/* Ambient orbs */}
      <div
        className="showcase-orb showcase-orb--indigo"
        style={{ top: "10%", left: "-5%" }}
      />
      <div
        className="showcase-orb showcase-orb--violet"
        style={{ top: "60%", right: "-8%" }}
      />
      <div
        className="showcase-orb showcase-orb--teal"
        style={{ bottom: "5%", left: "30%" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        <Image
          src="/ventingmain.png"
          alt="Venting Logo"
          width={727}
          height={213}
          priority
          className="w-44 sm:w-56 h-auto mx-auto mb-8 dark:invert opacity-0 hero-word"
        />
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-headline font-extrabold leading-tight mb-6">
          <span className="hero-word">Express.</span>{" "}
          <span className="hero-word">Release.</span>{" "}
          <span className="hero-word bg-gradient-to-r from-[hsl(238,76%,67%)] to-[hsl(270,67%,60%)] bg-clip-text text-transparent">
            Grow.
          </span>
        </h1>
        <p className="hero-subtitle text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
          A safe space for emotional expression, self-reflection, and community
          support. This is more than just venting. It&apos;s a platform built for growth.
        </p>
      </div>

      <div className="hero-scroll-hint">
        <ChevronDown className="h-6 w-6 text-muted-foreground animate-bounce" />
      </div>
    </section>
  );
}

/* ===================================================================== */
/*  Section 2 – The Problem (Stats)                                       */
/* ===================================================================== */
function StatsSection() {
  const { ref, visible } = useOnScreen(0.2);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!visible || hasAnimated.current || !ref.current) return;
    hasAnimated.current = true;

    const el = ref.current;

    anime
      .timeline({ easing: "easeOutExpo" })
      .add({
        targets: el.querySelectorAll(".showcase-stat"),
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 900,
        delay: anime.stagger(200),
      })
      .add(
        {
          targets: el.querySelector(".stat-counter"),
          innerHTML: [0, 75],
          round: 1,
          duration: 2000,
          easing: "easeInOutExpo",
        },
        "-=800"
      )
      .add(
        {
          targets: el.querySelector(".stat-counter-2"),
          innerHTML: [0, 1],
          round: 1,
          duration: 1400,
          easing: "easeInOutExpo",
        },
        "-=1800"
      );
  }, [visible, ref]);

  return (
    <section ref={ref} className="showcase-section">
      <div className="max-w-3xl mx-auto text-center space-y-12">
        <div className="showcase-stat">
          <div className="showcase-divider" />
          <h2 className="text-2xl sm:text-3xl font-headline font-bold mb-4">
            Emotions don&apos;t come with an outlet
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
            In a world that demands we always be &quot;on,&quot; the simple act
            of putting feelings into words creates a moment of clarity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-16">
          <div className="showcase-stat text-center">
            <p className="showcase-stat__number">
              <span className="stat-counter">0</span>%
            </p>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              of people struggle to express
              <br />
              emotions openly
            </p>
          </div>
          <div className="showcase-stat text-center">
            <p className="showcase-stat__number">
              <span className="stat-counter-2">0</span> in 4
            </p>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              have no one to talk to about
              <br />
              their feelings
            </p>
          </div>
        </div>

        <div className="showcase-stat">
          <p className="text-muted-foreground text-base max-w-md mx-auto italic">
            &quot;I created this platform from a personal need. I just wanted
            a quiet corner on the internet.&quot;
          </p>
        </div>
      </div>
    </section>
  );
}

/* ===================================================================== */
/*  Section 3 – Private Venting & Burn Mode                               */
/* ===================================================================== */
function VentingFeatureSection() {
  const { ref, visible } = useOnScreen(0.15);
  const hasAnimated = useRef(false);
  const [typedText, setTypedText] = useState("");
  const [showBurn, setShowBurn] = useState(false);

  const fullText =
    "Today was overwhelming. I just need to let this out and move on...";

  useEffect(() => {
    if (!visible || hasAnimated.current || !ref.current) return;
    hasAnimated.current = true;
    const el = ref.current;

    // Animate text & visual in
    anime.timeline({ easing: "easeOutCubic" }).add({
      targets: el.querySelector(".showcase-feature-text"),
      translateX: [-40, 0],
      opacity: [0, 1],
      duration: 900,
    }).add({
      targets: el.querySelector(".showcase-feature-visual"),
      translateX: [40, 0],
      opacity: [0, 1],
      duration: 900,
    }, "-=600").add({
      targets: el.querySelectorAll(".showcase-pill"),
      translateY: [12, 0],
      opacity: [0, 1],
      duration: 600,
      delay: anime.stagger(100),
    }, "-=400");

    // Typewriter effect
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        // After typing, show burn animation
        setTimeout(() => setShowBurn(true), 1200);
        setTimeout(() => {
          setShowBurn(false);
          setTypedText("");
        }, 3500);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [visible, ref]);

  return (
    <section ref={ref} className="showcase-section">
      <div className="showcase-feature-row">
        <div className="showcase-feature-text">
          <div className="showcase-divider" style={{ margin: "0 0 1.5rem 0" }} />
          <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-4">
            Write it down.
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Let it go.
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-6 leading-relaxed">
            Everything you write is private by default. Let go of your thoughts
            without judgment. Or use{" "}
            <strong className="text-orange-500">Burn &amp; Release Mode</strong>{" "}
            to write something down and destroy it permanently. Nothing saved,
            nothing stored.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="showcase-pill">
              <Shield className="h-3.5 w-3.5" /> Private by default
            </span>
            <span className="showcase-pill">
              <Flame className="h-3.5 w-3.5 text-orange-500" /> Burn &amp;
              Release
            </span>
            <span className="showcase-pill">
              <Mic className="h-3.5 w-3.5" /> Voice input (Hindi too)
            </span>
            <span className="showcase-pill">
              <Timer className="h-3.5 w-3.5" /> Self-destruct posts
            </span>
            <span className="showcase-pill">
              <BarChart3 className="h-3.5 w-3.5" /> Mood tracking
            </span>
          </div>
        </div>

        <div className="showcase-feature-visual">
          <div
            className={`showcase-mock-card transition-all duration-700 ${
              showBurn
                ? "scale-95 opacity-0 blur-sm rotate-1 translate-y-[-20px]"
                : ""
            }`}
            style={
              showBurn
                ? {
                    boxShadow:
                      "0 0 40px 10px rgba(239,68,68,0.3), 0 0 80px 20px rgba(245,158,11,0.15)",
                  }
                : {}
            }
          >
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-semibold text-orange-500">
                Burn &amp; Release Mode
              </span>
            </div>
            <div className="min-h-[100px] text-sm text-foreground/80 leading-relaxed">
              {typedText}
              {typedText.length < fullText.length && !showBurn && (
                <span className="showcase-cursor" />
              )}
            </div>
            {typedText.length > 0 && !showBurn && (
              <div className="mt-4 flex justify-end">
                <div className="px-3 py-1.5 rounded-md bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-medium flex items-center gap-1">
                  <Flame className="h-3 w-3" /> Release &amp; Burn
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================================================================== */
/*  Section 4 – Supportive Community                                      */
/* ===================================================================== */
function CommunitySection() {
  const { ref, visible } = useOnScreen(0.15);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!visible || hasAnimated.current || !ref.current) return;
    hasAnimated.current = true;
    const el = ref.current;

    anime.timeline({ easing: "easeOutCubic" }).add({
      targets: el.querySelector(".showcase-feature-text"),
      translateX: [40, 0],
      opacity: [0, 1],
      duration: 900,
    }).add({
      targets: el.querySelector(".showcase-feature-visual"),
      translateX: [-40, 0],
      opacity: [0, 1],
      duration: 900,
    }, "-=600").add({
      targets: el.querySelectorAll(".showcase-reaction"),
      scale: [0, 1],
      opacity: [0, 1],
      duration: 500,
      delay: anime.stagger(150),
      easing: "easeOutElastic(1, .6)",
    }, "-=300").add({
      targets: el.querySelectorAll(".showcase-pill"),
      translateY: [12, 0],
      opacity: [0, 1],
      duration: 600,
      delay: anime.stagger(100),
    }, "-=400");
  }, [visible, ref]);

  return (
    <section ref={ref} className="showcase-section">
      <div className="showcase-feature-row showcase-feature-row--reverse">
        <div className="showcase-feature-text">
          <div className="showcase-divider" style={{ margin: "0 0 1.5rem 0" }} />
          <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-4">
            You are{" "}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              not alone.
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-6 leading-relaxed">
            When you&apos;re ready, share your thoughts with a community built
            on empathy. Post anonymously, receive hearts &amp; hugs, and read
            comments designed to support, never to judge.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="showcase-pill">
              <Eye className="h-3.5 w-3.5" /> Share anonymously
            </span>
            <span className="showcase-pill">
              <Heart className="h-3.5 w-3.5 text-rose-500" /> Hearts &amp; Hugs
            </span>
            <span className="showcase-pill">
              <HeartHandshake className="h-3.5 w-3.5" /> Empathy-first comments
            </span>
            <span className="showcase-pill">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Safety checks on every comment
            </span>
          </div>
        </div>

        <div className="showcase-feature-visual">
          <div className="space-y-3 w-full max-w-[380px]">
            {/* Mock feed card */}
            <div className="showcase-mock-card">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                  SB
                </div>
                <div>
                  <p className="text-sm font-semibold">Silent Breeze</p>
                  <p className="text-[10px] text-muted-foreground">
                    Anonymous • 2h ago
                  </p>
                </div>
              </div>
              <p className="text-sm text-foreground/80 mb-3 leading-relaxed">
                Some days are just heavy, and that&apos;s okay. I&apos;m
                learning that rest is not giving up.
              </p>
              <div className="flex gap-2">
                <span className="showcase-reaction">
                  <Heart className="h-3 w-3 text-rose-500" /> 12
                </span>
                <span className="showcase-reaction">
                  <HeartHandshake className="h-3 w-3 text-amber-500" /> 8
                </span>
              </div>
            </div>

            <Image
              src="/ventingpublic.jpeg"
              alt="Venting community feed showing anonymous posts with hearts and hugs reactions"
              width={600}
              height={303}
              className="showcase-mockup-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================================================================== */
/*  Section 5 – Venting grows with you (the returning-user journey)       */
/* ===================================================================== */
const journeySteps = [
  {
    when: "Day 1",
    icon: Lightbulb,
    title: "Vent, then reflect.",
    desc: "Right after you write, a couple of gentle prompts help you look at what you shared from a kinder angle. No rush, no pressure.",
    shot: { name: "reflection", width: 856, height: 1200, crop: 0.6, alt: "Reflection card with a short acknowledgement and two gentle journaling prompts" },
  },
  {
    when: "When you come back",
    icon: Target,
    title: "Small steps you can actually take.",
    desc: "Once you've written on more than one day, each reflection can end with a 5-minute micro-goal. Pin it to your dashboard and tick it off when it's done.",
    shot: { name: "goals", width: 856, height: 680, alt: "Dashboard checklist of three 5-minute micro-goals, one of them ticked off" },
  },
  {
    when: "Every week",
    icon: BrainCircuit,
    title: "See your week in perspective.",
    desc: "With a few entries across different days, ask for weekly insights: what tends to weigh on you, the strengths you're already using, and a gentle reframe. It refreshes once a week, only when you ask.",
    shot: { name: "insights", width: 856, height: 1896, crop: 0.76, alt: "Weekly AI mood insights with a summary, potential triggers and personal strengths" },
  },
];

function JourneySection() {
  const { ref, visible } = useOnScreen(0.08);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!visible || hasAnimated.current || !ref.current) return;
    hasAnimated.current = true;
    const el = ref.current;

    anime.timeline({ easing: "easeOutCubic" }).add({
      targets: el.querySelector(".journey-heading"),
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 800,
    }).add({
      targets: el.querySelectorAll(".showcase-journey-step"),
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 900,
      delay: anime.stagger(250),
    }, "-=300");
  }, [visible, ref]);

  return (
    <section ref={ref} className="showcase-section">
      <div className="journey-heading text-center mb-16 opacity-0">
        <div className="showcase-divider" />
        <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-3">
          Venting{" "}
          <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
            grows with you.
          </span>
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
          Start with a single vent. Keep coming back, and Venting helps you turn
          heavy days into small, steady steps.
        </p>
      </div>

      <ol className="showcase-journey">
        {journeySteps.map((step, i) => {
          const Icon = step.icon;
          return (
            <li
              key={step.when}
              className={cn("showcase-journey-step", i % 2 === 1 && "showcase-journey-step--reverse")}
            >
              <div className="showcase-journey-text">
                <span className="showcase-journey-badge">
                  <Icon className="h-3.5 w-3.5" /> {step.when}
                </span>
                <h3 className="text-2xl sm:text-3xl font-headline font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{step.desc}</p>
              </div>
              <div className="showcase-journey-visual">
                <ThemedShot {...step.shot} />
              </div>
            </li>
          );
        })}
      </ol>

      <p className="text-xs text-muted-foreground/70 text-center mt-14">
        AI-generated reflections · Not clinical advice
      </p>
    </section>
  );
}

/* ===================================================================== */
/*  Section 6 – Mood Tracking                                             */
/* ===================================================================== */
function MoodTrackingSection() {
  const { ref, visible } = useOnScreen(0.15);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!visible || hasAnimated.current || !ref.current) return;
    hasAnimated.current = true;
    animateFeatureRow(ref.current);
  }, [visible, ref]);

  return (
    <section ref={ref} className="showcase-section">
      <div className="showcase-feature-row">
        <div className="showcase-feature-text">
          <div className="showcase-divider" style={{ margin: "0 0 1.5rem 0" }} />
          <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-4">
            Watch yourself{" "}
            <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              grow.
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-6 leading-relaxed">
            Log how you feel in one tap each day, then zoom out by day, week,
            or month to see the shape of it. The dips are part of it. So is the
            climb.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="showcase-pill">
              <CalendarCheck className="h-3.5 w-3.5" /> One-tap daily check-ins
            </span>
            <span className="showcase-pill">
              <TrendingUp className="h-3.5 w-3.5 text-teal-500" /> Day, week &amp; month views
            </span>
          </div>
        </div>

        <div className="showcase-feature-visual">
          <div className="showcase-shot-stack">
            <ThemedShot
              name="mood-chart"
              width={856}
              height={1086}
              alt="Monthly mood check-in chart trending upward over three weeks"
            />
            <ThemedShot
              name="checkin"
              width={920}
              height={972}
              alt="Daily check-in asking 'How are you today, Sam?' with seven mood options"
              className="showcase-shot-stack__overlay"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================================================================== */
/*  Section 7 – Bright Spots                                              */
/* ===================================================================== */
function BrightSpotsSection() {
  const { ref, visible } = useOnScreen(0.15);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!visible || hasAnimated.current || !ref.current) return;
    hasAnimated.current = true;
    animateFeatureRow(ref.current, true);
  }, [visible, ref]);

  return (
    <section ref={ref} className="showcase-section">
      <div className="showcase-feature-row showcase-feature-row--reverse">
        <div className="showcase-feature-text">
          <div className="showcase-divider" style={{ margin: "0 0 1.5rem 0" }} />
          <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-4">
            Keep the{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              good bits.
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-6 leading-relaxed">
            Save your Bright Spots: a small win, a moment of relief, something
            you&apos;re grateful for. On a hard day, they&apos;re proof that
            better days happen.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="showcase-pill">
              <BookHeart className="h-3.5 w-3.5 text-rose-500" /> Bright Spots journal
            </span>
            <span className="showcase-pill">
              <Shield className="h-3.5 w-3.5" /> Always private
            </span>
          </div>
        </div>

        <div className="showcase-feature-visual">
          <ThemedShot
            name="bright-spots"
            width={920}
            height={1496}
            crop={0.72}
            alt="A private journal of saved Bright Spots, such as a sister checking in and finishing a book"
          />
        </div>
      </div>
    </section>
  );
}

/* ===================================================================== */
/*  Section 8 – Support, whenever you need it                             */
/* ===================================================================== */
function SupportSection() {
  const { ref, visible } = useOnScreen(0.15);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!visible || hasAnimated.current || !ref.current) return;
    hasAnimated.current = true;
    animateFeatureRow(ref.current);
  }, [visible, ref]);

  return (
    <section ref={ref} className="showcase-section">
      <div className="showcase-feature-row">
        <div className="showcase-feature-text">
          <div className="showcase-divider" style={{ margin: "0 0 1.5rem 0" }} />
          <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-4">
            Support,{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              whenever you need it.
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-6 leading-relaxed">
            Venting is a place to let things out, not a replacement for care.
            If something you write suggests you&apos;re struggling, Venting
            pauses and gently points you to free, confidential helplines first.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="showcase-pill">
              <Shield className="h-3.5 w-3.5" /> Private by default
            </span>
            <span className="showcase-pill">
              <Phone className="h-3.5 w-3.5 text-orange-500" /> Free, confidential helplines
            </span>
            <span className="showcase-pill">
              <EyeOff className="h-3.5 w-3.5" /> No ads where you vent
            </span>
          </div>
        </div>

        <div className="showcase-feature-visual">
          <ThemedShot
            name="support"
            width={876}
            height={1700}
            crop={0.58}
            alt="Support message pointing to free helplines and emergency numbers"
            className="showcase-shot--small"
          />
        </div>
      </div>
    </section>
  );
}

/* ===================================================================== */
/*  Section 9 – Also inside                                               */
/* ===================================================================== */
const alsoInside = [
  { icon: Smartphone, title: "Install it like an app", desc: "Add Venting to your home screen and open it in one tap." },
  { icon: Bell, title: "Notifications", desc: "Know when someone sends a heart, a hug or a comment on your post." },
  { icon: UserRound, title: "Try it as a guest", desc: "Write two private vents on your device before making an account." },
  { icon: MessageSquarePlus, title: "Shape what's next", desc: "Share feedback in the app and help decide what gets built next." },
];

function AlsoInsideSection() {
  const { ref, visible } = useOnScreen(0.12);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!visible || hasAnimated.current || !ref.current) return;
    hasAnimated.current = true;
    const el = ref.current;

    anime.timeline({ easing: "easeOutCubic" }).add({
      targets: el.querySelector(".also-heading"),
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 800,
    }).add({
      targets: el.querySelectorAll(".showcase-also-tile"),
      translateY: [24, 0],
      opacity: [0, 1],
      duration: 700,
      delay: anime.stagger(100),
    }, "-=400");
  }, [visible, ref]);

  return (
    <section ref={ref} className="showcase-section">
      <div className="also-heading text-center mb-12 opacity-0">
        <div className="showcase-divider" />
        <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-3">Also inside</h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
          The quieter things that make Venting easy to come back to.
        </p>
      </div>

      <div className="showcase-also-grid">
        <div className="showcase-also-tile showcase-also-tile--feature">
          <BookOpen className="h-5 w-5 text-indigo-500 mb-3" />
          <h3 className="font-bold text-lg mb-1">Guides</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            Short, practical reads on venting, journaling, and getting through
            stressful days.
          </p>
          <ThemedShot
            name="guides"
            width={920}
            height={1596}
            crop={0.5}
            alt="Guides page listing short reads such as 'Why Venting Can Feel Relieving'"
          />
        </div>
        {alsoInside.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="showcase-also-tile">
            <Icon className="h-5 w-5 text-violet-500 mb-3" />
            <h3 className="font-bold text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ===================================================================== */
/*  Section 10 – CTA                                                      */
/* ===================================================================== */
function CTASection({ mode }: { mode: "pre-auth" | "post-auth" }) {
  const { ref, visible } = useOnScreen(0.2);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!visible || hasAnimated.current || !ref.current) return;
    hasAnimated.current = true;
    const el = ref.current;

    anime
      .timeline({ easing: "easeOutCubic" })
      .add({
        targets: el.querySelector(".showcase-cta__heading"),
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 1000,
      })
      .add(
        {
          targets: el.querySelector(".showcase-cta__buttons"),
          translateY: [20, 0],
          opacity: [0, 1],
          duration: 800,
        },
        "-=500"
      );
  }, [visible, ref]);

  return (
    <section ref={ref} className="showcase-section showcase-cta">
      {/* Background orbs */}
      <div
        className="showcase-orb showcase-orb--violet"
        style={{ top: "20%", left: "10%", opacity: 0.1 }}
      />
      <div
        className="showcase-orb showcase-orb--teal"
        style={{ bottom: "20%", right: "10%", opacity: 0.1 }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="showcase-cta__heading">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold mb-4 leading-tight">
            Your feelings matter.
            <br />
            <span className="bg-gradient-to-r from-[hsl(238,76%,67%)] via-[hsl(270,67%,60%)] to-[hsl(172,56%,50%)] bg-clip-text text-transparent">
              Start your journey.
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto mb-8">
            This is a tool for emotional support and self-reflection.
            Not another social network. Your space, your pace.
          </p>
        </div>
        <div className="showcase-cta__buttons flex flex-col sm:flex-row items-center justify-center gap-3">
          {mode === "pre-auth" ? (
            <>
              <Button
                asChild
                size="lg"
                className="rounded-full px-10 py-6 text-base font-semibold shadow-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0 hover:scale-105 transition-transform"
              >
                <Link href="/login">Create Account</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-6 text-base"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          ) : (
            <Button
              asChild
              size="lg"
              className="rounded-full px-10 py-6 text-base font-semibold shadow-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0 hover:scale-105 transition-transform"
            >
              <Link href="/vent">Write Your First Vent</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ===================================================================== */
/*  Main Export                                                            */
/* ===================================================================== */
export function VentingShowcase({ mode }: VentingShowcaseProps) {
  return (
    <div className="showcase-root">
      <HeroSection />
      <StatsSection />
      <VentingFeatureSection />
      <CommunitySection />
      <JourneySection />
      <MoodTrackingSection />
      <BrightSpotsSection />
      <SupportSection />
      <AlsoInsideSection />
      <CTASection mode={mode} />
    </div>
  );
}
