// Web Audio API Gentle Sound Synthesizer for Clinical & Health Applications
// Works 100% offline with zero external audio files.

export type SoundProfile = 'suave_cristal' | 'harpa_calma' | 'sino_zen';

class AudioAlertService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playChime(profile: SoundProfile = 'suave_cristal', volumePercent: number = 75) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const masterGain = ctx.createGain();
      const normVol = Math.max(0, Math.min(1, volumePercent / 100)) * 0.4;
      masterGain.gain.setValueAtTime(normVol, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (profile === 'suave_cristal') {
        // Two gentle sine chords reminiscent of an acolhedor chime
        this.playSineTone(ctx, masterGain, 523.25, now, 0.8, 0.3); // C5
        this.playSineTone(ctx, masterGain, 659.25, now + 0.15, 0.9, 0.35); // E5
        this.playSineTone(ctx, masterGain, 783.99, now + 0.3, 1.2, 0.35); // G5
        this.playSineTone(ctx, masterGain, 1046.50, now + 0.45, 1.5, 0.25); // C6
      } else if (profile === 'harpa_calma') {
        // Pentatonic harp pluck
        const notes = [440.0, 493.88, 554.37, 659.25, 739.99]; // A4, B4, C#5, E5, F#5
        notes.forEach((freq, idx) => {
          this.playSineTone(ctx, masterGain, freq, now + idx * 0.12, 1.4, 0.3);
        });
      } else {
        // 'sino_zen' - Tibetan bowl harmonic resonance
        this.playSineTone(ctx, masterGain, 392.0, now, 2.5, 0.5); // G4 fundamental
        this.playSineTone(ctx, masterGain, 784.0, now, 2.2, 0.2); // Harmonic 1
        this.playSineTone(ctx, masterGain, 1176.0, now, 1.8, 0.1); // Harmonic 2
      }
    } catch (e) {
      console.warn('Audio alert not supported or user gesture needed:', e);
    }
  }

  private playSineTone(
    ctx: AudioContext,
    destination: AudioNode,
    freq: number,
    startTime: number,
    duration: number,
    gainLevel: number
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  vibrate(pattern: number[] = [150, 100, 150]) {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.warn('Vibration not permitted:', e);
      }
    }
  }
}

export const audioAlert = new AudioAlertService();
