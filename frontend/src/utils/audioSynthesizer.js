/**
 * Web Audio API Native Synthesizer Engine for Patient Mental Health & Relaxation.
 * Generates Binaural Beats, Solfeggio 432/528Hz Tones, Pink/White Noise, and Ambient Waves.
 */

class AudioSynthesizerEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentPresetId = null;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    if (!this.masterGain) {
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }
  }

  setVolume(val) {
    if (this.masterGain && this.audioCtx) {
      const clamped = Math.max(0, Math.min(1, val));
      this.masterGain.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
    }
  }

  stopAll() {
    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // Node already stopped
      }
    });
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentPresetId = null;
  }

  // Preset 1: 432Hz Deep Relaxation Waves
  play432HzRelaxation() {
    this.initContext();
    this.stopAll();

    const carrierFreq = 432;
    const beatFreq = 10; // Alpha wave 10Hz

    // Left Ear Oscillator
    const oscL = this.audioCtx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(carrierFreq, this.audioCtx.currentTime);

    const merger = this.audioCtx.createChannelMerger(2);
    oscL.connect(merger, 0, 0);

    // Right Ear Oscillator
    const oscR = this.audioCtx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(carrierFreq + beatFreq, this.audioCtx.currentTime);
    oscR.connect(merger, 0, 1);

    // Soft Pink Noise Layer for Ambient Warmth
    const noiseBuffer = this.createNoiseBuffer('pink');
    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = this.audioCtx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(400, this.audioCtx.currentTime);

    const noiseGain = this.audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    merger.connect(this.masterGain);

    oscL.start();
    oscR.start();
    noiseSource.start();

    this.activeNodes.push(oscL, oscR, noiseSource, noiseGain, noiseFilter);
    this.isPlaying = true;
    this.currentPresetId = 'deep_relaxation';
  }

  // Preset 2: Rain & Forest Meditation
  playRainForest() {
    this.initContext();
    this.stopAll();

    // Pink Noise Raindrops Base
    const noiseBuffer = this.createNoiseBuffer('pink');
    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter for gentle rain frequency sweep
    const rainFilter = this.audioCtx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(800, this.audioCtx.currentTime);
    rainFilter.Q.setValueAtTime(1.5, this.audioCtx.currentTime);

    // LFO to modulate rain intensity dynamically
    const lfo = this.audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, this.audioCtx.currentTime);

    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(300, this.audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(rainFilter.frequency);

    const rainGain = this.audioCtx.createGain();
    rainGain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);

    noiseSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.masterGain);

    // Warm 432Hz Drone Sub-Tone
    const subOsc = this.audioCtx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(216, this.audioCtx.currentTime);

    const subGain = this.audioCtx.createGain();
    subGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);

    noiseSource.start();
    lfo.start();
    subOsc.start();

    this.activeNodes.push(noiseSource, lfo, subOsc, rainFilter, rainGain, subGain);
    this.isPlaying = true;
    this.currentPresetId = 'rain_forest';
  }

  // Preset 3: 528Hz Ocean Solfeggio
  playOceanSolfeggio() {
    this.initContext();
    this.stopAll();

    const solfeggioFreq = 528; // Transformation & DNA Repair frequency

    const osc = this.audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(solfeggioFreq, this.audioCtx.currentTime);

    // LFO for rhythmic ocean swell modulation
    const lfo = this.audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, this.audioCtx.currentTime);

    const swellGain = this.audioCtx.createGain();
    swellGain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);

    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(swellGain.gain);

    osc.connect(swellGain);
    swellGain.connect(this.masterGain);

    // Pink Noise Waves
    const noiseBuffer = this.createNoiseBuffer('pink');
    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = this.audioCtx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(600, this.audioCtx.currentTime);

    const noiseGain = this.audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    osc.start();
    lfo.start();
    noiseSource.start();

    this.activeNodes.push(osc, lfo, noiseSource, swellGain, noiseFilter, noiseGain);
    this.isPlaying = true;
    this.currentPresetId = 'ocean_solfeggio';
  }

  // Preset 4: Sleep & Restoration (Delta 3Hz + Pink Noise)
  playSleepRestoration() {
    this.initContext();
    this.stopAll();

    const carrier = 150;
    const deltaBeat = 3; // 3Hz Delta wave for deep sleep

    const oscL = this.audioCtx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(carrier, this.audioCtx.currentTime);

    const oscR = this.audioCtx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(carrier + deltaBeat, this.audioCtx.currentTime);

    const merger = this.audioCtx.createChannelMerger(2);
    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);

    const binauralGain = this.audioCtx.createGain();
    binauralGain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);

    merger.connect(binauralGain);
    binauralGain.connect(this.masterGain);

    // Deep Brown Noise Layer
    const brownBuffer = this.createNoiseBuffer('brown');
    const brownSource = this.audioCtx.createBufferSource();
    brownSource.buffer = brownBuffer;
    brownSource.loop = true;

    const brownGain = this.audioCtx.createGain();
    brownGain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);

    brownSource.connect(brownGain);
    brownGain.connect(this.masterGain);

    oscL.start();
    oscR.start();
    brownSource.start();

    this.activeNodes.push(oscL, oscR, brownSource, binauralGain, brownGain);
    this.isPlaying = true;
    this.currentPresetId = 'sleep_restoration';
  }

  // Preset 5: Focus & Anxiety Relief (Theta 6Hz + Harmonic Chords)
  playFocusAnxietyRelief() {
    this.initContext();
    this.stopAll();

    const carrier = 250;
    const thetaBeat = 6; // 6Hz Theta wave for anxiety relief & focus

    const oscL = this.audioCtx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(carrier, this.audioCtx.currentTime);

    const oscR = this.audioCtx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(carrier + thetaBeat, this.audioCtx.currentTime);

    const merger = this.audioCtx.createChannelMerger(2);
    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);

    const gainNode = this.audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.22, this.audioCtx.currentTime);

    merger.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscL.start();
    oscR.start();

    this.activeNodes.push(oscL, oscR, gainNode);
    this.isPlaying = true;
    this.currentPresetId = 'focus_relief';
  }

  // Helper: Create Noise Buffer (White, Pink, Brown)
  createNoiseBuffer(type = 'pink') {
    const bufferSize = 2 * this.audioCtx.sampleRate;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11;
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
    }
    return buffer;
  }
}

export const audioSynthesizer = new AudioSynthesizerEngine();
