/** V7.4 Tescil sesi — soft-tactile-thud.mp3 veya derinden gelen Web Audio mühürleme */
let audioContext = null;

const SEAL_AUDIO_URL = '/soft-tactile-thud.mp3';

function playSealFallback() {
  try {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioContext;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (_) { /* optional */ }
}

export function playSealSound() {
  try {
    const audio = new window.Audio(SEAL_AUDIO_URL);
    audio.volume = 0.4;
    audio.play().catch(() => playSealFallback());
  } catch (_) {
    playSealFallback();
  }
}
