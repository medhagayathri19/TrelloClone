import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, CheckCheck } from 'lucide-react';
import TaskCard from './TaskCard';
import EmptyColumn from './EmptyColumn';
import { useTasks } from '../../context/TaskContext';

const columnConfig = {
  todo: {
    title: 'To Do',
    indicatorColor: 'bg-slate-400',
    headerBg: 'bg-slate-100/70',
    badgeBg: 'bg-slate-200/80 text-slate-700',
  },
  'in-progress': {
    title: 'In Progress',
    indicatorColor: 'bg-brand-500',
    headerBg: 'bg-brand-50/50',
    badgeBg: 'bg-brand-100 text-brand-800',
  },
  done: {
    title: 'Done',
    indicatorColor: 'bg-emerald-500',
    headerBg: 'bg-emerald-50/40',
    badgeBg: 'bg-emerald-100 text-emerald-800',
  },
};

export const Column = ({ status, tasks = [] }) => {
  const { openCreateModal, markAllColumnTasksAsDone } = useTasks();
  const config = columnConfig[status] || columnConfig.todo;

  return (
    <div className="flex flex-col w-full min-w-[280px] max-w-[380px] bg-slate-100/60 rounded-xl border border-slate-200/70 p-3 h-full max-h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          {/* Status Color Indicator */}
          <span
            className={`w-2.5 h-2.5 rounded-full ${config.indicatorColor}`}
            aria-hidden="true"
          />
          {/* Column Title */}
          <h3 className="text-xs font-semibold text-slate-900 tracking-tight">
            {config.title}
          </h3>
          {/* Task Count Badge */}
          <span
            className={`px-1.5 py-0.2 rounded-full text-[11px] font-semibold ${config.badgeBg}`}
          >
            {tasks.length}
          </span>
        </div>

        {/* Column Actions: Mark All Done & Add Task */}
        <div className="flex items-center gap-0.5">
          {status !== 'done' && tasks.length > 0 && (
            <button
              type="button"
              onClick={() => markAllColumnTasksAsDone(status)}
              className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
              title={`Mark all ${tasks.length} tasks in ${config.title} as Done`}
              aria-label={`Mark all tasks in ${config.title} as Done`}
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => openCreateModal(status)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
            title={`Add task to ${config.title}`}
            aria-label={`Add task to ${config.title}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Droppable Task List Container */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto min-h-[160px] rounded-lg transition-colors duration-150 pr-0.5 ${
              snapshot.isDraggingOver ? 'bg-brand-50/40 ring-1 ring-brand-300' : ''
            }`}
          >
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <TaskCard key={task._id} task={task} index={index} />
              ))
            ) : (
              <EmptyColumn status={status} onAddTask={openCreateModal} />
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Bottom Quick Add Action (Optional extra affordance) */}
      {tasks.length > 0 && (
        <button
          type="button"
          onClick={() => openCreateModal(status)}
          className="mt-2 w-full py-1.5 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      )}
    </div>
  );
};

export default Column;

