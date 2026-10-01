import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  BookMarked,
  Layers,
  ShieldAlert,
  Flame,
  Globe2,
} from 'lucide-react';
import { ConceptExplanation, ExplanationMode } from '../types';
import { explainConcept } from '../utils/api';
import { addHistoryItem } from '../utils/storage';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ConceptExplainerViewProps {
  initialTopic?: string;
  onNotify?: (msg: string) => void;
  onNavigateToQuiz?: (topic: string) => void;
}

const explanationModes: Array<{
  id: ExplanationMode;
  label: string;
  description: string;
  badge: string;
}> = [
  {
    id: 'eli5',
    label: "Explain Like I'm 5 (ELI5)",
    description: 'Ultra-simplified everyday terms without academic jargon',
    badge: 'Beginner',
  },
  {
    id: 'analogy',
    label: 'Real-World Analogy Master',
    description: 'Concrete metaphor mapping abstract theory to everyday experiences',
    badge: 'Intuitive',
  },
  {
    id: 'first-principles',
    label: 'First Principles & Derivation',
    description: 'Deconstructs the concept down to fundamental truths and axioms',
    badge: 'Rigorous',
  },
  {
    id: 'visual-mental-model',
    label: 'Visual Mental Model',
    description: 'Spatial and schematic flowcharts for how parts interact',
    badge: 'Schematic',
  },
  {
    id: 'cheat-sheet',
    label: 'Exam Revision Cheat Sheet',
    description: 'High-yield points, formulas, gotchas, and memory hooks',
    badge: 'Exam Prep',
  },
];

const targetAudiences = ['High School', 'Undergraduate', 'Curious Enthusiast', 'Middle School'];

const presetTopics = [
  'Quantum Superposition & Schrödinger’s Cat',
  'Backpropagation in Neural Networks',
  'Special Relativity & Time Dilation',
  'Enzyme-Substrate Lock & Key vs Induced Fit',
  'The Prisoner’s Dilemma & Nash Equilibrium',
  'How Public Key Cryptography (RSA) Works',
];

