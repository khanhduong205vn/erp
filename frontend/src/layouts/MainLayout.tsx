import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n, type Locale } from '../contexts/I18nContext';
import Modal from '../components/ui/Modal';
import {
  LayoutDashboard, Users, Package, CalendarDays,
  LogOut, Menu, X, Bell, Search, ChevronLeft,
  Building2, Sun, Moon, Globe, CheckCircle, UserCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/employees', labelKey: 'nav.employees', icon: Users },
  { to: '/assets', labelKey: 'nav.assets', icon: Package },
  { to: '/meetings', labelKey: 'nav.meetings', icon: CalendarDays },
];

/**
 * Premium application layout — gradient dark sidebar + glass-effect top bar.
 * Includes theme toggle, language switcher, logout modal, and profile link.
 */
export default function MainLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(true);
    // Auto-redirect after a brief pause
    setTimeout(() => {
      setShowLogoutModal(false);
      navigate('/login');
    }, 1800);
  };

  const handleToggleLang = () => {
    setLocale(locale === 'vi' ? 'en' : 'vi');
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'A';
  const isDark = theme === 'dark';

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50/80'}`}>
      {/* ===== Sidebar ===== */}
      <aside
        className={`${sidebarOpen ? 'w-[260px]' : 'w-[72px]'} flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out relative`}
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)'
            : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        }}
      >
        {/* Logo */}
        <div className={`px-4 py-5 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-200'} ${sidebarOpen ? '' : 'flex justify-center'}`}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)' }}
            >
              <Building2 size={20} className="text-white" strokeWidth={2} />
            </div>
            {sidebarOpen && (
              <div className="animate-fade-in">
                <h1 className={`font-bold text-[15px] leading-tight tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>ERP System</h1>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Enterprise Resource Planning</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              title={sidebarOpen ? undefined : t(item.labelKey)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl text-[13px] font-medium transition-all duration-200 group relative
                ${sidebarOpen ? 'px-3.5 py-2.5' : 'px-0 py-2.5 justify-center'}
                ${isActive
                  ? 'text-white shadow-lg shadow-indigo-500/20'
                  : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)' }
                  : {}
              }
            >
              <item.icon size={20} strokeWidth={1.8} className="flex-shrink-0" />
              {sidebarOpen && <span>{t(item.labelKey)}</span>}

              {/* Tooltip for collapsed mode */}
              {!sidebarOpen && (
                <div className={`absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-800 text-white'}`}>
                  {t(item.labelKey)}
                  <div className={`absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 ${isDark ? 'bg-gray-900' : 'bg-gray-800'}`} />
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar collapse toggle */}
        <div className={`px-3 py-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-gray-200'}`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex items-center gap-3 w-full rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer
              ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}
              ${sidebarOpen ? 'px-3.5 py-2.5' : 'px-0 py-2.5 justify-center'}`}
          >
            <ChevronLeft
              size={20}
              strokeWidth={1.8}
              className={`flex-shrink-0 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`}
            />
            {sidebarOpen && <span>{t('nav.collapse')}</span>}
          </button>
        </div>

        {/* Logout */}
        <div className={`px-3 py-3 border-t ${isDark ? 'border-white/[0.06]' : 'border-gray-200'}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full rounded-xl text-[13px] font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 cursor-pointer
              ${sidebarOpen ? 'px-3.5 py-2.5' : 'px-0 py-2.5 justify-center'}`}
            title={sidebarOpen ? undefined : t('nav.logout')}
          >
            <LogOut size={20} strokeWidth={1.8} className="flex-shrink-0" />
            {sidebarOpen && <span>{t('nav.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* ===== Main content ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Glass-effect header */}
        <header className={`h-16 border-b flex items-center justify-between px-6 flex-shrink-0 z-10
          ${isDark
            ? 'bg-gray-900/80 border-gray-800 backdrop-blur-md'
            : 'glass border-gray-200/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-xl transition-colors cursor-pointer lg:hidden ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              {sidebarOpen
                ? <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                : <Menu size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              }
            </button>

            {/* Search shortcut */}
            <div className={`hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm min-w-[240px]
              ${isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-100/80 text-gray-400'}`}
            >
              <Search size={16} />
              <span>{t('header.search')}</span>
              <kbd className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-mono font-medium shadow-sm
                ${isDark ? 'bg-gray-700 text-gray-400 border border-gray-600' : 'bg-white text-gray-400 border border-gray-200'}`}
              >
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={handleToggleLang}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer
                ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
              title={locale === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            >
              <Globe size={16} strokeWidth={2} />
              <span className="uppercase">{locale}</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all cursor-pointer
                ${isDark ? 'hover:bg-gray-800 text-amber-400' : 'hover:bg-gray-100 text-gray-500'}`}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
            </button>

            {/* Notification bell */}
            <button className={`relative p-2.5 rounded-xl transition-colors cursor-pointer
              ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <Bell size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} strokeWidth={1.8} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
            </button>

            {/* Divider */}
            <div className={`w-px h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

            {/* User info + profile link */}
            <button
              onClick={() => navigate('/profile')}
              className={`flex items-center gap-3 px-2 py-1.5 rounded-xl transition-colors cursor-pointer
                ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
            >
              <div className="text-right hidden sm:block">
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{user?.name || 'Admin'}</p>
                <p className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{user?.role || t('common.admin')}</p>
              </div>
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full object-cover shadow-lg shadow-indigo-500/20"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20"
                    style={{ background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)' }}
                  >
                    {userInitial}
                  </div>
                )}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 ${isDark ? 'border-gray-900' : 'border-white'}`} />
              </div>
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-gray-900' : ''}`}>
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ===== Logout success modal ===== */}
      <Modal isOpen={showLogoutModal} onClose={() => {}} title="" size="max-w-sm">
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
            className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle size={32} className="text-emerald-600" strokeWidth={2} />
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {t('logout.title')}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {t('logout.message')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-xs text-gray-400"
          >
            <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            {t('logout.redirect')}
          </motion.div>
        </div>
      </Modal>
    </div>
  );
}
