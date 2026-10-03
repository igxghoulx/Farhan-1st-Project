import React, { useState, useRef, useEffect } from 'react';
import { MarkdownRenderer } from '../components/MarkdownRenderer.js';
import { safeFetchJson } from '../utils/apiClient.js';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Cpu,
  RefreshCw,
  Info,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

export type ChatPersona = 'general' | 'fast' | 'complex';

interface ChatPageProps {
  onNavigate: (path: string) => void;
  initialContext?: string;
}

const STARTER_PROMPTS = [
  'A text says my bank account is locked unless I click a link. Is it a scam?',
  'Why do scammers ask to be paid with gift cards or crypto?',
  'Does the padlock icon on a website mean it is 100% safe to shop?',
  'What is Punycode homoglyph spoofing and how can I spot it?',
  'I got an email from "PayPal" with strange spelling. How do I verify it?',
];

export const ChatPage: React.FC<ChatPageProps> = ({ onNavigate, initialContext }) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>(() => {
    const saved = sessionStorage.getItem('trustlens_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall through to initial state
      }
    }
    return [
      {
        id: 'welcome',
        role: 'model',
        text: "Hello! I'm your **TrustLens AI Cyber Assistant** powered by Google Gemini.\n\nAsk me anything about suspicious links, phishing messages, website padlocks, or digital fraud risks. How can I assist your security today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash',
      },
    ];
  });

  const [input, setInput] = useState('');
  const [persona, setPersona] = useState<ChatPersona>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist messages to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('trustlens_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      // Map history for server payload
      const apiMessages = newHistory.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const data = await safeFetchJson<{ reply: string; modelUsed: string }>('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          persona,
          context: initialContext,
        }),
      });

      const modelMessage: ChatMessageItem = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const isStaticHosting = err.message && (err.message.includes('HTML') || err.message.includes('empty'));
      const errorText = isStaticHosting
        ? `⚠️ **Backend Service Offline (Static Hosting):**\n\nThe Gemini AI Chatbot requires the full-stack Node.js server to run. On static hosting providers like Netlify, the server process (\`server.ts\`) is not active. Deploy to a full-stack host (e.g. Render, Railway, Google Cloud Run) or run \`node server.ts\` to enable live chat with Gemini.`
        : `⚠️ **Unable to complete response:** ${err.message || 'Please check your connection and try again.'}`;

      const errorMessage: ChatMessageItem = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear conversation history?')) {
      const reset: ChatMessageItem[] = [
        {
          id: 'welcome-reset',
          role: 'model',
          text: "Conversation cleared. What security question or suspicious link can I help you inspect?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'gemini-3.5-flash',
        },
      ];
      setMessages(reset);
      sessionStorage.removeItem('trustlens_chat_history');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 lens-glow" />

      <div className="relative mx-auto max-w-4xl w-full flex-1 flex flex-col space-y-4">
        {/* Chat Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Return to home"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 shadow-md shadow-cyan-950/40">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  TrustLens AI Chatbot
                </h1>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400">
                Multi-turn cybersecurity assistant powered by Google Gemini
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:border-rose-900/60 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Persona & Model Selection Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#090d16] p-2.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium px-2">Assistance Mode:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setPersona('general')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                persona === 'general'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Cyber Advisor (gemini-3.5-flash)</span>
            </button>

            <button
              onClick={() => setPersona('fast')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                persona === 'fast'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Fast Triage (gemini-3.1-flash-lite)</span>
            </button>

            <button
              onClick={() => setPersona('complex')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                persona === 'complex'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Deep Forensics (gemini-3.1-pro-preview)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-[#090e1a]/80 p-4 sm:p-6 space-y-5 min-h-[420px] max-h-[60vh] shadow-inner">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-sm ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-cyan-950 border border-cyan-800/80 text-cyan-400 shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-md ${
                    isUser
                      ? 'bg-cyan-600 text-white rounded-br-none'
                      : 'bg-[#101728] border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {/* Model header on bot replies */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 pb-1.5 mb-2 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                        <Sparkles className="h-3 w-3" />
                        {msg.modelUsed || 'Gemini'}
                      </span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-white transition-colors"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Check className="h-3 w-3" /> Copied
                          </span>
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Render content cleanly with markdown line breaks */}
                  <div className="space-y-2 break-words">
                    <MarkdownRenderer content={msg.text} />
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`mt-1.5 text-[10px] ${
                      isUser ? 'text-cyan-200 text-right' : 'text-slate-500 text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-200 shadow-sm">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-fadeIn">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-800/80 text-cyan-400">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-bl-none border border-slate-800 bg-[#101728] px-4 py-3 text-slate-400 text-xs flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Gemini is analyzing with {persona === 'fast' ? 'Flash-Lite' : persona === 'complex' ? 'Pro' : 'Flash'}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Starter Suggestions */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            Quick questions to ask:
          </span>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 text-xs">
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-slate-300 hover:text-white hover:border-cyan-500/50 hover:bg-slate-800 transition-colors text-left disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Box */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-2 sm:p-2.5 shadow-xl flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask anything about a suspicious link, text message, or safety tip... (Enter to send)"
            rows={2}
            className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 transition-all hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 shadow-md shadow-cyan-500/20"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
