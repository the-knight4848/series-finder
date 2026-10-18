/**
 * Service for managing user authentication and persistence using localStorage.
 */

import { validateRegistration, validateLogin, validateResetPassword } from '../utils/authValidation';

const USERS_STORAGE_KEY = 'series_finder_users';
const SESSION_STORAGE_KEY = 'series_finder_session';

/**
 * Safely retrieves the stored user list from localStorage.
 * @returns {Array<Object>}
 */
export function getAllUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch (err) {
    console.error('Failed to parse users from localStorage:', err);
    return [];
  }
}

/**
 * Safely saves the user list to localStorage.
 * @param {Array<Object>} users
 */
export function saveAllUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users to localStorage:', err);
  }
}

/**
 * Gets the currently logged-in user from session storage.
 * @returns {Object|null}
 */
export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to get session from localStorage:', err);
    return null;
  }
}

/**
 * Sets the current session in localStorage.
 * @param {Object} user
 */
export function setCurrentSession(user) {
  try {
    if (!user) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      // Do not store password in the session object
      const { password: _password, ...safeUser } = user;
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
    }
  } catch (err) {
    console.error('Failed to set session in localStorage:', err);
  }
}

/**
 * Clears the active session.
 */
export function clearCurrentSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
}

/**
 * Registers a new user.
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.password
 * @param {string} params.confirmPassword
 * @returns {{ success: boolean, user?: Object, error?: string, fieldErrors?: Object }}
 */
export function registerUser({ name, email, password, confirmPassword }) {
  // 1. Validate fields and check @spumil.net domain
  const validation = validateRegistration({ name, email, password, confirmPassword });
  if (!validation.isValid) {
    return { success: false, fieldErrors: validation.errors };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = getAllUsers();

  // 2. Check if email already registered
  const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    return {
      success: false,
      fieldErrors: { email: 'อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น หรือเข้าสู่ระบบ' },
    };
  }

  // 3. Create new user object
  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    email: normalizedEmail,
    password, // Stored locally for this client-side assignment demo
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveAllUsers(users);

  // 4. Auto-login by setting current session
  setCurrentSession(newUser);

  const { password: _, ...safeUser } = newUser;
  return { success: true, user: safeUser };
}

/**
 * Authenticates an existing user.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @returns {{ success: boolean, user?: Object, error?: string, fieldErrors?: Object }}
 */
export function loginUser({ email, password }) {
  // 1. Validate fields
  const validation = validateLogin({ email, password });
  if (!validation.isValid) {
    return { success: false, fieldErrors: validation.errors };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = getAllUsers();

  // 2. Find user by email
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return {
      success: false,
      error: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ หรืออีเมลไม่ถูกต้อง',
    };
  }

  // 3. Verify password
  if (user.password !== password) {
    return {
      success: false,
      error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
    };
  }

  // 4. Set session
  setCurrentSession(user);

  const { password: _, ...safeUser } = user;
  return { success: true, user: safeUser };
}

/**
 * Resets user password.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.newPassword
 * @param {string} params.confirmPassword
 * @returns {{ success: boolean, message?: string, error?: string, fieldErrors?: Object }}
 */
export function resetPassword({ email, newPassword, confirmPassword }) {
  // 1. Validate fields
  const validation = validateResetPassword({ email, newPassword, confirmPassword });
  if (!validation.isValid) {
    return { success: false, fieldErrors: validation.errors };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = getAllUsers();

  // 2. Find user by email
  const userIndex = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  if (userIndex === -1) {
    return {
      success: false,
      error: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ หรืออีเมลไม่ถูกต้อง',
    };
  }

  // 3. Update password
  users[userIndex].password = newPassword;
  users[userIndex].updatedAt = new Date().toISOString();
  saveAllUsers(users);

  return {
    success: true,
    message: 'เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที',
  };
}
