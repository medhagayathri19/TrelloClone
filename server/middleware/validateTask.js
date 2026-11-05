export const validateTask = (req, res, next) => {
  const { title, status, priority, dueDate } = req.body;

  // For POST requests, title is mandatory
  if (req.method === 'POST') {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Task title is required and cannot be blank',
      });
    }

    if (title.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Task title cannot exceed 150 characters',
      });
    }
  }

  // If title is passed in PUT, validate if present
  if (req.method === 'PUT' && title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Task title cannot be blank',
      });
    }

    if (title.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Task title cannot exceed 150 characters',
      });
    }
  }

  // Validate status if provided
  if (status !== undefined) {
    const validStatuses = ['todo', 'in-progress', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }
  }

  // Validate priority if provided
  if (priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Priority must be one of: ${validPriorities.join(', ')}`,
      });
    }
  }

  // Validate dueDate if provided
  if (dueDate) {
    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid due date format',
      });
    }
  }

  next();
};

