import { useState } from 'react';
import { X } from 'lucide-react';
import { Field, CreateFieldDto, Stage } from '../../types';
import { useAgents } from '../../hooks/useAgents';
import { useAuth } from '../../lib/auth-context';

interface FieldFormProps {
  field?: Field | null;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}

const STAGES: Stage[] = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'];

export function FieldForm({ field, onSubmit, onClose }: FieldFormProps) {
  const { isAdmin } = useAuth();
  const { agents } = useAgents();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin form state — full field
  const [adminForm, setAdminForm] = useState<CreateFieldDto>({
    name: field?.name || '',
    cropType: field?.cropType || '',
    plantingDate: field?.plantingDate
      ? new Date(field.plantingDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    currentStage: field?.currentStage || 'PLANTED',
    notes: field?.notes || '',
    location: field?.location || '',
    agentId: field?.agentId || '',
  });

  // Agent form state — stage + notes only
  const [agentForm, setAgentForm] = useState({
    currentStage: field?.currentStage || 'PLANTED' as Stage,
    notes: field?.notes || '',
  });

  const handleSubmit = async () => {
    if (isAdmin) {
      if (!adminForm.name || !adminForm.cropType || !adminForm.plantingDate) {
        setError('Name, crop type, and planting date are required.');
        return;
      }
      if (!adminForm.agentId) {
        setError('Please assign an agent to this field.');
        return;
      }
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit(isAdmin ? adminForm : agentForm);
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const setAdmin = (key: keyof CreateFieldDto, val: string) =>
    setAdminForm((p) => ({ ...p, [key]: val }));

  const title = isAdmin
    ? field ? 'Edit Field' : 'Add New Field'
    : 'Update Field';

  const submitLabel = isAdmin
    ? field ? 'Save Changes' : 'Add Field'
    : 'Save Update';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <div>
            <h2 className="font-display text-xl font-medium text-stone-800">{title}</h2>
            {!isAdmin && field && (
              <p className="text-xs text-stone-400 mt-0.5">
                {field.name} · {field.cropType}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100 transition-colors">
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* ── ADMIN FORM — full control ── */}
          {isAdmin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Field Name *</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdmin('name', e.target.value)}
                  placeholder="e.g. North Paddock"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Crop Type *</label>
                <input
                  type="text"
                  value={adminForm.cropType}
                  onChange={(e) => setAdmin('cropType', e.target.value)}
                  placeholder="e.g. Maize"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Planting Date *</label>
                <input
                  type="date"
                  value={adminForm.plantingDate}
                  onChange={(e) => setAdmin('plantingDate', e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Stage</label>
                <select
                  value={adminForm.currentStage}
                  onChange={(e) => setAdmin('currentStage', e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent bg-white"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Location</label>
                <input
                  type="text"
                  value={adminForm.location}
                  onChange={(e) => setAdmin('location', e.target.value)}
                  placeholder="e.g. Nakuru County"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Assign Agent *</label>
                <select
                  value={adminForm.agentId}
                  onChange={(e) => setAdmin('agentId', e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent bg-white"
                >
                  <option value="">Select an agent...</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Notes</label>
                <textarea
                  value={adminForm.notes}
                  onChange={(e) => setAdmin('notes', e.target.value)}
                  placeholder="Any observations or remarks..."
                  rows={3}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {/* ── AGENT FORM — stage + notes only ── */}
          {!isAdmin && (
            <div className="space-y-4">
              <div className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm text-stone-500">
                You can update the <strong className="text-stone-700">stage</strong> and <strong className="text-stone-700">notes</strong> for this field.
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Current Stage</label>
                <select
                  value={agentForm.currentStage}
                  onChange={(e) => setAgentForm((p) => ({ ...p, currentStage: e.target.value as Stage }))}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent bg-white"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Field Notes</label>
                <textarea
                  value={agentForm.notes}
                  onChange={(e) => setAgentForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Observations, issues, progress update..."
                  rows={4}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium bg-leaf-600 text-white rounded-xl hover:bg-leaf-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}