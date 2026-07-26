"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import anime from "animejs";

type TimelineFactory = (el: HTMLElement) => anime.AnimeInstance | anime.AnimeTimelineInstance;

/**
 * Triggers an animejs timeline once when the target element
 * scrolls into view (IntersectionObserver, threshold 0.2).
 */
export function useIntersectionAnimate<T extends HTMLElement = HTMLDivElement>(
  factory: TimelineFactory,
  options?: { threshold?: number; rootMargin?: string }
) {
  const ref = useRef<T>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const animationRef = useRef<anime.AnimeInstance | anime.AnimeTimelineInstance | null>(null);

  const stableFactory = useCallback(factory, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animationRef.current = stableFactory(el);
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      {
        threshold: options?.threshold ?? 0.15,
        rootMargin: options?.rootMargin ?? "0px",
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, [hasAnimated, stableFactory, options?.threshold, options?.rootMargin]);

  return { ref, hasAnimated };
}
