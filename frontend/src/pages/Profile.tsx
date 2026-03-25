import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { employeeApi, authApi } from '../services/api';
import Badge, { getRoleBadgeVariant, getStatusBadgeVariant } from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import { useToast } from '../components/ui/Toast';
import type { Employee } from '../types';
import {
  User, Mail, Building2, Briefcase, Shield, Calendar,
  Clock, Hash, Lock, CheckCircle, Camera, Upload, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/** Maximum avatar file size in bytes (2MB) */
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

/** Profile page — premium full-width layout with avatar upload */
export default function Profile() {
  const { user, setUser } = useAuth();
  const { t } = useI18n();
  const { theme } = useTheme();
  const { toast } = useToast();
  const isDark = theme === 'dark';

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch employee record by matching logged-in user email
  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    employeeApi.list({ search: user.email })
      .then(res => {
        const match = res.data.find(e => e.email === user.email);
        setEmployee(match || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.email]);

  // Sync avatar from user context
  useEffect(() => { setAvatarUrl(user?.avatar || null); }, [user?.avatar]);

  /** Convert selected file to base64 and upload */
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast('error', t('profile.avatarInvalidType'));
      return;
    }

    // Validate file size
    if (file.size > MAX_AVATAR_SIZE) {
      toast('error', t('profile.avatarTooLarge'));
      return;
    }

    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      await authApi.uploadAvatar(base64);

      // Update local state + auth context
      setAvatarUrl(base64);
      if (user) setUser({ ...user, avatar: base64 });
      toast('success', t('profile.avatarSuccess'));
    } catch (err) {
      toast('error', err instanceof Error ? err.message : t('common.error'));
    } finally {
      setUploading(false);
      // Reset input so the same file can be reselected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /** Remove avatar */
  const handleRemoveAvatar = async () => {
    setUploading(true);
    try {
      await authApi.uploadAvatar('');
      setAvatarUrl(null);
      if (user) setUser({ ...user, avatar: null });
      toast('success', t('profile.avatarRemoved'));
    } catch (err) {
      toast('error', t('common.error'));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <ProfileSkeleton isDark={isDark} />;

  const displayName = employee?.name || user?.name || 'Admin';
  const displayEmail = employee?.email || user?.email || '—';
  const displayRole = employee?.role || user?.role || '—';
  const displayStatus = employee?.status || 'Hoạt động';

  return (
    <div>
      <PageHeader title={t('profile.title')} description={t('profile.desc')} />

      {/* Hero banner with avatar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={`rounded-2xl border overflow-hidden mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
      >
        {/* Gradient banner */}
        <div
          className="h-36 relative"
          style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 30%, #A855F7 60%, #EC4899 100%)' }}
        >
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.2) 0%, transparent 40%)' }} />
        </div>

        {/* Avatar + info bar */}
        <div className="px-8 pb-6 -mt-14 flex flex-col sm:flex-row items-start sm:items-end gap-5">
          {/* Avatar with upload overlay */}
          <div className="relative group">
            <div
              className={`w-28 h-28 rounded-2xl border-4 flex items-center justify-center overflow-hidden shadow-xl flex-shrink-0 ${isDark ? 'border-gray-800 bg-gray-700' : 'border-white bg-gray-100'}`}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white font-extrabold text-4xl"
                  style={{ background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)' }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Upload overlay — appears on hover */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer"
            >
              {uploading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Camera size={22} className="text-white mb-1" />
                  <span className="text-white text-[10px] font-bold">{t('profile.changeAvatar')}</span>
                </>
              )}
            </button>

            {/* Remove button — only if avatar exists */}
            {avatarUrl && !uploading && (
              <button
                onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
                title={t('profile.removeAvatar')}
              >
                <X size={12} strokeWidth={3} />
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Name + badges */}
          <div className="flex-1 pb-1">
            <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {displayName}
            </h2>
            <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {employee?.position || user?.role || '—'}
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <Badge text={displayRole} variant={getRoleBadgeVariant(displayRole)} />
              <Badge text={displayStatus} variant={getStatusBadgeVariant(displayStatus)} />
              {employee?.code && (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                  {employee.code}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info cards grid — full width, 2 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal information card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`rounded-2xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
        >
          <SectionHeader icon={User} color="indigo" label={t('profile.info')} isDark={isDark} />
          <div className="space-y-0.5 mt-5">
            <InfoRow icon={Hash} label={t('profile.employeeCode')} value={employee?.code || '—'} isDark={isDark} delay={0.12} />
            <InfoRow icon={User} label={t('profile.name')} value={displayName} isDark={isDark} delay={0.16} />
            <InfoRow icon={Mail} label={t('profile.email')} value={displayEmail} isDark={isDark} delay={0.20} />
            <InfoRow icon={Building2} label={t('profile.department')} value={employee?.department || '—'} isDark={isDark} delay={0.24} />
            <InfoRow icon={Briefcase} label={t('profile.position')} value={employee?.position || '—'} isDark={isDark} delay={0.28} />
          </div>
        </motion.div>

        {/* Role & status card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className={`rounded-2xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
        >
          <SectionHeader icon={Shield} color="emerald" label={t('profile.accountInfo')} isDark={isDark} />
          <div className="space-y-0.5 mt-5">
            <InfoRow icon={Shield} label={t('profile.role')} isDark={isDark} delay={0.12}
              badge={<Badge text={displayRole} variant={getRoleBadgeVariant(displayRole)} />} />
            <InfoRow icon={CheckCircle} label={t('profile.status')} isDark={isDark} delay={0.16}
              badge={<Badge text={displayStatus} variant={getStatusBadgeVariant(displayStatus)} />} />
            <InfoRow icon={Shield} label={t('profile.systemRole')} value={user?.role || '—'} isDark={isDark} delay={0.20} />
            <InfoRow icon={Calendar} label={t('profile.joinDate')}
              value={employee?.created_at ? new Date(employee.created_at).toLocaleDateString('vi-VN') : '—'}
              isDark={isDark} delay={0.24} />
            <InfoRow icon={Clock} label={t('profile.lastUpdate')}
              value={employee?.updated_at ? new Date(employee.updated_at).toLocaleDateString('vi-VN') : '—'}
              isDark={isDark} delay={0.28} />
            <InfoRow icon={Lock} label={t('profile.security')}
              value={t('profile.passwordHint')} muted isDark={isDark} delay={0.32} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ===== Sub-components ===== */

/** Section header with colored icon */
function SectionHeader({ icon: Icon, color, label, isDark }: {
  icon: typeof User; color: string; label: string; isDark: boolean;
}) {
  const colorMap: Record<string, string> = {
    indigo: isDark ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600',
    emerald: isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</h3>
    </div>
  );
}

/** Single info row with staggered animation */
function InfoRow({ icon: Icon, label, value, badge, muted, isDark, delay = 0 }: {
  icon: typeof User; label: string; value?: string; badge?: React.ReactNode;
  muted?: boolean; isDark: boolean; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`flex items-center gap-4 py-3.5 border-b last:border-b-0 ${isDark ? 'border-gray-700/60' : 'border-gray-100'}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <Icon size={15} className={isDark ? 'text-gray-400' : 'text-gray-400'} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] uppercase tracking-wider font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
        {badge ? (
          <div className="mt-1">{badge}</div>
        ) : (
          <p className={`text-sm font-semibold mt-0.5 truncate ${muted ? (isDark ? 'text-gray-400' : 'text-gray-500') : (isDark ? 'text-gray-200' : 'text-gray-900')}`}>
            {value}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/** Shimmer skeleton for profile loading state */
function ProfileSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className="space-y-6">
      <div><div className="h-7 w-48 animate-shimmer rounded-lg" /><div className="h-4 w-64 animate-shimmer rounded mt-2" /></div>
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="h-36 animate-shimmer" />
        <div className="px-8 pb-6 -mt-14 flex items-end gap-5">
          <div className="w-28 h-28 rounded-2xl animate-shimmer border-4 border-white dark:border-gray-800" />
          <div className="space-y-2 pb-2">
            <div className="h-6 w-48 animate-shimmer rounded-lg" />
            <div className="h-4 w-32 animate-shimmer rounded" />
            <div className="flex gap-2"><div className="h-5 w-20 animate-shimmer rounded-full" /><div className="h-5 w-16 animate-shimmer rounded-full" /></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 animate-shimmer rounded-2xl" />
        <div className="h-80 animate-shimmer rounded-2xl" />
      </div>
    </div>
  );
}

/** Convert File to base64 data URL */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
