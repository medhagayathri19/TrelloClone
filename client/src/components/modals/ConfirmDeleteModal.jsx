import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export const ConfirmDeleteModal = () => {
  const { deletingTask, closeDeleteModal, deleteTask } = useTasks();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!deletingTask) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    await deleteTask(deletingTask._id);
    setIsDeleting(false);
    closeDeleteModal();
  };

  const taskCode = deletingTask.taskCode || `FB-${deletingTask.taskNumber || 100}`;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        className="relative bg-white rounded-xl shadow-modal border border-slate-200/90 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeDeleteModal}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 id="delete-dialog-title" className="text-sm font-semibold text-slate-900">
              Delete Task
            </h3>
            <p id="delete-dialog-desc" className="text-xs text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-slate-700">
                {taskCode}: &quot;{deletingTask.title}&quot;
              </span>
              ? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={closeDeleteModal}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs transition-colors disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;

