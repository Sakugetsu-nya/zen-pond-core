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
