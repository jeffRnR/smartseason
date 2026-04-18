import { MapPin, Calendar, Clock, Pencil, Trash2, Sprout } from 'lucide-react';
import { Field } from '../../types';
import { StatusBadge, StageBadge } from './StatusBadge';
import { useAuth } from '../../lib/auth-context';

interface FieldCardProps {
  field: Field;
  onEdit: (field: Field) => void;
  onDelete?: (field: Field) => void; // only passed for admins
}

export function FieldCard({ field, onEdit, onDelete }: FieldCardProps) {
  const { isAdmin } = useAuth();

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up overflow-hidden group">
      {/* Status stripe */}
      <div
        className={`h-1.5 w-full ${
          field.status === 'Active'
            ? 'bg-leaf-400'
            : field.status === 'At Risk'
            ? 'bg-red-400'
            : 'bg-sky-400'
        }`}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-medium text-stone-800 text-lg leading-tight truncate">
              {field.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Sprout className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-sm text-stone-500">{field.cropType}</span>
            </div>
          </div>
          <StatusBadge status={field.status} size="sm" />
        </div>

        {/* Meta */}
        <div className="space-y-1.5 mb-4">
          {field.location && (
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{field.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>
              Planted{' '}
              {new Date(field.plantingDate).toLocaleDateString('en-KE', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{field.daysSincePlanting} days in field</span>
          </div>
        </div>

        {/* Stage + Agent */}
        <div className="flex items-center justify-between">
          <StageBadge stage={field.currentStage} />
          {isAdmin && (
            <span className="text-xs text-stone-400 truncate ml-2">
              {field.agent?.name}
            </span>
          )}
        </div>

        {/* Notes */}
        {field.notes && (
          <p className="mt-3 text-xs text-stone-400 italic line-clamp-2 border-t border-stone-50 pt-3">
            "{field.notes}"
          </p>
        )}
      </div>

      {/* Actions — revealed on hover */}
      <div className="px-5 pb-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity -mt-1">
        <button
          onClick={() => onEdit(field)}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-leaf-700 px-3 py-1.5 rounded-lg hover:bg-leaf-50 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          {isAdmin ? 'Edit' : 'Update'}
        </button>
        {/* Delete is admin-only */}
        {onDelete && (
          <button
            onClick={() => onDelete(field)}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}