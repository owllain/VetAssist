let soundEnabled = true;

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  return soundEnabled;
}

export function playAlertSound(severity: 'alta' | 'media' | 'baja'): void {
  if (!soundEnabled) return;

  try {
    const ctx = new AudioContext();

    const configs: Record<typeof severity, { freq: number; onMs: number; offMs: number; repeats: number }> = {
      alta: { freq: 880, onMs: 200, offMs: 100, repeats: 3 },
      media: { freq: 660, onMs: 150, offMs: 100, repeats: 2 },
      baja: { freq: 440, onMs: 200, offMs: 0, repeats: 1 },
    };

    const { freq, onMs, offMs, repeats } = configs[severity];
    let startTime = ctx.currentTime + 0.05;

    for (let i = 0; i < repeats; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + onMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + onMs / 1000);

      startTime += onMs / 1000 + offMs / 1000;
    }

    // Auto-close context after sounds finish
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, (onMs + offMs) * repeats + 200);
  } catch {
    // Browsers may block autoplay — fail silently
  }
}
