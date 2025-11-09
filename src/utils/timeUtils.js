// Time formatting utilities for live updates

// Format time ago (client-side version for live updates)
export const formatTimeAgo = (date) => {
  if (!date) return 'Just now';
  
  try {
    const now = new Date();
    let activityDate;
    
    // Handle MySQL DATETIME format (YYYY-MM-DD HH:mm:ss)
    if (typeof date === 'string') {
      // MySQL DATETIME format: "2025-01-15 14:30:00"
      // Parse it explicitly to avoid timezone issues
      const mysqlDateTimePattern = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/;
      const match = date.match(mysqlDateTimePattern);
      
      if (match) {
        // Parse as local time (MySQL DATETIME is stored without timezone)
        const [, year, month, day, hour, minute, second] = match;
        activityDate = new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1, // Month is 0-indexed
          parseInt(day, 10),
          parseInt(hour, 10),
          parseInt(minute, 10),
          parseInt(second, 10)
        );
      } else {
        // Try standard parsing
        activityDate = new Date(date.replace(' ', 'T'));
      }
    } else if (date instanceof Date) {
      activityDate = date;
    } else {
      activityDate = new Date(date);
    }
    
    // Validate date
    if (isNaN(activityDate.getTime())) {
      console.error('Invalid date format:', date);
      return 'Just now';
    }
    
    // Calculate difference in milliseconds
    const diffInMs = now.getTime() - activityDate.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    
    // Handle negative differences (future dates) - shouldn't happen but handle gracefully
    if (diffInSeconds < 0) {
      return 'Just now';
    }
    
    // Very recent (less than 60 seconds) = "Just now"
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    
    // Less than 1 hour = show minutes
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    
    // Less than 24 hours = show hours
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    
    // Less than 7 days = show days
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    // Less than 4 weeks = show weeks
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    }
    
    // More than 4 weeks = show months (approx)
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }
    
    // More than 12 months = show years
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error formatting time ago:', error, date);
    return 'Just now';
  }
};

