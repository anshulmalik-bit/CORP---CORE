import { useCallback, useRef, useEffect } from 'react';

type SoundType = 
  | 'click' 
  | 'hover' 
  | 'error' 
  | 'success' 
  | 'glitch' 
  | 'scan' 
  | 'boot' 
  | 'alert'
  | 'typing'
  | 'stamp';

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function createOscillatorSound(
  frequency: number, 
  type: OscillatorType, 
  duration: number, 
  volume: number = 0.1,
  frequencyEnd?: number
) {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  if (frequencyEnd) {
    oscillator.frequency.exponentialRampToValueAtTime(frequencyEnd, audioContext.currentTime + duration);
  }
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

function createNoiseSound(duration: number, volume: number = 0.05) {
  if (!audioContext) return;
  
  const bufferSize = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  
  source.buffer = buffer;
  filter.type = 'lowpass';
  filter.frequency.value = 1000;
  
  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  
  source.start();
}

const soundEffects: Record<SoundType, () => void> = {
  click: () => {
    createOscillatorSound(800, 'square', 0.05, 0.08);
    setTimeout(() => createOscillatorSound(600, 'square', 0.03, 0.05), 30);
  },
  hover: () => {
    createOscillatorSound(400, 'sine', 0.08, 0.03);
  },
  error: () => {
    createOscillatorSound(200, 'sawtooth', 0.15, 0.1);
    setTimeout(() => createOscillatorSound(150, 'sawtooth', 0.2, 0.08), 100);
  },
  success: () => {
    createOscillatorSound(523, 'sine', 0.1, 0.08);
    setTimeout(() => createOscillatorSound(659, 'sine', 0.1, 0.08), 80);
    setTimeout(() => createOscillatorSound(784, 'sine', 0.15, 0.1), 160);
  },
  glitch: () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createOscillatorSound(
          Math.random() * 500 + 100, 
          'square', 
          0.03 + Math.random() * 0.05, 
          0.05
        );
      }, i * 30);
    }
    createNoiseSound(0.15, 0.03);
  },
  scan: () => {
    createOscillatorSound(200, 'sine', 0.8, 0.05, 800);
    createNoiseSound(0.1, 0.02);
  },
  boot: () => {
    createOscillatorSound(100, 'sine', 0.3, 0.08, 400);
    setTimeout(() => createOscillatorSound(400, 'sine', 0.2, 0.06, 800), 200);
    setTimeout(() => createOscillatorSound(800, 'square', 0.1, 0.04), 400);
    setTimeout(() => createNoiseSound(0.1, 0.02), 300);
  },
  alert: () => {
    createOscillatorSound(880, 'square', 0.1, 0.1);
    setTimeout(() => createOscillatorSound(880, 'square', 0.1, 0.1), 150);
    setTimeout(() => createOscillatorSound(880, 'square', 0.15, 0.12), 300);
  },
  typing: () => {
    createOscillatorSound(300 + Math.random() * 200, 'square', 0.02, 0.03);
  },
  stamp: () => {
    createNoiseSound(0.2, 0.15);
    createOscillatorSound(100, 'sine', 0.3, 0.1, 50);
  }
};

export function useSound() {
  const enabled = useRef(true);
  
  useEffect(() => {
    const handleInteraction = () => {
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
      }
    };
    
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  const play = useCallback((sound: SoundType) => {
    if (!enabled.current) return;
    try {
      soundEffects[sound]();
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }, []);

  const toggle = useCallback(() => {
    enabled.current = !enabled.current;
    return enabled.current;
  }, []);

  return { play, toggle, isEnabled: () => enabled.current };
}

export function playSound(sound: SoundType) {
  try {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    soundEffects[sound]();
  } catch (e) {
    console.warn('Sound playback failed:', e);
  }
}
