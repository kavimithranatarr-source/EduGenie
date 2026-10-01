import {
  AcademicLevel,
  ConceptExplanation,
  ExplanationMode,
  FlashcardDeck,
  LearningRoadmap,
  QuizData,
  ShortAnswerEvaluation,
  SummaryFormat,
  SummaryResult,
} from '../types';

export async function askQuestion(
  question: string,
  subject: string,
  academicLevel: AcademicLevel
): Promise<{ answer: string; subject: string; academicLevel: string }> {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, subject, academicLevel }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }
  return res.json();
}

export async function explainConcept(
  topic: string,
  mode: ExplanationMode,
  targetAudience: string
): Promise<ConceptExplanation> {
  const res = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, mode, targetAudience }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }
  return res.json();
}

export async function summarizeText(
  text: string,
  format: SummaryFormat,
  focusArea: string
): Promise<SummaryResult> {
  const res = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, format, focusArea }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }
  return res.json();
}

export async function generateQuiz(
  topicOrText: string,
  count: number,
  difficulty: 'easy' | 'medium' | 'hard',
  questionType: 'mcq' | 'conceptual' | 'mixed'
): Promise<QuizData> {
  const res = await fetch('/api/quiz/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicOrText, count, difficulty, questionType }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }
  return res.json();
}

export async function evaluateShortAnswer(
  question: string,
  studentAnswer: string,
  idealAnswer: string,
  conceptTested: string
): Promise<ShortAnswerEvaluation> {
  const res = await fetch('/api/quiz/evaluate-short-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, studentAnswer, idealAnswer, conceptTested }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }
  return res.json();
}

export async function generateLearningPath(
  goal: string,
  currentLevel: 'beginner' | 'intermediate' | 'advanced',
  timeframe: string,
  weeklyHours: number
): Promise<LearningRoadmap> {
  const res = await fetch('/api/learning-path', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, currentLevel, timeframe, weeklyHours }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }
  return res.json();
}

export async function generateFlashcards(
  topicOrText: string,
  count: number
): Promise<FlashcardDeck> {
  const res = await fetch('/api/flashcards/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicOrText, count }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }
  return res.json();
}

export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  academicSubject: string,
  currentTopic: string
): Promise<{ reply: string }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, academicSubject, currentTopic }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }
  return res.json();
}

export async function checkApiHealth() {
  const res = await fetch('/api/health');
  return res.json();
}
