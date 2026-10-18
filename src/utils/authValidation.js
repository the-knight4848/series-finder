/**
 * Authentication and email validation utilities for Series Finder.
 * Strictly enforces that only emails with the '@spumil.net' domain are permitted.
 */

export const ALLOWED_DOMAIN = 'spumil.net';

/**
 * Validates if an email address belongs to the allowed domain (@spumil.net).
 *
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  // Validates username part followed strictly by @spumil.net (case-insensitive)
  const spumilRegex = /^[a-zA-Z0-9._%+-]+@spumil\.net$/i;
  return spumilRegex.test(trimmed);
}

/**
 * Validates registration input fields.
 *
 * @param {Object} data
 * @param {string} data.name
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.confirmPassword
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateRegistration({ name, email, password, confirmPassword }) {
  const errors = {};

  // 1. Full name validation
  if (!name || !name.trim()) {
    errors.name = 'กรุณากรอกชื่อ-นามสกุล';
  } else if (name.trim().length < 2) {
    errors.name = 'ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร';
  }

  // 2. Email validation (strictly @spumil.net)
  if (!email || !email.trim()) {
    errors.email = 'กรุณากรอกอีเมล';
  } else if (!isValidEmail(email)) {
    errors.email = 'อีเมลต้องเป็นโดเมน @spumil.net เท่านั้น (เช่น yourname@spumil.net)';
  }

  // 3. Password validation
  if (!password) {
    errors.password = 'กรุณากรอกรหัสผ่าน';
  } else if (password.length < 6) {
    errors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
  }

  // 4. Confirm password validation
  if (!confirmPassword) {
    errors.confirmPassword = 'กรุณายืนยันรหัสผ่านอีกครั้ง';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'รหัสผ่านยืนยันไม่ตรงกับรหัสผ่านที่ตั้งไว้';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates login input fields.
 *
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.password
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateLogin({ email, password }) {
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'กรุณากรอกอีเมล';
  } else if (!isValidEmail(email)) {
    errors.email = 'อีเมลต้องเป็นโดเมน @spumil.net เท่านั้น (เช่น yourname@spumil.net)';
  }

  if (!password) {
    errors.password = 'กรุณากรอกรหัสผ่าน';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates reset password input fields.
 *
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.newPassword
 * @param {string} data.confirmPassword
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateResetPassword({ email, newPassword, confirmPassword }) {
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'กรุณากรอกอีเมล';
  } else if (!isValidEmail(email)) {
    errors.email = 'อีเมลต้องเป็นโดเมน @spumil.net เท่านั้น (เช่น yourname@spumil.net)';
  }

  if (!newPassword) {
    errors.newPassword = 'กรุณากรอกรหัสผ่านใหม่';
  } else if (newPassword.length < 6) {
    errors.newPassword = 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'กรุณายืนยันรหัสผ่านใหม่อีกครั้ง';
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'รหัสผ่านยืนยันไม่ตรงกับรหัสผ่านใหม่ที่ตั้งไว้';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
