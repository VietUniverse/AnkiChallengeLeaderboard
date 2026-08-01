"use client";

import React, { useState } from "react";
import { VOCABULARY_DATA, VocabularyItem } from "../data/koreanData";
import { AnkiDeck } from "../lib/ankiParser";
import { Volume2, RotateCw, CheckCircle2, Sparkles, Layers, Zap } from "lucide-react";
import { calculateSM2, SM2Rating, SM2State } from "../lib/sm2";
import { ApiClient } from "../lib/apiClient";

interface VocabularySRSModuleProps {
  userDecks?: AnkiDeck[];
}

export const VocabularySRSModule: React.FC<VocabularySRSModuleProps> = ({ userDecks = [] }) => {
  const [selectedDeckId, setSelectedDeckId] = useState<string>("default");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [cardStateMap, setCardStateMap] = useState<Record<string, SM2State>>({});

  // Combine default dataset or user imported decks
  const activeDeckCards =
    selectedDeckId === "default"
      ? VOCABULARY_DATA.map((item) => ({
          id: parseInt(item.id.replace("v", "")),
          noteId: 0,
          deckName: "Bộ từ vựng tiếng Hàn cơ bản",
          front: item.hangul,
          back: item.vietnamese,
          fields: [item.hangul, item.vietnamese],
          tags: [item.topic],
          koreanText: item.hangul,
          vietnameseMeaning: item.vietnamese,
          romanization: item.romaja,
          exampleSentence: item.exampleSentence,
          mediaFiles: [],
          dueDate: 0,
          interval: 1,
          reps: 0,
          lapses: 0,
          state: "new" as const,
        }))
      : userDecks.find((d) => d.id === selectedDeckId)?.cards || [];

  const currentCard = activeDeckCards[currentIndex] || activeDeckCards[0];
  const cardKey = `${selectedDeckId}_${currentCard?.id}`;
  const currentCardState = cardStateMap[cardKey] || {
    interval: 1,
    easeFactor: 2.5,
    reps: 0,
    lapses: 0,
    state: "new",
    dueDate: new Date().toISOString().split("T")[0],
  };

  const handleNext = (rating: SM2Rating) => {
    // Apply SM-2 algorithm calculation
    const newState = calculateSM2(rating, currentCardState);
    setCardStateMap((prev) => ({ ...prev, [cardKey]: newState }));

    // XP gained: 10 XP for good/easy, 5 for hard, 2 for again
    const gained = rating === "easy" ? 15 : rating === "good" ? 10 : rating === "hard" ? 5 : 2;
    setSessionXp((prev) => prev + gained);
    setReviewedCount((prev) => prev + 1);

    // Record session data in backend
    ApiClient.recordStudySession("srs", 1, rating !== "again" ? 1 : 0, gained, 10);

    setIsFlipped(false);
    if (currentIndex < activeDeckCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back
    }
  };

  const playSound = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 max-w-3xl mx-auto select-none">
      {/* Deck Selector Header */}
      <div className="card-duo p-5 bg-slate-900 border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Ôn Tập Thẻ Từ Vựng (SRS SM-2)</h2>
            <p className="text-xs text-slate-400">Thuật toán lặp lại ngắt quãng SuperMemo-2 chuẩn Anki</p>
          </div>
        </div>

        {/* Select Deck Dropdown */}
        <select
          value={selectedDeckId}
          onChange={(e) => {
            setSelectedDeckId(e.target.value);
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none"
        >
          <option value="default">Bộ Tiếng Hàn Cơ Bản (Mặc định)</option>
          {userDecks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              📁 {deck.name} ({deck.cardCount} thẻ)
            </option>
          ))}
        </select>
      </div>

      {/* Progress Indicator & Stats */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-2">
        <span>Tiến độ: {currentIndex + 1} / {activeDeckCards.length} thẻ</span>
        <div className="flex items-center gap-3">
          <span className="text-blue-400 flex items-center gap-1 font-black">
            <Zap className="w-3.5 h-3.5 fill-blue-400" /> +{sessionXp} XP
          </span>
          <span className="text-emerald-400 font-extrabold">Đã thuộc: {reviewedCount} thẻ</span>
        </div>
      </div>

      {/* Flashcard Component */}
      {currentCard && (
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`card-duo min-h-[320px] p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 transform ${
            isFlipped
              ? "border-amber-400 bg-amber-950/20 shadow-amber-500/20"
              : "border-slate-700 bg-slate-900 hover:border-slate-500"
          }`}
        >
          {/* Card Top Action Bar */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 font-semibold">
                {currentCard.tags?.[0] || "Từ vựng"}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">
                Interval: {currentCardState.interval}d (EF: {currentCardState.easeFactor})
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                playSound(currentCard.koreanText || currentCard.front);
              }}
              className="p-2 text-amber-400 hover:text-amber-300 rounded-full bg-amber-500/10"
              title="Phát âm"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Card Content Front / Back */}
          <div className="text-center py-8">
            {!isFlipped ? (
              <div>
                <h3 className="text-5xl font-black text-white font-noto tracking-wider mb-3">
                  {currentCard.koreanText || currentCard.front}
                </h3>
                {currentCard.romanization && (
                  <p className="text-sm font-mono text-amber-400/90 font-semibold">
                    /{currentCard.romanization}/
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-6 flex items-center justify-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" /> Chạm vào thẻ để xem nghĩa & ví dụ
                </p>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <h3 className="text-3xl font-black text-amber-400 mb-2">
                  {currentCard.vietnameseMeaning || currentCard.back}
                </h3>
                <p className="text-lg font-bold text-white font-noto mb-4">
                  {currentCard.koreanText || currentCard.front}
                </p>
                {currentCard.exampleSentence && (
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                    <span className="text-slate-400 font-bold block mb-1">Ví dụ:</span>
                    <p className="font-noto font-bold text-slate-200">{currentCard.exampleSentence}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer instruction */}
          <div className="text-center text-[11px] text-slate-500">
            {isFlipped ? "Chọn mức độ ghi nhớ bên dưới" : "Thẻ Anki SRS Interactive"}
          </div>
        </div>
      )}

      {/* SRS Anki Rating Buttons */}
      {isFlipped && (
        <div className="grid grid-cols-4 gap-3 animate-fadeIn">
          <button
            onClick={() => handleNext("again")}
            className="btn-duo btn-duo-danger py-3 text-xs flex flex-col items-center"
          >
            <span>Thử lại</span>
            <span className="text-[9px] opacity-75 font-mono">1 ngày</span>
          </button>

          <button
            onClick={() => handleNext("hard")}
            className="btn-duo btn-duo-warning py-3 text-xs flex flex-col items-center"
          >
            <span>Khó</span>
            <span className="text-[9px] opacity-75 font-mono">
              {Math.round(currentCardState.interval * 1.2)} ngày
            </span>
          </button>

          <button
            onClick={() => handleNext("good")}
            className="btn-duo btn-duo-primary py-3 text-xs flex flex-col items-center"
          >
            <span>Tốt</span>
            <span className="text-[9px] opacity-75 font-mono">
              {Math.round(currentCardState.interval * currentCardState.easeFactor)} ngày
            </span>
          </button>

          <button
            onClick={() => handleNext("easy")}
            className="btn-duo btn-duo-success py-3 text-xs flex flex-col items-center"
          >
            <span>Dễ</span>
            <span className="text-[9px] opacity-75 font-mono">
              {Math.round(currentCardState.interval * currentCardState.easeFactor * 1.3)} ngày
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
