import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, XCircle } from 'lucide-react';

/**
 * Premium login page — animated gradient mesh background,
 * glassmorphism card, floating decorative orbs, and branded header.
 * Supports "remember me" via localStorage vs sessionStorage strategy.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 60%, #0f3460 100%)'
          : 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 30%, #312E81 60%, #4338CA 100%)',
      }}
    >
      {/* Decorative gradient mesh orbs */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl animate-float"
        style={{
          top: '-15%', right: '-10%',
          background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
        style={{
          bottom: '-20%', left: '-10%',
          background: 'radial-gradient(circle, #A855F7 0%, transparent 70%)',
          animation: 'float 4s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full opacity-10 blur-2xl"
        style={{
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="w-full max-w-[420px] animate-fade-in relative z-10">
        {/* Logo & branding */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 shadow-2xl shadow-indigo-500/30"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <Building2 size={36} className="text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">ERP System</h1>
          <p className="text-indigo-200/70 mt-1.5 text-sm font-medium">Enterprise Resource Planning</p>
        </div>

        {/* Login card — glassmorphism */}
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: theme === 'dark' ? 'rgba(30,30,40,0.95)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.3)',
          }}
        >
          <div className="mb-6">
            <h2 className={`text-xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('login.welcome')}</h2>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('login.subtitle')}</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-5 flex items-center gap-3 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl animate-slide-in-down">
              <XCircle size={18} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('login.email')}</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  required
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm placeholder-gray-400 outline-none transition-all duration-200
                    ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white focus:bg-gray-750 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                    }`}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('login.password')}</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full pl-11 pr-12 py-3 border rounded-xl text-sm placeholder-gray-400 outline-none transition-all duration-200
                    ${theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white focus:bg-gray-750 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me + forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('login.rememberMe')}</span>
              </label>
              <button type="button" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                {t('login.forgotPassword')}
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  {t('login.loading')}
                </span>
              ) : t('login.submit')}
            </button>
          </form>

          {/* Footer */}
          <div className={`mt-6 pt-6 border-t text-center ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t('login.footer')}</p>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-xs text-indigo-200/40 mt-6">
          © 2026 ERP System · React + TypeScript + Tailwind CSS
        </p>
      </div>
    </div>
  );
}
