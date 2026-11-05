import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, User, Flag, CheckCircle } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { formatInputDate } from '../../utils/dateUtils';

const DEFAULT_ASSIGNEES = [
  'Workspace Member',
  'Alex Chen',
  'Sarah Lin',
  'Devon Patel',
  'Marcus Vance',
];

export const TaskModal = () => {
  const {
    isTaskModalOpen,
    editingTask,
    modalInitialStatus,
    modalInitialDueDate,
    closeTaskModal,
    createTask,
    updateTask,
    defaultPriority,
    userName,
  } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('Workspace Member');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when modal opens or editingTask changes
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setStatus(editingTask.status || 'todo');
      setPriority(editingTask.priority || 'medium');
      setDueDate(formatInputDate(editingTask.dueDate));
      setAssignee(editingTask.assignee || 'Workspace Member');
    } else {
      setTitle('');
      setDescription('');
      setStatus(modalInitialStatus || 'todo');
      setPriority(defaultPriority || 'medium');
      setDueDate(modalInitialDueDate || '');
      setAssignee(userName || 'Workspace Member');
    }
    setErrors({});
  }, [editingTask, modalInitialStatus, modalInitialDueDate, defaultPriority, userName, isTaskModalOpen]);

  if (!isTaskModalOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!title || !title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (title.trim().length > 150) {
      newErrors.title = 'Title must be 150 characters or less';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      assignee: assignee.trim() || 'Workspace Member',
    };

    let result;
    if (editingTask) {
      result = await updateTask(editingTask._id, payload);
    } else {
      result = await createTask(payload);
    }

    setIsSubmitting(false);
    if (result && result.success) {
      closeTaskModal();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity animate-in fade-in"
    >
      <div
        className="relative bg-white rounded-xl shadow-modal border border-slate-200/90 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 id="task-modal-title" className="text-sm font-semibold text-slate-900">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {editingTask
                ? `Update details for ${editingTask.taskCode || 'task'}`
                : 'Fill in the information to add a task to your board'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeTaskModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title Field (Required) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Implement user authentication workflow"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
              }}
              className={`w-full px-3 py-2 text-xs rounded-md border bg-white focus:outline-none focus:ring-1 transition-all ${
                errors.title
                  ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400'
                  : 'border-slate-200 focus:ring-brand-500 focus:border-brand-500'
              }`}
            />
            {errors.title && (
              <p className="flex items-center gap-1 text-[11px] text-rose-600 mt-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Add additional context, acceptance criteria, or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none"
            />
          </div>

          {/* Grid: Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Status Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          {/* Grid: Due Date & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Due Date Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Assignee Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assignee
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="assignees-list"
                  placeholder="e.g. Sarah Lin"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
                <datalist id="assignees-list">
                  {DEFAULT_ASSIGNEES.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeTaskModal}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-md shadow-xs hover:shadow-subtle transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Task</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

