"use client";

import { useEffect, useState, type ReactNode } from "react";
import { type ZenLiquidApp } from "@/components/ui/zen-liquid";
import { PanelShell } from "@/components/panel";
import { getZenAudio, SOUND_LABELS, type SoundId } from "@/lib/audio";
import { useStore } from "@/lib/store";

const IDS: SoundId[] = [
  "creek",
  "rain",
  "waves",
  "birds",
  "wind",
  "white",
  "pink",
  "bowl",
];

const ICONS: Record<SoundId, ReactNode> = {
  creek: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12c2-1 5-1 7 0s5 1 7 0 5-1 7 0M2 16c2-1 5-1 7 0s5 1 7 0 5-1 7 0" />
      <path d="M12 4c0 2-1 3-2 4s-1 3-1 5" />
    </svg>
  ),
  rain: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 13v7M8 13v7M12 15v7M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
    </svg>
  ),
  waves: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12c2-2 5-2 7 0s5 2 7 0 5-2 7 0M2 17c2-2 5-2 7 0s5 2 7 0 5-2 7 0M2 7c2-2 5-2 7 0s5 2 7 0 5-2 7 0" />
    </svg>
  ),
  birds: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-5 8-5 8 5 8 5" />
      <path d="M6 9c2-3 7-3 9 0" />
      <path d="M12 7v-3" />
    </svg>
  ),
  wind: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h8a3 3 0 0 0 0-6" />
      <path d="M3 12h12a4 4 0 0 0 0-8" />
      <path d="M3 16h10a3 3 0 0 1 0 6" />
    </svg>
  ),
  white: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h2M4 14h2M10 8h2M10 16h2M16 6h2M16 18h2" />
    </svg>
  ),
  pink: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14h2M4 10h2M10 12h2M10 16h2M16 8h2M16 14h2" />
    </svg>
  ),
  bowl: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z" />
      <path d="M12 3v4" />
    </svg>
  ),
};

const DEFAULT_VOLS: Record<SoundId, number> = {
  creek: 0.5,
  rain: 0.5,
  waves: 0.5,
  birds: 0.5,
  wind: 0.5,
  white: 0.5,
  pink: 0.5,
  bowl: 0.5,
};

const VOL_KEY = "zen-sound-volumes";

export function SoundModule({
  app,
  onClose,
}: {
  app: ZenLiquidApp | null;
  onClose: () => void;
}) {
  const audio = getZenAudio();
  const { settings, update } = useStore();
  const [playing, setPlaying] = useState<Record<SoundId, boolean>>(() => {
    const init = {} as Record<SoundId, boolean>;
    IDS.forEach((id) => (init[id] = false));
    return init;
  });
  const [vols, setVols] = useState<Record<SoundId, number>>(DEFAULT_VOLS);
  const [master, setMaster] = useState(settings.masterVolume);

  useEffect(() => {
    const current = {} as Record<SoundId, boolean>;
    IDS.forEach((id) => (current[id] = audio.isPlaying(id)));
    setPlaying(current);
    try {
      const raw = localStorage.getItem(VOL_KEY);
      if (raw) setVols((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      /* ignore */
    }
    setMaster(audio.getMasterVolume());
  }, [audio]);

  useEffect(() => {
    audio.setMasterVolume(master);
    if (Math.abs(master - settings.masterVolume) > 0.001) {
      update({ masterVolume: master });
    }
  }, [master, audio, update, settings.masterVolume]);

  useEffect(() => {
    try {
      localStorage.setItem(VOL_KEY, JSON.stringify(vols));
    } catch {
      /* ignore */
    }
  }, [vols]);

  const toggle = (id: SoundId) => {
    if (audio.isPlaying(id)) {
      audio.stop(id);
      // 用户手动关闭溪流：记住偏好，之后不再默认自动播放
      if (id === "creek") {
        try {
          localStorage.setItem("zen-creek-off", "1");
        } catch {
          /* ignore */
        }
      }
    } else {
      audio.play(id, vols[id]);
      // 用户重新打开溪流：清除关闭标记
      if (id === "creek") {
        try {
          localStorage.removeItem("zen-creek-off");
        } catch {
          /* ignore */
        }
      }
    }
    // UI 状态以引擎真实状态为准，调用后立刻同步，避免异步脱节导致按钮失灵
    setPlaying(() => {
      const next = {} as Record<SoundId, boolean>;
      IDS.forEach((sid) => (next[sid] = audio.isPlaying(sid)));
      return next;
    });
  };

  const setVol = (id: SoundId, v: number) => {
    setVols((prev) => ({ ...prev, [id]: v }));
    if (audio.isPlaying(id)) audio.setVolume(id, v);
  };

  return (
    <PanelShell title="环境音" onClose={onClose}>
      <div className="flex flex-col gap-5 py-2">
        <div className="grid grid-cols-4 gap-3">
          {IDS.map((id) => (
            <div key={id} className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => toggle(id)}
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
                  playing[id]
                    ? "border-[#1d9e75] bg-[#1d9e75] text-white shadow-[0_0_18px_rgba(29,158,117,0.45)]"
                    : "border-white/12 bg-white/10 text-white/75 hover:bg-white/15"
                }`}
                aria-pressed={playing[id]}
              >
                <span className="h-5 w-5">{ICONS[id]}</span>
              </button>
              <span className="text-[11px] text-white/80">
                {SOUND_LABELS[id]}
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={vols[id]}
                onChange={(e) => setVol(id, parseFloat(e.target.value))}
                className="w-full accent-[#1d9e75]"
              />
            </div>
          ))}
        </div>

        <div>
          <div className="mb-1 flex justify-between text-[12px] text-white/60">
            <span>主音量</span>
            <span>{Math.round(master * 100)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={master}
            onChange={(e) => setMaster(parseFloat(e.target.value))}
            className="w-full accent-[#1d9e75]"
          />
        </div>

        <label className="flex items-center justify-between text-[13px] text-white/80">
          <span>随声起涟漪</span>
          <input
            type="checkbox"
            checked={settings.rippleOnSound}
            onChange={(e) => update({ rippleOnSound: e.target.checked })}
            className="h-4 w-4 accent-[#1d9e75]"
          />
        </label>
        <div className="-mt-3 text-[11px] text-white/45">
          开启后，播放声音时水面会随机泛起轻柔涟漪
        </div>
      </div>
    </PanelShell>
  );
}
