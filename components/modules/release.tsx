"use client";

import { useState } from "react";
import { type ZenLiquidApp } from "@/components/ui/zen-liquid";
import { PanelShell } from "@/components/panel";

export function ReleaseModule({
  app,
  onClose,
  onRelease,
}: {
  app: ZenLiquidApp | null;
  onClose: () => void;
  onRelease: (text: string) => void;
}) {
  const [text, setText] = useState("");

  const cast = () => {
    if (!text.trim()) return;
    const t = text.trim();
    setText("");
    onRelease(t); // 触发全局渐隐 + 涟漪
    onClose(); // 立即关闭弹窗
  };

  return (
    <PanelShell title="抛石问心" onClose={onClose}>
      <div className="flex flex-col gap-4 py-2">
        <p className="text-[13px] leading-relaxed text-white/65">
          写下此刻最想放下的，抛入水中，看它随涟漪化开。
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="此刻最想放下的……"
          className="w-full resize-none rounded-2xl bg-white/10 p-3 text-[14px] text-white outline-none placeholder:text-white/35"
        />
        <button
          onClick={cast}
          className="rounded-full bg-[#1d9e75] py-2.5 text-[14px] text-white"
        >
          抛入水中
        </button>
        <p className="text-center text-[12px] text-white/50">
          水会留住涟漪，但不会留住石头。
        </p>
      </div>
    </PanelShell>
  );
}
