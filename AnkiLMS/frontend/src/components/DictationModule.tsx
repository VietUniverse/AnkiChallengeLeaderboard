"use client";

import React, { useState, useEffect, useRef } from "react";
import { Headphones, Volume2, CheckCircle2, Play, RefreshCw, HelpCircle, Sparkles, Filter, ChevronLeft, ChevronRight, Eye, Mic, RotateCcw, Keyboard, ArrowLeft, Star, PlayCircle, Lock } from "lucide-react";
import { ApiClient } from "../lib/apiClient";

// Import TOPIK lessons dataset
import topikLessonsData from "../data/topik_lessons.json";

// Course Section Catalog Data
const COURSE_SECTIONS = [
  {
    id: "sec_gyeongbokgung",
    title: "Hành Trình Khám Phá Cung Điện 경복궁 (Talk To Me In Korean)",
    totalLessons: topikLessonsData.length,
    lessons: topikLessonsData
  },
  {
    id: "sec_daily",
    title: "Daily Korean Conversation (Hội thoại giao tiếp hàng ngày)",
    totalLessons: 4,
    lessons: topikLessonsData.slice(0, 4)
  },
  {
    id: "sec_travel",
    title: "Travel & Culture in Seoul (Du lịch & Văn hóa Seoul)",
    totalLessons: 6,
    lessons: topikLessonsData.slice(3, 9)
  }
];

