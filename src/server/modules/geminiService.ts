/**
 * Real Server-Side Gemini Analysis Service
 * Receives ONLY structured evidence and deterministic signals.
 * Produces evidence-grounded risk reasoning, key findings, limitations, and recommendations.
 *
 * Strict Security & Analytical Rules:
 * - NEVER claims a website is definitely a scam or fraud.
 * - NEVER invents technical evidence, certificate data, or domain age.
 * - Does NOT treat missing security headers as proof of malicious intent.
 * - Treats risk score as an automated risk assessment based on available signals, NOT probability of scam.
 */

import { GoogleGenAI, Type } from '@google/genai';
import {
  AIAnalysisOutput,
  RiskLevel,
  SafetyRecommendation,
  SecuritySignal,
  StructuredUrlAnalysis,
} from '../../types/analysis.js';

export interface GeminiInputPayload {
  structuredEvidence: StructuredUrlAnalysis | Record<string, unknown>;
  signals: Array<{
    severity: string;
    category: string;
    title: string;
    description?: string;
    explanation?: string;
    evidence: string;
    source?: string;
  }>;
  calculatedBaseScore: number;
  calculatedRiskLevel: RiskLevel;
}

export interface GeminiStructuredOutput {
  summary: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number;
  keyFindings: string[];
  recommendations: Array<{
    id?: string;
    action: string;
    rationale: string;
    priority?: 'Immediate' | 'Important' | 'Standard Advisory';
  }>;
  limitations: string[];
}

export interface GeminiAnalysisResult {
  aiAnalysis: AIAnalysisOutput;
  recommendations: SafetyRecommendation[];
  finalRiskScore: number;
  finalRiskLevel: RiskLevel;
}

