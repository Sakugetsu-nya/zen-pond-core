"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface Settings {
  bgImage: string;
  masterVolume: number;
  audioReactive: boolean;
  rippleStrength: number; // 1(最弱) ~ 5(最强)
  rippleOnSound: boolean; // 随声起涟漪：声音播放时水面随机泛起涟漪
}

const DEFAULTS: Settings = {
  bgImage: "/images/bg-lotus.webp",
  masterVolume: 0.5,
  audioReactive: true,
  rippleStrength: 3, // 默认 3 档（适中）
  rippleOnSound: true, // 默认开启随声起涟漪
};

interface StoreValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  streak: number;
  lastVisit: string;
  bumpStreak: () => void;
}

const StoreCtx = createContext<StoreValue | null>(null);
const SETTINGS_KEY = "zen-settings-v1";
const STREAK_KEY = "zen-streak-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [streak, setStreak] = useState(0);
  const [lastVisit, setLastVisit] = useState("");

  useEffect(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) {
        const parsed = JSON.parse(s) as Partial<Settings>;
        // 迁移：旧版缓存的 jpg 背景路径自动指向新版 webp
        if (parsed.bgImage && parsed.bgImage.endsWith(".jpg")) {
          parsed.bgImage = parsed.bgImage.replace(/\.jpg$/, ".webp");
        }
        setSettings({ ...DEFAULTS, ...parsed });
      }
      const st = localStorage.getItem(STREAK_KEY);
      if (st) {
        const o = JSON.parse(st);
        setStreak(o.streak || 0);
        setLastVisit(o.lastVisit || "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const bumpStreak = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    setLastVisit((prevLast) => {
      if (prevLast === today) return prevLast;
      const yesterday = new Date(Date.now() - 86_400_000)
        .toISOString()
        .slice(0, 10);
      setStreak((prevStreak) => {
        const next = prevLast === yesterday ? prevStreak + 1 : 1;
        try {
          localStorage.setItem(
            STREAK_KEY,
            JSON.stringify({ streak: next, lastVisit: today })
          );
        } catch {
          /* ignore */
        }
        return next;
      });
      return today;
    });
  }, []);

  const value = useMemo(
    () => ({ settings, update, streak, lastVisit, bumpStreak }),
    [settings, update, streak, lastVisit, bumpStreak]
  );

  return (
    <StoreCtx.Provider value={value}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const v = useContext(StoreCtx);
  if (!v) throw new Error("useStore must be used within StoreProvider");
  return v;
}
