import React from 'react';
import { AnalysisReport, TargetType } from '../types/analysis.js';
import { AnalyzerCard } from '../components/AnalyzerCard.js';
import { ScanAnimation } from '../components/ScanAnimation.js';
import { ShieldLensIcon } from '../components/ShieldLensIcon.js';
import { ArrowLeft, Sparkles, ShieldAlert, CheckCircle } from 'lucide-react';

interface AnalyzerPageProps {
  onAnalyzeUrl: (url: string) => void;
  onAnalyzeMessage: (message: string) => void;
  onSelectSample: (report: AnalysisReport) => void;
  samples: AnalysisReport[];
  isLoading: boolean;
  activeScanTarget: string;
  activeScanType: TargetType;
  scanStages?: import('../types/analysis.js').ScanStageUpdate[];
  onNavigate: (path: string) => void;
}

export const AnalyzerPage: React.FC<AnalyzerPageProps> = ({
  onAnalyzeUrl,
  onAnalyzeMessage,
  onSelectSample,
  samples,
  isLoading,
  activeScanTarget,
  activeScanType,
  scanStages,
  onNavigate,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-16rem)] py-12 px-4 sm:px-6 lg:px-8">
      {/* Background lens glow */}
      <div className="pointer-events-none absolute inset-0 lens-glow" />

      <div className="relative mx-auto max-w-4xl">
        {/* Top return link */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs text-cyan-400 mb-3">
            <ShieldLensIcon className="h-4 w-4" />
            <span className="font-semibold">Security Diagnostic Console</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Analyze Website or Suspicious Message
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Submit a URL or message text for automated risk evaluation across DNS, TLS, security headers, and behavioral deception signals.
          </p>
        </div>

        {/* State: Loading/Scanning vs Analyzer Input */}
        {isLoading ? (
          <div className="mt-4">
            <ScanAnimation
              target={activeScanTarget}
              type={activeScanType}
              stages={scanStages}
            />
          </div>
        ) : (
          <div className="space-y-10">
            <AnalyzerCard
              onAnalyzeUrl={onAnalyzeUrl}
              onAnalyzeMessage={onAnalyzeMessage}
              isLoading={isLoading}
            />

            {/* Quick Test Demo Cases */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Instant Test Scenarios (Click to Load)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {samples.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => onSelectSample(sample)}
                    className="flex flex-col text-left rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-xs"
                  >
                    <span className="font-semibold text-white truncate">
                      {sample.displayTarget}
                    </span>
                    <span className="mt-1 text-[11px] text-slate-400">
                      Score: <strong className="text-cyan-400">{sample.assessment.score}/100</strong> ({sample.assessment.level})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