export async function generateGeminiAnalysis(
  payload: GeminiInputPayload
): Promise<GeminiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return generateDeterministicFallback(
      payload,
      'Deterministic Evidence Engine (GEMINI_API_KEY unconfigured)'
    );
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemPrompt = `You are the lead cybersecurity analyst engine for TrustLens AI.
Your role is to produce objective, evidence-grounded risk commentary based STRICTLY on the structured technical evidence and detected signals provided to you.

COMMUNICATION STYLE FOR EVERYDAY USERS:
- Write for everyday people who are not cybersecurity experts. Use simple, conversational English.
- Avoid dense academic or technical jargon. When mentioning technical concepts (like certificates or headers), immediately explain what it means in everyday language (e.g., "missing safety locks" or "private encrypted connection").
- Provide clear, direct advice on what the user should do (e.g., "Safe to browse", "Avoid typing passwords", "Close the tab").

STRICT CONSTRAINTS:
1. NEVER declare or confirm that a target is definitely a "scam", "fraud", or "malicious". Use wording like "risk assessment", "potential risk indicators", and "detected signals".
2. DO NOT INVENT evidence, domain age, or certificate data. If a field says "unavailable", treat it as unavailable.
3. DO NOT claim that missing security headers prove malicious intent. They are defensive-hardening observations.
4. DO NOT treat HTTPS as proof of trustworthiness.
5. The risk score must represent an automated risk assessment based strictly on available signals, NOT a probability percentage of fraud.
6. Provide actionable, practical safety recommendations.`;

    const userPrompt = `Review this structured security evidence and deterministic signals:

STRUCTURED EVIDENCE:
${JSON.stringify(payload.structuredEvidence, null, 2)}

DETECTED SIGNALS:
${JSON.stringify(payload.signals, null, 2)}

PRELIMINARY RISK HEURISTIC:
Score: ${payload.calculatedBaseScore}/100 (${payload.calculatedRiskLevel})

Return structured JSON conforming to the requested schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Executive explanation of the observable evidence without definitive accusations of fraud.',
            },
            riskLevel: {
              type: Type.STRING,
              enum: ['low', 'moderate', 'high', 'critical'],
              description: 'Risk assessment category based on observable indicators.',
            },
            riskScore: {
              type: Type.NUMBER,
              description: 'Automated risk assessment score between 0 and 100.',
            },
            keyFindings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key technical observations grounded strictly in the input evidence.',
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['Immediate', 'Important', 'Standard Advisory'] },
                },
                required: ['action', 'rationale', 'priority'],
              },
            },
            limitations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Explicit limitations of surface telemetry (e.g. unknown domain age, private backend state).',
            },
          },
          required: ['summary', 'riskLevel', 'riskScore', 'keyFindings', 'recommendations', 'limitations'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    const parsed: GeminiStructuredOutput = JSON.parse(text);

    // Harmonize risk score with bounds (8 - 95)
    let score = Math.round(Number(parsed.riskScore) || payload.calculatedBaseScore);
    score = Math.max(8, Math.min(95, score));

    let riskLevel: RiskLevel = 'LOW RISK';
    if (score >= 75 || parsed.riskLevel === 'high' || parsed.riskLevel === 'critical') {
      riskLevel = parsed.riskLevel === 'critical' ? 'CRITICAL RISK' : 'HIGH RISK';
    } else if (score >= 45 || parsed.riskLevel === 'moderate') {
      riskLevel = 'MODERATE RISK';
    }

    const aiAnalysis: AIAnalysisOutput = {
      overview: parsed.summary,
      technicalContext: parsed.keyFindings.join(' · '),
      behavioralContext: 'Observable URL structure and destination indicators evaluated against deception heuristics.',
      limitations: parsed.limitations.join(' ') || 'Automated risk evaluation is limited to observable surface telemetry and does not constitute proof of fraud or safety.',
      modelUsed: 'Gemini 3.8 Flash (Grounded on Structured Technical Telemetry)',
      keyFindings: parsed.keyFindings,
    };

    const recommendations: SafetyRecommendation[] = (parsed.recommendations || []).map((r, i) => ({
      id: r.id || `rec-${i + 1}`,
      action: r.action,
      rationale: r.rationale,
      priority: r.priority || 'Important',
    }));

    return {
      aiAnalysis,
      recommendations: recommendations.length > 0 ? recommendations : getDefaultRecommendations(score),
      finalRiskScore: score,
      finalRiskLevel: riskLevel,
    };
  } catch (err: unknown) {
    console.warn('[Gemini Service] Fallback triggered:', err);
    return generateDeterministicFallback(
      payload,
      `Deterministic Synthesis (Gemini fallback: ${err instanceof Error ? err.message : 'service error'})`
    );
  }
}

/**
 * Deterministic fallback that generates compliant output without calling Gemini.
 */
function generateDeterministicFallback(
  payload: GeminiInputPayload,
  modelUsedNote: string
): GeminiAnalysisResult {
  const score = payload.calculatedBaseScore;
  const level = payload.calculatedRiskLevel;

  const keyFindings: string[] = payload.signals.map((s) => s.title);

  let summary = '';
  if (score >= 75) {
    summary = `Warning signs were detected that look suspicious or unusual. We strongly recommend not entering passwords, credit cards, or personal info on this page. Close the window if you are not 100% sure who sent you here.`;
  } else if (score >= 45) {
    summary = `Some safety precautions are missing or unusual on this website. It is fine for general reading, but we suggest being careful before buying anything or typing your login credentials.`;
  } else {
    summary = `This website passed standard safety checks and has an active, normal setup. You can safely browse, but always remember to keep your personal passwords safe.`;
  }

  const limitations = [
    'Assessment is based exclusively on observable external telemetry at the time of inquiry.',
    'Domain registration age was unavailable and was not fabricated.',
    'TrustLens cannot inspect private backend code, database records, or offline organization integrity.',
    'Automated risk assessment is advisory guidance, not legal or definitive proof of fraud.',
  ];

  return {
    aiAnalysis: {
      overview: summary,
      technicalContext: keyFindings.slice(0, 3).join(' · ') || 'Evaluated transport, DNS, and header configurations.',
      behavioralContext: 'Analyzed domain composition, brand references, and parameter tokens.',
      limitations: limitations.join(' '),
      modelUsed: modelUsedNote,
      keyFindings,
    },
    recommendations: getDefaultRecommendations(score),
    finalRiskScore: score,
    finalRiskLevel: level,
  };
}

function getDefaultRecommendations(score: number): SafetyRecommendation[] {
  if (score >= 70) {
    return [
      {
        id: 'rec-1',
        action: 'Do not enter passwords, credit cards, or two-factor authentication codes',
        rationale: 'Elevated technical or structural anomalies suggest potential credential interception risk.',
        priority: 'Immediate',
      },
      {
        id: 'rec-2',
        action: 'Verify the organization through an independent, authenticated channel',
        rationale: 'Search for the official company directory or phone number directly rather than following links.',
        priority: 'Immediate',
      },
      {
        id: 'rec-3',
        action: 'Inspect full browser address bar before any submission',
        rationale: 'Ensure the top-level domain and root registrar correspond to the legitimate entity.',
        priority: 'Important',
      },
    ];
  }

  if (score >= 40) {
    return [
      {
        id: 'rec-1',
        action: 'Check domain spelling and certificate issuer carefully',
        rationale: 'Lookalike domains often acquire valid automated certificates to appear authentic.',
        priority: 'Important',
      },
      {
        id: 'rec-2',
        action: 'Use buyer-protected payment methods if purchasing',
        rationale: 'Credit cards offer dispute protections that wire transfers or crypto lack.',
        priority: 'Important',
      },
    ];
  }

  return [
    {
      id: 'rec-1',
      action: 'Maintain standard defensive cyber hygiene',
      rationale: 'Even established platforms can suffer third-party credential compromise.',
      priority: 'Standard Advisory',
    },
    {
      id: 'rec-2',
      action: 'Enable multi-factor authentication (MFA) on critical accounts',
      rationale: 'Protects account access even in the event of credential exposure.',
      priority: 'Standard Advisory',
    },
  ];
}
