/**
 * Audio Generation Script for Thai TTS
 * 
 * Downloads audio files for WORDS only from Sound of Text API.
 * Phrases are played by combining individual word audio files.
 * 
 * Usage: npm run generate-audio
 * 
 * API Limits (Sound of Text):
 * - ~10-15 requests per minute recommended
 * - Each request requires polling for completion
 * - Google TTS backend may have additional throttling
 */

import { lesson2Words } from '../src/data/lesson2/words.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_BASE = 'https://api.soundoftext.com';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio');

// Conservative rate limiting to avoid API throttling
const REQUEST_DELAY = 4000;        // 4 seconds between new requests (15 per minute max)
const POLL_INTERVAL = 800;         // 800ms between status polls
const MAX_POLL_ATTEMPTS = 50;      // Up to 40 seconds waiting for completion
const MAX_RETRIES = 5;             // More retries for transient failures
const RETRY_BASE_DELAY = 3000;     // Base delay for exponential backoff

// Track failed items for retry
interface FailedItem {
  text: string;
  filename: string;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create directory if it doesn't exist
 */
function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Check if file already exists
 */
function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Request audio generation from Sound of Text API
 * Handles rate limiting (HTTP 429)
 */
async function requestSound(text: string): Promise<string> {
  console.log(`  → POST ${API_BASE}/sounds (text="${text}")`);
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/sounds`, {
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
  } catch (err) {
    console.error(`  → Network error: ${err instanceof Error ? err.message : err}`);
    console.error(`  → Cause: ${(err as Error & { cause?: unknown })?.cause ?? 'unknown'}`);
    throw err;
  }

  console.log(`  ← Response status: ${response.status}`);

  if (response.status === 429) {
    throw new Error('Rate limit exceeded (429)');
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Failed to create sound: ${response.status} ${response.statusText} — ${body}`);
  }

  const data = await response.json();
  console.log(`  ← Got id: ${data.id}`);
  return data.id;
}

/**
 * Poll for sound generation completion
 * Handles temporary failures and rate limiting
 */
async function waitForSound(id: string, text: string): Promise<string> {
  let soundUrl: string | null = null;

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    try {
      const statusResponse = await fetch(`${API_BASE}/sounds/${id}`);
      
      if (statusResponse.status === 429) {
        // Rate limited - wait longer before next poll
        await sleep(POLL_INTERVAL * 2);
        continue;
      }

      if (!statusResponse.ok) {
        console.warn(`Status check failed: ${statusResponse.status}, retrying...`);
        await sleep(POLL_INTERVAL);
        continue;
      }

      const statusData = await statusResponse.json();

      if (statusData.status === 'Done') {
        soundUrl = statusData.location;
        break;
      } else if (statusData.status === 'Error') {
        throw new Error(`Sound generation failed: ${statusData.error || 'unknown error'}`);
      } else if (statusData.status === 'Processing' || statusData.status === 'Pending') {
        // Still processing - continue polling
        await sleep(POLL_INTERVAL);
      } else {
        // Unknown status - wait and retry
        await sleep(POLL_INTERVAL);
      }
    } catch (error) {
      // Network error - retry
      console.warn(`Poll attempt ${attempt + 1} failed: ${error instanceof Error ? error.message : error}`);
      await sleep(POLL_INTERVAL);
    }
  }

  if (!soundUrl) {
    throw new Error(`Timeout after ${MAX_POLL_ATTEMPTS} polls for: ${text}`);
  }

  return soundUrl;
}

/**
 * Download audio file from URL
 */
async function downloadAudio(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate and save audio for a single text
 * Returns true on success, false on failure
 */
async function generateAudio(
  text: string,
  filename: string
): Promise<boolean> {
  const subDirPath = path.join(OUTPUT_DIR, 'words');
  ensureDir(subDirPath);

  const filepath = path.join(subDirPath, filename);

  // Skip if already exists
  if (fileExists(filepath)) {
    console.log(`✓ Skip: ${filename} already exists`);
    return true;
  }

  // Retry logic with exponential backoff
  let lastError: Error | null = null;
  for (let retry = 0; retry < MAX_RETRIES; retry++) {
    try {
      console.log(`[${retry + 1}/${MAX_RETRIES}] Generating: ${text} → ${filename}`);

      // Step 1: Request sound creation (with rate limit handling)
      let id: string;
      try {
        id = await requestSound(text);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (errorMsg.includes('429') || errorMsg.includes('Rate limit')) {
          // Rate limited - wait longer before retry
          const waitTime = RETRY_BASE_DELAY * Math.pow(2, retry);
          console.warn(`⏱ Rate limited, waiting ${waitTime}ms before retry...`);
          await sleep(waitTime);
          continue;
        }
        throw error;
      }

      // Step 2: Wait for completion (with polling)
      const soundUrl = await waitForSound(id, text);

      // Step 3: Download and save
      const audioBuffer = await downloadAudio(soundUrl);
      fs.writeFileSync(filepath, audioBuffer);

      console.log(`✓ Generated: ${filename}`);

      // Rate limiting between successful requests
      await sleep(REQUEST_DELAY);

      return true;
    } catch (error) {
      lastError = error as Error;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`✗ Attempt ${retry + 1} failed: ${errorMsg}`);
      
      if (retry < MAX_RETRIES - 1) {
        // Exponential backoff: 3s, 6s, 12s, 24s...
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
    
    // Progress indicator
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
 * Main function to generate all audio files
 */
async function main(): Promise<void> {
  console.log('🎵 Thai Audio Generator (Words Only)\n');
  console.log(`Output directory: ${OUTPUT_DIR}/words\n`);
  console.log(`Rate limit: ~15 requests/minute (${REQUEST_DELAY}ms delay)\n`);
  console.log(`💡 Phrases will be played by combining individual word audio files\n`);

  ensureDir(path.join(OUTPUT_DIR, 'words'));

  const allFailedItems: FailedItem[] = [];

  // Generate word audio only
  const wordStats = await processItems(lesson2Words, 'words');
  allFailedItems.push(...wordStats.failedItems);

  console.log(`\n✅ Words: ${wordStats.success}/${lesson2Words.length} generated`);

  // Retry failed items
  if (allFailedItems.length > 0) {
    const retryResult = await retryFailed(allFailedItems);
    
    if (retryResult.success > 0) {
      console.log(`\n✅ Retry: ${retryResult.success} files recovered`);
    }
    
    if (retryResult.failed.length > 0) {
      console.log(`\n❌ Still failed: ${retryResult.failed.length} files`);
      console.log('\nFailed items:');
      for (const item of retryResult.failed) {
        console.log(`  - ${item.filename}: ${item.text}`);
      }
    }
  }

  // Summary
  const totalItems = lesson2Words.length;
  const totalSuccess = wordStats.success;
  const totalFailed = allFailedItems.length;

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`  Total:    ${totalItems}`);
  console.log(`  Success:  ${totalSuccess}`);
  console.log(`  Failed:   ${totalFailed}`);
  console.log(`  Time est: ~${Math.ceil(totalItems / 15)} minutes\n`);
  console.log('='.repeat(60));

  if (totalFailed > 0) {
    console.log('\n⚠️  Some files failed to generate');
    console.log('   Run "npm run generate-audio" again to retry failed files\n');
    process.exit(1);
  }

  console.log('\n✅ All audio files generated successfully!\n');
}

// Run the script
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
