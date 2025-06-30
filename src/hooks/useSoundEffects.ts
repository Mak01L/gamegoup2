import { useCallback, useRef } from 'react';

type SoundType = 'success' | 'error' | 'click' | 'hover' | 'notification' | 'join' | 'leave';

interface SoundConfig {
  volume?: number;
  enabled?: boolean;
}

export const useSoundEffects = (config: SoundConfig = {}) => {
  const { volume = 0.3, enabled = true } = config;
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const createTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!enabled) return;

    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Sound effect failed:', error);
    }
  }, [enabled, volume, getAudioContext]);

  const playSound = useCallback((type: SoundType) => {
    if (!enabled) return;

    switch (type) {
      case 'success':
        // Happy ascending chord
        createTone(523.25, 0.2); // C5
        setTimeout(() => createTone(659.25, 0.2), 100); // E5
        setTimeout(() => createTone(783.99, 0.3), 200); // G5
        break;

      case 'error':
        // Descending error sound
        createTone(400, 0.2, 'sawtooth');
        setTimeout(() => createTone(300, 0.3, 'sawtooth'), 150);
        break;

      case 'click':
        // Quick click sound
        createTone(800, 0.1, 'square');
        break;

      case 'hover':
        // Subtle hover sound
        createTone(600, 0.05, 'sine');
        break;

      case 'notification':
        // Notification bell
        createTone(800, 0.1);
        setTimeout(() => createTone(1000, 0.1), 100);
        break;

      case 'join':
        // Welcome sound
        createTone(523.25, 0.15); // C5
        setTimeout(() => createTone(659.25, 0.15), 100); // E5
        setTimeout(() => createTone(783.99, 0.2), 200); // G5
        setTimeout(() => createTone(1046.5, 0.25), 300); // C6
        break;

      case 'leave':
        // Goodbye sound
        createTone(1046.5, 0.15); // C6
        setTimeout(() => createTone(783.99, 0.15), 100); // G5
        setTimeout(() => createTone(659.25, 0.2), 200); // E5
        setTimeout(() => createTone(523.25, 0.25), 300); // C5
        break;

      default:
        createTone(440, 0.1);
    }
  }, [enabled, createTone]);

  const playCustomTone = useCallback((frequency: number, duration: number, type?: OscillatorType) => {
    createTone(frequency, duration, type);
  }, [createTone]);

  return {
    playSound,
    playCustomTone,
    enabled
  };
};