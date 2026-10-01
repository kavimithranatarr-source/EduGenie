import React from 'react';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  Compass,
  Layers,
  MessageSquare,
  BarChart3,
  Terminal,
  Flame,
  Clock,
} from 'lucide-react';
import { UserStats } from '../types';

export type TabId =
  | 'qa'
  | 'explain'
  | 'summarize'
  | 'quiz'
  | 'roadmap'
  | 'flashcards'
  | 'chat'
  | 'stats'
  | 'api-explorer';

interface NavbarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  stats: UserStats;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, stats }) => {
  const navItems: Array<{ id: TabId; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'qa', label: 'Ask Q&A', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'explain', label: 'Concept Explainer', icon: <BookOpen className="w-4 h-4" />, badge: 'AI-ELI5' },
    { id: 'summarize', label: 'Summarizer', icon: <FileText className="w-4 h-4" /> },
    { id: 'quiz', label: 'Quiz Generator', icon: <Sparkles className="w-4 h-4" />, badge: 'Test Mode' },
    { id: 'roadmap', label: 'Learning Paths', icon: <Compass className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" /> },
    { id: 'chat', label: 'Tutor Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'stats', label: 'Progress & History', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'api-explorer', label: 'REST API', icon: <Terminal className="w-4 h-4" />, badge: 'Docs' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Edu<span className="text-indigo-600">Genie</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Intelligent Academic & Conceptual Learning Engine
              </p>
            </div>
          </div>

          {/* User Streak & Active metrics */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-900 text-xs font-semibold shadow-xs">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{stats.streakDays} Day Streak</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{stats.studyMinutes}m Studied</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Horizontally scrollable on small screens */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-100">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
