/**
 * Formats a date into a clean, human-friendly string (e.g. "Nov 12, 2026" or "Nov 12")
 */
export const formatDisplayDate = (dateValue) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return null;

  const currentYear = new Date().getFullYear();
  const options = {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== currentYear ? { year: 'numeric' } : {}),
  };

  return date.toLocaleDateString('en-US', options);
};

/**
 * Checks if a task is overdue (past due date and not marked as done)
 */
export const isOverdue = (dateValue, status) => {
  if (!dateValue || status === 'done') return false;
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return targetDate < today;
};

/**
 * Formats a date for HTML5 <input type="date"> (YYYY-MM-DD)
 */
export const formatInputDate = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

/**
 * Extracts uppercase 1-2 letter initials from a full name
 */
export const getInitials = (name = 'WM') => {
  if (!name || typeof name !== 'string') return 'WM';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Generates consistent background colors for user avatars based on initials
 */
export const getAvatarColor = (name = '') => {
  const colors = [
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-sky-100 text-sky-700 border-sky-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-violet-100 text-violet-700 border-violet-200',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

