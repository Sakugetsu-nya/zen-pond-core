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
          <svg viewBox="0 0 220 170" className="h-16 w-16">
            <defs>
              <radialGradient id="woodBody" cx="45%" cy="22%" r="82%">
                <stop offset="0%" stopColor="#C07A55" />
                <stop offset="60%" stopColor="#9B5E3D" />
                <stop offset="100%" stopColor="#754225" />
              </radialGradient>
              <linearGradient id="woodBase" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#A06A45" />
                <stop offset="100%" stopColor="#6B3E26" />
              </linearGradient>
              <filter id="woodShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2E1B0A" floodOpacity="0.32" />
              </filter>
            </defs>

            {/* 木槌：放在木鱼正上方，按下时落下敲一下 */}
            <g className="transition-transform duration-75 origin-[110px_70px] -rotate-0 group-active:rotate-[8deg] group-active:translate-y-[10px]">
              <rect x="106" y="2" width="8" height="56" rx="4" fill="#E8DCC8" stroke="#D4C4B0" strokeWidth="1" />
              <circle cx="110" cy="60" r="13" fill="#F5E6D3" stroke="#D4C4B0" strokeWidth="1" />
              <circle cx="108" cy="58" r="4" fill="#E8DCC8" opacity="0.6" />
            </g>

            {/* 底座 / 下半球 */}
            <path
              d="M40 95 C40 95 45 140 110 140 C175 140 180 95 180 95 C180 95 160 105 110 105 C60 105 40 95 40 95 Z"
              fill="url(#woodBase)"
              stroke="#4A2515"
              strokeWidth="1"
            />

            {/* 上半球 */}
            <path
              d="M40 95 C40 50 70 20 110 20 C150 20 180 50 180 95 C180 100 150 105 110 105 C70 105 40 100 40 95 Z"
              fill="url(#woodBody)"
              stroke="#4A2515"
              strokeWidth="1.5"
              filter="url(#woodShadow)"
            />

            {/* 小尾巴 */}
            <circle cx="178" cy="58" r="7" fill="#9B5E3D" stroke="#754225" strokeWidth="1" />

            {/* 横向打击开口 */}
            <path
              className="transition-colors duration-75 group-active:fill-[#5D3020]"
              d="M45 92 C45 92 70 98 110 98 C150 98 175 92 175 92 C175 92 150 108 110 108 C70 108 45 108 45 92 Z"
              fill="#3E1F10"
              stroke="#2A150A"
              strokeWidth="1"
            />

            {/* 参考图的脸：白圈黑眼 + 小三角嘴 */}
            <circle cx="75" cy="55" r="11" fill="#FFF8E7" stroke="#E8DCC8" strokeWidth="1" />
            <circle cx="75" cy="55" r="6" fill="#1a1a1a" />
            <circle cx="140" cy="55" r="11" fill="#FFF8E7" stroke="#E8DCC8" strokeWidth="1" />
            <circle cx="140" cy="55" r="6" fill="#1a1a1a" />
            <path d="M102 72 l8 12 l8 -12 Z" fill="#1a1a1a" />
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
