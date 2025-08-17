// Utility functions for debouncing and throttling

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

export function exponentialBackoff(attempt: number, baseDelay: number = 1000, maxDelay: number = 30000): number {
  return Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
}

export function jitter(delay: number, variance: number = 0.1): number {
  const jitterAmount = delay * variance;
  return delay + (Math.random() * 2 - 1) * jitterAmount;
}
