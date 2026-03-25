import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: ReactNode | LucideIcon;
  /** Accent color key — indigo, emerald, purple, orange, blue, green, red */
  color?: string;
}

/** Stat card with gradient top border, icon glow, and hover lift effect */
export default function StatsCard({ title, value, subtitle, icon, color = 'indigo' }: StatsCardProps) {
  const c = COLOR_MAP[color] || COLOR_MAP.indigo;

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 card-hover overflow-hidden group">
      {/* Gradient top accent */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${c.gradient}`} />

      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">{title}</p>
        <div className={`w-11 h-11 ${c.bg} rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
          <div className={c.iconColor}>
            {typeof icon === 'function' ? null : icon}
          </div>
        </div>
      </div>

      <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight font-mono">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 font-medium">{subtitle}</p>}
    </div>
  );
}

/** Color configuration per accent */
const COLOR_MAP: Record<string, { gradient: string; bg: string; iconColor: string }> = {
  indigo:  { gradient: 'bg-gradient-to-r from-indigo-500 to-violet-500', bg: 'bg-indigo-50 dark:bg-indigo-900/40',  iconColor: 'text-indigo-600' },
  emerald: { gradient: 'bg-gradient-to-r from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-900/40', iconColor: 'text-emerald-600' },
  purple:  { gradient: 'bg-gradient-to-r from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-900/40',  iconColor: 'text-purple-600' },
  orange:  { gradient: 'bg-gradient-to-r from-orange-500 to-amber-500', bg: 'bg-orange-50 dark:bg-orange-900/40',  iconColor: 'text-orange-600' },
  blue:    { gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/40',    iconColor: 'text-blue-600' },
  green:   { gradient: 'bg-gradient-to-r from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/40',   iconColor: 'text-green-600' },
  red:     { gradient: 'bg-gradient-to-r from-red-500 to-rose-500', bg: 'bg-red-50 dark:bg-red-900/40',     iconColor: 'text-red-600' },
};
