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

// 环境音文件映射（位于 public/audio/，可替换为自己的音频）
const FILE_MAP: Record<SoundId, string> = {
  creek: "/audio/creek.mp3",
  rain: "/audio/rain.mp3",
  waves: "/audio/waves.mp3",
  birds: "/audio/birds.mp3",
  wind: "/audio/wind.mp3",
  white: "/audio/white.mp3",
  pink: "/audio/pink.mp3",
  bowl: "/audio/bowl.mp3",
};

// 交互音效文件（木鱼、抛石水花），同样放在 public/audio/，缺省则回退合成音
const SFX_FILES: Record<"woodblock" | "splash", string> = {
  woodblock: "/audio/woodblock.wav",
  splash: "/audio/splash.wav",
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
  // 浏览器自动播放策略下，无用户手势时 resume() 会被拒绝。
  // 此时不排期 start/ramp，改为挂入待播队列，等真正 resume 成功后再启动，
  // 避免「suspended 窗口内排期 + resume 瞬间一起触发」产生的瞬态蜂鸣。
  private pending = new Map<SoundId, number>();

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
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.master.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    // ctx 状态变化（如用户首次交互后变为 running）时，冲刷待播队列
    this.ctx.addEventListener("statechange", () => {
      if (this.ctx && this.ctx.state === "running") {
        const toPlay = Array.from(this.pending.entries());
        this.pending.clear();
        for (const [id, vol] of toPlay) {
          this.play(id, vol);
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
    // resume 成功后冲刷待播队列（statechange 也会触发，这里兜底）
    if (this.ctx && this.ctx.state === "running") {
      const toPlay = Array.from(this.pending.entries());
      this.pending.clear();
      for (const [id, vol] of toPlay) {
        this.play(id, vol);
      }
    }
  }

  isPlaying(id: SoundId) {
    return this.tracks.has(id) || this.pending.has(id);
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

    // 浏览器自动播放策略：无用户手势时 ctx 处于 suspended，resume() 会被拒绝。
    // 此时不排期 start/ramp（否则 resume 成功瞬间所有排期一起触发 → 瞬态蜂鸣），
    // 改为挂入待播队列，等 statechange 真正 running 后再重新进入本方法。
    if (this.ctx.state === "suspended") {
      this.pending.set(id, volume);
      // 主动尝试 resume（多数浏览器在首次手势后才会成功，这里失败也无妨）
      try {
        await this.ctx.resume();
      } catch {
        /* ignore */
      }
      return;
    }

    this.stop(id);

    const ctx = this.ctx;
    const trackGain = ctx.createGain();
    // 起始静音，随后淡入，避免任何音频文件开头的爆音/瞬态被误听为「蜂鸣」
    trackGain.gain.value = 0;
    trackGain.connect(this.master);

    const stopAndCleanup = (sources: AudioScheduledSourceNode[]) => {
      sources.forEach((s) => {
        try {
          s.stop();
        } catch {
          /* ignore */
        }
        s.disconnect();
      });
      trackGain.disconnect();
      this.tracks.delete(id);
    };

    let sources: AudioScheduledSourceNode[] = [];

    try {
      const res = await fetch(FILE_MAP[id]);
      if (!res.ok) {
        console.warn(`[zen-audio] 找不到音频文件: ${FILE_MAP[id]}`);
        return;
      }
      const arr = await res.arrayBuffer();
      const buf = await ctx.decodeAudioData(arr);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(trackGain);
      // 跳过文件最开头 0.25s（许多环境音素材开头有爆音/咔哒声）
      const skip = Math.min(0.25, buf.duration);
      src.start(0, skip);
      sources = [src];
      this.tracks.set(id, {
        stop: () => stopAndCleanup(sources),
        gain: trackGain,
      });
      // 1.2s 淡入到目标音量，避免突兀的起始声
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

  stop(id?: SoundId) {
    if (id) {
      this.tracks.get(id)?.stop();
      this.tracks.delete(id);
    } else {
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
    if (!this.ctx || !this.master) return;
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
      g.connect(this.master);
      const now = this.ctx.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.9, now + 0.01);
      g.gain.linearRampToValueAtTime(0.0001, now + Math.min(buf.duration, 1.2));
      src.start();
      this.rampMasterToTarget();
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
