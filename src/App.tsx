/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, TabId } from './components/Navbar';
import { AskQAView } from './components/AskQAView';
import { ConceptExplainerView } from './components/ConceptExplainerView';
import { SummarizerView } from './components/SummarizerView';
import { QuizGeneratorView } from './components/QuizGeneratorView';
import { LearningPathView } from './components/LearningPathView';
import { FlashcardsView } from './components/FlashcardsView';
import { TutorChatView } from './components/TutorChatView';
import { ProgressAnalyticsView } from './components/ProgressAnalyticsView';
import { ApiExplorerModal } from './components/ApiExplorerModal';
import { getStoredStats } from './utils/storage';
import { UserStats } from './types';
import { Sparkles, Terminal, BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('qa');
  const [stats, setStats] = useState<UserStats>(getStoredStats());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cross-tab context parameters
  const [sharedTopic, setSharedTopic] = useState<string>('');

  useEffect(() => {
    const refreshStats = () => {
      setStats(getStoredStats());
    };
    window.addEventListener('storage', refreshStats);
    return () => window.removeEventListener('storage', refreshStats);
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setStats(getStoredStats());
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const handleNavigateToQuiz = (topic: string) => {
    setSharedTopic(topic);
    setActiveTab('quiz');
  };

  const handleNavigateToExplain = (topic: string) => {
    setSharedTopic(topic);
    setActiveTab('explain');
  };

  const handleNavigateToFlashcards = (topic: string) => {
    setSharedTopic(topic);
    setActiveTab('flashcards');
  };

  const handleNavigateToQA = (topic: string) => {
    setSharedTopic(topic);
    setActiveTab('qa');
  };

  const handleSelectFromHistory = (type: string, title: string) => {
    setSharedTopic(title);
    if (type === 'quiz') setActiveTab('quiz');
    else if (type === 'explanation') setActiveTab('explain');
    else if (type === 'summary') setActiveTab('summarize');
    else if (type === 'roadmap') setActiveTab('roadmap');
    else if (type === 'flashcards') setActiveTab('flashcards');
    else setActiveTab('qa');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setStats(getStoredStats());
        }}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'qa' && (
          <AskQAView
            onNotify={showNotification}
            onNavigateToQuiz={handleNavigateToQuiz}
            onNavigateToExplain={handleNavigateToExplain}
          />
        )}

        {activeTab === 'explain' && (
          <ConceptExplainerView
            initialTopic={sharedTopic}
            onNotify={showNotification}
            onNavigateToQuiz={handleNavigateToQuiz}
          />
        )}

        {activeTab === 'summarize' && (
          <SummarizerView
            onNotify={showNotification}
            onSendToQuiz={handleNavigateToQuiz}
            onSendToFlashcards={handleNavigateToFlashcards}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizGeneratorView
            initialTopic={sharedTopic}
            onNotify={showNotification}
          />
        )}

        {activeTab === 'roadmap' && (
          <LearningPathView
            onNotify={showNotification}
            onNavigateToQA={handleNavigateToQA}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsView
            initialTopic={sharedTopic}
            onNotify={showNotification}
          />
        )}

        {activeTab === 'chat' && <TutorChatView onNotify={showNotification} />}

        {activeTab === 'stats' && (
          <ProgressAnalyticsView
            onSelectTopic={handleSelectFromHistory}
            onNotify={showNotification}
          />
        )}

        {activeTab === 'api-explorer' && <ApiExplorerModal />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">EduGenie</span>
            <span>&bull;</span>
            <span>Google Gemini Powered Academic & Conceptual Assistant</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('api-explorer')}
              className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>FastAPI / REST API Specs</span>
            </button>
            <span>&bull;</span>
            <span className="text-slate-400">Model: gemini-3.8-flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
