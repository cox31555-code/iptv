import React from 'react';
import { Trash2, X } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

/**
 * BulkActionBar - Action bar that appears when items are selected
 */
const BulkActionBar: React.FC<BulkActionBarProps> = ({ 
  selectedCount, 
  onClear, 
  onDelete,
  isDeleting = false 
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between bg-[#1F2833] border border-sky-500/30 rounded-xl px-6 py-4 mb-6 shadow-lg animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold text-white">
            {selectedCount} {selectedCount === 1 ? 'event' : 'events'} selected
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-white/50 hover:text-white transition-colors font-medium flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Clear selection
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
        >
          <Trash2 className="w-4 h-4" />
          {isDeleting ? 'Deleting...' : 'Delete Selected'}
        </button>
      </div>
    </div>
  );
};

export default BulkActionBar;
