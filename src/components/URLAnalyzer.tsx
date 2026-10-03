import React, { useState } from 'react';
import { Globe, ArrowRight, AlertCircle } from 'lucide-react';

interface URLAnalyzerProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export const URLAnalyzer: React.FC<URLAnalyzerProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please paste a website address or URL.');
      return;
    }

    if (
      trimmed.toLowerCase().startsWith('javascript:') ||
      trimmed.toLowerCase().startsWith('data:')
    ) {
      setError('Unsupported or hazardous URL protocol scheme.');
      return;
    }

    onAnalyze(trimmed);
  };

  const handleQuickExample = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Paste a website URL
        </label>
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
            <Globe className="h-5 w-5" />
          </div>
          <input
            id="url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 shadow-inner transition-colors focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Suggested Quick Checks */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
        <span className="text-slate-500">Try testing:</span>
        <button
          type="button"
          onClick={() => handleQuickExample('https://chase-security-verification.online/login')}
          className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
        >
          Lookalike Brand Host
        </button>
        <span className="text-slate-600">·</span>
        <button
          type="button"
          onClick={() => handleQuickExample('https://github.com')}
          className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
        >
          Legitimate Platform
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition-all hover:bg-cyan-400 active:scale-[0.99] disabled:opacity-50"
      >
        <span>{isLoading ? 'Scanning...' : 'Analyze Website'}</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
};
