/**
 * URL Normalization & SSRF Defense Module
 * Strict URL parsing, protocol validation (http/https only),
 * and comprehensive SSRF prevention against private, loopback, and internal network ranges.
 */

import { isIP } from 'net';

export interface NormalizedUrlResult {
  isValid: boolean;
  error?: string;
  original: string;
  normalized: string;
  parsed?: URL;
  hostname: string;
  protocol: 'http' | 'https';
  port: number | null;
  path: string;
  isIpAddress: boolean;
}

// Blocked private and internal domain suffixes
const BLOCKED_HOSTNAME_SUFFIXES = [
  '.local',
  '.internal',
  '.lan',
  '.corp',
  '.home',
  '.arpa',
  '.onion',
  '.test',
  '.invalid',
  '.example',
];

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'metadata.compute.internal',
  'instance-data',
  'kubernetes.default',
  'kubernetes.default.svc',
]);

/**
 * Checks whether an IPv4 address is in a private, loopback, or reserved range.
 */
export function isPrivateOrBlockedIpv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IP
  }

  const [b0, b1, b2, b3] = parts;

  // 0.0.0.0/8 (Current network)
  if (b0 === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (b0 === 127) return true;

  // 10.0.0.0/8 (Private-Use RFC 1918)
  if (b0 === 10) return true;

  // 172.16.0.0/12 (Private-Use RFC 1918: 172.16.0.0 - 172.31.255.255)
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

  // 192.168.0.0/16 (Private-Use RFC 1918)
  if (b0 === 192 && b1 === 168) return true;

  // 169.254.0.0/16 (Link-Local, RFC 3927 - includes cloud metadata 169.254.169.254)
  if (b0 === 169 && b1 === 254) return true;

  // 100.64.0.0/10 (Shared Address Space / CGNAT RFC 6598)
  if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (b0 === 192 && b1 === 0 && b2 === 0) return true;

  // 192.0.2.0/24 (TEST-NET-1, documentation)
  if (b0 === 192 && b1 === 0 && b2 === 2) return true;

  // 198.51.100.0/24 (TEST-NET-2)
  if (b0 === 198 && b1 === 51 && b2 === 100) return true;

  // 203.0.113.0/24 (TEST-NET-3)
  if (b0 === 203 && b1 === 0 && b2 === 113) return true;

  // 224.0.0.0/4 (Multicast)
  if (b0 >= 224 && b0 <= 239) return true;

  // 240.0.0.0/4 (Reserved for future use)
  if (b0 >= 240) return true;

  // 255.255.255.255 (Broadcast)
  if (b0 === 255 && b1 === 255 && b2 === 255 && b3 === 255) return true;

  return false;
}

/**
 * Checks whether an IPv6 address is in a private, loopback, or reserved range.
 */
export function isPrivateOrBlockedIpv6(ip: string): boolean {
  const norm = ip.toLowerCase().trim();

  // ::1 / Loopback
  if (norm === '::1' || norm === '0:0:0:0:0:0:0:1') return true;

  // :: / Unspecified
  if (norm === '::' || norm === '0:0:0:0:0:0:0:0') return true;

  // IPv4-mapped IPv6 (::ffff:127.0.0.1, etc.)
  if (norm.startsWith('::ffff:') || norm.startsWith('0:0:0:0:0:ffff:')) {
    const v4Part = norm.split(':').pop();
    if (v4Part && isIP(v4Part) === 4) {
      return isPrivateOrBlockedIpv4(v4Part);
    }
    return true;
  }

  // Unique local addresses (fc00::/7 -> starts with fc or fd)
  if (/^f[cd][0-9a-f]{2}:/i.test(norm)) return true;

  // Link-local unicast (fe80::/10 -> starts with fe8, fe9, fea, feb)
  if (/^fe[89ab][0-9a-f]:/i.test(norm)) return true;

  // Multicast (ff00::/8)
  if (/^ff[0-9a-f]{2}:/i.test(norm)) return true;

  return false;
}

/**
 * Validates any IP address (v4 or v6) against SSRF rules.
 */
export function isPrivateOrBlockedIp(ip: string): boolean {
  const ipVersion = isIP(ip);
  if (ipVersion === 4) {
    return isPrivateOrBlockedIpv4(ip);
  }
  if (ipVersion === 6) {
    return isPrivateOrBlockedIpv6(ip);
  }
  return true; // Not a recognized IP or malformed
}

