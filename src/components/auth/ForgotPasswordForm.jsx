import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordForm({ onSwitchToLogin }) {
  const { resetUserPassword } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError('');

    try {
      const res = await resetUserPassword(formData);
      if (!res.success) {
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
        if (res.error) {
          setGeneralError(res.error);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-domain-banner">
        <span className="auth-domain-icon">🔑</span>
        <span>
          ตั้งรหัสผ่านใหม่สำหรับอีเมล <strong>@spumil.net</strong>
        </span>
      </div>

      {generalError && (
        <div className="auth-error-alert" role="alert">
          <svg className="auth-alert-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{generalError}</span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="reset-email" className="form-label">
          อีเมลที่ใช้สมัคร (@spumil.net) <span className="required-star">*</span>
        </label>
        <div className="input-wrapper">
          <input
            id="reset-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="yourname@spumil.net"
            className={`auth-input ${fieldErrors.email ? 'input-error' : ''}`}
            autoComplete="email"
            required
          />
        </div>
        {fieldErrors.email ? (
          <span className="field-error-msg">{fieldErrors.email}</span>
        ) : (
          <small className="field-hint">ต้องลงท้ายด้วย <strong>@spumil.net</strong> เท่านั้น</small>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="reset-new-password" className="form-label">
          รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร) <span className="required-star">*</span>
        </label>
        <div className="input-wrapper">
          <input
            id="reset-new-password"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className={`auth-input ${fieldErrors.newPassword ? 'input-error' : ''}`}
            autoComplete="new-password"
            required
          />
        </div>
        {fieldErrors.newPassword && (
          <span className="field-error-msg">{fieldErrors.newPassword}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="reset-confirm-password" className="form-label">
          ยืนยันรหัสผ่านใหม่ <span className="required-star">*</span>
        </label>
        <div className="input-wrapper">
          <input
            id="reset-confirm-password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className={`auth-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
            autoComplete="new-password"
            required
          />
        </div>
        {fieldErrors.confirmPassword && (
          <span className="field-error-msg">{fieldErrors.confirmPassword}</span>
        )}
      </div>

      <button
        type="submit"
        className="auth-submit-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="auth-spinner-text">
            <span className="mini-spinner" /> กำลังบันทึกรหัสผ่านใหม่...
          </span>
        ) : (
          'เปลี่ยนรหัสผ่าน (Reset Password)'
        )}
      </button>

      <div className="auth-switch-footer">
        <span>จำรหัสผ่านได้แล้ว?</span>{' '}
        <button
          type="button"
          className="auth-switch-btn"
          onClick={onSwitchToLogin}
        >
          กลับไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    </form>
  );
}
