import { FlashcardDeck, HistoryItem, LearningRoadmap, UserStats } from '../types';

const STATS_KEY = 'edugenie_user_stats';
const HISTORY_KEY = 'edugenie_history';
const ROADMAPS_KEY = 'edugenie_roadmaps';
const FLASHCARDS_KEY = 'edugenie_flashcards';

const defaultStats: UserStats = {
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  questionsAsked: 0,
  quizzesCompleted: 0,
  averageScore: 0,
  flashcardsMastered: 0,
  roadmapsActive: 0,
  studyMinutes: 15,
};

export function getStoredStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw);
    return updateStreak(parsed);
  } catch {
    return defaultStats;
  }
}

export function saveStoredStats(stats: UserStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats', e);
  }
}

function updateStreak(stats: UserStats): UserStats {
  const today = new Date().toISOString().split('T')[0];
  if (stats.lastActiveDate === today) {
    return stats;
  }

  const last = new Date(stats.lastActiveDate);
  const current = new Date(today);
  const diffDays = Math.round((current.getTime() - last.getTime()) / (1000 * 3600 * 24));

  if (diffDays === 1) {
    stats.streakDays += 1;
  } else if (diffDays > 1) {
    stats.streakDays = 1;
  }
  stats.lastActiveDate = today;
  saveStoredStats(stats);
  return stats;
}

export function recordQuestionAsked() {
  const stats = getStoredStats();
  stats.questionsAsked += 1;
  stats.studyMinutes += 4;
  saveStoredStats(stats);
}

export function recordQuizCompleted(score: number) {
  const stats = getStoredStats();
  const prevCount = stats.quizzesCompleted;
  const newCount = prevCount + 1;
  const newAvg = Math.round(((stats.averageScore * prevCount) + score) / newCount);

  stats.quizzesCompleted = newCount;
  stats.averageScore = newAvg;
  stats.studyMinutes += 8;
  saveStoredStats(stats);
}

export function recordFlashcardMastered() {
  const stats = getStoredStats();
  stats.flashcardsMastered += 1;
  stats.studyMinutes += 2;
  saveStoredStats(stats);
}

export function getStoredHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistoryItem(item: Omit<HistoryItem, 'id' | 'date'>) {
  try {
    const history = getStoredHistory();
    const newItem: HistoryItem = {
      ...item,
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    const updated = [newItem, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return newItem;
  } catch (e) {
    console.error('Failed to add history item', e);
  }
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function getSavedRoadmaps(): LearningRoadmap[] {
  try {
    const raw = localStorage.getItem(ROADMAPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRoadmap(roadmap: LearningRoadmap) {
  try {
    const roadmaps = getSavedRoadmaps();
    const filtered = roadmaps.filter((r) => r.roadmapTitle !== roadmap.roadmapTitle);
    const updated = [roadmap, ...filtered];
    localStorage.setItem(ROADMAPS_KEY, JSON.stringify(updated));
    const stats = getStoredStats();
    stats.roadmapsActive = updated.length;
    saveStoredStats(stats);
  } catch (e) {
    console.error('Failed to save roadmap', e);
  }
}

export function getSavedDecks(): FlashcardDeck[] {
  try {
    const raw = localStorage.getItem(FLASHCARDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDeck(deck: FlashcardDeck) {
  try {
    const decks = getSavedDecks();
    const filtered = decks.filter((d) => d.deckTitle !== deck.deckTitle);
    const updated = [deck, ...filtered];
    localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save flashcard deck', e);
  }
}
