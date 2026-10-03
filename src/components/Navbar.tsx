import React, { useState } from 'react';
import { ShieldLensIcon } from './ShieldLensIcon.js';
import { Menu, X, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080c14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleNav('/')}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            <ShieldLensIcon className="h-6 w-6 text-cyan-400 transition-transform group-hover:scale-105" />
            <span className="text-lg font-bold tracking-tight text-white">
              TrustLens <span className="font-semibold text-cyan-400">AI</span>
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => handleNav('/analyze')}
            className={`transition-colors hover:text-white ${currentPath === '/analyze' ? 'text-cyan-400 font-semibold' : ''}`}
          >
            Analyzer
          </button>
          <button
            onClick={() => handleNav('/chat')}
            className={`flex items-center gap-1.5 transition-colors hover:text-white ${currentPath === '/chat' ? 'text-cyan-400 font-semibold' : ''}`}
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>AI Chatbot</span>
          </button>
          <button
            onClick={() => handleNav('/#samples')}
            className="transition-colors hover:text-white"
          >
            Samples
          </button>
          <button
            onClick={() => handleNav('/#pipeline')}
            className="transition-colors hover:text-white"
          >
            Methodology
          </button>
          <button
            onClick={() => handleNav('/about')}
            className={`transition-colors hover:text-white ${currentPath === '/about' ? 'text-cyan-400 font-semibold' : ''}`}
          >
            About
          </button>
          <button
            onClick={() => handleNav('/privacy')}
            className={`transition-colors hover:text-white ${currentPath === '/privacy' ? 'text-cyan-400 font-semibold' : ''}`}
          >
            Privacy
          </button>
        </nav>

        {/* Zone 3: Primary Action & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNav('/analyze')}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-all hover:bg-cyan-400 active:scale-[0.98] shadow-sm shadow-cyan-500/20 whitespace-nowrap"
          >
            Analyze Target
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-b border-slate-800 bg-[#0c121e] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <button
              onClick={() => handleNav('/')}
              className="text-left py-2 font-medium text-slate-200 hover:text-cyan-400"
            >
              Home
            </button>
            <button
              onClick={() => handleNav('/analyze')}
              className="text-left py-2 font-medium text-slate-200 hover:text-cyan-400"
            >
              Analyzer
            </button>
            <button
              onClick={() => handleNav('/chat')}
              className="text-left py-2 font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Chatbot</span>
            </button>
            <button
              onClick={() => handleNav('/#samples')}
              className="text-left py-2 font-medium text-slate-200 hover:text-cyan-400"
            >
              Demo Samples
            </button>
            <button
              onClick={() => handleNav('/#pipeline')}
              className="text-left py-2 font-medium text-slate-200 hover:text-cyan-400"
            >
              Methodology
            </button>
            <button
              onClick={() => handleNav('/about')}
              className="text-left py-2 font-medium text-slate-200 hover:text-cyan-400"
            >
              About TrustLens
            </button>
            <button
              onClick={() => handleNav('/privacy')}
              className="text-left py-2 font-medium text-slate-200 hover:text-cyan-400"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleNav('/analyze')}
              className="mt-2 w-full rounded-lg bg-cyan-500 py-2.5 text-center text-xs font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Start Security Scan
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
