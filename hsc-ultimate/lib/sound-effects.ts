/**
 * HSC Ultimate Zero-Latency Web Audio SFX Engine.
 * 
 * Uses client-side Web Audio API oscillators to generate delightful, responsive
 * audio feedback without needing any external audio assets, network requests, or latency.
 */

export type SoundEffectType =
  | "correct"
  | "incorrect"
  | "streak"
  | "levelUp"
  | "tick"
  | "warning"
  | "click";

const STORAGE_KEY = "hsc_sfx_muted";

class SoundEffectsEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted = false;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        this.isMuted = saved === "true";
      } catch {
        this.isMuted = false;
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, String(muted));
      } catch {}
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public play(type: SoundEffectType): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      switch (type) {
        case "correct": {
          // Warm positive harmonic chord (C5 523Hz -> E5 659Hz -> G5 784Hz)
          [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + i * 0.04);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.04 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.04);
            osc.stop(now + i * 0.04 + 0.36);
          });
          break;
        }

        case "incorrect": {
          // Soft muted buzz (F3 174Hz to Eb3 155Hz with lowpass filter)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          osc.type = "triangle";
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(300, now);

          osc.frequency.setValueAtTime(174.61, now);
          osc.frequency.exponentialRampToValueAtTime(140.0, now + 0.25);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        }

        case "streak": {
          // Rising 4-note energetic arpeggio (C5 -> E5 -> G5 -> C6)
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + i * 0.06);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.14, now + i * 0.06 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.22);
          });
          break;
        }

        case "levelUp": {
          // Triumphant Fanfare
          const chords = [
            { freqs: [523.25, 659.25, 783.99], delay: 0.0, dur: 0.15 },
            { freqs: [587.33, 739.99, 880.0], delay: 0.15, dur: 0.15 },
            { freqs: [659.25, 830.61, 987.77], delay: 0.3, dur: 0.15 },
            { freqs: [783.99, 987.77, 1174.66, 1567.98], delay: 0.45, dur: 0.55 },
          ];

          chords.forEach(({ freqs, delay, dur }) => {
            freqs.forEach((freq) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = "sine";
              osc.frequency.setValueAtTime(freq, now + delay);
              gain.gain.setValueAtTime(0.0001, now);
              gain.gain.exponentialRampToValueAtTime(0.09, now + delay + 0.02);
              gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(now + delay);
              osc.stop(now + delay + dur + 0.02);
            });
          });
          break;
        }

        case "tick": {
          // Mechanical woodblock-like clock tick
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.035);
          break;
        }

        case "warning": {
          // Urgent double warning ping
          [0, 0.12].forEach((offset) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, now + offset);
            gain.gain.setValueAtTime(0.0001, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.12, now + offset + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + offset);
            osc.stop(now + offset + 0.09);
          });
          break;
        }

        case "click": {
          // Subtle UI tap
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.015);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.02);
          break;
        }
      }
    } catch {
      // AudioContext could be blocked by browser policy before first user interaction
    }
  }
}

export const sfx = new SoundEffectsEngine();
