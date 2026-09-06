// Lazy AudioContext — created only after first user gesture (browser policy).
let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx) {
    _ctx = new AudioContext();
  }
  // Resume if suspended (e.g., after tab switch)
  if (_ctx.state === "suspended") {
    _ctx.resume().catch(() => {});
  }
  return _ctx;
}

/**
 * Play a short percussive click simulating a wooden bead moving on a wire.
 * Safe to call any time — fails silently if AudioContext is unavailable.
 */
export function playBeadClick(): void {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Main click body
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.start(now);
    osc.stop(now + 0.1);

    // Brief noise "snap" layer
    const bufLen = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / bufLen);
    }
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    noise.buffer = buffer;
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseGain.gain.setValueAtTime(0.06, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    noise.start(now);
  } catch {
    // Silently fail — audio is enhancement, not core feature
  }
}
