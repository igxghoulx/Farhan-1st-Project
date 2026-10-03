import React, { useState } from 'react';
import { TechnicalUrlEvidence, TextualEvidence, TriState } from '../types/analysis.js';
import { Database, Check, X, Minus, Shield, Server, Globe, FileText, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

interface EvidencePanelProps {
  technicalEvidence?: TechnicalUrlEvidence;
  textualEvidence?: TextualEvidence;
  defaultExpanded?: boolean;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  technicalEvidence,
  textualEvidence,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!technicalEvidence && !textualEvidence) return null;

  const renderTriState = (val: TriState | boolean | undefined) => {
    let status: TriState = 'unavailable';
    if (val === 'present' || val === true) status = 'present';
    else if (val === 'missing' || val === false) status = 'missing';

    if (status === 'present') {
      return (
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <Check className="h-3.5 w-3.5" /> Present
        </span>
      );
    }
    if (status === 'missing') {
      return (
        <span className="flex items-center gap-1 text-rose-400 font-medium">
          <X className="h-3.5 w-3.5" /> Missing
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-slate-400 font-medium">
        <Minus className="h-3.5 w-3.5" /> Unavailable
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0c121e] p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Raw Observable Evidence Summary
            </h3>
            <p className="text-xs text-slate-400">
              Real server-side technical parameters collected during live diagnostic evaluation
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 border border-slate-800 hover:text-white transition-colors"
        >
          <span>{expanded ? 'Collapse Details' : 'Expand All Telemetry'}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {technicalEvidence && (
        <div className="mt-5 space-y-5">
          {/* Quick High-Level Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">
                Protocol & Port
              </span>
              <p className="mt-1 font-mono text-sm font-semibold text-white">
                {technicalEvidence.protocol.toUpperCase()} {technicalEvidence.port ? `:${technicalEvidence.port}` : '(Default)'}
              </p>
            </div>

            <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">
                HTTP Response
              </span>
              <p className="mt-1 font-mono text-sm font-semibold text-cyan-400">
                {typeof technicalEvidence.http.statusCode === 'number'
                  ? `${technicalEvidence.http.statusCode} Status`
                  : 'Unavailable'}
              </p>
              {typeof technicalEvidence.http.responseTimeMs === 'number' && (
                <span className="text-[10px] text-slate-500 font-mono">
                  {technicalEvidence.http.responseTimeMs}ms latency
                </span>
              )}
            </div>

            <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">
                Redirect Count
              </span>
              <p className="mt-1 font-mono text-sm font-semibold text-white">
                {technicalEvidence.redirects.redirectCount} {technicalEvidence.redirects.redirectCount === 1 ? 'hop' : 'hops'}
              </p>
            </div>

            <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">
                Domain Age
              </span>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-300">
                {technicalEvidence.domain?.age || 'Unavailable'}
              </p>
            </div>
          </div>

          {/* Security Headers Table */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-cyan-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Browser Defensive Headers Audit
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                Distinguishes: Present · Missing · Unavailable
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex items-center justify-between rounded bg-slate-900/60 px-3 py-2 border border-slate-800/60">
                <span className="text-slate-300">Strict-Transport-Security (HSTS)</span>
                {renderTriState(technicalEvidence.securityHeaders.strictTransportSecurity)}
              </div>

              <div className="flex items-center justify-between rounded bg-slate-900/60 px-3 py-2 border border-slate-800/60">
                <span className="text-slate-300">Content-Security-Policy (CSP)</span>
                {renderTriState(technicalEvidence.securityHeaders.contentSecurityPolicy)}
              </div>

              <div className="flex items-center justify-between rounded bg-slate-900/60 px-3 py-2 border border-slate-800/60">
                <span className="text-slate-300">X-Frame-Options (Clickjacking)</span>
                {renderTriState(technicalEvidence.securityHeaders.xFrameOptions)}
              </div>

              <div className="flex items-center justify-between rounded bg-slate-900/60 px-3 py-2 border border-slate-800/60">
                <span className="text-slate-300">X-Content-Type-Options</span>
                {renderTriState(technicalEvidence.securityHeaders.xContentTypeOptions)}
              </div>

              <div className="flex items-center justify-between rounded bg-slate-900/60 px-3 py-2 border border-slate-800/60">
                <span className="text-slate-300">Referrer-Policy</span>
                {renderTriState(technicalEvidence.securityHeaders.referrerPolicy)}
              </div>

              <div className="flex items-center justify-between rounded bg-slate-900/60 px-3 py-2 border border-slate-800/60">
                <span className="text-slate-300">Permissions-Policy</span>
                {renderTriState(technicalEvidence.securityHeaders.permissionsPolicy)}
              </div>
            </div>

            <p className="mt-2.5 text-[11px] text-slate-500 italic">
              * Note: Missing security headers are defensive hardening observations and do not constitute proof of fraud or malicious intent.
            </p>
          </div>

          {/* Deep Details (Expanded) */}
          {expanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="rounded-lg bg-slate-950/60 p-4 border border-slate-800">
                <h5 className="font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Server className="h-3.5 w-3.5 text-cyan-400" />
                  TLS & Certificate Telemetry
                </h5>
                <ul className="space-y-1.5 text-slate-400">
                  <li><strong className="text-slate-300">Encryption:</strong> {technicalEvidence.tls.enabled === true ? 'HTTPS Enabled' : technicalEvidence.tls.enabled === false ? 'HTTP Cleartext' : 'Unavailable'}</li>
                  <li><strong className="text-slate-300">Certificate Valid:</strong> {technicalEvidence.tls.certificateValid === true ? 'Valid CA Chain' : technicalEvidence.tls.certificateValid === false ? 'Validation Failed / Untrusted' : 'Unavailable'}</li>
                  <li><strong className="text-slate-300">Issuer:</strong> {technicalEvidence.tls.issuer || 'Unavailable'}</li>
                  <li><strong className="text-slate-300">Subject:</strong> {technicalEvidence.tls.subject || 'Unavailable'}</li>
                  <li><strong className="text-slate-300">Protocol:</strong> {technicalEvidence.tls.protocol || 'Unavailable'}</li>
                  <li><strong className="text-slate-300">Expires At:</strong> {technicalEvidence.tls.expiresAt || 'Unavailable'}</li>
                  <li><strong className="text-slate-300">Days Remaining:</strong> {technicalEvidence.tls.validDaysRemaining !== undefined ? String(technicalEvidence.tls.validDaysRemaining) : 'Unavailable'}</li>
                  <li><strong className="text-slate-300">Self-Signed:</strong> {technicalEvidence.tls.isSelfSigned === true ? 'Yes (Elevated Risk)' : technicalEvidence.tls.isSelfSigned === false ? 'No' : 'Unavailable'}</li>
                </ul>
              </div>

              <div className="rounded-lg bg-slate-950/60 p-4 border border-slate-800">
                <h5 className="font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-cyan-400" />
                  DNS Infrastructure Telemetry
                </h5>
                <ul className="space-y-1.5 text-slate-400">
                  <li><strong className="text-slate-300">A Records (IPv4):</strong> {Array.isArray(technicalEvidence.dns.a) && technicalEvidence.dns.a.length > 0 ? technicalEvidence.dns.a.join(', ') : 'Unavailable'}</li>
                  <li><strong className="text-slate-300">AAAA Records (IPv6):</strong> {Array.isArray(technicalEvidence.dns.aaaa) && technicalEvidence.dns.aaaa.length > 0 ? technicalEvidence.dns.aaaa.join(', ') : 'None / Unavailable'}</li>
                  <li><strong className="text-slate-300">CNAME:</strong> {Array.isArray(technicalEvidence.dns.cname) && technicalEvidence.dns.cname.length > 0 ? technicalEvidence.dns.cname.join(', ') : 'Direct A Record (None)'}</li>
                  <li><strong className="text-slate-300">MX Records:</strong> {Array.isArray(technicalEvidence.dns.mx) && technicalEvidence.dns.mx.length > 0 ? technicalEvidence.dns.mx.join(', ') : 'None Detected'}</li>
                  <li><strong className="text-slate-300">DNS Status:</strong> {technicalEvidence.dns.status || 'Resolved'}</li>
                </ul>
              </div>

              <div className="col-span-1 md:col-span-2 rounded-lg bg-slate-950/60 p-4 border border-slate-800">
                <h5 className="font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                  Domain Registration & Provider Status
                </h5>
                <ul className="space-y-1.5 text-slate-400">
                  <li><strong className="text-slate-300">Domain Age:</strong> {technicalEvidence.domain?.age || 'Unavailable (No public WHOIS provider configured)'}</li>
                  <li><strong className="text-slate-300">Provider Interface:</strong> {technicalEvidence.domain?.provider || 'Standard RDAP/WHOIS Abstract Provider'}</li>
                  <li><strong className="text-slate-300">Redirect Chain:</strong> {technicalEvidence.redirects.chain.join(' → ')}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {textualEvidence && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">
                Text Character Count
              </span>
              <p className="mt-1 font-mono text-sm font-semibold text-white">
                {textualEvidence.rawLength} chars
              </p>
            </div>

            <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">
                Embedded URLs
              </span>
              <p className="mt-1 font-mono text-sm font-semibold text-cyan-400">
                {textualEvidence.containsLinks.length} link(s)
              </p>
            </div>

            <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">
                Urgency Pressure
              </span>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-200">
                {textualEvidence.urgencyIndicators.length > 0 ? `${textualEvidence.urgencyIndicators.length} cues` : 'None detected'}
              </p>
            </div>

            <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">
                Linguistic Sentiment
              </span>
              <p className="mt-1 font-mono text-sm font-semibold capitalize text-slate-200">
                {textualEvidence.sentimentIntensity.replace('_', ' ')}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4 text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-cyan-400" />
              <h4 className="font-semibold uppercase tracking-wider text-slate-300">
                Linguistic & Behavioral Extraction
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/60">
                <span className="text-slate-400 block text-[11px]">Payment Keywords:</span>
                <span className="text-slate-200">
                  {textualEvidence.paymentPressureKeywords.join(', ') || 'No irreversible payment demands detected'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/60">
                <span className="text-slate-400 block text-[11px]">Impersonation Markers:</span>
                <span className="text-slate-200">
                  {textualEvidence.impersonationKeywords.join(', ') || 'No recognized brand impersonation tokens'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
