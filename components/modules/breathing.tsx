"use client";

import { useEffect, useRef, useState } from "react";
import { dropCenter, type ZenLiquidApp } from "@/components/ui/zen-liquid";
import { PanelShell } from "@/components/panel";

type Phase = { name: string; sec: number };
type Pattern = { id: string; label: string; phases: Phase[] };

const PATTERNS: Pattern[] = [
  {
    id: "478",
    label: "4-7-8 放松",
    phases: [
      { name: "吸气", sec: 4 },
      { name: "屏息", sec: 7 },
      { name: "呼气", sec: 8 },
    ],
  },
  {
    id: "box",
    label: "盒式呼吸",
    phases: [
      { name: "吸气", sec: 4 },
      { name: "屏息", sec: 4 },
      { name: "呼气", sec: 4 },
      { name: "屏息", sec: 4 },
    ],
  },
];

export function BreathingModule({
  app,
  onClose,
}: {
  app: ZenLiquidApp | null;
  onClose: () => void;
}) {
  const [pid, setPid] = useState(PATTERNS[0].id);
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [count, setCount] = useState(0);
  const elapsed = useRef(0);

  const pattern = PATTERNS.find((p) => p.id === pid)!;

  useEffect(() => {
    if (!running) return;
    elapsed.current = 0;
    setPhaseIdx(0);
    setCount(pattern.phases[0].sec);
    const iv = setInterval(() => {
      elapsed.current += 0.2;
      let e = elapsed.current;
      const total = pattern.phases.reduce((s, p) => s + p.sec, 0);
      if (e >= total) e = elapsed.current = 0;
      let acc = 0;
      let idx = 0;
      for (let i = 0; i < pattern.phases.length; i++) {
        if (e < acc + pattern.phases[i].sec) {
          idx = i;
          break;
        }
        acc += pattern.phases[i].sec;
      }
      const ph = pattern.phases[idx];
      const within = e - acc;
      setPhaseIdx(idx);
      setCount(Math.max(1, Math.ceil(ph.sec - within)));
      if (within < 0.25) {
        if (ph.name === "吸气") dropCenter(app, 0.05, 0.5);
        else if (ph.name === "呼气") dropCenter(app, 0.14, 0.5);
      }
    }, 200);
    return () => clearInterval(iv);
  }, [running, pattern, app]);

  const phaseName = pattern.phases[phaseIdx]?.name ?? "";
  const scale = phaseName === "吸气" ? 1.35 : phaseName === "呼气" ? 0.85 : 1.1;
  const centerText = running ? phaseName : "准备";

  return (
    <PanelShell title="冥想呼吸" onClose={onClose}>
      <div className="flex flex-col items-center gap-5 py-2">
        <div
          className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-[#1d9e75] bg-transparent shadow-[0_0_24px_rgba(29,158,117,0.4),inset_0_0_24px_rgba(29,158,117,0.1)] transition-transform duration-1000 ease-in-out"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="flex flex-col items-center text-white">
            <span className="text-[18px] font-light tracking-widest">
              {centerText}
            </span>
            {running ? (
              <span className="mt-1 text-[14px] font-light tabular-nums text-white/75">
                {count}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex w-full rounded-xl bg-white/10 p-1">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                if (running) setRunning(false);
                setPid(p.id);
              }}
              className={`flex-1 rounded-lg py-2.5 text-[13px] transition-colors ${
                pid === p.id
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:text-white/90"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setRunning((r) => !r)}
          className="w-full rounded-xl bg-[#1d9e75] py-3 text-[15px] text-white shadow-lg transition-transform active:scale-95"
        >
          {running ? "暂停" : "开始"}
        </button>
      </div>
    </PanelShell>
  );
}
