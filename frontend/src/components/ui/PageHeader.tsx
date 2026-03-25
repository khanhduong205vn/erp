import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Reusable page header with gradient accent, title, description, and action slot */
export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-7">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{title}</h1>
        {description && <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
