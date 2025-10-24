/**
 * Utility functions for date handling and common operations
 */

/**
 * Format date to YYYY-MM-DD string
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  // Use local methods to match calendar generation
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string to Date object
 * @param {string} dateStr
 * @returns {Date}
 */
export function parseDate(dateStr) {
  // Use local time to match calendar generation
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Add days to a date
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get number of days between two dates
 * @param {Date} start
 * @param {Date} end
 * @returns {number}
 */
export function daysBetween(start, end) {
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

/**
 * Check if two dates are the same day
 * @param {Date} date1
 * @param {Date} date2
 * @returns {boolean}
 */
export function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Get first day of month
 * @param {Date} date
 * @returns {Date}
 */
export function getFirstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get last day of month
 * @param {Date} date
 * @returns {Date}
 */
export function getLastDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Get first Monday of the week containing the date
 * @param {Date} date
 * @returns {Date}
 */
export function getFirstMondayOfWeek(date) {
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  return monday;
}

/**
 * Generate array of dates for clean month view (only current month days)
 * @param {Date} month
 * @returns {Date[]}
 */
export function getCleanMonthDays(month) {
  const firstDay = getFirstDayOfMonth(month);
  const lastDay = getLastDayOfMonth(month);
  
  const days = [];
  const current = new Date(firstDay);
  
  // Generate only days of the current month
  while (current <= lastDay) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

/**
 * Generate array of dates for calendar month view
 * @param {Date} month
 * @returns {Date[]}
 */
export function getCalendarDays(month) {
  const firstDay = getFirstDayOfMonth(month);
  const lastDay = getLastDayOfMonth(month);
  const firstMonday = getFirstMondayOfWeek(firstDay);
  
  const days = [];
  const current = new Date(firstMonday);
  
  // Generate 42 days (6 weeks) to fill calendar grid
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

/**
 * Check if date is in range (inclusive start, exclusive end)
 * @param {Date} date
 * @param {Date} start
 * @param {Date} end
 * @returns {boolean}
 */
export function isInRange(date, start, end) {
  if (!start || !end) return false;
  return date >= start && date < end;
}

/**
 * Debounce function calls
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Simple cache with TTL
 */
export class TTLCache {
  constructor(ttlMs) {
    this.cache = new Map();
    this.ttlMs = ttlMs;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}
