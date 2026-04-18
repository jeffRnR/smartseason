import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'green' | 'red' | 'blue' | 'amber';
  subtitle?: string;
}

const colorMap = {
  green: {
    bg: 'bg-leaf-50',
    icon: 'text-leaf-600',
    ring: 'ring-leaf-100',
    value: 'text-leaf-700',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    ring: 'ring-red-100',
    value: 'text-red-700',
  },
  blue: {
    bg: 'bg-sky-50',
    icon: 'text-sky-600',
    ring: 'ring-sky-100',
    value: 'text-sky-700',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    ring: 'ring-amber-100',
    value: 'text-amber-700',
  },
};

export function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm animate-slide-up hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-stone-500 mb-1">{title}</p>
          <p className={`text-4xl font-display font-light ${c.value}`}>{value}</p>
          {subtitle && <p className="text-xs text-stone-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${c.bg} ring-4 ${c.ring}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
}
