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
          className="rounded-full bg-white/10 px-5 py-2 text-[13px] text-white/80"
        >
          上一篇
        </button>
        <button
          onClick={rand}
          className="rounded-full bg-white/10 px-5 py-2 text-[13px] text-white/80"
        >
          随机
        </button>
        <button
          onClick={() => go(1)}
          className="rounded-full bg-white/10 px-5 py-2 text-[13px] text-white/80"
        >
          下一篇
        </button>
      </div>
    </PanelShell>
  );
}
