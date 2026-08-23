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
          <svg viewBox="0 0 200 160" className="h-14 w-14">
            <defs>
              <radialGradient id="woodBody" cx="42%" cy="35%" r="78%">
                <stop offset="0%" stopColor="#D2A679" />
                <stop offset="45%" stopColor="#A0522D" />
                <stop offset="100%" stopColor="#8B4513" />
              </radialGradient>
              <linearGradient id="woodTail" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#A0522D" />
                <stop offset="100%" stopColor="#8B4513" />
              </linearGradient>
              <filter id="woodShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2E1B0A" floodOpacity="0.35" />
              </filter>
            </defs>
            {/* 鱼尾 */}
            <path
              d="M158 80c10-8 10-18 0-26l38-24v100l-38-24c10-8 10-18 0-26z"
              fill="url(#woodTail)"
            />
            {/* 鱼身主体 */}
            <path
              d="M42 80c0-34 28-58 68-58s74 20 74 58-30 58-74 58-68-24-68-58z"
              fill="url(#woodBody)"
              stroke="#5D3A1A"
              strokeWidth="1.5"
              filter="url(#woodShadow)"
            />
            {/* 鱼嘴 */}
            <path
              d="M42 62L16 80l26 18c-10-12-10-24 0-36z"
              fill="#3E2410"
            />
            {/* 鱼眼 */}
            <circle cx="62" cy="58" r="5" fill="#2E1B0A" />
            <circle cx="63.5" cy="56.2" r="1.6" fill="#D2B48C" />
            {/* 鱼鳞纹理 */}
            <g stroke="#704020" strokeWidth="1.4" fill="none" opacity="0.45" strokeLinecap="round">
              <path d="M72 50q14 10 28 0" />
              <path d="M82 66q14 10 28 0" />
              <path d="M72 82q14 10 28 0" />
            </g>
            {/* 腹部打击槽（被敲击时颜色稍亮） */}
            <path
              d="M75 86c0-16 22-24 46-18 14 4 26 16 26 32 0 18-20 28-46 22-22-6-36-20-26-36z"
              fill="#3E2410"
              opacity="0.85"
            />
            <path
              className="transition-colors duration-75 group-active:fill-[#E8C9A0]"
              d="M80 88c0-10 18-16 38-12 12 3 20 12 20 22 0 12-16 20-38 16-18-4-30-14-20-26z"
              fill="#C59665"
              opacity="0.75"
            />
            {/* 木槌：默认抬起，按下时落下敲击 */}
            <g className="transition-transform duration-75 origin-[150px_30px] -rotate-25 group-active:rotate-12">
              <rect x="146" y="16" width="6" height="58" rx="3" fill="#6B3E23" />
              <circle cx="149" cy="18" r="5" fill="#5D3A1A" />
              <ellipse cx="149" cy="78" rx="8" ry="12" fill="#D2B48C" />
              <ellipse cx="149" cy="78" rx="5" ry="8" fill="#C19A6B" />
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
