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
  const circleRef = useRef<HTMLDivElement | null>(null);
  // 累计已运行的秒数；暂停时冻结，恢复时续接，避免时间轴重置导致倒计时跳变。
  const elapsedRef = useRef(0);
  const lastTickRef = useRef(0);

  const pattern = PATTERNS.find((p) => p.id === pid)!;

  // 圈的大小由 requestAnimationFrame 逐帧直接写 DOM，绕开 React 重渲染与
  // transition 的离散步进 —— 这是平滑的关键（原 200ms 定时 + transition 会卡顿）。
  // 倒计时只在本帧的「阶段」或「剩余秒数」相对上一帧变化时才 setState，
  // 否则每帧 setState 会频繁触发重渲染并造成数字抖动。
  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;

    const total = pattern.phases.reduce((s, p) => s + p.sec, 0);

    function phaseAt(e: number) {
      let acc = 0;
      for (let i = 0; i < pattern.phases.length; i++) {
        if (e < acc + pattern.phases[i].sec) return { idx: i, within: e - acc };
        acc += pattern.phases[i].sec;
      }
      return { idx: pattern.phases.length - 1, within: 0 };
    }
    function scaleAt(e: number) {
      const { idx, within } = phaseAt(e);
      const ph = pattern.phases[idx];
      const t = Math.min(1, Math.max(0, within / ph.sec));
      if (ph.name === "吸气") return 1.0 + 0.35 * t; // 1.0 -> 1.35 连续放大
      if (ph.name === "呼气") return 1.35 - 0.5 * t; // 1.35 -> 0.85 连续缩小
      return 1.35; // 屏息保持最大
    }

    let raf = 0;
    let lastPhase = -1;
    let lastCount = -1;
    let lastRipplePhase = -1;

    function frame(now: number) {
      if (!lastTickRef.current) lastTickRef.current = now;
      // running 为 false 时不推进时间轴（冻结），但圈保持当前 scale。
      if (running) {
        const dt = (now - lastTickRef.current) / 1000;
        elapsedRef.current += dt;
      }
      lastTickRef.current = now;

      const e = elapsedRef.current % total;
      const { idx, within } = phaseAt(e);
      const remaining = Math.max(1, Math.ceil(pattern.phases[idx].sec - within));

      // 阶段切换瞬间投下涟漪（每进入一次阶段只投一次）
      if (idx !== lastRipplePhase) {
        const ph = pattern.phases[idx];
        if (ph.name === "吸气") dropCenter(app, 0.05, 0.5);
        else if (ph.name === "呼气") dropCenter(app, 0.14, 0.5);
        lastRipplePhase = idx;
      }

      // 只在变化时才 setState，避免每帧重渲染
      if (idx !== lastPhase) {
        setPhaseIdx(idx);
        lastPhase = idx;
      }
      if (remaining !== lastCount) {
        setCount(remaining);
        lastCount = remaining;
      }

      const scale = scaleAt(e);
      circle!.style.transform = `scale(${scale})`;

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [running, pattern, app]);

  // 开始/暂停切换、或切换模式时，重置计时基准、累计时间与上一帧状态。
  useEffect(() => {
    lastTickRef.current = 0;
    elapsedRef.current = 0;
  }, [running, pid]);

  // 停止时把圈复位到 1.0；切换模式时归零计时。
  useEffect(() => {
    if (!running) {
      if (circleRef.current) circleRef.current.style.transform = "scale(1)";
    }
  }, [running]);

  const phaseName = pattern.phases[phaseIdx]?.name ?? "";
  const centerText = running ? phaseName : "准备";

  return (
    <PanelShell title="冥想呼吸" onClose={onClose}>
      <div className="flex flex-col items-center gap-5 py-2">
        <div
          ref={circleRef}
          className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-[#1d9e75] bg-transparent shadow-[0_0_24px_rgba(29,158,117,0.4),inset_0_0_24px_rgba(29,158,117,0.1)] will-change-transform"
          style={{ transform: "scale(1)" }}
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
