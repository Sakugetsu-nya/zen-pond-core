"use client";

import type { ModuleId } from "@/components/zen-shell";
import type { ReactNode } from "react";

const ICONS: Record<ModuleId, ReactNode> = {
  sound: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  ),
  release: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  breathe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  ),
  focus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
  words: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 5-2 5-5V5H3v11z" />
      <path d="M13 21c3 0 5-2 5-5V5h-5v11z" />
    </svg>
  ),
  fish: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 12c0-3 3-7 8-7s8 4 8 7-3 7-8 7" />
      <path d="M2 12h4" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .62-.22 1.18-.58 1.62" />
    </svg>
  ),
};

const LABELS: Record<ModuleId, string> = {
  sound: "声音",
  release: "抛石",
  breathe: "呼吸",
  focus: "专注",
  words: "禅语",
  fish: "木鱼",
  settings: "设置",
};

const ORDER: ModuleId[] = [
  "sound",
  "release",
  "breathe",
  "focus",
  "words",
  "fish",
  "settings",
];

export function TopBar({
  active,
  onSelect,
  hidden,
  onToggleHidden,
}: {
  active: ModuleId | null;
  onSelect: (id: ModuleId | null) => void;
  hidden: boolean;
  onToggleHidden: () => void;
}) {
  if (hidden) {
    return (
      <header className="pointer-events-auto fixed left-0 right-0 top-0 z-50 px-5 py-4">
        <div className="flex items-center justify-end">
          <button
            onClick={onToggleHidden}
            title="显示界面 (H)"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-black/45 text-white/75 shadow-lg backdrop-blur-md transition-colors hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </header>
    );
  }
  return (
    <>
      <header className="pointer-events-auto fixed left-0 right-0 top-0 z-50 px-5 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium tracking-[0.2em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
            一池静水
          </h1>
          <button
            onClick={onToggleHidden}
            title="隐藏界面 (H)"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-black/45 text-white/75 shadow-lg backdrop-blur-md transition-colors hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>
      </header>

      <nav className="pointer-events-auto fixed left-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-3">
        {ORDER.map((id) => {
          const selected = active === id;
          return (
            <button
              key={id}
              title={LABELS[id]}
              onClick={() => onSelect(selected ? null : id)}
              className={`flex h-auto w-14 flex-col items-center justify-center gap-1 rounded-2xl border border-white/12 bg-black/45 py-2.5 text-white shadow-lg backdrop-blur-md transition-transform hover:scale-105 ${
                selected
                  ? "bg-[#1d9e75] text-white border-[#1d9e75]"
                  : "text-white/75 hover:text-white"
              }`}
            >
              <span className="h-[22px] w-[22px]">{ICONS[id]}</span>
              <span className="text-[10px]">{LABELS[id]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
