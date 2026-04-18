import { useState } from 'react';
import { ArrowRight, Clock, Search, Sprout } from 'lucide-react';
import { useFieldLogs } from '../hooks/useFieldLogs';
import { useAuth } from '../lib/auth-context';
import { StageBadge } from '../components/ui/StatusBadge';
import { Stage } from '../types';

export function LogsPage() {
  const { isAdmin } = useAuth();
  const { logs, loading } = useFieldLogs();
  const [search, setSearch] = useState('');

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.field.name.toLowerCase().includes(q) ||
      log.field.cropType.toLowerCase().includes(q) ||
      log.agent.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-medium text-stone-800">Activity Log</h1>
        <p className="text-stone-500 mt-1">
          {isAdmin
            ? 'All stage changes across every field on the platform.'
            : 'Stage changes for your assigned fields.'}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search field, crop, or agent..."
          className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400 bg-white"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <Sprout className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-display text-lg">No activity yet</p>
          <p className="text-sm mt-1">
            {search ? 'Try adjusting your search' : 'Stage changes will appear here as agents update fields'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-50">
          {filtered.map((log) => (
            <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-stone-50 transition-colors">
              <div className="mt-1 w-2 h-2 rounded-full bg-leaf-400 shrink-0 ring-4 ring-leaf-50" />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
 
                  <div>
                    <p className="text-sm font-medium text-stone-800">
                      {log.field.name}
                      <span className="text-stone-400 font-normal"> · {log.field.cropType}</span>
                    </p>
                    {isAdmin && (
                      <p className="text-xs text-stone-400 mt-0.5">by {log.agent.name}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-stone-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatDate(log.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <StageBadge stage={log.prevStage as Stage} />
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <StageBadge stage={log.newStage as Stage} />
                </div>

                {log.notes && (
                  <p className="text-xs text-stone-400 italic mt-1.5">"{log.notes}"</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1)    return 'just now';
  if (diffMins < 60)   return `${diffMins}m ago`;
  if (diffHours < 24)  return `${diffHours}h ago`;
  if (diffDays < 7)    return `${diffDays}d ago`;
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}