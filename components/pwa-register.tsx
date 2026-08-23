"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    // 运行时推断 basePath：GitHub Pages 项目页部署在 /repo/ 子路径下，
    // process.env.BASE_PATH 在客户端 bundle 中不一定被内联，用 location.pathname 更可靠。
    const seg = window.location.pathname.split("/").filter(Boolean);
    const base = seg.length > 0 ? `/${seg[0]}` : "";
    const swUrl = `${base}/sw.js`.replace(/\/{2,}/g, "/");
    const onLoad = () => {
      navigator.serviceWorker.register(swUrl).catch(() => {});
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
