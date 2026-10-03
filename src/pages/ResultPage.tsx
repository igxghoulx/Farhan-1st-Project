import React, { useState } from 'react';
import { AnalysisReport } from '../types/analysis.js';
import { SimpleReportView } from '../components/SimpleReportView.js';
import { TechnicalReportView } from '../components/TechnicalReportView.js';
import { ShareReportModal } from '../components/ShareReportModal.js';
import {
  ArrowLeft,
  Share2,
  RefreshCw,
  Printer,
  Sparkles,
  Terminal,
} from 'lucide-react';

interface ResultPageProps {
  report: AnalysisReport;
  onNavigate: (path: string) => void;
  onRescan: (target: string, type: 'url' | 'message') => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  report,
  onNavigate,
  onRescan,
}) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  // Default to Simple Mode for non-tech savvy users!
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(true);

  const formattedDate = new Date(report.createdAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      {/* Background lens glow */}
      <div className="pointer-events-none absolute inset-0 lens-glow" />

      <div className="relative mx-auto max-w-5xl space-y-6">
        {/* Navigation Bar / Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <button
            onClick={() => onNavigate('/analyze')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Analyzer</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onRescan(report.target, report.type)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Re-evaluate</span>
            </button>

            <button
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-sm shadow-cyan-500/20"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share Report</span>
            </button>
          </div>
        </div>

        {/* Report Top Meta Strip */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span>Report ID: <strong className="font-mono text-slate-200">{report.id}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Generated: {formattedDate}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{report.type} Diagnostic</span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            {isSimpleMode ? '🌟 Simple Non-Technical Mode' : '🛠️ Detailed Security Analyst Mode'}
          </div>
        </div>

        {/* High-Visibility Mode Toggle Switcher */}
        <div className="rounded-2xl border border-slate-700 bg-[#090d16] p-2 sm:p-2.5 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 text-center">
            <button
              onClick={() => setIsSimpleMode(true)}
              className={`rounded-xl py-3 px-4 transition-all flex flex-col items-center justify-center ${
                isSimpleMode
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold">
                <Sparkles className="h-4 w-4" />
                <span>Simple Report (For Everyone)</span>
              </div>
              <span className={`text-[11px] sm:text-xs mt-0.5 ${isSimpleMode ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                Plain English · Zero Jargon · Easy to Understand
              </span>
            </button>

            <button
              onClick={() => setIsSimpleMode(false)}
              className={`rounded-xl py-3 px-4 transition-all flex flex-col items-center justify-center ${
                !isSimpleMode
                  ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-cyan-300 font-bold shadow-lg ring-2 ring-cyan-500/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold font-mono">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <span>Technical Report (For Analysts)</span>
              </div>
              <span className={`text-[11px] sm:text-xs mt-0.5 ${!isSimpleMode ? 'text-cyan-300 font-medium' : 'text-slate-400'}`}>
                Raw DNS Tables, TLS Handshake & HTTP Headers
              </span>
            </button>
          </div>
        </div>

        {/* View Component Rendering Based On Mode */}
        {isSimpleMode ? (
          <SimpleReportView
            report={report}
            onSwitchToTechnical={() => setIsSimpleMode(false)}
            onNavigate={onNavigate}
          />
        ) : (
          <TechnicalReportView report={report} onNavigate={onNavigate} />
        )}

        {/* Share and Print Footer Bar */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-white">Need to document or share this report?</h4>
            <p className="text-xs text-slate-400">
              Share this evaluation card with family, or print a clean summary for your records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Page</span>
            </button>

            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Share Report Modal */}
      <ShareReportModal
        report={report}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
};
