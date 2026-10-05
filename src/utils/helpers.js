/**
 * Formats a currency value to Indian Rupee (INR) notation.
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Checks if the temple is currently open based on daily schedules.
 * Morning: 6:00 AM - 12:30 PM (6:00 - 12.5)
 * Evening: 4:00 PM - 8:30 PM (16:00 - 20.5)
 * Note: Uses client timezone for local rendering convenience.
 * @returns {boolean}
 */
export const isTempleOpen = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeDecimal = hours + minutes / 60;
  
  const morningOpen = 6.0;
  const morningClose = 12.5;
  const eveningOpen = 16.0;
  const eveningClose = 20.5;
  
  return (timeDecimal >= morningOpen && timeDecimal <= morningClose) || 
         (timeDecimal >= eveningOpen && timeDecimal <= eveningClose);
};

/**
 * Capitalizes a string
 * @param {string} str 
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Splits dynamic lists or titles for styling parts of it (e.g. first word in gold)
 * @param {string} text 
 * @returns {{firstWord: string, rest: string}}
 */
export const splitTitle = (text) => {
  if (!text) return { firstWord: '', rest: '' };
  const words = text.split(' ');
  const firstWord = words[0];
  const rest = words.slice(1).join(' ');
  return { firstWord, rest };
};
