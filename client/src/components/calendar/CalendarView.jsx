import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ListFilter,
  Grid3X3,
  List,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { formatDisplayDate, isOverdue } from '../../utils/dateUtils';
import { PriorityBadge } from '../ui/Badge';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView = () => {
  const { filteredTasks, openCreateModal, openEditModal } = useTasks();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'agenda'

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Map tasks by date string (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map = new Map();
    filteredTasks.forEach((task) => {
      if (task.dueDate) {
        const d = new Date(task.dueDate);
        if (!isNaN(d.getTime())) {
          const key = d.toISOString().split('T')[0];
          if (!map.has(key)) {
            map.set(key, []);
          }
          map.get(key).push(task);
        }
      }
    });
    return map;
  }, [filteredTasks]);

  // Tasks without due date
  const unscheduledTasks = useMemo(() => {
    return filteredTasks.filter((t) => !t.dueDate);
  }, [filteredTasks]);

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    return filteredTasks.filter((t) => isOverdue(t.dueDate, t.status));
  }, [filteredTasks]);

  // Calendar matrix calculation
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month filler days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevDate = new Date(currentYear, currentMonth - 1, day);
      const dateStr = prevDate.toISOString().split('T')[0];
      cells.push({
        date: prevDate,
        dayNumber: day,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      cells.push({
        date,
        dayNumber: day,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month filler days to complete grid (multiples of 7, up to 35 or 42)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(currentYear, currentMonth + 1, day);
      const dateStr = nextDate.toISOString().split('T')[0];
      cells.push({
        date: nextDate,
        dayNumber: day,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  const statusColors = {
    todo: 'border-l-slate-400 bg-slate-50 hover:bg-slate-100/80 text-slate-800',
    'in-progress': 'border-l-brand-500 bg-brand-50/70 hover:bg-brand-100/70 text-brand-900',
    done: 'border-l-emerald-500 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 line-through opacity-80',
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 space-y-4 max-w-7xl mx-auto w-full">
      {/* Top Banner for Overdue Tasks (if any) */}
      {overdueTasks.length > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>
              <strong>{overdueTasks.length} task{overdueTasks.length > 1 ? 's are' : ' is'} overdue</strong>. Review and reschedule or mark them done.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setViewMode('agenda')}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline"
          >
            View in Schedule
          </button>
        </div>
      )}

      {/* Calendar Header Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Month Title & Prev/Next */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {monthName} {currentYear}
            </h2>
            <p className="text-xs text-slate-500">
              {filteredTasks.length} total tasks • {tasksByDate.size} days with deadlines
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="inline-flex rounded-md shadow-2xs border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-800 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Month Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
                viewMode === 'agenda'
                  ? 'bg-white text-slate-800 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => openCreateModal('todo', new Date().toISOString().split('T')[0])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* Main View: Month Grid or Agenda List */}
      {viewMode === 'grid' ? (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center">
            {WEEKDAYS.map((day, idx) => (
              <div
                key={day}
                className={`py-2 text-[11px] font-semibold uppercase tracking-wider ${
                  idx === 0 || idx === 6 ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day Cells Matrix */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100/90 bg-slate-100">
            {calendarCells.map((cell) => {
              const dayTasks = tasksByDate.get(cell.dateStr) || [];

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => openCreateModal('todo', cell.dateStr)}
                  className={`min-h-[110px] p-1.5 flex flex-col justify-between transition-colors cursor-pointer group bg-white ${
                    cell.isCurrentMonth ? '' : 'bg-slate-50/60 text-slate-400'
                  } ${cell.isToday ? 'bg-brand-50/20 ring-1 ring-inset ring-brand-300' : ''}`}
                >
                  {/* Cell Top: Day Number & Add Icon on Hover */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-brand-600 text-white w-6 h-6'
                          : cell.isCurrentMonth
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateModal('todo', cell.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded transition-all"
                      title={`Add task on ${cell.dateStr}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Tasks List inside Date Cell */}
                  <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px]">
                    {dayTasks.slice(0, 3).map((task) => {
                      const isTaskDone = task.status === 'done';
                      const taskOverdue = isOverdue(task.dueDate, task.status);

                      return (
                        <div
                          key={task._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(task);
                          }}
                          className={`px-1.5 py-0.5 rounded border border-l-2 text-[11px] font-medium truncate flex items-center justify-between transition-colors shadow-2xs ${
                            statusColors[task.status] || statusColors.todo
                          } ${taskOverdue ? 'ring-1 ring-rose-400/50' : ''}`}
                          title={`${task.taskCode || 'FB'}: ${task.title} (${task.priority})`}
                        >
                          <span className="truncate">{task.title}</span>
                          <span className="text-[9px] uppercase font-mono opacity-60 ml-1">
                            {task.priority[0]}
                          </span>
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewMode('agenda');
                        }}
                        className="text-[10px] text-brand-600 font-semibold px-1 hover:underline cursor-pointer"
                      >
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda / Timeline Schedule View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Scheduled Items (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>Sprint Timeline & Due Dates</span>
              </h3>

              {tasksByDate.size === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No tasks currently scheduled with due dates. Click on any date or "+ Add Task" to set deadlines.
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from(tasksByDate.entries())
                    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                    .map(([dateKey, tasksOnDate]) => {
                      const displayDate = formatDisplayDate(dateKey);
                      const isPast = isOverdue(dateKey, 'todo');

                      return (
                        <div key={dateKey} className="border-l-2 border-slate-200 pl-4 py-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`text-xs font-bold uppercase tracking-wider ${
                                isPast ? 'text-rose-600' : 'text-slate-800'
                              }`}
                            >
                              {displayDate}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ({tasksOnDate.length} item{tasksOnDate.length > 1 ? 's' : ''})
                            </span>
                          </div>

                          <div className="space-y-2">
                            {tasksOnDate.map((task) => (
                              <div
                                key={task._id}
                                onClick={() => openEditModal(task)}
                                className="flex items-center justify-between p-3 rounded-lg border border-slate-200/70 hover:border-brand-300 hover:shadow-card-hover bg-slate-50/50 hover:bg-white transition-all cursor-pointer"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      task.status === 'done'
                                        ? 'bg-emerald-500'
                                        : task.status === 'in-progress'
                                        ? 'bg-brand-500'
                                        : 'bg-slate-400'
                                    }`}
                                  />
                                  <div className="min-w-0">
                                    <p
                                      className={`text-xs font-semibold text-slate-900 truncate ${
                                        task.status === 'done' ? 'line-through text-slate-400' : ''
                                      }`}
                                    >
                                      {task.title}
                                    </p>
                                    <p className="text-[11px] text-slate-400 truncate">
                                      {task.taskCode || 'FB'} • Assigned to {task.assignee || 'Member'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <PriorityBadge priority={task.priority} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Unscheduled / Backlog Tasks Side Card */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Unscheduled Tasks</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  {unscheduledTasks.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                These tasks do not have a due date yet. Click to schedule them.
              </p>

              {unscheduledTasks.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  All tasks have scheduled deadlines!
                </div>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {unscheduledTasks.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => openEditModal(t)}
                      className="p-2.5 rounded-lg border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/30 cursor-pointer transition-all"
                    >
                      <p className="text-xs font-medium text-slate-800 line-clamp-1">{t.title}</p>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                        <span>{t.taskCode || 'FB'}</span>
                        <span className="capitalize">{t.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;

