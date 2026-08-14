
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
  Sparkles,
  Lightbulb,
  Target,
  ShieldCheck,
  TrendingUp,
  BookHeart,
  CalendarCheck,
  Eye,
} from "lucide-react";
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
              <Mic className="h-3.5 w-3.5" /> Voice input
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
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> AI empathy
              nudges
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
              src="/showcase-feed.png"
              alt="Venting community feed showing anonymous posts with hearts and hugs reactions"
              width={380}
              height={300}
              className="showcase-mockup-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================================================================== */
/*  Section 5 – AI-Powered Growth Tools                                   */
/* ===================================================================== */
function AIToolsSection() {
  const { ref, visible } = useOnScreen(0.12);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!visible || hasAnimated.current || !ref.current) return;
    hasAnimated.current = true;
    const el = ref.current;

    anime.timeline({ easing: "easeOutCubic" }).add({
      targets: el.querySelector(".ai-heading"),
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 800,
    }).add({
      targets: el.querySelector(".ai-pulse"),
      scale: [0.5, 1],
      opacity: [0, 1],
      duration: 700,
      easing: "easeOutElastic(1, .5)",
    }, "-=500").add({
      targets: el.querySelectorAll(".showcase-ai-card"),
      translateY: [30, 0],
      scale: [0.95, 1],
      opacity: [0, 1],
      duration: 700,
      delay: anime.stagger(120),
    }, "-=300");

    // Perpetual pulse on brain icon
    anime({
      targets: el.querySelector(".ai-pulse"),
      scale: [1, 1.08],
      duration: 2000,
      easing: "easeInOutSine",
      direction: "alternate",
      loop: true,
    });
  }, [visible, ref]);

  const cards = [
    {
      icon: "🧠",
      title: "Mood Insights",
      desc: "AI analyzes your venting patterns and summarizes emotional trends after 3+ entries.",
      lucide: <BrainCircuit className="h-5 w-5 text-violet-500" />,
    },
    {
      icon: "💡",
      title: "Reflection Prompts",
      desc: "Personalized journaling questions based on what you wrote, helping you dig deeper.",
      lucide: <Lightbulb className="h-5 w-5 text-amber-500" />,
    },
    {
      icon: "🎯",
      title: "Micro Action Items",
      desc: "Small, achievable steps based on what you wrote. Tiny moves that actually help you feel better.",
      lucide: <Target className="h-5 w-5 text-teal-500" />,
    },
    {
      icon: "🛡️",
      title: "Safety Moderation",
      desc: "AI monitors public content to catch harmful patterns and offers support resources when needed.",
      lucide: <ShieldCheck className="h-5 w-5 text-rose-500" />,
    },
  ];

  return (
    <section ref={ref} className="showcase-section">
      <div className="text-center mb-12">
        <div className="ai-pulse inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 mb-6">
          <Sparkles className="h-8 w-8 text-violet-500" />
        </div>
        <div className="ai-heading">
          <div className="showcase-divider" />
          <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-3">
            AI that{" "}
            <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
              cares
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
            Venting uses AI quietly in the background. It&apos;s never intrusive, always
            supportive. It helps you reflect, grow, and stay safe.
          </p>
        </div>
      </div>

      <div className="showcase-ai-grid">
        {cards.map((card) => (
          <div key={card.title} className="showcase-ai-card">
            <span className="showcase-ai-card__icon">{card.icon}</span>
            <h3 className="showcase-ai-card__title">{card.title}</h3>
            <p className="showcase-ai-card__desc">{card.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ===================================================================== */
/*  Section 6 – Mood Tracking & Moments                                   */
/* ===================================================================== */
function MoodTrackingSection() {
  const { ref, visible } = useOnScreen(0.15);
  const hasAnimated = useRef(false);

  // Chart data points (normalized 0-1 for SVG)
  const points = [
    { x: 40, y: 130 },
    { x: 100, y: 100 },
    { x: 160, y: 120 },
    { x: 220, y: 70 },
    { x: 280, y: 90 },
    { x: 340, y: 50 },
    { x: 400, y: 35 },
  ];
  const pathD = `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`;
  const areaD = `${pathD} L ${points[points.length - 1].x},160 L ${points[0].x},160 Z`;

  useEffect(() => {
    if (!visible || hasAnimated.current || !ref.current) return;
    hasAnimated.current = true;
    const el = ref.current;

    // Get stroke length for draw animation
    const path = el.querySelector(".showcase-chart-line") as SVGPathElement;
    if (path) {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;

      anime
        .timeline({ easing: "easeOutCubic" })
        .add({
          targets: el.querySelector(".showcase-feature-text"),
          translateX: [-40, 0],
          opacity: [0, 1],
          duration: 900,
        })
        .add(
          {
            targets: el.querySelector(".showcase-feature-visual"),
            translateX: [40, 0],
            opacity: [0, 1],
            duration: 900,
          },
          "-=600"
        )
        .add(
          {
            targets: path,
            strokeDashoffset: [length, 0],
            duration: 1500,
            easing: "easeInOutSine",
          },
          "-=400"
        )
        .add(
          {
            targets: el.querySelector(".showcase-chart-area"),
            opacity: [0, 0.3],
            duration: 800,
          },
          "-=800"
        )
        .add(
          {
            targets: el.querySelectorAll(".showcase-chart-dot"),
            opacity: [0, 1],
            scale: [0, 1],
            duration: 400,
            delay: anime.stagger(100),
            easing: "easeOutElastic(1, .6)",
          },
          "-=600"
        )
        .add(
          {
            targets: el.querySelectorAll(".showcase-pill"),
            translateY: [12, 0],
            opacity: [0, 1],
            duration: 600,
            delay: anime.stagger(100),
          },
          "-=400"
        );
    }
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
            Track your mood over time with daily check-ins. Revisit your
            journey, spot patterns, and celebrate your bright spots. Those
            moments where things got a little better.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="showcase-pill">
              <CalendarCheck className="h-3.5 w-3.5" /> Daily check-ins
            </span>
            <span className="showcase-pill">
              <TrendingUp className="h-3.5 w-3.5 text-teal-500" /> Visual mood
              history
            </span>
            <span className="showcase-pill">
              <BookHeart className="h-3.5 w-3.5 text-rose-500" /> Bright Spots
              journal
            </span>
          </div>
        </div>

        <div className="showcase-feature-visual">
          <div className="w-full max-w-[440px]">
            {/* Animated SVG chart */}
            <svg
              viewBox="0 0 440 180"
              className="w-full h-auto mb-4"
              aria-label="Animated mood chart showing an upward trend"
            >
              <defs>
                <linearGradient
                  id="chart-gradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="hsl(172, 56%, 50%)"
                    stopOpacity="0.4"
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(172, 56%, 50%)"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              <path d={areaD} className="showcase-chart-area" />
              <path d={pathD} className="showcase-chart-line" />
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  className="showcase-chart-dot"
                />
              ))}
            </svg>

            <Image
              src="/showcase-dashboard.png"
              alt="Venting dashboard showing mood charts and vent history"
              width={380}
              height={300}
              className="showcase-mockup-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================================================================== */
/*  Section 7 – CTA                                                       */
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
      <AIToolsSection />
      <MoodTrackingSection />
      <CTASection mode={mode} />
    </div>
  );
}
