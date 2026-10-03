/**
 * TrustLens AI - Comprehensive Automated Test Suite
 * Tests:
 * 1. URL Normalization
 * 2. Invalid URLs
 * 3. Localhost Blocking
 * 4. Private IP Blocking (SSRF)
 * 5. Redirect Handling
 * 6. Suspicious URL Patterns
 * 7. Security Header Detection (Present / Missing / Unavailable)
 * 8. Unavailable Data Handling (No Fabrications)
 * 9. Gemini Response Validation & Deterministic Fallback
 */

import assert from 'assert';
import {
  normalizeUrl,
  isPrivateOrBlockedIp,
  isPrivateOrBlockedIpv4,
  isPrivateOrBlockedIpv6,
} from '../src/server/modules/urlNormalizer.js';
import { analyzeUrlPatterns } from '../src/server/modules/urlPatternAnalyzer.js';
import { analyzeSecurityHeaders } from '../src/server/modules/securityHeaderAnalyzer.js';
import { domainInfoProvider } from '../src/server/modules/domainInfoProvider.js';
import { generateGeminiAnalysis } from '../src/server/modules/geminiService.js';
import { runMessageAnalysis } from '../src/server/modules/analysisOrchestrator.js';

let passedTests = 0;
let totalTests = 0;

function it(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  return Promise.resolve()
    .then(() => fn())
    .then(() => {
      passedTests++;
      console.log(`  ✓ ${name}`);
    })
    .catch((err) => {
      console.error(`  ✗ ${name}`);
      console.error(err);
      process.exitCode = 1;
    });
}

