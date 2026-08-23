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
          <svg viewBox="0 0 200 170" className="h-14 w-14">
            <defs>
              <radialGradient id="woodTop" cx="42%" cy="28%" r="78%">
                <stop offset="0%" stopColor="#C5855A" />
                <stop offset="60%" stopColor="#A06540" />
                <stop offset="100%" stopColor="#7A452A" />
              </radialGradient>
              <linearGradient id="woodBottom" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#C99A70" />
                <stop offset="100%" stopColor="#A06A45" />
              </linearGradient>
              <filter id="woodShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2E1B0A" floodOpacity="0.32" />
              </filter>
            </defs>

            {/* 小尾巴 */}
            <circle cx="165" cy="55" r="9" fill="#A06540" stroke="#7A452A" strokeWidth="1" />

            {/* 下半球 */}
            <path
              d="M35 86 C35 86 45 140 100 140 C155 140 165 86 165 86 C165 86 140 98 100 98 C60 98 35 86 35 86 Z"
              fill="url(#woodBottom)"
              stroke="#5A321D"
              strokeWidth="1"
            />

            {/* 上半球 */}
            <path
              d="M35 86 C35 46 65 18 100 18 C135 18 165 46 165 86 C165 90 135 94 100 94 C65 94 35 90 35 86 Z"
              fill="url(#woodTop)"
              stroke="#5A321D"
              strokeWidth="1.5"
              filter="url(#woodShadow)"
            />

            {/* 横向打击开口 */}
            <path
              className="transition-colors duration-75 group-active:fill-[#5D3020]"
              d="M40 84 C40 84 65 90 100 90 C135 90 160 84 160 84 C160 84 135 98 100 98 C65 98 40 98 40 84 Z"
              fill="#3E1F10"
              stroke="#2A150A"
              strokeWidth="1"
            />

            {/* 木纹 */}
            <g stroke="#8B5E3D" strokeWidth="1" fill="none" opacity="0.25" strokeLinecap="round">
              <path d="M70 35 Q85 40 95 38" />
              <path d="M60 48 Q80 55 100 52" />
              <path d="M120 42 Q140 48 150 45" />
              <path d="M55 95 Q75 105 100 102" />
              <path d="M110 108 Q140 112 155 105" />
            </g>

            {/* 脸：白圈黑眼 + 小鼻孔 + 三角嘴 */}
            <circle cx="58" cy="55" r="10" fill="#FFF8E7" stroke="#E8DCC8" strokeWidth="1" />
            <circle cx="58" cy="55" r="5.5" fill="#1a1a1a" />
            <circle cx="108" cy="55" r="10" fill="#FFF8E7" stroke="#E8DCC8" strokeWidth="1" />
            <circle cx="108" cy="55" r="5.5" fill="#1a1a1a" />
            <circle cx="76" cy="68" r="1.5" fill="#5A321D" opacity="0.6" />
            <circle cx="91" cy="68" r="1.5" fill="#5A321D" opacity="0.6" />
            <path d="M80 75 l7 10 l7 -10 Z" fill="#1a1a1a" />
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
