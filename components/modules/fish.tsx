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
          <svg viewBox="0 0 240 170" className="h-14 w-16">
            <defs>
              <radialGradient id="woodBody" cx="35%" cy="28%" r="85%">
                <stop offset="0%" stopColor="#C07A55" />
                <stop offset="55%" stopColor="#9B5E3D" />
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

            {/* 底座 */}
            <path
              d="M60 128 C60 128 85 142 130 142 C175 142 200 128 200 128 C200 128 175 138 130 138 C85 138 60 133 60 128 Z"
              fill="url(#woodBase)"
            />

            {/* 木鱼主体：半侧面椭圆 */}
            <path
              d="M55 88 C55 50 90 22 140 22 C185 22 215 50 215 88 C215 118 185 130 140 130 C90 130 55 118 55 88 Z"
              fill="url(#woodBody)"
              stroke="#4A2515"
              strokeWidth="1.5"
              filter="url(#woodShadow)"
            />

            {/* 斜向打击开口 */}
            <path
              className="transition-colors duration-75 group-active:fill-[#5D3020]"
              d="M65 78 C65 78 100 60 145 72 C175 80 190 95 185 108 C180 118 145 108 125 96 C100 82 78 96 68 96 C58 96 58 84 65 78 Z"
              fill="#3E1F10"
              stroke="#2A150A"
              strokeWidth="1"
            />

            {/* 尾巴 */}
            <ellipse cx="210" cy="82" rx="14" ry="10" fill="#9B5E3D" stroke="#754225" strokeWidth="1" />

            {/* 脸：白圈黑眼 + 小三角嘴 */}
            <circle cx="85" cy="68" r="10" fill="#FFF8E7" stroke="#E8DCC8" strokeWidth="1" />
            <circle cx="85" cy="68" r="5.5" fill="#1a1a1a" />
            <circle cx="120" cy="63" r="10" fill="#FFF8E7" stroke="#E8DCC8" strokeWidth="1" />
            <circle cx="120" cy="63" r="5.5" fill="#1a1a1a" />
            <path d="M98 80 l6 10 l6 -10 Z" fill="#1a1a1a" />

            {/* 木槌：从右侧斜向穿入开口，放在最上层 */}
            <g className="transition-transform duration-75 origin-[210px_90px] -rotate-0 group-active:rotate-[-5deg] group-active:translate-x-[-6px]">
              <rect x="125" y="86" width="105" height="10" rx="5" fill="#E8DCC8" stroke="#C19A6B" strokeWidth="1" transform="rotate(-6 177 91)" />
              <circle cx="118" cy="91" r="13" fill="#F5E6D3" stroke="#C19A6B" strokeWidth="1" />
              <circle cx="116" cy="89" r="4" fill="#E8DCC8" opacity="0.6" />
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
