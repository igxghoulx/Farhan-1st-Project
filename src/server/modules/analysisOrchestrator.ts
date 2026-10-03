/**
 * Real Analysis Orchestrator
 * Pipeline:
 * Observable Evidence -> Security Signals -> Structured Telemetry -> Gemini AI Explanation -> Risk Assessment
 *
 * Implements real network checks, stage event hooks, strict SSRF defenses,
 * and Section 8 structured evidence formatting.
 */

import { randomUUID } from 'crypto';
import {
  AnalysisReport,
  RiskAssessmentSummary,
  RiskLevel,
  SecuritySignal,
  StructuredUrlAnalysis,
  TechnicalUrlEvidence,
} from '../../types/analysis.js';
import { analyzeDns } from './dnsAnalyzer.js';
import { domainInfoProvider } from './domainInfoProvider.js';
import { generateGeminiAnalysis } from './geminiService.js';
import { analyzeHttp } from './httpAnalyzer.js';
import { reportStore } from './reportStore.js';
import { analyzeSecurityHeaders } from './securityHeaderAnalyzer.js';
import { analyzeMessageText } from './textAnalyzer.js';
import { analyzeTls } from './tlsAnalyzer.js';
import { normalizeUrl } from './urlNormalizer.js';
import { analyzeUrlPatterns } from './urlPatternAnalyzer.js';

export type StageCallback = (stageId: string, label: string, status: 'in_progress' | 'completed' | 'failed', detail?: string) => void;

