import React, { useState } from 'react';
import { AnalysisReport } from '../types/analysis.js';
import { RiskScore } from './RiskScore.js';
import { SignalCard } from './SignalCard.js';
import { AIAnalysis } from './AIAnalysis.js';
import { RecommendationList } from './RecommendationList.js';
import { EvidencePanel } from './EvidencePanel.js';
import { Terminal, Copy, Check, Shield, Cpu, Code2, MessageSquare } from 'lucide-react';

interface TechnicalReportViewProps {
  report: AnalysisReport;
  onNavigate?: (path: string) => void;
}

export const TechnicalReportView: React.FC<TechnicalReportViewProps> = ({ report, onNavigate }) => {
  const [activeSignalFilter, setActiveSignalFilter] = useState<'ALL' | 'HIGH+' | 'INFO'>('ALL');
  const [showJsonInspector, setShowJsonInspector] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredSignals = report.signals.filter((s) => {
    if (activeSignalFilter === 'HIGH+') {
      return s.severity === 'CRITICAL' || s.severity === 'HIGH';
    }
    if (activeSignalFilter === 'INFO') {
      return s.severity === 'LOW' || s.severity === 'INFORMATIONAL';
    }
    return true;
  });

  const handleCopyJson = () => {
    const payload = report.structuredEvidence || report;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Technical Mode Banner */}
      <div className="rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 flex items-center justify-between text-xs text-slate-300 font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span>
            <strong>Security Analyst Dossier:</strong> Real-time network telemetry, RFC transport parameters, and cryptographic handshake audit.
          </span>
        </div>
        <span className="text-[11px] text-cyan-400 font-semibold bg-cyan-950/70 border border-cyan-800/40 px-2 py-0.5 rounded">
          RFC & Grounded Evidence
        </span>
      </div>

      {/* Primary Risk Score Banner */}
      <RiskScore
        assessment={report.assessment}
        displayTarget={report.displayTarget}
        type={report.type}
      />

      {/* AI Grounded Security Explanation */}
      <AIAnalysis aiAnalysis={report.aiAnalysis} />

      {/* Recommended Defensive Actions */}
      <RecommendationList recommendations={report.recommendations} />

      {/* Detected Technical Signals */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-white font-mono">
              Deterministic Security Signals ({report.signals.length})
            </h3>
            <p className="text-xs text-slate-400">
              Discrete technical indicators, heuristic pattern matches, and protocol anomalies
            </p>
          </div>

          {/* Filter segmented buttons */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveSignalFilter('ALL')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                activeSignalFilter === 'ALL'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ALL ({report.signals.length})
            </button>
            <button
              onClick={() => setActiveSignalFilter('HIGH+')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                activeSignalFilter === 'HIGH+'
                  ? 'bg-slate-800 text-rose-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CRITICAL / HIGH
            </button>
            <button
              onClick={() => setActiveSignalFilter('INFO')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                activeSignalFilter === 'INFO'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LOW / INFO
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredSignals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              isSimpleMode={false}
            />
          ))}

          {filteredSignals.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-[#0c121e] p-8 text-center text-xs text-slate-400 font-mono">
              No security signals match the active filter criteria.
            </div>
          )}
        </div>
      </div>

      {/* Raw Observable Evidence Telemetry (Default expanded for technical view) */}
      <EvidencePanel
        technicalEvidence={report.technicalEvidence}
        textualEvidence={report.textualEvidence}
        defaultExpanded={true}
      />

      {/* Structured Telemetry JSON Inspector */}
      {report.structuredEvidence && (
        <div className="rounded-xl border border-slate-800 bg-[#0c121e] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white font-mono">
                Structured Telemetry JSON (Section 8 Schema)
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyJson}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>

              <button
                onClick={() => setShowJsonInspector(!showJsonInspector)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-mono font-medium text-cyan-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {showJsonInspector ? 'Collapse' : 'Expand Inspector'}
              </button>
            </div>
          </div>

          {showJsonInspector && (
            <pre className="rounded-lg bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800 max-h-96">
              {JSON.stringify(report.structuredEvidence, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
