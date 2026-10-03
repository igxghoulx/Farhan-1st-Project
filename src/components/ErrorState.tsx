import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Analysis Incomplete',
  message,
  onRetry,
  onBack,
}) => {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-rose-900/50 bg-[#120e17] p-8 text-center shadow-xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-rose-800/60 bg-rose-950/40 text-rose-400">
        <AlertCircle className="h-7 w-7" />
      </div>

      <h3 className="mt-4 text-lg font-bold text-white tracking-tight">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-300 leading-relaxed">
        {message}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>
        )}

        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Analyzer</span>
          </button>
        )}
      </div>
    </div>
  );
};