export async function runUrlAnalysis(
  rawUrl: string,
  onStageUpdate?: StageCallback
): Promise<AnalysisReport> {
  // Stage 1: URL Normalization & SSRF Pre-flight
  onStageUpdate?.('checking_url', 'Checking URL format & protocol...', 'in_progress');
  const norm = normalizeUrl(rawUrl);
  if (!norm.isValid) {
    onStageUpdate?.('checking_url', 'Invalid URL or SSRF block', 'failed', norm.error);
    throw new Error(norm.error || 'Invalid URL specification');
  }
  onStageUpdate?.('checking_url', 'URL normalized & verified', 'completed');

  const hostname = norm.hostname;
  const protocol = norm.protocol;
  const isIp = norm.isIpAddress;
  const path = norm.path;

  // Stage 2: DNS Resolution & Post-Resolution SSRF Re-Check
  onStageUpdate?.('resolving_dns', 'Resolving DNS records...', 'in_progress');
  const dnsRes = await analyzeDns(hostname, isIp);
  if (dnsRes.hasSsrfRisk) {
    onStageUpdate?.('resolving_dns', 'SSRF blocked in DNS resolution', 'failed', dnsRes.ssrfReason);
    throw new Error(dnsRes.ssrfReason || 'Access restricted: Domain resolved to private network address.');
  }
  onStageUpdate?.('resolving_dns', 'DNS resolved', 'completed');

  // Stage 3 & 4: Concurrent HTTP & TLS Inspection (High Performance)
  onStageUpdate?.('inspecting_http', 'Inspecting HTTP response & redirects...', 'in_progress');
  onStageUpdate?.('checking_tls', 'Checking TLS certificates & handshake...', 'in_progress');

  const [httpRes, tlsRes] = await Promise.all([
    analyzeHttp(norm.normalized).then((res) => {
      onStageUpdate?.('inspecting_http', 'HTTP response captured', 'completed');
      return res;
    }),
    analyzeTls(protocol, hostname, norm.port).then((res) => {
      onStageUpdate?.('checking_tls', 'TLS inspection completed', 'completed');
      return res;
    }),
  ]);

  // Stage 5: Security Headers Analysis
  onStageUpdate?.('analyzing_headers', 'Analyzing security headers...', 'in_progress');
  const headerRes = analyzeSecurityHeaders(
    httpRes.rawHeaders,
    httpRes.httpEvidence.statusCode !== 'unavailable'
  );
  onStageUpdate?.('analyzing_headers', 'Security headers evaluated', 'completed');

  // Stage 6: URL Structure & Lexical Analysis
  onStageUpdate?.('evaluating_patterns', 'Evaluating URL structure signals...', 'in_progress');
  const patternRes = analyzeUrlPatterns(hostname, path, isIp, norm.parsed, norm.port);
  onStageUpdate?.('evaluating_patterns', 'URL signals evaluated', 'completed');

  // Stage 7: Domain Information Provider
  const domainRes = await domainInfoProvider.getDomainInfo(hostname);

  // Collate Deterministic Security Signals
  const allSignals: SecuritySignal[] = [
    ...patternRes.signals,
    ...dnsRes.signals,
    ...httpRes.signals,
    ...tlsRes.signals,
    ...headerRes.signals,
  ];

  // Calculate Base Risk Score
  const { score: baseScore, level: baseLevel, primaryFactor } = calculateRiskScore(allSignals);

  // Section 8: Single Structured Analysis Object
  const structuredEvidence: StructuredUrlAnalysis = {
    target: {
      inputUrl: rawUrl,
      normalizedUrl: norm.normalized,
      hostname: norm.hostname,
      port: norm.port,
    },
    http: {
      statusCode: httpRes.httpEvidence.statusCode,
      responseTimeMs: httpRes.httpEvidence.responseTimeMs ?? 'unavailable',
      redirectCount: httpRes.redirectEvidence.redirectCount,
      finalUrl: httpRes.finalUrl,
      contentType: httpRes.httpEvidence.contentType,
      server: httpRes.httpEvidence.server,
      contentLength: httpRes.httpEvidence.contentLength,
    },
    tls: {
      https: tlsRes.evidence.https ?? (protocol === 'https'),
      certificateValid: tlsRes.evidence.certificateValid ?? 'unavailable',
      issuer: tlsRes.evidence.issuer ?? 'unavailable',
      subject: tlsRes.evidence.subject ?? 'unavailable',
      expiresAt: tlsRes.evidence.expiresAt ?? 'unavailable',
      protocol: tlsRes.evidence.protocol ?? 'unavailable',
      validDaysRemaining: tlsRes.evidence.validDaysRemaining ?? 'unavailable',
      isSelfSigned: tlsRes.evidence.isSelfSigned ?? 'unavailable',
    },
    dns: {
      a: dnsRes.evidence.a ?? 'unavailable',
      aaaa: dnsRes.evidence.aaaa ?? 'unavailable',
      cname: dnsRes.evidence.cname ?? 'unavailable',
      mx: dnsRes.evidence.mx ?? 'unavailable',
    },
    securityHeaders: {
      contentSecurityPolicy: typeof headerRes.evidence.contentSecurityPolicy === 'string' ? headerRes.evidence.contentSecurityPolicy : (headerRes.evidence.contentSecurityPolicy ? 'present' : 'missing'),
      strictTransportSecurity: typeof headerRes.evidence.strictTransportSecurity === 'string' ? headerRes.evidence.strictTransportSecurity : (headerRes.evidence.strictTransportSecurity ? 'present' : 'missing'),
      xContentTypeOptions: typeof headerRes.evidence.xContentTypeOptions === 'string' ? headerRes.evidence.xContentTypeOptions : (headerRes.evidence.xContentTypeOptions ? 'present' : 'missing'),
      xFrameOptions: typeof headerRes.evidence.xFrameOptions === 'string' ? headerRes.evidence.xFrameOptions : (headerRes.evidence.xFrameOptions ? 'present' : 'missing'),
      referrerPolicy: typeof headerRes.evidence.referrerPolicy === 'string' ? headerRes.evidence.referrerPolicy : (headerRes.evidence.referrerPolicy ? 'present' : 'missing'),
      permissionsPolicy: typeof headerRes.evidence.permissionsPolicy === 'string' ? headerRes.evidence.permissionsPolicy : (headerRes.evidence.permissionsPolicy ? 'present' : 'missing'),
    },
    urlSignals: patternRes.urlSignalsList,
    domain: {
      age: domainRes.age,
    },
  };

  // Stage 8: Gemini AI Explanation
  onStageUpdate?.('generating_ai', 'Generating AI explanation from evidence...', 'in_progress');
  const geminiPayload = {
    structuredEvidence,
    signals: allSignals.map((s) => ({
      severity: s.severity.toLowerCase(),
      category: s.category,
      title: s.title,
      description: s.explanation,
      evidence: s.evidence,
      source: 'technical-analysis',
    })),
    calculatedBaseScore: baseScore,
    calculatedRiskLevel: baseLevel,
  };

  const { aiAnalysis, recommendations, finalRiskScore, finalRiskLevel } =
    await generateGeminiAnalysis(geminiPayload);
  onStageUpdate?.('generating_ai', 'AI explanation complete', 'completed');

  const assessment: RiskAssessmentSummary = {
    score: finalRiskScore,
    level: finalRiskLevel,
    primaryRiskFactor: primaryFactor,
    detectedSignalsCount: allSignals.length,
    confidenceScore: 92,
  };

  const technicalEvidence: TechnicalUrlEvidence = {
    targetUrl: rawUrl,
    normalizedUrl: norm.normalized,
    hostname,
    protocol,
    port: norm.port,
    path,
    tls: tlsRes.evidence,
    http: httpRes.httpEvidence,
    redirects: httpRes.redirectEvidence,
    securityHeaders: headerRes.evidence,
    dns: dnsRes.evidence,
    urlPatterns: patternRes.evidence,
    domain: domainRes,
    structured: structuredEvidence,
    isSimulatedTelemetry: false, // REAL live technical evidence
  };

  const reportId = `rep_${randomUUID().slice(0, 10)}`;
  const report: AnalysisReport = {
    id: reportId,
    createdAt: new Date().toISOString(),
    type: 'url',
    target: norm.normalized,
    displayTarget: hostname,
    assessment,
    signals: allSignals,
    aiAnalysis,
    recommendations,
    technicalEvidence,
    structuredEvidence,
  };

  reportStore.set(report);
  return report;
}

