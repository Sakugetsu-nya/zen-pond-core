"use client";

import { useEffect, useRef } from "react";

export interface ZenLiquidApp {
  loadImage: (src?: string | null) => Promise<void> | void;
  setImage: (tex: unknown) => void;
  setRain: (b: boolean) => void;
  setRainTime?: (n: number) => void;
  dispose?: () => void;
  liquidPlane?: {
    addDrop?: (x: number, y: number, radius: number, strength: number) => void;
    material?: { metalness: number; roughness: number };
    uniforms?: { displacementScale?: { value: number } };
  };
}

/** Send a ripple into the liquid. The actual `addDrop` lives on `app.liquidPlane`. */
export function addDropToApp(
  app: ZenLiquidApp | null,
  x: number,
  y: number,
  radius = 0.08,
  strength = 0.6
) {
  if (!app) return;
  const plane = app.liquidPlane;
  const drop = plane?.addDrop;
  if (!drop) {
    console.warn("[zen-liquid] no addDrop available");
    return;
  }
  try {
    // 保持 this 绑定；私有字段方法不能脱离实例调用。
    drop.call(plane, x, y, radius, strength);
  } catch (e) {
    console.warn("[zen-liquid] addDrop failed", e);
  }
}

interface ZenLiquidProps {
  backgroundColor?: string;
  textColor?: string;
  image?: string | null;
  metalness?: number;
  roughness?: number;
  displacementScale?: number;
  rain?: boolean;
  className?: string;
  onReady?: (app: ZenLiquidApp) => void;
}

function shade(hex: string, amount: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(parseInt(m[1], 16) + amount);
  const g = clamp(parseInt(m[2], 16) + amount);
  const b = clamp(parseInt(m[3], 16) + amount);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Build a small themed gradient to sit beneath the liquid surface. */
function gradientDataUrl(color: string): string {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const g = ctx.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0, shade(color, 14));
  g.addColorStop(1, shade(color, -22));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return c.toDataURL();
}

// 由 next.config.ts 的 env 注入，Turbopack 在静态导出时会将其内联为字符串字面量。
function getBasePath(): string {
  const raw =
    (typeof process !== "undefined" && process.env.BASE_PATH) || "";
  if (!raw) return "";
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function resolveAsset(path: string) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  if (path.startsWith("/")) {
    return `${getBasePath()}${path}`.replace(/\/{2,}/g, "/");
  }
  return path;
}

function applyConfig(
  app: ZenLiquidApp,
  cfg: {
    metalness: number;
    roughness: number;
    displacementScale: number;
    rain: boolean;
    image: string | null;
    backgroundColor: string;
  }
) {
  try {
    if (app.liquidPlane?.material) {
      app.liquidPlane.material.metalness = cfg.metalness;
      app.liquidPlane.material.roughness = cfg.roughness;
    }
    if (app.liquidPlane?.uniforms?.displacementScale) {
      app.liquidPlane.uniforms.displacementScale.value = cfg.displacementScale;
    }
    app.setRain(cfg.rain);
    const target = cfg.image
      ? resolveAsset(cfg.image)
      : gradientDataUrl(cfg.backgroundColor);
    if (target) app.loadImage(target);
  } catch (e) {
    console.warn("[zen-liquid] applyConfig failed", e);
  }
}

/**
 * Convert a client (pixel) coordinate into the NDC space the liquid
 * shader expects. The ripple shader computes `p = center*0.5+0.5 - vUv`,
 * so center must be in [-1, 1] with +y pointing up (flip clientY).
 */
export function dropAtClient(
  app: ZenLiquidApp | null,
  clientX: number,
  clientY: number,
  radius = 0.08,
  strength = 0.6
) {
  if (!app) return;
  const ndcX = (clientX / window.innerWidth) * 2 - 1;
  const ndcY = -((clientY / window.innerHeight) * 2 - 1);
  addDropToApp(app, ndcX, ndcY, radius, strength);
}

export function dropCenter(
  app: ZenLiquidApp | null,
  radius = 0.12,
  strength = 0.8
) {
  addDropToApp(app, 0, 0, radius, strength);
}

export function ZenLiquid({
  backgroundColor = "#0b1f2a",
  textColor = "#eaf6f6",
  image = null,
  metalness = 0.35,
  roughness = 0.45,
  displacementScale = 2,
  rain = false,
  className,
  onReady,
}: ZenLiquidProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<ZenLiquidApp | null>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn("[zen-liquid] canvas ref not ready");
      return;
    }

    const base = getBasePath();
    const vendorUrl = `${base}/vendor/liquid1.min.js`.replace(/\/{2,}/g, "/");
    console.log("[zen-liquid] loading vendor from", vendorUrl);

    let disposed = false;
    const init = async () => {
      try {
        const importModule = new Function(
          "url",
          "return import(url)"
        ) as (url: string) => Promise<{
          default: (canvas: HTMLCanvasElement) => ZenLiquidApp;
        }>;
        const mod = await importModule(vendorUrl);
        if (disposed) return;
        const LiquidBackground = mod.default;
        console.log("[zen-liquid] vendor loaded, initializing");
        const app = LiquidBackground(canvas);
        appRef.current = app;
        applyConfig(app, {
          metalness,
          roughness,
          displacementScale,
          rain,
          image,
          backgroundColor,
        });
        console.log("[zen-liquid] initialized");
        onReadyRef.current?.(app);
      } catch (e) {
        console.error("[zen-liquid] init failed", e);
      }
    };
    init();

    return () => {
      disposed = true;
      try {
        appRef.current?.dispose?.();
      } catch {
        /* ignore */
      }
      appRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    applyConfig(app, {
      metalness,
      roughness,
      displacementScale,
      rain,
      image,
      backgroundColor,
    });
  }, [metalness, roughness, displacementScale, rain, image, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-auto fixed inset-0 w-full h-full touch-none ${
        className ?? ""
      }`}
      style={{ backgroundColor }}
      aria-hidden
    />
  );
}

declare global {
  interface Window {
    __zenLiquid?: ZenLiquidApp;
    __onZenLiquidReady?: (app: ZenLiquidApp) => void;
  }
}
