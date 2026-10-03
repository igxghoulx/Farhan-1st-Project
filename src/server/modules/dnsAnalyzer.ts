/**
 * Real Server-Side DNS Analysis Module (High Performance)
 * Resolves A, AAAA, CNAME, and MX records concurrently using Node's native dns/promises.
 * Enforces post-resolution SSRF verification to prevent DNS-rebinding attacks.
 */

import dns from 'dns/promises';
import { DnsEvidence, SecuritySignal } from '../../types/analysis.js';
import { isPrivateOrBlockedIp } from './urlNormalizer.js';

export interface DnsAnalysisResult {
  evidence: DnsEvidence;
  signals: SecuritySignal[];
  hasSsrfRisk: boolean;
  ssrfReason?: string;
}

export async function analyzeDns(hostname: string, isIpAddress: boolean): Promise<DnsAnalysisResult> {
  const signals: SecuritySignal[] = [];

  // When hostname is an IP directly, DNS is bypassed
  if (isIpAddress) {
    if (isPrivateOrBlockedIp(hostname)) {
      return {
        evidence: {
          resolvedIps: [hostname],
          hasMxRecord: 'unavailable',
          hasSpfRecord: 'unavailable',
          hasDmarcRecord: 'unavailable',
          nameservers: [],
          a: [hostname],
          aaaa: 'unavailable',
          cname: 'unavailable',
          mx: 'unavailable',
          status: 'unavailable',
        },
        signals: [
          {
            id: 'dns-blocked-ip',
            severity: 'CRITICAL',
            title: 'Blocked private or internal IP address destination',
            explanation: 'The target resolves to a private, loopback, or cloud-internal IP address space.',
            evidence: `Destination IP: ${hostname}`,
            category: 'infrastructure',
            confidence: 'High',
            source: 'technical-analysis',
          },
        ],
        hasSsrfRisk: true,
        ssrfReason: `Direct IP ${hostname} is in a reserved or private range.`,
      };
    }

    const evidence: DnsEvidence = {
      resolvedIps: [hostname],
      hasMxRecord: 'unavailable',
      hasSpfRecord: 'unavailable',
      hasDmarcRecord: 'unavailable',
      nameservers: [],
      a: [hostname],
      aaaa: 'unavailable',
      cname: 'unavailable',
      mx: 'unavailable',
      status: 'resolved',
    };

    signals.push({
      id: 'dns-ip-direct',
      severity: 'HIGH',
      title: 'Direct IP address destination bypassing DNS',
      explanation: 'Target URL specifies a numerical IP address instead of an authenticated domain name. Legitimate web services generally deploy branded domains with managed DNS records.',
      evidence: `Direct IP address destination: ${hostname}`,
      category: 'infrastructure',
      confidence: 'High',
      source: 'technical-analysis',
    });

    return { evidence, signals, hasSsrfRisk: false };
  }

  let aRecords: string[] | 'unavailable' = 'unavailable';
  let aaaaRecords: string[] | 'unavailable' = 'unavailable';
  let cnameRecords: string[] | 'unavailable' = 'unavailable';
  let mxRecords: string[] | 'unavailable' = 'unavailable';
  const allResolvedIps: string[] = [];

  // Run all 4 DNS record lookups concurrently for maximum speed
  const [aResult, aaaaResult, cnameResult, mxResult] = await Promise.allSettled([
    dns.resolve4(hostname),
    dns.resolve6(hostname),
    dns.resolveCname(hostname),
    dns.resolveMx(hostname),
  ]);

  if (aResult.status === 'fulfilled' && Array.isArray(aResult.value) && aResult.value.length > 0) {
    aRecords = aResult.value;
    allResolvedIps.push(...aResult.value);
  } else if (aResult.status === 'rejected') {
    const code = (aResult.reason as { code?: string })?.code;
    if (code === 'ENODATA' || code === 'ENOTFOUND') {
      aRecords = [];
    }
  }

  if (aaaaResult.status === 'fulfilled' && Array.isArray(aaaaResult.value) && aaaaResult.value.length > 0) {
    aaaaRecords = aaaaResult.value;
    allResolvedIps.push(...aaaaResult.value);
  } else if (aaaaResult.status === 'rejected') {
    const code = (aaaaResult.reason as { code?: string })?.code;
    if (code === 'ENODATA' || code === 'ENOTFOUND') {
      aaaaRecords = [];
    }
  }

  if (cnameResult.status === 'fulfilled' && Array.isArray(cnameResult.value)) {
    cnameRecords = cnameResult.value;
  } else {
    cnameRecords = [];
  }

  let hasMx = false;
  if (mxResult.status === 'fulfilled' && Array.isArray(mxResult.value) && mxResult.value.length > 0) {
    hasMx = true;
    mxRecords = mxResult.value.map((m) => `${m.exchange} (priority ${m.priority})`);
  } else {
    mxRecords = [];
  }

  // Check resolved IPs for SSRF (DNS Rebinding / Internal IP poisoning)
  for (const ip of allResolvedIps) {
    if (isPrivateOrBlockedIp(ip)) {
      return {
        evidence: {
          resolvedIps: allResolvedIps,
          hasMxRecord: 'unavailable',
          hasSpfRecord: 'unavailable',
          hasDmarcRecord: 'unavailable',
          nameservers: [],
          a: aRecords,
          aaaa: aaaaRecords,
          cname: cnameRecords,
          mx: mxRecords,
          status: 'unavailable',
        },
        signals: [
          {
            id: 'dns-rebinding-ssrf',
            severity: 'CRITICAL',
            title: 'Hostname resolved to restricted or private IP address',
            explanation: 'Security check detected that the target domain resolved to a private loopback, local network, or cloud metadata address. Connection was blocked to safeguard internal infrastructure.',
            evidence: `Domain ${hostname} resolved to private/blocked IP: ${ip}`,
            category: 'infrastructure',
            confidence: 'High',
            source: 'technical-analysis',
          },
        ],
        hasSsrfRisk: true,
        ssrfReason: `Hostname ${hostname} resolved to private/blocked IP: ${ip}`,
      };
    }
  }

  // If no IPs were resolved at all
  if (allResolvedIps.length === 0) {
    signals.push({
      id: 'dns-unresolved-host',
      severity: 'HIGH',
      title: 'Domain does not resolve to an active IP address',
      explanation: 'DNS query returned no active A or AAAA records. The domain may be unregistered, recently suspended, or experiencing DNS misconfiguration.',
      evidence: `DNS lookup for ${hostname} returned 0 addresses`,
      category: 'infrastructure',
      confidence: 'High',
      source: 'technical-analysis',
    });
  }

  // Signals based on observable DNS posture
  if (allResolvedIps.length > 0 && !hasMx) {
    signals.push({
      id: 'dns-no-mx-records',
      severity: 'INFORMATIONAL',
      title: 'No standard mail exchange (MX) records detected',
      explanation: 'The domain does not publish standard email routing records. This is typical for content-only websites or static microsites, but transactional business platforms usually publish MX records.',
      evidence: `Domain ${hostname} returned 0 MX records`,
      category: 'infrastructure',
      confidence: 'Medium',
      source: 'technical-analysis',
    });
  }

  const evidence: DnsEvidence = {
    resolvedIps: allResolvedIps,
    hasMxRecord: hasMx,
    hasSpfRecord: 'unavailable',
    hasDmarcRecord: 'unavailable',
    nameservers: [],
    a: aRecords,
    aaaa: aaaaRecords,
    cname: cnameRecords,
    mx: mxRecords,
    status: allResolvedIps.length > 0 ? 'resolved' : 'nxdomain',
  };

  return { evidence, signals, hasSsrfRisk: false };
}
