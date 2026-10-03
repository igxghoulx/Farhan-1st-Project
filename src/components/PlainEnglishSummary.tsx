import React from 'react';
import { RiskAssessmentSummary, SecuritySignal } from '../types/analysis.js';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, ShieldCheck, Lock, ExternalLink, ArrowRight } from 'lucide-react';
import { translateSignalToPlainEnglish } from '../utils/plainEnglishTranslator.js';

interface PlainEnglishSummaryProps {
  assessment: RiskAssessmentSummary;
  displayTarget: string;
  type: 'url' | 'message';
  signals: SecuritySignal[];
  isSimpleMode: boolean;
  onToggleMode: (simple: boolean) => void;
}

export const PlainEnglishSummary: React.FC<PlainEnglishSummaryProps> = ({
  assessment,
  displayTarget,
  type,
  signals,
  isSimpleMode,
  onToggleMode,
}) => {
  const { score, level } = assessment;

  const isHighRisk = score >= 75;
  const isModerateRisk = score >= 45 && score < 75;
  const isLowRisk = score < 45;

  // Key takeaways for non-technical users
  const topRiskySignals = signals
    .filter((s) => s.severity === 'CRITICAL' || s.severity === 'HIGH')
    .slice(0, 3)
    .map(translateSignalToPlainEnglish);

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-[#0c1424] to-[#080d16] p-6 sm:p-7 shadow-xl space-y-6">
      {/* Top Header with Simple Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              The Bottom Line <span className="text-xs font-normal text-slate-400">(In Plain English)</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            A clear, jargon-free summary designed for everyday internet users and consumers
          </p>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => onToggleMode(true)}
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
              isSimpleMode
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌟 Simple View
          </button>
          <button
            onClick={() => onToggleMode(false)}
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
              !isSimpleMode
                ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🛠️ Technical Details
          </button>
        </div>
      </div>

      {/* Hero Decision Card */}
      {isHighRisk && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-5 space-y-3">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertOctagon className="h-7 w-7 shrink-0 text-rose-400" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                High Warning: Do Not Enter Passwords or Send Money
              </h3>
              <p className="text-xs sm:text-sm text-rose-200/90 mt-0.5">
                We detected serious red flags often associated with scam lookalikes, fake login pages, or deceptive links.
              </p>
            </div>
          </div>
        </div>
      )}

      {isModerateRisk && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-5 space-y-3">
          <div className="flex items-center gap-3 text-amber-400">
            <AlertTriangle className="h-7 w-7 shrink-0 text-amber-400" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Proceed With Caution — Double Check First
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/90 mt-0.5">
                This {type === 'url' ? 'website' : 'message'} has some unusual or missing safety features. It might be brand new, or trying to copy someone else.
              </p>
            </div>
          </div>
        </div>
      )}

      {isLowRisk && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-5 space-y-3">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-400" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Looks Normal for Standard Browsing
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200/90 mt-0.5">
                No major deception tricks or glaring technical red flags were found. It appears to be an active, standard website.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3-Point Everyday Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80 space-y-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
            1. Safe to Look At?
          </span>
          <p className="text-sm font-bold text-white">
            {isHighRisk ? '❌ Better to Close Tab' : isModerateRisk ? '⚠️ Yes, but do not buy' : '✅ Yes, safe to browse'}
          </p>
          <p className="text-slate-400 text-[11px]">
            {isHighRisk
              ? 'Avoid clicking buttons, downloading files, or lingering.'
              : isModerateRisk
              ? 'Reading articles or content is fine, but do not make payments.'
              : 'Standard internet safety rules apply.'}
          </p>
        </div>

        <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80 space-y-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
            2. Safe for Passwords or Cards?
          </span>
          <p className="text-sm font-bold text-white">
            {isHighRisk ? '🛑 NO — Never Type Info' : isModerateRisk ? '⚠️ Highly Discouraged' : '✅ Standard Protection'}
          </p>
          <p className="text-slate-400 text-[11px]">
            {isHighRisk
              ? 'Your password or payment information could be captured.'
              : isModerateRisk
              ? 'Verify with the official brand before entering login credentials.'
              : 'Connection is encrypted with a standard certificate.'}
          </p>
        </div>

        <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80 space-y-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
            3. Recommended Action
          </span>
          <p className="text-sm font-bold text-cyan-400">
            {isHighRisk ? 'Close Window Now' : isModerateRisk ? 'Verify Directly via Google' : 'Enjoy Browsing Safely'}
          </p>
          <p className="text-slate-400 text-[11px]">
            {isHighRisk
              ? 'If an email or text sent you here, report it as spam.'
              : isModerateRisk
              ? 'Search for the official company website directly in a new tab.'
              : 'Keep your browser updated and use strong passwords.'}
          </p>
        </div>
      </div>

      {/* Top Red Flags in Plain Words (if any detected) */}
      {topRiskySignals.length > 0 && (
        <div className="rounded-xl border border-slate-800/90 bg-slate-950/50 p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Key Things You Should Know (Translated to Everyday English):
          </h4>
          <div className="space-y-2.5">
            {topRiskySignals.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-lg bg-slate-900/60 p-3 border border-slate-800/60 text-xs"
              >
                <span className="mt-0.5 text-rose-400 font-bold shrink-0">⚠️</span>
                <div className="space-y-1">
                  <span className="font-bold text-slate-100 block">
                    {item.friendlyTitle}
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {item.friendlyExplanation}
                  </p>
                  <p className="text-cyan-400 font-medium text-[11px]">
                    💡 <strong>What you should do:</strong> {item.whatToDo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
