import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm({ onSwitchToRegister, onSwitchToForgot }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when typing
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
      const res = await login(formData.email, formData.password);
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
        <span className="auth-domain-icon">🔒</span>
        <span>
          ระบบสำหรับสมาชิก <strong>@spumil.net</strong> เท่านั้น
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
        <label htmlFor="login-email" className="form-label">
          อีเมล (@spumil.net) <span className="required-star">*</span>
        </label>
        <div className="input-wrapper">
          <input
            id="login-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@spumil.net"
            className={`auth-input ${fieldErrors.email ? 'input-error' : ''}`}
            autoComplete="email"
            required
          />
        </div>
        {fieldErrors.email ? (
          <span className="field-error-msg">{fieldErrors.email}</span>
        ) : (
          <small className="field-hint">ตัวอย่าง: username@spumil.net</small>
        )}
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="login-password" className="form-label">
            รหัสผ่าน <span className="required-star">*</span>
          </label>
          {onSwitchToForgot && (
            <button
              type="button"
              className="auth-forgot-link"
              onClick={onSwitchToForgot}
            >
              ลืมรหัสผ่าน?
            </button>
          )}
        </div>
        <div className="input-wrapper">
          <input
            id="login-password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={`auth-input ${fieldErrors.password ? 'input-error' : ''}`}
            autoComplete="current-password"
            required
          />
        </div>
        {fieldErrors.password && (
          <span className="field-error-msg">{fieldErrors.password}</span>
        )}
      </div>

      <button
        type="submit"
        className="auth-submit-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="auth-spinner-text">
            <span className="mini-spinner" /> กำลังเข้าสู่ระบบ...
          </span>
        ) : (
          'เข้าสู่ระบบ (Sign In)'
        )}
      </button>

      <div className="auth-switch-footer">
        <span>ยังไม่มีบัญชี @spumil.net?</span>{' '}
        <button
          type="button"
          className="auth-switch-btn"
          onClick={onSwitchToRegister}
        >
          สร้างบัญชีใหม่
        </button>
      </div>
    </form>
  );
}
