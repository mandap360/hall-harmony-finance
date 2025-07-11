// Date utility functions
export const dateUtils = {
  // Get today's date in YYYY-MM-DD format
  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  },

  // Format date for display
  formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    }).format(dateObj);
  },

  // Check if date is today
  isToday(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return dateObj.toDateString() === today.toDateString();
  },

  // Check if date is in range
  isInRange(date: Date, startDate?: Date, endDate?: Date): boolean {
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  },

  // Get start and end of current month
  getCurrentMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  },

  // Sort dates in descending order
  sortDatesDesc(dates: Date[]): Date[] {
    return dates.sort((a, b) => b.getTime() - a.getTime());
  }
};