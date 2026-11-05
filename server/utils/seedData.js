import Task from '../models/Task.js';

export const initialTasks = [
  {
    taskNumber: 101,
    title: 'Research OAuth 2.0 PKCE authentication flow',
    description: 'Evaluate security requirements and token refresh strategies for mobile and web clients.',
    status: 'todo',
    priority: 'high',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days later
    assignee: 'Alex Chen',
    order: 0,
  },
  {
    taskNumber: 102,
    title: 'Design system typography & color tokens audit',
    description: 'Harmonize neutral grays, font weight scales, and contrast ratios with WCAG AAA specs.',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    assignee: 'Sarah Lin',
    order: 1,
  },
  {
    taskNumber: 103,
    title: 'Set up automated end-to-end Cypress test suite',
    description: 'Configure CI pipelines to run cross-browser smoke tests on every release tag.',
    status: 'todo',
    priority: 'low',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    assignee: 'Marcus Vance',
    order: 2,
  },
  {
    taskNumber: 104,
    title: 'Refactor Kanban drag-and-drop optimistic state',
    description: 'Eliminate layout shifts and implement smooth drop transitions with position recovery.',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    assignee: 'Devon Patel',
    order: 0,
  },
  {
    taskNumber: 105,
    title: 'Optimize MongoDB query indexing for workspace boards',
    description: 'Add compound indices on (status, order) and benchmark query latency on 50k rows.',
    status: 'in-progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    assignee: 'Alex Chen',
    order: 1,
  },
  {
    taskNumber: 106,
    title: 'Deploy microservice health metrics endpoint',
    description: 'Integrate Prometheus metrics scraper for CPU, memory, and database connection pool.',
    status: 'done',
    priority: 'low',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
    assignee: 'Sarah Lin',
    order: 0,
  },
  {
    taskNumber: 107,
    title: 'Implement Dark/Light mode theme system architecture',
    description: 'Standardize CSS variable tokens and verify zero flash of unstyled theme on load.',
    status: 'done',
    priority: 'medium',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    assignee: 'Devon Patel',
    order: 1,
  },
];

export const seedDatabase = async () => {
  try {
    const count = await Task.countDocuments();
    if (count === 0) {
      console.log('[Seed] Database is empty. Seeding realistic sample tasks...');
      await Task.insertMany(initialTasks);
      console.log(`[Seed] Successfully seeded ${initialTasks.length} tasks.`);
    } else {
      console.log(`[Seed] Database already contains ${count} tasks. Skipping seed.`);
    }
  } catch (error) {
    console.error('[Seed] Error seeding database:', error.message);
  }
};

