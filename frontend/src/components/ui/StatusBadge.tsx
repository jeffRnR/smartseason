import { Leaf, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { FieldStatus, Stage } from '../../types';

interface StatusBadgeProps {
  status: FieldStatus;
  size?: 'sm' | 'md';
}

const config: Record<FieldStatus, { icon: typeof Leaf; label: string; className: string }> = {
  Active: {
    icon: Leaf,
    label: 'Active',
    className: 'bg-leaf-50 text-leaf-700 border border-leaf-200',
  },
  'At Risk': {
    icon: AlertTriangle,
    label: 'At Risk',
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
  Completed: {
    icon: CheckCircle2,
    label: 'Completed',
    className: 'bg-sky-50 text-sky-700 border border-sky-200',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { icon: Icon, label, className } = config[status];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-sm px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${className}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {label}
    </span>
  );
}

interface StageBadgeProps {
  stage: Stage;
}

const stageConfig: Record<Stage, { label: string; className: string }> = {
  PLANTED: { label: 'Planted', className: 'bg-soil-50 text-soil-700 border border-soil-200' },
  GROWING: { label: 'Growing', className: 'bg-leaf-50 text-leaf-700 border border-leaf-200' },
  READY: { label: 'Ready', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  HARVESTED: { label: 'Harvested', className: 'bg-sky-50 text-sky-700 border border-sky-200' },
};

export function StageBadge({ stage }: StageBadgeProps) {
  const { label, className } = stageConfig[stage];
  return (
    <span className={`inline-flex items-center rounded-full text-xs px-2 py-0.5 font-medium border ${className}`}>
      {label}
    </span>
  );
}
