import { useState, useEffect } from 'react';
import api from '../lib/api';
import { User } from '../types';

export function useAgents() {
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/users');
        setAgents(data.data.filter((u: User) => u.role === 'AGENT'));
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { agents, loading };
}
