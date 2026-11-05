import React from 'react';
import {
  Kanban,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Settings,
  ChevronDown,
  Building2,
  X,
  Sparkles,
} from 'lucide-react';
import { getInitials, getAvatarColor } from '../../utils/dateUtils';
import { useTasks } from '../../context/TaskContext';

export const Sidebar = ({ isOpen, onClose, activeTab = 'kanban', onTabChange }) => {
  const { userName, workspaceName } = useTasks();
  const initials = getInitials(userName || 'Workspace Member');
  const avatarBg = getAvatarColor(userName || 'Workspace Member');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onClose();
          }}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header / Brand */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-xs">
                <Kanban className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                  FlowBoard
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-brand-50 text-brand-700 rounded border border-brand-200">
                    SaaS
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">Team Workspace</span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Workspace Selector */}
          <div
            onClick={() => onTabChange && onTabChange('settings')}
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/40 transition-colors cursor-pointer"
            title="Configure workspace in Settings"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div className="truncate">
                <p className="text-xs font-medium text-slate-800 truncate">{workspaceName || 'Engineering Core'}</p>
                <p className="text-[10px] text-slate-400">Team workspace</p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-2 mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Navigation
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (onTabChange) onTabChange(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-normal">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Info Box */}
          <div className="pt-6">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Real-Time Sync</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Changes update instantly across all open tabs and team members via WebSockets.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom User Profile */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white hover:shadow-xs transition-all">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarBg}`}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{userName}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  <p className="text-[11px] text-slate-400 truncate">Online</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onTabChange && onTabChange('settings')}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
              title="Workspace settings"
              aria-label="Workspace settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

