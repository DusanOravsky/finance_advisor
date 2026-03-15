import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, MessageSquare, Shield, FileText, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import NotificationBell from '../shared/NotificationBell';
import ThemeToggle from '../shared/ThemeToggle';

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-2xl font-bold text-primary-600">
            FinanceAI
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/portfolio" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
              <TrendingUp size={20} />
              <span>Portfólio</span>
            </Link>
            <Link to="/insurance" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
              <Shield size={20} />
              <span>Poistenie</span>
            </Link>
            <Link to="/chat" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
              <MessageSquare size={20} />
              <span>AI Chat</span>
            </Link>
            <Link to="/reports" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
              <FileText size={20} />
              <span>Reporty</span>
            </Link>
            <Link to="/settings" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
              <SettingsIcon size={20} />
              <span>Nastavenia</span>
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationBell />
            <span className="text-sm text-gray-600 dark:text-gray-300">{user?.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2">
              <LogOut size={18} />
              Odhlásiť
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
