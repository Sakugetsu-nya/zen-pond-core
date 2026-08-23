"use client";

import { useEffect, useState } from "react";
import { PanelShell } from "@/components/panel";
import { dropCenter, type ZenLiquidApp } from "@/components/ui/zen-liquid";
import { playWoodblock } from "@/lib/audio";

const STORAGE_KEY = "zen-fish-v1";

export function FishModule({
  app,
  onClose,
}: {
  app: ZenLiquidApp | null;
  onClose: () => void;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.date === today) setCount(saved.count || 0);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count }));
    } catch {
      /* ignore */
    }
  }, [count]);

  const tap = () => {
    playWoodblock();
    dropCenter(app, 0.1, 0.45);
    setCount((c) => c + 1);
  };

  return (
    <PanelShell title="赛博木鱼" onClose={onClose}>
      <div className="flex flex-col items-center gap-5 py-4">
        <button
          onClick={tap}
          className="group relative flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/10 text-[#1d9e75] shadow-lg transition-transform hover:bg-white/15 active:scale-90"
          aria-label="敲击木鱼"
        >
          <svg viewBox="0 0 200 190" className="h-16 w-16">
            <defs>
              <radialGradient id="woodBody" cx="38%" cy="22%" r="85%">
                <stop offset="0%" stopColor="#A65E3F" />
                <stop offset="55%" stopColor="#7A3A25" />
                <stop offset="100%" stopColor="#5C2A1A" />
              </radialGradient>
              <linearGradient id="woodBase" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6B3E26" />
                <stop offset="100%" stopColor="#4A2515" />
              </linearGradient>
              <filter id="woodShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#2E1B0A" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* 底座 */}
            <ellipse cx="130" cy="168" rx="42" ry="10" fill="url(#woodBase)" />

            {/* 木鱼主体：圆润梨形 */}
            <path
              d="M60 155 C35 155 28 118 32 82 C36 48 68 22 102 22 C136 22 166 48 171 82 C175 118 168 155 143 155 C118 168 85 168 60 155 Z"
              fill="url(#woodBody)"
              stroke="#4A2515"
              strokeWidth="1.5"
              filter="url(#woodShadow)"
            />

            {/* 打击开口：弧形长缝 */}
            <path
              className="transition-colors duration-75 group-active:fill-[#5D3020]"
              d="M52 78 C52 78 82 48 122 58 C148 65 162 95 158 122 C154 138 132 125 122 105 C112 85 85 105 62 105 C50 105 46 88 52 78 Z"
              fill="#3E1F10"
              stroke="#2A150A"
              strokeWidth="1"
            />
            {/* 开口内部高光 */}
            <path
              d="M60 78 C60 78 88 55 122 63 C140 68 152 90 148 110"
              stroke="#7A4A35"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.5"
            />

            {/* 原来那张脸：眼睛 + 倒 V 小嘴 */}
            <circle cx="58" cy="50" r="5" fill="#1a1a1a" />
            <circle cx="90" cy="50" r="5" fill="#1a1a1a" />
            <path
              d="M70 66 l5 10 l5 -10"
              stroke="#1a1a1a"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* 木槌：红色杆 + 米色圆头，按下时落下 */}
            <g className="transition-transform duration-75 origin-[165px_20px] -rotate-32 group-active:-rotate-6">
              <line x1="165" y1="15" x2="130" y2="102" stroke="#C0392B" strokeWidth="4" strokeLinecap="round" />
              <circle cx="130" cy="102" r="11" fill="#F5E6D3" stroke="#D4C4B0" strokeWidth="1" />
              <circle cx="128" cy="100" r="3.5" fill="#E8DCC8" opacity="0.6" />
            </g>
          </svg>
        </button>
        <div className="text-[15px] text-white/90">
          今日功德{" "}
          <strong className="ml-1 text-[26px] text-[#1d9e75]">{count}</strong>
        </div>
        <div className="text-xs text-white/50">心烦时，敲一敲。</div>
      </div>
    </PanelShell>
  );
}
