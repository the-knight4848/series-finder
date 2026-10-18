import { useAuth } from '../../context/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div className="user-menu-container">
      <div className="user-badge" title={`เข้าสู่ระบบในชื่อ: ${user.name} (${user.email})`}>
        <div className="user-avatar" aria-hidden="true">
          {initial}
        </div>
        <div className="user-details">
          <span className="user-name">{user.name}</span>
          <span className="user-email-tag">
            <span className="status-dot-active" />
            {user.email}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="logout-btn"
        onClick={logout}
        title="ออกจากระบบ"
        aria-label="ออกจากระบบ"
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
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span className="logout-btn-text">ออกจากระบบ</span>
      </button>
    </div>
  );
}
