import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
  resetDemoTasks,
  clearAllTasks,
} from '../controllers/taskController.js';
import { validateTask } from '../middleware/validateTask.js';

const router = express.Router();

router.route('/')
  .get(getTasks)
  .post(validateTask, createTask);

router.route('/batch/reorder')
  .put(reorderTasks);

router.post('/manage/reset', resetDemoTasks);
router.delete('/manage/clear', clearAllTasks);

router.route('/:id')
  .get(getTaskById)
  .put(validateTask, updateTask)
  .delete(deleteTask);

export default router;

