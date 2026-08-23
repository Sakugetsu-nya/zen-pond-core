"use client";

import type { ZenLiquidApp } from "@/components/ui/zen-liquid";
import { PanelShell } from "@/components/panel";

export const PRESETS = [5, 15, 25];

export interface FocusState {
  mins: number;
  remaining: number;
  running: boolean;
}

export function FocusModule({
  state,
  setState,
  onClose,
}: {
  app?: ZenLiquidApp | null;
  state: FocusState;
  setState: (s: FocusState | ((prev: FocusState) => FocusState)) => void;
  onClose: () => void;
}) {
  const { mins, remaining, running } = state;

  const progress = 1 - remaining / (mins * 60);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const C = 2 * Math.PI * 44;

  return (
    <PanelShell title="专注禅意计时" onClose={onClose}>
      <div className="flex flex-col items-center gap-5 py-2">
        <div className="relative h-44 w-44">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#1d9e75"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-3xl font-light text-white tabular-nums">
            {mm}:{ss}
          </div>
        </div>
        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setState({ mins: p, remaining: p * 60, running: false });
              }}
              className={`rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                mins === p
                  ? "bg-[#1d9e75] text-white"
                  : "bg-white/10 text-white/70"
              }`}
            >
              {p} 分
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          {(running || remaining !== mins * 60) && (
            <button
              onClick={() => setState((prev) => ({ ...prev, remaining: prev.mins * 60, running: false }))}
              className="rounded-full bg-white/10 px-5 py-2.5 text-[14px] text-white/80 transition-colors hover:bg-white/15"
            >
              停止
            </button>
          )}
          <button
            onClick={() => setState((prev) => ({ ...prev, running: !prev.running }))}
            className="rounded-full bg-[#1d9e75] px-8 py-2.5 text-[14px] text-white"
          >
            {running ? "暂停" : remaining === mins * 60 ? "开始" : "继续"}
          </button>
        </div>
      </div>
    </PanelShell>
  );
}

export function FocusFloatingPill({
  state,
  onClick,
  hidden,
  active,
}: {
  state: FocusState;
  onClick: () => void;
  hidden: boolean;
  active: boolean;
}) {
  if (hidden || active || !state.running) return null;
  const mm = String(Math.floor(state.remaining / 60)).padStart(2, "0");
  const ss = String(state.remaining % 60).padStart(2, "0");
  const progress = 1 - state.remaining / (state.mins * 60);
  const C = 2 * Math.PI * 18;

  return (
    <button
      onClick={onClick}
      title="返回专注"
      className="pointer-events-auto fixed left-1/2 top-20 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full border border-white/12 bg-black/45 px-3 py-2 text-white shadow-lg backdrop-blur-md transition-transform hover:scale-105 sm:left-4 sm:top-24 sm:translate-x-0"
    >
      <div className="relative h-9 w-9">
        <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="3"
          />
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="#1d9e75"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
          />
        </svg>
      </div>
      <span className="text-[14px] font-light tabular-nums">
        {mm}:{ss}
      </span>
    </button>
  );
}
