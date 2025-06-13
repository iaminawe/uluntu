/**
 * Calculate the date of the second Thursday of the current or next month
 * @returns Formatted date string
 */
export const getNextMeetupDate = (): string => {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  
  // Check if we've already passed the second Thursday of this month
  const secondThursday = getSecondThursdayOfMonth(year, month);
  if (now > secondThursday) {
    // Move to next month
    if (month === 11) {
      month = 0;
      year++;
    } else {
      month++;
    }
  }
  
  const nextMeetupDate = getSecondThursdayOfMonth(year, month);
  
  // Format the date
  return nextMeetupDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + ' at 6:00 PM';
};

/**
 * Get the date of the second Thursday of a given month
 * @param year The year
 * @param month The month (0-11)
 * @returns Date object representing the second Thursday
 */
const getSecondThursdayOfMonth = (year: number, month: number): Date => {
  // Start with the first day of the month
  const date = new Date(year, month, 1);
  
  // Find the first Thursday (day 4 where Sunday is 0)
  while (date.getDay() !== 4) {
    date.setDate(date.getDate() + 1);
  }
  
  // Add 7 days to get to the second Thursday
  date.setDate(date.getDate() + 7);
  
  return date;
};