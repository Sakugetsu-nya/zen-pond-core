"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ZenLiquid,
  addDropToApp,
  dropAtClient,
  dropCenter,
  type ZenLiquidApp,
} from "@/components/ui/zen-liquid";
import { PRESETS as FOCUS_PRESETS } from "@/components/modules/focus";
import { getZenAudio, playSplash } from "@/lib/audio";
import { useStore } from "@/lib/store";
import { TopBar } from "@/components/top-bar";
import { QuotesOverlay } from "@/components/quotes-overlay";
import { BreathingModule } from "@/components/modules/breathing";
import { SoundModule } from "@/components/modules/sound";
import { ReleaseModule } from "@/components/modules/release";
import {
  FocusModule,
  FocusFloatingPill,
  type FocusState,
} from "@/components/modules/focus";
import { WordsModule } from "@/components/modules/words";
import { FishModule } from "@/components/modules/fish";
import { SettingsModule } from "@/components/modules/settings";

export type ModuleId =
  | "breathe"
  | "sound"
  | "release"
  | "focus"
  | "words"
  | "fish"
  | "settings";

const DEFAULT_FOCUS: FocusState = { mins: 15, remaining: 15 * 60, running: false };

// 涟漪强度档位（1 最弱 ~ 5 最强）。当前值由设置面板控制，这里只做档位→系数映射。
// 用户反馈原「2 档」（系数 0.475）手感适中，故把 0.475 定为 3 档（适中），
// 其余档位在两侧依次排开：1→0.22, 2→0.35, 3→0.475, 4→0.66, 5→1.0（最强）。
const RIPPLE_LEVELS = [0.22, 0.35, 0.475, 0.66, 1.0];
function rippleFactor(level: number): number {
  const l = Math.max(1, Math.min(5, Math.round(level)));
  return RIPPLE_LEVELS[l - 1];
}

