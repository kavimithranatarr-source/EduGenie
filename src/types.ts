export type AcademicLevel = 'High School' | 'Undergraduate' | 'Graduate/Master' | 'Curious Beginner';

export type SubjectCategory =
  | 'Computer Science & AI'
  | 'Mathematics & Statistics'
  | 'Physics & Astronomy'
  | 'Chemistry & Materials'
  | 'Biology & Medicine'
  | 'Economics & Finance'
  | 'History & Philosophy'
  | 'Literature & Writing';

export type ExplanationMode =
  | 'eli5'
  | 'analogy'
  | 'first-principles'
  | 'visual-mental-model'
  | 'cheat-sheet';

export type SummaryFormat =
  | 'structured'
  | 'bullet-points'
  | 'exam-cram'
  | 'flashcards-extract'
  | 'action-items';

export interface ConceptExplanation {
  title: string;
  oneSentenceSummary: string;
  coreAnalogy: {
    title: string;
    story: string;
    mapping: Array<{ conceptComponent: string; analogyComponent: string }>;
  };
  detailedExplanation: string;
  firstPrinciplesBreakdown: string[];
  commonMisconceptions: Array<{ misconception: string; reality: string }>;
  realWorldApplications: string[];
  quickCheckQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  cheatSheetTakeaways: string[];
}

export interface SummaryResult {
  title: string;
  executiveSummary: string;
  keyTakeaways: string[];
  coreConcepts: Array<{ term: string; definition: string; significance: string }>;
  formulasOrKeyRules: string[];
  examTips: string[];
  actionItems: string[];
  estimatedReadingTimeMinutes: number;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'short_answer';
  question: string;
  options: string[];
  correctIndex: number;
  idealAnswer: string;
  explanation: string;
  hint: string;
  conceptTested: string;
}

export interface QuizData {
  quizTitle: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
}

export interface ShortAnswerEvaluation {
  score: number;
  isCorrect: boolean;
  feedback: string;
  strengths: string[];
  missingPoints: string[];
  improvementSuggestion: string;
}

export interface Milestone {
  id: string;
  phase: string;
  title: string;
  duration: string;
  objectives: string[];
  keyTopics: string[];
  recommendedProjects: string[];
  selfAssessmentChecklist: string[];
  checkpointQuestion: string;
  completed?: boolean;
}

export interface LearningRoadmap {
  roadmapTitle: string;
  summary: string;
  targetProficiency: string;
  totalEstimatedHours: number;
  milestones: Milestone[];
  studyTips: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint: string;
  tags: string[];
  rating?: 'again' | 'hard' | 'good' | 'easy';
}

export interface FlashcardDeck {
  deckTitle: string;
  description: string;
  category: string;
  cards: Flashcard[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface HistoryItem {
  id: string;
  type: 'qa' | 'explanation' | 'summary' | 'quiz' | 'roadmap' | 'flashcards';
  title: string;
  subject?: string;
  score?: number;
  date: string;
  summary: string;
}

export interface UserStats {
  streakDays: number;
  lastActiveDate: string;
  questionsAsked: number;
  quizzesCompleted: number;
  averageScore: number;
  flashcardsMastered: number;
  roadmapsActive: number;
  studyMinutes: number;
}
