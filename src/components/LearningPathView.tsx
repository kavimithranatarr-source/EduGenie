import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  BookmarkCheck,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';
import { LearningRoadmap, Milestone } from '../types';
import { generateLearningPath } from '../utils/api';
import { addHistoryItem, getSavedRoadmaps, saveRoadmap } from '../utils/storage';

interface LearningPathViewProps {
  onNotify?: (msg: string) => void;
  onNavigateToQA?: (topic: string) => void;
}

const presetGoals = [
  {
    goal: 'Master Linear Algebra & Vector Calculus for Machine Learning',
    level: 'intermediate' as const,
    time: '6 weeks',
  },
  {
    goal: 'Modern Web Architecture & Distributed Systems',
    level: 'intermediate' as const,
    time: '8 weeks',
  },
  {
    goal: 'Quantum Mechanics & Wave Functions from First Principles',
    level: 'beginner' as const,
    time: '4 weeks',
  },
  {
    goal: 'Corporate Finance, DCF Modeling & Valuation',
    level: 'beginner' as const,
    time: '4 weeks',
  },
];

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  onNotify,
  onNavigateToQA,
}) => {
  const [goal, setGoal] = useState('');
  const [currentLevel, setCurrentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [timeframe, setTimeframe] = useState('4 weeks');
  const [weeklyHours, setWeeklyHours] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active roadmap
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [savedRoadmapsList, setSavedRoadmapsList] = useState<LearningRoadmap[]>([]);
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});
  const [completedChecklist, setCompletedChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const list = getSavedRoadmaps();
    setSavedRoadmapsList(list);
    if (list.length > 0 && !roadmap) {
      setRoadmap(list[0]);
    }
  }, []);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await generateLearningPath(goal.trim(), currentLevel, timeframe, weeklyHours);
      setRoadmap(data);
      saveRoadmap(data);
      setSavedRoadmapsList(getSavedRoadmaps());

      // Expand all by default
      const exp: Record<string, boolean> = {};
      data.milestones.forEach((m) => {
        exp[m.id] = true;
      });
      setExpandedMilestones(exp);

      addHistoryItem({
        type: 'roadmap',
        title: data.roadmapTitle,
        summary: `${data.milestones.length} milestones, ~${data.totalEstimatedHours} hours for ${currentLevel} level.`,
      });

      if (onNotify) onNotify('Custom learning roadmap created!');
    } catch (err: any) {
      setError(err.message || 'Failed to generate learning path.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = (id: string) => {
    setExpandedMilestones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleChecklistItem = (key: string) => {
    setCompletedChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate progress
  const totalItems =
    roadmap?.milestones.reduce((acc, m) => acc + m.selfAssessmentChecklist.length, 0) || 1;
  const completedCount = Object.values(completedChecklist).filter(Boolean).length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalItems) * 100));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-cyan-900 via-sky-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Curriculum & Roadmap Architect</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Personalized Academic Learning Roadmaps
          </h1>
          <p className="mt-2 text-cyan-200 text-sm sm:text-base leading-relaxed">
            Generate milestone-driven study syllabi adapted to your prior knowledge, available
            weekly hours, and learning targets. Track checklist progress as you advance.
          </p>
        </div>
      </div>

      {/* Generator Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-600" />
              What is your academic or learning goal?
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Master Organic Chemistry Mechanisms, Learn Rust Systems Programming, Understand Macroeconomic Policy..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Background Level
              </label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-cyan-600"
              >
                <option value="beginner">Beginner (Zero prior knowledge)</option>
                <option value="intermediate">Intermediate (Know the basics)</option>
                <option value="advanced">Advanced (Deep specialization)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-cyan-600"
              >
                <option value="2 weeks">2 Weeks (Intensive Sprint)</option>
                <option value="4 weeks">4 Weeks (1 Month Standard)</option>
                <option value="8 weeks">8 Weeks (2 Months Comprehensive)</option>
                <option value="12 weeks">12 Weeks (Semester Mastery)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Study Hours Per Week
              </label>
              <select
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-cyan-600"
              >
                <option value={3}>3 hours / week (Casual pace)</option>
                <option value={6}>6 hours / week (Steady rhythm)</option>
                <option value={10}>10 hours / week (Focused student)</option>
                <option value={15}>15+ hours / week (Full immersion)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !goal.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-98 text-white text-sm font-semibold shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Curating Personalized Curriculum...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Architect Learning Path</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Goal Suggestions */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Suggested Learning Goals:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presetGoals.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setGoal(p.goal);
                  setCurrentLevel(p.level);
                  setTimeframe(p.time);
                }}
                className="text-left text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-cyan-50/60 hover:border-cyan-300 text-slate-700 transition-all"
              >
                <div className="font-semibold text-slate-900">{p.goal}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Level: {p.level} &bull; {p.time}
                </div>
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

      {/* Saved Roadmaps Switcher (if any) */}
      {savedRoadmapsList.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-semibold text-slate-500 whitespace-nowrap">Your Roadmaps:</span>
          {savedRoadmapsList.map((r, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setRoadmap(r)}
              className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
                roadmap?.roadmapTitle === r.roadmapTitle
                  ? 'bg-cyan-600 text-white font-semibold border-cyan-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {r.roadmapTitle}
            </button>
          ))}
        </div>
      )}

      {/* Roadmap Render Display */}
      {roadmap && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in">
          {/* Header & Overall Progress */}
          <div className="space-y-4 pb-6 border-b border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
                  Target Proficiency: {roadmap.targetProficiency}
                </span>
                <h2 className="text-2xl font-bold text-slate-900">{roadmap.roadmapTitle}</h2>
                <p className="text-sm text-slate-600 mt-1">{roadmap.summary}</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-950 text-center">
                  <div className="text-lg font-black text-cyan-700">
                    ~{roadmap.totalEstimatedHours}h
                  </div>
                  <div>Total Hours</div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-950 text-center">
                  <div className="text-lg font-black text-emerald-700">{progressPercent}%</div>
                  <div>Completed</div>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Milestone Checklist Progress</span>
                <span>
                  {completedCount} / {totalItems} items completed
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Milestones Flow */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Curriculum Milestones ({roadmap.milestones.length} Phases)
            </h3>

            <div className="space-y-4">
              {roadmap.milestones.map((m: Milestone, idx: number) => {
                const isExpanded = expandedMilestones[m.id] ?? true;

                return (
                  <div
                    key={m.id || idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-all hover:border-slate-300"
                  >
                    {/* Header Banner for Milestone */}
                    <div
                      onClick={() => toggleMilestone(m.id)}
                      className="p-4 sm:p-5 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer flex items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                              {m.phase}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {m.duration}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 mt-0.5">{m.title}</h4>
                        </div>
                      </div>

                      <div className="text-slate-400">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>

                    {/* Milestone Details when expanded */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 space-y-5 bg-white border-t border-slate-100">
                        {/* Objectives & Key Topics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                              Core Objectives
                            </h5>
                            <ul className="space-y-1.5 text-xs text-slate-600">
                              {m.objectives.map((obj, oIdx) => (
                                <li key={oIdx} className="flex items-start gap-2">
                                  <span className="text-cyan-600 font-bold">&#8226;</span>
                                  <span>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                              Key Topics & Theoretical Concepts
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                              {m.keyTopics.map((top, tIdx) => (
                                <button
                                  key={tIdx}
                                  type="button"
                                  onClick={() => onNavigateToQA && onNavigateToQA(top)}
                                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-cyan-700 hover:border-cyan-300 transition-all flex items-center gap-1"
                                  title="Ask QA on this topic"
                                >
                                  <span>{top}</span>
                                  <BookOpen className="w-2.5 h-2.5 text-slate-400" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Practical Projects */}
                        {m.recommendedProjects && m.recommendedProjects.length > 0 && (
                          <div>
                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                              Hands-on Projects & Exercises
                            </h5>
                            <div className="space-y-2">
                              {m.recommendedProjects.map((proj, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="p-3 rounded-xl bg-cyan-50/40 border border-cyan-100 text-xs text-cyan-950 flex items-start gap-2"
                                >
                                  <span className="font-bold text-cyan-700">Project {pIdx + 1}:</span>
                                  <span>{proj}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Interactive Self-Assessment Checklist */}
                        <div>
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                            <span>Self-Assessment Checklist</span>
                            <span className="text-[11px] font-normal text-slate-500">
                              Check off items as you learn
                            </span>
                          </h5>
                          <div className="space-y-2">
                            {m.selfAssessmentChecklist.map((checkItem, cIdx) => {
                              const key = `${m.id}_${cIdx}`;
                              const isChecked = !!completedChecklist[key];
                              return (
                                <button
                                  key={cIdx}
                                  type="button"
                                  onClick={() => toggleChecklistItem(key)}
                                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center gap-3 ${
                                    isChecked
                                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium'
                                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  {isChecked ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                                  )}
                                  <span className={isChecked ? 'line-through text-slate-500' : ''}>
                                    {checkItem}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Checkpoint Question */}
                        {m.checkpointQuestion && (
                          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                            <span className="font-bold text-amber-800 shrink-0">Milestone Checkpoint:</span>
                            <span>{m.checkpointQuestion}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Study Tips */}
          {roadmap.studyTips && roadmap.studyTips.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recommended Study Strategies for this Path
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                {roadmap.studyTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-500 font-bold">&#10003;</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
