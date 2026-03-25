import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import StatsCard from '../components/ui/StatsCard';
import Badge, { getStatusBadgeVariant } from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import type { DashboardStats } from '../types';
import {
  Users, Package, CalendarDays, Clock,
  UserPlus, PackagePlus, CalendarPlus,
  ArrowRight, CheckCircle, Layers,
  BarChart3, Activity, TrendingUp,
  MapPin, User, Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';

/** Animated progress bar */
function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

/** Horizontal bar for breakdown visualizations */
function HorizontalBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-28 truncate" title={label}>{label}</span>
      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-[6px] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-6 text-right">{value}</span>
    </div>
  );
}

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    dashboardApi.stats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!stats) return null;

  const employeeRate = stats.totalEmployees > 0 ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100) : 0;
  const assetUtilRate = stats.totalAssets > 0 ? Math.round((stats.inUseAssets / stats.totalAssets) * 100) : 0;
  const bookingApprovalRate = stats.totalBookings > 0 ? Math.round((stats.approvedBookings / stats.totalBookings) * 100) : 0;

  const quickActions = [
    { label: t('dashboard.addEmployee'), icon: UserPlus, color: 'bg-indigo-500', path: '/employees' },
    { label: t('dashboard.addAsset'), icon: PackagePlus, color: 'bg-emerald-500', path: '/assets' },
    { label: t('dashboard.bookRoom'), icon: CalendarPlus, color: 'bg-purple-500', path: '/meetings' },
  ];

  const resourceMetrics = [
    { label: t('dashboard.activeEmployees'), value: stats.activeEmployees, max: stats.totalEmployees, color: 'bg-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-900/40', textColor: 'text-indigo-600', icon: Users },
    { label: t('dashboard.assetsInUse'), value: stats.inUseAssets, max: stats.totalAssets, color: 'bg-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/40', textColor: 'text-emerald-600', icon: Package },
    { label: t('dashboard.roomsToday'), value: stats.todayBookings, max: stats.meetingRooms > 0 ? stats.meetingRooms : 1, color: 'bg-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/40', textColor: 'text-purple-600', icon: CalendarDays },
    { label: t('dashboard.pendingApprovals'), value: stats.pendingApprovals, max: stats.totalBookings || 1, color: stats.pendingApprovals > 0 ? 'bg-orange-500' : 'bg-emerald-500', bgColor: stats.pendingApprovals > 0 ? 'bg-orange-50 dark:bg-orange-900/40' : 'bg-emerald-50 dark:bg-emerald-900/40', textColor: stats.pendingApprovals > 0 ? 'text-orange-600' : 'text-emerald-600', icon: Clock },
  ];

  const deptColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  const maxDeptCount = stats.departmentBreakdown.length > 0 ? Math.max(...stats.departmentBreakdown.map(d => d.count)) : 1;

  const formatBookingDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const bd = new Date(d); bd.setHours(0, 0, 0, 0);
    const diff = Math.round((bd.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return t('dashboard.today');
    if (diff === 1) return t('dashboard.tomorrow');
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const dc = isDark; // shorthand

  return (
    <div>
      <PageHeader title={t('dashboard.title')} description={t('dashboard.desc')} />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard title={t('dashboard.totalEmployees')} value={stats.totalEmployees} subtitle={`${stats.activeEmployees} ${t('dashboard.working')}`} color="indigo" icon={<Users size={20} className="text-indigo-600" strokeWidth={1.8} />} />
        <StatsCard title={t('dashboard.totalAssets')} value={stats.totalAssets} subtitle={`${stats.meetingRooms} ${t('dashboard.meetingRooms')}`} color="emerald" icon={<Package size={20} className="text-emerald-600" strokeWidth={1.8} />} />
        <StatsCard title={t('dashboard.todayBookings')} value={stats.todayBookings} subtitle={`${stats.thisWeekBookings} ${t('dashboard.weekBookings')}`} color="purple" icon={<CalendarDays size={20} className="text-purple-600" strokeWidth={1.8} />} />
        <StatsCard title={t('dashboard.pending')} value={stats.pendingApprovals} subtitle={`${stats.totalBookings} ${t('dashboard.totalBookings')}`} color="orange" icon={<Clock size={20} className="text-orange-600" strokeWidth={1.8} />} />
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${dc ? 'text-gray-500' : 'text-gray-500'}`}>{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map(action => (
            <button key={action.label} onClick={() => navigate(action.path)}
              className={`flex items-center gap-4 p-4 rounded-2xl border card-hover group cursor-pointer text-left ${dc ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className={`w-11 h-11 ${action.color} rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                <action.icon size={20} className="text-white" strokeWidth={2} />
              </div>
              <div className="flex-1"><p className={`text-sm font-semibold ${dc ? 'text-gray-200' : 'text-gray-900'}`}>{action.label}</p></div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Utilization + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible"
          className={`rounded-2xl border p-6 card-hover ${dc ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center">
                <BarChart3 size={18} className="text-indigo-600" strokeWidth={2} />
              </div>
              <h2 className={`text-base font-bold ${dc ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.utilization')}</h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 px-2.5 py-1 rounded-full">
              <Activity size={12} />{t('dashboard.live')}
            </div>
          </div>
          <div className="space-y-5">
            {resourceMetrics.map((m, idx) => {
              const pct = m.max > 0 ? Math.round((m.value / m.max) * 100) : 0;
              const MI = m.icon;
              return (
                <motion.div key={m.label} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 ${m.bgColor} rounded-lg flex items-center justify-center`}><MI size={12} className={m.textColor} strokeWidth={2.5} /></div>
                      <span className={`text-sm font-medium ${dc ? 'text-gray-300' : 'text-gray-700'}`}>{m.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-bold ${m.textColor}`}>{m.value}</span>
                      <span className="text-xs text-gray-400">/ {m.max}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${m.bgColor} ${m.textColor}`}>{pct}%</span>
                    </div>
                  </div>
                  <ProgressBar value={m.value} max={m.max} color={m.color} />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible"
          className={`rounded-2xl border p-6 card-hover ${dc ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
              <TrendingUp size={18} className="text-emerald-600" strokeWidth={2} />
            </div>
            <h2 className={`text-base font-bold ${dc ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.kpiTitle')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: t('dashboard.activityRate'), value: `${employeeRate}%`, sub: `${stats.activeEmployees}/${stats.totalEmployees} NV`, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
              { label: t('dashboard.assetUtil'), value: `${assetUtilRate}%`, sub: `${stats.inUseAssets}/${stats.totalAssets} TS`, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
              { label: t('dashboard.approvalRate'), value: `${bookingApprovalRate}%`, sub: `${stats.approvedBookings}/${stats.totalBookings}`, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
              { label: t('dashboard.monthBookings'), value: `${stats.thisMonthBookings}`, sub: `${stats.thisWeekBookings} ${t('dashboard.thisWeek')}`, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' },
            ].map((kpi, i) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06, duration: 0.3 }} className={`${kpi.bg} rounded-xl p-3.5`}>
                <p className={`text-[11px] font-semibold mb-1 ${dc ? 'text-gray-400' : 'text-gray-500'}`}>{kpi.label}</p>
                <p className={`text-xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
                <p className={`text-[11px] mt-0.5 ${dc ? 'text-gray-500' : 'text-gray-400'}`}>{kpi.sub}</p>
              </motion.div>
            ))}
          </div>
          <div className={`border-t pt-4 ${dc ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-[11px] uppercase tracking-wider font-bold mb-3 ${dc ? 'text-gray-500' : 'text-gray-400'}`}>{t('dashboard.assetStatus')}</p>
            <div className="flex gap-4">
              {[
                { label: t('dashboard.ready'), value: stats.readyAssets, color: 'text-emerald-600', dot: 'bg-emerald-500' },
                { label: t('dashboard.inUse'), value: stats.inUseAssets, color: 'text-blue-600', dot: 'bg-blue-500' },
                { label: t('dashboard.maintenance'), value: stats.maintenanceAssets, color: 'text-amber-600', dot: 'bg-amber-500' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className={`text-xs ${dc ? 'text-gray-400' : 'text-gray-500'}`}>{s.label}</span>
                  <span className={`text-xs font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Department + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible"
          className={`rounded-2xl border p-6 card-hover ${dc ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-purple-50 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
                <Layers size={18} className="text-purple-600" strokeWidth={2} />
              </div>
              <h2 className={`text-base font-bold ${dc ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.deptBreakdown')}</h2>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-1 rounded-full">
              {stats.departmentBreakdown.length} {t('dashboard.departments')}
            </span>
          </div>
          {stats.departmentBreakdown.length === 0 ? (
            <p className={`text-sm text-center py-8 ${dc ? 'text-gray-500' : 'text-gray-400'}`}>{t('dashboard.noData')}</p>
          ) : (
            <div className="space-y-3.5">
              {stats.departmentBreakdown.map((dept, idx) => (
                <motion.div key={dept.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + idx * 0.06, duration: 0.3 }}>
                  <HorizontalBar label={dept.name} value={dept.count} max={maxDeptCount} color={deptColors[idx % deptColors.length]} />
                </motion.div>
              ))}
            </div>
          )}
          {stats.roleBreakdown.length > 0 && (
            <div className={`mt-5 pt-4 border-t ${dc ? 'border-gray-700' : 'border-gray-100'}`}>
              <p className={`text-[11px] uppercase tracking-wider font-bold mb-3 ${dc ? 'text-gray-500' : 'text-gray-400'}`}>{t('dashboard.roleBreakdown')}</p>
              <div className="flex gap-3 flex-wrap">
                {stats.roleBreakdown.map(role => (
                  <div key={role.name} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 ${dc ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <CheckCircle size={12} className="text-gray-400" />
                    <span className={`text-xs font-medium ${dc ? 'text-gray-300' : 'text-gray-600'}`}>{role.name}</span>
                    <span className={`text-xs font-bold ${dc ? 'text-white' : 'text-gray-900'}`}>{role.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible"
          className={`rounded-2xl border p-6 card-hover ${dc ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
                <Calendar size={18} className="text-amber-600" strokeWidth={2} />
              </div>
              <h2 className={`text-base font-bold ${dc ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.upcomingMeetings')}</h2>
            </div>
            <button onClick={() => navigate('/meetings')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors">
              {t('dashboard.viewAll')} <ArrowRight size={12} />
            </button>
          </div>
          {stats.recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" strokeWidth={1.5} />
              <p className={`text-sm ${dc ? 'text-gray-500' : 'text-gray-400'}`}>{t('dashboard.noUpcoming')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentBookings.map((b, idx) => (
                <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + idx * 0.06, duration: 0.3 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${dc ? 'border-gray-700 hover:border-indigo-800 hover:bg-gray-750' : 'border-gray-100 hover:border-indigo-200 hover:shadow-sm'}`}>
                  <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase leading-none">{formatBookingDate(b.date)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${dc ? 'text-gray-200' : 'text-gray-900'}`}>{b.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                      <span className="flex items-center gap-0.5"><Clock size={10} /> {b.startTime} - {b.endTime}</span>
                      <span className="flex items-center gap-0.5"><MapPin size={10} /> {b.roomName}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-0.5"><User size={10} /> {b.organizer}</p>
                  </div>
                  <Badge text={b.status} variant={getStatusBadgeVariant(b.status)} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div><div className="h-7 w-56 animate-shimmer rounded-lg" /><div className="h-4 w-80 animate-shimmer rounded mt-2" /></div>
      <div className="grid grid-cols-4 gap-5">{[1,2,3,4].map(i => <div key={i} className="h-[120px] animate-shimmer rounded-2xl" />)}</div>
      <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-16 animate-shimmer rounded-2xl" />)}</div>
      <div className="grid grid-cols-2 gap-6"><div className="h-80 animate-shimmer rounded-2xl" /><div className="h-80 animate-shimmer rounded-2xl" /></div>
      <div className="grid grid-cols-2 gap-6"><div className="h-72 animate-shimmer rounded-2xl" /><div className="h-72 animate-shimmer rounded-2xl" /></div>
    </div>
  );
}
