import { useState, useEffect } from 'react';
import api from '../lib/api';

export interface FieldLog {
  id: string;
  fieldId: string;
  agentId: string;
  prevStage: string;
  newStage: string;
  notes: string | null;
  createdAt: string;
  agent: { id: string; name: string; email: string };
  field: { id: string; name: string; cropType: string };
}

export function useFieldLogs(fieldId?: string) {
  const [logs, setLogs] = useState<FieldLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const url = fieldId ? `/logs/field/${fieldId}` : '/logs';
        const { data } = await api.get(url);
        setLogs(data.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load logs');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [fieldId]);

  return { logs, loading, error };
}