import React, { useState } from 'react';
import {
  HelpCircle,
  Send,
  Loader2,
  Copy,
  Check,
  BookmarkPlus,
  Sparkles,
  BookOpen,
  GraduationCap,
  Share2,
} from 'lucide-react';
import { AcademicLevel, SubjectCategory } from '../types';
import { askQuestion } from '../utils/api';
import { addHistoryItem, recordQuestionAsked } from '../utils/storage';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AskQAViewProps {
  onNotify?: (msg: string) => void;
  onNavigateToQuiz?: (topic: string) => void;
  onNavigateToExplain?: (topic: string) => void;
}

const subjects: SubjectCategory[] = [
  'Computer Science & AI',
  'Mathematics & Statistics',
  'Physics & Astronomy',
  'Chemistry & Materials',
  'Biology & Medicine',
  'Economics & Finance',
  'History & Philosophy',
  'Literature & Writing',
];

const levels: AcademicLevel[] = [
  'High School',
  'Undergraduate',
  'Graduate/Master',
  'Curious Beginner',
];

const exampleQuestions = [
  {
    subject: 'Computer Science & AI',
    q: 'How does the Attention mechanism in Transformers differ from recurrent connections in RNNs?',
  },
  {
    subject: 'Mathematics & Statistics',
    q: 'Explain Bayes’ Theorem with an intuitive real-world medical diagnosis probability problem.',
  },
  {
    subject: 'Physics & Astronomy',
    q: 'Why does general relativity predict that time moves slower near massive gravitational objects?',
  },
  {
    subject: 'Biology & Medicine',
    q: 'How does mRNA vaccination teach the human immune system to recognize spike proteins without infection?',
  },
];

export const AskQAView: React.FC<AskQAViewProps> = ({
  onNotify,
  onNavigateToQuiz,
  onNavigateToExplain,
}) => {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState<SubjectCategory>('Computer Science & AI');
  const [level, setLevel] = useState<AcademicLevel>('Undergraduate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setCopied(false);
    setBookmarked(false);

    try {
      const res = await askQuestion(question.trim(), subject, level);
      setAnswer(res.answer);
      recordQuestionAsked();
      addHistoryItem({
        type: 'qa',
        title: question.trim(),
        subject,
        summary: res.answer.slice(0, 140) + '...',
      });
      if (onNotify) onNotify('Answer generated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to get answer from Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = () => {
    if (!answer || bookmarked) return;
    setBookmarked(true);
    if (onNotify) onNotify('Saved to your study history!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Reasoning Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ask Academic Questions, Understand Deep Concepts
          </h1>
          <p className="mt-2 text-indigo-200 text-sm sm:text-base leading-relaxed">
            Get rigorous, step-by-step academic explanations grounded in first-principles,
            mathematical rigor, and real-world examples powered by Google Gemini.
          </p>
        </div>
      </div>

      {/* Main Input Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Academic Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as SubjectCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                Target Academic Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as AcademicLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              Your Academic Question or Problem Statement
            </label>
            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                placeholder="Type your question or homework problem here (e.g. 'Explain how Dijkstra algorithm works with a graph example', 'Solve integral of x*e^x dx step by step')..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-y"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500">
              Tip: Supports formulas, code logic, conceptual theories, and multi-step derivations.
            </div>

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Academic Answer...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Ask EduGenie</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Example Presets */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Popular academic queries to try:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {exampleQuestions.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSubject(ex.subject as SubjectCategory);
                  setQuestion(ex.q);
                }}
                className="text-left text-xs p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/60 hover:border-indigo-200 text-slate-700 hover:text-indigo-900 transition-all flex items-start gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{ex.q}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
            !
          </div>
          <div>
            <div className="font-semibold">Unable to process request</div>
            <div className="text-xs text-rose-700 mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Answer Output */}
      {answer && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                AI
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Academic Explanation & Solution</h3>
                <p className="text-xs text-slate-500">
                  {subject} &bull; {level} Level
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-all"
                title="Copy answer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleBookmark}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  bookmarked
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
                title="Save answer"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>{bookmarked ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-xl bg-slate-50/70 border border-slate-100">
            <MarkdownRenderer content={answer} />
          </div>

          {/* Quick Context Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 bg-slate-50/40 p-4 rounded-xl">
            <span className="text-xs font-medium text-slate-600">Want to test your mastery or dive deeper?</span>
            <div className="flex items-center gap-2">
              {onNavigateToQuiz && (
                <button
                  type="button"
                  onClick={() => onNavigateToQuiz(question)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-medium transition-all"
                >
                  Generate Quiz on This Topic
                </button>
              )}
              {onNavigateToExplain && (
                <button
                  type="button"
                  onClick={() => onNavigateToExplain(question)}
                  className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-medium transition-all"
                >
                  Simplify with Analogies (ELI5)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
