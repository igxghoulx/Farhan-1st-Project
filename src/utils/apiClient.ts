/**
 * TrustLens AI - Safe API Client Utility
 * Prevents "Unexpected end of JSON input" errors by safely checking response body,
 * headers, and status before attempting JSON parsing.
 */

export async function safeFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (netErr: any) {
    throw new Error(`Network connection error: ${netErr.message || 'Server is unreachable'}`);
  }

  const rawText = await res.text();

  // Handle empty body
  if (!rawText || rawText.trim() === '') {
    if (!res.ok) {
      throw new Error(
        `Server returned empty response (HTTP ${res.status} ${res.statusText}). If deployed to a static host (like Netlify), the Node.js backend server (/api/*) is not running.`
      );
    }
    throw new Error('Server returned an empty response body when JSON was expected.');
  }

  // Handle HTML response (e.g. Netlify 404 page or index.html SPA fallback)
  if (
    rawText.trim().startsWith('<!DOCTYPE') ||
    rawText.trim().startsWith('<html') ||
    rawText.includes('<head>')
  ) {
    throw new Error(
      `Received an HTML page instead of JSON API response (HTTP ${res.status}). On static hosts like Netlify, the Express backend API (/api/*) is not present unless running as a full-stack Node.js server.`
    );
  }

  // Parse JSON safely
  try {
    const data = JSON.parse(rawText);
    if (!res.ok) {
      throw new Error(data.error || `Server responded with status ${res.status}`);
    }
    return data as T;
  } catch (jsonErr: any) {
    if (jsonErr.message && !jsonErr.message.includes('JSON')) {
      throw jsonErr;
    }
    throw new Error(
      `Failed to parse response as JSON (HTTP ${res.status}): ${rawText.slice(0, 120)}`
    );
  }
}
