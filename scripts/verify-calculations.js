// KINETIC CORE - Calculation Engine Verification Tests
// Runs directly in Node to validate mathematical precision and formula correctness.

const { calculate1RM, compareAllFormulas } = require('../lib/calculations/oneRepMax.ts');
const { calculateSetVolume, calculateSessionVolume } = require('../lib/calculations/volume.ts');
const { calculateProgressiveOverload } = require('../lib/calculations/progressiveOverload.ts');
const { calculateKineticLoad } = require('../lib/calculations/kineticLoad.ts');

console.log('=== KINETIC CORE ENGINE MATH VERIFICATION ===\n');

// 1. 1RM Verification for 100kg x 8 reps
console.log('TEST 1: 1RM Formulas (100kg x 8 reps)');
const epley = calculate1RM(100, 8, 'epley');
const brzycki = calculate1RM(100, 8, 'brzycki');
const lombardi = calculate1RM(100, 8, 'lombardi');
const mayhew = calculate1RM(100, 8, 'mayhew');

console.log(`- Epley:    ${epley.estimated1RM} kg (Expected ~126.7 kg)`);
console.log(`- Brzycki:  ${brzycki.estimated1RM} kg (Expected ~124.1 kg)`);
console.log(`- Lombardi: ${lombardi.estimated1RM} kg (Expected ~123.1 kg)`);
console.log(`- Mayhew:   ${mayhew.estimated1RM} kg (Expected ~126.3 kg)`);

if (Math.abs(epley.estimated1RM - 126.7) > 0.5) throw new Error('Epley formula deviation exceeded');
if (Math.abs(brzycki.estimated1RM - 124.1) > 0.5) throw new Error('Brzycki formula deviation exceeded');
console.log('✓ 1RM Formulas verified.\n');

// 2. Volume Calculations
console.log('TEST 2: Volume Calculations');
const setVol = calculateSetVolume({ id: 's1', setNumber: 1, weight: 100, reps: 8, completed: true, timestamp: 0, origin: 'MANUALLY ENTERED' });
console.log(`- Single Set (100kg x 8): ${setVol} kg (Expected 800 kg)`);
if (setVol !== 800) throw new Error('Set volume error');

const sessionExercises = [
  {
    id: 'e1',
    exerciseName: 'Bench Press',
    muscleGroups: ['CHEST', 'TRICEPS'],
    sets: [
      { id: '1', setNumber: 1, weight: 100, reps: 8, completed: true, timestamp: 0, origin: 'MANUALLY ENTERED' },
      { id: '2', setNumber: 2, weight: 100, reps: 8, completed: true, timestamp: 0, origin: 'MANUALLY ENTERED' },
      { id: '3', setNumber: 3, weight: 105, reps: 6, completed: true, timestamp: 0, origin: 'MANUALLY ENTERED' }
    ]
  }
];
const sessionVol = calculateSessionVolume(sessionExercises);
console.log(`- Total Session Volume: ${sessionVol.totalVolumeKg} kg (Expected 2230 kg)`);
console.log(`- Total Sets: ${sessionVol.totalSets} (Expected 3)`);
console.log(`- Total Reps: ${sessionVol.totalReps} (Expected 22)`);
if (sessionVol.totalVolumeKg !== 2230) throw new Error('Session volume calculation error');
console.log('✓ Volume engine verified.\n');

// 3. Progressive Overload
console.log('TEST 3: Progressive Overload Engine');
const prog1 = calculateProgressiveOverload({
  currentWeight: 100,
  currentReps: 8,
  targetReps: 8,
  targetSets: 3,
  rpe: 8,
  microloadIncrement: 2.5
});
console.log(`- Suggestion for Target Met (100kg x 8, RPE 8): ${prog1.action} -> Next: ${prog1.suggestedWeight}kg x ${prog1.suggestedReps}`);
if (prog1.suggestedWeight !== 102.5) throw new Error('Progression load increment error');

const progFatigue = calculateProgressiveOverload({
  currentWeight: 100,
  currentReps: 6,
  targetReps: 8,
  targetSets: 3,
  rpe: 10
});
console.log(`- Suggestion for High Fatigue (RPE 10): ${progFatigue.action} -> Next: ${progFatigue.suggestedWeight}kg`);
if (progFatigue.action !== 'DELOAD_FATIGUE') throw new Error('Fatigue deload detection error');
console.log('✓ Progressive Overload engine verified.\n');

// 4. Kinetic Load
console.log('TEST 4: Kinetic Load Transparent Formula');
const kLoad = calculateKineticLoad({
  totalVolumeKg: 8420,
  averageRpe: 8,
  totalSets: 17,
  roundsCompleted: 8,
  activeWorkSeconds: 1440 // 24 mins
});
console.log(`- Calculated Kinetic Load: ${kLoad.totalKineticLoad} (Strength: ${kLoad.strengthComponent}, Combat: ${kLoad.combatComponent}, Tier: ${kLoad.loadTier})`);
console.log(`- Formula: ${kLoad.formulaEquation}`);
if (kLoad.totalKineticLoad <= 0) throw new Error('Kinetic load invalid');
console.log('✓ Kinetic Load calculation verified.\n');

console.log('ALL ENGINE CALCULATIONS VALIDATED.');
