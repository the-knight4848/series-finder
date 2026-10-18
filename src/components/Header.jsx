import { useAuth } from '../context/AuthContext';
import UserMenu from './auth/UserMenu';

export default function Header({ onReset }) {
  const { isAuthenticated, openAuthModal } = useAuth();

  return (
    <header className="app-header">
      <div className="header-container">
        <div
          className="brand-group"
          onClick={onReset}
          role={onReset ? 'button' : undefined}
          tabIndex={onReset ? 0 : undefined}
          onKeyDown={(e) => {
            if (onReset && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onReset();
            }
          }}
          title="Click to reset Series Finder"
        >
          <div className="brand-icon-wrapper" aria-hidden="true">
            <svg
              className="brand-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
              <polyline points="17 2 12 7 7 2" />
              <polygon points="10 12 15 15 10 18" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="brand-text">
            <h1 className="brand-title">Series Finder</h1>
            <p className="brand-subtitle">Discover your next favorite series.</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="header-badges">
            <span className="api-badge" title="Powered by TVmaze REST API">
              <span className="status-dot"></span>
              TVmaze API
            </span>
          </div>

          <div className="header-auth-section">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <button
                type="button"
                className="header-signin-btn"
                onClick={() => openAuthModal('login')}
                title="เข้าสู่ระบบด้วยบัญชี @spumil.net"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span>เข้าสู่ระบบ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
