import { createContext, useContext, useState, useCallback } from 'react';
import {
  getCurrentSession,
  loginUser,
  registerUser,
  clearCurrentSession,
  resetPassword,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Load existing session on initial mount directly
  const [user, setUser] = useState(() => getCurrentSession());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'
  const [authNotification, setAuthNotification] = useState(null);

  const openAuthModal = useCallback((defaultTab = 'login') => {
    setAuthModalTab(defaultTab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const showNotification = useCallback((message, type = 'success') => {
    setAuthNotification({ message, type });
    setTimeout(() => {
      setAuthNotification(null);
    }, 4000);
  }, []);

  const handleLogin = useCallback(
    async (email, password) => {
      const result = loginUser({ email, password });
      if (result.success) {
        setUser(result.user);
        closeAuthModal();
        showNotification(`ยินดีต้อนรับกลับ, คุณ${result.user.name}! 👋`, 'success');
        return { success: true };
      }
      return result;
    },
    [closeAuthModal, showNotification]
  );

  const handleRegister = useCallback(
    async (formData) => {
      const result = registerUser(formData);
      if (result.success) {
        setUser(result.user);
        closeAuthModal();
        showNotification(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับคุณ ${result.user.name} สู่ Series Finder 🎉`, 'success');
        return { success: true };
      }
      return result;
    },
    [closeAuthModal, showNotification]
  );

  const handleLogout = useCallback(() => {
    clearCurrentSession();
    setUser(null);
    showNotification('ออกจากระบบเรียบร้อยแล้ว', 'info');
  }, [showNotification]);

  const handleResetPassword = useCallback(
    async ({ email, newPassword, confirmPassword }) => {
      const result = resetPassword({ email, newPassword, confirmPassword });
      if (result.success) {
        setAuthModalTab('login');
        showNotification('เปลี่ยนรหัสผ่านสำเร็จแล้ว! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่', 'success');
        return { success: true };
      }
      return result;
    },
    [showNotification]
  );

  const value = {
    user,
    isAuthenticated: !!user,
    isAuthModalOpen,
    authModalTab,
    authNotification,
    openAuthModal,
    closeAuthModal,
    setAuthModalTab,
    login: handleLogin,
    register: handleRegister,
    resetUserPassword: handleResetPassword,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
