import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'teal' | 'indigo' | 'amber' | 'red' | 'blue' | 'emerald';
}

const colorMap = {
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-500' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-500' },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-500' },
};

export default function KpiCard({
  title,
  value,
  icon,
  change,
  trend,
  color = 'teal',
}: KpiCardProps) {
  const styles = colorMap[color];
  const borderClass = trend === 'down' ? `border-l-4 ${styles.border}` : '';

  return (
    <div className={`glass-panel p-md rounded-xl group hover:translate-y-[-4px] transition-all duration-300 ${borderClass}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`h-10 w-10 ${styles.bg} ${styles.text} rounded-lg flex items-center justify-center`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        {change && (
          <span className={`${styles.text} ${styles.bg} px-2 py-0.5 rounded text-[10px] font-bold`}>
            {change}
          </span>
        )}
      </div>
      <h4 className="text-slate-500 text-[10px] font-bold mb-1 uppercase tracking-wider">{title}</h4>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
