import React, { useState } from 'react';
import { SecuritySignal } from '../types/analysis.js';
import { RiskBadge } from './RiskBadge.js';
import { Terminal, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { translateSignalToPlainEnglish } from '../utils/plainEnglishTranslator.js';

interface SignalCardProps {
  signal: SecuritySignal;
  isSimpleMode?: boolean;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal, isSimpleMode = true }) => {
  const { severity, title, explanation, evidence, confidence, category } = signal;
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(!isSimpleMode);

  const plain = translateSignalToPlainEnglish(signal);

  const severityBorder = {
    CRITICAL: 'border-l-rose-500',
    HIGH: 'border-l-rose-500',
    MEDIUM: 'border-l-amber-500',
    LOW: 'border-l-emerald-500',
    INFORMATIONAL: 'border-l-cyan-500',
  }[severity] || 'border-l-slate-700';

  return (
    <div
      className={`rounded-xl border border-slate-800/90 border-l-4 ${severityBorder} bg-[#0c121e] p-5 transition-all hover:border-slate-700`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <RiskBadge level={severity} size="sm" />
          <span className="text-xs capitalize text-slate-400 font-medium">
            Category: {category}
          </span>
        </div>

        {confidence && (
          <span className="text-xs text-slate-400 font-mono">
            Confidence: <strong className="text-slate-200">{confidence}</strong>
          </span>
        )}
      </div>

      {/* Main Title: Uses friendly title if in simple mode */}
      <h3 className="mt-2.5 text-base font-semibold text-slate-100">
        {isSimpleMode ? plain.friendlyTitle : title}
      </h3>

      {/* Plain English Translation Box */}
      {isSimpleMode ? (
        <div className="mt-2.5 space-y-2">
          <p className="text-sm leading-relaxed text-slate-300">
            {plain.friendlyExplanation}
          </p>

          <div className="flex items-start gap-2 rounded-lg bg-cyan-950/30 p-2.5 border border-cyan-800/40 text-xs">
            <Lightbulb className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
            <p className="text-cyan-200">
              <strong>What to do:</strong> {plain.whatToDo}
            </p>
          </div>

          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors pt-1"
          >
            <span>{showTechnicalDetails ? 'Hide technical jargon' : 'Show technical server jargon'}</span>
            {showTechnicalDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      ) : (
        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
          {explanation}
        </p>
      )}

      {/* Technical Evidence (shown if toggled or if in technical mode) */}
      {(showTechnicalDetails || !isSimpleMode) && (
        <div className="mt-3.5 space-y-2 border-t border-slate-800/80 pt-3">
          <p className="text-xs text-slate-400">
            <strong className="text-slate-300">Technical definition:</strong> {explanation}
          </p>

          {evidence && (
            <div className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-950/70 p-3">
              <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
              <div className="space-y-0.5 overflow-hidden">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Observed Diagnostic Trace
                </span>
                <p className="font-mono text-xs text-slate-300 break-all">
                  {evidence}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
