import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, Edit2, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { PriorityBadge } from '../ui/Badge';
import { formatDisplayDate, isOverdue, getInitials, getAvatarColor } from '../../utils/dateUtils';
import { useTasks } from '../../context/TaskContext';

export const TaskCard = ({ task, index }) => {
  const { openEditModal, openDeleteModal, cardDensity } = useTasks();
  const isCompact = cardDensity === 'compact';

  const formattedDueDate = formatDisplayDate(task.dueDate);
  const overdue = isOverdue(task.dueDate, task.status);
  const initials = getInitials(task.assignee || 'WM');
  const avatarBg = getAvatarColor(task.assignee || 'WM');
  const taskCode = task.taskCode || `FB-${task.taskNumber || 100}`;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group relative bg-white border rounded-lg ${
            isCompact ? 'p-2.5 mb-2' : 'p-3.5 mb-2.5'
          } transition-all duration-150 select-none ${
            snapshot.isDragging
              ? 'shadow-card-dragging border-brand-400 rotate-[1deg] ring-2 ring-brand-400/20 z-50 bg-white'
              : 'border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-slate-300'
          }`}
        >
          {/* Card Top: Task Identifier & Quick Action Buttons */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-medium text-slate-400 tracking-wider">
              {taskCode}
            </span>

            {/* Quick Action Buttons (visible on hover) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(task);
                }}
                className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                title="Edit task"
                aria-label="Edit task"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal(task);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                title="Delete task"
                aria-label="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Task Title */}
          <h4
            onClick={() => openEditModal(task)}
            className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2 hover:text-brand-600 cursor-pointer transition-colors"
          >
            {task.title}
          </h4>

          {/* Short Description */}
          {task.description && (
            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Footer Metadata: Priority, Due Date & Assignee */}
          <div className="flex items-center justify-between pt-3 mt-2.5 border-t border-slate-100/90 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority Label */}
              <PriorityBadge priority={task.priority} />

              {/* Due Date Indicator */}
              {formattedDueDate && (
                <div
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${
                    overdue
                      ? 'text-rose-700 bg-rose-50 border border-rose-200/80'
                      : 'text-slate-500 bg-slate-50 border border-slate-200/60'
                  }`}
                  title={overdue ? 'This task is overdue' : `Due on ${formattedDueDate}`}
                >
                  {overdue ? (
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                  ) : (
                    <Calendar className="w-3 h-3 text-slate-400" />
                  )}
                  <span>{formattedDueDate}</span>
                </div>
              )}
            </div>

            {/* Assignee Avatar */}
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-semibold flex-shrink-0 cursor-default shadow-2xs ${avatarBg}`}
              title={task.assignee || 'Workspace Member'}
            >
              {initials}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;

