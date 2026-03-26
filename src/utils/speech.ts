// TTS for Thai language using Sound of Text API
// Supports local audio files for faster playback
// Can play phrases word-by-word from individual word audio files

let currentAudio: HTMLAudioElement | null = null;
let isPlayingPhrase = false;

const API_BASE = 'https://api.soundoftext.com';
const DEFAULT_WORD_PAUSE = 300;  // ms pause between words in a phrase

export function isSpeechSupported(): boolean {
  return true;
}

/**
 * Play Thai audio - uses local file if available, otherwise falls back to API
 * @param text - Thai text to speak
 * @param audioFile - Optional path to local audio file (e.g., 'words/w1-1.mp3')
 * @param rate - Speech rate (not used for local files)
 */
export async function speakThai(text: string, audioFile?: string, _rate = 0.8): Promise<void> {
  // Stop any ongoing speech
  stopSpeech();

  // If local audio file is provided, use it (instant playback)
  if (audioFile) {
    try {
      currentAudio = new Audio(`/audio/${audioFile}`);
      await currentAudio.play();
      return;
    } catch (error) {
      console.warn('Local audio file failed, falling back to API:', error);
      // Fall through to API-based synthesis
    }
  }

  // Fallback: Use Sound of Text API (slower, ~1-2 sec delay)
  try {
    // Step 1: Request sound creation
    const createResponse = await fetch(`${API_BASE}/sounds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        engine: 'Google',
        data: {
          text: text,
          voice: 'th-TH',
        },
      }),
    });

    if (!createResponse.ok) {
      throw new Error('Failed to create sound');
    }

    const { id } = await createResponse.json();

    // Step 2: Poll for completion and get URL
    let soundUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 20;

    while (!soundUrl && attempts < maxAttempts) {
      attempts++;

      const statusResponse = await fetch(`${API_BASE}/sounds/${id}`);
      const statusData = await statusResponse.json();

      if (statusData.status === 'Done') {
        soundUrl = statusData.location;
        break;
      } else if (statusData.status === 'Error') {
        throw new Error('Sound creation failed');
      }

      // Wait 200ms before next poll
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (!soundUrl) {
      throw new Error('Timeout waiting for sound');
    }

    // Step 3: Play the audio
    currentAudio = new Audio(soundUrl);
    await currentAudio.play();
  } catch (error) {
    console.warn('Sound of Text failed:', error);
    // Fallback: try Web Speech API
    fallbackToWebSpeech(text);
  }
}

/**
 * Play a phrase by playing each word's audio file sequentially
 * @param words - Array of word audio file paths (e.g., ['words/w1-1.mp3', 'words/w1-12.mp3'])
 * @param pauseBetweenWords - Pause in ms between words (default: 300ms)
 */
export async function speakThaiPhrase(
  words: string[],
  pauseBetweenWords: number = DEFAULT_WORD_PAUSE
): Promise<void> {
  stopSpeech();
  isPlayingPhrase = true;

  try {
    for (let i = 0; i < words.length; i++) {
      if (!isPlayingPhrase) {
        // Stopped by user
        break;
      }

      const audioFile = words[i];
      
      try {
        currentAudio = new Audio(`/audio/${audioFile}`);
        await currentAudio.play();
        
        // Wait for the audio to finish
        await new Promise<void>((resolve) => {
          if (currentAudio) {
            currentAudio.onended = () => resolve();
          } else {
            resolve();
          }
        });
        
        // Pause between words (except after the last word)
        if (i < words.length - 1) {
          await new Promise(resolve => setTimeout(resolve, pauseBetweenWords));
        }
      } catch (error) {
        console.warn(`Failed to play word ${i + 1}: ${audioFile}`, error);
        // Continue with next word
      }
    }
  } finally {
    isPlayingPhrase = false;
  }
}

/**
 * Stop phrase playback
 */
export function stopPhrasePlayback(): void {
  isPlayingPhrase = false;
  stopSpeech();
}

function fallbackToWebSpeech(text: string): void {
  if (!('speechSynthesis' in window)) {
    return;
  }

  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'th-TH';
  utterance.rate = 0.8;
  speechSynthesis.speak(utterance);
}

export function stopSpeech(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}
