"use client";

import { useEffect } from "react";

/**
 * 键盘适配守卫（镜像小红书版 v12 方案）
 * - Android Chrome：viewport.interactiveWidget="overlays-content" 已让键盘覆盖在页面上方；
 * - iOS Safari：visualViewport 触发时给 <html> 加 transform: translate(0,0) 使其成为 fixed
 *   包含块并锁定满屏高度，避免页面被键盘顶起。
 */
export function KeyboardGuard() {
  useEffect(() => {
    const de = document.documentElement;
    const vv = window.visualViewport;
    if (!de || !vv) return;

    const KEYBOARD_THRESHOLD = 80;

    const fix = () => {
      const h = vv.height;
      const keyboardOpen = h < window.innerHeight - KEYBOARD_THRESHOLD;
      if (keyboardOpen) {
        // 仅移动端键盘弹出时锁死 <html> 高度并加 transform，
        // 避免页面被键盘顶起。桌面端（键盘不会弹出）保持原样，不干扰固定 UI 的渲染。
        de.style.transform = "translate(0,0)";
        de.style.height = `${h}px`;
      } else {
        de.style.transform = "";
        de.style.height = "";
      }
    };

    vv.addEventListener("resize", fix);
    vv.addEventListener("scroll", fix);
    fix();

    return () => {
      vv.removeEventListener("resize", fix);
      vv.removeEventListener("scroll", fix);
      de.style.transform = "";
      de.style.height = "";
    };
  }, []);

  return null;
}
