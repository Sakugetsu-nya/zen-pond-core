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
          <svg viewBox="0 0 220 180" className="h-14 w-16">
            <defs>
              <radialGradient id="woodBody" cx="40%" cy="32%" r="82%">
                <stop offset="0%" stopColor="#C5855A" />
                <stop offset="60%" stopColor="#A06540" />
                <stop offset="100%" stopColor="#7A452A" />
              </radialGradient>
              <filter id="woodShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2E1B0A" floodOpacity="0.32" />
              </filter>
            </defs>

            {/* 木鱼主体：圆润侧放 */}
            <path
              d="M50 92 C50 58 80 34 120 34 C160 34 190 58 190 92 C190 120 160 136 120 136 C80 136 50 120 50 92 Z"
              fill="url(#woodBody)"
              stroke="#5A321D"
              strokeWidth="1.5"
              filter="url(#woodShadow)"
            />

            {/* 斜向打击开口 */}
            <path
              className="transition-colors duration-75 group-active:fill-[#5D3020]"
              d="M58 84 C58 84 90 64 130 74 C158 82 172 97 168 110 C164 120 132 110 112 98 C88 84 68 98 60 98 C52 98 52 88 58 84 Z"
              fill="#3E1F10"
              stroke="#2A150A"
              strokeWidth="1"
            />

            {/* 脸：白圈黑眼 + 小三角嘴 */}
            <circle cx="78" cy="70" r="9" fill="#FFF8E7" stroke="#E8DCC8" strokeWidth="1" />
            <circle cx="78" cy="70" r="5" fill="#1a1a1a" />
            <circle cx="108" cy="65" r="9" fill="#FFF8E7" stroke="#E8DCC8" strokeWidth="1" />
            <circle cx="108" cy="65" r="5" fill="#1a1a1a" />
            <path d="M90 80 l6 9 l6 -9 Z" fill="#1a1a1a" />

            {/* 木槌：悬空在右上方，点击时大幅落下敲击 */}
            <g className="transition-transform duration-75 origin-[165px_55px] rotate-0 group-active:rotate-[26deg] group-active:translate-y-[18px] group-active:translate-x-[-3px]">
              <rect x="162" y="18" width="5" height="42" rx="2.5" fill="#E8DCC8" stroke="#C19A6B" strokeWidth="1" transform="rotate(-35 164 39)" />
              <circle cx="150" cy="22" r="11" fill="#F5E6D3" stroke="#C19A6B" strokeWidth="1" />
              <circle cx="148" cy="20" r="3.5" fill="#E8DCC8" opacity="0.6" />
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
