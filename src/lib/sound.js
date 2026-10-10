// Cash register sounds, synthesized with Web Audio so there are no files to load

let context = null;
let noise = null;

function audio() {
  if (!context) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

function bell(ac, output, start, frequency, volume, decay) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + decay);
  osc.connect(gain).connect(output);
  osc.start(start);
  osc.stop(start + decay + 0.05);
}

/** "Ka": a burst of filtered noise for the drawer, "ching": two bright bell strikes. */
export function kaching(volume = 0.35) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  const output = ac.createGain();
  output.gain.value = volume;
  output.connect(ac.destination);

  if (!noise) {
    noise = ac.createBuffer(1, Math.round(ac.sampleRate * 0.08), ac.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
  }
  const drawer = ac.createBufferSource();
  const filter = ac.createBiquadFilter();
  drawer.buffer = noise;
  filter.type = 'bandpass';
  filter.frequency.value = 2500;
  filter.Q.value = 1.5;
  drawer.connect(filter).connect(output);
  drawer.start(t);

  [[0.07, 1568], [0.15, 2093]].forEach(([delay, frequency]) => {
    bell(ac, output, t + delay, frequency, 0.5, 0.9);
    bell(ac, output, t + delay, frequency * 2.76, 0.12, 0.4);
  });
}

/** A single little coin plink, for while bills are being thrown. */
export function plink(volume = 0.12) {
  const ac = audio();
  if (!ac) return;
  const output = ac.createGain();
  output.gain.value = volume;
  output.connect(ac.destination);
  bell(ac, output, ac.currentTime, 2400 + Math.random() * 1600, 0.6, 0.18);
}
