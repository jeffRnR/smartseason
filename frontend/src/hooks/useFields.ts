import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { Field, CreateFieldDto, UpdateFieldDto } from '../types';

export function useFields() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/fields');
      setFields(data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const createField = async (dto: CreateFieldDto) => {
    const { data } = await api.post('/fields', dto);
    setFields((prev) => [data.data, ...prev]);
    return data.data as Field;
  };

  const updateField = async (id: string, dto: UpdateFieldDto) => {
    const { data } = await api.patch(`/fields/${id}`, dto);
    setFields((prev) => prev.map((f) => (f.id === id ? data.data : f)));
    return data.data as Field;
  };

  const deleteField = async (id: string) => {
    await api.delete(`/fields/${id}`);
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  return { fields, loading, error, refetch: fetchFields, createField, updateField, deleteField };
}
