/**
 * Central utility for date and time formatting
 */

/**
 * Formats a date string or object into 12-hour time format (e.g., 2:30 PM)
 */
export function formatTime12Hour(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
}

/**
 * Formats a date string or object into a full date-time format (e.g., Apr 12, 2026 • 3:45 PM)
 */
export function formatDateTime12Hour(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const dateStr = d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  const timeStr = d.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  return `${dateStr} • ${timeStr}`;
}

/**
 * Formats a date into a short date-time format (e.g., 12/04 • 3:45 PM)
 */
export function formatShortDateTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const dateStr = d.toLocaleDateString([], {
    month: 'numeric',
    day: 'numeric'
  });
  
  const timeStr = d.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  return `${dateStr} • ${timeStr}`;
}

/**
 * Formats a date into a relative time string (e.g., 2 mins ago, Today at 11:15 AM, Yesterday at 4:20 PM)
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  const timeStr = d.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  if (diffInSeconds < 60) return `Just now • ${timeStr}`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago • ${timeStr}`;
  
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  
  if (isToday) return `Today • ${timeStr}`;
  if (isYesterday) return `Yesterday • ${timeStr}`;
  
  return formatDateTime12Hour(d);
}

/**
 * Hook-like function to handle hydration mismatch by returning empty string on first render
 * Note: Since this is a utility file, we provide a safe way to call these in components
 */
export function useSafeFormat(formatFn: (d: any) => string, date: any): string {
  // This is a placeholder for the logic we'll use inside components
  // In actual components we should use a mounted state
  return formatFn(date);
}
