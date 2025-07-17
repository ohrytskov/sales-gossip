import moment from 'moment'

// Function to get the date in ISO 8601 format for a specified number of days ago
export const getDaysAgo = (days) => {
  return moment().subtract(days, 'days').toISOString();
};

