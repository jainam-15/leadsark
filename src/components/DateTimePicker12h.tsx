"use client";

import React, { useState, useEffect } from 'react';

interface DateTimePicker12hProps {
  value: string; // ISO string or YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  className?: string;
}

export function DateTimePicker12h({ value, onChange, className }: DateTimePicker12hProps) {
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("PM");

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setDate(d.toISOString().split('T')[0]);
        let h = d.getHours();
        setAmpm(h >= 12 ? "PM" : "AM");
        h = h % 12;
        h = h ? h : 12;
        setHour(h.toString());
        setMinute(d.getMinutes().toString().padStart(2, '0'));
      }
    }
  }, [value]);

  const updateParent = (newDate: string, newHour: string, newMinute: string, newAmpm: string) => {
    if (!newDate) return;
    
    let h = parseInt(newHour);
    if (newAmpm === "PM" && h < 12) h += 12;
    if (newAmpm === "AM" && h === 12) h = 0;
    
    // Create a local date object
    const [year, month, day] = newDate.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, h, parseInt(newMinute));
    
    // Pass the full ISO string (UTC) to the parent
    onChange(localDate.toISOString());
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <input 
        type="date" 
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          updateParent(e.target.value, hour, minute, ampm);
        }}
        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-wa-green/20 text-sm transition-all"
      />
      <div className="flex gap-1">
        <select 
          value={hour}
          onChange={(e) => {
            setHour(e.target.value);
            updateParent(date, e.target.value, minute, ampm);
          }}
          className="flex-1 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-wa-green/20 text-xs transition-all appearance-none text-center font-bold"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <span className="flex items-center font-bold text-slate-400">:</span>
        <select 
          value={minute}
          onChange={(e) => {
            setMinute(e.target.value);
            updateParent(date, hour, e.target.value, ampm);
          }}
          className="flex-1 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-wa-green/20 text-xs transition-all appearance-none text-center font-bold"
        >
          {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select 
          value={ampm}
          onChange={(e) => {
            setAmpm(e.target.value);
            updateParent(date, hour, minute, e.target.value);
          }}
          className="flex-1 px-2 py-2 bg-slate-900 text-white border-none rounded-xl outline-none ring-offset-1 focus:ring-2 focus:ring-slate-900/20 text-xs transition-all appearance-none text-center font-black"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}
