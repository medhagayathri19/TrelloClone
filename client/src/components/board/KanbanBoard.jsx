import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';
import { useTasks } from '../../context/TaskContext';
import { AlertCircle, RefreshCw, Kanban } from 'lucide-react';

export const KanbanBoard = () => {
  const { columns, loading, error, fetchTasks, handleDragEnd } = useTasks();

  const columnKeys = ['todo', 'in-progress', 'done'];

  if (loading) {
    return (
      <div className="flex-1 p-6 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((col) => (
            <div
              key={col}
              className="bg-slate-100/70 border border-slate-200/80 rounded-xl p-4 h-[550px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-4 bg-slate-200 rounded w-6"></div>
              </div>
              <div className="space-y-3 flex-1">
                <div className="h-24 bg-white rounded-lg border border-slate-200/60 p-3"></div>
                <div className="h-28 bg-white rounded-lg border border-slate-200/60 p-3"></div>
                <div className="h-20 bg-white rounded-lg border border-slate-200/60 p-3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full p-6 bg-white rounded-xl border border-rose-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Unable to Load FlowBoard Tasks
          </h3>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => fetchTasks(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-5 items-start min-w-max md:min-w-0 pb-4">
          {columnKeys.map((statusKey) => (
            <div key={statusKey} className="w-[310px] sm:w-[330px] lg:flex-1 shrink-0">
              <Column status={statusKey} tasks={columns[statusKey] || []} />
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;

