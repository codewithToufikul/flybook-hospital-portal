/**
 * Synthesizes a crisp, pleasant two-tone hospital notification chime using Web Audio API.
 * No external audio files needed; plays instantly with zero latency.
 */
class SoundService {
  private audioCtx: AudioContext | null = null;
  private isSoundEnabled: boolean = true;

  constructor() {
    const saved = localStorage.getItem('hospital_portal_sound_enabled');
    if (saved !== null) {
      this.isSoundEnabled = saved === 'true';
    }
  }

  public getSoundEnabled(): boolean {
    return this.isSoundEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.isSoundEnabled = enabled;
    localStorage.setItem('hospital_portal_sound_enabled', String(enabled));
  }

  private initAudio() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Plays a pleasant dual-tone chime (Medical / Airport gate style)
   * Suitable for incoming patient tickets
   */
  public playNewTicketChime() {
    if (!this.isSoundEnabled) return;

    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // Note 1: 587.33 Hz (D5)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);

      osc1.start(now);
      osc1.stop(now + 0.4);

      // Note 2: 880 Hz (A5) - brighter confirmation chime
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.15);

      gain2.gain.setValueAtTime(0, now + 0.15);
      gain2.gain.linearRampToValueAtTime(0.35, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);

      osc2.start(now + 0.15);
      osc2.stop(now + 0.7);
    } catch (e) {
      console.warn('[SoundService] Could not play alert chime:', e);
    }
  }

  /**
   * Plays a subtle click / success sound for actions like status marked
   */
  public playSuccessTone() {
    if (!this.isSoundEnabled) return;

    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('[SoundService] Could not play success tone:', e);
    }
  }
}

export const soundService = new SoundService();
