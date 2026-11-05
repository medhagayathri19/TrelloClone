import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: '{VALUE} is not a valid status',
      },
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    assignee: {
      type: String,
      trim: true,
      default: 'Workspace Member',
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    taskNumber: {
      type: Number,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to assign sequential taskNumber if not present
taskSchema.pre('save', async function (next) {
  if (this.isNew && !this.taskNumber) {
    try {
      const highestTask = await this.constructor
        .findOne({}, { taskNumber: 1 })
        .sort({ taskNumber: -1 })
        .lean();
      this.taskNumber = (highestTask && highestTask.taskNumber ? highestTask.taskNumber : 100) + 1;
    } catch (err) {
      this.taskNumber = Math.floor(100 + Math.random() * 900);
    }
  }
  next();
});

// Virtual for formatted task code FB-101
taskSchema.virtual('taskCode').get(function () {
  return `FB-${this.taskNumber || 101}`;
});

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;

