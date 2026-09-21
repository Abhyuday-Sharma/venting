/**
 * Safe haptic vibration utility for mobile browsers & PWA / TWA.
 * Gracefully no-ops on desktop or devices that don't support the Vibration API.
 */

export function triggerHaptic(pattern: number | number[]): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  if (!('vibrate' in navigator) || typeof navigator.vibrate !== 'function') {
    return false;
  }
  try {
    const success = navigator.vibrate(pattern);
    return success;
  } catch {
    return false;
  }
}

export const haptics = {
  /** Light tap for toggles, switches, or small selections (40ms - strong enough to feel) */
  tap: () => {
    return triggerHaptic(50);
  },

  /** Medium tap for button presses (80ms) */
  click: () => {
    return triggerHaptic(80);
  },

  /**
   * Immersive burning sensation:
   * Uses robust pulse lengths (100ms - 250ms) to ensure phone vibration motors
   * (LRA and ERM) have sufficient rise time to produce a powerful physical rumble.
   */
  burn: () => {
    // 100ms burst, 70ms rest, 150ms rise, 70ms rest, 250ms heavy roar
    const success = triggerHaptic([120, 80, 180, 80, 260]);
    if (!success) {
      // Fallback to single solid pulse if device doesn't support arrays
      return triggerHaptic(350);
    }
    return success;
  },

  /**
   * Soothing double-pulse when the card dissolves into ashes
   */
  release: () => {
    return triggerHaptic([80, 100, 120]) || triggerHaptic(160);
  },

  /** Stop any ongoing vibration immediately */
  stop: () => triggerHaptic(0),
};
