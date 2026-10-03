/**
 * TrustLens AI - Core Domain Types
 * Principles:
 * 1. Observable Evidence -> Security Signals -> Structured Data -> Gemini Explanation -> Risk Assessment
 * 2. Never definitive "scam proof", always "Automated Risk Assessment" based on observable indicators.
 * 3. Clearly distinguish "present", "missing", and "unavailable" states.
 */

export type TargetType = 'url' | 'message';

export type SignalSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type RiskLevel = 'CRITICAL RISK' | 'HIGH RISK' | 'MODERATE RISK' | 'LOW RISK' | 'INFORMATIONAL';

export type TriState = 'present' | 'missing' | 'unavailable';

export interface SecuritySignal {
  id: string;
  severity: SignalSeverity;
  title: string;
  explanation: string;
  description?: string;
  evidence: string;
  category: 'technical' | 'content' | 'reputation' | 'infrastructure' | 'behavioral' | 'hardening' | 'transport' | 'url_structure';
  confidence?: 'High' | 'Medium' | 'Low';
  source?: 'technical-analysis' | 'text-analysis';
}

export interface SecurityHeadersEvidence {
  contentSecurityPolicy: TriState | boolean;
  strictTransportSecurity: TriState | boolean;
  xFrameOptions: TriState | boolean;
  xContentTypeOptions: TriState | boolean;
  referrerPolicy: TriState | boolean;
  permissionsPolicy: TriState | boolean;
  details?: Record<string, string | null>;
}

export interface DnsEvidence {
  resolvedIps: string[];
  hasMxRecord: boolean | 'unavailable';
  hasSpfRecord: boolean | 'unavailable';
  hasDmarcRecord: boolean | 'unavailable';
  nameservers: string[];
  a?: string[] | 'unavailable';
  aaaa?: string[] | 'unavailable';
  cname?: string[] | 'unavailable';
  mx?: string[] | 'unavailable';
  dnssecEnabled?: boolean | 'unavailable';
  status?: 'resolved' | 'unavailable' | 'nxdomain';
}

export interface TlsEvidence {
  enabled: boolean | 'unavailable';
  https?: boolean | 'unavailable';
  certificateValid?: boolean | 'unavailable';
  protocol?: string | 'unavailable';
  issuer?: string | 'unavailable';
  subject?: string | 'unavailable';
  expiresAt?: string | 'unavailable';
  validDaysRemaining?: number | 'unavailable';
  isSelfSigned?: boolean | 'unavailable';
  subjectAltNamesCount?: number | 'unavailable';
  error?: string | null;
}

export interface HttpEvidence {
  statusCode: number | 'unavailable';
  server?: string | 'unavailable';
  responseMs?: number | 'unavailable';
  responseTimeMs?: number | 'unavailable';
  contentType?: string | 'unavailable';
  contentLength?: number | 'unavailable';
  finalUrl?: string | 'unavailable';
  redirectCount: number;
}

export interface RedirectEvidence {
  redirectCount: number;
  initialProtocol: string;
  finalProtocol: string;
  crossDomainRedirect: boolean;
  chain: string[];
}

export interface UrlPatternEvidence {
  isIpAddress: boolean;
  hasPunycodeOrIdn: boolean;
  hasSuspiciousPort: boolean;
  suspiciousKeywordsFound: string[];
  brandSpoofRisk: string | null;
  excessiveSubdomains: boolean;
  tldRisk: 'Standard' | 'Elevated' | 'High-Risk TLD';
  hasUrlShortener: boolean;
  hasUserInfoInUrl: boolean;
  excessiveHyphens?: boolean;
  longHostname?: boolean;
  signals?: string[];
}

export interface DomainEvidence {
  age: string | 'unavailable';
  createdDate?: string | 'unavailable';
  registrar?: string | 'unavailable';
  provider?: string;
}

export interface StructuredUrlAnalysis {
  target: {
    inputUrl: string;
    normalizedUrl: string;
    hostname: string;
    port?: number | null;
  };
  http: {
    statusCode: number | 'unavailable';
    responseTimeMs: number | 'unavailable';
    redirectCount: number;
    finalUrl: string | 'unavailable';
    contentType?: string | 'unavailable';
    server?: string | 'unavailable';
    contentLength?: number | 'unavailable';
  };
  tls: {
    https: boolean | 'unavailable';
    certificateValid: boolean | 'unavailable';
    issuer: string | 'unavailable';
    subject?: string | 'unavailable';
    expiresAt: string | 'unavailable';
    protocol?: string | 'unavailable';
    validDaysRemaining?: number | 'unavailable';
    isSelfSigned?: boolean | 'unavailable';
  };
  dns: {
    a: string[] | 'unavailable';
    aaaa: string[] | 'unavailable';
    cname: string[] | 'unavailable';
    mx?: string[] | 'unavailable';
  };
  securityHeaders: {
    contentSecurityPolicy: TriState;
    strictTransportSecurity: TriState;
    xContentTypeOptions: TriState;
    xFrameOptions: TriState;
    referrerPolicy: TriState;
    permissionsPolicy: TriState;
  };
  urlSignals: string[];
  domain: {
    age: string | 'unavailable';
  };
}

export interface TechnicalUrlEvidence {
  targetUrl: string;
  normalizedUrl: string;
  hostname: string;
  protocol: string;
  port: number | null;
  path: string;
  tls: TlsEvidence;
  http: HttpEvidence;
  redirects: RedirectEvidence;
  securityHeaders: SecurityHeadersEvidence;
  dns: DnsEvidence;
  urlPatterns: UrlPatternEvidence;
  domain?: DomainEvidence;
  structured?: StructuredUrlAnalysis;
  isSimulatedTelemetry: boolean; // false when real technical engine runs
}

export interface TextualEvidence {
  rawLength: number;
  containsLinks: string[];
  urgencyIndicators: string[];
  paymentPressureKeywords: string[];
  impersonationKeywords: string[];
  credentialHarvestingKeywords: string[];
  sentimentIntensity: 'neutral' | 'high_urgency' | 'fear_appeal';
  formatAnomalyDetected: boolean;
}

export interface RiskAssessmentSummary {
  score: number; // 0 - 100
  level: RiskLevel;
  primaryRiskFactor: string;
  detectedSignalsCount: number;
  confidenceScore: number;
}

export interface AIAnalysisOutput {
  overview: string;
  technicalContext: string;
  behavioralContext: string;
  limitations: string;
  modelUsed: string;
  keyFindings?: string[];
}

export interface SafetyRecommendation {
  id: string;
  action: string;
  rationale: string;
  priority: 'Immediate' | 'Important' | 'Standard Advisory';
}

export interface AnalysisReport {
  id: string;
  createdAt: string;
  type: TargetType;
  target: string;
  displayTarget: string;
  assessment: RiskAssessmentSummary;
  signals: SecuritySignal[];
  aiAnalysis: AIAnalysisOutput;
  recommendations: SafetyRecommendation[];
  technicalEvidence?: TechnicalUrlEvidence;
  textualEvidence?: TextualEvidence;
  structuredEvidence?: StructuredUrlAnalysis;
  isDemoSample?: boolean;
}

export interface AnalysisRequest {
  target: string;
  type: TargetType;
}

export interface ScanStageUpdate {
  stageId: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'unavailable';
  detail?: string;
}
