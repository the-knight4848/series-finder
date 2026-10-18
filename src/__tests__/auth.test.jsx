import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { isValidEmail, validateRegistration, validateLogin, validateResetPassword } from '../utils/authValidation';
import * as authService from '../services/authService';
import App from '../App';

describe('Auth Validation (@spumil.net domain constraint)', () => {
  it('allows valid @spumil.net emails regardless of casing', () => {
    expect(isValidEmail('somchai@spumil.net')).toBe(true);
    expect(isValidEmail('student.65012345@spumil.net')).toBe(true);
    expect(isValidEmail('PROFESSOR@SPUMIL.NET')).toBe(true);
    expect(isValidEmail('test_user+series@spumil.net')).toBe(true);
  });

  it('rejects emails from non-spumil.net domains', () => {
    expect(isValidEmail('user@gmail.com')).toBe(false);
    expect(isValidEmail('user@hotmail.com')).toBe(false);
    expect(isValidEmail('user@yahoo.co.th')).toBe(false);
    expect(isValidEmail('user@spumil.com')).toBe(false); // wrong TLD
    expect(isValidEmail('user@spumil.net.evil.com')).toBe(false); // subdomain spoof
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });

  it('validates registration form requirements strictly', () => {
    // 1. Invalid non-spumil email
    const invalidEmailResult = validateRegistration({
      name: 'Somchai',
      email: 'somchai@gmail.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(invalidEmailResult.isValid).toBe(false);
    expect(invalidEmailResult.errors.email).toContain('@spumil.net');

    // 2. Mismatched passwords
    const mismatchResult = validateRegistration({
      name: 'Somchai',
      email: 'somchai@spumil.net',
      password: 'password123',
      confirmPassword: 'differentPassword',
    });
    expect(mismatchResult.isValid).toBe(false);
    expect(mismatchResult.errors.confirmPassword).toBeDefined();

    // 3. Short password
    const shortPassResult = validateRegistration({
      name: 'Somchai',
      email: 'somchai@spumil.net',
      password: '123',
      confirmPassword: '123',
    });
    expect(shortPassResult.isValid).toBe(false);
    expect(shortPassResult.errors.password).toBeDefined();

    // 4. Valid @spumil.net registration
    const validResult = validateRegistration({
      name: 'Somchai Srisuk',
      email: 'somchai@spumil.net',
      password: 'securepassword123',
      confirmPassword: 'securepassword123',
    });
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toEqual({});
  });

  it('validates login form requiring valid @spumil.net email and password', () => {
    const invalidEmailLogin = validateLogin({
      email: 'hacker@yahoo.com',
      password: 'secret',
    });
    expect(invalidEmailLogin.isValid).toBe(false);
    expect(invalidEmailLogin.errors.email).toContain('@spumil.net');

    const validLoginCheck = validateLogin({
      email: 'user@spumil.net',
      password: 'secret',
    });
    expect(validLoginCheck.isValid).toBe(true);
    expect(validLoginCheck.errors).toEqual({});
  });

  it('validates reset password form enforcing @spumil.net and matching passwords', () => {
    const invalidEmailReset = validateResetPassword({
      email: 'user@outlook.com',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    });
    expect(invalidEmailReset.isValid).toBe(false);
    expect(invalidEmailReset.errors.email).toContain('@spumil.net');

    const mismatchReset = validateResetPassword({
      email: 'user@spumil.net',
      newPassword: 'newpassword123',
      confirmPassword: 'notmatchingpassword',
    });
    expect(mismatchReset.isValid).toBe(false);
    expect(mismatchReset.errors.confirmPassword).toBeDefined();

    const validReset = validateResetPassword({
      email: 'user@spumil.net',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    });
    expect(validReset.isValid).toBe(true);
    expect(validReset.errors).toEqual({});
  });
});

describe('Auth Service (localStorage management)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('registers a new user with @spumil.net and stores safe session', () => {
    const regResult = authService.registerUser({
      name: 'Test Student',
      email: 'student@spumil.net',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(regResult.success).toBe(true);
    expect(regResult.user.email).toBe('student@spumil.net');
    expect(regResult.user.password).toBeUndefined(); // password stripped from return

    const session = authService.getCurrentSession();
    expect(session).not.toBeNull();
    expect(session.email).toBe('student@spumil.net');
  });

  it('rejects duplicate email registrations', () => {
    authService.registerUser({
      name: 'Student One',
      email: 'duplicate@spumil.net',
      password: 'password123',
      confirmPassword: 'password123',
    });

    const duplicateResult = authService.registerUser({
      name: 'Student Two',
      email: 'duplicate@spumil.net',
      password: 'password456',
      confirmPassword: 'password456',
    });

    expect(duplicateResult.success).toBe(false);
    expect(duplicateResult.fieldErrors.email).toContain('ถูกใช้งานในระบบแล้ว');
  });

  it('authenticates valid login and rejects invalid password', () => {
    authService.registerUser({
      name: 'Login User',
      email: 'login@spumil.net',
      password: 'correctPassword',
      confirmPassword: 'correctPassword',
    });

    // Wrong password
    const wrongPass = authService.loginUser({
      email: 'login@spumil.net',
      password: 'wrongPassword',
    });
    expect(wrongPass.success).toBe(false);
    expect(wrongPass.error).toContain('รหัสผ่านไม่ถูกต้อง');

    // Correct password
    const correctLogin = authService.loginUser({
      email: 'login@spumil.net',
      password: 'correctPassword',
    });
    expect(correctLogin.success).toBe(true);
    expect(correctLogin.user.name).toBe('Login User');
  });

  it('allows resetting password for existing @spumil.net user', () => {
    authService.registerUser({
      name: 'Reset Candidate',
      email: 'resetme@spumil.net',
      password: 'oldPassword123',
      confirmPassword: 'oldPassword123',
    });

    // Non-existent user
    const nonExistentResult = authService.resetPassword({
      email: 'notfound@spumil.net',
      newPassword: 'brandNewPassword',
      confirmPassword: 'brandNewPassword',
    });
    expect(nonExistentResult.success).toBe(false);
    expect(nonExistentResult.error).toContain('ไม่พบบัญชีผู้ใช้นี้ในระบบ');

    // Existing user reset
    const resetResult = authService.resetPassword({
      email: 'resetme@spumil.net',
      newPassword: 'brandNewPassword',
      confirmPassword: 'brandNewPassword',
    });
    expect(resetResult.success).toBe(true);

    // Old password should now fail
    const oldLogin = authService.loginUser({
      email: 'resetme@spumil.net',
      password: 'oldPassword123',
    });
    expect(oldLogin.success).toBe(false);

    // New password should succeed
    const newLogin = authService.loginUser({
      email: 'resetme@spumil.net',
      password: 'brandNewPassword',
    });
    expect(newLogin.success).toBe(true);
  });
});

describe('Auth UI Integration with Series Finder App', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('allows opening the modal, registering with @spumil.net, and logging out', async () => {
    render(<App />);

    // 1. Initial guest state: Header has "เข้าสู่ระบบ" button
    const signInBtn = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });
    expect(signInBtn).toBeDefined();

    // 2. Click "เข้าสู่ระบบ" to open modal
    fireEvent.click(signInBtn);

    // 3. Modal opens: Switch to Register tab
    const registerTab = screen.getByRole('tab', { name: /ลงทะเบียน/i });
    fireEvent.click(registerTab);

    // 4. Fill in registration form
    const nameInput = screen.getByLabelText(/ชื่อ-นามสกุล/i);
    const emailInput = screen.getByLabelText(/อีเมล \(@spumil\.net\)/i);
    const passwordInputs = screen.getAllByLabelText(/รหัสผ่าน/i);

    fireEvent.change(nameInput, { target: { value: 'วีระชัย สายซีรีส์' } });
    fireEvent.change(emailInput, { target: { value: 'veerachai@spumil.net' } });
    fireEvent.change(passwordInputs[0], { target: { value: 'mysecretpass' } });
    fireEvent.change(screen.getByLabelText(/ยืนยันรหัสผ่าน/i), { target: { value: 'mysecretpass' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /ลงทะเบียนสมาชิก/i });
    fireEvent.click(submitBtn);

    // 5. User should now be authenticated: Header shows user name and logout button
    await waitFor(() => {
      expect(screen.getByText('วีระชัย สายซีรีส์')).toBeDefined();
      expect(screen.getByText('veerachai@spumil.net')).toBeDefined();
    });

    // 6. Click Logout
    const logoutBtn = screen.getByRole('button', { name: /ออกจากระบบ/i });
    fireEvent.click(logoutBtn);

    // 7. Should return to unauthenticated state with "เข้าสู่ระบบ" button
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /เข้าสู่ระบบ/i })).toBeDefined();
    });
  });

  it('blocks registration when user attempts non-spumil.net email in the UI', async () => {
    render(<App />);

    const signInBtn = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });
    fireEvent.click(signInBtn);

    const registerTab = screen.getByRole('tab', { name: /ลงทะเบียน/i });
    fireEvent.click(registerTab);

    fireEvent.change(screen.getByLabelText(/ชื่อ-นามสกุล/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/อีเมล \(@spumil\.net\)/i), { target: { value: 'alice@gmail.com' } });
    fireEvent.change(screen.getAllByLabelText(/รหัสผ่าน/i)[0], { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/ยืนยันรหัสผ่าน/i), { target: { value: '123456' } });

    const submitBtn = screen.getByRole('button', { name: /ลงทะเบียนสมาชิก/i });
    fireEvent.click(submitBtn);

    // Verification error is displayed
    await waitFor(() => {
      expect(screen.getByText(/อีเมลต้องเป็นโดเมน @spumil\.net เท่านั้น/i)).toBeDefined();
    });
  });

  it('supports the forgot password flow from login modal', async () => {
    // Pre-register a user
    authService.registerUser({
      name: 'Bob Spumil',
      email: 'bob@spumil.net',
      password: 'initialPassword123',
      confirmPassword: 'initialPassword123',
    });
    authService.clearCurrentSession();

    render(<App />);

    // Open login modal
    const signInBtn = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });
    fireEvent.click(signInBtn);

    // Click "ลืมรหัสผ่าน?"
    const forgotBtn = screen.getByRole('button', { name: /ลืมรหัสผ่าน\?/i });
    fireEvent.click(forgotBtn);

    // Modal switches to forgot password form
    expect(screen.getByText(/รีเซ็ตรหัสผ่าน/i)).toBeDefined();

    // Fill in email and new password
    const emailInput = screen.getByLabelText(/อีเมลที่ใช้สมัคร \(@spumil\.net\)/i);
    const newPassInput = screen.getByLabelText(/รหัสผ่านใหม่ \(อย่างน้อย 6 ตัวอักษร\)/i);
    const confirmPassInput = screen.getByLabelText(/ยืนยันรหัสผ่านใหม่/i);

    fireEvent.change(emailInput, { target: { value: 'bob@spumil.net' } });
    fireEvent.change(newPassInput, { target: { value: 'updatedSecret789' } });
    fireEvent.change(confirmPassInput, { target: { value: 'updatedSecret789' } });

    // Submit reset
    const resetSubmitBtn = screen.getByRole('button', { name: /เปลี่ยนรหัสผ่าน/i });
    fireEvent.click(resetSubmitBtn);

    // Should return to login form and show toast notification
    await waitFor(() => {
      expect(screen.getByText(/เปลี่ยนรหัสผ่านสำเร็จแล้ว! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่/i)).toBeDefined();
      expect(screen.getByLabelText(/รหัสผ่าน \*/i)).toBeDefined();
    });
  });
});
