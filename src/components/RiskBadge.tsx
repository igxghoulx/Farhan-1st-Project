import React from 'react';
import { RiskLevel, SignalSeverity } from '../types/analysis.js';
import { AlertTriangle, AlertOctagon, ShieldAlert, CheckCircle, Info } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel | SignalSeverity;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', showIcon = true }) => {
  const norm = level.toUpperCase();

  const isCritical = norm.includes('CRITICAL');
  const isHigh = norm.includes('HIGH');
  const isModerate = norm.includes('MODERATE') || norm.includes('MEDIUM');
  const isLow = norm.includes('LOW');

  let colorClasses = 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60';
  let Icon = Info;

  if (isCritical) {
    colorClasses = 'text-rose-300 bg-rose-950/50 border-rose-700/60';
    Icon = AlertOctagon;
  } else if (isHigh) {
    colorClasses = 'text-rose-400 bg-rose-950/40 border-rose-800/60';
    Icon = AlertTriangle;
  } else if (isModerate) {
    colorClasses = 'text-amber-400 bg-amber-950/40 border-amber-800/60';
    Icon = ShieldAlert;
  } else if (isLow) {
    colorClasses = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
    Icon = CheckCircle;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium uppercase tracking-wider ${colorClasses} ${sizeClasses}`}
    >
      {showIcon && <Icon className={iconSizes} aria-hidden="true" />}
      <span>{level}</span>
    </span>
  );
};
