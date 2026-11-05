import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { taskService } from '../services/api';
import socket from '../services/socket';
import { useToast } from './ToastContext';

const fallbackInitialTasks = [
  {
    _id: 'task_101',
    taskNumber: 101,
    taskCode: 'FB-101',
    title: 'Research OAuth 2.0 PKCE authentication flow',
    description: 'Evaluate security requirements and token refresh strategies for mobile and web clients.',
    status: 'todo',
    priority: 'high',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: 'Alex Chen',
    order: 0,
  },
  {
    _id: 'task_102',
    taskNumber: 102,
    taskCode: 'FB-102',
    title: 'Design system typography & color tokens audit',
    description: 'Harmonize neutral grays, font weight scales, and contrast ratios with WCAG AAA specs.',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: 'Sarah Lin',
    order: 1,
  },
  {
    _id: 'task_103',
    taskNumber: 103,
    taskCode: 'FB-103',
    title: 'Set up automated end-to-end Cypress test suite',
    description: 'Configure CI pipelines to run cross-browser smoke tests on every release tag.',
    status: 'todo',
    priority: 'low',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: 'Marcus Vance',
    order: 2,
  },
  {
    _id: 'task_104',
    taskNumber: 104,
    taskCode: 'FB-104',
    title: 'Refactor Kanban drag-and-drop optimistic state',
    description: 'Eliminate layout shifts and implement smooth drop transitions with position recovery.',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: 'Devon Patel',
    order: 0,
  },
  {
    _id: 'task_105',
    taskNumber: 105,
    taskCode: 'FB-105',
    title: 'Optimize MongoDB query indexing for workspace boards',
    description: 'Add compound indices on (status, order) and benchmark query latency on 50k rows.',
    status: 'in-progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: 'Alex Chen',
    order: 1,
  },
  {
    _id: 'task_106',
    taskNumber: 106,
    taskCode: 'FB-106',
    title: 'Deploy microservice health metrics endpoint',
    description: 'Integrate Prometheus metrics scraper for CPU, memory, and database connection pool.',
    status: 'done',
    priority: 'low',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: 'Sarah Lin',
    order: 0,
  },
  {
    _id: 'task_107',
    taskNumber: 107,
    taskCode: 'FB-107',
    title: 'Implement Dark/Light mode theme system architecture',
    description: 'Standardize CSS variable tokens and verify zero flash of unstyled theme on load.',
    status: 'done',
    priority: 'medium',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: 'Devon Patel',
    order: 1,
  },
];

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
        localStorage.setItem('fb_client_tasks', JSON.stringify(response.data));
      }
    } catch (err) {
      console.warn('[TaskContext] API offline or static hosting detected, activating client persistence:', err.message);
      const saved = localStorage.getItem('fb_client_tasks');
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch {
          setTasks(fallbackInitialTasks);
          localStorage.setItem('fb_client_tasks', JSON.stringify(fallbackInitialTasks));
        }
      } else {
        setTasks(fallbackInitialTasks);
        localStorage.setItem('fb_client_tasks', JSON.stringify(fallbackInitialTasks));
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

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
    const newTaskNumber = tasks.length > 0
      ? Math.max(...tasks.map((t) => t.taskNumber || 100)) + 1
      : 101;
    const clientTask = {
      _id: 'task_' + Date.now(),
      taskNumber: newTaskNumber,
      taskCode: `FB-${newTaskNumber}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...taskData,
    };

    try {
      const response = await taskService.createTask(taskData);
      const created = response.data;
      setTasks((prev) => {
        if (prev.some((t) => t._id === created._id)) return prev;
        const updated = [...prev, created];
        localStorage.setItem('fb_client_tasks', JSON.stringify(updated));
        return updated;
      });
      toast.success('Task created successfully');
      return { success: true, data: created };
    } catch {
      setTasks((prev) => {
        const updated = [...prev, clientTask];
        localStorage.setItem('fb_client_tasks', JSON.stringify(updated));
        return updated;
      });
      toast.success('Task created successfully');
      return { success: true, data: clientTask };
    }
  };

  // Update Task
  const updateTask = async (id, taskData) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t._id === id ? { ...t, ...taskData } : t));
      localStorage.setItem('fb_client_tasks', JSON.stringify(updated));
      return updated;
    });

    try {
      const response = await taskService.updateTask(id, taskData);
      toast.success('Task updated successfully');
      return { success: true, data: response.data };
    } catch {
      toast.success('Task updated successfully');
      return { success: true };
    }
  };

  // Delete Task
  const deleteTask = async (id) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t._id !== id);
      localStorage.setItem('fb_client_tasks', JSON.stringify(updated));
      return updated;
    });

    try {
      await taskService.deleteTask(id);
      toast.success('Task deleted successfully');
      return { success: true };
    } catch {
      toast.success('Task deleted successfully');
      return { success: true };
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

    // 1. Optimistic UI update & localStorage save
    setTasks(updatedTasksList);
    localStorage.setItem('fb_client_tasks', JSON.stringify(updatedTasksList));

    // 2. Persist to MongoDB via batch reorder API
    try {
      await taskService.reorderTasks(updates);
    } catch {
      // Silently persist locally if API is absent (GitHub Pages)
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
        localStorage.setItem('fb_client_tasks', JSON.stringify(response.data));
      }
      toast.success('Workspace reset to default tasks');
      return { success: true };
    } catch {
      setTasks(fallbackInitialTasks);
      localStorage.setItem('fb_client_tasks', JSON.stringify(fallbackInitialTasks));
      toast.success('Workspace reset to default tasks');
      return { success: true };
    }
  };

  // Clear all tasks
  const clearAllTasks = async () => {
    setTasks([]);
    localStorage.setItem('fb_client_tasks', JSON.stringify([]));
    try {
      await taskService.clearAllTasks();
    } catch {
      // offline mode
    }
    toast.success('All tasks cleared');
    return { success: true };
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

