export interface LiftLog {
  weight: number;
  reps: number;
  rpe: number;
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type PreferredUnit = 'lbs' | 'kg';

export function calculateE1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

interface PredictNextTargetConfig {
  history: LiftLog[];
  experienceLevel: ExperienceLevel;
  exercise: 'squat' | 'bench' | 'deadlift';
  unit: PreferredUnit;
}

export function predictNextTarget({ history, experienceLevel, exercise, unit }: PredictNextTargetConfig) {
  // 1. Cold Start Check
  if (!history || history.length === 0) {
    return {
      isFirstSession: true,
      isDeload: false,
      targetWeight: null,
      targetReps: null,
      message: "Calibration session. Log your top set today to unlock automated progression."
    };
  }

  const lastSession = history[0];
  const lastE1RM = calculateE1RM(lastSession.weight, lastSession.reps);

  // 2. STALL & DELOAD DETECTION LOGIC (Looks back at past 3 sessions)
  if (history.length >= 3) {
    const session1 = history[0]; // Most recent
    const session2 = history[1];
    const session3 = history[2]; // Oldest of the three

    const e1rm1 = calculateE1RM(session1.weight, session1.reps);
    const e1rm2 = calculateE1RM(session2.weight, session2.reps);
    const e1rm3 = calculateE1RM(session3.weight, session3.reps);

    // Condition: e1RM has flatlined or dropped over 3 sessions while training intensely (RPE >= 9)
    const isStalled = e1rm1 <= e1rm3;
    const isFatigued = session1.rpe >= 9 && session2.rpe >= 9 && session3.rpe >= 9;

    if (isStalled && isFatigued) {
      // Prescribe a 10% Deload to clear fatigue
      const deloadWeight = session1.weight * 0.9;
      const roundIncrement = unit === 'lbs' ? 5 : 2.5;
      const finalDeloadWeight = Math.round(deloadWeight / roundIncrement) * roundIncrement;

      return {
        isFirstSession: false,
        isDeload: true,
        targetWeight: finalDeloadWeight,
        targetReps: 5,
        message: "⚠️ Progress stalled. Fatigue detected. Kaizen automated 10% Deload prescribed."
      };
    }
  }

  // 3. STANDARD AUTO-REGULATION ENGINE (If not stalled)
  let e1RMEffectiveTarget = lastE1RM;
  if (lastSession.rpe >= 9.5) {
    e1RMEffectiveTarget += (unit === 'lbs' ? 2.5 : 1); 
  } else if (lastSession.rpe >= 8 && lastSession.rpe < 9.5) {
    e1RMEffectiveTarget += (unit === 'lbs' ? 5 : 2.5); 
  } else {
    e1RMEffectiveTarget += (unit === 'lbs' ? 10 : 5); 
  }

  const targetReps = 5; 
  const rawPredictedWeight = e1RMEffectiveTarget / (1 + targetReps / 30);
  const roundIncrement = unit === 'lbs' ? 5 : 2.5;
  let finalPredictedWeight = Math.round(rawPredictedWeight / roundIncrement) * roundIncrement;

  // Apply experience caps
  const maxWeeklyGains = {
    beginner: { squat: 10, deadlift: 10, bench: 5 },
    intermediate: { squat: 5, deadlift: 5, bench: 2.5 },
    advanced: { squat: 2.5, deadlift: 2.5, bench: 1.25 }
  };

  const coefficient = unit === 'kg' ? 0.5 : 1;
  const limits = maxWeeklyGains[experienceLevel];
  const allowedGain = limits[exercise === 'bench' ? 'bench' : exercise === 'squat' ? 'squat' : 'deadlift'] * coefficient;

  const maxAllowedWeight = lastSession.weight + allowedGain;
  if (finalPredictedWeight > maxAllowedWeight) {
    finalPredictedWeight = Math.round(maxAllowedWeight / roundIncrement) * roundIncrement;
  }

  return {
    isFirstSession: false,
    isDeload: false,
    targetWeight: finalPredictedWeight,
    targetReps,
    message: "Prescribed target at target RPE 8-9 based on your last session."
  };

  
}


 // Calculates the highest SBD Total (Squat + Bench + Deadlift) from historical logs
export interface HistoryLog {
  exercise: string;
  weight: number;
  reps: number;
}
export function calculateSBDTotal(historyLogs: HistoryLog[]): number {
  const highestLifts: { [key: string]: number } = { squat: 0, bench: 0, deadlift: 0 }

  historyLogs.forEach((log) => {
    const exerciseKey = log.exercise.toLowerCase()
    if (exerciseKey in highestLifts) {
      const e1RM = calculateE1RM(log.weight, log.reps)
      if (e1RM > highestLifts[exerciseKey]) {
        highestLifts[exerciseKey] = e1RM
      }
    }
  })

  return Math.round(highestLifts.squat + highestLifts.bench + highestLifts.deadlift)
}