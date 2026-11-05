import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import KanbanBoard from '../board/KanbanBoard';
import CalendarView from '../calendar/CalendarView';
import SettingsView from '../settings/SettingsView';
import TaskModal from '../modals/TaskModal';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import { useTasks } from '../../context/TaskContext';
import {
  Kanban,
  CheckSquare,
  LayoutDashboard,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('kanban');
  const { tasks, openCreateModal, openEditModal, userName } = useTasks();

  const currentUserName = userName || 'Workspace Member';
  const myTasks = tasks.filter(
    (t) => (t.assignee && t.assignee.toLowerCase() === currentUserName.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sidebar (Desktop fixed, Mobile sliding drawer) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main Content Area (offset by sidebar width on large screens) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Dynamic View based on Active Tab */}
        <main className="flex-1 flex flex-col">
          {activeTab === 'kanban' && <KanbanBoard />}

          {/* Placeholder: Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Workspace Dashboard</h2>
                    <p className="text-xs text-slate-500">
                      High-level overview of team velocity and task status distribution.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">To Do</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {tasks.filter((t) => t.status === 'todo').length}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium">In Progress</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {tasks.filter((t) => t.status === 'in-progress').length}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-medium">Done</p>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">
                      {tasks.filter((t) => t.status === 'done').length}
                    </p>
                  </div>
                </div>

                {/* Velocity & Priority Breakdown */}
                <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-700">Sprint Completion</span>
                      <span className="text-xs font-bold text-brand-600">
                        {tasks.length > 0
                          ? `${Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            tasks.length > 0
                              ? Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-around text-center">
                    <div>
                      <p className="text-[11px] font-medium text-rose-600">High</p>
                      <p className="text-base font-bold text-slate-800">
                        {tasks.filter((t) => t.priority === 'high').length}
                      </p>
                    </div>
                    <div className="h-7 w-px bg-slate-200" />
                    <div>
                      <p className="text-[11px] font-medium text-amber-600">Medium</p>
                      <p className="text-base font-bold text-slate-800">
                        {tasks.filter((t) => t.priority === 'medium').length}
                      </p>
                    </div>
                    <div className="h-7 w-px bg-slate-200" />
                    <div>
                      <p className="text-[11px] font-medium text-emerald-600">Low</p>
                      <p className="text-base font-bold text-slate-800">
                        {tasks.filter((t) => t.priority === 'low').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('kanban')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors"
                  >
                    <Kanban className="w-4 h-4" />
                    <span>View Kanban Board</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder: My Tasks */}
          {activeTab === 'tasks' && (
            <div className="p-6 max-w-4xl mx-auto w-full space-y-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-5 h-5 text-brand-600" />
                    <h2 className="text-base font-bold text-slate-900">
                      My Assigned Tasks ({myTasks.length})
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCreateModal('todo')}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    + New Task
                  </button>
                </div>

                {myTasks.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No tasks currently assigned to {currentUserName}.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {myTasks.map((t) => (
                      <div
                        key={t._id}
                        onClick={() => openEditModal(t)}
                        className="py-3 px-2 -mx-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-4 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 hover:text-brand-600 truncate">
                            {t.title}
                          </p>
                          <p className="text-[11px] text-slate-400 capitalize">
                            Status: {t.status} • Priority: {t.priority}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-slate-400 flex-shrink-0">
                          {t.taskCode}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interactive Calendar View */}
          {activeTab === 'calendar' && <CalendarView />}

          {/* Full Settings & Preferences View */}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <TaskModal />
      <ConfirmDeleteModal />
    </div>
  );
};

export default MainLayout;

