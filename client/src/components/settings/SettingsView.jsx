import React, { useState } from 'react';
import {
  Settings,
  User,
  Building2,
  Sliders,
  Database,
  Download,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Radio,
  ShieldAlert,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { getInitials, getAvatarColor } from '../../utils/dateUtils';

export const SettingsView = () => {
  const {
    tasks,
    userName,
    setUserName,
    userRole,
    setUserRole,
    workspaceName,
    setWorkspaceName,
    cardDensity,
    setCardDensity,
    defaultPriority,
    setDefaultPriority,
    isSocketConnected,
    resetDemoTasks,
    clearAllTasks,
  } = useTasks();

  const { toast } = useToast();

  const [localName, setLocalName] = useState(userName);
  const [localRole, setLocalRole] = useState(userRole);
  const [localWorkspace, setLocalWorkspace] = useState(workspaceName);
  const [localPriority, setLocalPriority] = useState(defaultPriority);
  const [localDensity, setLocalDensity] = useState(cardDensity);

  const [isResetting, setIsResetting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const initials = getInitials(localName);
  const avatarBg = getAvatarColor(localName);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUserName(localName.trim() || 'Workspace Member');
    setUserRole(localRole.trim() || 'Lead Product Engineer');
    setWorkspaceName(localWorkspace.trim() || 'Engineering Core');
    setDefaultPriority(localPriority);
    setCardDensity(localDensity);
    toast.success('Workspace preferences updated successfully');
  };

  // Export tasks as JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `flowboard-tasks-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.info('Tasks exported as JSON file');
  };

  // Reset to default sample tasks
  const handleResetDemo = async () => {
    setIsResetting(true);
    await resetDemoTasks();
    setIsResetting(false);
  };

  // Clear all tasks
  const handleClearAll = async () => {
    setIsClearing(true);
    await clearAllTasks();
    setIsClearing(false);
    setShowConfirmClear(false);
  };

  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const todoCount = tasks.filter((t) => t.status === 'todo').length;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Settings Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Settings & Preferences
            </h2>
            <p className="text-xs text-slate-500">
              Customize your profile, workspace defaults, board density, and database tools.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isSocketConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {isSocketConnected ? 'WebSocket Online' : 'Connecting'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Profile & Preferences Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-semibold text-slate-900">User Profile & Workspace</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  placeholder="e.g. Workspace Member"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Role / Title
                </label>
                <input
                  type="text"
                  value={localRole}
                  onChange={(e) => setLocalRole(e.target.value)}
                  placeholder="e.g. Lead Full-Stack Engineer"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={localWorkspace}
                  onChange={(e) => setLocalWorkspace(e.target.value)}
                  placeholder="e.g. Engineering Core"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Sliders className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-semibold text-slate-900">Board Defaults</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default New Task Priority
                  </label>
                  <select
                    value={localPriority}
                    onChange={(e) => setLocalPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Board Card Density
                  </label>
                  <select
                    value={localDensity}
                    onChange={(e) => setLocalDensity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="comfortable">Comfortable (Standard)</option>
                    <option value="compact">Compact (High Information Density)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-md shadow-xs transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </form>

          {/* Data Management & Backup */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Database className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-semibold text-slate-900">Data Management & Backup</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export JSON */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Export Workspace Tasks</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Download all {tasks.length} tasks and metadata as a standard JSON file.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>

              {/* Reset Demo Data */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Restore Sample Tasks</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Repopulate the database with the 7 original demo sprint tasks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetDemo}
                  disabled={isResetting}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-brand-50 border border-brand-200 hover:bg-brand-100 text-brand-700 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                  <span>{isResetting ? 'Restoring...' : 'Restore Demo Tasks'}</span>
                </button>
              </div>
            </div>

            {/* Danger Zone: Clear Tasks */}
            <div className="mt-4 p-4 rounded-lg border border-rose-200 bg-rose-50/50">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-rose-900">Danger Zone: Wipe All Tasks</h4>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Permanently delete all tasks in the database to test clean empty states.
                  </p>

                  {showConfirmClear ? (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={handleClearAll}
                        disabled={isClearing}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                      >
                        {isClearing ? 'Clearing...' : 'Confirm Clear All'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmClear(false)}
                        className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowConfirmClear(true)}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-medium rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All Board Tasks</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Profile Card & System Diagnostics */}
        <div className="space-y-6">
          {/* Profile Card Preview */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs text-center">
            <div
              className={`w-16 h-16 rounded-full border-2 mx-auto flex items-center justify-center text-lg font-bold shadow-xs ${avatarBg}`}
            >
              {initials}
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-3">{localName || 'Workspace Member'}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{localRole || 'Lead Product Engineer'}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
              <Building2 className="w-3 h-3" />
              <span>{localWorkspace || 'Engineering Core'}</span>
            </div>
          </div>

          {/* System & Database Metrics */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider text-slate-400">
              System Diagnostics
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Database Engine</span>
                <span className="font-semibold text-slate-800">MongoDB / Mongoose</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">API Server</span>
                <span className="font-semibold text-slate-800">Express v4.21 (Port 5000)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Real-Time Sync</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Socket.io v4.8</span>
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Total Tasks</span>
                <span className="font-semibold text-slate-800">{tasks.length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Completed Rate</span>
                <span className="font-semibold text-slate-800">
                  {tasks.length > 0 ? `${Math.round((completedCount / tasks.length) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

