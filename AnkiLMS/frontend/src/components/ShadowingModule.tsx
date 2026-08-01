"use client";

import React, { useState, useRef } from "react";
import { SHADOWING_DATA, ShadowingLesson } from "../data/koreanData";
import { Repeat, Volume2, Mic, MicOff, CheckCircle2, Sparkles, User, ChevronLeft, ChevronRight, AlertTriangle, Filter, BookOpen } from "lucide-react";
import { ApiClient } from "../lib/apiClient";

export const ShadowingModule: React.FC = () => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [selectedTopik, setSelectedTopik] = useState<string>("all");
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState<string | null>(null);
  const [recordedScore, setRecordedScore] = useState<number | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Filter lessons by selected TOPIK
  const filteredLessons = selectedTopik === "all"
    ? SHADOWING_DATA
    : SHADOWING_DATA.filter(l => l.category.includes(`TOPIK ${selectedTopik}`));

  const currentLesson: ShadowingLesson = filteredLessons[currentLessonIndex] || filteredLessons[0] || SHADOWING_DATA[0];
  const currentLine = currentLesson.lines[activeLineIndex] || currentLesson.lines[0];

  const playLineAudio = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Tính điểm tương đồng giữa 2 chuỗi
  const calculateSimilarity = (target: string, actual: string): number => {
    const t = target.replace(/\s+/g, "").toLowerCase();
    const a = actual.replace(/\s+/g, "").toLowerCase();
    if (t.length === 0) return 0;
    let matches = 0;
    for (let i = 0; i < Math.min(t.length, a.length); i++) {
      if (t[i] === a[i]) matches++;
    }
    return Math.round((matches / Math.max(t.length, 1)) * 100);
  };

  const handleToggleRecord = () => {
    setSpeechError(null);

    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Trình duyệt không hỗ trợ Web Speech Recognition. Vui lòng dùng Chrome hoặc Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setRecordedText(transcript);

      const score = calculateSimilarity(currentLine.hangul, transcript);
      setRecordedScore(score);
      setIsRecording(false);

      const xp = Math.round(score / 10);
      ApiClient.recordStudySession("shadowing", 1, score >= 70 ? 1 : 0, xp, 5);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      if (event.error === "no-speech") {
        setSpeechError("Không phát hiện giọng nói. Hãy nói to hơn và thử lại.");
      } else if (event.error === "not-allowed") {
        setSpeechError("Bạn cần cấp quyền truy cập microphone cho trình duyệt.");
      } else {
        setSpeechError("Lỗi nhận dạng giọng nói: " + event.error);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setRecordedText(null);
    setRecordedScore(null);
    setIsRecording(true);
    recognition.start();
  };

  const handleNextLesson = () => {
    setCurrentLessonIndex((prev) => (prev + 1) % filteredLessons.length);
    setActiveLineIndex(0);
    setRecordedText(null);
    setRecordedScore(null);
    setSpeechError(null);
  };

  const handlePrevLesson = () => {
    setCurrentLessonIndex((prev) => (prev - 1 + filteredLessons.length) % filteredLessons.length);
    setActiveLineIndex(0);
    setRecordedText(null);
    setRecordedScore(null);
    setSpeechError(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 max-w-4xl mx-auto">
      
      {/* TOPIK Level Filter Bar */}
      <div className="card-duo p-4 bg-slate-900 border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Filter className="w-4 h-4 text-rose-400" />
          <span>Lọc theo TOPIK:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {["all", "1", "2", "3", "4", "5", "6"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setSelectedTopik(lvl);
                setCurrentLessonIndex(0);
                setActiveLineIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                selectedTopik === lvl
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {lvl === "all" ? "Tất Cả (14 Bài)" : `TOPIK ${lvl}`}
            </button>
          ))}
        </div>
      </div>

      {/* Title Header + Lesson Switcher & Select Dropdown */}
      <div className="card-duo p-6 bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold mb-2">
            <Repeat className="w-3.5 h-3.5" /> Luyện Nói Nhại (Shadowing TOPIK)
          </div>
          <h2 className="text-xl font-black text-white font-noto">{currentLesson.title}</h2>
          <p className="text-xs text-slate-400 mt-1">{currentLesson.category} • Thời lượng: {currentLesson.duration}</p>
        </div>

        {/* Lesson Switcher & Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <select
            value={currentLessonIndex}
            onChange={(e) => {
              setCurrentLessonIndex(Number(e.target.value));
              setActiveLineIndex(0);
            }}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer w-full sm:w-auto"
          >
            {filteredLessons.map((l, idx) => (
              <option key={l.id} value={idx}>
                {l.title} ({l.duration})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevLesson}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Bài trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-400 px-1">
              {currentLessonIndex + 1}/{filteredLessons.length}
            </span>
            <button
              onClick={handleNextLesson}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Bài tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Karaoke Interactive Player Card */}
      <div className="card-duo p-8 bg-slate-900 border-rose-500/30 space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 text-rose-400 font-bold text-xs">
          <User className="w-3.5 h-3.5" /> Nhân vật: {currentLine.speaker}
        </div>

        {/* 3-Tier Synchronized Subtitles with Correct Korean Font */}
        <div className="py-4 space-y-3">
          <h3 className="text-3xl sm:text-4xl font-black text-white font-noto tracking-wide leading-relaxed">
            {currentLine.hangul}
          </h3>
          <p className="text-sm font-mono text-rose-400 font-semibold">
            /{currentLine.romaja}/
          </p>
          <p className="text-sm text-slate-300 bg-slate-950/60 py-2.5 px-5 rounded-xl inline-block border border-slate-800">
            🇻🇳 {currentLine.vietnamese}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-800">
          <button
            onClick={() => playLineAudio(currentLine.hangul)}
            className="btn-duo btn-duo-primary px-6 py-3 text-xs flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4" /> Nghe Giọng Bản Xứ
          </button>

          <button
            onClick={handleToggleRecord}
            className={`btn-duo ${
              isRecording ? "btn-duo-danger animate-pulse" : "btn-duo-purple"
            } px-6 py-3 text-xs flex items-center gap-2`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isRecording ? "Đang Nghe... (Nói đi!)" : "Ghi Âm & Chấm Điểm"}</span>
          </button>
        </div>

        {/* Speech Error */}
        {speechError && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Speech Recognition Result */}
        {recordedScore !== null && recordedText !== null && (
          <div className="space-y-3 animate-fadeIn">
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 ${
                recordedScore >= 80
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : recordedScore >= 50
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Điểm phát âm: {recordedScore}/100</span>
              <span className="opacity-75">
                {recordedScore >= 80 ? "– Tuyệt vời! 🎉" : recordedScore >= 50 ? "– Khá tốt, cố thêm!" : "– Thử lại nhé!"}
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-bold">Bạn nói:</span>{" "}
              <span className="text-white font-noto font-bold">{recordedText}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-bold">Đáp án:</span>{" "}
              <span className="text-rose-400 font-noto font-bold">{currentLine.hangul}</span>
            </div>
          </div>
        )}
      </div>

      {/* Script Line Selection Tabs */}
      <div className="card-duo p-4 bg-slate-900 border-slate-700 space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Danh sách câu thoại trong bài học ({currentLesson.lines.length} câu):
        </span>
        {currentLesson.lines.map((line, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveLineIndex(idx);
              setRecordedScore(null);
              setRecordedText(null);
              setSpeechError(null);
            }}
            className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
              activeLineIndex === idx
                ? "bg-rose-500/20 border border-rose-500/40 text-white font-bold"
                : "bg-slate-950/40 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <span className="font-noto text-xs truncate">
              #{idx + 1}. {line.hangul}
            </span>
            <span className="text-[10px] font-mono text-slate-500">{line.startTime}s</span>
          </button>
        ))}
      </div>
    </div>
  );
};
