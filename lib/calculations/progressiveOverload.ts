// KINETIC CORE - Progressive Overload Engine
// Algorithmic rule-based progression suggestions for strength and hypertrophy.
// NOTE: Rule-based heuristic model. Non-medical and non-prescriptive.

export interface ProgressionInput {
  currentWeight: number; // in kg
  currentReps: number;
  targetReps: number;
  targetSets: number;
  rpe?: number; // 1-10
  trainingFrequencyPerWeek?: number;
  microloadIncrement?: number; // default 2.5kg (or 1.25kg)
}

export interface ProgressionSuggestion {
  action: 'INCREASE_LOAD' | 'INCREASE_REPS' | 'HOLD_AND_CONSOLIDATE' | 'DELOAD_FATIGUE';
  suggestedWeight: number;
  suggestedReps: number;
  suggestedSets: number;
  projectedVolumeGainKg: number;
  rationale: string;
  fatigueRiskNotice: string;
}

export function calculateProgressiveOverload(input: ProgressionInput): ProgressionSuggestion {
  const {
    currentWeight,
    currentReps,
    targetReps,
    targetSets,
    rpe = 8,
    microloadIncrement = 2.5
  } = input;

  const currentVolume = currentWeight * currentReps * targetSets;

  // Case 1: High Fatigue / RPE >= 9.5 and rep target not met
  if (rpe >= 9.5 && currentReps < targetReps) {
    return {
      action: 'DELOAD_FATIGUE',
      suggestedWeight: Math.max(0, Math.round((currentWeight * 0.9) * 10) / 10),
      suggestedReps: targetReps,
      suggestedSets: Math.max(1, targetSets - 1),
      projectedVolumeGainKg: 0,
      rationale: `RPE ${rpe} indicates near-failure or technique breakdown. A 10% load reduction or set consolidation restores neural freshness.`,
      fatigueRiskNotice: 'High central nervous system fatigue detected based on reported RPE.'
    };
  }

  // Case 2: Target reps achieved with manageable RPE (RPE <= 8) -> Increase Load
  if (currentReps >= targetReps && rpe <= 8.5) {
    const nextWeight = Math.round((currentWeight + microloadIncrement) * 10) / 10;
    // Step back to lower rep bound of the cycle (e.g. targetReps - 2 or minimum 5)
    const nextReps = Math.max(5, targetReps - 2);
    const nextVolume = nextWeight * nextReps * targetSets;

    return {
      action: 'INCREASE_LOAD',
      suggestedWeight: nextWeight,
      suggestedReps: nextReps,
      suggestedSets: targetSets,
      projectedVolumeGainKg: Math.round((nextVolume - currentVolume) * 10) / 10,
      rationale: `Target of ${targetReps} reps achieved at RPE ${rpe}. Progress load by +${microloadIncrement} kg and reset rep baseline to ${nextReps}.`,
      fatigueRiskNotice: 'Normal adaptation trajectory. Maintain strict lockout mechanics.'
    };
  }

  // Case 3: Load target not yet topped out -> Add 1 Rep
  if (currentReps < targetReps) {
    const nextReps = currentReps + 1;
    const nextVolume = currentWeight * nextReps * targetSets;

    return {
      action: 'INCREASE_REPS',
      suggestedWeight: currentWeight,
      suggestedReps: nextReps,
      suggestedSets: targetSets,
      projectedVolumeGainKg: Math.round((nextVolume - currentVolume) * 10) / 10,
      rationale: `Maintain current load (${currentWeight} kg) and progress density by aiming for ${nextReps} clean repetitions next session.`,
      fatigueRiskNotice: 'Controlled volume build. Stop set if rep speed drops noticeably.'
    };
  }

  // Case 4: Target reps hit, but RPE was high (9.0) -> Consolidate current load
  return {
    action: 'HOLD_AND_CONSOLIDATE',
    suggestedWeight: currentWeight,
    suggestedReps: currentReps,
    suggestedSets: targetSets,
    projectedVolumeGainKg: 0,
    rationale: `Target achieved but high exertion (RPE ${rpe}). Repeat this weight to improve movement efficiency before increasing resistance.`,
    fatigueRiskNotice: 'Consolidation phase prevents premature plateaus.'
  };
}
