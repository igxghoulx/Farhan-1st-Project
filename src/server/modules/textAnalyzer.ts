/**
 * Text / Message / Email Security Signal Analyzer
 * Analyzes unstructured messages, SMS, emails, and online offers for behavioral lures,
 * urgency triggers, irreversible payment demands, and credential solicitations.
 */

import { SecuritySignal, TextualEvidence } from '../../types/analysis.js';

export interface TextAnalysisResult {
  evidence: TextualEvidence;
  signals: SecuritySignal[];
}

const URGENCY_PATTERNS = [
  { regex: /\b(?:urgent|immediately|immediate|act now|within 24 hours|within 1 hour|within 12 hours|expires today|final notice|last warning|account suspended|temporarily locked|restricted immediately)\b/gi, label: 'Immediate time pressure' },
  { regex: /\b(?:legal action|arrest warrant|law enforcement|court notice|subpoena|penalty fee)\b/gi, label: 'Legal coercion / threat' },
  { regex: /\b(?:action required|security alert|unauthorized login attempt|compromised account)\b/gi, label: 'Simulated security alert' },
];

const PAYMENT_PRESSURE_PATTERNS = [
  { regex: /\b(?:bitcoin|btc|ethereum|eth|usdt|cryptocurrency|crypto wallet|seed phrase|private key)\b/gi, label: 'Cryptocurrency / Irreversible asset' },
  { regex: /\b(?:gift card|apple gift card|itunes card|google play card|steam card|amazon gift card|vanilla visa)\b/gi, label: 'Gift card payment demand' },
  { regex: /\b(?:wire transfer|western union|moneygram|zelle|cashapp|venmo non-business|friends and family)\b/gi, label: 'Irreversible P2P or wire method' },
  { regex: /\b(?:processing fee|clearance fee|customs fee|advance fee|release fee)\b/gi, label: 'Advance payment requirement' },
];

const IMPERSONATION_PATTERNS = [
  { regex: /\b(?:internal revenue service|irs|hmrc|tax refund|treasury department|federal reserve)\b/gi, label: 'Government / Tax authority' },
  { regex: /\b(?:geek squad|norton antivirus|mcafee security|microsoft support|apple support|tech support)\b/gi, label: 'Tech support / Antivirus refund' },
  { regex: /\b(?:usps|ups|dhl|fedex|postal service|package delivery failure|unpaid customs|reschedule delivery)\b/gi, label: 'Courier / Package delivery lure' },
  { regex: /\b(?:paypal|chase bank|wells fargo|bank of america|citibank|fraud prevention team)\b/gi, label: 'Financial institution fraud team' },
  { regex: /\b(?:dear customer|dear user|dear client|dear account holder|valued customer)\b/gi, label: 'Generic depersonalized salutation' },
];