export async function runMessageAnalysis(rawText: string): Promise<AnalysisReport> {
  const trimmed = (rawText || '').trim();
  if (!trimmed || trimmed.length < 5) {
    throw new Error('Message text must be at least 5 characters long for risk analysis');
  }

  const textRes = analyzeMessageText(trimmed);
  const allSignals = textRes.signals;

  const { score: baseScore, level: baseLevel, primaryFactor } = calculateRiskScore(allSignals);

  const geminiPayload = {
    structuredEvidence: {
      type: 'message',
      rawLength: textRes.evidence.rawLength,
      containsLinksCount: textRes.evidence.containsLinks.length,
      urgencyIndicators: textRes.evidence.urgencyIndicators,
      paymentPressure: textRes.evidence.paymentPressureKeywords,
      impersonationCues: textRes.evidence.impersonationKeywords,
      credentialHarvesting: textRes.evidence.credentialHarvestingKeywords,
      sentimentIntensity: textRes.evidence.sentimentIntensity,
    },
    signals: allSignals.map((s) => ({
      severity: s.severity.toLowerCase(),
      category: s.category,
      title: s.title,
      description: s.explanation,
      evidence: s.evidence,
      source: 'text-analysis',
    })),
    calculatedBaseScore: baseScore,
    calculatedRiskLevel: baseLevel,
  };

  const { aiAnalysis, recommendations, finalRiskScore, finalRiskLevel } =
    await generateGeminiAnalysis(geminiPayload);

  const assessment: RiskAssessmentSummary = {
    score: finalRiskScore,
    level: finalRiskLevel,
    primaryRiskFactor: primaryFactor,
    detectedSignalsCount: allSignals.length,
    confidenceScore: 88,
  };

  const reportId = `msg_${randomUUID().slice(0, 10)}`;
  const displayTarget = trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed;

  const report: AnalysisReport = {
    id: reportId,
    createdAt: new Date().toISOString(),
    type: 'message',
    target: trimmed,
    displayTarget,
    assessment,
    signals: allSignals,
    aiAnalysis,
    recommendations,
    textualEvidence: textRes.evidence,
  };

  reportStore.set(report);
  return report;
}

/**
 * Calculates a baseline score based strictly on technical & lexical signals.
 */
function calculateRiskScore(signals: SecuritySignal[]): {
  score: number;
  level: RiskLevel;
  primaryFactor: string;
} {
  let scoreAccumulator = 10; // Baseline neutral score

  for (const signal of signals) {
    switch (signal.severity) {
      case 'CRITICAL':
        scoreAccumulator += 35;
        break;
      case 'HIGH':
        scoreAccumulator += 20;
        break;
      case 'MEDIUM':
        scoreAccumulator += 10;
        break;
      case 'LOW':
        scoreAccumulator += 4;
        break;
      case 'INFORMATIONAL':
        // Informational signals do not add penalty score
        break;
    }
  }

  // Bounds: 8 to 95 (never 100% scam proof, always automated assessment)
  const score = Math.max(8, Math.min(95, scoreAccumulator));

  let level: RiskLevel = 'LOW RISK';
  if (score >= 75) {
    level = 'HIGH RISK';
  } else if (score >= 45) {
    level = 'MODERATE RISK';
  }

  const topSignal =
    signals.find((s) => s.severity === 'CRITICAL') ||
    signals.find((s) => s.severity === 'HIGH') ||
    signals.find((s) => s.severity === 'MEDIUM') ||
    signals[0];

  const primaryFactor = topSignal
    ? topSignal.title
    : 'No acute technical anomalies identified in observable surface telemetry';

  return { score, level, primaryFactor };
}
