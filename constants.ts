import { FileType } from './types';

export const THEME_COLORS = {
  purple: 'text-purple-600 bg-purple-600 border-purple-600',
  blue: 'text-blue-600 bg-blue-600 border-blue-600',
  green: 'text-emerald-600 bg-emerald-600 border-emerald-600',
  red: 'text-rose-600 bg-rose-600 border-rose-600',
  custom: 'text-indigo-600 bg-indigo-600 border-indigo-600',
};

export const BG_THEME_COLORS = {
  purple: 'bg-purple-50 dark:bg-purple-900/20',
  blue: 'bg-blue-50 dark:bg-blue-900/20',
  green: 'bg-emerald-50 dark:bg-emerald-900/20',
  red: 'bg-rose-50 dark:bg-rose-900/20',
  custom: 'bg-indigo-50 dark:bg-indigo-900/20',
};

export const INITIAL_FILES = [
  {
    id: 'welcome-doc',
    title: 'Welcome Guide',
    type: FileType.DOC,
    content: '<h1>Welcome to ProductivityOS</h1><p>This is your new personal workspace.</p>',
    lastModified: Date.now(),
  },
  {
    id: 'budget-sheet',
    title: 'Monthly Budget',
    type: FileType.SHEET,
    content: {}, 
    lastModified: Date.now() - 100000,
  }
];

export const generateId = () => Math.random().toString(36).substr(2, 9);
