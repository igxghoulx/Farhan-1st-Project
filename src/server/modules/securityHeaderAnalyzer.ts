/**
 * Real Security Headers Analysis Module
 * Analyzes defensive browser security headers from real HTTP response headers.
 * Reports status as: "present" | "missing" | "unavailable".
 * Strictly explains that missing headers are defensive hardening gaps, NOT proof of fraud.
 */

import { SecurityHeadersEvidence, SecuritySignal, TriState } from '../../types/analysis.js';

export interface SecurityHeadersAnalysisResult {
  evidence: SecurityHeadersEvidence;
  signals: SecuritySignal[];
}

export function analyzeSecurityHeaders(
  rawHeaders: Record<string, string>,
  httpReachable: boolean
): SecurityHeadersAnalysisResult {
  const signals: SecuritySignal[] = [];

  // If HTTP connection failed, headers are unavailable
  if (!httpReachable || Object.keys(rawHeaders).length === 0) {
    const evidence: SecurityHeadersEvidence = {
      contentSecurityPolicy: 'unavailable',
      strictTransportSecurity: 'unavailable',
      xFrameOptions: 'unavailable',
      xContentTypeOptions: 'unavailable',
      referrerPolicy: 'unavailable',
      permissionsPolicy: 'unavailable',
      details: {},
    };

    return { evidence, signals };
  }

  const checkHeader = (headerName: string): { status: TriState; value: string | null } => {
    const lowerName = headerName.toLowerCase();
    const val = rawHeaders[lowerName];
    if (val && val.trim().length > 0) {
      return { status: 'present', value: val.trim() };
    }
    return { status: 'missing', value: null };
  };

  const csp = checkHeader('content-security-policy');
  const hsts = checkHeader('strict-transport-security');
  const xcto = checkHeader('x-content-type-options');
  const xfo = checkHeader('x-frame-options');
  const refPolicy = checkHeader('referrer-policy');
  const permPolicy = checkHeader('permissions-policy');

  const missingList: string[] = [];
  if (csp.status === 'missing') missingList.push('Content-Security-Policy');
  if (hsts.status === 'missing') missingList.push('Strict-Transport-Security');
  if (xfo.status === 'missing') missingList.push('X-Frame-Options');
  if (xcto.status === 'missing') missingList.push('X-Content-Type-Options');

  // Hardening signal: missing headers are defensive hygiene signals, not proof of fraud
  if (missingList.length >= 3) {
    signals.push({
      id: 'headers-missing-hardening',
      severity: 'MEDIUM',
      title: 'Missing standard browser security-hardening headers',
      explanation: 'Several standard defensive headers (such as CSP and HSTS) were not detected on this server. This reflects absence of modern browser defense controls against clickjacking or MIME confusion; it is an infrastructure hardening observation, not proof of malice.',
      evidence: `Missing headers: ${missingList.join(', ')}`,
      category: 'hardening',
      confidence: 'High',
      source: 'technical-analysis',
    });
  } else if (missingList.length > 0) {
    signals.push({
      id: 'headers-partial-hardening',
      severity: 'LOW',
      title: 'Partial security-hardening header coverage',
      explanation: 'Certain browser defense headers were omitted. Many legitimate websites omit one or two headers, but security-conscious platforms enforce full suites.',
      evidence: `Omitted: ${missingList.join(', ')}`,
      category: 'hardening',
      confidence: 'Medium',
      source: 'technical-analysis',
    });
  } else {
    signals.push({
      id: 'headers-full-hardening',
      severity: 'INFORMATIONAL',
      title: 'Defensive browser security headers enforced',
      explanation: 'Server publishes core defensive directives including HSTS, CSP, and framing protection.',
      evidence: 'HSTS, CSP, X-Frame-Options, and X-Content-Type-Options are present',
      category: 'hardening',
      confidence: 'High',
      source: 'technical-analysis',
    });
  }

  const evidence: SecurityHeadersEvidence = {
    contentSecurityPolicy: csp.status,
    strictTransportSecurity: hsts.status,
    xFrameOptions: xfo.status,
    xContentTypeOptions: xcto.status,
    referrerPolicy: refPolicy.status,
    permissionsPolicy: permPolicy.status,
    details: {
      'Content-Security-Policy': csp.value,
      'Strict-Transport-Security': hsts.value,
      'X-Frame-Options': xfo.value,
      'X-Content-Type-Options': xcto.value,
      'Referrer-Policy': refPolicy.value,
      'Permissions-Policy': permPolicy.value,
    },
  };

  return { evidence, signals };
}
