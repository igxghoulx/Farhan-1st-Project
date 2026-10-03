/**
 * Real Server-Side HTTP Protocol & Redirect Analyzer (High Performance)
 * Instantly extracts response headers, status codes, and redirect targets
 * upon header receipt without hanging or downloading heavy response bodies.
 */

import http from 'http';
import https from 'https';
import { HttpEvidence, RedirectEvidence, SecuritySignal } from '../../types/analysis.js';
import { normalizeUrl } from './urlNormalizer.js';
import { getVerifiedHostIps } from './dnsCache.js';

export interface HttpAnalysisResult {
  httpEvidence: HttpEvidence;
  redirectEvidence: RedirectEvidence;
  signals: SecuritySignal[];
  rawHeaders: Record<string, string>;
  finalUrl: string;
}

const MAX_REDIRECTS = 4;
const HTTP_TIMEOUT_MS = 3000;

interface SingleHopResult {
  statusCode: number;
  headers: Record<string, string>;
  location?: string;
  responseMs: number;
  contentLength?: number;
  contentType?: string;
  server?: string;
}

/**
 * Safely and rapidly inspects a single HTTP/HTTPS hop.
 * Resolves immediately upon receiving HTTP headers and destroys the connection.
 */
async function fetchHop(targetUrl: string): Promise<SingleHopResult> {
  const norm = normalizeUrl(targetUrl);
  if (!norm.isValid) {
    throw new Error(`Invalid URL on hop: ${norm.error}`);
  }

  // Fast pre-flight SSRF check using cached DNS
  const verified = await getVerifiedHostIps(norm.hostname, norm.isIpAddress);
  if (!verified.isSafe) {
    throw new Error(`SSRF blocked: ${verified.ssrfReason || 'Target resolves to private network IP'}`);
  }

  const isHttps = norm.protocol === 'https';
  const client = isHttps ? https : http;
  const start = Date.now();

  return new Promise<SingleHopResult>((resolve, reject) => {
    let resolved = false;
    let timer: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      resolved = true;
    };

    const req = client.request(
      targetUrl,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'TrustLensAI-RiskAnalyzer/1.0 (+https://trustlens.ai; security-audit-bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'close',
        },
        timeout: HTTP_TIMEOUT_MS,
        rejectUnauthorized: false, // Safely inspect sites with unvetted/expired certs
      },
      (res) => {
        if (resolved) return;
        const responseMs = Date.now() - start;
        const statusCode = res.statusCode || 0;
        const headers: Record<string, string> = {};

        for (const [key, val] of Object.entries(res.headers)) {
          if (val) {
            headers[key.toLowerCase()] = Array.isArray(val) ? val.join(', ') : val;
          }
        }

        const location = headers['location'];
        const contentType = headers['content-type'];
        const server = headers['server'];
        const rawContentLen = headers['content-length'];
        const contentLength = rawContentLen ? parseInt(rawContentLen, 10) : undefined;

        cleanup();

        // Immediately destroy stream now that headers are captured - prevents hanging on large bodies!
        res.destroy();
        req.destroy();

        resolve({
          statusCode,
          headers,
          location,
          responseMs,
          contentLength,
          contentType,
          server,
        });
      }
    );

    // Suppress error after resolution
    req.on('error', (err) => {
      if (resolved) return;
      cleanup();
      reject(err);
    });

    req.on('timeout', () => {
      if (resolved) return;
      cleanup();
      req.destroy();
      reject(new Error(`Connection timed out after ${HTTP_TIMEOUT_MS}ms`));
    });

    timer = setTimeout(() => {
      if (!resolved) {
        cleanup();
        req.destroy();
        reject(new Error(`Request timed out after ${HTTP_TIMEOUT_MS}ms`));
      }
    }, HTTP_TIMEOUT_MS);

    req.end();
  });
}

/**
 * Rapidly follows redirect chains and captures headers.
 */