const CREDENTIAL_HARVESTING_PATTERNS = [
  { regex: /\b(?:one-time code|one time password|otp|verification code|2fa code|security code)\b/gi, label: 'OTP / 2FA code solicitation' },
  { regex: /\b(?:password|passcode|pin number|social security|ssn|mother's maiden name)\b/gi, label: 'Direct credential / identity solicitation' },
  { regex: /\b(?:12-word|24-word|recovery phrase|secret recovery phrase)\b/gi, label: 'Cryptographic recovery phrase' },
];

export function analyzeMessageText(text: string): TextAnalysisResult {
  const signals: SecuritySignal[] = [];
  const trimmed = (text || '').trim();

  // Extract embedded URLs
  const urlRegex = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*/gi;
  const embeddedLinks = trimmed.match(urlRegex) || [];

  // 1. Urgency Indicators
  const urgencyFound: string[] = [];
  for (const { regex, label } of URGENCY_PATTERNS) {
    if (regex.test(trimmed)) {
      urgencyFound.push(label);
    }
  }

  if (urgencyFound.length > 0) {
    signals.push({
      id: 'text-urgency-pressure',
      severity: urgencyFound.length >= 2 ? 'HIGH' : 'MEDIUM',
      title: 'Psychological urgency and artificial deadline cues',
      explanation: 'Message conveys acute time pressure or punitive consequences. Coercive urgency is widely engineered to prompt impulsive reactions before recipients can independently verify authenticity.',
      evidence: `Detected urgency indicators: ${urgencyFound.join(', ')}`,
      category: 'behavioral',
      confidence: 'High',
    });
  }

  // 2. Payment Pressure
  const paymentFound: string[] = [];
  for (const { regex, label } of PAYMENT_PRESSURE_PATTERNS) {
    if (regex.test(trimmed)) {
      paymentFound.push(label);
    }
  }

  if (paymentFound.length > 0) {
    signals.push({
      id: 'text-payment-pressure',
      severity: 'HIGH',
      title: 'Requests for irreversible or non-standard payment methods',
      explanation: 'Requests for cryptocurrency transfers, gift card codes, or wire transactions remove conventional consumer chargeback protections, significantly elevating financial exposure.',
      evidence: `Detected payment mechanisms: ${paymentFound.join(', ')}`,
      category: 'content',
      confidence: 'High',
    });
  }

  // 3. Impersonation Cues
  const impersonationFound: string[] = [];
  for (const { regex, label } of IMPERSONATION_PATTERNS) {
    if (regex.test(trimmed)) {
      impersonationFound.push(label);
    }
  }

  if (impersonationFound.length > 0) {
    signals.push({
      id: 'text-impersonation-markers',
      severity: 'MEDIUM',
      title: 'Common entity impersonation or generic salutation patterns',
      explanation: 'Text references recognized institutions (courier services, banks, tax agencies, or tech support) or utilizes depersonalized generic greetings characteristic of automated mass-phishing campaigns.',
      evidence: `Entities/patterns identified: ${impersonationFound.join(', ')}`,
      category: 'content',
      confidence: 'Medium',
    });
  }

  // 4. Credential & OTP solicitation
  const credentialFound: string[] = [];
  for (const { regex, label } of CREDENTIAL_HARVESTING_PATTERNS) {
    if (regex.test(trimmed)) {
      credentialFound.push(label);
    }
  }

  if (credentialFound.length > 0) {
    signals.push({
      id: 'text-credential-harvesting',
      severity: 'CRITICAL',
      title: 'Direct solicitation of authentication credentials or OTP codes',
      explanation: 'Message solicits passwords, 2FA codes, PIN numbers, or private recovery phrases. Legitimate organizations never request one-time security passcodes via unsolicited inbound messages.',
      evidence: `Sensitive authentication items requested: ${credentialFound.join(', ')}`,
      category: 'behavioral',
      confidence: 'High',
    });
  }

  // 5. Embedded external links
  if (embeddedLinks.length > 0) {
    signals.push({
      id: 'text-embedded-links',
      severity: 'INFORMATIONAL',
      title: 'Embedded destination links present in message body',
      explanation: 'Unsolicited messages directing users to click external links carry heightened risks of session hijacking or fake credential landing pages.',
      evidence: `Found ${embeddedLinks.length} embedded link(s): ${embeddedLinks.slice(0, 2).join(', ')}${embeddedLinks.length > 2 ? ' ...' : ''}`,
      category: 'technical',
      confidence: 'High',
    });
  }

  // 6. Formatting / Emotion intensity
  const exclamationCount = (trimmed.match(/!/g) || []).length;
  const uppercaseRatio = trimmed.length > 20
    ? (trimmed.match(/[A-Z]/g) || []).length / trimmed.length
    : 0;

  const formatAnomaly = exclamationCount >= 4 || uppercaseRatio > 0.45;
  if (formatAnomaly) {
    signals.push({
      id: 'text-formatting-alarmist',
      severity: 'LOW',
      title: 'Heightened typographical emphasis / Alarmist tone',
      explanation: 'Repetitive capitalization and excessive punctuation are frequently employed in social engineering lures to heighten anxiety and bypass critical evaluation.',
      evidence: `Detected ${exclamationCount} exclamation marks, ${(uppercaseRatio * 100).toFixed(0)}% uppercase characters`,
      category: 'behavioral',
      confidence: 'Medium',
    });
  }

  const sentimentIntensity: 'neutral' | 'high_urgency' | 'fear_appeal' =
    urgencyFound.length >= 2 || credentialFound.length > 0
      ? 'fear_appeal'
      : urgencyFound.length > 0
      ? 'high_urgency'
      : 'neutral';

  const evidence: TextualEvidence = {
    rawLength: trimmed.length,
    containsLinks: embeddedLinks,
    urgencyIndicators: urgencyFound,
    paymentPressureKeywords: paymentFound,
    impersonationKeywords: impersonationFound,
    credentialHarvestingKeywords: credentialFound,
    sentimentIntensity,
    formatAnomalyDetected: formatAnomaly,
  };

  return { evidence, signals };
}
