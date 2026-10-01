import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  Lightbulb,
  Clock,
  BookOpen,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizData, QuizQuestion, ShortAnswerEvaluation } from '../types';
import { evaluateShortAnswer, generateQuiz } from '../utils/api';
import { addHistoryItem, recordQuizCompleted } from '../utils/storage';

interface QuizGeneratorViewProps {
  initialTopic?: string;
  onNotify?: (msg: string) => void;
}

export const QuizGeneratorView: React.FC<QuizGeneratorViewProps> = ({
  initialTopic = '',
  onNotify,
}) => {
  const [topicOrText, setTopicOrText] = useState(initialTopic);
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionType, setQuestionType] = useState<'mcq' | 'conceptual' | 'mixed'>('mixed');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Quiz State
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [shortAnswers, setShortAnswers] = useState<Record<string, string>>({});
  const [shortEvaluations, setShortEvaluations] = useState<Record<string, ShortAnswerEvaluation>>({});
  const [evaluatingShortAnswer, setEvaluatingShortAnswer] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (quizData && !quizFinished) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizData, quizFinished]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topicOrText.trim()) return;

    setLoading(true);
    setError(null);
    setQuizData(null);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShortAnswers({});
    setShortEvaluations({});
    setRevealedHints({});
    setQuizFinished(false);
    setTimerSeconds(0);

    try {
      const data = await generateQuiz(topicOrText.trim(), count, difficulty, questionType);
      setQuizData(data);
      if (onNotify) onNotify(`Generated ${data.questions.length} quiz questions!`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (quizFinished) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleEvaluateShort = async (q: QuizQuestion) => {
    const studentAns = shortAnswers[q.id];
    if (!studentAns || !studentAns.trim()) return;

    setEvaluatingShortAnswer(true);
    try {
      const evalResult = await evaluateShortAnswer(
        q.question,
        studentAns,
        q.idealAnswer,
        q.conceptTested
      );
      setShortEvaluations((prev) => ({ ...prev, [q.id]: evalResult }));
    } catch (err: any) {
      console.error(err);
      if (onNotify) onNotify('Error evaluating short answer.');
    } finally {
      setEvaluatingShortAnswer(false);
    }
  };

  const handleFinishQuiz = () => {
    if (!quizData) return;
    setQuizFinished(true);

    // Calculate score
    let totalScorePoints = 0;
    let maxPoints = quizData.questions.length * 100;

    quizData.questions.forEach((q) => {
      if (q.type === 'mcq') {
        const userChoice = selectedAnswers[q.id];
        if (userChoice === q.correctIndex) {
          totalScorePoints += 100;
        }
      } else {
        const ev = shortEvaluations[q.id];
        if (ev) {
          totalScorePoints += ev.score;
        } else if (shortAnswers[q.id]?.trim()) {
          totalScorePoints += 50; // Partial default credit if un-evaluated
        }
      }
    });

    const finalPercent = Math.round((totalScorePoints / maxPoints) * 100);
    recordQuizCompleted(finalPercent);
    addHistoryItem({
      type: 'quiz',
      title: quizData.quizTitle,
      score: finalPercent,
      summary: `Score: ${finalPercent}% (${quizData.questions.length} questions in ${Math.round(timerSeconds / 60)}m ${timerSeconds % 60}s)`,
    });

    if (finalPercent >= 80) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = quizData ? quizData.questions[currentIndex] : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>Interactive Assessment & Testing Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Generate Dynamic Quizzes from Any Topic or Notes
          </h1>
          <p className="mt-2 text-blue-200 text-sm sm:text-base leading-relaxed">
            Test yourself with automatically calibrated MCQs and conceptual short-answer questions.
            Get instant AI grading and explanations for every choice.
          </p>
        </div>
      </div>

      {/* Generator Configuration (Shown when not currently in an active quiz or when quiz is done) */}
      {(!quizData || quizFinished) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Topic, Subject, or Paste Text for the Quiz
              </label>
              <textarea
                value={topicOrText}
                onChange={(e) => setTopicOrText(e.target.value)}
                rows={3}
                placeholder="e.g. 'Photosynthesis and cellular respiration comparison', 'Calculus chain rule and product rule', or paste raw textbook notes..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Number of Questions
                </label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value={3}>3 Questions (Quick Sprint)</option>
                  <option value={5}>5 Questions (Standard)</option>
                  <option value={8}>8 Questions (Deep Practice)</option>
                  <option value={10}>10 Questions (Full Exam)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="easy">Easy (Fundamentals & Recalls)</option>
                  <option value="medium">Medium (Application & Analysis)</option>
                  <option value="hard">Hard (Advanced Reasoning)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Question Format
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="mixed">Mixed (MCQ + Conceptual)</option>
                  <option value="mcq">Multiple Choice Only</option>
                  <option value="conceptual">Conceptual Short Answers</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading || !topicOrText.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Tailored Quiz with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create & Launch Quiz</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Active Interactive Quiz Engine */}
      {quizData && !quizFinished && currentQ && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in">
          {/* Top Progress & Timer Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                {quizData.quizTitle}
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Question {currentIndex + 1} of {quizData.questions.length}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatTime(timerSeconds)}</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                {quizData.difficulty}
              </span>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{
                width: `${((currentIndex + 1) / quizData.questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Card */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tested Concept:
              </span>
              <span className="text-xs font-medium text-slate-700 px-2 py-0.5 rounded bg-slate-100">
                {currentQ.conceptTested}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h3>

            {/* MCQ Mode */}
            {currentQ.type === 'mcq' && currentQ.options && currentQ.options.length > 0 && (
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-medium shadow-xs ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200/80 text-slate-700'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short Answer Mode with AI Grading */}
            {currentQ.type === 'short_answer' && (
              <div className="space-y-3 pt-2">
                <textarea
                  value={shortAnswers[currentQ.id] || ''}
                  onChange={(e) =>
                    setShortAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))
                  }
                  rows={4}
                  placeholder="Type your explanation or response here..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    Write in your own words. Click below for instant AI grading.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEvaluateShort(currentQ)}
                    disabled={evaluatingShortAnswer || !shortAnswers[currentQ.id]?.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {evaluatingShortAnswer ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Grading...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Grade with AI</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Instant short answer feedback */}
                {shortEvaluations[currentQ.id] && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        Score: {shortEvaluations[currentQ.id].score}/100
                      </span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          shortEvaluations[currentQ.id].isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {shortEvaluations[currentQ.id].isCorrect ? 'Proficient' : 'Needs Review'}
                      </span>
                    </div>
                    <p className="text-slate-700">{shortEvaluations[currentQ.id].feedback}</p>
                    <div className="text-slate-500 italic">
                      Suggestion: {shortEvaluations[currentQ.id].improvementSuggestion}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hint reveal */}
            {currentQ.hint && (
              <div className="pt-2">
                {revealedHints[currentQ.id] ? (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Hint:</strong> {currentQ.hint}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setRevealedHints((prev) => ({ ...prev, [currentQ.id]: true }))
                    }
                    className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 underline font-medium"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Need a hint?</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Navigation Between Questions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentIndex < quizData.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishQuiz}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit & View Results</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quiz Finished Results & Detailed Review */}
      {quizData && quizFinished && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in">
          {/* Performance Hero */}
          <div className="text-center py-6 border-b border-slate-100 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl font-bold shadow-inner">
              <Trophy className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Quiz Completed!</h2>
            <p className="text-slate-500 text-sm">{quizData.quizTitle}</p>

            {/* Score calculation */}
            {(() => {
              let correctCount = 0;
              quizData.questions.forEach((q) => {
                if (q.type === 'mcq' && selectedAnswers[q.id] === q.correctIndex) {
                  correctCount += 1;
                } else if (q.type === 'short_answer' && shortEvaluations[q.id]?.isCorrect) {
                  correctCount += 1;
                }
              });
              const pct = Math.round((correctCount / quizData.questions.length) * 100);

              return (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <div className="text-5xl font-black text-slate-900 tracking-tight">
                    {pct}%
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    {correctCount} of {quizData.questions.length} Questions Answered Correctly &bull; Time: {formatTime(timerSeconds)}
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  setQuizFinished(false);
                  setCurrentIndex(0);
                  setSelectedAnswers({});
                  setShortAnswers({});
                  setShortEvaluations({});
                  setTimerSeconds(0);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Quiz</span>
              </button>
            </div>
          </div>

          {/* Question by Question Review */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Detailed Question Review & Explanations
            </h3>

            <div className="space-y-4">
              {quizData.questions.map((q, idx) => {
                const isMcq = q.type === 'mcq';
                const userChoice = selectedAnswers[q.id];
                const isCorrect = isMcq
                  ? userChoice === q.correctIndex
                  : shortEvaluations[q.id]?.isCorrect;

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-xl border text-sm space-y-3 ${
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-rose-200 bg-rose-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="text-xs font-semibold text-slate-500">
                            Question {idx + 1} &bull; {q.conceptTested}
                          </div>
                          <div className="font-bold text-slate-900 mt-0.5">{q.question}</div>
                        </div>
                      </div>
                    </div>

                    {/* Review for MCQ options */}
                    {isMcq && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isOptionCorrect = oIdx === q.correctIndex;
                          const wasSelected = oIdx === userChoice;

                          let badgeStyle = 'border-slate-200 bg-white text-slate-700';
                          if (isOptionCorrect) {
                            badgeStyle = 'border-emerald-300 bg-emerald-100 text-emerald-950 font-semibold';
                          } else if (wasSelected && !isOptionCorrect) {
                            badgeStyle = 'border-rose-300 bg-rose-100 text-rose-950 font-semibold';
                          }

                          return (
                            <div key={oIdx} className={`p-2.5 rounded-lg border flex items-center justify-between ${badgeStyle}`}>
                              <span>
                                {String.fromCharCode(65 + oIdx)}. {opt}
                              </span>
                              {isOptionCorrect && <span className="text-[10px] font-bold text-emerald-700">CORRECT</span>}
                              {wasSelected && !isOptionCorrect && <span className="text-[10px] font-bold text-rose-700">YOUR PICK</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanation */}
                    <div className="p-3 rounded-lg bg-white/80 border border-slate-200/80 text-xs text-slate-700">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
