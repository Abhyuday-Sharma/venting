/**
 * Safe haptic vibration utility for mobile browsers & PWA / TWA.
 * Gracefully no-ops on desktop or devices that don't support the Vibration API.
 */

export function triggerHaptic(pattern: number | number[]): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  if (typeof navigator.vibrate !== 'function') {
    return false;
  }
  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

export const haptics = {
  /** Light tap for toggles, switches, or small selections (15ms) */
  tap: () => triggerHaptic(15),

  /** Medium tap for button presses (30ms) */
  click: () => triggerHaptic(30),

  /**
   * Immersive burning sensation:
   * Simulates an ignition burst followed by crackling, roaring embers that burn away.
   * Total duration: ~1.8 seconds, perfectly matching the 2.2-second card dissolve.
   */
  burn: () => {
    const flamePattern = [
      70, 50,   // Ignition spark
      40, 70,   // Spark catches
      60, 50,   // Crackle
      80, 40,   // Rising heat
      110, 45,  // Roaring flame peak
      130, 40,  // Full burn
      90, 50,   // Dissolving into ashes
      70, 60,   // Settling embers
      40, 80,   // Fading spark
      25,       // Final ember
    ];
    return triggerHaptic(flamePattern);
  },

  /**
   * Soothing double-pulse when the card completely dissolves into ashes
   * and the consoling message fades in.
   */
  release: () => triggerHaptic([35, 110, 55]),

  /** Stop any ongoing vibration immediately */
  stop: () => triggerHaptic(0),
};
