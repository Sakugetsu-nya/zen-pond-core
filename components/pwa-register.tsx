"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    // 拼接 basePath，保证 GitHub Pages 项目页下 /sw.js 路径正确。
    // BASE_PATH 由 next.config.ts 的 env 注入，Turbopack 会内联为字面量。
    const raw = (process.env.BASE_PATH as string | undefined) || "";
    const base = raw.startsWith("/") ? raw : raw ? `/${raw}` : "";
    const swUrl = `${base}/sw.js`.replace(/\/{2,}/g, "/");
    const onLoad = () => {
      navigator.serviceWorker.register(swUrl).catch(() => {});
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
