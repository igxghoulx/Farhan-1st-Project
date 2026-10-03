import React from 'react';
import { ShieldLensIcon } from '../components/ShieldLensIcon.js';
import { ShieldCheck, EyeOff, Lock, Server, Trash2, ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Background lens glow */}
      <div className="pointer-events-none absolute inset-0 lens-glow" />

      <div className="relative mx-auto max-w-4xl space-y-10">
        <div>
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1 text-xs text-cyan-400 mb-3">
            <Lock className="h-4 w-4" />
            <span className="font-semibold">Privacy Policy</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Zero-Log Ephemeral Privacy
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
            TrustLens is designed from the ground up to respect user privacy and adhere to cybersecurity hygiene standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-[#0d1322] p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-cyan-400 border border-slate-700">
              <Trash2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">No Permanent Storage</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              In version 1.0, TrustLens does not store submitted messages, emails, or analyzed target URLs permanently. Data resides strictly in temporary volatile memory to fulfill the immediate scan request and is purged automatically.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0d1322] p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-cyan-400 border border-slate-700">
              <EyeOff className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Zero Trackers or Ad Pixels</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We do not embed third-party advertising scripts, behavioral tracking cookies, or commercial user profiling beacons. Your visit and analysis activity remain private.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0d1322] p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-cyan-400 border border-slate-700">
              <Server className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Server-Side Secret Isolation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              All AI model operations and credential secrets run in an isolated server-side environment. No API keys or sensitive authorization tokens are ever exposed to the client browser.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0d1322] p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-cyan-400 border border-slate-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Client Execution Safety</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              TrustLens never executes scripts from untrusted user-provided URLs in your browser. All URL diagnostics are evaluated as static strings and server-side metadata to protect your device from drive-by downloads.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-8 space-y-4">
          <h2 className="text-lg font-bold text-white">Data Sanitization Guidelines</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            When submitting text messages or emails for review, we encourage users to omit personally identifiable information (PII) such as personal home addresses, phone numbers, or private password credentials. TrustLens analyzes structural linguistic patterns, urgency cues, and payment methods rather than personal identities.
          </p>
          <div className="pt-2">
            <span className="text-xs text-slate-400 font-mono">
              Policy Revision Date: October 2026 · TrustLens Open Security
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
