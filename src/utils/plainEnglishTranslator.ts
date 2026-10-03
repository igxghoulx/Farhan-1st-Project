/**
 * Plain English Translation Engine for TrustLens AI
 * Translates complex cybersecurity terminology and server diagnostics
 * into friendly, relatable explanations that anyone can understand immediately.
 */

import { SecuritySignal } from '../types/analysis.js';

export interface PlainEnglishSignal {
  friendlyTitle: string;
  friendlyExplanation: string;
  whatToDo: string;
  iconType: 'warning' | 'danger' | 'info' | 'shield';
}

export function translateSignalToPlainEnglish(signal: SecuritySignal): PlainEnglishSignal {
  const id = signal.id.toLowerCase();
  const title = signal.title.toLowerCase();

  // 1. Cleartext / No HTTPS
  if (id.includes('unencrypted') || id.includes('cleartext') || title.includes('unencrypted')) {
    return {
      friendlyTitle: 'Unprotected Connection (No Lock Icon)',
      friendlyExplanation:
        'This website does not have a secure lock on it. Anything you type (like passwords or credit card numbers) travels across the internet openly like an unsealed postcard, and anyone on public Wi-Fi could potentially see it.',
      whatToDo: 'Do not enter passwords, credit cards, or personal information on this page.',
      iconType: 'danger',
    };
  }

  // 2. Self-signed or untrusted certificate
  if (id.includes('self-signed') || id.includes('untrusted-cert') || title.includes('self-signed')) {
    return {
      friendlyTitle: 'Untrusted Security Certificate',
      friendlyExplanation:
        "The security badge on this website wasn't verified by a trusted authority. It's like someone showing you a homemade ID card instead of an official driver's license.",
      whatToDo: 'Leave the website if your browser shows a red warning screen.',
      iconType: 'danger',
    };
  }

  // 3. Expired certificate
  if (id.includes('expired-cert') || title.includes('expired')) {
    return {
      friendlyTitle: 'Expired Security Certificate',
      friendlyExplanation:
        "The website owners forgot to renew their official security pass, or the site may be abandoned. Your browser will likely show a warning screen.",
      whatToDo: 'Do not enter private information until the owners renew their security certificate.',
      iconType: 'warning',
    };
  }

  // 4. Brand spoofing / Lookalike domain
  if (id.includes('brand-impersonation') || title.includes('brand name present') || id.includes('spoof')) {
    return {
      friendlyTitle: 'Lookalike Name Copying a Famous Brand',
      friendlyExplanation:
        "The web address includes the name of a well-known company (like PayPal, Apple, or Chase), but the real website belongs to someone else. Scammers frequently use this trick to trick people into giving away passwords.",
      whatToDo: 'Never enter your account credentials here. Go directly to the official website by typing its real name into your browser.',
      iconType: 'danger',
    };
  }

  // 5. Direct IP address
  if (id.includes('ip-hostname') || id.includes('ip-direct') || title.includes('numerical ip')) {
    return {
      friendlyTitle: 'Raw Number Address Instead of a Name',
      friendlyExplanation:
        'This website uses a raw number code (like 192.168...) instead of a normal web name (like google.com). Legitimate businesses almost never ask customers to visit raw number addresses.',
      whatToDo: 'Be very cautious. Do not enter personal details on number-only links.',
      iconType: 'warning',
    };
  }

  // 6. Punycode / Special characters trick
  if (id.includes('punycode') || title.includes('punycode') || id.includes('homograph')) {
    return {
      friendlyTitle: 'Lookalike Character Trick (Homoglyph)',
      friendlyExplanation:
        'This website uses foreign or hidden alphabet characters that look identical to regular letters to the human eye, but actually lead to a completely different server.',
      whatToDo: 'Be on high alert. This is a common tactic used in fake copycat sites.',
      iconType: 'danger',
    };
  }

  // 7. Embedded userinfo (user:pass@)
  if (id.includes('userinfo') || title.includes('userinfo')) {
    return {
      friendlyTitle: 'Sneaky Address Bar Trick',
      friendlyExplanation:
        'The link puts words before an "@" symbol. Browsers ignore everything before the "@", which scammers use to make a link look like a trusted company when it actually goes somewhere else.',
      whatToDo: 'Do not open this link or enter any login credentials.',
      iconType: 'danger',
    };
  }

  // 8. Excessive subdomains or long hostname
  if (id.includes('excessive-subdomains') || id.includes('long-hostname') || title.includes('subdomain')) {
    return {
      friendlyTitle: 'Overly Complex or Confusing Web Address',
      friendlyExplanation:
        'The web address is unusually long and stacked with multiple names. Fake sites often do this so the real destination is pushed off the edge of your phone screen.',
      whatToDo: 'Look closely at the very end of the website name before the ".com" to see who really owns it.',
      iconType: 'warning',
    };
  }

  // 9. Excessive hyphens
  if (id.includes('excessive-hyphens') || title.includes('hyphens')) {
    return {
      friendlyTitle: 'Excessive Hyphens in Web Name',
      friendlyExplanation:
        'The website name chains multiple words together with dashes (e.g., brand-verify-security-login). Fake sites often do this to sound like official security portals.',
      whatToDo: 'Confirm you are on the company’s real, simple domain name.',
      iconType: 'warning',
    };
  }

  // 10. Multiple redirects
  if (id.includes('redirects') || title.includes('redirect')) {
    return {
      friendlyTitle: 'Link Bounces Between Multiple Websites',
      friendlyExplanation:
        'Clicking this link hops through several different servers before arriving at the final page. This is sometimes used in online ads or to conceal where you are really being sent.',
      whatToDo: 'Check the final address bar in your browser to verify where you actually landed.',
      iconType: 'warning',
    };
  }

  // 11. Missing security headers (hardening)
  if (id.includes('headers') || title.includes('security-hardening')) {
    return {
      friendlyTitle: 'Standard Protective Locks Are Missing',
      friendlyExplanation:
        'The website hasn’t turned on all modern browser safety protections (like anti-clickjacking locks). This does NOT mean it’s a scam, but it does mean the website is less protected against tampering than banks or major web stores.',
      whatToDo: 'Fine for reading articles or browsing, but be cautious with payments.',
      iconType: 'info',
    };
  }

  // 12. Urgent pressure (Text message)
  if (id.includes('urgency') || title.includes('urgency')) {
    return {
      friendlyTitle: 'Pressure & Panic Tactic Detected',
      friendlyExplanation:
        'The message uses high-pressure words like "Urgent!", "Within 24 hours!", or "Account suspended!" to make you panic and act without thinking. This is the #1 social engineering trick.',
      whatToDo: 'Take a deep breath and pause. Legitimate banks and government agencies do not demand immediate panicked action via text.',
      iconType: 'danger',
    };
  }

  // 13. Irreversible payment demand
  if (id.includes('payment') || title.includes('payment') || title.includes('cryptocurrency')) {
    return {
      friendlyTitle: 'Demands Untraceable Payment (Gift Cards / Crypto)',
      friendlyExplanation:
        'The message asks for payment in Bitcoin, gift cards, or wire transfers. Once sent, these payments cannot be refunded or cancelled by any bank.',
      whatToDo: 'NEVER send gift cards or cryptocurrency to anyone claiming to be a company or government agency.',
      iconType: 'danger',
    };
  }

  // 14. Valid HTTPS baseline
  if (id.includes('valid-https') || title.includes('https encryption verified')) {
    return {
      friendlyTitle: 'Connection is Encrypted (Padlock Active)',
      friendlyExplanation:
        'Your connection to this website is private. Note: Even scam websites can have a padlock icon today, so the padlock proves the connection is encrypted, not that the company is honest.',
      whatToDo: 'Good privacy protection, but still verify who you are dealing with.',
      iconType: 'shield',
    };
  }

  // Fallback for any other signal
  return {
    friendlyTitle: signal.title,
    friendlyExplanation: signal.explanation,
    whatToDo: 'Review the details carefully before submitting personal information.',
    iconType: signal.severity === 'CRITICAL' || signal.severity === 'HIGH' ? 'danger' : 'info',
  };
}
