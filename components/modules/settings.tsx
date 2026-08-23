"use client";

import { useStore } from "@/lib/store";
import { PanelShell } from "@/components/panel";

// 运行时推断 basePath，兼容 GitHub Pages 项目页（/repo/）与根路径部署。
function getAssetBase(): string {
  if (typeof window === "undefined") return "";
  const seg = window.location.pathname.split("/").filter(Boolean);
  return seg.length > 0 ? `/${seg[0]}` : "";
}
const resolveAsset = (p: string) =>
  `${getAssetBase()}${p}`.replace(/\/{2,}/g, "/");

const BG_IMAGES = [
  { name: "荷叶", src: "/images/bg-lotus.jpg" },
  { name: "碧潭", src: "/images/bg-turquoise.jpg" },
  { name: "清波", src: "/images/bg-pool.jpg" },
  { name: "落花", src: "/images/bg-flowers.jpg" },
];

export function SettingsModule({ onClose }: { onClose: () => void }) {
  const { settings, update, streak } = useStore();

  return (
    <PanelShell title="设置" onClose={onClose}>
      <div className="flex flex-col gap-5 py-2">
        <div>
          <div className="mb-2 text-[12px] text-white/60">水面背景</div>
          <div className="flex gap-2">
            {BG_IMAGES.map((b) => (
              <button
                key={b.src}
                onClick={() => update({ bgImage: b.src })}
                className="relative h-12 flex-1 overflow-hidden rounded-xl"
                style={{
                  border:
                    settings.bgImage === b.src
                      ? "2px solid #1d9e75"
                      : "2px solid transparent",
                }}
                title={b.name}
              >
                <img
                  src={resolveAsset(b.src)}
                  alt={b.name}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[12px] text-white/60">涟漪强度</div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((lv) => (
              <button
                key={lv}
                onClick={() => update({ rippleStrength: lv })}
                title={`档位 ${lv}`}
                className={`flex h-10 flex-1 items-center justify-center rounded-xl border text-[14px] transition-colors ${
                  settings.rippleStrength === lv
                    ? "border-[#1d9e75] bg-[#1d9e75]/20 text-white"
                    : "border-white/10 bg-white/5 text-white/55 hover:text-white/80"
                }`}
              >
                {lv}
              </button>
            ))}
          </div>
          <div className="mt-1.5 text-[11px] text-white/45">
            {["最弱", "较弱", "适中", "较强", "最强"][settings.rippleStrength - 1] ?? "适中"}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-[13px] text-white/80">随声起涟漪</div>
          <button
            onClick={() => update({ rippleOnSound: !settings.rippleOnSound })}
            role="switch"
            aria-checked={settings.rippleOnSound}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              settings.rippleOnSound ? "bg-[#1d9e75]" : "bg-white/15"
            }`}
            title="声音播放时水面随机泛起涟漪"
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                settings.rippleOnSound ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        <div className="-mt-3 text-[11px] text-white/45">
          开启后，播放声音时水面会随机泛起轻柔涟漪
        </div>

        <div className="rounded-2xl bg-white/8 px-4 py-3 text-center text-[13px] text-white/70">
          已连续静心 {streak} 天
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            location.reload();
          }}
          className="text-[12px] text-white/40 transition-colors hover:text-white/70"
        >
          清除本地数据
        </button>
      </div>
    </PanelShell>
  );
}
