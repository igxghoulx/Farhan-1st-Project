import React from 'react';
import { ShieldLensIcon } from './ShieldLensIcon.js';

export const LoadingState: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-pulse p-4">
      {/* Risk Score Skeleton */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-8 h-48 flex items-center gap-6">
        <div className="h-32 w-32 rounded-full bg-slate-800/60 shrink-0" />
        <div className="space-y-3 flex-1">
          <div className="h-4 w-36 rounded bg-slate-800/80" />
          <div className="h-6 w-48 rounded bg-slate-800/60" />
          <div className="h-4 w-full max-w-md rounded bg-slate-800/40" />
        </div>
      </div>

      {/* Signals Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-36 rounded-xl border border-slate-800 bg-[#0c121e] p-5 space-y-2.5">
          <div className="h-4 w-24 rounded bg-slate-800" />
          <div className="h-5 w-4/5 rounded bg-slate-800/70" />
          <div className="h-10 w-full rounded bg-slate-900" />
        </div>
        <div className="h-36 rounded-xl border border-slate-800 bg-[#0c121e] p-5 space-y-2.5">
          <div className="h-4 w-24 rounded bg-slate-800" />
          <div className="h-5 w-4/5 rounded bg-slate-800/70" />
          <div className="h-10 w-full rounded bg-slate-900" />
        </div>
      </div>
    </div>
  );
};
