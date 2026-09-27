// KINETIC CORE - Core Type Definitions
// Authoritative models for training operating system

export type DataOrigin = 'MEASURED' | 'CALCULATED' | 'MANUALLY ENTERED' | 'SIMULATED';

export type TrainingType = 'boxing' | 'taekwondo' | 'strength' | 'combat_conditioning' | 'custom';

export type IntervalState = 'IDLE' | 'PREPARATION' | 'WORK' | 'WARNING' | 'REST' | 'PAUSED' | 'COMPLETE';

export type SoundProfile = 'CLASSIC_BELL' | 'DIGITAL_BEEP' | 'TACTICAL' | 'MINIMAL' | 'SILENT';

export type WeightUnit = 'KG' | 'LB';

export type OneRepMaxFormula = 'epley' | 'brzycki' | 'lombardi' | 'mayhew';

export interface ExerciseSet {
  id: string;
  setNumber: number;
  weight: number; // in kg (internal canonical)
  reps: number;
  rpe?: number; // 1-10
  timestamp: number;
  origin: DataOrigin;
  completed: boolean;
}

export interface ExerciseLog {
  id: string;
  exerciseName: string;
  muscleGroups: string[];
  sets: ExerciseSet[];
  notes?: string;
}

export interface CombatTechniqueLog {
  technique: string;
  category: 'punch' | 'kick' | 'footwork' | 'defense' | 'combination';
  leftCount: number;
  rightCount: number;
  notes?: string;
  origin: DataOrigin;
}

export interface CombatCombination {
  id: string;
  name: string;
  notation: string; // e.g., "1 - 2 - 3 - 2" or "Jab - Cross - Hook - Cross"
  sequence: string[]; // ['1', '2', '3', '2']
  targetRounds?: number[];
  category: 'boxing' | 'kickboxing' | 'mma' | 'muay_thai';
}

export interface TrainingBlock {
  id: string;
  title: string;
  type: 'WARMUP' | 'WORK' | 'REST' | 'ACTIVE_REST' | 'DRILL' | 'COMBINATION' | 'COOLDOWN';
  durationSeconds: number;
  comboId?: string;
  notes?: string;
}

export interface CustomTrainingPreset {
  id: string;
  name: string;
  trainingType: TrainingType;
  roundsCount: number;
  roundDurationSeconds: number;
  restDurationSeconds: number;
  warningDurationSeconds: number;
  prepDurationSeconds: number;
  blocks?: TrainingBlock[];
  createdAt: number;
}

export interface RoundPerformance {
  roundNumber: number;
  targetSeconds: number;
  actualSeconds: number;
  intensityRating?: number; // 1-10 (MANUALLY ENTERED)
  combosThrown?: number;
  notes?: string;
}

export interface TrainingSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  type: TrainingType;
  title: string;
  totalDurationSeconds: number;
  roundsPlanned?: number;
  roundsCompleted?: number;
  roundDetails?: RoundPerformance[];
  exercises?: ExerciseLog[];
  techniques?: CombatTechniqueLog[];
  combinations?: CombatCombination[];
  kineticLoad: number; // CALCULATED composite metric
  totalVolumeKg?: number; // CALCULATED (strength)
  totalSets?: number;
  totalReps?: number;
  rpeAverage?: number;
  notes?: string;
  origin: DataOrigin;
}

export interface PersonalRecord {
  id: string;
  category: 'STRENGTH' | 'COMBAT' | 'VOLUME' | 'DURATION';
  metric: string; // e.g. "Bench Press 1RM", "Max Rounds", "Session Volume"
  value: number;
  unit: string;
  achievedAt: number;
  sessionId?: string;
  origin: DataOrigin;
}

export interface SystemSettings {
  soundProfile: SoundProfile;
  volume: number; // 0 to 1
  vibrationEnabled: boolean;
  hapticCountdownEnabled: boolean;
  warningBellTime: number; // e.g. 10 seconds before round end
  prepTimeSeconds: number; // 5 or 10s
  wakeLockEnabled: boolean;
  preferredUnit: WeightUnit;
  defaultRoundLength: number; // seconds
  defaultRestLength: number; // seconds
  defaultRoundCount: number;
  highContrastMode: boolean;
  reducedMotion: boolean;
}

export interface ClockDiagnostic {
  clockSource: string;
  workerStatus: 'ACTIVE' | 'INACTIVE' | 'UNSUPPORTED';
  audioContextStatus: AudioContextState | 'NOT_INITIALIZED';
  lastDriftMs: number;
  maxDriftMs: number;
  totalTicks: number;
  scheduledEvents: number;
  driftStatus: DataOrigin;
}
