interface BadgeProps {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
}

/** Premium color-coded badge with dot indicator */
const VARIANT_STYLES: Record<string, { dot: string; bg: string; text: string; ring: string }> = {
  primary: { dot: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-500/20' },
  success: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-500/20' },
  warning: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-500/20' },
  danger:  { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-500/20' },
  info:    { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-500/20' },
  default: { dot: 'bg-gray-400', bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500/20' },
};

export default function Badge({ text, variant = 'default' }: BadgeProps) {
  const s = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${s.bg} ${s.text} ${s.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {text}
    </span>
  );
}

/** Helper: map domain values to badge variants */
export function getRoleBadgeVariant(role: string): BadgeProps['variant'] {
  switch (role) {
    case 'Quản trị viên': return 'primary';
    case 'Quản lý': return 'info';
    case 'Nhân viên': return 'default';
    default: return 'default';
  }
}

export function getStatusBadgeVariant(status: string): BadgeProps['variant'] {
  switch (status) {
    case 'Hoạt động': case 'Sẵn sàng': case 'Đã duyệt': return 'success';
    case 'Đang sử dụng': return 'info';
    case 'Chờ duyệt': return 'warning';
    case 'Đã hủy': case 'Nghỉ việc': case 'Bảo trì': return 'danger';
    default: return 'default';
  }
}
