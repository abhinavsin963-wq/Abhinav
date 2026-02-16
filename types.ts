export enum ViewState {
  AUTH = 'AUTH',
  HOME = 'HOME',
  CALENDAR = 'CALENDAR',
  CALCULATOR = 'CALCULATOR',
  SETTINGS = 'SETTINGS',
  EDITOR_DOCS = 'EDITOR_DOCS',
  EDITOR_SHEETS = 'EDITOR_SHEETS',
  EDITOR_SLIDES = 'EDITOR_SLIDES',
  EDITOR_PDF = 'EDITOR_PDF', // View-only mimic
}

export enum FileType {
  DOC = 'DOC',
  SHEET = 'SHEET',
  SLIDE = 'SLIDE',
  PDF = 'PDF'
}

export interface User {
  username: string;
}

export interface FileData {
  id: string;
  title: string;
  type: FileType;
  content: any; // Flexible content structure depending on type
  lastModified: number;
}

export interface CalendarEvent {
  date: string; // ISO date string YYYY-MM-DD
  note: string;
}

export interface AppSettings {
  themeColor: 'purple' | 'blue' | 'green' | 'red' | 'custom';
  darkMode: boolean; // true = dark, false = light
  zoomLevel: number; // 1 = 100%
}