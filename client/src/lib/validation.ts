/**
 * Frontend validation utilities
 * Mirrors backend validation for consistent UX
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

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

export function validateRegistration(
  name: string,
  email: string,
  password: string
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!name || name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  } else if (name.length > 100) {
    errors.push({ field: 'name', message: 'Name is too long' });
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateAccount(
  name: string,
  website?: string,
  industry?: string
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!name || name.trim() === '') {
    errors.push({ field: 'name', message: 'Account name is required' });
  } else if (name.length < 2) {
    errors.push({ field: 'name', message: 'Account name must be at least 2 characters' });
  } else if (name.length > 255) {
    errors.push({ field: 'name', message: 'Account name is too long' });
  }

  if (website && website.trim() !== '') {
    if (!isValidUrl(website)) {
      errors.push({ field: 'website', message: 'Invalid website URL' });
    } else if (website.length > 255) {
      errors.push({ field: 'website', message: 'Website URL is too long' });
    }
  }

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

export function validateContact(
  firstName: string,
  lastName: string,
  email?: string,
  phone?: string,
  title?: string
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!firstName || firstName.trim() === '') {
    errors.push({ field: 'firstName', message: 'First name is required' });
  } else if (firstName.length > 50) {
    errors.push({ field: 'firstName', message: 'First name is too long' });
  }

  if (!lastName || lastName.trim() === '') {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  } else if (lastName.length > 50) {
    errors.push({ field: 'lastName', message: 'Last name is too long' });
  }

  if (email && email.trim() !== '') {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }
  }

  if (phone && phone.trim() !== '') {
    if (phone.length > 20) {
      errors.push({ field: 'phone', message: 'Phone number is too long' });
    }
  }

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

export function validateDeal(
  name: string,
  amount: number | string,
  stage: string,
  closeDate?: string
): ValidationResult {
  const errors: ValidationError[] = [];
  const VALID_DEAL_STAGES = ['NEW', 'PROSPECTING', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

  if (!name || name.trim() === '') {
    errors.push({ field: 'name', message: 'Deal name is required' });
  } else if (name.length < 2) {
    errors.push({ field: 'name', message: 'Deal name must be at least 2 characters' });
  } else if (name.length > 255) {
    errors.push({ field: 'name', message: 'Deal name is too long' });
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount === null) {
    errors.push({ field: 'amount', message: 'Deal amount is required' });
  } else if (numAmount < 0) {
    errors.push({ field: 'amount', message: 'Deal amount cannot be negative' });
  } else if (numAmount > 999999999) {
    errors.push({ field: 'amount', message: 'Deal amount is too large' });
  }

  if (!stage || stage.trim() === '') {
    errors.push({ field: 'stage', message: 'Deal stage is required' });
  } else if (!VALID_DEAL_STAGES.includes(stage.toUpperCase())) {
    errors.push({
      field: 'stage',
      message: `Deal stage must be one of: ${VALID_DEAL_STAGES.join(', ')}`,
    });
  }

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

function isValidUrl(urlString: string): boolean {
  try {
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
