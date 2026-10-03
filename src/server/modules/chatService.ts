/**
 * TrustLens AI - Server-Side Gemini Multi-Turn Chat Service
 * Handles multi-turn conversations with persona-specific system instructions
 * and model selection (gemini-3.5-flash, gemini-3.1-flash-lite, gemini-3.1-pro-preview).
 */

import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ChatPersona = 'general' | 'fast' | 'complex';

export interface ChatRequestPayload {
  messages: ChatMessage[];
  persona?: ChatPersona;
  context?: string; // Optional context such as report details or current target
}

export interface ChatResponsePayload {
  reply: string;
  modelUsed: string;
  persona: ChatPersona;
}

const SYSTEM_INSTRUCTIONS: Record<ChatPersona, string> = {
  general: `You are TrustLens AI Cyber Advisor, an approachable, highly knowledgeable cybersecurity and digital safety assistant.
Your goal is to help everyday people protect themselves against scams, deceptive websites, phishing messages, impersonation, and digital fraud.

GUIDELINES:
- Communicate in clear, friendly, and accessible English. Avoid unnecessary technical jargon.
- When explaining technical concepts, provide relatable analogies (e.g. comparing HTTPS to a sealed envelope).
- Focus on practical, actionable advice: how to verify authenticity, what to avoid clicking, and what to do if personal information was accidentally shared.
- Never guarantee that an external entity is 100% safe or 100% fraudulent without independent verification.
- Write clean, natural sentences without excessive asterisks or markdown clutter.`,

  fast: `You are TrustLens Fast Triage Assistant, designed for rapid scam checks and urgent safety advice.
Your goal is to provide immediate, punchy, and concise answers to help users decide whether to trust a suspicious link, SMS, or email right now.

GUIDELINES:
- Keep answers concise and scannable (under 150 words when possible).
- Use bullet points for immediate red flags.
- Give a clear 1-line verdict: [Likely Scam / Be Very Cautious / Appears Standard].
- List the immediate 1-2 actions to take right now (e.g., "Do not click", "Delete and block").
- Write clean, natural text without excessive markdown asterisks.`,

  complex: `You are TrustLens Lead Security Forensics Analyst, an advanced technical cybersecurity engineer.
Your role is to evaluate complex security questions, deep infrastructure configurations, RFC specifications, cryptography, and attack vectors.

GUIDELINES:
- Provide thorough technical reasoning covering transport protocols (TLS 1.2/1.3, cipher suites), DNS configurations (DNSSEC, CNAME, SPF/DKIM/DMARC), HTTP defensive headers (HSTS, CSP, X-Frame-Options), and authentication schemes.
- Address threat vectors like Punycode homoglyphs, SSRF, MITM, credential harvesting, subresource integrity, and clickjacking.
- Reference relevant IETF RFCs and OWASP guidelines where applicable.
- Keep formatting clean and readable without excessive asterisks.`,
};

const PERSONA_MODELS: Record<ChatPersona, string> = {
  general: 'gemini-3.5-flash',
  fast: 'gemini-3.1-flash-lite',
  complex: 'gemini-3.1-pro-preview',
};

export async function handleChatMessage(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
  const persona: ChatPersona = payload.persona || 'general';
  let targetModel = PERSONA_MODELS[persona] || 'gemini-3.5-flash';
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return {
      reply: "Gemini API key is not configured on the server. Please ensure GEMINI_API_KEY is provided in your environment settings.",
      modelUsed: 'mock-offline',
      persona,
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Format multi-turn conversation history for @google/genai
  const rawMessages = payload.messages || [];
  if (rawMessages.length === 0) {
    throw new Error('Chat history is empty.');
  }

  // Prepend context if provided
  let systemInstruction = SYSTEM_INSTRUCTIONS[persona];
  if (payload.context) {
    systemInstruction += `\n\nCURRENT DIAGNOSTIC CONTEXT:\nThe user is currently reviewing this assessment data:\n${payload.context}`;
  }

  // Build the contents array
  const contents = rawMessages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  try {
    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config: {
        systemInstruction,
        temperature: persona === 'complex' ? 0.3 : 0.7,
      },
    });

    const replyText = response.text || 'I analyzed your inquiry, but could not produce a response.';
    return {
      reply: replyText,
      modelUsed: targetModel,
      persona,
    };
  } catch (err: any) {
    console.warn(`[ChatService] Failed with model ${targetModel}, attempting fallback:`, err.message);

    // If complex (gemini-3.1-pro-preview) encounters quota or unavailability, fallback to gemini-3.8-flash
    if (targetModel !== 'gemini-3.8-flash') {
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        return {
          reply: fallbackResponse.text || 'I analyzed your inquiry, but could not produce a response.',
          modelUsed: 'gemini-3.8-flash (fallback)',
          persona,
        };
      } catch (fallbackErr: any) {
        console.error('[ChatService] Fallback also failed:', fallbackErr);
        throw new Error(fallbackErr.message || 'Unable to communicate with the AI model right now.');
      }
    }

    throw err;
  }
}
