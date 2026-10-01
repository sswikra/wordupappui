import * as Speech from 'expo-speech';

export function playPronunciation(text: string, lang = 'en-US'): void {
  if (!text) return;

  try {
    Speech.stop();

    Speech.speak(text, {
      language: lang,
      pitch: 1.0,
      rate: 0.85,
    });
  } catch (err) {
    console.warn('Speech error:', err);
  }
}
