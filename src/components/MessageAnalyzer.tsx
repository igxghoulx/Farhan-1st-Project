import React, { useState } from 'react';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';

interface MessageAnalyzerProps {
  onAnalyze: (message: string) => void;
  isLoading: boolean;
}

export const MessageAnalyzer: React.FC<MessageAnalyzerProps> = ({ onAnalyze, isLoading }) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = message.trim();
    if (!trimmed || trimmed.length < 5) {
      setError('Please paste a suspicious message or email containing at least 5 characters.');
      return;
    }

    onAnalyze(trimmed);
  };

  const handleQuickExample = (sampleText: string) => {
    setMessage(sampleText);
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="message-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Paste a suspicious message, email, or offer
        </label>
        <div className="relative">
          <textarea
            id="message-input"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste text here... (e.g. 'URGENT: Your account has been temporarily suspended. Verify your identity within 24 hours at http://security-update-now.xyz to avoid permanent closure.')"
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 p-4 text-sm text-slate-100 placeholder-slate-500 shadow-inner transition-colors focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 font-sans"
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
          onClick={() =>
            handleQuickExample(
              'FINAL NOTICE: Your USPS parcel #US984219 could not be delivered due to an incorrect house number. A $1.85 redelivery fee is required within 12 hours or package will be returned: https://usps-redelivery-portal.xyz'
            )
          }
          className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
        >
          Delivery Fee SMS
        </button>
        <span className="text-slate-600">·</span>
        <button
          type="button"
          onClick={() =>
            handleQuickExample(
              'Dear Customer, we detected an unauthorized purchase of $499.00 for Norton LifeLock Antivirus. If you did not make this purchase, call our toll-free refund desk immediately at +1-800-555-0199.'
            )
          }
          className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
        >
          Refund Scam Lure
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition-all hover:bg-cyan-400 active:scale-[0.99] disabled:opacity-50"
      >
        <span>{isLoading ? 'Scanning...' : 'Analyze Message'}</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
};
