/**
 * URL Structure & Pattern Analyzer
 * Evaluates observable URL lexical attributes:
 * - excessive subdomains
 * - unusually long hostname (> 50 chars)
 * - punycode / IDN encoding (xn--)
 * - suspicious URL percent-encoding
 * - IP-address hostname
 * - misleading subdomain structure (e.g. brand in subdomain)
 * - excessive hyphens (>= 3 in hostname)
 * - suspicious keywords in path or query
 * - unusual ports (outside 80, 443, 8080, 8443)
 * - username/password embedded in URL (user:pass@host)
 *
 * Strictly treated as potential risk indicators, never definitive proof of malice.
 */

import { SecuritySignal, UrlPatternEvidence } from '../../types/analysis.js';

export interface UrlPatternAnalysisResult {
  evidence: UrlPatternEvidence;
  signals: SecuritySignal[];
  urlSignalsList: string[];
}

const COMMON_TARGETED_BRANDS = [
  { name: 'PayPal', pattern: /paypal/i, legitimateDomain: 'paypal.com' },
  { name: 'Apple', pattern: /apple(?:id)?/i, legitimateDomain: 'apple.com' },
  { name: 'Microsoft', pattern: /microsoft|office365|outlook/i, legitimateDomain: 'microsoft.com' },
  { name: 'Google', pattern: /google|gmail/i, legitimateDomain: 'google.com' },
  { name: 'Amazon', pattern: /amazon|prime/i, legitimateDomain: 'amazon.com' },
  { name: 'Netflix', pattern: /netflix/i, legitimateDomain: 'netflix.com' },
  { name: 'Chase', pattern: /chase(?:bank)?/i, legitimateDomain: 'chase.com' },
  { name: 'Bank of America', pattern: /bankofamerica|bofa/i, legitimateDomain: 'bankofamerica.com' },
  { name: 'Wells Fargo', pattern: /wellsfargo/i, legitimateDomain: 'wellsfargo.com' },
  { name: 'USPS', pattern: /usps(?:-post)?/i, legitimateDomain: 'usps.com' },
  { name: 'DHL', pattern: /dhl(?:-express)?/i, legitimateDomain: 'dhl.com' },
  { name: 'FedEx', pattern: /fedex/i, legitimateDomain: 'fedex.com' },
  { name: 'Binance', pattern: /binance/i, legitimateDomain: 'binance.com' },
  { name: 'Coinbase', pattern: /coinbase/i, legitimateDomain: 'coinbase.com' },
  { name: 'Meta', pattern: /facebook|meta-verify/i, legitimateDomain: 'facebook.com' },
];

const HIGH_RISK_TLDS = new Set([
  'top', 'xyz', 'click', 'cam', 'quest', 'buzz', 'bond', 'cfd',
  'work', 'gq', 'ml', 'cf', 'tk', 'rest', 'country', 'surf', 'icu'
]);

const SENSITIVE_KEYWORDS = [
  'login', 'signin', 'logon', 'verify', 'verification', 'update-account',
  'billing', 'security-alert', 'unlock', 'claim', 'airdrop', 'seedphrase',
  'wallet', 'suspended', 're-activate', 'urgent', 'refund', 'giftcard'
];