export async function analyzeHttp(initialUrl: string): Promise<HttpAnalysisResult> {
  const signals: SecuritySignal[] = [];
  const chain: string[] = [initialUrl];
  let currentUrl = initialUrl;
  let redirectCount = 0;
  let lastHop: SingleHopResult | null = null;
  let crossDomainRedirect = false;

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    try {
      const hop = await fetchHop(currentUrl);
      lastHop = hop;

      // Check if redirect status (301, 302, 303, 307, 308)
      if (
        [301, 302, 303, 307, 308].includes(hop.statusCode) &&
        hop.location &&
        i < MAX_REDIRECTS
      ) {
        redirectCount++;
        let nextUrl: string;
        try {
          nextUrl = new URL(hop.location, currentUrl).href;
        } catch {
          break; // Broken location header
        }

        const currHost = new URL(currentUrl).hostname.toLowerCase();
        const nextHost = new URL(nextUrl).hostname.toLowerCase();
        if (currHost !== nextHost) {
          crossDomainRedirect = true;
        }

        chain.push(nextUrl);
        currentUrl = nextUrl;
        continue;
      }

      // Final destination reached
      break;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('SSRF blocked')) {
        signals.push({
          id: 'http-ssrf-blocked',
          severity: 'CRITICAL',
          title: 'SSRF Violation: Target redirected to private network address',
          explanation: 'Connection aborted because the server redirected to a restricted internal IP or metadata endpoint.',
          evidence: errMsg,
          category: 'infrastructure',
          confidence: 'High',
          source: 'technical-analysis',
        });
        throw err;
      }

      signals.push({
        id: 'http-connection-failure',
        severity: 'MEDIUM',
        title: 'HTTP connection failed or timed out',
        explanation: 'The remote host could not be reached within the network timeout window, or actively refused the connection.',
        evidence: `Error: ${errMsg}`,
        category: 'transport',
        confidence: 'High',
        source: 'technical-analysis',
      });
      break;
    }
  }

  // Assess Redirect Signals
  if (redirectCount >= 3) {
    signals.push({
      id: 'http-excessive-redirects',
      severity: 'MEDIUM',
      title: 'Multiple sequential HTTP redirects detected',
      explanation: 'The request was redirected 3 or more times across servers. Multi-hop chains are frequently utilized in affiliate forwarding and ad-network cloaking.',
      evidence: `Recorded ${redirectCount} redirect hops`,
      category: 'behavioral',
      confidence: 'Medium',
      source: 'technical-analysis',
    });
  }

  if (crossDomainRedirect) {
    signals.push({
      id: 'http-cross-domain-redirect',
      severity: 'LOW',
      title: 'Cross-domain redirect transition',
      explanation: 'The initial domain diverted traffic to an external root domain registrar.',
      evidence: `Initial: ${new URL(initialUrl).hostname} -> Final: ${new URL(currentUrl).hostname}`,
      category: 'behavioral',
      confidence: 'Medium',
      source: 'technical-analysis',
    });
  }

  const statusCode = lastHop ? lastHop.statusCode : 'unavailable';
  const responseTimeMs = lastHop ? lastHop.responseMs : 'unavailable';
  const server = lastHop?.server || 'unavailable';
  const contentType = lastHop?.contentType || 'unavailable';
  const contentLength = lastHop?.contentLength;
  const rawHeaders = lastHop?.headers || {};

  const httpEvidence: HttpEvidence = {
    statusCode,
    server,
    responseMs: typeof responseTimeMs === 'number' ? responseTimeMs : undefined,
    responseTimeMs,
    contentType,
    contentLength,
    finalUrl: currentUrl,
    redirectCount,
  };

  const redirectEvidence: RedirectEvidence = {
    redirectCount,
    initialProtocol: new URL(initialUrl).protocol.replace(':', ''),
    finalProtocol: new URL(currentUrl).protocol.replace(':', ''),
    crossDomainRedirect,
    chain,
  };

  return {
    httpEvidence,
    redirectEvidence,
    signals,
    rawHeaders,
    finalUrl: currentUrl,
  };
}
