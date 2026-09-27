// KINETIC CORE - 1-Rep Max (1RM) Mathematical Engine
// Supports 4 validated peer-reviewed estimation formulas.
// Tagged strictly as CALCULATED. Never presented as a tested max.

import { OneRepMaxFormula, DataOrigin } from '@/types';

export interface OneRepMaxResult {
  weight: number;
  reps: number;
  formula: OneRepMaxFormula;
  formulaName: string;
  formulaDescription: string;
  formulaEquation: string;
  estimated1RM: number; // in kg
  percentageTable: Array<{ percentage: number; weight: number; targetRepsEstimate: number }>;
  origin: DataOrigin; // Always 'CALCULATED'
}

export const FORMULA_METADATA: Record<OneRepMaxFormula, { name: string; equation: string; description: string }> = {
  epley: {
    name: 'Epley Formula',
    equation: '1RM = w × (1 + r / 30)',
    description: 'Widely considered the golden standard for 3-10 reps in strength sports.'
  },
  brzycki: {
    name: 'Brzycki Formula',
    equation: '1RM = w × (36 / (37 - r))',
    description: 'Conservative linear regression model, highly accurate below 10 reps.'
  },
  lombardi: {
    name: 'Lombardi Formula',
    equation: '1RM = w × r^0.10',
    description: 'Power-law scaling curve. Yields slightly flatter predictions across higher rep ranges.'
  },
  mayhew: {
    name: 'Mayhew et al. Formula',
    equation: '1RM = (100 × w) / (52.2 + 41.9 × e^(-0.055 × r))',
    description: 'Non-linear exponential model derived from extensive collegiate athlete resistance testing.'
  }
};

export function calculate1RM(weight: number, reps: number, formula: OneRepMaxFormula = 'epley'): OneRepMaxResult {
  if (weight <= 0 || reps <= 0) {
    return {
      weight: 0,
      reps: 0,
      formula,
      formulaName: FORMULA_METADATA[formula].name,
      formulaDescription: FORMULA_METADATA[formula].description,
      formulaEquation: FORMULA_METADATA[formula].equation,
      estimated1RM: 0,
      percentageTable: [],
      origin: 'CALCULATED'
    };
  }

  // A 1-rep lift is by definition the 1RM
  if (reps === 1) {
    const table = generatePercentageTable(weight);
    return {
      weight,
      reps: 1,
      formula,
      formulaName: FORMULA_METADATA[formula].name,
      formulaDescription: FORMULA_METADATA[formula].description,
      formulaEquation: FORMULA_METADATA[formula].equation,
      estimated1RM: weight,
      percentageTable: table,
      origin: 'CALCULATED'
    };
  }

  let raw1RM = weight;

  switch (formula) {
    case 'epley':
      raw1RM = weight * (1 + reps / 30);
      break;

    case 'brzycki':
      // Brzycki formula undefined for reps >= 37
      if (reps >= 37) {
        raw1RM = weight * (1 + reps / 30); // fallback to epley for extreme rep inputs
      } else {
        raw1RM = weight * (36 / (37 - reps));
      }
      break;

    case 'lombardi':
      raw1RM = weight * Math.pow(reps, 0.10);
      break;

    case 'mayhew':
      const denominator = 52.2 + 41.9 * Math.exp(-0.055 * reps);
      raw1RM = (100 * weight) / denominator;
      break;
  }

  const estimated1RM = Math.round(raw1RM * 10) / 10;
  const percentageTable = generatePercentageTable(estimated1RM);

  return {
    weight,
    reps,
    formula,
    formulaName: FORMULA_METADATA[formula].name,
    formulaDescription: FORMULA_METADATA[formula].description,
    formulaEquation: FORMULA_METADATA[formula].equation,
    estimated1RM,
    percentageTable,
    origin: 'CALCULATED'
  };
}

export function compareAllFormulas(weight: number, reps: number): Record<OneRepMaxFormula, number> {
  const formulas: OneRepMaxFormula[] = ['epley', 'brzycki', 'lombardi', 'mayhew'];
  const res: Partial<Record<OneRepMaxFormula, number>> = {};
  formulas.forEach((f) => {
    res[f] = calculate1RM(weight, reps, f).estimated1RM;
  });
  return res as Record<OneRepMaxFormula, number>;
}

function generatePercentageTable(oneRepMax: number): Array<{ percentage: number; weight: number; targetRepsEstimate: number }> {
  const percentages = [
    { p: 100, reps: 1 },
    { p: 95, reps: 2 },
    { p: 90, reps: 4 },
    { p: 85, reps: 6 },
    { p: 80, reps: 8 },
    { p: 75, reps: 10 },
    { p: 70, reps: 12 },
    { p: 65, reps: 15 },
    { p: 60, reps: 20 }
  ];

  return percentages.map(({ p, reps }) => ({
    percentage: p,
    weight: Math.round(((oneRepMax * p) / 100) * 10) / 10,
    targetRepsEstimate: reps
  }));
}
