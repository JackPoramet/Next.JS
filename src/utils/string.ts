/**
 * String Utilities
 */

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string): string => {
  return str.split(' ').map(capitalize).join(' ');
};

export const truncate = (str: string, length: number = 50): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with single dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
};

export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (username.length <= 3) return email;
  
  const masked = username.slice(0, 2) + '*'.repeat(username.length - 3) + username.slice(-1);
  return `${masked}@${domain}`;
};

export const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return `${first}${last}` || '??';
};
