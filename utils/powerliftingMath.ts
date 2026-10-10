// utils/powerliftingMath.ts

// IPF Standard Competition Class Thresholds
const MALE_CLASSES = [59, 66, 74, 83, 93, 105, 120, Infinity];
const FEMALE_CLASSES = [47, 52, 57, 63, 69, 76, 84, Infinity];

/**
 * Identifies the user's competitive weight division
 */
export function getWeightDivision(bodyweight: number, gender: 'male' | 'female', unit: 'kg' | 'lbs' = 'kg'): string {
  const classes = gender === 'male' ? MALE_CLASSES : FEMALE_CLASSES;
  
  // Convert to kg baseline first so division categories remain globally true
  const bwInKg = unit === 'lbs' ? bodyweight * 0.45359237 : bodyweight;
  
  for (const limit of classes) {
    if (bwInKg <= limit) {
      return limit === Infinity ? `+${classes.at(-2)}kg Class` : `u${limit}kg Class`;
    }
  }
  return 'Open Class';
}

/**
 * Calculates the exact DOTS score based on total lifted mass and bodyweight
 */
export function calculateDots(
  totalLifted: number, 
  bodyweight: number, 
  gender: 'male' | 'female',
  unit: 'kg' | 'lbs'
): number {
  // Convert properties to kg base metrics for absolute accuracy
  const rawBw = unit === 'lbs' ? bodyweight * 0.45359237 : bodyweight;
  const totalInKg = unit === 'lbs' ? totalLifted * 0.45359237 : totalLifted;

  // Enforce official DOTS boundary limits (Caps prevent polynomial distortion)
  const minBw = gender === 'male' ? 40 : 32;
  const maxBw = gender === 'male' ? 150 : 130;
  const bwInKg = Math.max(minBw, Math.min(rawBw, maxBw));

  // Corrected DOTS coefficient alignment: 
  // a = constant, b = bw^1, c = bw^2, d = bw^3, e = bw^4
  const coeff = gender === 'male' 
    ? { a: -364.5504780516, b: 24.7900445731, c: -0.1847518092, d: 0.0007391293, e: -0.000001093 }
    : { a: -57.9628874108, b: 13.6175032044, c: -0.1126651959, d: 0.0005158568, e: -0.0000010706 };

  // Re-mapped denominator calculation matching the correct powers
  const denominator = 
    coeff.a + 
    (coeff.b * bwInKg) + 
    (coeff.c * Math.pow(bwInKg, 2)) + 
    (coeff.d * Math.pow(bwInKg, 3)) + 
    (coeff.e * Math.pow(bwInKg, 4));

  if (denominator <= 0) return 0;

  const score = totalInKg * (500 / denominator);
  return Math.round((score + Number.EPSILON) * 100) / 100; // Safer rounding mechanism than toFixed
}