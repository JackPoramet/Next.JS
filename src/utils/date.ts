/**
 * Date and Time Utilities
 */

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'เมื่อสักครู่';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  if (days < 7) return `${days} วันที่แล้ว`;
  
  return formatDate(date);
};

export const isToday = (date: Date | string): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return today.toDateString() === checkDate.toDateString();
};

export const isThisWeek = (date: Date | string): boolean => {
  const now = new Date();
  const checkDate = new Date(date);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return checkDate >= weekAgo && checkDate <= now;
};
