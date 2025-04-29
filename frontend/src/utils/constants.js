// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Transaction Types
export const TRANSACTION_TYPES = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
  TRANSFER: 'TRANSFER',
};

// Transaction Categories
export const TRANSACTION_CATEGORIES = {
  INCOME: [
    { id: 'salary', label: 'Gaji', icon: 'money-bill' },
    { id: 'business', label: 'Bisnis', icon: 'briefcase' },
    { id: 'investment', label: 'Investasi', icon: 'chart-line' },
    { id: 'other_income', label: 'Lainnya', icon: 'plus-circle' },
  ],
  EXPENSE: [
    { id: 'food', label: 'Makanan & Minuman', icon: 'utensils' },
    { id: 'transportation', label: 'Transportasi', icon: 'car' },
    { id: 'housing', label: 'Rumah', icon: 'home' },
    { id: 'utilities', label: 'Utilitas', icon: 'bolt' },
    { id: 'healthcare', label: 'Kesehatan', icon: 'hospital' },
    { id: 'education', label: 'Pendidikan', icon: 'graduation-cap' },
    { id: 'entertainment', label: 'Hiburan', icon: 'film' },
    { id: 'shopping', label: 'Belanja', icon: 'shopping-cart' },
    { id: 'other_expense', label: 'Lainnya', icon: 'minus-circle' },
  ],
};

// Budget Periods
export const BUDGET_PERIODS = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
  CUSTOM: 'CUSTOM',
};

// Goal Types
export const GOAL_TYPES = {
  SAVINGS: 'SAVINGS',
  DEBT_PAYMENT: 'DEBT_PAYMENT',
  INVESTMENT: 'INVESTMENT',
  PURCHASE: 'PURCHASE',
  CUSTOM: 'CUSTOM',
};

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
};

// Status Types
export const STATUS_TYPES = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  BUDGET_ALERT: 'BUDGET_ALERT',
  GOAL_MILESTONE: 'GOAL_MILESTONE',
  BILL_REMINDER: 'BILL_REMINDER',
  TRANSACTION_ALERT: 'TRANSACTION_ALERT',
  SYSTEM_NOTIFICATION: 'SYSTEM_NOTIFICATION',
};

// Chart Colors
export const CHART_COLORS = {
  primary: '#0EA5E9',
  secondary: '#64748B',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

// Date Formats
export const DATE_FORMATS = {
  display: {
    short: 'DD/MM/YYYY',
    long: 'D MMMM YYYY',
    withTime: 'D MMMM YYYY, HH:mm',
  },
  api: 'YYYY-MM-DD',
};

// Pagination
export const PAGINATION = {
  defaultLimit: 10,
  limitOptions: [10, 25, 50, 100],
};

// Sort Options
export const SORT_OPTIONS = {
  date: {
    label: 'Tanggal',
    value: 'date',
  },
  amount: {
    label: 'Jumlah',
    value: 'amount',
  },
  category: {
    label: 'Kategori',
    value: 'category',
  },
};

// Sort Orders
export const SORT_ORDERS = {
  asc: {
    label: 'Ascending',
    value: 'asc',
  },
  desc: {
    label: 'Descending',
    value: 'desc',
  },
};

// Currency
export const CURRENCY = {
  code: 'IDR',
  symbol: 'Rp',
  name: 'Indonesian Rupiah',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  token: 'token',
  theme: 'theme',
  language: 'language',
  filters: 'filters',
  layout: 'layout',
};

// Theme Options
export const THEME_OPTIONS = {
  light: 'light',
  dark: 'dark',
  system: 'system',
};

// Language Options
export const LANGUAGE_OPTIONS = {
  id: {
    code: 'id',
    name: 'Bahasa Indonesia',
  },
  en: {
    code: 'en',
    name: 'English',
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  default: 'Terjadi kesalahan. Silakan coba lagi.',
  network: 'Koneksi internet terputus. Periksa koneksi Anda.',
  unauthorized: 'Sesi Anda telah berakhir. Silakan login kembali.',
  forbidden: 'Anda tidak memiliki akses ke halaman ini.',
  notFound: 'Data tidak ditemukan.',
  validation: 'Mohon periksa kembali data yang dimasukkan.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  create: 'Data berhasil dibuat.',
  update: 'Data berhasil diperbarui.',
  delete: 'Data berhasil dihapus.',
  save: 'Data berhasil disimpan.',
};

// Validation Rules
export const VALIDATION_RULES = {
  password: {
    minLength: 8,
    requireNumber: true,
    requireLowercase: true,
    requireUppercase: true,
    requireSpecialChar: true,
  },
  phone: {
    pattern: /^\+[1-9]\d{1,14}$/,
    message: 'Nomor telepon harus dalam format internasional (contoh: +628123456789)',
  },
};

// File Upload
export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  maxFiles: 5,
};

// Time Intervals (in milliseconds)
export const TIME_INTERVALS = {
  autoSave: 30000, // 30 seconds
  refreshData: 60000, // 1 minute
  sessionTimeout: 3600000, // 1 hour
  notificationCheck: 300000, // 5 minutes
};

export default {
  API_BASE_URL,
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
  BUDGET_PERIODS,
  GOAL_TYPES,
  PRIORITY_LEVELS,
  STATUS_TYPES,
  NOTIFICATION_TYPES,
  CHART_COLORS,
  DATE_FORMATS,
  PAGINATION,
  SORT_OPTIONS,
  SORT_ORDERS,
  CURRENCY,
  STORAGE_KEYS,
  THEME_OPTIONS,
  LANGUAGE_OPTIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  FILE_UPLOAD,
  TIME_INTERVALS,
};
