import React, { useState, useRef, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer.js';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  Maximize2,
  Trash2,
} from 'lucide-react';
import { ChatMessageItem, ChatPersona } from '../pages/ChatPage.js';

interface FloatingChatWidgetProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  onNavigate,
  currentPath,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome-widget',
      role: 'model',
      text: 'Need quick advice on a suspicious link or text? Ask me here!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.1-flash-lite',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Don't show the floating widget on the full /chat page itself
  if (currentPath === '/chat') return null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessageItem = {
      id: `w-user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = newHistory.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          persona: 'fast', // Fast triage for floating quick widget
        }),
      });

      if (!res.ok) {
        throw new Error('Chat failed');
      }

      const data = await res.json();
      const modelMsg: ChatMessageItem = {
        id: `w-model-${Date.now()}`,
        role: 'model',
        text: data.reply || 'No response',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `w-err-${Date.now()}`,
          role: 'model',
          text: 'Unable to reach Gemini right now. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Drawer */}
      {isOpen ? (
        <div className="w-[340px] sm:w-[380px] h-[480px] rounded-2xl border border-slate-800 bg-[#090e1a] shadow-2xl flex flex-col overflow-hidden animate-scaleIn">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#0e1628] px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-400">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  TrustLens AI Chat
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">gemini-3.1-flash-lite</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('/chat');
                }}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title="Open full page"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-cyan-600 text-white rounded-br-none'
                        : 'bg-[#121a2d] border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <MarkdownRenderer content={m.text} />
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-slate-800 bg-[#121a2d] px-3 py-2 text-slate-400 text-xs flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>Checking with Gemini...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t border-slate-800 bg-[#0b101c] flex items-center gap-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a quick scam check..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Floating Button Pill */
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-xl shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all"
        >
          <Bot className="h-4 w-4 transition-transform group-hover:rotate-12" />
          <span>Ask Gemini AI</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
        </button>
      )}
    </div>
  );
};
