/**
 * Web Audio API synthesizer for Speed Tycoon 3D Car Game
 */
class TycoonAudioSystem {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private musicTimer: number | null = null;
  private musicStep: number = 0;

  constructor() {
    const saved = localStorage.getItem('tycoon_muted');
    if (saved !== null) {
      this.isMuted = saved === 'true';
    }
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch {}
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('tycoon_muted', String(this.isMuted));
    if (this.isMuted) {
      this.stopEngine();
      this.stopMusic();
    } else {
      this.init();
      this.startEngine();
      this.startMusic();
    }
    return this.isMuted;
  }

  public startEngine() {
    this.init();
    if (this.isMuted || !this.ctx || this.engineOsc) return;

    try {
      const now = this.ctx.currentTime;
      this.engineOsc = this.ctx.createOscillator();
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(55, now);

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(360, now);
      this.engineFilter.Q.setValueAtTime(2.5, now);

      this.engineGain.gain.setValueAtTime(0.06, now);

      this.engineOsc.connect(this.engineFilter).connect(this.engineGain).connect(this.ctx.destination);
      this.engineOsc.start(now);
    } catch {}
  }

  public updateEngine(ratio: number, boosting: boolean) {
    if (!this.engineOsc || !this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const targetFreq = 50 + ratio * 140 + (boosting ? 55 : 0);
      const targetCutoff = 320 + ratio * 480 + (boosting ? 220 : 0);

      this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
      if (this.engineFilter) {
        this.engineFilter.frequency.setTargetAtTime(targetCutoff, now, 0.08);
      }
    } catch {}
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {}
      this.engineOsc = null;
    }
  }

  public tone(freq: number, duration = 0.1, type: OscillatorType = 'sawtooth', volume = 0.1) {
    this.init();
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  // Cash Ka-Ching sound! 💵🪙
  public playCashCollect() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [987.77, 1318.51, 1975.53]; // B5, E6, B6 shiny coin chime
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.18, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);

        osc.connect(gain).connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.15);
      });
    } catch {}
  }

  public playNitro() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.35);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc.connect(gain).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch {}
  }

  public playTurn(left: boolean) {
    this.tone(left ? 280 : 340, 0.04, 'triangle', 0.08);
  }

  public playNearMiss() {
    this.tone(720, 0.14, 'sine', 0.22);
    setTimeout(() => this.tone(1100, 0.1, 'sine', 0.25), 40);
  }

  public playCrash() {
    this.stopEngine();
    this.tone(85, 0.6, 'triangle', 0.4);
    setTimeout(() => this.tone(40, 0.5, 'sawtooth', 0.35), 40);
  }

  public playSiren() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.linearRampToValueAtTime(980, now + 0.3);
      osc.frequency.linearRampToValueAtTime(620, now + 0.6);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.65);

      osc.connect(gain).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch {}
  }

  public playBuySuccess() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.tone(f, 0.16, 'triangle', 0.22);
      }, i * 55);
    });
  }

  public playMagnet() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    this.tone(880, 0.08, 'sine', 0.12);
  }

  public playSpin() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    this.tone(520, 0.04, 'triangle', 0.1);
  }

  public playWithdrawSuccess() {
    this.playBuySuccess();
  }

  public startMusic() {
    this.init();
    if (this.isMuted || !this.ctx || this.musicTimer !== null) return;

    const bass = [65.41, 65.41, 65.41, 65.41, 77.78, 77.78, 77.78, 77.78, 87.31, 87.31, 87.31, 87.31, 98, 98, 87.31, 77.78];
    const loop = () => {
      if (!this.ctx || this.isMuted) return;
      const step = this.musicStep % 16;
      this.tone(bass[step], 0.11, 'sawtooth', 0.035);
      this.musicStep++;
      this.musicTimer = window.setTimeout(loop, 140);
    };
    loop();
  }

  public stopMusic() {
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public playWeatherAlert(type: string) {
    this.init();
    if (this.isMuted || !this.ctx) return;
    try {
      if (type === 'rain') {
        // Quick rain/thunder swell
        this.tone(140, 0.4, 'sawtooth', 0.15);
        setTimeout(() => this.tone(90, 0.6, 'triangle', 0.2), 120);
      } else if (type === 'fog') {
        // Low mystic warning drone
        this.tone(110, 0.8, 'sine', 0.18);
        setTimeout(() => this.tone(165, 0.6, 'triangle', 0.14), 180);
      } else if (type === 'neon_snow') {
        // Frosty crystalline bells
        [587.33, 880, 1174.66, 1760].forEach((freq, idx) => {
          setTimeout(() => this.tone(freq, 0.22, 'sine', 0.12), idx * 80);
        });
      } else {
        // Sunshine / clear chime
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          setTimeout(() => this.tone(freq, 0.18, 'triangle', 0.14), idx * 70);
        });
      }
    } catch {}
  }

  public vibrate(ms: number) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {}
    }
  }
}

export const sound = new TycoonAudioSystem();
