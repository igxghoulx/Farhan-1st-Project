# TrustLens AI

> **"Check before you trust."**  
> An open cybersecurity web tool that analyzes observable technical infrastructure, domain indicators, and linguistic cues to provide automated risk assessments with AI-grounded explanations.

---

## 1. Project Overview

TrustLens AI is a free cybersecurity web application designed to help everyday internet users, consumers, and security analysts evaluate potentially suspicious websites, links, SMS messages, phishing emails, and online offers before entering credentials or executing financial transactions.

### Core Philosophy
Traditional "AI scam detectors" often act as black boxes that hallucinate arbitrary fraud percentages without justification. TrustLens rejects this approach. Instead, TrustLens operates on a strict empirical pipeline:

$$\text{User} \longrightarrow \text{Frontend} \longrightarrow \text{Server API} \longrightarrow \text{URL Analyzer} \longrightarrow \text{Evidence Engine} \longrightarrow \text{Gemini AI} \longrightarrow \text{Risk Assessment} \longrightarrow \text{Result}$$

Every finding is tied directly to verifiable evidence (e.g., domain homoglyphs, brand typosquatting, missing HSTS headers, short-lived TLS certificates, or irreversible payment prompts).

---

## 2. Real Architecture Flow

```text
       [ User Action ]
              │
              ▼
    ┌──────────────────┐
    │     Frontend     │  (React 19, Tailwind CSS v4, Progressive Stage Stream)
    └─────────┬────────┘
              │  POST /api/analyze/url/stream
              ▼
    ┌──────────────────┐
    │    Server API    │  (Express backend, Sliding-window Rate Limiter)
    └─────────┬────────┘
              │
              ▼
    ┌──────────────────┐
    │   URL Analyzer   │  (Strict Normalization, RFC 3986 Syntax, SSRF Pre-flight)
    └─────────┬────────┘
              │
              ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                   Evidence Engine Modules                   │
    ├─────────────────────────────────────────────────────────────┤
    │  • DNS Analyzer (A, AAAA, CNAME, MX + Post-DNS SSRF Check)  │
    │  • HTTP Analyzer (Status, Latency, Redirects, Byte Limits)   │
    │  • TLS Analyzer (Real Handshake, Cert Validity, CAs)        │
    │  • Security Headers (Present / Missing / Unavailable)       │
    │  • URL Patterns (Punycode, Subdomains, Hyphens, Port, TLD)  │
    │  • Domain Info Provider (Provider Interface: "unavailable") │
    └─────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                    Structured Evidence                      │
    │  (Single Structured Telemetry Object + Deterministic Signal)│
    └─────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
    ┌──────────────────┐
    │     Gemini AI    │  (Server-Side Gemini 3.8 Flash, Strict JSON Schema)
    └─────────┬────────┘
              │
              ▼
    ┌──────────────────┐
    │ Risk Assessment  │  (Empirical 0-100 Score, Prioritized Defenses)
    └─────────┬────────┘
              │
              ▼
    ┌──────────────────┐
    │   Result Page    │  (Verifiable Cybersecurity Report & Share Card)
    └──────────────────┘
```

---

## 3. Real Technical Engine Modules

TrustLens separates analysis concerns into dedicated, independently extensible modules located in `src/server/modules/`:

