/**
 * Validation utilities for CRM application
 * Centralized validation logic for both frontend and backend
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// Email Validation
// ============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!email || email.trim() === '') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  } else if (email.length > 255) {
    errors.push({ field: 'email', message: 'Email is too long' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Password Validation
// ============================================================================

export function validatePassword(password: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!password || password === '') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters',
    });
  } else if (password.length > 128) {
    errors.push({
      field: 'password',
      message: 'Password is too long',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Login Form Validation
// ============================================================================

export function validateLoginForm(email: string, password: string): ValidationResult {
  const errors: ValidationError[] = [];

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  }

  if (!password || password === '') {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// User Registration Validation
// ============================================================================

export function validateRegistration(
  name: string,
  email: string,
  password: string
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate name
  if (!name || name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  } else if (name.length > 100) {
    errors.push({ field: 'name', message: 'Name is too long' });
  }

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}


// ============================================================================
// Helper Functions
// ============================================================================

export function isValidUrl(urlString: string): boolean {
  try {
    // Add protocol if not present
    const url = urlString.startsWith('http://') || urlString.startsWith('https://')
      ? urlString
      : `https://${urlString}`;
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

export function formatValidationErrors(errors: ValidationError[]): Record<string, string> {
  const formatted: Record<string, string> = {};
  errors.forEach((error) => {
    formatted[error.field] = error.message;
  });
  return formatted;
}
