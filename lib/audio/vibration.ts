// KINETIC CORE - Haptic Vibration Engine
// Gracefully degrades on unsupported devices or desktop browsers.

export function triggerVibration(pattern: number | number[]): boolean {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return false;
  }
  try {
    return navigator.vibrate(pattern);
  } catch (err) {
    console.debug('[KineticCore Haptics] Vibration call skipped:', err);
    return false;
  }
}

export const HAPTIC_PATTERNS = {
  ROUND_START: [250, 100, 250],
  WARNING_10S: [120, 80, 120],
  COUNTDOWN_TICK: [75],
  ROUND_END: [400, 150, 400],
  REST_END: [300],
  SESSION_COMPLETE: [200, 100, 200, 100, 500],
  BUTTON_TAP: [40]
};