export const DictationModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<"catalog" | "workspace">("catalog");
  const [selectedUserLevel, setSelectedUserLevel] = useState<"beginner" | "experienced">("experienced");
  const [selectedHashtag, setSelectedHashtag] = useState<string>("all");

  const [selectedTopik, setSelectedTopik] = useState<string>("all");
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [currentSubIndex, setCurrentSubIndex] = useState<number>(0);
  const [dictationInput, setDictationInput] = useState<string>("");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [revealedWordIndices, setRevealedWordIndices] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number | null>(null);
  const [completedSubIds, setCompletedSubIds] = useState<number[]>([]);

  const playerRef = useRef<any>(null);
  const checkIntervalRef = useRef<any>(null);

  // Filter lessons by TOPIK
  const filteredLessons = selectedTopik === "all"
    ? topikLessonsData
    : topikLessonsData.filter((l: any) => l.topikLevel === parseInt(selectedTopik));

  const currentLesson = filteredLessons[currentLessonIndex] || filteredLessons[0] || topikLessonsData[0];
  const currentSub = currentLesson.segments[currentSubIndex] || currentLesson.segments[0];

  // YouTube API Init
  useEffect(() => {
    if (viewMode !== "workspace") return;

    const loadYT = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        initYTPlayer();
      } else {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        (window as any).onYouTubeIframeAPIReady = () => initYTPlayer();
      }
    };

    loadYT();

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [viewMode, currentLessonIndex]);

  const initYTPlayer = () => {
    try {
      playerRef.current = new (window as any).YT.Player("yt-dictation-player", {
        height: "100%",
        width: "100%",
        videoId: "TLgAJgYqIZk",
        playerVars: {
          playsinline: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1
        }
      });
    } catch (e) {
      console.error("YouTube Player Init error:", e);
    }
  };

  const playSegment = (sub: any) => {
    if (!sub) return;
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      playerRef.current.setPlaybackRate(playbackSpeed);
      playerRef.current.seekTo(sub.start, true);
      playerRef.current.playVideo();

      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);

      checkIntervalRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
          const currentTime = playerRef.current.getCurrentTime();
          if (currentTime >= sub.end) {
            playerRef.current.pauseVideo();
            clearInterval(checkIntervalRef.current);
          }
        }
      }, 100);
    } else {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(sub.text);
        utterance.lang = "ko-KR";
        utterance.rate = playbackSpeed;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const playFullLesson = () => {
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      playerRef.current.setPlaybackRate(playbackSpeed);
      playerRef.current.seekTo(currentLesson.startSec, true);
      playerRef.current.playVideo();

      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);

      checkIntervalRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
          const currentTime = playerRef.current.getCurrentTime();
          if (currentTime >= currentLesson.endSec) {
            playerRef.current.pauseVideo();
            clearInterval(checkIntervalRef.current);
          }
        }
      }, 100);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    if (viewMode !== "workspace") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`" || e.code === "Backquote") {
        e.preventDefault();
        playSegment(currentSub);
      } else if (e.ctrlKey && e.key === "ArrowRight") {
        e.preventDefault();
        handleNextSub();
      } else if (e.ctrlKey && e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevSub();
      } else if (e.key === "Enter" && (e.ctrlKey || (document.activeElement && document.activeElement.tagName === "TEXTAREA"))) {
        e.preventDefault();
        handleCheckAnswer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, currentSub, dictationInput, currentSubIndex, currentLessonIndex]);

  const cleanText = (str: string) => str.replace(/[.,?!~"']/g, "").replace(/\s+/g, " ").trim();

  const handleCheckAnswer = () => {
    if (!dictationInput.trim()) return;

    const targetWords = cleanText(currentSub.text).split(" ");
    const userWords = cleanText(dictationInput).split(" ");

    let matches = 0;
    targetWords.forEach((w, idx) => {
      if (userWords[idx] === w) matches++;
    });

    const calcScore = Math.round((matches / Math.max(targetWords.length, 1)) * 100);
    setScore(calcScore);
    setIsSubmitted(true);

    if (calcScore >= 70) {
      if (!completedSubIds.includes(currentSub.id)) {
        setCompletedSubIds([...completedSubIds, currentSub.id]);
      }
      const xpEarned = Math.round(calcScore / 10);
      ApiClient.recordStudySession("dictation", 1, 1, xpEarned, 30);
    }
  };

  const handleSelectSub = (subIdx: number) => {
    setCurrentSubIndex(subIdx);
    setDictationInput("");
    setRevealedWordIndices([]);
    setIsSubmitted(false);
    setScore(null);
    playSegment(currentLesson.segments[subIdx]);
  };

  const handleNextSub = () => {
    if (currentSubIndex < currentLesson.segments.length - 1) {
      handleSelectSub(currentSubIndex + 1);
    } else if (currentLessonIndex < filteredLessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setCurrentSubIndex(0);
      setDictationInput("");
      setRevealedWordIndices([]);
      setIsSubmitted(false);
      setScore(null);
    }
  };

  const handlePrevSub = () => {
    if (currentSubIndex > 0) {
      handleSelectSub(currentSubIndex - 1);
    }
  };

  const toggleRevealWord = (wIdx: number) => {
    if (revealedWordIndices.includes(wIdx)) {
      setRevealedWordIndices(revealedWordIndices.filter(i => i !== wIdx));
    } else {
      setRevealedWordIndices([...revealedWordIndices, wIdx]);
    }
  };

  const revealAllWords = () => {
    const words = cleanText(currentSub.text).split(" ");
    setRevealedWordIndices(words.map((_, idx) => idx));
  };

  const openLessonWorkspace = (lessonIndex: number) => {
    setCurrentLessonIndex(lessonIndex);
    setCurrentSubIndex(0);
    setDictationInput("");
    setRevealedWordIndices([]);
    setIsSubmitted(false);
    setScore(null);
    setViewMode("workspace");
  };

  const targetWords = cleanText(currentSub.text).split(" ");

  // Topic Hashtags
  const HASHTAGS = [
    "#all", "#movie", "#daily", "#learning", "#shadowing", "#topik", "#entertainment", 
    "#seoul", "#travel", "#food", "#kpop", "#kdrama", "#news", "#culture", "#story", "#business"
  ];

  // Helper for Topik Level Badge styling
  const getTopikBadgeColor = (level: number) => {
    switch (level) {
      case 1: return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case 2: return "bg-sky-500/20 text-sky-400 border-sky-500/30";
      case 3: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case 4: return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      case 5: return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case 6: return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      default: return "bg-slate-800 text-slate-300";
    }
  };

  const getTopikLevelName = (level: number) => {
    switch (level) {
      case 1: return "A1";
      case 2: return "A2";
      case 3: return "B1";
      case 4: return "B2";
      case 5: return "C1";
      case 6: return "C2";
      default: return "B1";
    }
  };

  // ================= VIEW 1: CATALOG LANDING PAGE =================
  if (viewMode === "catalog") {
    return (
      <div className="space-y-8 animate-fadeIn pb-24 w-full max-w-[1700px] mx-auto text-slate-100 px-2 sm:px-4">

        {/* Banner 1: Header Explanation */}
        <div className="text-center space-y-2 py-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Giải thích Phương pháp Nghe chép chính tả
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Khám phá cách <span className="text-purple-400 font-bold">hiệu quả nhất</span> để học và tinh chỉnh <span className="text-sky-400 font-bold">kỹ năng nghe tiếng Hàn thực tế</span>
          </p>
        </div>

        {/* Banner 2: Level Selection Big Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedUserLevel("beginner")}
            className={`p-5 rounded-2xl border text-center transition-all ${
              selectedUserLevel === "beginner"
                ? "bg-slate-900 border-purple-500 shadow-xl shadow-purple-900/30"
                : "bg-slate-950/60 border-slate-800 hover:bg-slate-900 opacity-70"
            }`}
          >
            <h3 className="text-sm font-bold text-slate-200">Dành cho người mới bắt đầu (TOPIK 1 - 2)</h3>
            <p className="text-xs text-slate-400 mt-1">Tập trung vào phát âm cơ bản và luyện nghe từng từ, câu đơn giản</p>
          </button>

          <button
            onClick={() => setSelectedUserLevel("experienced")}
            className={`p-5 rounded-2xl border text-center transition-all ${
              selectedUserLevel === "experienced"
                ? "bg-slate-900 border-purple-500 shadow-xl shadow-purple-900/30"
                : "bg-slate-950/60 border-slate-800 hover:bg-slate-900 opacity-70"
            }`}
          >
            <h3 className="text-sm font-bold text-purple-400">Dành cho người đã có kinh nghiệm (TOPIK 3 - 6)</h3>
            <p className="text-xs text-slate-400 mt-1">Nâng cao kỹ năng với tốc độ nói thực tế và các chủ đề phức tạp hơn</p>
          </button>
        </div>

        {/* Section 3: Topic Hashtags List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Luyện Shadowing và dictation qua video đa dạng chủ đề
          </h3>
          <div className="flex flex-wrap gap-2">
            {HASHTAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedHashtag(tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-mono transition-all ${
                  selectedHashtag === tag
                    ? "bg-sky-500 text-white shadow-md shadow-sky-900/40"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Course Video Cards Sections Grid */}
        {COURSE_SECTIONS.map((sec) => (
          <section key={sec.id} className="space-y-4 pt-2">
            {/* Section Header Bar */}
            <div className="flex items-center justify-between border-l-4 border-purple-500 pl-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-white">{sec.title}</h2>
                <span className="text-xs text-slate-400 font-bold font-mono">({sec.totalLessons} bài học)</span>
              </div>

              <button
                onClick={() => setSelectedTopik("all")}
                className="px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-purple-500 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1"
              >
                <span>XEM TẤT CẢ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Video Cards 4-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {sec.lessons.map((lesson: any, idx: number) => {
                const isPro = idx === 0;
                const viewCount = (45000 + idx * 12340).toLocaleString();
                const levelTag = getTopikLevelName(lesson.topikLevel);
                const badgeColor = getTopikBadgeColor(lesson.topikLevel);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => openLessonWorkspace(idx)}
                    className="group bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-purple-900/20 flex flex-col justify-between"
                  >
                    {/* Card Thumbnail Area */}
                    <div className="relative w-full pt-[56.25%] bg-slate-950 overflow-hidden">
                      {/* Simulated YouTube Thumbnail Image */}
                      <img
                        src={`https://img.youtube.com/vi/TLgAJgYqIZk/hqdefault.jpg`}
                        alt={lesson.title}
                        className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      />

                      {/* Top Badges overlay */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {isPro && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                              👑 PRO
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-slate-300 text-[10px] font-bold font-mono">
                            🎧 {viewCount}
                          </span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-md border font-mono text-xs font-black backdrop-blur-md shadow-md ${badgeColor}`}>
                          {levelTag}
                        </span>
                      </div>

                      {/* Bottom Duration & Youtube Badge overlay */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                          ▶ Youtube
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-slate-300 text-[10px] font-mono font-bold">
                          ⏱️ {Math.round(lesson.durationSec)}s
                        </span>
                      </div>
                    </div>

                    {/* Card Content & Title */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-purple-400 transition-colors line-clamp-2 leading-relaxed font-noto">
                        {lesson.title}
                      </h4>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-slate-400">Dictation</span>
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-black font-mono">
                          92/100
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

      </div>
    );
  }

  // ================= VIEW 2: 3-COLUMN DICTATION WORKSPACE =================
  return (
    <div className="space-y-4 animate-fadeIn pb-24 w-full max-w-[1700px] mx-auto text-slate-100 px-2 sm:px-4">

      {/* Top Header Bar with Back Button */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
        <button
          onClick={() => setViewMode("catalog")}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh Sách Bài Học (Catalog)</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Bài đang học:</span>
          <span className="text-xs font-black text-purple-400 font-noto">{currentLesson.title}</span>
        </div>
      </div>

      {/* Keyboard Shortcut Banner */}
      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2 text-sky-400 font-bold">
          <Keyboard className="w-4 h-4" />
          <span>Hướng dẫn phím tắt:</span>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-slate-300">
          <span><kbd className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 font-mono text-sky-400 font-bold">`</kbd> (Backtick): <strong>Phát lại câu (Replay)</strong></span>
          <span><kbd className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 font-mono text-sky-400 font-bold">Ctrl + →</kbd>: <strong>Qua câu mới</strong></span>
          <span><kbd className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 font-mono text-sky-400 font-bold">Ctrl + ←</kbd>: <strong>Quay lui câu trước</strong></span>
          <span><kbd className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 font-mono text-sky-400 font-bold">Enter</kbd>: <strong>Kiểm tra câu gõ</strong></span>
        </div>
      </div>

      {/* Main Spacious Dashboard Layout (3 Columns) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">

        {/* LEFT COLUMN: 14 LESSONS MENU & TOPIK FILTER (Col 1-3) */}
        <aside className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 max-h-[820px] overflow-y-auto shadow-lg">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Headphones className="w-4.5 h-4.5 text-purple-400" />
              <span>DANH MỤC BÀI HỌC</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">14 Bài học ngắn (1-2 phút)</p>
          </div>

          {/* TOPIK Filter List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">🎯 CẤP ĐỘ TOPIK:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {["all", "1", "2", "3", "4", "5", "6"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setSelectedTopik(lvl);
                    setCurrentLessonIndex(0);
                    setCurrentSubIndex(0);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                    selectedTopik === lvl
                      ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                      : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {lvl === "all" ? "Tất Cả (14 Bài)" : `TOPIK ${lvl}`}
                </button>
              ))}
            </div>
          </div>

          {/* 14 Lessons Cards List */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">🎬 DANH SÁCH BÀI HỌC:</span>
            {filteredLessons.map((l: any, idx: number) => {
              const isSelected = idx === currentLessonIndex;
              return (
                <button
                  key={l.id}
                  onClick={() => {
                    setCurrentLessonIndex(idx);
                    setCurrentSubIndex(0);
                    setDictationInput("");
                    setRevealedWordIndices([]);
                    setIsSubmitted(false);
                    setScore(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all space-y-1.5 ${
                    isSelected
                      ? "bg-purple-600/20 border-purple-500 text-white font-bold shadow-md shadow-purple-900/30"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-400 font-extrabold font-mono">BÀI #{l.lessonNum}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold text-[11px]">{l.topikName}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{l.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>⏱️ {Math.round(l.durationSec)}s • {l.segmentCount} câu</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CENTER COLUMN: MAIN WORKSPACE (Col 4-9) */}
        <main className="xl:col-span-6 space-y-5">
          
          {/* Top Video Player Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <h2 className="font-extrabold text-white text-base font-noto">{currentLesson.title}</h2>
                <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 font-bold text-xs">{currentLesson.topikName}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">⏱️ {Math.round(currentLesson.durationSec)} giây ({currentLesson.segmentCount} câu)</span>
            </div>

            {/* Video Player */}
            <div className="relative w-full pt-[56.25%] bg-black rounded-xl overflow-hidden border border-slate-800 shadow-md">
              <div id="yt-dictation-player" className="absolute top-0 left-0 w-full h-full"></div>
            </div>

            {/* Control Buttons & Speed bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={playFullLesson}
                  className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>PHÁT CẢ BÀI (1-2p)</span>
                </button>

                <button
                  onClick={() => playSegment(currentSub)}
                  className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>PHÁT LẠI CÂU</span>
                </button>
              </div>

              {/* Speed Selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 px-1">Tốc độ:</span>
                {[0.5, 0.75, 1.0, 1.25, 1.5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                      playbackSpeed === s
                        ? "bg-purple-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dictation Input & Eye Reveal Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            
            {/* Input Label & Segment Prev/Next Navigation */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
              <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider">
                GÕ NHỮNG GÌ BẠN NGHE ĐƯỢC (CÂU #{currentSubIndex + 1} / {currentLesson.segments.length}):
              </label>

              <div className="flex items-center gap-2">
                <button onClick={handlePrevSub} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Câu trước
                </button>
                <button onClick={handleNextSub} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold flex items-center gap-1">
                  Câu tiếp <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Large Spacious Input Textarea */}
            <textarea
              rows={4}
              value={dictationInput}
              onChange={(e) => setDictationInput(e.target.value)}
              placeholder="Gõ câu trả lời tiếng Hàn của bạn ở đây..."
              disabled={isSubmitted}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-lg font-noto font-bold text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all leading-relaxed"
            />

            {/* Interactive Word Hint Boxes (Eye Reveal) */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {targetWords.map((word, wIdx) => {
                  const isRevealed = revealedWordIndices.includes(wIdx);
                  return (
                    <button
                      key={wIdx}
                      onClick={() => toggleRevealWord(wIdx)}
                      className={`px-3 py-2 rounded-xl border text-sm font-noto font-bold transition-all flex flex-col items-center gap-1 ${
                        isRevealed
                          ? "bg-purple-600/30 border-purple-500 text-sky-300"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-purple-500/50"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 opacity-60" />
                      <span>{isRevealed ? word : "*".repeat(word.length)}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-amber-400 font-medium">
                Các từ được tiết lộ sẽ bị tính là lỗi và ảnh hưởng đến điểm số của bạn.
              </p>
            </div>

            {/* Dictation Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={revealAllWords}
                className="py-3 px-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-400 font-bold text-xs hover:bg-amber-900/40 transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" /> HIỆN TẤT CẢ TỪ
              </button>

              {!isSubmitted ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={!dictationInput.trim()}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider disabled:opacity-50 shadow-lg shadow-purple-900/40 transition-all"
                >
                  KIỂM TRA CÂU GÕ (ENTER)
                </button>
              ) : (
                <button
                  onClick={handleNextSub}
                  className="py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-sky-900/40 transition-all"
                >
                  TIẾP THEO &gt;
                </button>
              )}
            </div>

            {/* Feedback Score Panel */}
            {isSubmitted && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">KẾT QUẢ SO SÁNH:</span>
                  <span className={(score || 0) >= 80 ? "text-emerald-400 text-sm font-extrabold" : "text-amber-400 text-sm font-extrabold"}>
                    {score}% Match
                  </span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-sm font-noto font-bold text-white leading-relaxed">
                  {currentSub.text}
                </div>
              </div>
            )}

          </div>
        </main>

        {/* RIGHT COLUMN: SUBTITLE TIMELINE LIST (BẢN CHÉP BÀI HỌC) (Col 10-12) */}
        <aside className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 max-h-[820px] overflow-y-auto shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">BẢN CHÉP BÀI HỌC</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
              {completedSubIds.length}/{currentLesson.segments.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {currentLesson.segments.map((sub: any, subIdx: number) => {
              const isSelected = subIdx === currentSubIndex;
              const isDone = completedSubIds.includes(sub.id);
              const words = cleanText(sub.text).split(" ");
              const masked = words.map(w => "*".repeat(w.length)).join(" ");

              return (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSub(subIdx)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all space-y-1.5 ${
                    isSelected
                      ? "bg-purple-600/20 border-purple-500 text-white shadow-md shadow-purple-900/30"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sky-400 font-mono font-bold">#{subIdx + 1} ({Math.floor(sub.start / 60)}:{Math.floor(sub.start % 60).toString().padStart(2, '0')})</span>
                    <span>{isDone ? "✅" : "⚠️"}</span>
                  </div>
                  <p className="text-xs font-noto font-bold line-clamp-2 leading-relaxed">
                    {isDone || isSelected ? sub.text : masked}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

      </div>
    </div>
  );
};
