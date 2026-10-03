import React from 'react';
import { AnalysisReport } from '../types/analysis.js';
import { AnalyzerCard } from '../components/AnalyzerCard.js';
import { ShieldLensIcon } from '../components/ShieldLensIcon.js';
import { RiskBadge } from '../components/RiskBadge.js';
import {
  ShieldAlert,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  FileCheck2,
  Lock,
  Search,
  ExternalLink,
} from 'lucide-react';

interface LandingPageProps {
  onAnalyzeUrl: (url: string) => void;
  onAnalyzeMessage: (message: string) => void;
  onSelectSample: (report: AnalysisReport) => void;
  samples: AnalysisReport[];
  isLoading: boolean;
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onAnalyzeUrl,
  onAnalyzeMessage,
  onSelectSample,
  samples,
  isLoading,
  onNavigate,
}) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background lens glow */}
      <div className="pointer-events-none absolute inset-0 lens-glow" />

      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Subtle Cyber Trust Kicker */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1 text-xs text-slate-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-cyan-400">TrustLens AI</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Automated Cybersecurity Risk Diagnostic</span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            Check before you trust.
          </h1>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl mx-auto text-balance">
            Analyze suspicious websites, messages, and online offers using observable security signals and AI-powered explanations.
          </p>

          {/* Primary Analyzer Card */}
          <div className="mt-10">
            <AnalyzerCard
              onAnalyzeUrl={onAnalyzeUrl}
              onAnalyzeMessage={onAnalyzeMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </section>

      {/* Pre-Loaded Demo Samples Section */}
      <section id="samples" className="border-t border-slate-800/80 bg-[#070b14] py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Interactive Security Scenarios
              </span>
              <h2 className="mt-1 text-2xl font-bold text-white tracking-tight sm:text-3xl">
                Explore Realistic Pre-Scanned Demonstrations
              </h2>
              <p className="mt-1.5 text-sm text-slate-400 max-w-xl">
                See how TrustLens decomposes real-world lures into observable technical and behavioral risk indicators.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/analyze')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Launch Custom Scan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {samples.map((sample) => {
              const isHigh = sample.assessment.score >= 75;
              const isModerate = sample.assessment.score >= 45 && sample.assessment.score < 75;
              const scoreColor = isHigh
                ? 'text-rose-400'
                : isModerate
                ? 'text-amber-400'
                : 'text-emerald-400';

              return (
                <div
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0d1322] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <RiskBadge level={sample.assessment.level} size="sm" />
                      <span className="text-xs font-mono capitalize text-slate-400">
                        {sample.type}
                      </span>
                    </div>

                    <h3 className="mt-3.5 text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {sample.displayTarget}
                    </h3>

                    <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {sample.aiAnalysis.overview}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-slate-800/80 pt-4 flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className={`font-mono text-2xl font-bold tabular-nums ${scoreColor}`}>
                        {sample.assessment.score}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">/ 100 Risk</span>
                    </div>

                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-300 group-hover:text-cyan-400 transition-colors">
                      <span>View Report</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture & Pipeline Walkthrough */}
      <section id="pipeline" className="border-t border-slate-800/80 py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              The TrustLens Diagnostic Philosophy
            </span>
            <h2 className="mt-2 text-3xl font-bold text-white tracking-tight sm:text-4xl text-balance">
              Observable Evidence Over Hallucinated Scores
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Unlike generic AI tools that hallucinate random scam percentages, TrustLens follows a strict empirical pipeline grounded in concrete technical and behavioral indicators.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-700 text-cyan-400">
                <Search className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Stage 01
              </span>
              <h4 className="text-sm font-bold text-white">Observable Evidence</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspects real URL schemes, TLS certificate issuers, DNS records, and browser headers.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-700 text-cyan-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Stage 02
              </span>
              <h4 className="text-sm font-bold text-white">Security Signals</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flags anomalies like punycode homoglyphs, brand typosquatting, missing HSTS, or fee urgency.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-700 text-cyan-400">
                <Database className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Stage 03
              </span>
              <h4 className="text-sm font-bold text-white">Structured Telemetry</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assembles exact findings into a structured schema without subjective bias or invented facts.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-700 text-cyan-400">
                <Cpu className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Stage 04
              </span>
              <h4 className="text-sm font-bold text-white">Gemini AI Grounding</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini 3.8 Flash synthesizes technical findings into plain-English explanations and limitations.
              </p>
            </div>

            {/* Step 5 */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-700 text-cyan-400">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Stage 05
              </span>
              <h4 className="text-sm font-bold text-white">Risk Assessment</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Presents actionable advisory guidance and defensive actions to keep users safe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ethics & Advisory Boundaries */}
      <section className="border-t border-slate-800/80 bg-[#070b14] py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-[#0d1424] p-8 sm:p-10 shadow-xl">
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">
              Why We Call It "Risk Assessment", Not "Confirmed Scam"
            </h3>
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-300 leading-relaxed">
            <p>
              In professional cybersecurity, declaring an entity as legally fraudulent requires formal subpoenas, private financial records, and judicial proceedings. Automated web tools that claim <em>"100% scam detection"</em> produce dangerous false confidence or unwarranted defamation.
            </p>
            <p>
              TrustLens operates on zero-trust transparency: we show you the exact observable evidence—such as a domain registered yesterday mimicking a bank, missing defensive headers, or irreversible payment prompts—so you can make an informed decision before sharing sensitive credentials or money.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => onNavigate('/about')}
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              Read our full methodology & creator background
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => onNavigate('/privacy')}
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              Learn about our zero-storage privacy policy
            </button>
          </div>
        </div>

        {/* Creator Callout */}
        <div className="mx-auto max-w-4xl mt-6 rounded-xl border border-slate-800 bg-[#0a0f1d] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                Created by
              </span>
              <span className="text-sm font-bold text-white">Farhan Ahmed Mozumder</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              20-year-old entrepreneur & AI innovator studying Computer Networks & Cyber Security at AIUB. Founder of XLPlatform (10k+ customers).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://farhanahmed.lovable.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <span>Portfolio</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={() => onNavigate('/about')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors whitespace-nowrap"
            >
              <span>Read Story</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
