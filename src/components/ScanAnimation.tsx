import React from 'react';
import { ShieldLensIcon } from './ShieldLensIcon.js';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ScanStageUpdate } from '../types/analysis.js';

interface ScanAnimationProps {
  target: string;
  type: 'url' | 'message';
  stages?: ScanStageUpdate[];
  currentStageIndex?: number;
}

const DEFAULT_STAGES: ScanStageUpdate[] = [
  { stageId: 'checking_url', label: 'Checking URL format & protocol...', status: 'in_progress' },
  { stageId: 'resolving_dns', label: 'Resolving DNS records...', status: 'pending' },
  { stageId: 'inspecting_http', label: 'Inspecting HTTP response & redirects...', status: 'pending' },
  { stageId: 'checking_tls', label: 'Checking TLS certificates & handshake...', status: 'pending' },
  { stageId: 'analyzing_headers', label: 'Analyzing security headers...', status: 'pending' },
  { stageId: 'evaluating_patterns', label: 'Evaluating URL structure signals...', status: 'pending' },
  { stageId: 'generating_ai', label: 'Generating AI explanation from evidence...', status: 'pending' },
];

export const ScanAnimation: React.FC<ScanAnimationProps> = ({
  target,
  type,
  stages = DEFAULT_STAGES,
}) => {
  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const currentStage = stages.find((s) => s.status === 'in_progress') || stages[stages.length - 1];
  const progressPercent = Math.min(
    100,
    Math.round(((completedCount + (currentStage?.status === 'in_progress' ? 0.5 : 0)) / stages.length) * 100)
  );

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-800 bg-[#0a0f1d] p-8 text-center shadow-2xl">
      {/* Central Pulsing Shield Lens */}
      <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping opacity-60" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-cyan-500/30 bg-[#0f172a] shadow-lg shadow-cyan-500/10">
          <ShieldLensIcon className="h-10 w-10 text-cyan-400" />
        </div>
      </div>

      <h3 className="mt-5 text-lg font-bold text-white tracking-tight">
        Performing Real Security Risk Diagnostic
      </h3>

      <p className="mt-1 font-mono text-xs text-cyan-400 truncate max-w-md mx-auto">
        Target: {target}
      </p>

      {/* Progress Bar */}
      <div className="mt-6 w-full rounded-full bg-slate-900 p-1 border border-slate-800">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Step {Math.min(stages.length, completedCount + 1)} of {stages.length}</span>
        <span>{progressPercent}% Complete</span>
      </div>

      {/* Real-time Steps List Driven by Backend Telemetry */}
      <div className="mt-6 text-left space-y-2.5 rounded-xl bg-slate-950/70 p-4 border border-slate-800/80">
        {stages.map((stage, idx) => {
          const isDone = stage.status === 'completed';
          const isCurrent = stage.status === 'in_progress';
          const isFailed = stage.status === 'failed';

          return (
            <div
              key={stage.stageId || idx}
              className={`flex items-center justify-between gap-2 text-xs transition-colors duration-200 ${
                isDone
                  ? 'text-slate-400'
                  : isCurrent
                  ? 'text-cyan-300 font-medium'
                  : isFailed
                  ? 'text-rose-400'
                  : 'text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-400" />
                ) : isFailed ? (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                ) : (
                  <div className="h-4 w-4 shrink-0 rounded-full border border-slate-700 flex items-center justify-center text-[9px] text-slate-500 font-mono">
                    {idx + 1}
                  </div>
                )}
                <span className="truncate">{stage.label}</span>
              </div>

              {stage.detail && (
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {stage.detail}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] text-slate-500">
        Live observable network telemetry. Never executes untrusted remote scripts or browser frames.
      </p>
    </div>
  );
};
