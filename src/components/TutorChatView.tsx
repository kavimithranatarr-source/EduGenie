import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Loader2,
  Trash2,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react';
import { ChatMessage, SubjectCategory } from '../types';
import { sendChatMessage } from '../utils/api';
import { MarkdownRenderer } from './MarkdownRenderer';

interface TutorChatViewProps {
  onNotify?: (msg: string) => void;
}

const quickPrompts = [
  'Can you test my understanding with a conceptual practice question?',
  'Explain this using a real-world everyday analogy.',
  'Break this down into simple numbered steps.',
  'What are the common exam pitfalls students make with this?',
  'Show me the formal mathematical or algorithmic derivation.',
];

const defaultInitialMessage: ChatMessage = {
  id: 'init_1',
  role: 'assistant',
  content: `Hello! I'm **EduGenie**, your personal academic tutor powered by Google Gemini. 🎓

Ask me anything—whether you need step-by-step problem derivations, intuition checks, or conceptual analogies. How can I help your studies today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const TutorChatView: React.FC<TutorChatViewProps> = ({ onNotify }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([defaultInitialMessage]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState<SubjectCategory>('Computer Science & AI');
  const [currentTopic, setCurrentTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      // Send conversation context to backend
      const apiPayload = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage(apiPayload, subject, currentTopic);

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: `⚠️ Sorry, I encountered an error: ${err.message || 'Unable to connect to Gemini API'}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([defaultInitialMessage]);
    if (onNotify) onNotify('Chat history cleared.');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[550px] max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 sm:px-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/30">
            <Bot className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">EduGenie Academic Tutor</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">Contextual multi-turn dialogue</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Subject Context Select */}
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as SubjectCategory)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="Computer Science & AI">Computer Science & AI</option>
            <option value="Mathematics & Statistics">Mathematics & Statistics</option>
            <option value="Physics & Astronomy">Physics & Astronomy</option>
            <option value="Chemistry & Materials">Chemistry & Materials</option>
            <option value="Biology & Medicine">Biology & Medicine</option>
            <option value="Economics & Finance">Economics & Finance</option>
            <option value="History & Philosophy">History & Philosophy</option>
            <option value="Literature & Writing">Literature & Writing</option>
          </select>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`group relative p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-xs'
                }`}
              >
                {!isUser ? (
                  <MarkdownRenderer content={m.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}

                <div
                  className={`flex items-center justify-between gap-3 mt-2 text-[10px] ${
                    isUser ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  <span>{m.timestamp}</span>

                  <button
                    type="button"
                    onClick={() => handleCopy(m.content, m.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-600"
                    title="Copy message"
                  >
                    {copiedId === m.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 mr-auto max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-500 flex items-center gap-2 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>EduGenie is reasoning through the answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 scrollbar-none">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(qp)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-600 whitespace-nowrap transition-all"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask a follow-up question in ${subject}...`}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};
