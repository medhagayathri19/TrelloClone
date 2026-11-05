import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Menu,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Radio,
  CheckCircle2,
  Check,
  Trash2,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import socket from '../../services/socket';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'n_1',
    title: 'FlowBoard sync active',
    message: 'Connected to live WebSocket updates.',
    time: 'Just now',
    type: 'success',
    read: false,
  },
  {
    id: 'n_2',
    title: 'Workspace loaded',
    message: 'All tasks synchronized with MongoDB.',
    time: '5m ago',
    type: 'info',
    read: false,
  },
  {
    id: 'n_3',
    title: 'Sprint board initialized',
    message: 'To Do, In Progress, and Done lanes ready.',
    time: '1h ago',
    type: 'info',
    read: false,
  },
];

export const Header = ({ onOpenSidebar }) => {
  const {
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    sortByDueDate,
    setSortByDueDate,
    isSocketConnected,
    openCreateModal,
    tasks,
  } = useTasks();

  const { toast } = useToast();

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Notifications state with localStorage persistence
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_notifications');
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fb_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Could not save notifications to localStorage', e);
    }
  }, [notifications]);

  // Listen for real-time task creations to add live notifications
  useEffect(() => {
    const handleNewTask = (task) => {
      const newNotif = {
        id: 'n_' + Date.now(),
        title: 'New task created',
        message: `"${task.title}" added to ${task.status}`,
        time: 'Just now',
        type: 'info',
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
    };

    socket.on('task:created', handleNewTask);
    return () => socket.off('task:created', handleNewTask);
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  // Mark single notification as read
  const handleMarkSingleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Dismiss single notification
  const handleDismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Clear all notifications
  const handleClearAllNotifications = () => {
    setNotifications([]);
    toast.info('Notifications cleared');
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Top Bar: Title & Primary Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left: Mobile Menu & Page Heading */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Project Board
                </h1>
                {/* Real-time sync badge */}
                <span
                  title={
                    isSocketConnected
                      ? 'Live real-time sync active'
                      : 'Disconnected from real-time server'
                  }
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                    isSocketConnected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  {isSocketConnected ? 'Live' : 'Connecting'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Organize tasks and keep work moving.
                <span className="hidden sm:inline text-slate-400 ml-2">
                  • {doneTasks} of {totalTasks} completed
                </span>
              </p>
            </div>
          </div>

          {/* Right: Search, Filter, Notifications, Add Task CTA */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                aria-label="Filter tasks by priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="appearance-none pl-7 pr-7 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 cursor-pointer transition-colors"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort by Due Date */}
            <div className="relative">
              <select
                aria-label="Sort tasks by due date"
                value={sortByDueDate}
                onChange={(e) => setSortByDueDate(e.target.value)}
                className="appearance-none pl-7 pr-7 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 cursor-pointer transition-colors"
              >
                <option value="none">Default Order</option>
                <option value="asc">Earliest Due</option>
                <option value="desc">Latest Due</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-in zoom-in-75">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-84 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  {/* Popover Header */}
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        Notifications
                      </span>
                      {unreadCount > 0 ? (
                        <span className="text-[10px] px-1.5 py-0.2 bg-brand-50 text-brand-700 font-semibold rounded-full border border-brand-200">
                          {unreadCount} new
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-500 font-medium rounded-full">
                          All caught up
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadCount > 0 ? (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-brand-600 hover:text-brand-800 font-semibold hover:underline transition-colors cursor-pointer"
                        >
                          Mark all read
                        </button>
                      ) : (
                        notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAllNotifications}
                            className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          >
                            Clear all
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Popover Content */}
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 px-4 text-center">
                        <Inbox className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-medium text-slate-700">No notifications</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Activity and updates will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`px-4 py-2.5 transition-colors group flex items-start justify-between gap-2 ${
                            item.read ? 'bg-white hover:bg-slate-50' : 'bg-brand-50/20 hover:bg-brand-50/40'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            {item.type === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Radio className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p
                                  className={`text-xs truncate ${
                                    item.read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'
                                  }`}
                                >
                                  {item.title}
                                </p>
                                {!item.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                                {item.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {item.time}
                              </span>
                            </div>
                          </div>

                          {/* Quick item actions */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0 mt-0.5">
                            {!item.read && (
                              <button
                                type="button"
                                onClick={() => handleMarkSingleRead(item.id)}
                                className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDismissNotification(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Dismiss"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Add Task Primary Button */}
            <button
              type="button"
              onClick={() => openCreateModal('todo')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-xs hover:shadow-subtle transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
