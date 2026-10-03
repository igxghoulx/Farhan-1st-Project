import React from 'react';
import { AnalysisReport } from '../types/analysis.js';
import { MarkdownRenderer } from './MarkdownRenderer.js';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  CheckSquare,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Lock,
  ExternalLink,
  Lightbulb,
  MessageSquare,
} from 'lucide-react';
import { translateSignalToPlainEnglish } from '../utils/plainEnglishTranslator.js';

interface SimpleReportViewProps {
  report: AnalysisReport;
  onSwitchToTechnical: () => void;
  onNavigate?: (path: string) => void;
}

export const SimpleReportView: React.FC<SimpleReportViewProps> = ({
  report,
  onSwitchToTechnical,
  onNavigate,
}) => {
  const { assessment, displayTarget, type, signals, aiAnalysis, recommendations } = report;
  const score = assessment.score;

  const isHighRisk = score >= 75;
  const isModerateRisk = score >= 45 && score < 75;
  const isLowRisk = score < 45;

  // Filter signals and map to plain English
  const plainSignals = signals.map(translateSignalToPlainEnglish);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Friendly Mode Banner */}
      <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 px-4 py-3 flex items-center justify-between text-xs text-cyan-300">
        <div className="flex items-center gap-2">
          <span className="text-base">🌟</span>
          <span>
            <strong>Simple Mode Active:</strong> All technical server code and cybersecurity jargon have been translated into plain everyday language.
          </span>
        </div>
        <button
          onClick={onSwitchToTechnical}
          className="text-cyan-400 hover:text-cyan-200 underline font-semibold whitespace-nowrap ml-3"
        >
          Need technical details?
        </button>
      </div>

      {/* 1. The Big Verdict Card (Traffic Light System) */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-[#0c1424] to-[#080d16] p-6 sm:p-8 shadow-xl space-y-6">
        <div className="border-b border-slate-800/80 pb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
            Safety Assessment for:
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1 break-all font-mono">
            {displayTarget}
          </h2>
        </div>

        {/* Huge Visual Status */}
        {isHighRisk && (
          <div className="rounded-2xl border-2 border-rose-500/60 bg-rose-950/30 p-6 space-y-3">
            <div className="flex items-start gap-4 text-rose-400">
              <AlertOctagon className="h-10 w-10 shrink-0 text-rose-400 mt-1" />
              <div>
                <span className="inline-block rounded-md bg-rose-900/80 px-2.5 py-0.5 text-xs font-bold text-rose-200 uppercase tracking-wide">
                  Danger · High Alert
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Do Not Trust This {type === 'url' ? 'Website' : 'Message'}
                </h3>
                <p className="text-sm text-rose-200/90 mt-1.5 leading-relaxed">
                  We found serious red flags commonly seen on scam lookalikes, fake login pages, or deceptive links. Entering your password or sending money here could put your accounts at risk.
                </p>
              </div>
            </div>
          </div>
        )}

        {isModerateRisk && (
          <div className="rounded-2xl border-2 border-amber-500/60 bg-amber-950/30 p-6 space-y-3">
            <div className="flex items-start gap-4 text-amber-400">
              <AlertTriangle className="h-10 w-10 shrink-0 text-amber-400 mt-1" />
              <div>
                <span className="inline-block rounded-md bg-amber-900/80 px-2.5 py-0.5 text-xs font-bold text-amber-200 uppercase tracking-wide">
                  Warning · Be Careful
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Proceed With Caution Before Sharing Information
                </h3>
                <p className="text-sm text-amber-200/90 mt-1.5 leading-relaxed">
                  This {type === 'url' ? 'website' : 'message'} has some unusual or missing safety features. It might be brand new, or trying to look like a different company. It is best not to buy anything or type passwords here until you verify it.
                </p>
              </div>
            </div>
          </div>
        )}

        {isLowRisk && (
          <div className="rounded-2xl border-2 border-emerald-500/60 bg-emerald-950/30 p-6 space-y-3">
            <div className="flex items-start gap-4 text-emerald-400">
              <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-400 mt-1" />
              <div>
                <span className="inline-block rounded-md bg-emerald-900/80 px-2.5 py-0.5 text-xs font-bold text-emerald-200 uppercase tracking-wide">
                  Looks Normal
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Standard Safety Baseline Verified
                </h3>
                <p className="text-sm text-emerald-200/90 mt-1.5 leading-relaxed">
                  No major deceptive tricks or alarming red flags were found. It appears to be an active, standard website. Follow normal internet safety precautions when browsing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3-Point Everyday Decision Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl bg-slate-950/70 p-4 border border-slate-800 space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
              1. Can I look at the page?
            </span>
            <p className="text-sm font-bold text-white">
              {isHighRisk ? '❌ Better to close the tab' : isModerateRisk ? '⚠️ Yes, but do not buy' : '✅ Yes, safe to browse'}
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {isHighRisk
                ? 'Avoid clicking buttons, downloading attachments, or lingering.'
                : isModerateRisk
                ? 'Looking at public information is fine, but do not make payments.'
                : 'Standard everyday internet browsing.'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/70 p-4 border border-slate-800 space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
              2. Should I type passwords or cards?
            </span>
            <p className="text-sm font-bold text-white">
              {isHighRisk ? '🛑 NO — Never type info' : isModerateRisk ? '⚠️ Strongly discouraged' : '✅ Standard encryption active'}
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {isHighRisk
                ? 'High risk of credential theft or unauthorized credit card charges.'
                : isModerateRisk
                ? 'Double-check with the company’s real website first.'
                : 'Connection uses a valid security certificate.'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/70 p-4 border border-slate-800 space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
              3. What should I do right now?
            </span>
            <p className="text-sm font-bold text-cyan-400">
              {isHighRisk ? 'Close Window Now' : isModerateRisk ? 'Search Company on Google' : 'Enjoy Browsing'}
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {isHighRisk
                ? 'If an unsolicited email or SMS sent you here, mark it as spam.'
                : isModerateRisk
                ? 'Open a new tab and search for the company directly.'
                : 'Keep your browser updated and use strong passwords.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Plain English AI Explanation */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950/70 border border-cyan-800/50 text-cyan-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Summary of What Is Happening
            </h3>
            <p className="text-xs text-slate-400">
              Clear, friendly explanation written in simple language
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/60 p-4 border border-slate-800/60 text-sm leading-relaxed text-slate-200">
          <MarkdownRenderer content={aiAnalysis.overview} />
        </div>
      </div>

      {/* 3. Things We Noticed (Translated Signals) */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-6 sm:p-7 space-y-4">
        <div className="border-b border-slate-800/80 pb-3">
          <h3 className="text-base font-bold text-white">
            Things We Noticed During the Check ({plainSignals.length})
          </h3>
          <p className="text-xs text-slate-400">
            Every technical observation explained in plain everyday English
          </p>
        </div>

        <div className="space-y-3">
          {plainSignals.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-4 transition-all ${
                item.iconType === 'danger'
                  ? 'border-rose-900/60 bg-rose-950/20'
                  : item.iconType === 'warning'
                  ? 'border-amber-900/60 bg-amber-950/20'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0 mt-0.5">
                  {item.iconType === 'danger' ? '🛑' : item.iconType === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-sm font-bold text-white">
                    {item.friendlyTitle}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.friendlyExplanation}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-800/40 w-fit">
                    <Lightbulb className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>
                      <strong>What to do:</strong> {item.whatToDo}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {plainSignals.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">
              No anomalies or warning signs found.
            </div>
          )}
        </div>
      </div>

      {/* 4. What You Should Do Next */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950/70 border border-emerald-800/50 text-emerald-400">
            <CheckSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              What You Should Do Next
            </h3>
            <p className="text-xs text-slate-400">
              Simple steps to keep yourself and your money safe
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 p-4"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs mt-0.5">
                {idx + 1}
              </span>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-100">{rec.action}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{rec.rationale}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ask Gemini Chatbot About This Assessment */}
      {onNavigate && (
        <div className="rounded-2xl border border-cyan-800/60 bg-gradient-to-r from-[#0c1628] to-[#09101d] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 font-bold shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Still have doubts about this result?</h4>
              <p className="text-xs text-slate-400">
                Chat directly with TrustLens AI Chatbot to ask specific questions about this target.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/chat')}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors whitespace-nowrap self-start sm:self-auto shadow-sm"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat With Gemini AI</span>
          </button>
        </div>
      )}

      {/* 5. Everyday Cyber Safety Cheat Sheet */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
          <BookOpen className="h-5 w-5 text-cyan-400" />
          <div>
            <h4 className="text-sm font-bold text-white">
              Everyday Internet Safety Cheat Sheet
            </h4>
            <p className="text-xs text-slate-400">
              Keep these 3 golden rules in mind whenever someone sends you a link
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80 space-y-1">
            <span className="font-bold text-slate-200 block text-sm">
              🔒 The Padlock Myth
            </span>
            <p className="text-slate-400 leading-relaxed">
              A padlock only means the connection is private so eavesdroppers can't see it. Scammers can get padlocks on their fake websites too! Never assume a website is safe just because it has a lock.
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80 space-y-1">
            <span className="font-bold text-slate-200 block text-sm">
              🔍 Look closely at the name
            </span>
            <p className="text-slate-400 leading-relaxed">
              Scammers use tricky spellings (like replacing letter "l" with number "1" or "rn" for "m"). Always check the real letters right before the ".com" or ".org".
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80 space-y-1">
            <span className="font-bold text-slate-200 block text-sm">
              🛑 Never rush when panicked
            </span>
            <p className="text-slate-400 leading-relaxed">
              If a message says "Urgent!", "Your account is frozen!", or "Pay in 1 hour!", pause. Artificial panic is designed to make you act before you have time to think.
            </p>
          </div>
        </div>
      </div>

      {/* Switch to Technical View Callout */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-300">Are you a cybersecurity professional or developer?</span>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch to the Technical Report to inspect raw DNS records, TLS handshake ciphers, and HTTP response headers.
          </p>
        </div>
        <button
          onClick={onSwitchToTechnical}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-cyan-400 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <span>Switch to Technical Report</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
