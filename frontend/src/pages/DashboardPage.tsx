import { Leaf, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { useFields } from '../hooks/useFields';
import { useAuth } from '../lib/auth-context';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge, StageBadge } from '../components/ui/StatusBadge';

export function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { stats, loading: statsLoading } = useDashboard();
  const { fields, loading: fieldsLoading } = useFields();

  const atRiskFields = fields.filter((f) => f.status === 'At Risk');
  const recentFields = fields.slice(0, 5);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-leaf-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-medium text-stone-800">
          Good {getGreeting()}, {user?.name?.split(' ')[0]}.
        </h1>
        <p className="text-stone-500 mt-1">
          {isAdmin
            ? "Here's an overview of all fields across the platform."
            : "Here's the status of your assigned fields."}
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Fields"
            value={stats.totalFields}
            icon={Layers}
            color="amber"
            subtitle="across all agents"
          />
          <StatCard
            title="Active"
            value={stats.activeFields}
            icon={Leaf}
            color="green"
            subtitle="growing normally"
          />
          <StatCard
            title="At Risk"
            value={stats.atRiskFields}
            icon={AlertTriangle}
            color="red"
            subtitle="need attention"
          />
          <StatCard
            title="Completed"
            value={stats.completedFields}
            icon={CheckCircle2}
            color="blue"
            subtitle="harvested"
          />
        </div>
      )}

      {stats && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <h2 className="font-display text-lg font-medium text-stone-700 mb-5">Fields by Stage</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(Object.entries(stats.fieldsByStage) as [string, number][]).map(([stage, count]) => (
              <div key={stage} className="text-center p-4 rounded-xl bg-stone-50 border border-stone-100">
                <p className="text-3xl font-display font-light text-stone-700">{count}</p>
                <div className="mt-2 flex justify-center">
                  <StageBadge stage={stage as any} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {atRiskFields.length > 0 && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h2 className="font-display text-lg font-medium text-stone-700">At Risk Fields</h2>
            </div>
            <div className="space-y-3">
              {atRiskFields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between py-3 border-b border-stone-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-700">{field.name}</p>
                    <p className="text-xs text-stone-400">
                      {field.cropType} · {field.daysSincePlanting}d since planting
                      {isAdmin && ` · ${field.agent?.name}`}
                    </p>
                  </div>
                  <StageBadge stage={field.currentStage} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <h2 className="font-display text-lg font-medium text-stone-700 mb-5">Recent Fields</h2>
          {fieldsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentFields.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <Leaf className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No fields yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentFields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between py-3 border-b border-stone-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-700">{field.name}</p>
                    <p className="text-xs text-stone-400">
                      {field.cropType}
                      {isAdmin && ` · ${field.agent?.name}`}
                    </p>
                  </div>
                  <StatusBadge status={field.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
