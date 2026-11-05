import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { taskService } from '../services/api';
import socket from '../services/socket';
import { useToast } from './ToastContext';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortByDueDate, setSortByDueDate] = useState('none'); // 'none' | 'asc' | 'desc'
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalInitialStatus, setModalInitialStatus] = useState('todo');
  const [modalInitialDueDate, setModalInitialDueDate] = useState('');
  const [deletingTask, setDeletingTask] = useState(null);

  // Settings & Profile states (persisted in localStorage)
  const [userName, setUserName] = useState(() => localStorage.getItem('fb_user_name') || 'Workspace Member');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('fb_user_role') || 'Lead Product Engineer');
  const [workspaceName, setWorkspaceName] = useState(() => localStorage.getItem('fb_workspace_name') || 'Engineering Core');
  const [cardDensity, setCardDensity] = useState(() => localStorage.getItem('fb_card_density') || 'comfortable');
  const [defaultPriority, setDefaultPriority] = useState(() => localStorage.getItem('fb_default_priority') || 'medium');

  useEffect(() => {
    localStorage.setItem('fb_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('fb_user_role', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('fb_workspace_name', workspaceName);
  }, [workspaceName]);

  useEffect(() => {
    localStorage.setItem('fb_card_density', cardDensity);
  }, [cardDensity]);

  useEffect(() => {
    localStorage.setItem('fb_default_priority', defaultPriority);
  }, [defaultPriority]);

  const { toast } = useToast();

  // Fetch all tasks from API
  const fetchTasks = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const response = await taskService.getTasks();
      if (response && response.data) {
        setTasks(response.data);
      }
    } catch (err) {
      console.error('[TaskContext] Error loading tasks:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load tasks');
      toast.error('Unable to connect to FlowBoard server.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    fetchTasks(true);
  }, [fetchTasks]);

  // Real-time Socket.io event listeners
  useEffect(() => {
    const handleConnect = () => setIsSocketConnected(true);
    const handleDisconnect = () => setIsSocketConnected(false);

    const handleTaskCreated = (newTask) => {
      setTasks((prev) => {
        if (prev.some((t) => t._id === newTask._id)) return prev;
        return [...prev, newTask];
      });
    };

    const handleTaskUpdated = (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? { ...t, ...updatedTask } : t))
      );
    };

    const handleTaskDeleted = ({ id }) => {
      setTasks((prev) => prev.filter((t) => t._id !== id));
    };

    const handleTasksReordered = ({ updates }) => {
      setTasks((prev) => {
        const updateMap = new Map(updates.map((u) => [u.id, u]));
        return prev.map((t) => {
          if (updateMap.has(t._id)) {
            const u = updateMap.get(t._id);
            return { ...t, status: u.status, order: u.order };
          }
          return t;
        });
      });
    };

    const handleTasksReset = (newTasks) => {
      setTasks(newTasks);
      toast.info('Workspace reset to demo tasks');
    };

    const handleTasksCleared = () => {
      setTasks([]);
      toast.info('Workspace tasks cleared');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('tasks:reordered', handleTasksReordered);
    socket.on('tasks:reset', handleTasksReset);
    socket.on('tasks:cleared', handleTasksCleared);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('tasks:reordered', handleTasksReordered);
      socket.off('tasks:reset', handleTasksReset);
      socket.off('tasks:cleared', handleTasksCleared);
    };
  }, []);

  // Create Task
  const createTask = async (taskData) => {
    try {
      const response = await taskService.createTask(taskData);
      const created = response.data;
      setTasks((prev) => {
        if (prev.some((t) => t._id === created._id)) return prev;
        return [...prev, created];
      });
      toast.success('Task created successfully');
      return { success: true, data: created };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create task';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Update Task
  const updateTask = async (id, taskData) => {
    try {
      const response = await taskService.updateTask(id, taskData);
      const updated = response.data;
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      toast.success('Task updated successfully');
      return { success: true, data: updated };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update task';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Delete Task
  const deleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success('Task deleted successfully');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete task';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Optimistic Drag-and-Drop Handler
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    // Snapshot current state for rollback
    const previousTasks = [...tasks];

    // Filter tasks by status and sort by current order
    const sourceColumnTasks = tasks
      .filter((t) => t.status === sourceStatus)
      .sort((a, b) => a.order - b.order);

    const destColumnTasks = sourceStatus === destStatus
      ? sourceColumnTasks
      : tasks.filter((t) => t.status === destStatus).sort((a, b) => a.order - b.order);

    const movedTask = tasks.find((t) => t._id === draggableId);
    if (!movedTask) return;

    let updatedTasksList = [];
    const updates = [];

    if (sourceStatus === destStatus) {
      // Reordering within the same column
      const reordered = Array.from(sourceColumnTasks);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);

      // Reassign sequential orders
      const updatedWithOrders = reordered.map((t, idx) => {
        updates.push({ id: t._id, status: sourceStatus, order: idx });
        return { ...t, order: idx };
      });

      updatedTasksList = tasks.map((t) => {
        const found = updatedWithOrders.find((u) => u._id === t._id);
        return found || t;
      });
    } else {
      // Moving across different columns
      const newSourceList = Array.from(sourceColumnTasks);
      newSourceList.splice(source.index, 1);

      const newDestList = Array.from(destColumnTasks);
      const updatedMovedTask = { ...movedTask, status: destStatus };
      newDestList.splice(destination.index, 0, updatedMovedTask);

      // Reassign orders in source column
      const updatedSource = newSourceList.map((t, idx) => {
        updates.push({ id: t._id, status: sourceStatus, order: idx });
        return { ...t, order: idx };
      });

      // Reassign orders in destination column
      const updatedDest = newDestList.map((t, idx) => {
        updates.push({ id: t._id, status: destStatus, order: idx });
        return { ...t, status: destStatus, order: idx };
      });

      const updatedMap = new Map([
        ...updatedSource.map((t) => [t._id, t]),
        ...updatedDest.map((t) => [t._id, t]),
      ]);

      updatedTasksList = tasks.map((t) => {
        if (updatedMap.has(t._id)) {
          return updatedMap.get(t._id);
        }
        return t;
      });
    }

    // 1. Optimistic UI update
    setTasks(updatedTasksList);

    // 2. Persist to MongoDB via batch reorder API
    try {
      await taskService.reorderTasks(updates);
    } catch (err) {
      console.error('[TaskContext] Drag-and-drop persist failed, rolling back:', err);
      setTasks(previousTasks);
      toast.error('Could not save task position. Reverted changes.');
    }
  };

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.assignee && t.assignee.toLowerCase().includes(q)) ||
          (t.taskCode && t.taskCode.toLowerCase().includes(q))
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Due date sort
    if (sortByDueDate === 'asc') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (sortByDueDate === 'desc') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
      });
    }

    return result;
  }, [tasks, searchQuery, priorityFilter, sortByDueDate]);

  // Group filtered tasks by column status
  const columns = useMemo(() => {
    return {
      todo: filteredTasks
        .filter((t) => t.status === 'todo')
        .sort((a, b) => a.order - b.order),
      'in-progress': filteredTasks
        .filter((t) => t.status === 'in-progress')
        .sort((a, b) => a.order - b.order),
      done: filteredTasks
        .filter((t) => t.status === 'done')
        .sort((a, b) => a.order - b.order),
    };
  }, [filteredTasks]);

  // Reset demo tasks
  const resetDemoTasks = async () => {
    try {
      const response = await taskService.resetDemoTasks();
      if (response && response.data) {
        setTasks(response.data);
      }
      toast.success('Workspace reset to default tasks');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset tasks';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Clear all tasks
  const clearAllTasks = async () => {
    try {
      await taskService.clearAllTasks();
      setTasks([]);
      toast.success('All tasks cleared');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to clear tasks';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Mark all tasks in a column as done
  const markAllColumnTasksAsDone = async (sourceStatus = 'todo') => {
    const targetTasks = tasks.filter((t) => t.status === sourceStatus);
    if (targetTasks.length === 0) return;

    const previousTasks = [...tasks];
    const doneTasks = tasks.filter((t) => t.status === 'done');
    const baseOrder = doneTasks.length;

    const updates = targetTasks.map((t, idx) => ({
      id: t._id,
      status: 'done',
      order: baseOrder + idx,
    }));

    const updatedList = tasks.map((t) => {
      if (t.status === sourceStatus) {
        const u = updates.find((item) => item.id === t._id);
        return { ...t, status: 'done', order: u ? u.order : t.order };
      }
      return t;
    });

    setTasks(updatedList);
    toast.success(`Marked ${targetTasks.length} tasks as Done`);

    try {
      await taskService.reorderTasks(updates);
    } catch (err) {
      setTasks(previousTasks);
      toast.error('Failed to update tasks status. Rolled back.');
    }
  };

  // Modal helpers
  const openCreateModal = (status = 'todo', dueDate = '') => {
    setEditingTask(null);
    setModalInitialStatus(status);
    setModalInitialDueDate(dueDate);
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setModalInitialDueDate('');
  };

  const openDeleteModal = (task) => {
    setDeletingTask(task);
  };

  const closeDeleteModal = () => {
    setDeletingTask(null);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        columns,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        priorityFilter,
        setPriorityFilter,
        sortByDueDate,
        setSortByDueDate,
        isSocketConnected,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        resetDemoTasks,
        clearAllTasks,
        markAllColumnTasksAsDone,
        handleDragEnd,
        // Modal states
        isTaskModalOpen,
        editingTask,
        modalInitialStatus,
        modalInitialDueDate,
        openCreateModal,
        openEditModal,
        closeTaskModal,
        deletingTask,
        openDeleteModal,
        closeDeleteModal,
        // Profile & preferences
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
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

