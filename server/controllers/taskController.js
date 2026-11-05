import Task from '../models/Task.js';
import { getIO } from '../socket.js';
import { initialTasks } from '../utils/seedData.js';

// @desc    Fetch all tasks
// @route   GET /api/tasks
// @access  Public
export const getTasks = async (req, res, next) => {
  try {
    const { search, priority, status } = req.query;
    const filter = {};

    if (search && search.trim() !== '') {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { assignee: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const tasks = await Task.find(filter).sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch a single task
// @route   GET /api/tasks/:id
// @access  Public
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with ID ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Public
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status = 'todo', priority = 'medium', dueDate, assignee } = req.body;

    // Find the current highest order in the target column
    const highestOrderTask = await Task.findOne({ status })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const nextOrder = highestOrderTask && typeof highestOrderTask.order === 'number'
      ? highestOrderTask.order + 1
      : 0;

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignee: assignee && assignee.trim() ? assignee.trim() : 'Workspace Member',
      order: nextOrder,
    });

    // Broadcast real-time event
    const io = getIO();
    if (io) {
      io.emit('task:created', task);
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details or status
// @route   PUT /api/tasks/:id
// @access  Public
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignee, order } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with ID ${req.params.id}`,
      });
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignee !== undefined) task.assignee = assignee.trim();
    if (order !== undefined) task.order = Number(order);

    const updatedTask = await task.save();

    // Broadcast real-time update event
    const io = getIO();
    if (io) {
      io.emit('task:updated', updatedTask);
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Batch reorder tasks (drag-and-drop batch update)
// @route   PUT /api/tasks/batch/reorder
// @access  Public
export const reorderTasks = async (req, res, next) => {
  try {
    const { updates } = req.body; // Array of { id, status, order }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A non-empty updates array is required',
      });
    }

    const bulkOperations = updates.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: {
          $set: {
            status: item.status,
            order: item.order,
          },
        },
      },
    }));

    await Task.bulkWrite(bulkOperations);

    // Fetch the updated tasks to broadcast
    const updatedTaskIds = updates.map((u) => u.id);
    const affectedTasks = await Task.find({ _id: { $in: updatedTaskIds } });

    const io = getIO();
    if (io) {
      io.emit('tasks:reordered', {
        updates,
        tasks: affectedTasks,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tasks reordered successfully',
      data: affectedTasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Public
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with ID ${req.params.id}`,
      });
    }

    await task.deleteOne();

    // Broadcast real-time delete event
    const io = getIO();
    if (io) {
      io.emit('task:deleted', { id: req.params.id });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset tasks to default demo tasks
// @route   POST /api/tasks/manage/reset
// @access  Public
export const resetDemoTasks = async (req, res, next) => {
  try {
    await Task.deleteMany({});
    const createdTasks = await Task.insertMany(initialTasks);

    const io = getIO();
    if (io) {
      io.emit('tasks:reset', createdTasks);
    }

    res.status(200).json({
      success: true,
      message: 'Tasks reset to demo data successfully',
      count: createdTasks.length,
      data: createdTasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all tasks
// @route   DELETE /api/tasks/manage/clear
// @access  Public
export const clearAllTasks = async (req, res, next) => {
  try {
    await Task.deleteMany({});

    const io = getIO();
    if (io) {
      io.emit('tasks:cleared');
    }

    res.status(200).json({
      success: true,
      message: 'All tasks cleared successfully',
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