export function ZenShell() {
  const { settings, bumpStreak } = useStore();
  const [app, setApp] = useState<ZenLiquidApp | null>(null);
  const appRef = useRef<ZenLiquidApp | null>(null);
  const [active, setActive] = useState<ModuleId | null>(null);
  const [uiHidden, setUiHidden] = useState(false);
  const [focus, setFocus] = useState<FocusState>(DEFAULT_FOCUS);
  const [releasing, setReleasing] = useState<string | null>(null);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const releaseInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleReady = useCallback((a: ZenLiquidApp) => {
    appRef.current = a;
    setApp(a);
  }, []);

  const select = useCallback(
    (id: ModuleId | null) => {
      setActive(id);
      bumpStreak();
    },
    [bumpStreak]
  );

  const toggleUiHidden = useCallback(() => setUiHidden((h) => !h), []);

  // 默认开启溪流：仅当用户「从未手动关闭过溪流」时才自动播放。
  // 用户一旦在声音面板关掉溪流，写入 zen-creek-off 标记，之后不再强制重启，
  // 这样既满足「默认开溪流」，又不会在「关闭所有声音」后仍被偷偷重启。
  useEffect(() => {
    const audio = getZenAudio();
    let userClosedCreek = false;
    try {
      userClosedCreek = localStorage.getItem("zen-creek-off") === "1";
    } catch {
      /* ignore */
    }
    const startCreek = () => {
      if (userClosedCreek) return;
      if (audio.isPlaying("creek")) return;
      audio.play("creek", 0.7).catch(() => {});
    };
    // 浏览器自动播放策略：先尝试，若被挂起则等首次交互再启动
    startCreek();
    const onFirstGesture = () => {
      audio.resume();
      startCreek();
    };
    window.addEventListener("pointerdown", onFirstGesture, { once: true });

    // 诊断模式（?diag=1）：把溪流实时电平打到控制台，帮助用户确认「蜂鸣」是否来自 creek.mp3 文件本身
    const diag = new URLSearchParams(window.location.search).get("diag");
    let diagTimer: ReturnType<typeof setInterval> | null = null;
    let diagBanner: HTMLElement | null = null;
    if (diag === "1") {
      console.log(
        "[zen-diag] 诊断模式开启：每 500ms 打印一次溪流实时电平（0~1）。若蜂鸣持续且电平稳定 > 0，说明蜂鸣来自 creek.mp3 文件本身，需替换该音频文件。"
      );
      diagTimer = setInterval(() => {
        const lvl = audio.getLevel();
        console.log(`[zen-diag] creek level = ${lvl.toFixed(4)}`);
      }, 500);
      diagBanner = document.createElement("div");
      diagBanner.textContent =
        "诊断模式：溪流电平已打印到控制台（F12）。若蜂鸣持续且 level>0，说明 creek.mp3 文件本身含蜂鸣，请替换 public/audio/creek.mp3。";
      diagBanner.style.cssText =
        "position:fixed;left:12px;bottom:12px;z-index:9999;max-width:320px;padding:10px 12px;border-radius:10px;background:rgba(0,0,0,.7);color:#fff;font:12px/1.5 system-ui;pointer-events:none;";
      document.body.appendChild(diagBanner);
    }

    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      if (diagTimer) clearInterval(diagTimer);
      if (diagBanner && diagBanner.parentNode)
        diagBanner.parentNode.removeChild(diagBanner);
    };
  }, []);

  // 隐藏 UI 快捷键：H
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "h" || e.key === "H") {
        setUiHidden((h) => !h);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 专注计时器：提升到全局，切换模块或隐藏 UI 时仍继续运行
  useEffect(() => {
    if (!focus.running) return;
    const iv = setInterval(() => {
      setFocus((prev) => {
        const r = prev.remaining;
        if (r <= 1) {
          for (let i = 0; i < 6; i++) {
            setTimeout(
              () => dropCenter(appRef.current, 0.05 + Math.random() * 0.12, 0.9),
              i * 100
            );
          }
          return { ...prev, remaining: 0, running: false };
        }
        if (r % 20 === 0) dropCenter(appRef.current, 0.04, 0.3);
        return { ...prev, remaining: r - 1 };
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [focus.running]);

  // 抛石后：文字渐隐 + 水面持续涟漪（独立于模块是否卸载）
  const triggerRelease = useCallback(
    (text: string) => {
      setReleasing(text);
      playSplash();
      const f = rippleFactor(settings.rippleStrength);
      dropCenter(appRef.current, 0.14 * f, 0.7 * f);
      let i = 0;
      releaseInterval.current = setInterval(() => {
        i++;
        const angle = Math.random() * Math.PI * 2;
        const dist = 0.04 + Math.random() * 0.14;
        const x = 0.5 + Math.cos(angle) * dist;
        const y = 0.5 + Math.sin(angle) * dist;
        addDropToApp(
          appRef.current,
          x * 2 - 1,
          -(y * 2 - 1),
          (0.03 + Math.random() * 0.04) * f,
          Math.max(0.09, 0.33 - i * 0.022) * f
        );
        if (i >= 14 && releaseInterval.current) {
          clearInterval(releaseInterval.current);
        }
      }, 150);
      releaseTimer.current = setTimeout(() => {
        setReleasing(null);
        if (releaseInterval.current) clearInterval(releaseInterval.current);
      }, 2400);
    },
    [settings.rippleStrength]
  );

  // 全局「随声起涟漪」：任何声音播放时，水面随机泛起涟漪（可在设置中开关）
  useEffect(() => {
    const audio = getZenAudio();
    let raf: number | null = null;
    let last = 0;
    const loop = (t: number) => {
      if (settings.rippleOnSound) {
        if (t - last > 110) {
          last = t;
          const lvl = audio.getLevel();
          // 合成音色（如溪流）整体音量偏低，阈值要足够小才能触发
          if (lvl > 0.008) {
            const x = (Math.random() * 2 - 1) * 0.85;
            const y = (Math.random() * 2 - 1) * 0.85;
            const f = rippleFactor(settings.rippleStrength);
            // 更轻柔：半径更细、强度更低，涟漪更克制
            addDropToApp(
              appRef.current,
              x,
              y,
              (0.015 + lvl * 0.02) * f,
              (0.035 + lvl * 0.07) * f
            );
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [settings.rippleOnSound, settings.rippleStrength]);

  // 卸载时清理抛石计时器
  useEffect(() => {
    return () => {
      if (releaseTimer.current) clearTimeout(releaseTimer.current);
      if (releaseInterval.current) clearInterval(releaseInterval.current);
    };
  }, []);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        t.closest(
          "button, input, select, textarea, a, .glass, [role='button']"
        )
      )
        return;
      const f = rippleFactor(settings.rippleStrength);
      dropAtClient(appRef.current, e.clientX, e.clientY, 0.05 * f, 0.45 * f);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [settings.rippleStrength]);

  // 鼠标划过水面即漾起涟漪
  useEffect(() => {
    let last = 0;
    const onMove = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        t.closest(
          "button, input, select, textarea, a, .glass, [role='button']"
        )
      )
        return;
      const now = performance.now();
      if (now - last < 60) return;
      last = now;
      const f = rippleFactor(settings.rippleStrength);
      dropAtClient(appRef.current, e.clientX, e.clientY, 0.015 * f, 0.08 * f);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [settings.rippleStrength]);

  return (
    <main className="pointer-events-none relative h-[100dvh] w-full overflow-hidden">
      <ZenLiquid
        onReady={handleReady}
        backgroundColor="#0b1f2a"
        textColor="#eaf6f6"
        image={settings.bgImage}
        metalness={0.32}
        roughness={0.5}
        displacementScale={2}
        rain={false}
      />

      <QuotesOverlay app={app} shifted={active !== null} />

      {!uiHidden && (
        <>
          {active === "breathe" && (
            <BreathingModule app={app} onClose={() => setActive(null)} />
          )}
          {active === "sound" && (
            <SoundModule app={app} onClose={() => setActive(null)} />
          )}
          {active === "release" && (
            <ReleaseModule
              app={app}
              onClose={() => setActive(null)}
              onRelease={triggerRelease}
            />
          )}
          {active === "focus" && (
            <FocusModule
              app={app}
              state={focus}
              setState={setFocus}
              onClose={() => setActive(null)}
            />
          )}
          {active === "words" && (
            <WordsModule onClose={() => setActive(null)} />
          )}
          {active === "fish" && (
            <FishModule app={app} onClose={() => setActive(null)} />
          )}
          {active === "settings" && (
            <SettingsModule onClose={() => setActive(null)} />
          )}
        </>
      )}

      {releasing && !uiHidden ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <span
            className="text-center text-[16px] text-white/80"
            style={{ animation: "zen-fade-in-out 2.4s ease both" }}
          >
            {releasing}
          </span>
        </div>
      ) : null}

      <FocusFloatingPill
        state={focus}
        hidden={uiHidden}
        active={active === "focus"}
        onClick={() => {
          setActive("focus");
          bumpStreak();
        }}
      />

      <TopBar
        active={active}
        onSelect={select}
        hidden={uiHidden}
        onToggleHidden={toggleUiHidden}
      />
    </main>
  );
}
