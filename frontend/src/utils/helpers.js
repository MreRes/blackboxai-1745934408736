// Date formatting
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return new Date(date).toLocaleDateString('id-ID', defaultOptions);
};

// Currency formatting
export const formatCurrency = (amount, currency = 'IDR') => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Percentage formatting
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

// Calculate progress percentage
export const calculateProgress = (current, target) => {
  if (!target || target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

// Generate color based on percentage
export const getColorByPercentage = (percentage) => {
  if (percentage >= 100) return 'bg-red-500';
  if (percentage >= 80) return 'bg-yellow-500';
  return 'bg-green-500';
};

// Format large numbers
export const formatNumber = (number) => {
  if (number >= 1000000000) {
    return `${(number / 1000000000).toFixed(1)}B`;
  }
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }
  return number.toString();
};

// Validate email format
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone number format
export const isValidPhoneNumber = (number) => {
  const re = /^\+[1-9]\d{1,14}$/;
  return re.test(number);
};

// Generate random color
export const getRandomColor = () => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Group transactions by date
export const groupTransactionsByDate = (transactions) => {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});
};

// Calculate total for transactions
export const calculateTransactionsTotal = (transactions, type = 'all') => {
  return transactions.reduce((total, transaction) => {
    if (type === 'all' || transaction.type === type) {
      return total + parseFloat(transaction.amount);
    }
    return total;
  }, 0);
};

// Sort transactions by date
export const sortTransactionsByDate = (transactions, order = 'desc') => {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

// Filter transactions by date range
export const filterTransactionsByDateRange = (transactions, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date >= start && date <= end;
  });
};

// Calculate budget remaining
export const calculateBudgetRemaining = (budget) => {
  return parseFloat(budget.amount) - parseFloat(budget.currentSpending);
};

// Calculate days remaining
export const calculateDaysRemaining = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Format relative time
export const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return 'just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
  return formatDate(date);
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
