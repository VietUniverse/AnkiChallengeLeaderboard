"use client";

import React, { useState, useEffect } from "react";
import { TOPIK_QUESTION_BANK, TopikQuestion } from "../data/topikQuestionBank";
import { GraduationCap, Timer, CheckCircle2, XCircle, ArrowRight, RotateCcw, Zap } from "lucide-react";
import { ApiClient } from "../lib/apiClient";

export const TopikExamModule: React.FC = () => {
  const [questions, setQuestions] = useState<TopikQuestion[]>(TOPIK_QUESTION_BANK);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(2400); // 40 minutes

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  const currentQ = questions[currentIndex];

  const handleSelectAnswer = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: optionIdx }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Calculate score
    let score = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });

    const xpEarned = Math.round((score / questions.length) * 50);
    ApiClient.recordStudySession("topik", questions.length, score, xpEarned, 2400 - timeLeft);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 max-w-3xl mx-auto select-none">
      {/* Header Banner */}
      <div className="card-duo p-5 bg-slate-900 border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Luyện Thi TOPIK I / II (Mock Exam)</h2>
            <p className="text-xs text-slate-400">Đề thi mô phỏng Đọc hiểu & Nghe sơ cấp chuẩn Viện Giáo Dục Quốc Gia Hàn Quốc</p>
          </div>
        </div>

        {/* Timer Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold text-xs">
          <Timer className="w-4 h-4" />
          <span>Thời gian còn lại: {formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="card-duo p-6 bg-slate-900 border-slate-800 space-y-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
              Câu {currentIndex + 1} / {questions.length} • {currentQ.level}
            </span>
            <span className="uppercase text-[10px] text-slate-500 font-mono">{currentQ.section}</span>
          </div>

          {/* Passage if any */}
          {currentQ.passage && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs leading-relaxed text-slate-200 font-noto font-semibold">
              <span className="text-slate-400 font-bold block mb-1">Đoạn văn bài đọc:</span>
              <p>{currentQ.passage}</p>
            </div>
          )}

          {/* Question text */}
          <h3 className="text-base font-black text-white font-noto">{currentQ.question}</h3>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQ.id] === optIdx;
              const isCorrect = currentQ.correctAnswer === optIdx;

              let btnStyle = "bg-slate-950 border-slate-800 text-slate-200 hover:border-blue-500/60";
              if (isSubmitted) {
                if (isCorrect) btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                else if (isSelected && !isCorrect) btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300";
              } else if (isSelected) {
                btnStyle = "bg-blue-600/20 border-blue-500 text-blue-300 font-bold";
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectAnswer(optIdx)}
                  className={`w-full p-4 rounded-2xl border-2 text-left text-xs font-bold font-noto transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[11px]">
                      {optIdx + 1}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {isSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation if submitted */}
          {isSubmitted && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200">
              <span className="font-black block mb-1">💡 Giải thích chi tiết:</span>
              <p>{currentQ.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="btn-duo btn-duo-primary px-4 py-2 text-xs disabled:opacity-40"
        >
          Câu Trước
        </button>

        {!isSubmitted ? (
          <button onClick={handleSubmit} className="btn-duo btn-duo-orange px-6 py-2.5 text-xs">
            Nộp Bài Thi TOPIK
          </button>
        ) : (
          <button
            onClick={() => {
              setIsSubmitted(false);
              setSelectedAnswers({});
              setCurrentIndex(0);
              setTimeLeft(2400);
            }}
            className="btn-duo btn-duo-success px-5 py-2.5 text-xs flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm Lại Đề Thi</span>
          </button>
        )}

        <button
          onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
          disabled={currentIndex === questions.length - 1}
          className="btn-duo btn-duo-primary px-4 py-2 text-xs disabled:opacity-40"
        >
          Câu Tiếp
        </button>
      </div>
    </div>
  );
};
