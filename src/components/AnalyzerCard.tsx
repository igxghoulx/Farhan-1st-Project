import React, { useState } from 'react';
import { TargetType } from '../types/analysis.js';
import { URLAnalyzer } from './URLAnalyzer.js';
import { MessageAnalyzer } from './MessageAnalyzer.js';
import { Globe, MessageSquare, ShieldCheck, Info } from 'lucide-react';

interface AnalyzerCardProps {
  onAnalyzeUrl: (url: string) => void;
  onAnalyzeMessage: (message: string) => void;
  isLoading: boolean;
  initialTab?: TargetType;
}

export const AnalyzerCard: React.FC<AnalyzerCardProps> = ({
  onAnalyzeUrl,
  onAnalyzeMessage,
  isLoading,
  initialTab = 'url',
}) => {
  const [activeTab, setActiveTab] = useState<TargetType>(initialTab);

  return (
    <div className="relative mx-auto w-full max-w-3xl rounded-2xl border border-slate-700/80 bg-[#0d1424]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Top Segmented Tabs (Compliant with Interactive Control Standards) */}
      <div className="flex items-center gap-1.5 rounded-xl bg-slate-950 p-1.5 border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          disabled={isLoading}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'url'
              ? 'bg-[#1e293b] text-cyan-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Website / URL</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('message')}
          disabled={isLoading}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'message'
              ? 'bg-[#1e293b] text-cyan-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Message / Email</span>
        </button>
      </div>

      {/* Main Analyzer Form Body */}
      <div className="mt-6">
        {activeTab === 'url' ? (
          <URLAnalyzer onAnalyze={onAnalyzeUrl} isLoading={isLoading} />
        ) : (
          <MessageAnalyzer onAnalyze={onAnalyzeMessage} isLoading={isLoading} />
        )}
      </div>

      {/* Under Analyzer Metadata & Disclaimer */}
      <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
          <span>Free</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>No account required</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Fast diagnostic heuristics</span>
        </div>

        <p className="mt-2 text-[11px] leading-relaxed text-slate-500 max-w-xl mx-auto flex items-center justify-center gap-1.5">
          <Info className="h-3 w-3 shrink-0 text-slate-500" />
          <span>
            TrustLens provides an automated risk assessment, not a definitive determination of fraud.
          </span>
        </p>
      </div>
    </div>
  );
};
