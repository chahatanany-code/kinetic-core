// KINETIC CORE - Screen Wake Lock Controller
// Prevents screen sleep / dimming during active combat rounds & locked training sessions.

let wakeLockSentinel: any = null;

export async function requestWakeLock(): Promise<boolean> {
  if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
    return false;
  }
  try {
    wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
    });
    return true;
  } catch (err) {
    console.warn('[KineticCore WakeLock] Request failed or permission denied:', err);
    wakeLockSentinel = null;
    return false;
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch {
      // ignore release error
    } finally {
      wakeLockSentinel = null;
    }
  }
}

export function isWakeLockActive(): boolean {
  return wakeLockSentinel !== null && !wakeLockSentinel.released;
}
