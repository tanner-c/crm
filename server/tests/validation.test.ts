import {
  validateEmail,
  validatePassword,
  validateLoginForm,
  validateRegistration,
  validateAccount,
  validateContact,
  validateDeal,
  validateActivity,
  formatValidationErrors,
} from '../src/utils/validation';

/**
 * Validation Utility Tests
 * Tests for input validation functions used in Game Store system
 */

describe('Email Validation', () => {
  test('should validate valid email', () => {
    const result = validateEmail('customer@example.com');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject empty email', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
    expect(result.errors[0].field).toBe('email');
  });

  test('should reject invalid email format', () => {
    const result = validateEmail('not-an-email');
    expect(result.isValid).toBe(false);
    expect(result.errors[0].message).toContain('Invalid email format');
  });

  test('should reject very long email', () => {
    const result = validateEmail('a'.repeat(300) + '@example.com');
    expect(result.isValid).toBe(false);
  });
});

describe('Password Validation', () => {
  test('should validate strong password', () => {
    const result = validatePassword('MySecurePassword123');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject empty password', () => {
    const result = validatePassword('');
    expect(result.isValid).toBe(false);
  });

  test('should reject short password', () => {
    const result = validatePassword('short');
    expect(result.isValid).toBe(false);
    expect(result.errors[0].message).toContain('at least 8 characters');
  });

  test('should reject very long password', () => {
    const result = validatePassword('a'.repeat(200));
    expect(result.isValid).toBe(false);
  });
});

describe('Login Form Validation', () => {
  test('should validate valid login form', () => {
    const result = validateLoginForm('user@example.com', 'Password123');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject invalid email and password', () => {
    const result = validateLoginForm('invalid-email', 'short');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should reject missing password', () => {
    const result = validateLoginForm('user@example.com', '');
    expect(result.isValid).toBe(false);
  });
});

describe('Registration Validation', () => {
  test('should validate valid registration data', () => {
    const result = validateRegistration(
      'John Doe',
      'john@example.com',
      'SecurePassword123'
    );
    expect(result.isValid).toBe(true);
  });

  test('should reject short name', () => {
    const result = validateRegistration('J', 'john@example.com', 'SecurePassword123');
    expect(result.isValid).toBe(false);
  });

  test('should reject invalid email', () => {
    const result = validateRegistration('John Doe', 'invalid', 'SecurePassword123');
    expect(result.isValid).toBe(false);
  });

  test('should reject short password', () => {
    const result = validateRegistration('John Doe', 'john@example.com', 'short');
    expect(result.isValid).toBe(false);
  });

  test('should reject very long name', () => {
    const result = validateRegistration(
      'a'.repeat(200),
      'john@example.com',
      'SecurePassword123'
    );
    expect(result.isValid).toBe(false);
  });
});

describe('Error Formatting', () => {
  test('should format validation errors', () => {
    const result = validateEmail('');
    expect(result.errors.length).toBeGreaterThan(0);
    expect(formatValidationErrors(result.errors)).toBeTruthy();
  });

  test('should handle multiple errors', () => {
    const errors = [
      { field: 'email', message: 'Email is required' },
      { field: 'password', message: 'Password too short' }
    ];
    const formatted = formatValidationErrors(errors);
    expect(formatted).toBeTruthy();
  });
});



describe('Validation Error Formatting', () => {
  test('should format errors to object map', () => {
    const errors = [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Too short' },
    ];
    const formatted = formatValidationErrors(errors);

    expect(formatted.email).toBe('Invalid email');
    expect(formatted.password).toBe('Too short');
  });

  test('should handle empty errors array', () => {
    const formatted = formatValidationErrors([]);
    expect(Object.keys(formatted).length).toBe(0);
  });
});