export const ConceptExplainerView: React.FC<ConceptExplainerViewProps> = ({
  initialTopic = '',
  onNotify,
  onNavigateToQuiz,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [mode, setMode] = useState<ExplanationMode>('analogy');
  const [audience, setAudience] = useState('High School');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConceptExplanation | null>(null);

  // Quick check question state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleExplain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedOption(null);
    setShowExplanation(false);

    try {
      const data = await explainConcept(topic.trim(), mode, audience);
      setResult(data);
      addHistoryItem({
        type: 'explanation',
        title: data.title || topic.trim(),
        summary: data.oneSentenceSummary || 'Concept explained with analogies.',
      });
      if (onNotify) onNotify('Concept explanation prepared!');
    } catch (err: any) {
      setError(err.message || 'Failed to simplify concept.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="bg-linear-to-r from-violet-900 via-purple-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
            <span>Intuitive Concept Simplifier</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Master Tough Concepts Through Memorable Analogies
          </h1>
          <p className="mt-2 text-purple-200 text-sm sm:text-base leading-relaxed">
            Translate complex theories, mathematical equations, and abstract models into
            crystal-clear mental models, tangible real-world metaphors, and debunked misconceptions.
          </p>
        </div>
      </div>

      {/* Input & Mode Configurator */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-5">
        <form onSubmit={handleExplain} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              What concept or theory would you like simplified?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Fourier Transform, Photosynthesis light reactions, Gresham's Law, Blockchain consensus..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Audience Level
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
              >
                {targetAudiences.map((aud) => (
                  <option key={aud} value={aud}>
                    {aud}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Explanation Style Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as ExplanationMode)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
              >
                {explanationModes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} ({m.badge})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mode Selector Cards for Desktop */}
          <div className="hidden md:grid grid-cols-3 gap-2.5 pt-1">
            {explanationModes.slice(0, 3).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`text-left p-3 rounded-xl border text-xs transition-all ${
                  mode === m.id
                    ? 'border-purple-500 bg-purple-50/70 ring-1 ring-purple-500 text-purple-900'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="font-semibold flex items-center justify-between mb-1">
                  <span>{m.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-600 font-bold border border-slate-200">
                    {m.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{m.description}</p>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500">
              Generated with Gemini 3.8 Flash structured conceptual decomposition.
            </span>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-98 text-white text-sm font-semibold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Unpacking Concept & Crafting Analogy...</span>
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4" />
                  <span>Explain & Simplify</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick topic presets */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Quick Topics to Explore:
          </p>
          <div className="flex flex-wrap gap-2">
            {presetTopics.map((pt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTopic(pt)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-800 text-slate-700 transition-all"
              >
                {pt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Explanation Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Summary Header */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Core Idea in a Nutshell</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{result.title}</h2>
            <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-100 text-purple-950 font-medium text-base sm:text-lg leading-snug">
              &ldquo;{result.oneSentenceSummary}&rdquo;
            </div>
          </div>

          {/* The Core Analogy Card */}
          <div className="bg-linear-to-br from-amber-500/10 via-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                💡
              </span>
              <div>
                <h3 className="text-base font-bold text-amber-950">
                  The Master Analogy: {result.coreAnalogy.title}
                </h3>
                <p className="text-xs text-amber-800">Bridging the abstract to the tangible</p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal bg-white/70 p-4 rounded-xl border border-amber-200/50">
              {result.coreAnalogy.story}
            </p>

            {/* Analogy Mapping Table */}
            {result.coreAnalogy.mapping && result.coreAnalogy.mapping.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
                  Metaphor Mapping:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.coreAnalogy.mapping.map((mapItem, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-white border border-amber-200/70 text-xs flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <span className="font-semibold text-purple-900">{mapItem.conceptComponent}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-amber-900 font-medium">{mapItem.analogyComponent}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Conceptual Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-indigo-600" />
              In-Depth Explanation & Mechanisms
            </h3>
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50/70 border border-slate-100">
              <MarkdownRenderer content={result.detailedExplanation} />
            </div>
          </div>

          {/* First Principles & Misconceptions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Principles */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-emerald-600" />
                First-Principles Breakdown
              </h3>
              <p className="text-xs text-slate-500">The foundational building blocks:</p>
              <ul className="space-y-2.5">
                {result.firstPrinciplesBreakdown.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Misconceptions */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Common Misconceptions Debunked
              </h3>
              <p className="text-xs text-slate-500">What most people get wrong:</p>
              <div className="space-y-3">
                {result.commonMisconceptions.map((mis, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-800 font-semibold">
                      <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                      <span>Myth: {mis.misconception}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-800 font-medium pl-5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      <span>Reality: {mis.reality}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real World Applications & Cheat Sheet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <Globe2 className="w-4 h-4 text-cyan-600" />
                Where It Applies in the Real World
              </h3>
              <ul className="space-y-2">
                {result.realWorldApplications.map((app, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-cyan-500 font-bold">&bull;</span>
                    <span>{app}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-500" />
                Quick Revision Cheat Sheet Takeaways
              </h3>
              <ul className="space-y-2">
                {result.cheatSheetTakeaways.map((tip, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-amber-500 font-bold">&#10003;</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Check-Your-Understanding Question */}
          {result.quickCheckQuestion && (
            <div className="bg-linear-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-4">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Instant Comprehension Check</span>
              </div>
              <h4 className="text-lg font-bold">{result.quickCheckQuestion.question}</h4>

              <div className="space-y-2 pt-2">
                {result.quickCheckQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === result.quickCheckQuestion.correctIndex;

                  let optionStyle =
                    'bg-white/10 hover:bg-white/20 border-white/15 text-white';
                  if (showExplanation) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-600/80 border-emerald-400 text-white font-semibold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-600/80 border-rose-400 text-white';
                    } else {
                      optionStyle = 'bg-white/5 border-white/10 text-white/50';
                    }
                  } else if (isSelected) {
                    optionStyle = 'bg-indigo-600 border-indigo-400 text-white';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={showExplanation}
                      onClick={() => {
                        setSelectedOption(idx);
                        setShowExplanation(true);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                    >
                      <span>
                        <strong className="mr-2">
                          {String.fromCharCode(65 + idx)}.
                        </strong>
                        {opt}
                      </span>
                      {showExplanation && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                      )}
                      {showExplanation && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="p-4 rounded-xl bg-white/10 border border-white/20 text-xs sm:text-sm text-indigo-100 animate-in fade-in">
                  <div className="font-bold text-white mb-1">
                    {selectedOption === result.quickCheckQuestion.correctIndex
                      ? '🎉 Spot on!'
                      : '💡 Helpful explanation:'}
                  </div>
                  <div>{result.quickCheckQuestion.explanation}</div>
                </div>
              )}
            </div>
          )}

          {/* Action to test full quiz */}
          {onNavigateToQuiz && (
            <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-indigo-950">Ready to test your full knowledge?</h4>
                <p className="text-xs text-indigo-700">Generate a custom 5-question quiz on &quot;{topic}&quot;.</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToQuiz(topic)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                Launch Quiz on {topic}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
