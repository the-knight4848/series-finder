import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterForm({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
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
      const res = await register(formData);
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
        <span className="auth-domain-icon">✨</span>
        <span>
          สมัครสมาชิกฟรี เฉพาะอีเมล <strong>@spumil.net</strong>
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
        <label htmlFor="reg-name" className="form-label">
          ชื่อ-นามสกุล <span className="required-star">*</span>
        </label>
        <div className="input-wrapper">
          <input
            id="reg-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="สมชาย สายซีรีส์"
            className={`auth-input ${fieldErrors.name ? 'input-error' : ''}`}
            autoComplete="name"
            required
          />
        </div>
        {fieldErrors.name && (
          <span className="field-error-msg">{fieldErrors.name}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="reg-email" className="form-label">
          อีเมล (@spumil.net) <span className="required-star">*</span>
        </label>
        <div className="input-wrapper">
          <input
            id="reg-email"
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
        <label htmlFor="reg-password" className="form-label">
          รหัสผ่าน (อย่างน้อย 6 ตัวอักษร) <span className="required-star">*</span>
        </label>
        <div className="input-wrapper">
          <input
            id="reg-password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={`auth-input ${fieldErrors.password ? 'input-error' : ''}`}
            autoComplete="new-password"
            required
          />
        </div>
        {fieldErrors.password && (
          <span className="field-error-msg">{fieldErrors.password}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="reg-confirm-password" className="form-label">
          ยืนยันรหัสผ่าน <span className="required-star">*</span>
        </label>
        <div className="input-wrapper">
          <input
            id="reg-confirm-password"
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
            <span className="mini-spinner" /> กำลังสร้างบัญชี...
          </span>
        ) : (
          'ลงทะเบียนสมาชิก (Create Account)'
        )}
      </button>

      <div className="auth-switch-footer">
        <span>มีบัญชี @spumil.net อยู่แล้ว?</span>{' '}
        <button
          type="button"
          className="auth-switch-btn"
          onClick={onSwitchToLogin}
        >
          เข้าสู่ระบบ
        </button>
      </div>
    </form>
  );
}
