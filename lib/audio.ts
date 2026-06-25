interface AmbientHandle {
  ctx: AudioContext;
  master: GainNode;
  stop: () => void;
}

let ambient: AmbientHandle | null = null;

function ensureCtx(): AudioContext {
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  return new Ctx();
}

export function startAmbient(): void {
  if (ambient) return;
  const ctx = ensureCtx();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const droneA = ctx.createOscillator();
  droneA.type = "sine";
  droneA.frequency.value = 55;
  const droneB = ctx.createOscillator();
  droneB.type = "sine";
  droneB.frequency.value = 82.5;
  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.08;
  droneA.connect(droneGain);
  droneB.connect(droneGain);
  droneGain.connect(master);

  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 450;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.06;
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);

  droneA.start();
  droneB.start();
  noise.start();

  master.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1.4);

  ambient = {
    ctx,
    master,
    stop: () => {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      setTimeout(() => {
        droneA.stop();
        droneB.stop();
        noise.stop();
        void ctx.close();
      }, 700);
    },
  };
}

export function stopAmbient(): void {
  if (!ambient) return;
  ambient.stop();
  ambient = null;
}

export function isAmbientPlaying(): boolean {
  return ambient !== null;
}

export function ping(frequency = 880): void {
  if (!ambient) return;
  const { ctx, master } = ambient;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = frequency;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(master);
  const now = ctx.currentTime;
  gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
  osc.start(now);
  osc.stop(now + 0.85);
}
