"use client";

export type SoundId =
  | "creek"
  | "rain"
  | "waves"
  | "birds"
  | "wind"
  | "white"
  | "pink"
  | "bowl";

// 拼接 basePath，保证 GitHub Pages 项目页（/repo/）与根路径（用户页/域名）都能正确加载音频。
// 运行时从当前页面路径推断：GitHub Pages 项目页 URL 形如 https://user.github.io/<repo>/，
// 取其第一段路径作为 base；根路径部署则 base 为空。
function getAssetBase(): string {
  if (typeof window === "undefined") return "";
  const seg = window.location.pathname.split("/").filter(Boolean);
  // 项目页：/zen-pond/...  ── 取第一段；根页面 /index.html 则无段
  return seg.length > 0 ? `/${seg[0]}` : "";
}
const withBase = (p: string) =>
  `${getAssetBase()}${p}`.replace(/\/{2,}/g, "/");

// 环境音文件映射（位于 public/audio/，可替换为自己的音频）
const FILE_MAP: Record<SoundId, string> = {
  creek: withBase("/audio/creek.mp3"),
  rain: withBase("/audio/rain.mp3"),
  waves: withBase("/audio/waves.mp3"),
  birds: withBase("/audio/birds.mp3"),
  wind: withBase("/audio/wind.mp3"),
  white: withBase("/audio/white.mp3"),
  pink: withBase("/audio/pink.mp3"),
  bowl: withBase("/audio/bowl.mp3"),
};

// 交互音效文件（木鱼、抛石水花），同样放在 public/audio/，缺省则回退合成音
const SFX_FILES: Record<"woodblock" | "splash", string> = {
  woodblock: withBase("/audio/woodblock.wav"),
  splash: withBase("/audio/splash.wav"),
};


export const SOUND_LABELS: Record<SoundId, string> = {
  creek: "溪流",
  rain: "细雨",
  waves: "海浪",
  birds: "鸟鸣",
  wind: "风声",
  white: "白噪",
  pink: "粉噪",
  bowl: "颂钵",
};

interface Track {
  stop: () => void;
  gain: GainNode;
}

/**
 * Ambient sound engine. Plays a CC0 file from /audio if present,
 * otherwise synthesizes an approximation with the Web Audio API so the
 * site still works fully offline without bundled assets.
 */
