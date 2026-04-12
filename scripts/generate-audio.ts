/**
 * Audio Generation Script for Thai TTS
 *
 * Downloads audio files for WORDS using Google Translate TTS directly.
 * (Sound of Text API is unreachable from this network.)
 *
 * Usage: npm run generate-audio
 */

import { lesson2Words } from '../src/data/lesson2/words.js';
import { lesson1Words } from '../src/data/lesson1/words.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio');

// Google Translate TTS has a ~100 char limit per request
const GOOGLE_TTS_URL = 'https://translate.google.com/translate_tts';

// Conservative rate limiting
const REQUEST_DELAY = 1500;        // 1.5s between requests
const MAX_RETRIES = 5;
const RETRY_BASE_DELAY = 3000;

interface FailedItem {
  text: string;
  filename: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Download audio from Google Translate TTS
 * Google TTS splits long text automatically, but we keep words short.
 */
async function downloadGoogleTTS(text: string): Promise<Buffer> {
  const url = `${GOOGLE_TTS_URL}?ie=UTF-8&tl=th&client=tw-ob&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://translate.google.com/',
    },
  });

  if (!response.ok) {
    throw new Error(`TTS failed: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('audio')) {
    const body = await response.text().catch(() => '');
    throw new Error(`Expected audio, got ${contentType}: ${body.substring(0, 200)}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate and save audio for a single text
 */
async function generateAudio(text: string, filename: string): Promise<boolean> {
  const subDirPath = path.join(OUTPUT_DIR, 'words');
  ensureDir(subDirPath);

  const filepath = path.join(subDirPath, filename);

  // Skip if already exists
  if (fileExists(filepath)) {
    console.log(`✓ Skip: ${filename} already exists`);
    return true;
  }

  let lastError: Error | null = null;
  for (let retry = 0; retry < MAX_RETRIES; retry++) {
    try {
      console.log(`[${retry + 1}/${MAX_RETRIES}] Generating: ${text} → ${filename}`);

      const audioBuffer = await downloadGoogleTTS(text);
      fs.writeFileSync(filepath, audioBuffer);

      console.log(`✓ Generated: ${filename}`);
      await sleep(REQUEST_DELAY);
      return true;
    } catch (error) {
      lastError = error as Error;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`✗ Attempt ${retry + 1} failed: ${errorMsg}`);

      if (retry < MAX_RETRIES - 1) {
        const waitTime = RETRY_BASE_DELAY * Math.pow(2, retry);
        await sleep(waitTime);
      }
    }
  }

  console.error(`✗ FAILED: ${filename} (${text}) - ${lastError?.message}`);
  return false;
}

/**
 * Process items with progress tracking
 */
async function processItems(
  items: Array<{ id: string; thai: string }>,
  label: string
): Promise<{ success: number; failed: number; failedItems: FailedItem[] }> {
  const stats = { success: 0, failed: 0 };
  const failedItems: FailedItem[] = [];

  console.log(`\n📚 Generating ${label} audio...`);
  console.log(`   Total: ${items.length}\n`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const filename = `${item.id}.mp3`;

    const progress = `[${i + 1}/${items.length}]`;
    process.stdout.write(`${progress} `);

    const success = await generateAudio(item.thai, filename);

    if (success) {
      stats.success++;
    } else {
      stats.failed++;
      failedItems.push({ text: item.thai, filename });
    }
  }

  return { ...stats, failedItems };
}

/**
 * Retry failed items
 */
async function retryFailed(failedItems: FailedItem[]): Promise<{ success: number; failed: FailedItem[] }> {
  if (failedItems.length === 0) {
    return { success: 0, failed: [] };
  }

  console.log(`\n🔄 Retrying ${failedItems.length} failed items...\n`);

  let successCount = 0;
  const stillFailed: FailedItem[] = [];

  for (const item of failedItems) {
    const success = await generateAudio(item.text, item.filename);
    if (success) {
      successCount++;
    } else {
      stillFailed.push(item);
    }
  }

  return { success: successCount, failed: stillFailed };
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('🎵 Thai Audio Generator (Google TTS)\n');
  console.log(`Output directory: ${OUTPUT_DIR}/words\n`);
  console.log(`Rate limit: ~40 requests/minute (${REQUEST_DELAY}ms delay)\n`);

  ensureDir(path.join(OUTPUT_DIR, 'words'));

  const allFailedItems: FailedItem[] = [];

  const lesson1Stats = await processItems(lesson1Words, 'lesson 1 words');
  allFailedItems.push(...lesson1Stats.failedItems);

  console.log(`\n✅ Lesson 1 Words: ${lesson1Stats.success}/${lesson1Words.length} generated`);

  const wordStats = await processItems(lesson2Words, 'lesson 2 words');
  allFailedItems.push(...wordStats.failedItems);

  console.log(`\n✅ Lesson 2 Words: ${wordStats.success}/${lesson2Words.length} generated`);

  if (allFailedItems.length > 0) {
    const retryResult = await retryFailed(allFailedItems);

    if (retryResult.success > 0) {
      console.log(`\n✅ Retry: ${retryResult.success} files recovered`);
    }

    if (retryResult.failed.length > 0) {
      console.log(`\n❌ Still failed: ${retryResult.failed.length} files`);
      for (const item of retryResult.failed) {
        console.log(`  - ${item.filename}: ${item.text}`);
      }
    }
  }

  const totalItems = lesson1Words.length + lesson2Words.length;
  const totalSuccess = lesson1Stats.success + wordStats.success;
  const totalFailed = allFailedItems.length;

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`  Total:    ${totalItems}`);
  console.log(`  Success:  ${totalSuccess}`);
  console.log(`  Failed:   ${totalFailed}\n`);
  console.log('='.repeat(60));

  if (totalFailed > 0) {
    console.log('\n⚠️  Some files failed to generate');
    console.log('   Run "npm run generate-audio" again to retry failed files\n');
    process.exit(1);
  }

  console.log('\n✅ All audio files generated successfully!\n');
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
