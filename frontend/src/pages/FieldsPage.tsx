import { useState } from 'react';
import { Plus, Search, Leaf } from 'lucide-react';
import { useFields } from '../hooks/useFields';
import { useAuth } from '../lib/auth-context';
import { FieldCard } from '../components/ui/FieldCard';
import { FieldForm } from '../components/ui/FieldForm';
import { Field, FieldStatus, Stage } from '../types';

type StatusFilter = 'All' | FieldStatus;
type StageFilter = 'All' | Stage;

export function FieldsPage() {
  const { isAdmin } = useAuth();
  const { fields, loading, createField, updateField, deleteField } = useFields();

  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [deletingField, setDeletingField] = useState<Field | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [stageFilter, setStageFilter] = useState<StageFilter>('All');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = fields.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.cropType.toLowerCase().includes(search.toLowerCase()) ||
      (f.location?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === 'All' || f.status === statusFilter;
    const matchStage = stageFilter === 'All' || f.currentStage === stageFilter;
    return matchSearch && matchStatus && matchStage;
  });

  const handleEdit = (field: Field) => {
    setEditingField(field);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingField(null);
  };

  const handleSubmit = async (dto: any) => {
    if (editingField) {
      await updateField(editingField.id, dto);
    } else {
      await createField(dto);
    }
  };

  const confirmDelete = async () => {
    if (!deletingField) return;
    setDeleteLoading(true);
    try {
      await deleteField(deletingField.id);
      setDeletingField(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-medium text-stone-800">Fields</h1>
          <p className="text-stone-500 mt-1">
            {filtered.length} of {fields.length} field{fields.length !== 1 ? 's' : ''}
            {!isAdmin && ' assigned to you'}
          </p>
        </div>
        {/* Only admins can create fields */}
        {isAdmin && (
          <button
            onClick={() => { setEditingField(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-leaf-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-leaf-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fields, crops, locations..."
            className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-leaf-400"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="At Risk">At Risk</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as StageFilter)}
          className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-leaf-400"
        >
          <option value="All">All Stages</option>
          <option value="PLANTED">Planted</option>
          <option value="GROWING">Growing</option>
          <option value="READY">Ready</option>
          <option value="HARVESTED">Harvested</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <Leaf className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-display text-lg">No fields found</p>
          <p className="text-sm mt-1">
            {search || statusFilter !== 'All' || stageFilter !== 'All'
              ? 'Try adjusting your filters'
              : isAdmin
              ? 'Add your first field to get started'
              : 'No fields have been assigned to you yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((field) => (
            <FieldCard
              key={field.id}
              field={field}
              onEdit={handleEdit}
              onDelete={isAdmin ? setDeletingField : undefined}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <FieldForm
          field={editingField}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      )}

      {/* Delete confirm modal — admin only */}
      {deletingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-slide-up">
            <h3 className="font-display text-xl font-medium text-stone-800 mb-2">Delete Field</h3>
            <p className="text-stone-500 text-sm mb-6">
              Are you sure you want to delete <strong>{deletingField.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingField(null)}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}