export class ZenAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private tracks = new Map<SoundId, Track>();
  private masterVolume = 0.5;
  // 交互音效（木鱼/水花）独立增益节点：不经 master，响度固定且更突出，
  // 避免被环境音主音量压小导致「敲木鱼听不清」
  private sfxGain: GainNode | null = null;
  // 「用户意图播放」列表：用户在 suspended（无手势）时点了播放，我们记录意图，
  // 等 AudioContext 真正 running 后再据此启动。与 tracks（真实在播）分离，
  // 保证 UI 状态与引擎状态一致，避免按钮「点不掉/点不开」。
  private desired = new Map<SoundId, number>();
  // 播放代际计数器：stop 时递增，旧 generation 的交叉淡变定时器不会创建新 source，
  // 防止异步 race（statechange / setTimeout）导致「关不掉」。
  private generations = new Map<SoundId, number>();

  private ensure() {
    if (this.ctx) return;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    // 创建瞬间先把 master 静音，等音频真正开始后再抬到目标音量，
    // 杜绝 AudioContext 初始化/resume 时的瞬态爆音被听成蜂鸣
    this.master.gain.value = 0;
    // 交互音效独立通道：固定增益，直接连到 destination，不经 master
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 1.0;
    this.sfxGain.connect(this.ctx.destination);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.master.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    // ctx 状态变化（如用户首次交互后变为 running）时，把意图列表里尚未真正
    // 播放的音轨启动起来。注意：只补播「desired 有但 tracks 没有」的条目。
    this.ctx.addEventListener("statechange", () => {
      if (this.ctx && this.ctx.state === "running") {
        for (const [id, vol] of this.desired) {
          if (!this.tracks.has(id)) this.play(id, vol);
        }
      }
    });
  }

  /** 真正把 master 抬到目标音量（带极短淡入，避免咔哒声） */
  private rampMasterToTarget() {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    const target = this.masterVolume;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
    this.master.gain.linearRampToValueAtTime(target, now + 0.15);
  }

  setMasterVolume(v: number) {
    this.masterVolume = v;
    if (this.master) this.master.gain.value = v;
  }

  getMasterVolume() {
    return this.masterVolume;
  }

  async resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch {
        /* ignore */
      }
    }
    // resume 成功后补播意图列表里尚未真正出声的音轨（statechange 也会触发，这里兜底）
    if (this.ctx && this.ctx.state === "running") {
      for (const [id, vol] of this.desired) {
        if (!this.tracks.has(id)) this.play(id, vol);
      }
    }
  }

  isPlaying(id: SoundId) {
    return this.tracks.has(id) || this.desired.has(id);
  }

  anyPlaying() {
    return this.tracks.size > 0;
  }

  /** RMS amplitude in 0..1, for driving ripples. */
  getLevel(): number {
    if (!this.analyser || !this.ctx) return 0;
    const buf = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) {
      const x = (buf[i] - 128) / 128;
      sum += x * x;
    }
    return Math.sqrt(sum / buf.length);
  }

  async play(id: SoundId, volume = 0.7) {
    this.ensure();
    if (!this.ctx || !this.master) return;

    // 记录「用户意图播放」，UI 据此同步状态；suspended 时仅保留意图并尝试恢复，
    // 不立即排期，避免 resume 瞬间所有音轨一起触发产生瞬态蜂鸣。
    this.desired.set(id, volume);

    // 新播放 generation：stop 会递增该值，旧 generation 的 setTimeout 回调不会再创建 source
    const gen = (this.generations.get(id) || 0) + 1;
    this.generations.set(id, gen);

    // 浏览器自动播放策略：无用户手势时 ctx 处于 suspended，resume() 会被拒绝。
    // 此时直接返回，等 statechange / resume 成功（running）后再真正启动。
    if (this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch {
        /* ignore */
      }
      return;
    }

    this._stopTrack(id);

    const ctx = this.ctx;
    const trackGain = ctx.createGain();
    // 起始静音，随后淡入，避免任何音频文件开头的爆音/瞬态被误听为「蜂鸣」
    trackGain.gain.value = 0;
    trackGain.connect(this.master);

    let stopped = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const liveSources: AudioScheduledSourceNode[] = [];

    try {
      const res = await fetch(FILE_MAP[id]);
      if (!res.ok) {
        console.warn(`[zen-audio] 找不到音频文件: ${FILE_MAP[id]}`);
        return;
      }
      const arr = await res.arrayBuffer();
      const buf = await ctx.decodeAudioData(arr);
      // 双段交叉淡变循环：两段同源 buffer 错开 CROSS 秒调度，
      // 每段结尾淡出、下一段开头淡入，接缝处交叉淡化，
      // 消除素材首尾不连续造成的「咔哒」接缝，实现无缝循环。
      const CROSS = 0.06;
      const skip = Math.min(0.25, buf.duration); // 跳过开头可能的爆音
      const segLen = Math.max(0.5, buf.duration - skip);

      const startSegment = (startAt: number) => {
        // 已停止或 generation 已过期（新的 play/stop 已经发生）
        if (stopped || (this.generations.get(id) || 0) !== gen) return;
        const s = ctx.createBufferSource();
        s.buffer = buf;
        const g = ctx.createGain();
        g.gain.value = 0;
        s.connect(g);
        g.connect(trackGain);
        // 播放一段（skip → segLen），结束自动 stop，无需手动终止
        s.start(startAt, skip, segLen);
        // 段内极短淡入，仅用于交叉平滑
        g.gain.setValueAtTime(0, startAt);
        g.gain.linearRampToValueAtTime(1, startAt + 0.01);
        // 段结束前 CROSS 秒开始淡出
        const fadeOutAt = startAt + segLen - CROSS;
        g.gain.setValueAtTime(1, Math.max(startAt + 0.01, fadeOutAt));
        g.gain.linearRampToValueAtTime(0, startAt + segLen);
        s.onended = () => {
          try {
            s.disconnect();
          } catch {
            /* ignore */
          }
          const i = liveSources.indexOf(s);
          if (i >= 0) liveSources.splice(i, 1);
        };
        liveSources.push(s);
        // 在段结束前 CROSS 秒启动下一段，与上一段交叉
        const nextStart = startAt + segLen - CROSS;
        const delayMs = Math.max(0, (nextStart - ctx.currentTime) * 1000 - 30);
        const t = setTimeout(() => {
          // 再次校验 generation，防止 stop 发生在 setTimeout 触发之前导致漏关
          if ((this.generations.get(id) || 0) !== gen) return;
          startSegment(nextStart);
        }, delayMs);
        timers.push(t);
      };

      startSegment(ctx.currentTime + 0.02);

      this.tracks.set(id, {
        stop: () => {
          stopped = true;
          // 递增 generation，使任何旧 generation 的 setTimeout 回调直接返回
          this.generations.set(id, (this.generations.get(id) || 0) + 1);
          timers.forEach((t) => clearTimeout(t));
          // 倒序停止并释放所有 source，避免 onended 修改数组导致跳过
          for (let i = liveSources.length - 1; i >= 0; i--) {
            const s = liveSources[i];
            try {
              s.stop();
            } catch {
              /* ignore */
            }
            try {
              s.disconnect();
            } catch {
              /* ignore */
            }
          }
          liveSources.length = 0;
          // 立即把 trackGain 静音并从 master 断开，确保没有任何漏网输出
          if (this.ctx) {
            const now = this.ctx.currentTime;
            trackGain.gain.cancelScheduledValues(now);
            trackGain.gain.setValueAtTime(0, now);
          }
          try {
            trackGain.disconnect();
          } catch {
            /* ignore */
          }
        },
        gain: trackGain,
      });
      // 1.2s 整体淡入到目标音量，避免突兀的起始声
      const now = ctx.currentTime;
      trackGain.gain.cancelScheduledValues(now);
      trackGain.gain.setValueAtTime(0, now);
      trackGain.gain.linearRampToValueAtTime(volume, now + 1.2);
      // 音频真正开始播放了，再把 master 从 0 抬到目标音量
      this.rampMasterToTarget();
      return;
    } catch (e) {
      // 仅引用 public/audio 中的真实音频文件，不再使用合成音回退
      console.warn(`[zen-audio] 音频解码失败，已跳过（不会使用合成音）: ${FILE_MAP[id]}`, e);
      return;
    }
  }

  /** 只停止真实在播的音轨，不影响 desired 意图列表 */
  private _stopTrack(id: SoundId) {
    this.tracks.get(id)?.stop();
    this.tracks.delete(id);
  }

  stop(id?: SoundId) {
    if (id) {
      // 用户主动关闭：同时清除意图，避免之后被 statechange 误重新播放
      this.desired.delete(id);
      this._stopTrack(id);
    } else {
      this.desired.clear();
      this.tracks.forEach((t) => t.stop());
      this.tracks.clear();
    }
  }

  setVolume(id: SoundId, v: number) {
    const t = this.tracks.get(id);
    if (!t || !this.ctx) return;
    const now = this.ctx.currentTime;
    t.gain.gain.cancelScheduledValues(now);
    t.gain.gain.setTargetAtTime(v, now, 0.05);
  }

  /** 播一个一次性音效文件；文件缺失/解码失败时静默，不再使用合成音 */
  private async playSfx(key: "woodblock" | "splash") {
    this.ensure();
    if (!this.ctx || !this.sfxGain) return;
    // 无用户手势（suspended）时音效不排期，直接跳过；音效本就在交互时触发，
    // 调用点已有用户手势，正常不会走到这里，仅作防御
    if (this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch {
        /* ignore */
      }
      if (this.ctx.state === "suspended") return;
    }
    try {
      const res = await fetch(SFX_FILES[key]);
      if (!res.ok) {
        console.warn(`[zen-audio] 找不到音效文件: ${SFX_FILES[key]}`);
        return;
      }
      const arr = await res.arrayBuffer();
      const buf = await this.ctx.decodeAudioData(arr);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const g = this.ctx.createGain();
      g.gain.value = 0.0001;
      src.connect(g);
      // 交互音效走独立通道（不经过 master），响度不受环境音主音量影响
      g.connect(this.sfxGain);
      // 木鱼单独放大响度，敲击更清脆突出；水花保持适中
      const peak = key === "woodblock" ? 1.4 : 0.9;
      const now = this.ctx.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(peak, now + 0.005);
      g.gain.linearRampToValueAtTime(0.0001, now + Math.min(buf.duration, 1.2));
      src.start();
    } catch (e) {
      console.warn(`[zen-audio] 音效解码失败，已跳过: ${SFX_FILES[key]}`, e);
    }
  }

  playWoodblock() {
    this.playSfx("woodblock");
  }

  playSplash() {
    this.playSfx("splash");
  }
}

let singleton: ZenAudio | null = null;
export function getZenAudio(): ZenAudio {
  if (!singleton) singleton = new ZenAudio();
  return singleton;
}

export function playWoodblock() {
  getZenAudio().playWoodblock();
}

export function playSplash() {
  getZenAudio().playSplash();
}
