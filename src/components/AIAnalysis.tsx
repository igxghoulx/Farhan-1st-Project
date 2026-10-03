import React from 'react';
import { AIAnalysisOutput } from '../types/analysis.js';
import { MarkdownRenderer } from './MarkdownRenderer.js';
import { Sparkles, Info, ShieldAlert, Cpu } from 'lucide-react';

interface AIAnalysisProps {
  aiAnalysis: AIAnalysisOutput;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ aiAnalysis }) => {
  const { overview, technicalContext, behavioralContext, limitations, modelUsed } = aiAnalysis;

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0c121e] p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950/70 border border-cyan-800/50 text-cyan-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              AI Security Explanation
            </h3>
            <p className="text-xs text-slate-400">
              Objective risk reasoning synthesized strictly from observable evidence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1 border border-slate-800 text-[11px] font-mono text-cyan-300">
          <Cpu className="h-3 w-3 text-cyan-400" />
          <span>{modelUsed || 'Gemini 3.8 Flash'}</span>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {/* Executive Overview */}
        <div className="rounded-lg bg-slate-900/60 p-4 border border-slate-800/60">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Assessment Overview
          </h4>
          <div className="mt-1.5 text-sm leading-relaxed text-slate-200">
            <MarkdownRenderer content={overview} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Technical Context */}
          <div className="rounded-lg bg-slate-900/40 p-4 border border-slate-800/40">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Technical Infrastructure Context
            </h4>
            <div className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-300">
              <MarkdownRenderer content={technicalContext} />
            </div>
          </div>

          {/* Behavioral Context */}
          <div className="rounded-lg bg-slate-900/40 p-4 border border-slate-800/40">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Behavioral & Deception Analysis
            </h4>
            <div className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-300">
              <MarkdownRenderer content={behavioralContext} />
            </div>
          </div>
        </div>

        {/* Limitations Notice */}
        <div className="flex items-start gap-3 rounded-lg border border-amber-900/40 bg-amber-950/20 p-3.5 text-xs text-amber-200/90">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-300">Assessment Limitations & Advisory Nature:</span>
            <p className="text-amber-200/80 leading-relaxed">
              {limitations}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
