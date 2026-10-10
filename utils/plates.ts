export interface PlatesBreakdown {
  barbell: number;
  platesPerSide: { [plateWeight: string]: number };
  remainder: number;
}

export function calculatePlates(targetWeight: number, unit: 'lbs' | 'kg'): PlatesBreakdown {
  const isLbs = unit === 'lbs';
  const barWeight = isLbs ? 45 : 20;
  
  // Available standard plates arranged from heaviest to lightest
  const availablePlates = isLbs 
    ? [45, 35, 25, 10, 5, 2.5] 
    : [25, 20, 15, 10, 5, 2.5, 1.25];

  const breakdown: PlatesBreakdown = {
    barbell: barWeight,
    platesPerSide: {},
    remainder: 0
  };

  // If the target weight is less than or equal to the bar, no plates are needed
  if (targetWeight <= barWeight) {
    return breakdown;
  }

  // Calculate the total weight that needs to go on ONE side of the barbell
  let weightPerSide = (targetWeight - barWeight) / 2;

  // Greedily determine the plate breakdown
  for (const plate of availablePlates) {
    const count = Math.floor(weightPerSide / plate);
    if (count > 0) {
      breakdown.platesPerSide[plate.toString()] = count;
      weightPerSide -= count * plate;
    }
  }

  // Any tiny weight left over that can't be matched by standard plates
  breakdown.remainder = weightPerSide * 2; 

  return breakdown;
}