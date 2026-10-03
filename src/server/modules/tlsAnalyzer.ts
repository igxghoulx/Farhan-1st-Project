/**
 * Real Server-Side HTTPS / TLS Analysis Module (High Performance)
 * Safely inspects TLS socket parameters, peer certificates, validity windows,
 * and Certificate Authority issuers using Node.js native tls.connect.
 */

import tls from 'tls';
import { SecuritySignal, TlsEvidence } from '../../types/analysis.js';
import { getVerifiedHostIps } from './dnsCache.js';

export interface TlsAnalysisResult {
  evidence: TlsEvidence;
  signals: SecuritySignal[];
}

export async function analyzeTls(
  protocol: string,
  hostname: string,
  port: number | null
): Promise<TlsAnalysisResult> {
  const signals: SecuritySignal[] = [];
  const isHttps = protocol === 'https';

  if (!isHttps) {
    const evidence: TlsEvidence = {
      enabled: false,
      https: false,
      certificateValid: 'unavailable',
      protocol: 'unavailable',
      issuer: 'unavailable',
      subject: 'unavailable',
      expiresAt: 'unavailable',
      validDaysRemaining: 'unavailable',
      isSelfSigned: 'unavailable',
    };

    signals.push({
      id: 'tls-unencrypted-http',
      severity: 'HIGH',
      title: 'Unencrypted cleartext connection (HTTP)',
      explanation: 'The website transmits data without transport layer encryption. Any credentials, form inputs, or cookies can be intercepted in transit.',
      evidence: `Connection scheme is unencrypted plaintext 'http://'`,
      category: 'transport',
      confidence: 'High',
      source: 'technical-analysis',
    });

    return { evidence, signals };
  }

  // Fast pre-flight SSRF check using cached DNS
  const verified = await getVerifiedHostIps(hostname, false);
  if (!verified.isSafe) {
    return {
      evidence: {
        enabled: 'unavailable',
        https: 'unavailable',
        certificateValid: 'unavailable',
        protocol: 'unavailable',
        issuer: 'unavailable',
        error: verified.ssrfReason || 'Target resolves to private network address',
      },
      signals: [
        {
          id: 'tls-ssrf-blocked',
          severity: 'CRITICAL',
          title: 'TLS check blocked: private IP address',
          explanation: 'Refused TLS socket handshake to private or internal network IP.',
          evidence: `Host: ${hostname}`,
          category: 'infrastructure',
          confidence: 'High',
          source: 'technical-analysis',
        },
      ],
    };
  }

  const targetPort = port || 443;

  return new Promise<TlsAnalysisResult>((resolve) => {
    let resolved = false;
    let timer: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      resolved = true;
    };

    const socket = tls.connect(
      {
        host: hostname,
        port: targetPort,
        servername: hostname,
        rejectUnauthorized: false, // Allows inspecting invalid/self-signed certs safely
        timeout: 3000,
      },
      () => {
        if (resolved) return;
        cleanup();

        try {
          const cipher = socket.getCipher();
          const proto = socket.getProtocol() || 'TLS';
          const authorized = socket.authorized;
          const authError = socket.authorizationError;
          const cert = socket.getPeerCertificate(true);

          socket.destroy(); // Instant termination

          if (!cert || Object.keys(cert).length === 0) {
            const evidence: TlsEvidence = {
              enabled: true,
              https: true,
              certificateValid: false,
              protocol: proto,
              issuer: 'unavailable',
              subject: 'unavailable',
              expiresAt: 'unavailable',
              validDaysRemaining: 'unavailable',
            };
            signals.push({
              id: 'tls-no-cert-presented',
              severity: 'HIGH',
              title: 'No TLS certificate presented by server',
              explanation: 'The TLS handshake succeeded, but the remote server returned an empty peer certificate.',
              evidence: 'Zero certificate bytes returned in handshake',
              category: 'transport',
              confidence: 'High',
              source: 'technical-analysis',
            });
            resolve({ evidence, signals });
            return;
          }

          const extractField = (f: string | string[] | undefined): string => {
            if (Array.isArray(f)) return f.join(', ');
            return typeof f === 'string' ? f : '';
          };

          const rawIssuer = cert.issuer ? (extractField(cert.issuer.O) || extractField(cert.issuer.CN) || 'Unknown Issuer') : 'Unknown';
          const rawSubject = cert.subject ? (extractField(cert.subject.CN) || extractField(cert.subject.O) || 'Unknown Subject') : 'Unknown';
          const issuerStr: string = rawIssuer;
          const subjectStr: string = rawSubject;
          const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
          const now = new Date();

          let validDaysRemaining: number | 'unavailable' = 'unavailable';
          let isExpired = false;

          if (validTo && !isNaN(validTo.getTime())) {
            const diffMs = validTo.getTime() - now.getTime();
            validDaysRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
            if (diffMs <= 0) isExpired = true;
          }

          // Check for self-signed: issuer matches subject or authorization error indicates self-signed
          const authErrorMsg = authError ? (authError.message || String(authError)) : '';
          const isSelfSigned = !!(
            cert.issuer &&
            cert.subject &&
            extractField(cert.issuer.CN) === extractField(cert.subject.CN) &&
            extractField(cert.issuer.O) === extractField(cert.subject.O)
          ) || authErrorMsg.toLowerCase().includes('self signed');

          const certificateValid = authorized && !isExpired;

          const evidence: TlsEvidence = {
            enabled: true,
            https: true,
            certificateValid,
            protocol: proto,
            issuer: issuerStr,
            subject: subjectStr,
            expiresAt: validTo ? validTo.toISOString() : 'unavailable',
            validDaysRemaining,
            isSelfSigned,
            subjectAltNamesCount: cert.subjectaltname ? cert.subjectaltname.split(',').length : 1,
          };

          // Signals
          if (isExpired) {
            signals.push({
              id: 'tls-expired-cert',
              severity: 'HIGH',
              title: 'Expired TLS certificate detected',
              explanation: 'The server is presenting an expired security certificate. Browsers will show security warning interstitials to users.',
              evidence: `Certificate expired on ${validTo?.toISOString()}`,
              category: 'transport',
              confidence: 'High',
              source: 'technical-analysis',
            });
          } else if (isSelfSigned) {
            signals.push({
              id: 'tls-self-signed-cert',
              severity: 'HIGH',
              title: 'Untrusted or self-signed TLS certificate',
              explanation: 'The TLS certificate was not signed by a recognized public Certificate Authority.',
              evidence: `Issuer matches Subject: ${issuerStr}`,
              category: 'transport',
              confidence: 'High',
              source: 'technical-analysis',
            });
          } else if (!certificateValid) {
            signals.push({
              id: 'tls-untrusted-cert',
              severity: 'HIGH',
              title: 'Untrusted TLS certificate chain',
              explanation: `Certificate validation failed: ${authErrorMsg || 'Certificate chain validation error'}.`,
              evidence: `Auth verification failure: ${authErrorMsg || 'Unknown root'}`,
              category: 'transport',
              confidence: 'High',
              source: 'technical-analysis',
            });
          } else {
            signals.push({
              id: 'tls-valid-https-advisory',
              severity: 'INFORMATIONAL',
              title: 'HTTPS encryption verified (Advisory note)',
              explanation: 'The connection between client and server is encrypted using a valid certificate. Note: HTTPS indicates connection privacy only, and does NOT prove that a website or organization is trustworthy.',
              evidence: `Valid ${proto} connection issued by ${issuerStr} (${validDaysRemaining} days remaining)`,
              category: 'transport',
              confidence: 'High',
              source: 'technical-analysis',
            });
          }

          if (typeof validDaysRemaining === 'number' && validDaysRemaining < 14 && !isExpired) {
            signals.push({
              id: 'tls-expiring-soon',
              severity: 'LOW',
              title: 'TLS certificate expires soon',
              explanation: 'The server certificate expires within the next 14 days.',
              evidence: `Only ${validDaysRemaining} days remaining until certificate expiration`,
              category: 'transport',
              confidence: 'Medium',
              source: 'technical-analysis',
            });
          }

          resolve({ evidence, signals });
        } catch (e: any) {
          socket.destroy();
          resolve({
            evidence: {
              enabled: true,
              https: true,
              certificateValid: 'unavailable',
              error: e.message || 'Error reading certificate',
            },
            signals: [],
          });
        }
      }
    );

    socket.on('error', (err) => {
      if (resolved) return;
      cleanup();
      socket.destroy();

      signals.push({
        id: 'tls-handshake-failure',
        severity: 'MEDIUM',
        title: 'TLS handshake failure',
        explanation: 'Could not complete TLS cryptographic negotiation on port 443.',
        evidence: `TLS handshake error: ${err.message}`,
        category: 'transport',
        confidence: 'High',
        source: 'technical-analysis',
      });

      resolve({
        evidence: {
          enabled: true,
          https: true,
          certificateValid: false,
          error: err.message,
        },
        signals,
      });
    });

    socket.on('timeout', () => {
      if (resolved) return;
      cleanup();
      socket.destroy();

      resolve({
        evidence: {
          enabled: 'unavailable',
          https: 'unavailable',
          certificateValid: 'unavailable',
          error: 'TLS connection timed out',
        },
        signals: [
          {
            id: 'tls-timeout',
            severity: 'LOW',
            title: 'TLS connection timed out',
            explanation: 'Server did not complete TLS negotiation within the socket timeout.',
            evidence: 'Timeout after 3000ms',
            category: 'transport',
            confidence: 'Medium',
            source: 'technical-analysis',
          },
        ],
      });
    });

    timer = setTimeout(() => {
      if (!resolved) {
        cleanup();
        socket.destroy();
        resolve({
          evidence: {
            enabled: 'unavailable',
            https: 'unavailable',
            certificateValid: 'unavailable',
            error: 'TLS connection timed out',
          },
          signals: [],
        });
      }
    }, 3000);
  });
}
