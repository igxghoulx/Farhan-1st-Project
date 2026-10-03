import React, { useState, useRef } from 'react';
import { AnalysisReport } from '../types/analysis.js';
import { ShieldLensIcon } from './ShieldLensIcon.js';
import { RiskBadge } from './RiskBadge.js';
import { X, Copy, Check, Share2, Download, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ShareReportModalProps {
  report: AnalysisReport;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  report,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/result/${report.id}`;
  const isHigh = report.assessment.score >= 75;
  const isModerate = report.assessment.score >= 45 && report.assessment.score < 75;

  const scoreColor = isHigh
    ? 'text-rose-400'
    : isModerate
    ? 'text-amber-400'
    : 'text-emerald-400';

  const strokeColor = isHigh
    ? '#f43f5e'
    : isModerate
    ? '#f59e0b'
    : '#10b981';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      prompt('Copy this report URL:', shareUrl);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `TrustLens AI Risk Report: ${report.displayTarget}`,
          text: `Automated Risk Assessment: ${report.assessment.score}/100 (${report.assessment.level}) for ${report.displayTarget} on TrustLens AI.`,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadCard = () => {
    setDownloading(true);
    try {
      // Generate clean standalone SVG representation for high-fidelity export
      const svgContent = `
<svg width="800" height="460" viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="460" rx="20" fill="#090d16"/>
  <rect x="2" y="2" width="796" height="456" rx="18" fill="none" stroke="#1e293b" stroke-width="2"/>
  
  <!-- Accent Line -->
  <line x1="0" y1="0" x2="800" y2="0" stroke="${strokeColor}" stroke-width="8"/>
  
  <!-- Header -->
  <text x="50" y="65" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="bold" fill="#ffffff">TrustLens <tspan fill="#38bdf8">AI</tspan></text>
  <text x="50" y="90" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Check before you trust · Automated Risk Assessment</text>
  
  <!-- Target Box -->
  <rect x="50" y="115" width="700" height="60" rx="10" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <text x="70" y="142" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-transform="uppercase">ANALYZED TARGET (${report.type.toUpperCase()}):</text>
  <text x="70" y="162" font-family="monospace" font-size="14" font-weight="600" fill="#f8fafc">${escapeXml(report.displayTarget)}</text>
  
  <!-- Score and Level -->
  <rect x="50" y="195" width="220" height="180" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <text x="80" y="235" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8">RISK SCORE</text>
  <text x="80" y="295" font-family="monospace" font-size="52" font-weight="800" fill="${strokeColor}">${report.assessment.score}<tspan font-size="20" fill="#64748b">/100</tspan></text>
  <text x="80" y="340" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="${strokeColor}">${report.assessment.level}</text>

  <!-- Summary Box -->
  <rect x="290" y="195" width="460" height="180" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <text x="315" y="235" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8">KEY FINDINGS</text>
  <text x="315" y="265" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#f1f5f9">${report.signals.length} Security Signals Detected</text>
  <text x="315" y="300" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#cbd5e1">${escapeXml(report.assessment.primaryRiskFactor.slice(0, 55))}...</text>
  <text x="315" y="345" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#64748b">Advisory automated assessment. Not a definitive determination of fraud.</text>
  
  <!-- Footer -->
  <text x="50" y="420" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#38bdf8">trustlens.ai</text>
  <text x="750" y="420" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#64748b" text-anchor="end">Report ID: ${report.id}</text>
</svg>
`;

      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `trustlens-report-${report.id}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-[#0a0f1d] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Share Assessment Report</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-xs text-slate-400 mb-4">
            Share this verifiable security card with family, colleagues, or social media to help prevent fraud.
          </p>

          {/* Social Share Card Preview */}
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-xl border border-slate-700/80 bg-gradient-to-b from-[#0f172a] to-[#070b14] p-6 shadow-inner"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: strokeColor }}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldLensIcon className="h-5 w-5 text-cyan-400" />
                <span className="text-sm font-bold text-white tracking-tight">
                  TrustLens <span className="font-semibold text-cyan-400">AI</span>
                </span>
              </div>
              <span className="font-mono text-xs text-cyan-400 font-semibold">
                trustlens.ai
              </span>
            </div>

            <div className="mt-4 rounded-lg bg-slate-950/70 p-3 border border-slate-800/80">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Target Analyzed
              </span>
              <p className="mt-0.5 font-mono text-xs font-semibold text-white truncate">
                {report.displayTarget}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-900/80 p-4 border border-slate-800">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                  Automated Risk Assessment
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className={`font-mono text-3xl font-extrabold ${scoreColor}`}>
                    {report.assessment.score}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/ 100</span>
                </div>
                <div className="mt-2">
                  <RiskBadge level={report.assessment.level} size="sm" />
                </div>
              </div>

              <div className="rounded-lg bg-slate-900/80 p-4 border border-slate-800">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                  Signals Detected
                </span>
                <p className="mt-1 text-2xl font-bold font-mono text-white">
                  {report.signals.length}
                </p>
                <p className="mt-1 text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {report.assessment.primaryRiskFactor}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60 pt-3">
              <span>Automated advisory risk analysis</span>
              <span>Report ID: {report.id}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>Share Card</span>
            </button>

            <button
              onClick={handleDownloadCard}
              disabled={downloading}
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>{downloading ? 'Exporting...' : 'Download Image'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
