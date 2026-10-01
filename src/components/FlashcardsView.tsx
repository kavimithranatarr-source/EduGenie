import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Loader2,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Bookmark,
  Share2,
} from 'lucide-react';
import { FlashcardDeck } from '../types';
import { generateFlashcards } from '../utils/api';
import { addHistoryItem, getSavedDecks, recordFlashcardMastered, saveDeck } from '../utils/storage';

interface FlashcardsViewProps {
  initialTopic?: string;
  onNotify?: (msg: string) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  initialTopic = '',
  onNotify,
}) => {
  const [topicOrText, setTopicOrText] = useState(initialTopic);
  const [cardCount, setCardCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Deck & Review State
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [savedDecks, setSavedDecks] = useState<FlashcardDeck[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, 'again' | 'hard' | 'good' | 'easy'>>({});
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const list = getSavedDecks();
    setSavedDecks(list);
    if (list.length > 0 && !deck) {
      setDeck(list[0]);
    }
  }, []);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topicOrText.trim()) return;

    setLoading(true);
    setError(null);
    setIsFlipped(false);
    setShowHint(false);
    setCurrentCardIndex(0);
    setRatings({});

    try {
      const newDeck = await generateFlashcards(topicOrText.trim(), cardCount);
      setDeck(newDeck);
      saveDeck(newDeck);
      setSavedDecks(getSavedDecks());

      addHistoryItem({
        type: 'flashcards',
        title: newDeck.deckTitle,
        summary: `${newDeck.cards.length} active recall cards created for ${newDeck.category || 'Study'}.`,
      });

      if (onNotify) onNotify(`Created deck "${newDeck.deckTitle}" with ${newDeck.cards.length} cards!`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate flashcard deck.');
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    setRatings((prev) => ({ ...prev, [cardId]: rating }));
    if (rating === 'good' || rating === 'easy') {
      recordFlashcardMastered();
    }
    // Advance to next card if not at end
    if (deck && currentCardIndex < deck.cards.length - 1) {
      setTimeout(() => {
        setIsFlipped(false);
        setShowHint(false);
        setCurrentCardIndex((prev) => prev + 1);
      }, 250);
    }
  };

  const handleNext = () => {
    if (!deck || currentCardIndex >= deck.cards.length - 1) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentCardIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentCardIndex <= 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentCardIndex((prev) => prev - 1);
  };

  const currentCard = deck ? deck.cards[currentCardIndex] : null;
  const masteredCount = Object.values(ratings).filter((r) => r === 'good' || r === 'easy').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Spaced Repetition & Active Recall</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            High-Yield Flashcard Deck Generator
          </h1>
          <p className="mt-2 text-violet-200 text-sm sm:text-base leading-relaxed">
            Convert any academic chapter or notes into interactive flashcards. Rate your recall
            confidence (Again, Hard, Good, Easy) to solidify long-term memory.
          </p>
        </div>
      </div>

      {/* Generator Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              Topic, Chapter, or Notes to Transform into Flashcards
            </label>
            <textarea
              value={topicOrText}
              onChange={(e) => setTopicOrText(e.target.value)}
              rows={3}
              placeholder="e.g. 'Photosynthesis Light vs Dark Reactions', 'Organic Chemistry Functional Groups', or paste your study notes..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all resize-y"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Deck Size:
              </label>
              <select
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:border-violet-600"
              >
                <option value={5}>5 Cards (Quick Refresh)</option>
                <option value={8}>8 Cards (Standard Deck)</option>
                <option value={12}>12 Cards (Comprehensive)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !topicOrText.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-98 text-white text-sm font-semibold shadow-md shadow-violet-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Flashcard Deck...</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Generate Flashcards</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Saved Decks Picker */}
      {savedDecks.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-semibold text-slate-500 whitespace-nowrap">Saved Decks:</span>
          {savedDecks.map((d, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setDeck(d);
                setCurrentCardIndex(0);
                setIsFlipped(false);
                setShowHint(false);
              }}
              className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
                deck?.deckTitle === d.deckTitle
                  ? 'bg-violet-600 text-white font-semibold border-violet-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {d.deckTitle} ({d.cards.length})
            </button>
          ))}
        </div>
      )}

      {/* Interactive Flashcard Study Arena */}
      {deck && currentCard && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
          {/* Header Stats */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs">
            <div>
              <span className="font-bold text-violet-700 uppercase tracking-wider">
                {deck.category}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{deck.deckTitle}</h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 font-semibold text-slate-700">
                Card {currentCardIndex + 1} of {deck.cards.length}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                {masteredCount} Mastered
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-violet-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentCardIndex + 1) / deck.cards.length) * 100}%` }}
            />
          </div>

          {/* 3D Flip Flashcard */}
          <div
            onClick={handleFlip}
            className="w-full min-h-[280px] sm:min-h-[320px] rounded-2xl border-2 border-slate-200 hover:border-violet-300 p-6 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 shadow-sm relative group bg-linear-to-b from-slate-50/50 to-white"
          >
            <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-violet-600 transition-colors">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Click to flip</span>
            </div>

            <div className="absolute top-4 left-4">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  isFlipped ? 'bg-emerald-50 text-emerald-700' : 'bg-violet-50 text-violet-700'
                }`}
              >
                {isFlipped ? 'Answer / Definition' : 'Prompt / Concept'}
              </span>
            </div>

            {/* Card Content */}
            <div className="max-w-xl space-y-4 my-auto">
              {!isFlipped ? (
                <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {currentCard.front}
                </div>
              ) : (
                <div className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal">
                  {currentCard.back}
                </div>
              )}
            </div>

            {/* Card Tags */}
            {currentCard.tags && currentCard.tags.length > 0 && (
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-1">
                {currentCard.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Hint disclosure */}
          {currentCard.hint && (
            <div className="flex justify-center">
              {showHint ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 max-w-md">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Hint:</strong> {currentCard.hint}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="text-xs text-amber-700 hover:text-amber-800 underline font-medium flex items-center gap-1.5"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Show Hint</span>
                </button>
              )}
            </div>
          )}

          {/* Spaced Repetition Rating Buttons */}
          <div className="space-y-3 pt-2">
            <div className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rate Your Recall
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => handleRate(currentCard.id, 'again')}
                className="p-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-all text-center"
              >
                <div>Again</div>
                <div className="text-[10px] font-normal text-rose-600">&lt; 1 min</div>
              </button>

              <button
                type="button"
                onClick={() => handleRate(currentCard.id, 'hard')}
                className="p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all text-center"
              >
                <div>Hard</div>
                <div className="text-[10px] font-normal text-amber-600">~ 10 mins</div>
              </button>

              <button
                type="button"
                onClick={() => handleRate(currentCard.id, 'good')}
                className="p-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition-all text-center"
              >
                <div>Good</div>
                <div className="text-[10px] font-normal text-blue-600">1 day</div>
              </button>

              <button
                type="button"
                onClick={() => handleRate(currentCard.id, 'easy')}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-all text-center"
              >
                <div>Easy</div>
                <div className="text-[10px] font-normal text-emerald-600">4 days</div>
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={currentCardIndex === 0}
              onClick={handlePrev}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-slate-500 font-medium">
              Tip: Press Spacebar or click the card to flip
            </span>

            <button
              type="button"
              disabled={currentCardIndex >= deck.cards.length - 1}
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
