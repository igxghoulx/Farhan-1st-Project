import React from 'react';
import { ShieldLensIcon } from '../components/ShieldLensIcon.js';
import {
  ShieldCheck,
  Cpu,
  Layers,
  Search,
  Lock,
  GitBranch,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Background lens glow */}
      <div className="pointer-events-none absolute inset-0 lens-glow" />

      <div className="relative mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1 text-xs text-cyan-400 mb-3">
            <ShieldLensIcon className="h-4 w-4" />
            <span className="font-semibold">About TrustLens AI</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Check Before You Trust
          </h1>
          <p className="mt-3 text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            TrustLens AI is an open cybersecurity initiative engineered to equip everyday users with empirical risk diagnostics before they click unvetted links or send irreversible funds.
          </p>
        </div>

        {/* Mission & Philosophy */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1322] p-8 space-y-4">
          <h2 className="text-xl font-bold text-white">Our Core Mission & Philosophy</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Every day, millions of people encounter sophisticated phishing websites, spoofed corporate login screens, fake package delivery notifications, and fraudulent online investment schemes. Conventional internet users have historically lacked accessible tooling to inspect underlying technical indicators like DNS records, TLS certificates, and HTTP response headers.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            TrustLens bridges this gap. By translating observable server configurations, brand impersonation heuristics, and social engineering language cues into structured risk signals, TrustLens empowers users with objective context—explained clearly through Gemini AI.
          </p>
        </div>

        {/* Creator / Built by Farhan Ahmed Mozumder */}
        <div className="rounded-2xl border border-cyan-900/50 bg-gradient-to-br from-[#0c1424] via-[#09101d] to-[#070b14] p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Creator of TrustLens AI
              </span>
              <h2 className="mt-1 text-2xl font-bold text-white tracking-tight">
                Farhan Ahmed Mozumder
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                20-year-old entrepreneur & AI innovator · Studying Computer Networks & Cyber Security at AIUB
              </p>
            </div>

            <a
              href="https://farhanahmed.lovable.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-sm shadow-cyan-500/20 whitespace-nowrap self-start sm:self-auto"
            >
              <span>Portfolio Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <p className="mt-5 text-sm text-slate-300 leading-relaxed">
            Farhan founded and operates <strong className="text-white">XLPlatform</strong> (founded 2022), which has served 10,000+ customers through organic growth. He specializes in AI tool implementation, digital marketing strategy, and cybersecurity fundamentals. He is actively building an agency focused on AI implementation and workflow automation for startups and businesses.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80">
              <span className="font-semibold text-slate-200 block text-sm mb-1">
                Founder, XLPlatform
              </span>
              <p className="text-slate-400 leading-relaxed">
                Scaled from scratch to 10,000+ customers with organic customer acquisition, operations management, and technology adoption.
              </p>
            </div>

            <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80">
              <span className="font-semibold text-slate-200 block text-sm mb-1">
                AI & Cyber Defense
              </span>
              <p className="text-slate-400 leading-relaxed">
                Passionate about real-world cybersecurity, Python, web development, Kali Linux security tools, and practical business automation.
              </p>
            </div>

            <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80">
              <span className="font-semibold text-slate-200 block text-sm mb-1">
                Open to Collaboration
              </span>
              <p className="text-slate-400 leading-relaxed">
                Open for remote consulting, AI implementation projects, marketing partnerships, and collaborations with builders.
              </p>
            </div>
          </div>
        </div>

        {/* The 5-Stage Pipeline */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1322] p-8">
          <h2 className="text-xl font-bold text-white mb-2">The TrustLens Architecture Pipeline</h2>
          <p className="text-sm text-slate-400 mb-8">
            How we convert raw network observables into grounded, explainable cybersecurity assessments.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-800/60 font-mono text-xs font-bold text-cyan-400">
                01
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Observable Evidence</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We inspect verifiable surface data: URL normalization, TLS protocol version and issuer, DNS resolution and mail records, HTTP response headers (CSP, HSTS, X-Frame-Options), and linguistic tokens.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-800/60 font-mono text-xs font-bold text-cyan-400">
                02
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Security Signals</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Collected parameters are matched against known threat mechanics: brand typosquatting, IDN punycode tricks, excessive subdomains, short TLS lifecycles, and coercive urgency phrases.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-800/60 font-mono text-xs font-bold text-cyan-400">
                03
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Structured Telemetry</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Signals are compiled into a rigorous JSON structure with severity scores, observed evidence snippets, and confidence ratings without subjective speculation.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-800/60 font-mono text-xs font-bold text-cyan-400">
                04
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Gemini AI Grounding</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Our server-side Gemini 3.8 Flash integration receives strictly the structured evidence. It synthesizes plain-English risk explanations, analyzes behavioral persuasion tactics, and outlines technical limitations without inventing data.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-800/60 font-mono text-xs font-bold text-cyan-400">
                05
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Automated Risk Assessment</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Users receive an empirical risk score (0-100), clear threat factor summaries, prioritized defense actions, and exportable share cards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Advisory Boundaries & Disclaimer */}
        <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Lock className="h-5 w-5" />
            <h2 className="text-lg font-bold">Important Advisory Boundaries</h2>
          </div>
          <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
            TrustLens provides automated risk evaluations based on external observables at the time of inquiry. Automated assessments cannot inspect private database records, internal source code, or offline real-world business operations.
          </p>
          <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
            Therefore, TrustLens results must NEVER be construed as definitive proof of fraud or legal condemnation. Always verify unexpected communications through authenticated independent channels.
          </p>
        </div>

        {/* Future Roadmap */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1322] p-8">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Future Planned Roadmap</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Planned capabilities scheduled for upcoming development iterations:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-slate-950/70 p-3.5 border border-slate-800/80">
              <span className="font-semibold text-slate-200 block">Real DNS & DNSSEC Analysis</span>
              <span className="text-slate-400">Live recursive DNS lookups with cryptographic DNSSEC validation.</span>
            </div>

            <div className="rounded-lg bg-slate-950/70 p-3.5 border border-slate-800/80">
              <span className="font-semibold text-slate-200 block">Certificate Transparency (CT) Logs</span>
              <span className="text-slate-400">Auditing public CT logs to detect domain certificates provisioned recently.</span>
            </div>

            <div className="rounded-lg bg-slate-950/70 p-3.5 border border-slate-800/80">
              <span className="font-semibold text-slate-200 block">Domain Age & RDAP Inspection</span>
              <span className="text-slate-400">Direct registration date querying to identify newly registered domains (&lt;30 days).</span>
            </div>

            <div className="rounded-lg bg-slate-950/70 p-3.5 border border-slate-800/80">
              <span className="font-semibold text-slate-200 block">Live Redirect Graph Tracing</span>
              <span className="text-slate-400">Visual mapping of intermediate affiliate trackers and redirect hops.</span>
            </div>

            <div className="rounded-lg bg-slate-950/70 p-3.5 border border-slate-800/80">
              <span className="font-semibold text-slate-200 block">Threat Intelligence Feeds</span>
              <span className="text-slate-400">Integration with open blocklists, URLhaus, and phishing telemetry registries.</span>
            </div>

            <div className="rounded-lg bg-slate-950/70 p-3.5 border border-slate-800/80">
              <span className="font-semibold text-slate-200 block">Browser Sandboxed Phishing Detection</span>
              <span className="text-slate-400">Headless browser rendering in a secure sandbox to analyze fake login DOM structures.</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate('/analyze')}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
          >
            <span>Start a Risk Diagnostic</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
