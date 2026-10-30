import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CountdownBadgeProps {
  deadline: string;
  status?: string;
  compact?: boolean;
}

export const CountdownBadge: React.FC<CountdownBadgeProps> = ({ deadline, status, compact }) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    isExpired: boolean;
    isUrgent: boolean;
  }>({ hours: 0, minutes: 0, isExpired: false, isUrgent: false });

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, isExpired: true, isUrgent: false });
      } else {
        const totalMinutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        setTimeLeft({
          hours,
          minutes,
          isExpired: false,
          isUrgent: totalMinutes < 120, // Less than 2 hours
        });
      }
    };

    calculate();
    const timer = setInterval(calculate, 30000); // refresh every 30s
    return () => clearInterval(timer);
  }, [deadline]);

  if (status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Pickup Completed
      </span>
    );
  }

  if (timeLeft.isExpired || status === 'EXPIRED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-800">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
        Pickup window closed (Expired)
      </span>
    );
  }

  if (timeLeft.isUrgent) {
    const text =
      timeLeft.hours > 0
        ? `Pickup closes in ${timeLeft.hours}h ${timeLeft.minutes}m`
        : `Pickup closes in ${timeLeft.minutes}m`;
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span className="tabular-nums">{text}</span>
      </span>
    );
  }

  const text =
    timeLeft.hours > 24
      ? `Pickup within ${Math.round(timeLeft.hours / 24)} days`
      : `Pickup closes in ${timeLeft.hours}h ${timeLeft.minutes}m`;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-slate-600 ${compact ? '' : 'bg-slate-100/80 px-2 py-0.5 rounded'}`}>
      <Clock className="w-3.5 h-3.5 text-slate-500" />
      <span className="tabular-nums">{text}</span>
    </span>
  );
};
