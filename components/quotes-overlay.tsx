"use client";

import { useEffect, useState } from "react";
import { quotes, randomQuote, type Quote } from "@/lib/quotes";
import { type ZenLiquidApp } from "@/components/ui/zen-liquid";

export function QuotesOverlay({ app }: { app?: ZenLiquidApp | null }) {
  // SSR 与客户端必须输出一致，初始用固定句子，mounted 后再随机
  const [q, setQ] = useState<Quote>(() => quotes[0]);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setQ(randomQuote());
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setQ(randomQuote());
      setKey((k) => k + 1);
      // 不再自动泛起涟漪，避免无操作时水面自行扰动
    }, 12000);
    return () => clearInterval(id);
  }, [app]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[20%] z-20 flex justify-center px-6">
      <p
        key={key}
        className="zen-fade-in max-w-xl text-center text-[15px] leading-relaxed text-white/85"
        style={{ textShadow: "0 1px 14px rgba(0,0,0,0.45)" }}
      >
        {q.text}
        {q.author ? (
          <span className="ml-2 text-[13px] text-white/55">— {q.author}</span>
        ) : null}
      </p>
    </div>
  );
}
