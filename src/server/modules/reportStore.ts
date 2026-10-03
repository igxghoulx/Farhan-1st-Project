/**
 * Report Storage Module (In-Memory V1 Repository)
 * Preloads realistic demo sample scans and caches active user scans.
 * In accordance with privacy requirements, reports are held ephemeral in memory.
 */

import { AnalysisReport } from '../../types/analysis.js';

class ReportStore {
  private reports = new Map<string, AnalysisReport>();

  constructor() {
    this.seedDemoReports();
  }

  public get(id: string): AnalysisReport | undefined {
    return this.reports.get(id);
  }

  public set(report: AnalysisReport): void {
    // Keep max 200 items in memory
    if (this.reports.size > 200) {
      const oldestKey = this.reports.keys().next().value;
      if (oldestKey) this.reports.delete(oldestKey);
    }
    this.reports.set(report.id, report);
  }

  public getSampleReports(): AnalysisReport[] {
    return Array.from(this.reports.values()).filter((r) => r.isDemoSample);
  }

  private seedDemoReports(): void {
    // 1. Phishing Bank Clone Sample
    const bankCloneReport: AnalysisReport = {
      id: 'sample-bank-phish',
      createdAt: new Date().toISOString(),
      type: 'url',
      target: 'https://chase-security-verification.online/login/auth',
      displayTarget: 'chase-security-verification.online',
      isDemoSample: true,
      assessment: {
        score: 84,
        level: 'HIGH RISK',
        primaryRiskFactor: 'Suspected brand impersonation with credential harvesting lure',
        detectedSignalsCount: 5,
        confidenceScore: 92,
      },
      signals: [
        {
          id: 'sig-1',
          severity: 'CRITICAL',
          title: 'Potential brand impersonation heuristic: Chase',
          explanation: 'The hostname incorporates the brand term "Chase", but the root registrar does not resolve to the authenticated official domain (chase.com).',
          evidence: 'Domain "chase-security-verification.online" contains brand identifier "Chase" without matching "chase.com"',
          category: 'content',
          confidence: 'High',
        },
        {
          id: 'sig-2',
          severity: 'HIGH',
          title: 'Credential harvesting or security lure pattern',
          explanation: 'URL path and query parameters reference high-sensitivity account actions alongside a third-party brand marker, characteristic of deceptive login portals.',
          evidence: 'Sensitive action parameters detected: login, auth, verification',
          category: 'behavioral',
          confidence: 'High',
        },
        {
          id: 'sig-3',
          severity: 'MEDIUM',
          title: 'Missing core defensive browser security headers',
          explanation: 'Several standard browser security headers were not detected. Absence of these headers weakens resistance against clickjacking, cross-site scripting (XSS), and MIME-sniffing exploits.',
          evidence: 'Missing: Strict-Transport-Security, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options',
          category: 'technical',
          confidence: 'High',
        },
        {
          id: 'sig-4',
          severity: 'LOW',
          title: 'Short remaining TLS validity window',
          explanation: 'The detected certificate was provisioned on an automated short-lifecycle issuer. Commonly observed on short-lived disposable domains.',
          evidence: 'Certificate validity window: 14 days remaining from Free Automated DV CA',
          category: 'technical',
          confidence: 'Medium',
        },
        {
          id: 'sig-5',
          severity: 'INFORMATIONAL',
          title: 'HTTPS encryption enabled',
          explanation: 'The connection between browser and server is encrypted. However, HTTPS alone does not establish that an organization or website operator is legitimate or safe.',
          evidence: 'Valid TLSv1.3 connection using Free Automated DV CA (90-Day Ephemeral)',
          category: 'technical',
          confidence: 'High',
        },
      ],
      aiAnalysis: {
        overview: 'TrustLens identified multiple high-consequence signals indicating elevated risk. The destination mimics an established financial institution while utilizing an unauthenticated non-bank root domain.',
        technicalContext: 'Technical telemetry reveals missing defensive headers (CSP, HSTS, X-Frame-Options) and an automated short-lived TLS certificate. While encryption is present, the domain architecture diverges completely from Chase banking infrastructure.',
        behavioralContext: 'The domain name constructs an urgency-oriented narrative ("security-verification") alongside auth path tokens, designed to induce panic and solicit authentication credentials.',
        limitations: 'Automated surface heuristics analyze observable domain and header attributes. TrustLens does not access private banking databases or confirm individual actor intent.',
        modelUsed: 'Gemini 3.8 Flash (Grounding on observable telemetry)',
      },
      recommendations: [
        {
          id: 'rec-1',
          action: 'Do not enter bank account credentials, PINs, or security questions',
          rationale: 'The page appears designed to collect banking authentication material on an unverified third-party host.',
          priority: 'Immediate',
        },
        {
          id: 'rec-2',
          action: 'Navigate directly to chase.com by typing the URL manually',
          rationale: 'Never follow security verification links delivered via unexpected emails or SMS text messages.',
          priority: 'Immediate',
        },
        {
          id: 'rec-3',
          action: 'Report the link to the official financial institution fraud department',
          rationale: 'Official security operations can request domain registrar suspension to protect other consumers.',
          priority: 'Important',
        },
      ],
      technicalEvidence: {
        targetUrl: 'https://chase-security-verification.online/login/auth',
        normalizedUrl: 'https://chase-security-verification.online/login/auth',
        hostname: 'chase-security-verification.online',
        protocol: 'https',
        port: null,
        path: '/login/auth',
        tls: {
          enabled: true,
          protocol: 'TLSv1.3',
          issuer: 'Free Automated DV CA (90-Day Ephemeral)',
          validDaysRemaining: 14,
          isSelfSigned: false,
          subjectAltNamesCount: 1,
        },
        http: {
          statusCode: 200,
          server: 'nginx/generic-reverse-proxy',
          responseMs: 480,
          contentType: 'text/html; charset=utf-8',
          redirectCount: 0,
        },
        redirects: {
          redirectCount: 0,
          initialProtocol: 'https',
          finalProtocol: 'https',
          crossDomainRedirect: false,
          chain: ['https://chase-security-verification.online/login/auth'],
        },
        securityHeaders: {
          contentSecurityPolicy: false,
          strictTransportSecurity: false,
          xFrameOptions: false,
          xContentTypeOptions: false,
          referrerPolicy: false,
          permissionsPolicy: false,
        },
        dns: {
          resolvedIps: ['104.21.34.112', '172.67.188.42'],
          hasMxRecord: false,
          hasSpfRecord: false,
          hasDmarcRecord: false,
          nameservers: ['ns1.domaincontrol-chas.net', 'ns2.domaincontrol-chas.net'],
        },
        urlPatterns: {
          isIpAddress: false,
          hasPunycodeOrIdn: false,
          hasSuspiciousPort: false,
          suspiciousKeywordsFound: ['login', 'auth', 'verification'],
          brandSpoofRisk: 'Chase',
          excessiveSubdomains: false,
          tldRisk: 'Elevated',
          hasUrlShortener: false,
          hasUserInfoInUrl: false,
        },
        isSimulatedTelemetry: false,
      },
    };

    // 2. Urgent Package Delivery SMS Sample
    const packageSmsReport: AnalysisReport = {
      id: 'sample-package-sms',
      createdAt: new Date().toISOString(),
      type: 'message',
      target: 'FINAL NOTICE: Your USPS parcel #US984219 could not be delivered due to an incorrect house number. A $1.85 redelivery fee is required within 12 hours or package will be returned to sender: https://usps-redelivery-portal.xyz',
      displayTarget: 'USPS Delivery Failure & Fee Lure SMS',
      isDemoSample: true,
      assessment: {
        score: 79,
        level: 'HIGH RISK',
        primaryRiskFactor: 'Urgency-driven delivery fee lure with suspicious TLD link',
        detectedSignalsCount: 4,
        confidenceScore: 89,
      },
      signals: [
        {
          id: 'sig-m1',
          severity: 'HIGH',
          title: 'Psychological urgency and artificial deadline cues',
          explanation: 'Message conveys acute time pressure or punitive consequences ("FINAL NOTICE", "within 12 hours").',
          evidence: 'Detected urgency indicators: Immediate time pressure, Simulated security alert',
          category: 'behavioral',
          confidence: 'High',
        },
        {
          id: 'sig-m2',
          severity: 'HIGH',
          title: 'Common entity impersonation or generic salutation patterns',
          explanation: 'Text references courier services (USPS) to exploit common consumer expectations for shipping updates.',
          evidence: 'Entities/patterns identified: Courier / Package delivery lure (USPS)',
          category: 'content',
          confidence: 'High',
        },
        {
          id: 'sig-m3',
          severity: 'MEDIUM',
          title: 'Advance fee requirement disguised as micro-payment',
          explanation: 'Small payment demands ($1.85 redelivery fee) are commonly used to capture credit card numbers and CVV security codes.',
          evidence: 'Advance payment requirement: $1.85 redelivery fee requested',
          category: 'content',
          confidence: 'High',
        },
        {
          id: 'sig-m4',
          severity: 'INFORMATIONAL',
          title: 'Embedded destination links present in message body',
          explanation: 'Unsolicited messages directing users to click external links carry heightened risks.',
          evidence: 'Found 1 embedded link: https://usps-redelivery-portal.xyz',
          category: 'technical',
          confidence: 'High',
        },
      ],
      aiAnalysis: {
        overview: 'TrustLens detected classic characteristics of package delivery smishing. The combination of courier brand reference, artificial countdown timer, and small fee solicitation presents significant risk indicators.',
        technicalContext: 'The included destination link points to a disposable .xyz domain rather than the authenticated usps.com domain.',
        behavioralContext: 'The message relies on loss aversion (threat of package return) and low-friction payment ($1.85) to bypass recipient skepticism.',
        limitations: 'TrustLens does not check real USPS tracking databases. This assessment is based strictly on observable text structure and behavioral heuristics.',
        modelUsed: 'Gemini 3.8 Flash (Grounding on observable telemetry)',
      },
      recommendations: [
        {
          id: 'rec-m1',
          action: 'Do not click the provided link or provide credit card information',
          rationale: 'Small fee prompts are a standard technique to siphon payment card numbers.',
          priority: 'Immediate',
        },
        {
          id: 'rec-m2',
          action: 'Verify tracking status directly at usps.com using your official merchant receipt',
          rationale: 'Legitimate postal carriers do not charge redelivery fees via SMS text links.',
          priority: 'Immediate',
        },
      ],
      textualEvidence: {
        rawLength: 226,
        containsLinks: ['https://usps-redelivery-portal.xyz'],
        urgencyIndicators: ['Immediate time pressure', 'Simulated security alert'],
        paymentPressureKeywords: ['Advance payment requirement'],
        impersonationKeywords: ['Courier / Package delivery lure'],
        credentialHarvestingKeywords: [],
        sentimentIntensity: 'high_urgency',
        formatAnomalyDetected: false,
      },
    };

    // 3. Legitimate Domain Sample
    const legitDomainReport: AnalysisReport = {
      id: 'sample-legit-site',
      createdAt: new Date().toISOString(),
      type: 'url',
      target: 'https://github.com',
      displayTarget: 'github.com',
      isDemoSample: true,
      assessment: {
        score: 12,
        level: 'LOW RISK',
        primaryRiskFactor: 'Robust enterprise security posture and established domain identity',
        detectedSignalsCount: 2,
        confidenceScore: 95,
      },
      signals: [
        {
          id: 'sig-legit-1',
          severity: 'INFORMATIONAL',
          title: 'Comprehensive browser security headers enforced',
          explanation: 'Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), and anti-clickjacking frame controls are active.',
          evidence: 'HSTS max-age=31536000, CSP configured, X-Frame-Options DENY',
          category: 'technical',
          confidence: 'High',
        },
        {
          id: 'sig-legit-2',
          severity: 'INFORMATIONAL',
          title: 'HTTPS encryption enabled',
          explanation: 'The connection is encrypted using valid certificates from an established public Certificate Authority.',
          evidence: 'TLSv1.3 DigiCert High Assurance TLS Root',
          category: 'technical',
          confidence: 'High',
        },
      ],
      aiAnalysis: {
        overview: 'TrustLens identified standard enterprise security protections. Observable infrastructure reflects defensive headers, authenticated domain registration, and valid transport encryption.',
        technicalContext: 'Domain exhibits full HSTS coverage, strong TLS 1.3 configuration, and established DNS infrastructure with published email authentication records.',
        behavioralContext: 'No brand impersonation patterns or deceptive URL tokens were detected.',
        limitations: 'Surface telemetry indicates strong technical hygiene. Automated scans cannot guarantee that third-party user-generated content hosted on large platforms is safe.',
        modelUsed: 'Gemini 3.8 Flash (Grounding on observable telemetry)',
      },
      recommendations: [
        {
          id: 'rec-legit-1',
          action: 'Maintain standard account security and enable two-factor authentication',
          rationale: 'Even on highly secure platforms, individual account credentials must be defended against reuse.',
          priority: 'Standard Advisory',
        },
      ],
      technicalEvidence: {
        targetUrl: 'https://github.com',
        normalizedUrl: 'https://github.com',
        hostname: 'github.com',
        protocol: 'https',
        port: null,
        path: '/',
        tls: {
          enabled: true,
          protocol: 'TLSv1.3',
          issuer: 'DigiCert Global Root G2',
          validDaysRemaining: 265,
          isSelfSigned: false,
          subjectAltNamesCount: 12,
        },
        http: {
          statusCode: 200,
          server: 'github-gateway',
          responseMs: 85,
          contentType: 'text/html; charset=utf-8',
          redirectCount: 0,
        },
        redirects: {
          redirectCount: 0,
          initialProtocol: 'https',
          finalProtocol: 'https',
          crossDomainRedirect: false,
          chain: ['https://github.com'],
        },
        securityHeaders: {
          contentSecurityPolicy: true,
          strictTransportSecurity: true,
          xFrameOptions: true,
          xContentTypeOptions: true,
          referrerPolicy: true,
          permissionsPolicy: true,
        },
        dns: {
          resolvedIps: ['140.82.121.4'],
          hasMxRecord: true,
          hasSpfRecord: true,
          hasDmarcRecord: true,
          nameservers: ['dns1.p08.nsone.net', 'dns2.p08.nsone.net'],
        },
        urlPatterns: {
          isIpAddress: false,
          hasPunycodeOrIdn: false,
          hasSuspiciousPort: false,
          suspiciousKeywordsFound: [],
          brandSpoofRisk: null,
          excessiveSubdomains: false,
          tldRisk: 'Standard',
          hasUrlShortener: false,
          hasUserInfoInUrl: false,
        },
        isSimulatedTelemetry: false,
      },
    };

    this.reports.set(bankCloneReport.id, bankCloneReport);
    this.reports.set(packageSmsReport.id, packageSmsReport);
    this.reports.set(legitDomainReport.id, legitDomainReport);
  }
}

export const reportStore = new ReportStore();
