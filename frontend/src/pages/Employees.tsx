import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { employeeApi } from '../services/api';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import Badge, { getRoleBadgeVariant, getStatusBadgeVariant } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import type { Employee, EmployeeFormData } from '../types';
import {
  Plus, Search, Users, Pencil, Trash2, Loader2, UserX,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_FORM: EmployeeFormData = {
  name: '', email: '', department: '', position: '', role: 'Nhân viên', status: 'Hoạt động',
};

/** Staggered row animation variants for table entries */
const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

/** Employee management page with full CRUD, search, filters, and toast notifications */
export default function Employees() {
  const { toast } = useToast();
  const { t } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  /** Shared input classes for dark/light mode */
  const inputCls = `w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20' : 'bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`;
  const labelCls = `block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await employeeApi.list({ search, department: filterDept, role: filterRole });
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filterDept, filterRole]);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await employeeApi.departments();
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const handleAdd = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setFormError('');
    setShowForm(true);
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setForm({
      name: emp.name, email: emp.email, department: emp.department,
      position: emp.position, role: emp.role, status: emp.status,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingId) {
        await employeeApi.update(editingId, form);
        toast('success', t('employees.editSuccess'));
      } else {
        await employeeApi.create(form);
        toast('success', t('employees.addSuccess'));
      }
      setShowForm(false);
      fetchEmployees();
      fetchDepartments();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await employeeApi.delete(deleteId);
      setDeleteId(null);
      fetchEmployees();
      toast('success', t('employees.deleteSuccess'));
    } catch (err) {
      console.error('Failed to delete employee:', err);
      toast('error', 'Xóa nhân viên thất bại');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('employees.title')}
        description={t('employees.desc')}
        action={
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            {t('employees.add')}
          </button>
        }
      />

      {/* Search & filters */}
      <div className={`rounded-2xl border p-4 mb-6 shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[220px] relative group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t('employees.search')}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
            />
          </div>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
            className={`px-4 py-2.5 border rounded-xl text-sm outline-none min-w-[170px] cursor-pointer transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
          >
            <option value="">{t('employees.allDepts')}</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            className={`px-4 py-2.5 border rounded-xl text-sm outline-none min-w-[150px] cursor-pointer transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
          >
            <option value="">{t('employees.allRoles')}</option>
            <option value="Quản trị viên">Quản trị viên</option>
            <option value="Quản lý">Quản lý</option>
            <option value="Nhân viên">Nhân viên</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2.5">
            <Users size={18} className="text-indigo-500" />
            <h3 className={`font-bold text-[15px] ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('employees.list')}</h3>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 rounded-full">
            {employees.length} {t('employees.total')}
          </span>
        </div>

        {loading ? (
          <TableSkeleton columns={8} rows={5} />
        ) : employees.length === 0 ? (
          <EmptyState
            icon={<UserX size={32} className="text-gray-300 dark:text-gray-600" strokeWidth={1.5} />}
            title={t('employees.noResults')}
            description={t('employees.tryDifferent')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDark ? 'bg-gray-700/50' : 'bg-gray-50/80'}>
                  {[t('employees.code'), t('employees.name'), t('employees.email'), t('employees.department'), t('employees.position'), t('employees.role'), t('employees.status'), t('employees.actions')].map(h => (
                    <th key={h} className={`px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-50'}`}>
                <AnimatePresence>
                  {employees.map((emp, idx) => (
                    <motion.tr
                      key={emp.id}
                      custom={idx}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -20 }}
                      className={`transition-colors ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-indigo-50/30'}`}
                    >
                      <td className={`px-5 py-3.5 text-sm font-semibold font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{emp.code}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm"
                            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)' }}
                          >{emp.name.charAt(0)}</div>
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{emp.name}</span>
                        </div>
                      </td>
                      <td className={`px-5 py-3.5 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{emp.email}</td>
                      <td className={`px-5 py-3.5 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{emp.department}</td>
                      <td className={`px-5 py-3.5 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{emp.position}</td>
                      <td className="px-5 py-3.5"><Badge text={emp.role} variant={getRoleBadgeVariant(emp.role)} /></td>
                      <td className="px-5 py-3.5"><Badge text={emp.status} variant={getStatusBadgeVariant(emp.status)} /></td>
                      <td className="px-5 py-3.5">
                        {/* Always-visible action buttons */}
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEdit(emp)}
                            className={`p-2 text-blue-600 rounded-lg transition-colors cursor-pointer ${isDark ? 'hover:bg-blue-900/30' : 'hover:bg-blue-50'}`} title={t('common.edit')}
                          >
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleteId(emp.id)}
                            className={`p-2 text-red-600 rounded-lg transition-colors cursor-pointer ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`} title={t('common.delete')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title={editingId ? t('employees.editTitle') : t('employees.addTitle')} size="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className={`p-3 border rounded-xl text-sm font-medium ${isDark ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t('employees.name')} <span className="text-red-400">*</span></label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t('employees.email')} <span className="text-red-400">*</span></label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t('employees.department')} <span className="text-red-400">*</span></label>
              <input type="text" required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="VD: Phòng Kỹ thuật"
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t('employees.position')} <span className="text-red-400">*</span></label>
              <input type="text" required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                placeholder="VD: Lập trình viên"
                className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t('employees.role')}</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={inputCls + ' cursor-pointer'}>
                <option value="Nhân viên">Nhân viên</option>
                <option value="Quản lý">Quản lý</option>
                <option value="Quản trị viên">Quản trị viên</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>{t('employees.status')}</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputCls + ' cursor-pointer'}>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Nghỉ việc">Nghỉ việc</option>
              </select>
            </div>
          </div>
          <div className={`flex justify-end gap-3 pt-5 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <button type="button" onClick={() => setShowForm(false)}
              className={`px-5 py-2.5 border rounded-xl text-sm font-semibold cursor-pointer transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >{t('common.cancel')}</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-500/20 hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)' }}
            >{saving ? t('common.loading') : t('common.save')}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title={t('employees.deleteTitle')} message={t('employees.deleteMsg')} loading={deleting} />
    </div>
  );
}

/** Reusable form field wrapper */
function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
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