/**
 * Normalizes user input URLs and performs strict SSRF checks.
 */
export function normalizeUrl(rawInput: string): NormalizedUrlResult {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: 'URL input cannot be empty',
      original: rawInput,
      normalized: '',
      hostname: '',
      protocol: 'https',
      port: null,
      path: '',
      isIpAddress: false,
    };
  }

  // Fast check: reject non-HTTP schemes
  const lowerRaw = trimmed.toLowerCase();
  if (
    lowerRaw.startsWith('javascript:') ||
    lowerRaw.startsWith('data:') ||
    lowerRaw.startsWith('file:') ||
    lowerRaw.startsWith('blob:') ||
    lowerRaw.startsWith('ftp:') ||
    lowerRaw.startsWith('gopher:')
  ) {
    return {
      isValid: false,
      error: 'Unsupported protocol scheme. Only http:// and https:// web addresses are supported.',
      original: rawInput,
      normalized: '',
      hostname: '',
      protocol: 'https',
      port: null,
      path: '',
      isIpAddress: false,
    };
  }

  // Prepend https:// if no protocol is specified
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch (err) {
    return {
      isValid: false,
      error: 'Malformed URL syntax. Please enter a valid web address.',
      original: rawInput,
      normalized: '',
      hostname: '',
      protocol: 'https',
      port: null,
      path: '',
      isIpAddress: false,
    };
  }

  // Protocol must strictly be http: or https:
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      error: 'Unsupported protocol. Only http:// and https:// are supported.',
      original: rawInput,
      normalized: '',
      hostname: '',
      protocol: 'https',
      port: null,
      path: '',
      isIpAddress: false,
    };
  }

  // Normalize hostname: lowercase and strip trailing dots
  let hostname = parsed.hostname.toLowerCase();
  while (hostname.endsWith('.') && hostname.length > 1) {
    hostname = hostname.slice(0, -1);
  }

  if (!hostname || hostname.length === 0) {
    return {
      isValid: false,
      error: 'Invalid domain or hostname.',
      original: rawInput,
      normalized: '',
      hostname: '',
      protocol: 'https',
      port: null,
      path: '',
      isIpAddress: false,
    };
  }

  // Check SSRF blocked hostnames
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return {
      isValid: false,
      error: 'Access to localhost and internal loopback addresses is restricted for security.',
      original: rawInput,
      normalized: '',
      hostname,
      protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
      port: null,
      path: '',
      isIpAddress: false,
    };
  }

  // Check SSRF blocked internal suffix
  for (const suffix of BLOCKED_HOSTNAME_SUFFIXES) {
    if (hostname.endsWith(suffix)) {
      return {
        isValid: false,
        error: `Access to internal domain zone '${suffix}' is prohibited.`,
        original: rawInput,
        normalized: '',
        hostname,
        protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
        port: null,
        path: '',
        isIpAddress: false,
      };
    }
  }

  // Check if hostname is an IP directly
  const ipVer = isIP(hostname);
  const isIpAddress = ipVer > 0;

  if (isIpAddress) {
    if (isPrivateOrBlockedIp(hostname)) {
      return {
        isValid: false,
        error: 'Target references a private, loopback, or reserved network IP address (SSRF protection).',
        original: rawInput,
        normalized: '',
        hostname,
        protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
        port: null,
        path: '',
        isIpAddress: true,
      };
    }
  }

  // Validate port range
  let port: number | null = null;
  if (parsed.port) {
    const p = parseInt(parsed.port, 10);
    if (isNaN(p) || p <= 0 || p > 65535) {
      return {
        isValid: false,
        error: 'Invalid network port specification.',
        original: rawInput,
        normalized: '',
        hostname,
        protocol: 'https',
        port: null,
        path: '',
        isIpAddress,
      };
    }
    port = p;
  }

  // Reconstruct clean normalized URL
  parsed.hostname = hostname;
  const normalized = parsed.href;

  return {
    isValid: true,
    original: rawInput,
    normalized,
    parsed,
    hostname,
    protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
    port,
    path: parsed.pathname + parsed.search,
    isIpAddress,
  };
}
