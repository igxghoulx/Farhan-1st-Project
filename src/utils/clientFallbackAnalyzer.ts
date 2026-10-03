import { AnalysisReport, SecuritySignal, TargetType } from '../types/analysis.js';

const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'verification', 'secure', 'account', 'banking', 'update',
  'billing', 'signin', 'confirm', 'password', 'wallet', 'crypto', 'bonus', 'claim',
  'urgent', 'suspended', 'locked', 'free-gift', 'redelivery', 'invoice'
];

const KNOWN_BRANDS = [
  'paypal', 'chase', 'bankofamerica', 'wellsfargo', 'citibank', 'apple',
  'microsoft', 'amazon', 'netflix', 'google', 'usps', 'fedex', 'dhl', 'ups'
];

export function runClientSideUrlAnalysis(inputUrl: string): AnalysisReport {
  let normalized = inputUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error('Please enter a valid URL.');
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();
  const protocol = parsed.protocol.replace(':', '');

  const signals: SecuritySignal[] = [];
  let score = 15;

  // 1. Insecure HTTP check
  if (protocol === 'http') {
    score += 25;
    signals.push({
      id: 'c-http',
      severity: 'HIGH',
      title: 'Cleartext HTTP Protocol Detected',
      explanation: 'Website transmits data unencrypted without TLS. Data can be intercepted by anyone on local network or Wi-Fi.',
      evidence: `Protocol is http:// on ${hostname}`,
      category: 'transport',
      confidence: 'High',
    });
  } else {
    signals.push({
      id: 'c-https',
      severity: 'INFORMATIONAL',
      title: 'HTTPS Encryption Present',
      explanation: 'Connection is configured with HTTPS. Note: HTTPS indicates connection privacy, not website honesty.',
      evidence: 'Protocol is https://',
      category: 'transport',
      confidence: 'High',
    });
  }

  // 2. Punycode check
  if (hostname.includes('xn--')) {
    score += 40;
    signals.push({
      id: 'c-punycode',
      severity: 'CRITICAL',
      title: 'Punycode Internationalized Homoglyph Detected',
      explanation: 'Hostname uses ASCII-compatible encoding (xn--) for Unicode characters, often used in lookalike spoofing attacks.',
      evidence: `Hostname contains xn--: ${hostname}`,
      category: 'infrastructure',
      confidence: 'High',
    });
  }

  // 3. IP address hostname
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    score += 35;
    signals.push({
      id: 'c-ip',
      severity: 'HIGH',
      title: 'Direct IP Address Hostname',
      explanation: 'Website is referenced by raw numeric IP address rather than a registered domain name.',
      evidence: `Target host is numeric IP: ${hostname}`,
      category: 'infrastructure',
      confidence: 'High',
    });
  }

  // 4. Excessive subdomains or hyphens
  const subdomains = hostname.split('.');
  if (subdomains.length > 4) {
    score += 15;
    signals.push({
      id: 'c-subdomains',
      severity: 'MEDIUM',
      title: 'Excessive Subdomain Stacking',
      explanation: 'Deep subdomain nesting is frequently used to bury suspicious domains under trusted brand strings.',
      evidence: `Hostname contains ${subdomains.length} labels: ${hostname}`,
      category: 'infrastructure',
      confidence: 'Medium',
    });
  }

  const hyphenCount = (hostname.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    score += 15;
    signals.push({
      id: 'c-hyphens',
      severity: 'MEDIUM',
      title: 'Multiple Hyphens in Hostname',
      explanation: 'Multiple hyphens are commonly combined with brand keywords to generate disposable lookalikes.',
      evidence: `Found ${hyphenCount} hyphens in ${hostname}`,
      category: 'infrastructure',
      confidence: 'Medium',
    });
  }

  // 5. Brand Spoofing Check
  let matchedBrand: string | null = null;
  for (const brand of KNOWN_BRANDS) {
    if (hostname.includes(brand) && !hostname.endsWith(`.${brand}.com`) && hostname !== `${brand}.com`) {
      matchedBrand = brand;
      break;
    }
  }

  if (matchedBrand) {
    score += 35;
    signals.push({
      id: 'c-brand',
      severity: 'CRITICAL',
      title: `Suspected Brand Impersonation: ${matchedBrand.toUpperCase()}`,
      explanation: `The domain includes brand name "${matchedBrand}", but does not appear to be the official domain for that brand.`,
      evidence: `Domain "${hostname}" references brand "${matchedBrand}"`,
      category: 'content',
      confidence: 'High',
    });
  }

  // 6. Suspicious keyword lures
  const foundKeywords = SUSPICIOUS_KEYWORDS.filter(kw => pathname.includes(kw) || hostname.includes(kw));
  if (foundKeywords.length > 0) {
    score += Math.min(20, foundKeywords.length * 8);
    signals.push({
      id: 'c-keywords',
      severity: foundKeywords.length > 2 ? 'HIGH' : 'MEDIUM',
      title: 'Suspicious Security & Authentication Lures',
      evidence: `Found keywords: ${foundKeywords.join(', ')}`,
      explanation: 'URL path contains terms commonly associated with account credential verification or urgency lures.',
      category: 'behavioral',
      confidence: 'High',
    });
  }

  const finalScore = Math.min(99, Math.max(5, score));
  const level = finalScore >= 75 ? 'HIGH RISK' : finalScore >= 45 ? 'MODERATE RISK' : 'LOW RISK';

  return {
    id: `scan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    type: 'url',
    target: normalized,
    displayTarget: hostname,
    isDemoSample: false,
    assessment: {
      score: finalScore,
      level,
      primaryRiskFactor: signals[0]?.title || 'Standard Heuristic Assessment',
      detectedSignalsCount: signals.length,
      confidenceScore: 85,
    },
    signals,
    aiAnalysis: {
      overview: `Client-side evaluation analyzed ${hostname} across transport protocol, domain composition, and URL path patterns. ${
        finalScore >= 70 ? 'Multiple elevated risk indicators were observed.' : 'Standard URL structural patterns were observed.'
      } Note: Live DNS queries and TLS socket handshakes require full-stack hosting.`,
      technicalContext: `Evaluated URL syntax on ${hostname}. Protocol: ${protocol.toUpperCase()}. Path length: ${pathname.length} characters.`,
      behavioralContext: foundKeywords.length > 0
        ? `Observed lures: ${foundKeywords.join(', ')}.`
        : 'No deceptive authentication tokens detected.',
      limitations: 'This scan ran in static browser mode because the server-side Node.js backend is offline or hosted on a static-only provider (such as Netlify). Run with a Node.js server for live network probes.',
      modelUsed: 'TrustLens Client Heuristic Engine (Static Fallback)',
    },
    recommendations: [
      {
        id: 'r-1',
        action: finalScore >= 70 ? 'Do not enter passwords or credit cards on this page' : 'Verify website identity before making purchases',
        rationale: 'Follow standard defensive cyber safety hygiene.',
        priority: finalScore >= 70 ? 'Immediate' : 'Standard Advisory',
      },
    ],
  };
}

export function runClientSideMessageAnalysis(message: string): AnalysisReport {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  const signals: SecuritySignal[] = [];
  let score = 20;

  const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^\s]*)/gi;
  const urls = trimmed.match(urlRegex) || [];

  if (urls.length > 0) {
    signals.push({
      id: 'm-link',
      severity: 'MEDIUM',
      title: 'External Destination Link Detected',
      explanation: 'Message contains links directing recipient to external websites.',
      evidence: `Found ${urls.length} links: ${urls.slice(0, 2).join(', ')}`,
      category: 'technical',
      confidence: 'High',
    });
    score += 15;
  }

  const urgencyWords = ['urgent', 'immediately', 'suspended', '24 hours', 'action required', 'final notice', 'locked'];
  const matchedUrgency = urgencyWords.filter(w => lower.includes(w));
  if (matchedUrgency.length > 0) {
    score += 25;
    signals.push({
      id: 'm-urgency',
      severity: 'HIGH',
      title: 'Artificial Time Pressure & Urgency Tactics',
      explanation: 'Message uses psychological urgency to prompt immediate action before verification.',
      evidence: `Urgency keywords detected: ${matchedUrgency.join(', ')}`,
      category: 'behavioral',
      confidence: 'High',
    });
  }

  const feeWords = ['fee', 'payment', 'gift card', 'bitcoin', 'crypto', 'wire transfer', 'zelle', 'apple card', '$'];
  const matchedFees = feeWords.filter(w => lower.includes(w));
  if (matchedFees.length > 0) {
    score += 25;
    signals.push({
      id: 'm-payment',
      severity: 'HIGH',
      title: 'Payment or Fee Demand Detected',
      explanation: 'Message requests financial transactions or payment cards.',
      evidence: `Financial terms found: ${matchedFees.join(', ')}`,
      category: 'content',
      confidence: 'High',
    });
  }

  const finalScore = Math.min(99, Math.max(10, score));
  const level = finalScore >= 75 ? 'HIGH RISK' : finalScore >= 45 ? 'MODERATE RISK' : 'LOW RISK';

  return {
    id: `msg-${Date.now()}`,
    createdAt: new Date().toISOString(),
    type: 'message',
    target: trimmed,
    displayTarget: trimmed.length > 50 ? `${trimmed.slice(0, 47)}...` : trimmed,
    isDemoSample: false,
    assessment: {
      score: finalScore,
      level,
      primaryRiskFactor: signals[0]?.title || 'Message Content Assessment',
      detectedSignalsCount: signals.length,
      confidenceScore: 85,
    },
    signals,
    aiAnalysis: {
      overview: `Client-side evaluation detected ${signals.length} behavioral indicators in this message. ${
        finalScore >= 70 ? 'Extreme caution is advised.' : 'Review content carefully.'
      }`,
      technicalContext: `Extracted ${urls.length} links from message body.`,
      behavioralContext: `Detected urgency and financial cues: ${matchedUrgency.concat(matchedFees).join(', ') || 'None'}.`,
      limitations: 'Evaluation performed via browser heuristic scanner.',
      modelUsed: 'TrustLens Client Heuristic Engine (Static Fallback)',
    },
    recommendations: [
      {
        id: 'mr-1',
        action: 'Do not click links or send payment without independent verification',
        rationale: 'Contact the alleged sender through an independently confirmed phone number or app.',
        priority: 'Immediate',
      },
    ],
  };
}
