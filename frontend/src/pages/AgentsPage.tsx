import { useEffect, useState } from 'react';
import { Users, Sprout, Mail } from 'lucide-react';
import api from '../lib/api';
import { User } from '../types';

interface AgentWithCount extends User {
  _count: { fields: number };
}

export function AgentsPage() {
  const [agents, setAgents] = useState<AgentWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/users');
        setAgents(data.data.filter((u: AgentWithCount) => u.role === 'AGENT'));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-medium text-stone-800">Agents</h1>
        <p className="text-stone-500 mt-1">{agents.length} field agent{agents.length !== 1 ? 's' : ''} registered</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <Users className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-display text-lg">No agents yet</p>
          <p className="text-sm mt-1">Agents will appear here once they register</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 hover:shadow-md transition-shadow animate-slide-up"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-leaf-100 flex items-center justify-center text-leaf-700 font-display font-medium text-lg shrink-0">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-medium text-stone-800 truncate">
                    {agent.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3 h-3 text-stone-400" />
                    <span className="text-xs text-stone-400 truncate">{agent.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-stone-50 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-leaf-500" />
                <span className="text-sm text-stone-600">
                  <strong className="font-medium">{agent._count?.fields ?? 0}</strong>{' '}
                  field{(agent._count?.fields ?? 0) !== 1 ? 's' : ''} assigned
                </span>
              </div>

              <div className="mt-2">
                <span className="text-xs text-stone-400">
                  Joined {new Date(agent.createdAt).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
