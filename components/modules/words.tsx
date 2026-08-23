"use client";

import { useState } from "react";
import { quotes, type Quote } from "@/lib/quotes";
import { PanelShell } from "@/components/panel";

export function WordsModule({ onClose }: { onClose: () => void }) {
  const [idx, setIdx] = useState(() =>
    Math.floor(Math.random() * quotes.length)
  );
  const q: Quote = quotes[idx];
  const go = (d: number) =>
    setIdx((i) => (i + d + quotes.length) % quotes.length);
  const rand = () => setIdx(Math.floor(Math.random() * quotes.length));

  return (
    <PanelShell title="正念禅语" onClose={onClose}>
      <div className="flex min-h-[180px] flex-col items-center justify-center gap-4 py-4 text-center">
        <p className="text-[18px] leading-relaxed text-white/90">{q.text}</p>
        {q.author ? (
          <span className="text-[13px] text-white/55">— {q.author}</span>
        ) : null}
      </div>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => go(-1)}
          title="上一篇"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={rand}
          title="随机"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
        </button>
        <button
          onClick={() => go(1)}
          title="下一篇"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </PanelShell>
  );
}
