"use client";

import React, { useState } from "react";
import { X, Sparkles } from "lucide-react";

export const DownloadBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 border-b-4 border-indigo-900 px-4 py-2 text-white relative z-30 select-none rounded-2xl mb-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center font-black text-xs text-slate-950 shrink-0 shadow-md">
            해
          </div>
          <span className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
            <span>HaechiVN – Học Tiếng Hàn Quốc & Ôn Thẻ Anki SRS Miễn Phí trên mọi thiết bị</span>
          </span>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