async function runAllTests() {
  console.log('\n========================================');
  console.log('TrustLens AI — Test Suite Execution');
  console.log('========================================\n');

  console.log('--- 1. URL Normalization ---');
  await it('accepts URL with https://', () => {
    const res = normalizeUrl('https://example.com/path');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.hostname, 'example.com');
    assert.strictEqual(res.protocol, 'https');
  });

  await it('accepts URL without https:// and prepends https://', () => {
    const res = normalizeUrl('example.com/test');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.protocol, 'https');
    assert.strictEqual(res.hostname, 'example.com');
    assert.strictEqual(res.normalized, 'https://example.com/test');
  });

  await it('normalizes hostname casing to lowercase', () => {
    const res = normalizeUrl('HTTPS://ExAmPLe.COM/Path');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.hostname, 'example.com');
  });

  await it('removes unnecessary trailing dots from hostname', () => {
    const res = normalizeUrl('https://example.com./path');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.hostname, 'example.com');
  });

  await it('handles custom ports correctly', () => {
    const res = normalizeUrl('https://example.com:8443/api');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.port, 8443);
  });

  console.log('\n--- 2. Invalid URLs ---');
  await it('rejects empty input', () => {
    const res = normalizeUrl('   ');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error || '', /empty/i);
  });

  await it('rejects dangerous javascript: protocol', () => {
    const res = normalizeUrl('javascript:alert(1)');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error || '', /unsupported/i);
  });

  await it('rejects data: protocol', () => {
    const res = normalizeUrl('data:text/html,<h1>test</h1>');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error || '', /unsupported/i);
  });

  await it('rejects file: protocol', () => {
    const res = normalizeUrl('file:///etc/passwd');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error || '', /unsupported/i);
  });

  await it('rejects malformed syntax', () => {
    const res = normalizeUrl('https://');
    assert.strictEqual(res.isValid, false);
  });

  console.log('\n--- 3. Localhost & Internal Hostname Blocking ---');
  await it('blocks localhost target', () => {
    const res = normalizeUrl('http://localhost:3000');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error || '', /restricted|localhost/i);
  });

  await it('blocks localhost.localdomain', () => {
    const res = normalizeUrl('http://localhost.localdomain');
    assert.strictEqual(res.isValid, false);
  });

  await it('blocks internal .local and .internal domain suffixes', () => {
    const res1 = normalizeUrl('http://my-service.local');
    assert.strictEqual(res1.isValid, false);
    assert.match(res1.error || '', /prohibited/i);

    const res2 = normalizeUrl('http://database.internal');
    assert.strictEqual(res2.isValid, false);
    assert.match(res2.error || '', /prohibited/i);
  });

  await it('blocks cloud metadata hostnames', () => {
    const res = normalizeUrl('http://metadata.google.internal/computeMetadata/v1');
    assert.strictEqual(res.isValid, false);
  });

  console.log('\n--- 4. Private IP Blocking (SSRF) ---');
  await it('blocks 127.0.0.1 loopback', () => {
    assert.strictEqual(isPrivateOrBlockedIp('127.0.0.1'), true);
    const res = normalizeUrl('http://127.0.0.1:8080');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error || '', /private|loopback|SSRF/i);
  });

  await it('blocks 10.0.0.0/8 private range', () => {
    assert.strictEqual(isPrivateOrBlockedIpv4('10.0.1.5'), true);
    assert.strictEqual(isPrivateOrBlockedIpv4('10.255.255.255'), true);
    const res = normalizeUrl('http://10.1.2.3');
    assert.strictEqual(res.isValid, false);
  });

  await it('blocks 172.16.0.0/12 private range', () => {
    assert.strictEqual(isPrivateOrBlockedIpv4('172.16.0.1'), true);
    assert.strictEqual(isPrivateOrBlockedIpv4('172.31.255.254'), true);
    // 172.32.0.1 is public
    assert.strictEqual(isPrivateOrBlockedIpv4('172.32.0.1'), false);
  });

  await it('blocks 192.168.0.0/16 private range', () => {
    assert.strictEqual(isPrivateOrBlockedIpv4('192.168.1.1'), true);
    assert.strictEqual(isPrivateOrBlockedIpv4('192.168.254.254'), true);
  });

  await it('blocks 169.254.169.254 cloud metadata link-local', () => {
    assert.strictEqual(isPrivateOrBlockedIpv4('169.254.169.254'), true);
    const res = normalizeUrl('http://169.254.169.254/latest/meta-data');
    assert.strictEqual(res.isValid, false);
  });

  await it('blocks 0.0.0.0/8 and broadcast 255.255.255.255', () => {
    assert.strictEqual(isPrivateOrBlockedIpv4('0.0.0.0'), true);
    assert.strictEqual(isPrivateOrBlockedIpv4('255.255.255.255'), true);
  });

  await it('blocks IPv6 loopback ::1 and private fc00::/7 ranges', () => {
    assert.strictEqual(isPrivateOrBlockedIpv6('::1'), true);
    assert.strictEqual(isPrivateOrBlockedIpv6('fc00::1'), true);
    assert.strictEqual(isPrivateOrBlockedIpv6('fd12:3456:789a::1'), true);
    assert.strictEqual(isPrivateOrBlockedIpv6('fe80::1'), true);
  });

  await it('permits valid public IP addresses', () => {
    assert.strictEqual(isPrivateOrBlockedIpv4('8.8.8.8'), false);
    assert.strictEqual(isPrivateOrBlockedIpv4('1.1.1.1'), false);
    assert.strictEqual(isPrivateOrBlockedIpv4('104.21.34.112'), false);
  });

  console.log('\n--- 5. Suspicious URL Patterns ---');
  await it('detects punycode homoglyphs', () => {
    const res = analyzeUrlPatterns('xn--pple-43d.com', '/', false);
    assert.strictEqual(res.evidence.hasPunycodeOrIdn, true);
    assert.ok(res.urlSignalsList.includes('punycode_idn'));
  });

  await it('detects excessive subdomains', () => {
    const res = analyzeUrlPatterns('a.b.c.d.e.target.com', '/', false);
    assert.strictEqual(res.evidence.excessiveSubdomains, true);
    assert.ok(res.urlSignalsList.includes('excessive_subdomains'));
  });

  await it('detects excessive hyphens', () => {
    const res = analyzeUrlPatterns('chase-security-update-verify-login.online', '/', false);
    assert.strictEqual(res.evidence.excessiveHyphens, true);
    assert.ok(res.urlSignalsList.includes('excessive_hyphens'));
  });

  await it('detects brand impersonation cues in third-party host', () => {
    const res = analyzeUrlPatterns('paypal-security-update.xyz', '/', false);
    assert.strictEqual(res.evidence.brandSpoofRisk, 'PayPal');
  });

  await it('detects userinfo in URL (user:pass@host)', () => {
    const parsed = new URL('https://admin:secret@malicious.com');
    const res = analyzeUrlPatterns('malicious.com', '/', false, parsed);
    assert.strictEqual(res.evidence.hasUserInfoInUrl, true);
    assert.ok(res.urlSignalsList.includes('userinfo_in_url'));
  });

  await it('detects sensitive keywords in URL path', () => {
    const res = analyzeUrlPatterns('mysite.org', '/login/verification/update', false);
    assert.ok(res.evidence.suspiciousKeywordsFound.length >= 2);
  });

  console.log('\n--- 6. Security Header Detection (Present / Missing / Unavailable) ---');
  await it('returns present for headers that exist in response', () => {
    const headers = {
      'strict-transport-security': 'max-age=31536000',
      'content-security-policy': "default-src 'self'",
      'x-frame-options': 'DENY',
    };
    const res = analyzeSecurityHeaders(headers, true);
    assert.strictEqual(res.evidence.strictTransportSecurity, 'present');
    assert.strictEqual(res.evidence.contentSecurityPolicy, 'present');
    assert.strictEqual(res.evidence.xFrameOptions, 'present');
    assert.strictEqual(res.evidence.xContentTypeOptions, 'missing');
  });

  await it('returns missing for absent headers on reachable host without claiming fraud', () => {
    const headers = { 'content-type': 'text/html' };
    const res = analyzeSecurityHeaders(headers, true);
    assert.strictEqual(res.evidence.contentSecurityPolicy, 'missing');
    assert.strictEqual(res.evidence.strictTransportSecurity, 'missing');
    assert.strictEqual(res.evidence.xFrameOptions, 'missing');
    // Ensure signal description explains hardening rather than fraud
    const hardeningSignal = res.signals.find((s) => s.id === 'headers-missing-hardening');
    assert.ok(hardeningSignal);
    assert.match(hardeningSignal.explanation, /hardening observation, not proof of malice/i);
  });

  await it('returns unavailable for security headers when host is unreachable', () => {
    const res = analyzeSecurityHeaders({}, false);
    assert.strictEqual(res.evidence.contentSecurityPolicy, 'unavailable');
    assert.strictEqual(res.evidence.strictTransportSecurity, 'unavailable');
    assert.strictEqual(res.evidence.xFrameOptions, 'unavailable');
  });

  console.log('\n--- 7. Unavailable Data & Provider Architecture ---');
  await it('returns Domain age: unavailable without fabricating age', async () => {
    const domainInfo = await domainInfoProvider.getDomainInfo('example.com');
    assert.strictEqual(domainInfo.age, 'unavailable');
    assert.strictEqual(domainInfo.createdDate, 'unavailable');
    assert.ok(domainInfo.provider);
  });

  console.log('\n--- 8. Gemini Response Validation & Deterministic Fallback ---');
  await it('synthesizes structured response with strict schema compliance', async () => {
    const payload = {
      structuredEvidence: {
        target: { inputUrl: 'https://example.com', normalizedUrl: 'https://example.com', hostname: 'example.com' },
        http: { statusCode: 200, responseTimeMs: 150, redirectCount: 0, finalUrl: 'https://example.com' },
        tls: { https: true, certificateValid: true, issuer: 'DigiCert', expiresAt: '2027-01-01' },
        dns: { a: ['93.184.216.34'], aaaa: 'unavailable', cname: 'unavailable', mx: 'unavailable' },
        securityHeaders: {
          contentSecurityPolicy: 'missing' as const,
          strictTransportSecurity: 'present' as const,
          xContentTypeOptions: 'present' as const,
          xFrameOptions: 'missing' as const,
          referrerPolicy: 'present' as const,
          permissionsPolicy: 'missing' as const,
        },
        urlSignals: [],
        domain: { age: 'unavailable' as const },
      },
      signals: [
        {
          severity: 'informational',
          category: 'transport',
          title: 'HTTPS encryption verified',
          evidence: 'Valid TLS connection',
        },
      ],
      calculatedBaseScore: 14,
      calculatedRiskLevel: 'LOW RISK' as const,
    };

    const res = await generateGeminiAnalysis(payload);
    assert.ok(res.aiAnalysis);
    assert.ok(typeof res.finalRiskScore === 'number');
    assert.ok(res.finalRiskScore >= 8 && res.finalRiskScore <= 95);
    assert.ok(Array.isArray(res.recommendations));
    assert.ok(res.recommendations.length > 0);
    assert.ok(res.aiAnalysis.limitations);
  });

  console.log('\n--- 9. Message Analyzer Integration ---');
  await it('analyzes message text and extracts urgency & payment pressure', async () => {
    const sampleMsg = 'URGENT: Your account will be suspended within 24 hours unless you pay $50 in bitcoin to restore access.';
    const res = await runMessageAnalysis(sampleMsg);
    assert.strictEqual(res.type, 'message');
    assert.ok(res.assessment.score >= 40);
    assert.ok(res.signals.some((s) => s.id.includes('urgency')));
    assert.ok(res.signals.some((s) => s.id.includes('payment')));
  });

  console.log('\n========================================');
  console.log(`Results: ${passedTests}/${totalTests} tests passed successfully.`);
  console.log('========================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAllTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
