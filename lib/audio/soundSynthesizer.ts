// KINETIC CORE - Precision Web Audio Synthesizer
// Pure algorithmic sound synthesis with zero external asset dependencies.
// Microsecond-accurate scheduling directly via AudioContext.currentTime.

import { SoundProfile } from '@/types';
import { triggerVibration, HAPTIC_PATTERNS } from './vibration';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private soundProfile: SoundProfile = 'CLASSIC_BELL';
  private volume: number = 0.85;
  private isMuted: boolean = false;
  private vibrationEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  public init(): boolean {
    if (typeof window === 'undefined') return false;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  public setSoundProfile(profile: SoundProfile): void {
    this.soundProfile = profile;
  }

  public getSoundProfile(): SoundProfile {
    return this.soundProfile;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public setVibrationEnabled(enabled: boolean): void {
    this.vibrationEnabled = enabled;
  }

  public getAudioState(): AudioContextState | 'NOT_INITIALIZED' {
    return this.ctx ? this.ctx.state : 'NOT_INITIALIZED';
  }

  // --- BELL SYNTHESIS CORE ---
  private synthesizeBellStrike(startTime: number, freqMultiplier: number = 1.0, duration: number = 2.0): void {
    if (!this.ctx || !this.masterGain) return;

    // Harmonic partials for real cast bronze bell acoustic profile
    const partials = [
      { ratio: 0.5, amp: 0.6, decay: duration * 1.1 },
      { ratio: 1.0, amp: 1.0, decay: duration },
      { ratio: 1.5, amp: 0.5, decay: duration * 0.8 },
      { ratio: 2.1, amp: 0.4, decay: duration * 0.6 },
      { ratio: 3.2, amp: 0.25, decay: duration * 0.4 },
      { ratio: 4.8, amp: 0.15, decay: duration * 0.25 }
    ];

    const baseFreq = 840 * freqMultiplier;

    partials.forEach((partial) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * partial.ratio, startTime);

      // Strike attack and exponential decay
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(partial.amp * 0.28, startTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + partial.decay);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + partial.decay + 0.05);
    });

    // Metallic transient noise click
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.015);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, startTime);
    filter.Q.setValueAtTime(3.0, startTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.03);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(startTime);
    noise.stop(startTime + 0.04);
  }

  // --- DIGITAL BEEP SYNTHESIS ---
  private synthesizeBeep(startTime: number, freq: number = 1000, duration: number = 0.15): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }

  // --- TACTICAL AUDIO PULSE ---
  private synthesizeTactical(startTime: number, freq: number = 380, duration: number = 0.22): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, startTime + duration);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.35, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }

  // --- 10 SECOND RINGSIDE CLAPPER ---
  private synthesizeClapper(startTime: number): void {
    if (!this.ctx || !this.masterGain) return;

    // Two crisp wooden board strikes spaced 120ms apart
    [0, 0.12].forEach((offset) => {
      if (!this.ctx || !this.masterGain) return;
      const t = startTime + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(740, t);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.05);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.07);
    });
  }

  // --- PUBLIC EVENT DISPATCHERS ---

  public playSessionStart(): void {
    if (this.soundProfile === 'SILENT') return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.vibrationEnabled) triggerVibration(HAPTIC_PATTERNS.ROUND_START);

    if (this.soundProfile === 'DIGITAL_BEEP') {
      this.synthesizeBeep(now, 880, 0.12);
      this.synthesizeBeep(now + 0.15, 1320, 0.25);
    } else if (this.soundProfile === 'TACTICAL') {
      this.synthesizeTactical(now, 450, 0.3);
    } else {
      this.synthesizeBellStrike(now, 1.0, 2.2);
    }
  }

  public playRoundStart(): void {
    if (this.soundProfile === 'SILENT') return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.vibrationEnabled) triggerVibration(HAPTIC_PATTERNS.ROUND_START);

    if (this.soundProfile === 'DIGITAL_BEEP') {
      this.synthesizeBeep(now, 1200, 0.3);
    } else if (this.soundProfile === 'TACTICAL') {
      this.synthesizeTactical(now, 520, 0.28);
    } else {
      // Classic deep resonance round start bell
      this.synthesizeBellStrike(now, 1.0, 2.4);
    }
  }

  public play10SecondWarning(): void {
    if (this.soundProfile === 'SILENT') return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.vibrationEnabled) triggerVibration(HAPTIC_PATTERNS.WARNING_10S);

    if (this.soundProfile === 'DIGITAL_BEEP') {
      this.synthesizeBeep(now, 750, 0.08);
      this.synthesizeBeep(now + 0.12, 750, 0.08);
    } else if (this.soundProfile === 'TACTICAL') {
      this.synthesizeTactical(now, 280, 0.1);
      this.synthesizeTactical(now + 0.12, 280, 0.1);
    } else {
      // Authentic boxing ringside wood clapper
      this.synthesizeClapper(now);
    }
  }

  public playCountdownTick(secondsRemaining: number): void {
    if (this.soundProfile === 'SILENT') return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.vibrationEnabled) triggerVibration(HAPTIC_PATTERNS.COUNTDOWN_TICK);

    // Graduated pitch as zero approaches: 5s = 700Hz -> 1s = 1300Hz
    const freq = 600 + (6 - Math.max(1, Math.min(5, secondsRemaining))) * 140;

    if (this.soundProfile === 'DIGITAL_BEEP' || this.soundProfile === 'MINIMAL') {
      this.synthesizeBeep(now, freq, 0.08);
    } else if (this.soundProfile === 'TACTICAL') {
      this.synthesizeTactical(now, freq * 0.6, 0.09);
    } else {
      this.synthesizeBeep(now, freq, 0.09);
    }
  }

  public playRoundEnd(): void {
    if (this.soundProfile === 'SILENT') return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.vibrationEnabled) triggerVibration(HAPTIC_PATTERNS.ROUND_END);

    if (this.soundProfile === 'DIGITAL_BEEP') {
      this.synthesizeBeep(now, 1600, 0.12);
      this.synthesizeBeep(now + 0.16, 1100, 0.35);
    } else if (this.soundProfile === 'TACTICAL') {
      this.synthesizeTactical(now, 320, 0.2);
      this.synthesizeTactical(now + 0.18, 220, 0.35);
    } else {
      // Classic double bell for round end
      this.synthesizeBellStrike(now, 1.0, 2.0);
      this.synthesizeBellStrike(now + 0.25, 1.05, 2.2);
    }
  }

  public playRestStart(): void {
    // Uses round end tone
    this.playRoundEnd();
  }

  public playFinalRound(): void {
    if (this.soundProfile === 'SILENT') return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.vibrationEnabled) triggerVibration(HAPTIC_PATTERNS.ROUND_START);

    // Three rapid bells announcing championship round
    this.synthesizeBellStrike(now, 0.98, 1.8);
    this.synthesizeBellStrike(now + 0.22, 1.02, 1.8);
    this.synthesizeBellStrike(now + 0.44, 1.1, 2.5);
  }

  public playSessionComplete(): void {
    if (this.soundProfile === 'SILENT') return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.vibrationEnabled) triggerVibration(HAPTIC_PATTERNS.SESSION_COMPLETE);

    if (this.soundProfile === 'DIGITAL_BEEP') {
      [0, 0.15, 0.3, 0.45].forEach((t, i) => {
        this.synthesizeBeep(now + t, 800 + i * 250, 0.12);
      });
    } else {
      // Victorious ringside flurry bell
      this.synthesizeBellStrike(now, 1.0, 1.5);
      this.synthesizeBellStrike(now + 0.2, 1.05, 1.5);
      this.synthesizeBellStrike(now + 0.4, 1.1, 1.5);
      this.synthesizeBellStrike(now + 0.65, 1.25, 3.0);
    }
  }

  public playButtonTap(): void {
    if (this.soundProfile === 'SILENT' || this.soundProfile === 'MINIMAL') return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.vibrationEnabled) triggerVibration(HAPTIC_PATTERNS.BUTTON_TAP);
    this.synthesizeBeep(now, 1400, 0.03);
  }
}

// Global Singleton Instance
export const soundEngine = new SoundSynthesizer();
