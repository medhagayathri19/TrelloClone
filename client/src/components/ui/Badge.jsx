import React from 'react';

export const PriorityBadge = ({ priority = 'medium' }) => {
  const normalized = (priority || 'medium').toLowerCase();

  const styles = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    medium: 'bg-amber-50 text-amber-700 border-amber-200/80',
    high: 'bg-rose-50 text-rose-700 border-rose-200/80',
  };

  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border tracking-wide uppercase ${
        styles[normalized] || styles.medium
      }`}
    >
      {labels[normalized] || 'Medium'}
    </span>
  );
};

export const StatusBadge = ({ status = 'todo' }) => {
  const styles = {
    todo: 'bg-slate-100 text-slate-700 border-slate-200',
    'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
    done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const labels = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
        styles[status] || styles.todo
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

