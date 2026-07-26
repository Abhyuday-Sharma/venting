import anime from "animejs";

/**
 * Standardized Easing Curves & Motion Tokens for Venting App
 */
export const EASINGS = {
  gentleBreath: "cubicBezier(0.4, 0.0, 0.2, 1)",
  softElastic: "easeOutElastic(1, 0.6)",
  smoothExpo: "easeOutExpo",
  burnEmber: "cubicBezier(0.25, 1, 0.5, 1)",
  springPop: "easeOutBack",
};

export const DURATIONS = {
  fast: 300,
  standard: 600,
  slow: 900,
  cinematic: 1400,
  burn: 2800,
};

/**
 * Creates particle elements around a target element for burst effects
 */
export function triggerParticleBurst({
  element,
  icon = "❤️",
  count = 6,
  colors = ["#f43f5e", "#ec4899", "#a855f7"],
}: {
  element: HTMLElement;
  icon?: string;
  count?: number;
  colors?: string[];
}) {
  const rect = element.getBoundingClientRect();
  const container = document.body;

  const particleGroup: HTMLElement[] = [];

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "fixed pointer-events-none z-[9999] select-none text-sm font-semibold";
    el.innerText = icon;
    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top = `${rect.top + rect.height / 2}px`;
    el.style.color = colors[i % colors.length];
    container.appendChild(el);
    particleGroup.push(el);
  }

  anime({
    targets: particleGroup,
    translateX: () => anime.random(-45, 45),
    translateY: () => anime.random(-65, -25),
    scale: [
      { value: anime.random(0.8, 1.4), duration: 250 },
      { value: 0, duration: 400, delay: 200 },
    ],
    opacity: [
      { value: 1, duration: 150 },
      { value: 0, duration: 400, delay: 200 },
    ],
    rotate: () => anime.random(-35, 35),
    easing: EASINGS.softElastic,
    complete: () => {
      particleGroup.forEach((p) => p.remove());
    },
  });
}

/**
 * Creates ash and ember floating particles for Burn & Release mode
 */
export function createBurnEmbers(targetContainer: HTMLElement, count: number = 18) {
  const rect = targetContainer.getBoundingClientRect();
  const embers: HTMLElement[] = [];

  for (let i = 0; i < count; i++) {
    const ember = document.createElement("div");
    const isBig = Math.random() > 0.6;
    const size = isBig ? anime.random(6, 12) : anime.random(3, 6);

    ember.style.position = "absolute";
    ember.style.pointerEvents = "none";
    ember.style.borderRadius = isBig ? "40%" : "50%";
    ember.style.width = `${size}px`;
    ember.style.height = `${size}px`;
    ember.style.left = `${anime.random(10, rect.width - 20)}px`;
    ember.style.top = `${anime.random(20, rect.height - 20)}px`;
    ember.style.zIndex = "50";
    
    // Warm glowing colors (amber, orange, warm yellow, rose ash)
    const hue = anime.random(15, 45); // Orange-red-amber spectrum
    const lum = anime.random(50, 75);
    ember.style.background = `radial-gradient(circle, hsl(${hue}, 100%, ${lum}%) 0%, hsl(${hue}, 90%, 40%) 70%, transparent 100%)`;
    ember.style.boxShadow = `0 0 ${size * 2}px hsl(${hue}, 100%, 60%)`;
    ember.style.opacity = "0";

    targetContainer.appendChild(ember);
    embers.push(ember);
  }

  // Animate particles upwards like real embers floating into the air
  anime({
    targets: embers,
    translateY: [
      { value: 0, duration: 0 },
      { value: () => anime.random(-80, -180), duration: 2400, easing: "easeOutQuad" },
    ],
    translateX: () => anime.random(-40, 40),
    scale: [
      { value: [0, 1.2], duration: 400, easing: "easeOutBack" },
      { value: 0, duration: 1800, delay: 400, easing: "easeInSine" },
    ],
    opacity: [
      { value: [0, 0.9], duration: 300 },
      { value: 0, duration: 1500, delay: 700 },
    ],
    rotate: () => anime.random(-180, 180),
    delay: anime.stagger(60),
    complete: () => {
      embers.forEach((e) => e.remove());
    },
  });
}
