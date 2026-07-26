"use client";

import { useEffect, useRef, useCallback } from "react";
import anime from "animejs";
import { EASINGS, DURATIONS, triggerParticleBurst } from "@/lib/anime-presets";

/**
 * Hook to stagger-fade child elements (matching selector or default '.anime-item') into view
 */
export function useStaggerAnimate<T extends HTMLElement = HTMLDivElement>(
  selector: string = ".anime-item",
  options?: {
    delayStagger?: number;
    translateY?: [number, number];
    duration?: number;
    threshold?: number;
  }
) {
  const ref = useRef<T>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const targets = el.querySelectorAll(selector);
          if (targets.length > 0) {
            anime({
              targets,
              translateY: options?.translateY ?? [24, 0],
              opacity: [0, 1],
              scale: [0.97, 1],
              duration: options?.duration ?? DURATIONS.standard,
              delay: anime.stagger(options?.delayStagger ?? 80),
              easing: EASINGS.gentleBreath,
            });
          }
          observer.disconnect();
        }
      },
      { threshold: options?.threshold ?? 0.1 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [selector, options?.delayStagger, options?.translateY, options?.duration, options?.threshold]);

  return ref;
}

/**
 * Hook to animate a numeric count from start to target value
 */
export function useCounterAnimate(
  targetValue: number,
  options?: { duration?: number; round?: number; delay?: number }
) {
  const ref = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current || targetValue === undefined) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          anime({
            targets: el,
            innerHTML: [0, targetValue],
            round: options?.round ?? 1,
            duration: options?.duration ?? 1200,
            delay: options?.delay ?? 0,
            easing: EASINGS.smoothExpo,
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [targetValue, options?.duration, options?.round, options?.delay]);

  return ref;
}

/**
 * Hook for reaction button pop & particle burst effect
 */
export function useReactionBurst() {
  const triggerBurst = useCallback(
    (
      event: React.MouseEvent<HTMLElement>,
      reactionType: "heart" | "hug" | "sparkle"
    ) => {
      const target = event.currentTarget;

      // 1. Spring scale pop on the clicked button
      anime({
        targets: target,
        scale: [
          { value: 1.25, duration: 150, easing: EASINGS.springPop },
          { value: 1, duration: 250, easing: EASINGS.gentleBreath },
        ],
      });

      // 2. Spawn floating particle micro-emojis
      const iconMap = {
        heart: "❤️",
        hug: "🫂",
        sparkle: "✨",
      };
      const colorsMap = {
        heart: ["#f43f5e", "#rose-500", "#e11d48"],
        hug: ["#3b82f6", "#6366f1", "#8b5cf6"],
        sparkle: ["#f59e0b", "#eab308", "#d97706"],
      };

      triggerParticleBurst({
        element: target,
        icon: iconMap[reactionType],
        count: 7,
        colors: colorsMap[reactionType],
      });
    },
    []
  );

  return { triggerBurst };
}
