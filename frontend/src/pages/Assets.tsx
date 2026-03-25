import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { assetApi } from '../services/api';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import Badge, { getStatusBadgeVariant } from '../components/ui/Badge';
import StatsCard from '../components/ui/StatsCard';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import type { Asset, AssetFormData } from '../types';
import {
  Plus, Search, Package, Pencil, Trash2, Building2, Monitor, Car, Box,
  CheckCircle2, AlertCircle, Wrench,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_FORM: AssetFormData = {
  name: '', type: 'Phòng họp', location: '', department: '', capacity: 0, status: 'Sẵn sàng',
};

/** Icon and color map for asset types */
const TYPE_CONFIG: Record<string, { icon: typeof Building2; color: string }> = {
  'Phòng họp': { icon: Building2, color: 'text-indigo-600' },
  'Thiết bị': { icon: Monitor, color: 'text-emerald-600' },
  'Phương tiện': { icon: Car, color: 'text-amber-600' },
};

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

/** Asset management with stats, table, CRUD modals, and toast feedback */
export default function Assets() {
  const { toast } = useToast();
  const { t } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [assets, setAssets] = useState<Asset[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AssetFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await assetApi.list({ search, type: filterType, status: filterStatus });
      setAssets(res.data);
    } catch (err) { console.error('Failed to fetch assets:', err); }
    finally { setLoading(false); }
  }, [search, filterType, filterStatus]);

  const fetchTypes = useCallback(async () => {
    try { const res = await assetApi.types(); setTypes(res.data); }
    catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);
  useEffect(() => { fetchTypes(); }, [fetchTypes]);

  const totalAssets = assets.length;
  const roomCount = assets.filter(a => a.type === 'Phòng họp').length;
  const readyCount = assets.filter(a => a.status === 'Sẵn sàng').length;
  const inUseCount = assets.filter(a => a.status === 'Đang sử dụng').length;

  const handleAdd = () => { setEditingId(null); setForm(INITIAL_FORM); setFormError(''); setShowForm(true); };
  const handleEdit = (a: Asset) => {
    setEditingId(a.id);
    setForm({ name: a.name, type: a.type, location: a.location, department: a.department, capacity: a.capacity, status: a.status });
    setFormError(''); setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setFormError(''); setSaving(true);
    try {
      if (editingId) {
        await assetApi.update(editingId, form);
        toast('success', t('assets.editSuccess'));
      } else {
        await assetApi.create(form);
        toast('success', t('assets.addSuccess'));
      }
      setShowForm(false); fetchAssets(); fetchTypes();
    } catch (err) { setFormError(err instanceof Error ? err.message : t('common.error')); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return; setDeleting(true);
    try {
      await assetApi.delete(deleteId); setDeleteId(null); fetchAssets();
      toast('success', t('assets.deleteSuccess'));
    } catch (err) {
      console.error(err);
      toast('error', t('common.error'));
    } finally { setDeleting(false); }
  };

  /** Shared input classes for dark/light mode */
  const inputCls = `w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20' : 'bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`;
  const labelCls = `block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div>
      <PageHeader
        title={t('assets.title')}
        description={t('assets.desc')}
        action={
          <button onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            {t('assets.add')}
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatsCard title={t('assets.title')} value={totalAssets} color="indigo"
          icon={<Package size={20} className="text-indigo-600" strokeWidth={1.8} />} />
        <StatsCard title={t('meetings.rooms')} value={roomCount} color="emerald"
          icon={<Building2 size={20} className="text-emerald-600" strokeWidth={1.8} />} />
        <StatsCard title={t('dashboard.ready')} value={readyCount} color="green"
          icon={<CheckCircle2 size={20} className="text-green-600" strokeWidth={1.8} />} />
        <StatsCard title={t('dashboard.inUse')} value={inUseCount} color="blue"
          icon={<AlertCircle size={20} className="text-blue-600" strokeWidth={1.8} />} />
      </div>

      {/* Filters */}
      <div className={`rounded-2xl border p-4 mb-6 shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[220px] relative group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('assets.search')}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20' : 'bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`} />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className={`px-4 py-2.5 border rounded-xl text-sm outline-none min-w-[150px] cursor-pointer transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500'}`}>
            <option value="">{t('assets.allTypes')}</option>
            {types.map(tp => <option key={tp} value={tp}>{tp}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2.5 border rounded-xl text-sm outline-none min-w-[150px] cursor-pointer transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500'}`}>
            <option value="">{t('assets.allStatus')}</option>
            <option value="Sẵn sàng">Sẵn sàng</option>
            <option value="Đang sử dụng">Đang sử dụng</option>
            <option value="Bảo trì">Bảo trì</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2.5">
            <Package size={18} className="text-emerald-500" />
            <h3 className={`font-bold text-[15px] ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('assets.list')}</h3>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1 rounded-full">
            {assets.length} {t('assets.total')}
          </span>
        </div>
        {loading ? (
          <TableSkeleton columns={8} rows={5} />
        ) : assets.length === 0 ? (
          <EmptyState
            icon={<Box size={32} className="text-gray-300 dark:text-gray-600" strokeWidth={1.5} />}
            title={t('assets.noResults')}
            description={t('assets.tryDifferent')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className={isDark ? 'bg-gray-700/50' : 'bg-gray-50/80'}>
                {[t('assets.code'), t('assets.name'), t('assets.type'), t('assets.location'), t('assets.department'), t('meetings.capacity'), t('assets.status'), t('assets.actions')].map(h =>
                  <th key={h} className={`px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{h}</th>
                )}
              </tr></thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-50'}`}>
                <AnimatePresence>
                  {assets.map((asset, idx) => {
                    const typeConf = TYPE_CONFIG[asset.type] || { icon: Box, color: 'text-gray-500' };
                    const TypeIcon = typeConf.icon;
                    return (
                      <motion.tr
                        key={asset.id}
                        custom={idx}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -20 }}
                        className={`transition-colors ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-indigo-50/30'}`}
                      >
                        <td className={`px-5 py-3.5 text-sm font-semibold font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{asset.code}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <TypeIcon size={18} className={typeConf.color} strokeWidth={1.8} />
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{asset.name}</span>
                          </div>
                        </td>
                        <td className={`px-5 py-3.5 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{asset.type}</td>
                        <td className={`px-5 py-3.5 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{asset.location}</td>
                        <td className={`px-5 py-3.5 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{asset.department}</td>
                        <td className={`px-5 py-3.5 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{asset.capacity > 0 ? `${asset.capacity} ${t('common.people')}` : '—'}</td>
                        <td className="px-5 py-3.5"><Badge text={asset.status} variant={getStatusBadgeVariant(asset.status)} /></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEdit(asset)} className={`p-2 text-blue-600 rounded-lg cursor-pointer transition-colors ${isDark ? 'hover:bg-blue-900/30' : 'hover:bg-blue-50'}`} title={t('common.edit')}><Pencil size={15} /></button>
                            <button onClick={() => setDeleteId(asset.id)} className={`p-2 text-red-600 rounded-lg cursor-pointer transition-colors ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`} title={t('common.delete')}><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingId ? t('assets.editTitle') : t('assets.addTitle')} size="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">{formError}</div>}
          <div>
            <label className={labelCls}>{t('assets.name')} <span className="text-red-400">*</span></label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t('assets.type')} <span className="text-red-400">*</span></label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputCls + ' cursor-pointer'}>
                <option value="Phòng họp">Phòng họp</option><option value="Thiết bị">Thiết bị</option><option value="Phương tiện">Phương tiện</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>{t('assets.location')} <span className="text-red-400">*</span></label>
              <input type="text" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="VD: Tầng 2"
                className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t('assets.department')} <span className="text-red-400">*</span></label>
              <input type="text" required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t('meetings.capacity')}</label>
              <input type="number" min="0" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t('assets.status')}</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputCls + ' cursor-pointer'}>
              <option value="Sẵn sàng">Sẵn sàng</option><option value="Đang sử dụng">Đang sử dụng</option><option value="Bảo trì">Bảo trì</option>
            </select>
          </div>
          <div className={`flex justify-end gap-3 pt-5 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <button type="button" onClick={() => setShowForm(false)} className={`px-5 py-2.5 border rounded-xl text-sm font-semibold cursor-pointer transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{t('common.cancel')}</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-500/20"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)' }}>{saving ? t('common.loading') : t('common.save')}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title={t('assets.deleteTitle')} message={t('assets.deleteMsg')} loading={deleting} />
    </div>
  );
}

/** Shimmer skeleton for table loading state */
function TableSkeleton({ columns, rows }: { columns: number; rows: number }) {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <motion.div
          key={rowIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: rowIdx * 0.06, duration: 0.3 }}
          className="flex gap-4 items-center"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-4 animate-shimmer rounded-md flex-1"
              style={{ maxWidth: colIdx === 0 ? '60px' : colIdx === columns - 1 ? '80px' : '120px' }}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
}
