import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { bookingApi, assetApi } from '../services/api';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import Badge, { getStatusBadgeVariant } from '../components/ui/Badge';
import StatsCard from '../components/ui/StatsCard';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import type { Booking, BookingFormData, Asset } from '../types';
import {
  Plus, Building2, CalendarDays, Clock, AlertTriangle,
  Trash2, Check, X, ChevronLeft, ChevronRight, CalendarOff,
  MapPin, User, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

/** Meeting Room management — calendar, rooms list, approvals */
export default function MeetingRooms() {
  const { toast } = useToast();
  const { t } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'calendar' | 'rooms' | 'approvals'>('calendar');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BookingFormData>({
    room_id: '', title: '', organizer: '', date: getTodayStr(), start_time: '09:00', end_time: '10:00', note: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBookings = useCallback(async () => {
    try { const res = await bookingApi.list(); setBookings(res.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  const fetchRooms = useCallback(async () => {
    try { const res = await assetApi.rooms(); setRooms(res.data); }
    catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchBookings(); fetchRooms(); }, [fetchBookings, fetchRooms]);

  const totalRooms = rooms.length;
  const totalBookings = bookings.length;
  const todayBookings = bookings.filter(b => b.date === getTodayStr()).length;
  const pendingBookings = bookings.filter(b => b.status === 'Chờ duyệt');
  const dateBookings = bookings.filter(b => b.date === selectedDate);

  const handleApprove = async (id: string) => {
    try { await bookingApi.approve(id); fetchBookings(); toast('success', t('meetings.approveSuccess')); }
    catch { toast('error', t('common.error')); }
  };
  const handleReject = async (id: string) => {
    try { await bookingApi.reject(id); fetchBookings(); toast('info', t('meetings.rejectSuccess')); }
    catch { toast('error', t('common.error')); }
  };

  const handleAddBooking = () => {
    setForm({ room_id: rooms[0]?.id || '', title: '', organizer: '', date: selectedDate, start_time: '09:00', end_time: '10:00', note: '' });
    setFormError(''); setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setFormError(''); setSaving(true);
    try {
      await bookingApi.create(form); setShowForm(false); fetchBookings();
      toast('success', t('meetings.bookSuccess'));
    }
    catch (err) { setFormError(err instanceof Error ? err.message : t('common.error')); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return; setDeleting(true);
    try {
      await bookingApi.delete(deleteId); setDeleteId(null); fetchBookings();
      toast('success', t('meetings.deleteSuccess'));
    }
    catch (err) { console.error(err); toast('error', t('common.error')); }
    finally { setDeleting(false); }
  };

  const calendarDays = getCalendarDays(currentMonth);
  const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const dw = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'][d.getDay()];
    return `${dw}, ${d.getDate()} tháng ${d.getMonth()+1}, ${d.getFullYear()}`;
  };

  const tabs = [
    { key: 'calendar' as const, label: t('meetings.calendarTab'), icon: CalendarDays },
    { key: 'rooms' as const, label: t('meetings.roomsTab'), icon: Building2 },
    { key: 'approvals' as const, label: t('meetings.approvalsTab'), icon: AlertTriangle, badge: pendingBookings.length },
  ];

  /** Shared input classes */
  const inputCls = `w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20' : 'bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`;
  const labelCls = `block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div>
      <PageHeader
        title={t('meetings.title')}
        description={t('meetings.desc')}
        action={
          <button onClick={handleAddBooking}
            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            {t('meetings.book')}
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatsCard title={t('meetings.rooms')} value={totalRooms} color="indigo"
          icon={<Building2 size={20} className="text-indigo-600" strokeWidth={1.8} />} />
        <StatsCard title={t('meetings.totalBookings')} value={totalBookings} color="emerald"
          icon={<CalendarDays size={20} className="text-emerald-600" strokeWidth={1.8} />} />
        <StatsCard title={t('dashboard.today')} value={todayBookings} color="purple"
          icon={<Clock size={20} className="text-purple-600" strokeWidth={1.8} />} />
        <StatsCard title={t('dashboard.pending')} value={pendingBookings.length} color="orange"
          icon={<AlertTriangle size={20} className="text-orange-600" strokeWidth={1.8} />} />
      </div>

      {/* Tab container */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        {/* Tab bar */}
        <div className={`flex border-b px-2 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors cursor-pointer ${activeTab === tab.key ? 'text-indigo-600' : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <TabIcon size={16} strokeWidth={2} />
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">{tab.badge}</span>
                )}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-[3px] rounded-t-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {loading ? (
            <MeetingsSkeleton />
          ) : activeTab === 'calendar' ? (
            /* ===== Calendar tab ===== */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mini calendar */}
              <div>
                <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <CalendarDays size={18} className="text-indigo-500" />
                  {t('meetings.selectDate')}
                </h3>
                <div className={`border rounded-2xl p-5 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className={`p-2 rounded-xl cursor-pointer transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                      <ChevronLeft size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    </button>
                    <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                    <button onClick={nextMonth} className={`p-2 rounded-xl cursor-pointer transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                      <ChevronRight size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    </button>
                  </div>
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {dayNames.map(d => <div key={d} className={`text-center text-[11px] font-bold py-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{d}</div>)}
                  </div>
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, i) => {
                      const isCur = day.month === currentMonth.getMonth();
                      const ds = formatDate(day.date);
                      const isSel = ds === selectedDate;
                      const isToday = ds === getTodayStr();
                      const hasBook = bookings.some(b => b.date === ds);

                      return (
                        <button key={i} onClick={() => { if (isCur) setSelectedDate(ds); }}
                          className={`relative h-9 w-full rounded-xl text-[13px] cursor-pointer transition-all duration-200
                            ${!isCur ? isDark ? 'text-gray-600' : 'text-gray-300' : ''}
                            ${isSel ? 'text-white font-bold shadow-md shadow-indigo-500/20' : ''}
                            ${isToday && !isSel ? isDark ? 'bg-indigo-900/40 text-indigo-400 font-bold' : 'bg-indigo-50 text-indigo-600 font-bold' : ''}
                            ${isCur && !isSel && !isToday ? isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100' : ''}
                          `}
                          style={isSel ? { background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)' } : {}}
                        >
                          {day.date.getDate()}
                          {hasBook && isCur && !isSel && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Date bookings */}
              <div>
                <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDisplayDate(selectedDate)}</h3>
                <p className={`text-sm mb-4 flex items-center gap-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <CalendarDays size={14} />
                  {dateBookings.length} {t('common.bookings')}
                </p>
                {dateBookings.length === 0 ? (
                  <EmptyState
                    icon={<CalendarOff size={32} className="text-gray-300 dark:text-gray-600" strokeWidth={1.5} />}
                    title={t('meetings.noBookings')}
                    description={t('meetings.noBookingsDesc')}
                  />
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {dateBookings.map((b, idx) => (
                        <motion.div
                          key={b.id}
                          custom={idx}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`border rounded-2xl p-4 transition-all card-hover ${isDark ? 'border-gray-700 hover:border-indigo-800 hover:shadow-lg hover:shadow-indigo-500/5' : 'border-gray-200 hover:shadow-md hover:border-indigo-200'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className={`font-semibold text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{b.title}</h4>
                              <div className={`flex items-center gap-3 mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                <span className="flex items-center gap-1"><Clock size={12} /> {b.start_time} - {b.end_time}</span>
                                <span className="flex items-center gap-1"><MapPin size={12} /> {b.room_name}</span>
                              </div>
                              <p className={`flex items-center gap-1 text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                <User size={12} /> {b.organizer}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge text={b.status} variant={getStatusBadgeVariant(b.status)} />
                              <button onClick={() => setDeleteId(b.id)}
                                className={`p-1.5 text-red-400 hover:text-red-600 rounded-lg transition-all cursor-pointer ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
                                title={t('common.delete')}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

          ) : activeTab === 'rooms' ? (
            /* ===== Rooms tab ===== */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className={isDark ? 'bg-gray-700/50' : 'bg-gray-50/80'}>
                  {[t('meetings.roomCode'), t('meetings.roomName'), t('assets.location'), t('meetings.capacity'), t('assets.status')].map(h =>
                    <th key={h} className={`px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{h}</th>
                  )}
                </tr></thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-50'}`}>
                  <AnimatePresence>
                    {rooms.map((r, idx) => (
                      <motion.tr
                        key={r.id}
                        custom={idx}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className={`transition-colors ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-indigo-50/30'}`}
                      >
                        <td className={`px-5 py-3.5 text-sm font-semibold font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{r.code}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Building2 size={16} className="text-indigo-500" strokeWidth={1.8} />
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{r.name}</span>
                          </div>
                        </td>
                        <td className={`px-5 py-3.5 text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}><MapPin size={14} className="text-gray-400" /> {r.location}</td>
                        <td className={`px-5 py-3.5 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{r.capacity} {t('common.people')}</td>
                        <td className="px-5 py-3.5"><Badge text={r.status} variant={getStatusBadgeVariant(r.status)} /></td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

          ) : (
            /* ===== Approvals tab ===== */
            <div>
              {pendingBookings.length === 0 ? (
                <EmptyState
                  icon={<Check size={32} className="text-emerald-400" strokeWidth={1.5} />}
                  title={t('meetings.allApproved')}
                  description={t('meetings.noApprovals')}
                />
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {pendingBookings.map((b, idx) => (
                      <motion.div
                        key={b.id}
                        custom={idx}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -20 }}
                        className={`border rounded-2xl p-4 card-hover ${isDark ? 'border-orange-800/50 bg-orange-900/10' : 'border-orange-200 bg-orange-50/30'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-semibold text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{b.title}</h4>
                            <div className={`flex items-center gap-3 mt-1.5 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              <span className="flex items-center gap-1"><CalendarDays size={12} /> {b.date}</span>
                              <span className="flex items-center gap-1"><Clock size={12} /> {b.start_time} - {b.end_time}</span>
                              <span className="flex items-center gap-1"><MapPin size={12} /> {b.room_name}</span>
                            </div>
                            <p className={`flex items-center gap-1 text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              <User size={12} /> {b.organizer}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleApprove(b.id)}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-lg hover:from-emerald-700 hover:to-teal-700 shadow-sm shadow-emerald-500/20 cursor-pointer transition-all"
                            ><Check size={14} /> {t('meetings.approve')}</button>
                            <button onClick={() => handleReject(b.id)}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold rounded-lg hover:from-red-700 hover:to-rose-700 shadow-sm shadow-red-500/20 cursor-pointer transition-all"
                            ><X size={14} /> {t('meetings.reject')}</button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking form modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={t('meetings.bookTitle')} size="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">{formError}</div>}
          <div>
            <label className={labelCls}>{t('meetings.meetingTitle')} <span className="text-red-400">*</span></label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="VD: Họp kế hoạch Q2"
              className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t('meetings.room')} <span className="text-red-400">*</span></label>
              <select value={form.room_id} onChange={(e) => setForm({ ...form, room_id: e.target.value })} required
                className={inputCls + ' cursor-pointer'}>
                <option value="">Chọn phòng</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.capacity} {t('common.people')})</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t('meetings.organizer')} <span className="text-red-400">*</span></label>
              <input type="text" required value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>{t('meetings.date')} <span className="text-red-400">*</span></label>
              <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t('meetings.startTime')} <span className="text-red-400">*</span></label>
              <input type="time" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t('meetings.endTime')} <span className="text-red-400">*</span></label>
              <input type="time" required value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t('meetings.note')}</label>
            <textarea value={form.note} rows={3} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Ghi chú thêm (nếu có)"
              className={inputCls + ' resize-none'} />
          </div>
          <div className={`flex justify-end gap-3 pt-5 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <button type="button" onClick={() => setShowForm(false)} className={`px-5 py-2.5 border rounded-xl text-sm font-semibold cursor-pointer transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{t('common.cancel')}</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-500/20"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)' }}>{saving ? t('common.loading') : t('meetings.book')}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title={t('meetings.deleteTitle')} message={t('meetings.deleteMsg')} loading={deleting} />
    </div>
  );
}

/** Shimmer skeleton for the meetings tab loading state */
function MeetingsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="h-5 w-32 animate-shimmer rounded-md" />
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 w-6 animate-shimmer rounded" />
            <div className="h-4 w-28 animate-shimmer rounded" />
            <div className="h-4 w-6 animate-shimmer rounded" />
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01, duration: 0.2 }} className="h-9 animate-shimmer rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-5 w-48 animate-shimmer rounded-md" />
        <div className="h-4 w-32 animate-shimmer rounded-md" />
        {[1, 2, 3].map(i => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.3 }} className="h-24 animate-shimmer rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/* ===== Calendar utilities ===== */
function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
interface CalDay { date: Date; month: number; }
function getCalendarDays(cm: Date): CalDay[] {
  const y = cm.getFullYear(), m = cm.getMonth();
  const first = new Date(y, m, 1), last = new Date(y, m+1, 0);
  const start = first.getDay();
  const days: CalDay[] = [];
  for (let i = start - 1; i >= 0; i--) { const d = new Date(y, m, -i); days.push({ date: d, month: d.getMonth() }); }
  for (let i = 1; i <= last.getDate(); i++) { days.push({ date: new Date(y, m, i), month: m }); }
  const rem = 42 - days.length;
  for (let i = 1; i <= rem; i++) { const d = new Date(y, m+1, i); days.push({ date: d, month: d.getMonth() }); }
  return days;
}
