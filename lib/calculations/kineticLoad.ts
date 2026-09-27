// KINETIC CORE - Transparent Kinetic Load Formula
// A composite training stress estimation based strictly on logged sets, volume, RPE, and round duration.
// Origin: CALCULATED
// DISCLAIMER: Transparent algorithmic formula. Not a medical readiness or cardiovascular diagnostic score.

export interface KineticLoadBreakdown {
  totalKineticLoad: number;
  strengthComponent: number;
  combatComponent: number;
  formulaDescription: string;
  formulaEquation: string;
  loadTier: 'RECOVERY' | 'MODERATE' | 'OPTIMAL' | 'OVERREACHING';
}

export function calculateKineticLoad(params: {
  totalVolumeKg?: number;
  averageRpe?: number;
  totalSets?: number;
  roundsCompleted?: number;
  activeWorkSeconds?: number;
}): KineticLoadBreakdown {
  const {
    totalVolumeKg = 0,
    averageRpe = 7.5,
    totalSets = 0,
    roundsCompleted = 0,
    activeWorkSeconds = 0
  } = params;

  // Strength Component: Volume scaled by perceived exertion (RPE / 10) + Set density bonus
  // Formula: (VolumeKg * (RPE / 10) * 0.015) + (Sets * 2.5)
  const effectiveRpeMultiplier = Math.max(0.5, Math.min(1.0, averageRpe / 10));
  const strengthComponent = (totalVolumeKg * effectiveRpeMultiplier * 0.015) + (totalSets * 2.5);

  // Combat Component: Active work seconds (each 60s of striking/intervals = 15 load points) + round density
  // Formula: (activeWorkSeconds / 60 * 15) + (roundsCompleted * 8)
  const combatComponent = ((activeWorkSeconds / 60) * 15) + (roundsCompleted * 8);

  const rawLoad = strengthComponent + combatComponent;
  const totalKineticLoad = Math.round(rawLoad * 10) / 10;

  let loadTier: 'RECOVERY' | 'MODERATE' | 'OPTIMAL' | 'OVERREACHING' = 'MODERATE';
  if (totalKineticLoad < 100) loadTier = 'RECOVERY';
  else if (totalKineticLoad < 300) loadTier = 'MODERATE';
  else if (totalKineticLoad <= 600) loadTier = 'OPTIMAL';
  else loadTier = 'OVERREACHING';

  return {
    totalKineticLoad,
    strengthComponent: Math.round(strengthComponent * 10) / 10,
    combatComponent: Math.round(combatComponent * 10) / 10,
    formulaDescription: 'Kinetic Load aggregates mechanical volume (scaled by RPE) and combat interval duration.',
    formulaEquation: 'Load = (Volume × RPE/10 × 0.015 + Sets × 2.5) + (WorkMins × 15 + Rounds × 8)',
    loadTier
  };
}
