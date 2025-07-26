/**
 * Validation Utilities
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one digit
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidThaiPhone = (phone: string): boolean => {
  // Thai phone number format: 0X-XXXX-XXXX or 0XXXXXXXXX
  const phoneRegex = /^0[0-9]{8,9}$/;
  const cleanPhone = phone.replace(/[-\s]/g, '');
  return phoneRegex.test(cleanPhone);
};

export const isStrongPassword = (password: string): {
  isStrong: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 25;
  } else {
    feedback.push('รหัสผ่านควรมีอย่างน้อย 8 ตัวอักษร');
  }

  if (/[a-z]/.test(password)) {
    score += 25;
  } else {
    feedback.push('ควรมีตัวอักษรเล็ก (a-z)');
  }

  if (/[A-Z]/.test(password)) {
    score += 25;
  } else {
    feedback.push('ควรมีตัวอักษรใหญ่ (A-Z)');
  }

  if (/[0-9]/.test(password)) {
    score += 25;
  } else {
    feedback.push('ควรมีตัวเลข (0-9)');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 10; // Bonus for special characters
  }

  return {
    isStrong: score >= 75,
    score,
    feedback,
  };
};
