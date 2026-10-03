/**
 * Fast In-Memory DNS & SSRF Validation Cache
 * Prevents redundant DNS lookups across DNS, HTTP, and TLS inspection stages.
 * Caches resolution results and SSRF safety verdicts with a 60-second TTL.
 */

import dns from 'dns/promises';
import { isPrivateOrBlockedIp } from './urlNormalizer.js';

interface CachedDnsRecord {
  resolvedIps: string[];
  isSafe: boolean;
  ssrfReason?: string;
  expiresAt: number;
}

const cache = new Map<string, CachedDnsRecord>();
const CACHE_TTL_MS = 60 * 1000;

/**
 * Resolves a hostname (or validates an IP) and verifies SSRF safety with caching.
 */
export async function getVerifiedHostIps(hostname: string, isIpAddress: boolean): Promise<{
  ips: string[];
  isSafe: boolean;
  ssrfReason?: string;
}> {
  const normHost = hostname.toLowerCase();

  // If already an IP address
  if (isIpAddress) {
    const isBlocked = isPrivateOrBlockedIp(normHost);
    return {
      ips: [normHost],
      isSafe: !isBlocked,
      ssrfReason: isBlocked ? `Target IP ${normHost} is in a private, loopback, or reserved range.` : undefined,
    };
  }

  const now = Date.now();
  const cached = cache.get(normHost);
  if (cached && cached.expiresAt > now) {
    return {
      ips: cached.resolvedIps,
      isSafe: cached.isSafe,
      ssrfReason: cached.ssrfReason,
    };
  }

  const resolvedIps: string[] = [];
  try {
    const v4 = await dns.resolve4(normHost).catch(() => []);
    if (Array.isArray(v4)) resolvedIps.push(...v4);
  } catch {
    // IPv4 lookup handled
  }

  try {
    const v6 = await dns.resolve6(normHost).catch(() => []);
    if (Array.isArray(v6)) resolvedIps.push(...v6);
  } catch {
    // IPv6 lookup handled
  }

  let isSafe = true;
  let ssrfReason: string | undefined;

  for (const ip of resolvedIps) {
    if (isPrivateOrBlockedIp(ip)) {
      isSafe = false;
      ssrfReason = `Domain ${hostname} resolved to private/blocked IP: ${ip}`;
      break;
    }
  }

  const record: CachedDnsRecord = {
    resolvedIps,
    isSafe,
    ssrfReason,
    expiresAt: now + CACHE_TTL_MS,
  };

  cache.set(normHost, record);

  // Keep cache size bounded
  if (cache.size > 200) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  return { ips: resolvedIps, isSafe, ssrfReason };
}