export function analyzeUrlPatterns(
  hostname: string,
  pathWithQuery: string,
  isIpAddress: boolean,
  parsed?: URL,
  port?: number | null
): UrlPatternAnalysisResult {
  const signals: SecuritySignal[] = [];
  const urlSignalsList: string[] = [];
  const lowerHost = hostname.toLowerCase();
  const lowerPath = pathWithQuery.toLowerCase();

  // 1. IP address as hostname
  if (isIpAddress) {
    urlSignalsList.push('ip_address_hostname');
    signals.push({
      id: 'pattern-ip-hostname',
      severity: 'HIGH',
      title: 'Numerical IP address used as hostname',
      explanation: 'The URL uses a numerical IP address instead of a registered domain name. Legitimate web services generally deploy authenticated domain names with DNS management.',
      evidence: `Target address: ${hostname}`,
      category: 'url_structure',
      confidence: 'High',
      source: 'technical-analysis',
    });
  }

  // 2. Punycode check (xn--)
  const hasPunycodeOrIdn = lowerHost.includes('xn--');
  if (hasPunycodeOrIdn) {
    urlSignalsList.push('punycode_idn');
    signals.push({
      id: 'pattern-punycode-homograph',
      severity: 'HIGH',
      title: 'Punycode / IDN encoding detected in hostname',
      explanation: 'Punycode translates internationalized characters into ASCII. While legitimate for non-Latin languages, it is frequently used to construct homoglyph domain names that imitate recognized brand names.',
      evidence: `Hostname incorporates punycode prefix: ${hostname}`,
      category: 'url_structure',
      confidence: 'High',
      source: 'technical-analysis',
    });
  }

  // 3. Unusually long hostname (> 50 characters)
  const longHostname = lowerHost.length > 50;
  if (longHostname) {
    urlSignalsList.push('long_hostname');
    signals.push({
      id: 'pattern-long-hostname',
      severity: 'MEDIUM',
      title: 'Unusually long hostname (> 50 characters)',
      explanation: 'Extremely long domain names are frequently employed in mobile phishing kits to push the root domain off the screen in truncated browser address bars.',
      evidence: `Hostname length is ${lowerHost.length} characters: ${hostname}`,
      category: 'url_structure',
      confidence: 'Medium',
      source: 'technical-analysis',
    });
  }

  // 4. Excessive hyphens (>= 3 in hostname)
  const hyphenCount = (lowerHost.match(/-/g) || []).length;
  const excessiveHyphens = hyphenCount >= 3;
  if (excessiveHyphens) {
    urlSignalsList.push('excessive_hyphens');
    signals.push({
      id: 'pattern-excessive-hyphens',
      severity: 'MEDIUM',
      title: 'Excessive hyphens in hostname',
      explanation: `The hostname incorporates ${hyphenCount} hyphens. Deceptive domains frequently link brand keywords with hyphens (e.g., brand-security-update-verify.com) to simulate corporate infrastructure.`,
      evidence: `Hostname contains ${hyphenCount} hyphens`,
      category: 'url_structure',
      confidence: 'Medium',
      source: 'technical-analysis',
    });
  }

  // 5. Excessive subdomains (>= 4 dots)
  const dotCount = (lowerHost.match(/\./g) || []).length;
  const excessiveSubdomains = dotCount >= 4;
  if (excessiveSubdomains) {
    urlSignalsList.push('excessive_subdomains');
    signals.push({
      id: 'pattern-excessive-subdomains',
      severity: 'MEDIUM',
      title: 'Multi-layer subdomain stacking',
      explanation: `The domain chains ${dotCount + 1} segmented levels. Adversaries frequently stack brand names into subdomains while keeping the true root domain at the end.`,
      evidence: `Hostname has ${dotCount + 1} levels: ${hostname}`,
      category: 'url_structure',
      confidence: 'High',
      source: 'technical-analysis',
    });
  }

  // 6. Misleading subdomain structure / Brand Spoofing
  let brandSpoofRisk: string | null = null;
  for (const brand of COMMON_TARGETED_BRANDS) {
    if (brand.pattern.test(lowerHost)) {
      const isLegit = lowerHost === brand.legitimateDomain || lowerHost.endsWith(`.${brand.legitimateDomain}`);
      if (!isLegit) {
        brandSpoofRisk = brand.name;
        urlSignalsList.push(`brand_spoof_${brand.name.toLowerCase()}`);
        signals.push({
          id: `pattern-brand-impersonation-${brand.name.toLowerCase()}`,
          severity: 'HIGH',
          title: `Brand name present in third-party hostname: ${brand.name}`,
          explanation: `The address contains the brand term "${brand.name}", but the root domain does not match the official authorized domain (${brand.legitimateDomain}).`,
          evidence: `Domain "${hostname}" contains brand identifier "${brand.name}" outside "${brand.legitimateDomain}"`,
          category: 'url_structure',
          confidence: 'High',
          source: 'technical-analysis',
        });
        break;
      }
    }
  }

  // 7. Embedded userinfo in URL (user:pass@host)
  const hasUserInfoInUrl = !!(parsed && (parsed.username || parsed.password));
  if (hasUserInfoInUrl) {
    urlSignalsList.push('userinfo_in_url');
    signals.push({
      id: 'pattern-userinfo-embedded',
      severity: 'CRITICAL',
      title: 'URL userinfo authentication deception (RFC 3986)',
      explanation: 'The URL specifies username credentials before the "@" character. Modern browsers navigate to the host after the "@", concealing the actual destination.',
      evidence: `Userinfo credentials preceding host: ${parsed?.username}@`,
      category: 'url_structure',
      confidence: 'High',
      source: 'technical-analysis',
    });
  }

  // 8. Unusual network port
  const hasSuspiciousPort = !!(port && port !== 80 && port !== 443 && port !== 8080 && port !== 8443);
  if (hasSuspiciousPort) {
    urlSignalsList.push(`unusual_port_${port}`);
    signals.push({
      id: 'pattern-unusual-port',
      severity: 'MEDIUM',
      title: `Non-standard network port (${port})`,
      explanation: 'The URL binds to an atypical network port rather than standard web ports (80 or 443).',
      evidence: `Target port: ${port}`,
      category: 'url_structure',
      confidence: 'High',
      source: 'technical-analysis',
    });
  }

  // 9. High-risk TLD
  const tldMatch = lowerHost.match(/\.([a-z0-9-]+)$/);
  const tld = tldMatch ? tldMatch[1] : '';
  const isHighRiskTld = HIGH_RISK_TLDS.has(tld);
  const tldRisk: 'Standard' | 'Elevated' | 'High-Risk TLD' = isHighRiskTld
    ? 'High-Risk TLD'
    : ['cc', 'to', 'ws', 'site', 'online', 'vip'].includes(tld)
    ? 'Elevated'
    : 'Standard';

  if (isHighRiskTld) {
    urlSignalsList.push(`high_risk_tld_${tld}`);
    signals.push({
      id: 'pattern-high-risk-tld',
      severity: 'LOW',
      title: `High-risk top-level domain (.${tld})`,
      explanation: `The .${tld} TLD is statistically common in disposable domain spam and phishing kits due to low registration barriers.`,
      evidence: `Top-level domain: .${tld}`,
      category: 'reputation',
      confidence: 'Medium',
      source: 'technical-analysis',
    });
  }

  // 10. Suspicious percent-encoding in path
  const doubleEncoded = /%25[0-9a-f]{2}/i.test(pathWithQuery);
  if (doubleEncoded) {
    urlSignalsList.push('double_percent_encoding');
    signals.push({
      id: 'pattern-double-encoding',
      severity: 'MEDIUM',
      title: 'Double percent-encoding in URL path',
      explanation: 'The URL path contains double-encoded characters (%25), an obfuscation technique sometimes used to evade web application firewalls and URL filters.',
      evidence: 'Detected %25 sequence in URL query/path',
      category: 'url_structure',
      confidence: 'Medium',
      source: 'technical-analysis',
    });
  }

  // 11. Sensitive keywords in path
  const keywordsFound: string[] = [];
  for (const kw of SENSITIVE_KEYWORDS) {
    if (lowerHost.includes(kw) || lowerPath.includes(kw)) {
      keywordsFound.push(kw);
    }
  }

  if (keywordsFound.length >= 2) {
    urlSignalsList.push(`sensitive_keywords_${keywordsFound.slice(0, 2).join('_')}`);
    signals.push({
      id: 'pattern-sensitive-keywords',
      severity: brandSpoofRisk ? 'HIGH' : 'MEDIUM',
      title: 'Security or authentication action tokens in path',
      explanation: 'URL path references sensitive account procedures (such as login, verification, or billing).',
      evidence: `Keywords identified: ${keywordsFound.join(', ')}`,
      category: 'behavioral',
      confidence: 'Medium',
      source: 'technical-analysis',
    });
  }

  // 12. URL Shortener detection
  const hasUrlShortener = /^(bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|ow\.ly|rb\.gy)$/i.test(hostname);
  if (hasUrlShortener) {
    urlSignalsList.push('url_shortener');
  }

  const evidence: UrlPatternEvidence = {
    isIpAddress,
    hasPunycodeOrIdn,
    hasSuspiciousPort,
    suspiciousKeywordsFound: keywordsFound,
    brandSpoofRisk,
    excessiveSubdomains,
    tldRisk,
    hasUrlShortener,
    hasUserInfoInUrl,
    excessiveHyphens,
    longHostname,
    signals: urlSignalsList,
  };

  return { evidence, signals, urlSignalsList };
}
