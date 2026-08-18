import * as Speech from 'expo-speech';

/**
 * Text-to-Speech utility for pronunciation on mobile devices using expo-speech
 */
export function playPronunciation(text: string, lang = 'en-US'): void {
  if (!text) return;

  try {
    // Stop any ongoing speech
    Speech.stop();

    Speech.speak(text, {
      language: lang,
      pitch: 1.0,
      rate: 0.85, // Slightly slower for clear vocabulary learning
    });
  } catch (err) {
    console.warn('Speech error:', err);
  }
}