| Module | Location | Real Implementation Details |
| :--- | :--- | :--- |
| **URL Normalizer** | `src/server/modules/urlNormalizer.ts` | Validates syntax, normalizes protocol, removes trailing dots, blocks localhost and private IPv4/IPv6 ranges (SSRF defense). |
| **DNS Analyzer** | `src/server/modules/dnsAnalyzer.ts` | Resolves real A, AAAA, CNAME, and MX records via Node `dns/promises`. Re-verifies all resolved IPs against SSRF blocklist to prevent DNS-rebinding attacks. |
| **TLS/SSL Analyzer** | `src/server/modules/tlsAnalyzer.ts` | Performs real TLS socket handshake via Node `tls.connect` on port 443 with `rejectUnauthorized: false` to inspect peer certificates, expiration, and CAs without crashing. |
| **HTTP Protocol Analyzer** | `src/server/modules/httpAnalyzer.ts` | Follows redirects up to 6 hops, enforces 6-second timeout, limits body downloads to 16KB max, and tracks latency. |
| **Security Headers Analyzer** | `src/server/modules/securityHeaderAnalyzer.ts` | Audits response headers for HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy. Returns `present`, `missing`, or `unavailable`. |
| **URL Pattern Analyzer** | `src/server/modules/urlPatternAnalyzer.ts` | Analyzes lexical traits: excessive subdomains, long hostname (>50 chars), punycode IDN (`xn--`), embedded credentials, and brand typosquatting. |
| **Domain Info Provider** | `src/server/modules/domainInfoProvider.ts` | Abstract provider interface. Explicitly returns `Domain age: unavailable` without fabricating registration dates. |
| **Text & Message Analyzer** | `src/server/modules/textAnalyzer.ts` | Identifies urgency pressure, irreversible payment demands (crypto, gift cards, wires), and courier/bank impersonation lures. |
| **Gemini AI Service** | `src/server/modules/geminiService.ts` | Server-side integration with `@google/genai` (Gemini 3.8 Flash). Takes strictly structured evidence and deterministic signals to produce evidence-grounded reasoning. |
| **Analysis Orchestrator** | `src/server/modules/analysisOrchestrator.ts` | Coordinates the entire pipeline, emits real-time stage progress events, and computes empirical risk scores. |

---

## 4. Security Considerations & SSRF Defenses

- **Server-Side API Key Isolation:** `process.env.GEMINI_API_KEY` is executed exclusively on the Express backend and is never bundled or sent to the browser.
- **Client Execution Safeguards:** TrustLens never executes scripts from scanned websites or loads target URLs into user iframes.
- **SSRF Blocklist (Pre-flight & Post-DNS Resolution):**
  - Loopback (`localhost`, `127.0.0.0/8`, `::1`)
  - Private IPv4 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
  - Link-Local & Cloud Metadata (`169.254.0.0/16`, `169.254.169.254`)
  - Carrier-Grade NAT (`100.64.0.0/10`)
  - Private IPv6 (`fc00::/7`, `fe80::/10`)
  - Internal domains (`.local`, `.internal`, `.lan`, `metadata.google.internal`)
  - Redirect validation (every redirect hop is re-validated against the SSRF filter before connecting).
- **Download Limits & Timeouts:** Requests time out after 6 seconds; response body streams are terminated after reading initial bytes to prevent denial-of-service via large payloads.

---

## 5. Security & Technical Limitations

> **Important Operational Boundaries**
>
> 1. **Surface Telemetry Only:** TrustLens inspects externally observable infrastructure (DNS, TLS, HTTP headers, domain lexical structure, and body text). It cannot inspect private internal server code, backend databases, or offline corporate operations.
> 2. **Not Definitive Proof of Fraud:** High risk scores reflect technical abnormalities, missing defensive protections, or psychological urgency indicators. They do **not** legally prove that an entity is fraudulent.
> 3. **Unavailable Data is Not Safe:** If DNS records or headers are marked "unavailable" (e.g., due to firewalling or network downtime), TrustLens treats them as unknown rather than safe.
> 4. **HTTPS Alone is Not Proof of Safety:** Modern phishing kits routinely provision valid 90-day certificates from automated Certificate Authorities.
> 5. **Domain Age Caveat:** Without an authenticated enterprise WHOIS/RDAP subscription, domain age is labeled as `unavailable`. TrustLens never fabricates domain ages.

---

## 6. Local Development & Testing

### Running Tests
TrustLens includes a 28-assertion test suite covering normalization, SSRF blocking, redirect tracing, pattern heuristics, tri-state header auditing, and Gemini validation:
```bash
npm test
```

### Running Locally
```bash
# Start full-stack server (Express + Vite middlewares)
npm run dev

# Open in browser
http://localhost:3000
```

### Building for Production
```bash
npm run build
npm start
```
