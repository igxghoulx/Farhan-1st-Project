import React from 'react';
import { RiskAssessmentSummary } from '../types/analysis.js';
import { RiskBadge } from './RiskBadge.js';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface RiskScoreProps {
  assessment: RiskAssessmentSummary;
  displayTarget: string;
  type: 'url' | 'message';
}

export const RiskScore: React.FC<RiskScoreProps> = ({ assessment, displayTarget, type }) => {
  const { score, level, primaryRiskFactor, detectedSignalsCount } = assessment;

  // Determine color accents
  const isHigh = score >= 75;
  const isModerate = score >= 45 && score < 75;
  
  const scoreColor = isHigh
    ? 'text-rose-400'
    : isModerate
    ? 'text-amber-400'
    : 'text-emerald-400';

  const strokeColor = isHigh
    ? '#f43f5e'
    : isModerate
    ? '#f59e0b'
    : '#10b981';

  // SVG circular gauge math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0d1322] p-6 sm:p-8">
      {/* Subtle top indicator bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: strokeColor }}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left column: Score and circular meter */}
        <div className="flex items-center gap-6">
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 130 130">
              {/* Track */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="10"
                fill="none"
              />
              {/* Progress */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={strokeColor}
                strokeWidth="10"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`font-mono text-3xl font-extrabold tracking-tight tabular-nums ${scoreColor}`}>
                {score}
              </span>
              <span className="text-[11px] font-medium uppercase text-slate-400">
                / 100
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Automated Risk Assessment
              </span>
            </div>
            <div className="flex items-center gap-3">
              <RiskBadge level={level} size="lg" />
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Synthesized from {detectedSignalsCount} observable security signals. This is an automated assessment, not a definitive determination of fraud.
            </p>
          </div>
        </div>

        {/* Right column: Target context and primary factor */}
        <div className="flex flex-col justify-center border-t border-slate-800/80 pt-4 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Target Analyzed ({type === 'url' ? 'Website / URL' : 'Message / Offer'})
          </span>
          <p className="mt-1 font-mono text-sm font-semibold text-white break-all max-w-md">
            {displayTarget}
          </p>

          <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-900/60 p-2.5 border border-slate-800/60 max-w-md">
            {isHigh ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            ) : isModerate ? (
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            ) : (
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            )}
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-slate-200">Primary Factor: </span>
              {primaryRiskFactor}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