describe('Account Validation', () => {
  test('should validate valid account', () => {
    const result = validateAccount('Acme Corp', 'https://acme.com', 'Technology');
    expect(result.isValid).toBe(true);
  });

  test('should reject empty name', () => {
    const result = validateAccount('', 'https://acme.com');
    expect(result.isValid).toBe(false);
    expect(result.errors[0].field).toBe('name');
  });

  test('should reject invalid website URL', () => {
    const result = validateAccount('Acme Corp', 'not a url');
    expect(result.isValid).toBe(false);
    expect(result.errors[0].field).toBe('website');
  });

  test('should reject very long name or website or industry', () => {
    expect(validateAccount('a'.repeat(256)).isValid).toBe(false);
    expect(validateAccount('Acme Corp', 'a'.repeat(260)).isValid).toBe(false);
    expect(validateAccount('Acme Corp', '', 'a'.repeat(101)).isValid).toBe(false);
  });
});

describe('Contact Validation', () => {
  test('should validate valid contact', () => {
    const result = validateContact('John', 'Doe', 'john@example.com', '123-456-7890', 'Manager');
    expect(result.isValid).toBe(true);
  });

  test('should reject empty names', () => {
    expect(validateContact('', 'Doe').isValid).toBe(false);
    expect(validateContact('John', '').isValid).toBe(false);
  });

  test('should reject long first/last name, phone, or title', () => {
    expect(validateContact('a'.repeat(51), 'Doe').isValid).toBe(false);
    expect(validateContact('John', 'a'.repeat(51)).isValid).toBe(false);
    expect(validateContact('John', 'Doe', 'john@example.com', 'a'.repeat(21)).isValid).toBe(false);
    expect(validateContact('John', 'Doe', 'john@example.com', '123', 'a'.repeat(101)).isValid).toBe(false);
  });

  test('should validate contact with invalid email format', () => {
    const result = validateContact('John', 'Doe', 'invalid-email');
    expect(result.isValid).toBe(false);
    expect(result.errors[0].field).toBe('email');
  });
});

describe('Deal Validation', () => {
  test('should validate valid deal', () => {
    const result = validateDeal('New Deal', 5000, 'QUALIFIED', new Date(Date.now() + 86400000).toISOString());
    expect(result.isValid).toBe(true);
  });

  test('should reject empty name or wrong amount/stage/date', () => {
    expect(validateDeal('', 100, 'NEW').isValid).toBe(false);
    expect(validateDeal('Deal', -10, 'NEW').isValid).toBe(false);
    expect(validateDeal('Deal', 100, 'INVALID_STAGE').isValid).toBe(false);
    expect(validateDeal('Deal', 100, 'NEW', 'invalid-date').isValid).toBe(false);
    expect(validateDeal('Deal', 100, 'NEW', new Date(Date.now() - 86400000).toISOString()).isValid).toBe(false); // past date
  });

  test('should reject too large amount or long name', () => {
    expect(validateDeal('a'.repeat(256), 100, 'NEW').isValid).toBe(false);
    expect(validateDeal('a', 100, 'NEW').isValid).toBe(false); // too short
    expect(validateDeal('Deal', 1000000000, 'NEW').isValid).toBe(false); // too large
  });
});

describe('Activity Validation', () => {
  test('should validate valid activity', () => {
    const result = validateActivity('TASK', 'Call Customer', 'Discuss proposal', new Date().toISOString());
    expect(result.isValid).toBe(true);
  });

  test('should reject invalid type or empty subject', () => {
    expect(validateActivity('', 'Call Customer').isValid).toBe(false);
    expect(validateActivity('INVALID_TYPE', 'Call Customer').isValid).toBe(false);
    expect(validateActivity('TASK', '').isValid).toBe(false);
  });

  test('should reject very long subject, body, or invalid due date', () => {
    expect(validateActivity('TASK', 'a'.repeat(256)).isValid).toBe(false);
    expect(validateActivity('TASK', 'Call Customer', 'a'.repeat(5001)).isValid).toBe(false);
    expect(validateActivity('TASK', 'Call Customer', 'body', 'invalid-date').isValid).toBe(false);
  });
});
