import { Stage } from '@prisma/client';
import { FieldStatus } from '../types';


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

  if (stage === Stage.HARVESTED) return 'Completed';

  if (stage === Stage.PLANTED && days > 30) return 'At Risk';
  if (stage === Stage.GROWING && days > 90) return 'At Risk';

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
