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
// Account Validation
// ============================================================================

export function validateAccount(name: string, website?: string, industry?: string): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate name
  if (!name || name.trim() === '') {
    errors.push({ field: 'name', message: 'Account name is required' });
  } else if (name.length < 2) {
    errors.push({ field: 'name', message: 'Account name must be at least 2 characters' });
  } else if (name.length > 255) {
    errors.push({ field: 'name', message: 'Account name is too long' });
  }

  // Validate website
  if (website && website.trim() !== '') {
    if (!isValidUrl(website)) {
      errors.push({ field: 'website', message: 'Invalid website URL' });
    } else if (website.length > 255) {
      errors.push({ field: 'website', message: 'Website URL is too long' });
    }
  }

  // Validate industry
  if (industry && industry.trim() !== '') {
    if (industry.length > 100) {
      errors.push({ field: 'industry', message: 'Industry is too long' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Contact Validation
// ============================================================================

export function validateContact(
  firstName: string,
  lastName: string,
  email?: string,
  phone?: string,
  title?: string
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate first name
  if (!firstName || firstName.trim() === '') {
    errors.push({ field: 'firstName', message: 'First name is required' });
  } else if (firstName.length > 50) {
    errors.push({ field: 'firstName', message: 'First name is too long' });
  }

  // Validate last name
  if (!lastName || lastName.trim() === '') {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  } else if (lastName.length > 50) {
    errors.push({ field: 'lastName', message: 'Last name is too long' });
  }

  // Validate email
  if (email && email.trim() !== '') {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }
  }

  // Validate phone
  if (phone && phone.trim() !== '') {
    if (phone.length > 20) {
      errors.push({ field: 'phone', message: 'Phone number is too long' });
    }
  }

  // Validate title
  if (title && title.trim() !== '') {
    if (title.length > 100) {
      errors.push({ field: 'title', message: 'Title is too long' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Deal Validation
// ============================================================================

const VALID_DEAL_STAGES = ['NEW', 'PROSPECTING', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

export function validateDeal(
  name: string,
  amount: number,
  stage: string,
  closeDate?: string
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate name
  if (!name || name.trim() === '') {
    errors.push({ field: 'name', message: 'Deal name is required' });
  } else if (name.length < 2) {
    errors.push({ field: 'name', message: 'Deal name must be at least 2 characters' });
  } else if (name.length > 255) {
    errors.push({ field: 'name', message: 'Deal name is too long' });
  }

  // Validate amount
  if (amount === undefined || amount === null) {
    errors.push({ field: 'amount', message: 'Deal amount is required' });
  } else if (typeof amount !== 'number') {
    errors.push({ field: 'amount', message: 'Deal amount must be a number' });
  } else if (amount < 0) {
    errors.push({ field: 'amount', message: 'Deal amount cannot be negative' });
  } else if (amount > 999999999) {
    errors.push({ field: 'amount', message: 'Deal amount is too large' });
  }

  // Validate stage
  if (!stage || stage.trim() === '') {
    errors.push({ field: 'stage', message: 'Deal stage is required' });
  } else if (!VALID_DEAL_STAGES.includes(stage.toUpperCase())) {
    errors.push({
      field: 'stage',
      message: `Deal stage must be one of: ${VALID_DEAL_STAGES.join(', ')}`,
    });
  }

  // Validate close date
  if (closeDate && closeDate.trim() !== '') {
    const date = new Date(closeDate);
    if (isNaN(date.getTime())) {
      errors.push({ field: 'closeDate', message: 'Invalid close date format' });
    } else if (date < new Date()) {
      errors.push({ field: 'closeDate', message: 'Close date cannot be in the past' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Activity Validation
// ============================================================================

const VALID_ACTIVITY_TYPES = ['NOTE', 'TASK', 'CALL', 'MEETING'];

export function validateActivity(
  type: string,
  subject: string,
  body?: string,
  dueAt?: string
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate type
  if (!type || type.trim() === '') {
    errors.push({ field: 'type', message: 'Activity type is required' });
  } else if (!VALID_ACTIVITY_TYPES.includes(type.toUpperCase())) {
    errors.push({
      field: 'type',
      message: `Activity type must be one of: ${VALID_ACTIVITY_TYPES.join(', ')}`,
    });
  }

  // Validate subject
  if (!subject || subject.trim() === '') {
    errors.push({ field: 'subject', message: 'Activity subject is required' });
  } else if (subject.length > 255) {
    errors.push({ field: 'subject', message: 'Subject is too long' });
  }

  // Validate body
  if (body && body.length > 5000) {
    errors.push({ field: 'body', message: 'Activity body is too long' });
  }

  // Validate due date
  if (dueAt && dueAt.trim() !== '') {
    const date = new Date(dueAt);
    if (isNaN(date.getTime())) {
      errors.push({ field: 'dueAt', message: 'Invalid due date format' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function isValidUrl(urlString: string): boolean {
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
