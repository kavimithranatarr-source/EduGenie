import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Flame,
  Trophy,
  HelpCircle,
  Layers,
  Clock,
  BookOpen,
  Trash2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { HistoryItem, UserStats } from '../types';
import { clearHistory, getStoredHistory, getStoredStats } from '../utils/storage';

interface ProgressAnalyticsViewProps {
  onSelectTopic?: (type: string, title: string) => void;
  onNotify?: (msg: string) => void;
}

export const ProgressAnalyticsView: React.FC<ProgressAnalyticsViewProps> = ({
  onSelectTopic,
  onNotify,
}) => {
  const [stats, setStats] = useState<UserStats>(getStoredStats());
  const [history, setHistory] = useState<HistoryItem[]>(getStoredHistory());
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    setStats(getStoredStats());
    setHistory(getStoredHistory());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your learning history?')) {
      clearHistory();
      setHistory([]);
      if (onNotify) onNotify('Study history cleared.');
    }
  };

  const filteredHistory = history.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Mastery Dashboard & Session Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Study History & Learning Momentum
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Monitor your continuous learning streak, academic quizzes taken, concepts simplified,
            and memory retention records across sessions.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.streakDays} Days</div>
            <div className="text-xs text-slate-500">Learning Streak</div>
          </div>
        </div>

        {/* Quizzes Taken & Avg Score */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.averageScore > 0 ? `${stats.averageScore}%` : 'N/A'}
            </div>
            <div className="text-xs text-slate-500">
              Avg Score ({stats.quizzesCompleted} Quizzes)
            </div>
          </div>
        </div>

        {/* Questions Asked */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.questionsAsked}</div>
            <div className="text-xs text-slate-500">Questions Solved</div>
          </div>
        </div>

        {/* Flashcards Mastered */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.flashcardsMastered}</div>
            <div className="text-xs text-slate-500">Flashcards Mastered</div>
          </div>
        </div>
      </div>

      {/* History Feed & Filtering */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Learning Sessions & Activity Log</h3>
            <p className="text-xs text-slate-500">Chronological records of your learning interactions</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex gap-1 p-1 rounded-xl bg-slate-100 text-xs">
              {['all', 'qa', 'explanation', 'summary', 'quiz', 'roadmap'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                    filterType === t
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-colors"
                title="Clear Activity Log"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* History Items List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-medium">No recorded activities in this category yet.</p>
            <p className="text-xs text-slate-400">
              Start asking academic questions or generate a quiz to build your log!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        item.type === 'quiz'
                          ? 'bg-blue-100 text-blue-800'
                          : item.type === 'qa'
                          ? 'bg-indigo-100 text-indigo-800'
                          : item.type === 'explanation'
                          ? 'bg-purple-100 text-purple-800'
                          : item.type === 'summary'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-cyan-100 text-cyan-800'
                      }`}
                    >
                      {item.type}
                    </span>
                    {item.subject && (
                      <span className="text-slate-500 text-[11px]">&bull; {item.subject}</span>
                    )}
                    {item.score !== undefined && (
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Score: {item.score}%
                      </span>
                    )}
                    <span className="text-slate-400 text-[11px]">{item.date}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                  <p className="text-slate-600 line-clamp-2">{item.summary}</p>
                </div>

                {onSelectTopic && (
                  <button
                    type="button"
                    onClick={() => onSelectTopic(item.type, item.title)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 font-semibold text-xs shadow-2xs"
                  >
                    <span>Re-open</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
