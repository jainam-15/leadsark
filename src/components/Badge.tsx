import React from 'react';

type BadgeColor = 'red' | 'amber' | 'slate' | 'wa-green';

interface BadgeProps {
  label: string;
  color: BadgeColor;
  icon?: string;
  pulse?: boolean;
}

const colorStyles = {
  red: 'bg-red-500 text-white shadow-sm',
  amber: 'bg-amber-500 text-white shadow-sm',
  slate: 'bg-slate-400 text-white shadow-sm',
  'wa-green': 'bg-wa-green text-white shadow-sm',
};

export default function Badge({ label, color, icon, pulse }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${colorStyles[color]}`}>
      {pulse ? (
        <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse"></span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[12px] mr-1">{icon}</span>
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
      )}
      {label}
    </span>
  );
}
