import React from 'react';
import { Plus, Inbox } from 'lucide-react';

export const EmptyColumn = ({ status, onAddTask }) => {
  const messages = {
    todo: {
      title: 'No pending tasks',
      desc: 'Add items here to begin tracking work.',
    },
    'in-progress': {
      title: 'Nothing in progress',
      desc: 'Drag tasks here when you start working.',
    },
    done: {
      title: 'No completed tasks',
      desc: 'Finished tasks will appear here.',
    },
  };

  const current = messages[status] || messages.todo;

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-slate-200/90 rounded-lg bg-slate-50/50">
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
        <Inbox className="w-4 h-4" />
      </div>
      <p className="text-xs font-medium text-slate-700">{current.title}</p>
      <p className="text-[11px] text-slate-400 mt-0.5 max-w-[180px]">{current.desc}</p>
      <button
        type="button"
        onClick={() => onAddTask(status)}
        className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded border border-brand-200 transition-colors"
      >
        <Plus className="w-3 h-3" />
        <span>Add task</span>
      </button>
    </div>
  );
};

export default EmptyColumn;

