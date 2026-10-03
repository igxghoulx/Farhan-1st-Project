import React from 'react';
import { SafetyRecommendation } from '../types/analysis.js';
import { CheckSquare, AlertCircle, ShieldCheck } from 'lucide-react';

interface RecommendationListProps {
  recommendations: SafetyRecommendation[];
}

export const RecommendationList: React.FC<RecommendationListProps> = ({ recommendations }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0c121e] p-6 sm:p-7">
      <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950/70 border border-emerald-800/50 text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">
            Recommended Defensive Actions
          </h3>
          <p className="text-xs text-slate-400">
            Immediate steps to protect your credentials, devices, and funds
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3.5">
        {recommendations.map((rec) => {
          const isImmediate = rec.priority === 'Immediate';
          const isImportant = rec.priority === 'Important';

          const priorityBadgeClass = isImmediate
            ? 'bg-rose-950/60 text-rose-300 border-rose-800/70'
            : isImportant
            ? 'bg-amber-950/60 text-amber-300 border-amber-800/70'
            : 'bg-slate-850 text-slate-300 border-slate-700';

          return (
            <div
              key={rec.id}
              className="flex items-start gap-3.5 rounded-lg border border-slate-800/80 bg-slate-900/50 p-4 transition-colors hover:border-slate-700"
            >
              <CheckSquare className="mt-1 h-4 w-4 shrink-0 text-cyan-400" />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-100">
                    {rec.action}
                  </h4>
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide border ${priorityBadgeClass}`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-400">
                  {rec.rationale}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
