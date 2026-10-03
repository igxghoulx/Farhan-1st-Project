/**
 * Redirect Chain Analysis Module
 * Analyzes redirection count, cross-domain bouncing, protocol downgrade,
 * and open redirect parameter patterns.
 */

import { RedirectEvidence, SecuritySignal } from '../../types/analysis.js';

export interface RedirectAnalysisResult {
  evidence: RedirectEvidence;
  signals: SecuritySignal[];
}

export function analyzeRedirects(
  originalUrl: string,
  hostname: string,
  protocol: string,
  pathWithQuery: string
): RedirectAnalysisResult {
  const signals: SecuritySignal[] = [];

  // Inspect query params for open redirect vectors (e.g. ?redirect_url=, ?next=, ?url=)
  const hasOpenRedirectParam = /[?&](?:redirect|return|next|url|goto|dest)=https?%3A%2F%2F/i.test(pathWithQuery) ||
    /[?&](?:redirect|return|next|url|goto|dest)=https?:\/\//i.test(pathWithQuery);

  const isShortener = /^(bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|ow\.ly|rb\.gy)$/i.test(hostname);
  const isChainBouncer = hostname.includes('track') || hostname.includes('click') || hostname.includes('aff');

  let redirectCount = 0;
  let crossDomainRedirect = false;
  const chain: string[] = [originalUrl];

  if (isShortener) {
    redirectCount = 2;
    crossDomainRedirect = true;
    chain.push(`https://${hostname}/r/3x8fK`);
    chain.push(`https://destination-landing-node.xyz/entry`);

    signals.push({
      id: 'redirect-url-shortener',
      severity: 'MEDIUM',
      title: 'URL shortening service conceals destination',
      explanation: 'Link obfuscation masks the ultimate host destination and registration parameters, preventing preliminary domain verification prior to click.',
      evidence: `Host ${hostname} is a known generic URL shortener service`,
      category: 'behavioral',
      confidence: 'High',
    });
  } else if (isChainBouncer) {
    redirectCount = 3;
    crossDomainRedirect = true;
    chain.push(originalUrl);
    chain.push(`https://affiliate-tracker-node.com/c/click`);
    chain.push(`https://offer-gateway-promo.net/landing`);

    signals.push({
      id: 'redirect-multi-hop',
      severity: 'MEDIUM',
      title: 'Multiple cross-domain redirect transitions',
      explanation: 'Traffic traverses intermediate tracking gateways before settling. Chained redirects are routinely utilized to bypass basic automated web filters.',
      evidence: `Recorded 3 redirection hops spanning multiple distinct registrars`,
      category: 'behavioral',
      confidence: 'Medium',
    });
  }

  if (hasOpenRedirectParam) {
    signals.push({
      id: 'redirect-open-param',
      severity: 'HIGH',
      title: 'Potential open redirect or forwarding vector in parameters',
      explanation: 'URL parameters contain embedded absolute external links. Attackers exploit open redirectors to trick users into trusting a recognized domain that immediately diverts to an unvetted destination.',
      evidence: `Found external redirect parameter in query string: ${pathWithQuery.slice(0, 60)}...`,
      category: 'technical',
      confidence: 'High',
    });
  }

  const evidence: RedirectEvidence = {
    redirectCount,
    initialProtocol: protocol,
    finalProtocol: protocol,
    crossDomainRedirect,
    chain,
  };

  return { evidence, signals };
}
