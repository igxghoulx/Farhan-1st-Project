import React from 'react';
import { ShieldLensIcon } from './ShieldLensIcon.js';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060910] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <ShieldLensIcon className="h-6 w-6 text-cyan-400" />
              <span className="text-lg font-bold text-white tracking-tight">
                TrustLens <span className="font-semibold text-cyan-400">AI</span>
              </span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
              Check before you trust. An open cybersecurity utility analyzing observable technical infrastructure and communication cues to help everyday users evaluate digital risk before clicking or sending money.
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
              <span>Free Community Utility</span>
              <span aria-hidden="true">·</span>
              <span>No Account Required</span>
              <span aria-hidden="true">·</span>
              <span>Ephemeral In-Memory Processing</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Navigation</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Home Landing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/analyze')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Security Analyzer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  About & Methodology
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/privacy')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Legal & Advisory</h4>
            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-400">
              <p>
                <strong className="text-slate-300">Automated Risk Assessment:</strong> TrustLens provides automated heuristics and AI commentary based exclusively on observable technical parameters.
              </p>
              <p>
                Results do not constitute a definitive determination of fraud, legal certification, or financial advice. Always verify sensitive requests through authenticated independent channels.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} TrustLens AI · Created by{' '}
            <a
              href="https://farhanahmed.lovable.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Farhan Ahmed Mozumder
            </a>
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('/about')} className="hover:text-slate-300">
              About & Creator
            </button>
            <button onClick={() => onNavigate('/privacy')} className="hover:text-slate-300">
              Zero-Log Privacy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
