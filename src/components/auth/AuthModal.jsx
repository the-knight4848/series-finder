import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, setAuthModalTab } = useAuth();
  const modalContentRef = useRef(null);

  // Close on Escape key press & prevent background scroll
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleOverlayClick = (e) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target)) {
      closeAuthModal();
    }
  };

  const getModalTitle = () => {
    if (authModalTab === 'register') return 'สมัครสมาชิกใหม่';
    if (authModalTab === 'forgot') return 'รีเซ็ตรหัสผ่าน (Reset Password)';
    return 'เข้าสู่ระบบ Series Finder';
  };

  const getModalSubtitle = () => {
    if (authModalTab === 'register') {
      return 'สร้างบัญชีเพื่อบันทึกและจัดการซีรีส์ที่คุณชื่นชอบ';
    }
    if (authModalTab === 'forgot') {
      return 'กรอกอีเมล @spumil.net เพื่อตั้งรหัสผ่านใหม่สำหรับเข้าใช้งาน';
    }
    return 'ยินดีต้อนรับกลับ! เข้าสู่ระบบด้วยบัญชี @spumil.net';
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="auth-modal-box" ref={modalContentRef}>
        {/* Close Button */}
        <button
          type="button"
          className="auth-modal-close-btn"
          onClick={closeAuthModal}
          aria-label="ปิดหน้าต่าง"
          title="ปิดหน้าต่าง (Esc)"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Modal Header & Tabs */}
        <div className="auth-modal-header">
          <div className="auth-modal-icon-badge" aria-hidden="true">
            {authModalTab === 'forgot' ? (
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8" cy="15" r="4" />
                <line x1="10.85" y1="12.15" x2="19" y2="4" />
                <line x1="18" y1="5" x2="20" y2="7" />
                <line x1="15" y1="8" x2="17" y2="10" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          <h2 id="auth-modal-title" className="auth-modal-title">
            {getModalTitle()}
          </h2>
          <p className="auth-modal-subtitle">
            {getModalSubtitle()}
          </p>

          <div className="auth-tab-switch" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={authModalTab === 'login'}
              className={`auth-tab-btn ${authModalTab === 'login' ? 'active' : ''}`}
              onClick={() => setAuthModalTab('login')}
            >
              เข้าสู่ระบบ (Sign In)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authModalTab === 'register'}
              className={`auth-tab-btn ${authModalTab === 'register' ? 'active' : ''}`}
              onClick={() => setAuthModalTab('register')}
            >
              ลงทะเบียน (Register)
            </button>
            {authModalTab === 'forgot' && (
              <button
                type="button"
                role="tab"
                aria-selected={true}
                className="auth-tab-btn active"
              >
                ลืมรหัสผ่าน
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="auth-modal-body">
          {authModalTab === 'login' && (
            <LoginForm
              onSwitchToRegister={() => setAuthModalTab('register')}
              onSwitchToForgot={() => setAuthModalTab('forgot')}
            />
          )}
          {authModalTab === 'register' && (
            <RegisterForm onSwitchToLogin={() => setAuthModalTab('login')} />
          )}
          {authModalTab === 'forgot' && (
            <ForgotPasswordForm onSwitchToLogin={() => setAuthModalTab('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
