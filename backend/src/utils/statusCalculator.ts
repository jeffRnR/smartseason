import { Stage } from '@prisma/client';
import { FieldStatus } from '../types';

/**
 * STATUS CALCULATION DESIGN DECISION:
 * =====================================
 * We deliberately compute "Status" dynamically in the Service Layer rather than
 * persisting it in the database. This prevents data staleness — a field stored
 * as "Active" yesterday could be "At Risk" today based on elapsed time.
 * By calculating on read, we always reflect the true current state.
 */

export function getDaysSincePlanting(plantingDate: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - new Date(plantingDate).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function calculateFieldStatus(
  stage: Stage,
  plantingDate: Date
): FieldStatus {
  const days = getDaysSincePlanting(plantingDate);

  // Rule 1: Harvested fields are always Completed
  if (stage === Stage.HARVESTED) return 'Completed';

  // Rule 2: At Risk — stalled in early stage beyond acceptable window
  //   - PLANTED for more than 30 days (should be Growing by now)
  //   - GROWING for more than 90 days (likely stunted or diseased)
  if (stage === Stage.PLANTED && days > 30) return 'At Risk';
  if (stage === Stage.GROWING && days > 90) return 'At Risk';

  // Rule 3: Ready fields are Active but awaiting harvest
  // Rule 4: All other fields within normal timeframes are Active
  return 'Active';
}

export function getStatusColor(status: FieldStatus): string {
  switch (status) {
    case 'Active':
      return 'green';
    case 'At Risk':
      return 'red';
    case 'Completed':
      return 'blue';
  }
}
