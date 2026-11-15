/**
 * Clearfeed AI Guardrails & Abuse Prevention Engine
 * 
 * Protects Google Gemini AI proxies, @ai comment mentions, and Classroom Mentor
 * endpoints against prompt-injection attacks, system prompt leaks, spam floods,
 * and abusive payloads.
 */

// Known prompt injection / jailbreak patterns
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /forget\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /system\s+prompt\s+override/i,
  /override\s+system\s+prompt/i,
  /you\s+are\s+now\s+(DAN|unfiltered|jailbroken|developer mode)/i,
  /act\s+as\s+(DAN|an\s+unfiltered\s+AI|a\s+hacker)/i,
  /reveal\s+(your\s+)?(system\s+prompt|initial\s+instructions)/i,
  /what\s+(is|are)\s+your\s+(system\s+prompt|hidden\s+instructions)/i,
  /print\s+your\s+(entire\s+)?(prompt|system\s+instruction)/i,
  /output\s+everything\s+above/i,
  /repeat\s+(the\s+)?text\s+above/i,
  /bypass\s+all\s+(filters|rules|guardrails|safety)/i,
  /disable\s+safety\s+filters/i,
  /drop\s+table\s+/i,
  /rm\s+-rf\s+/i,
];

// In-memory per-user rate limit bucket for @ai mentions (20 requests / 15 minutes)
const mentionBuckets = new Map();
const MENTION_LIMIT = 20;
const MENTION_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Checks if a user has exceeded their @ai mention budget
 * @param {string} userId - User ID string
 * @returns {{ allowed: boolean, remaining: number, resetInSeconds: number }}
 */
function checkAiMentionRateLimit(userId) {
  if (!userId) return { allowed: true, remaining: MENTION_LIMIT, resetInSeconds: 0 };

  const now = Date.now();
  let bucket = mentionBuckets.get(userId);

  if (!bucket || now - bucket.windowStart > MENTION_WINDOW_MS) {
    bucket = { windowStart: now, count: 0 };
    mentionBuckets.set(userId, bucket);
  }

  bucket.count += 1;
  const remaining = Math.max(0, MENTION_LIMIT - bucket.count);
  const resetInSeconds = Math.ceil((bucket.windowStart + MENTION_WINDOW_MS - now) / 1000);

  if (bucket.count > MENTION_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  return {
    allowed: true,
    remaining,
    resetInSeconds,
  };
}

/**
 * Validates text against prompt injection attacks
 * @param {string} text - User prompt or message
 * @returns {{ isSafe: boolean, matchedPattern?: string, safeFallback?: string }}
 */
function inspectPromptSafety(text) {
  if (!text || typeof text !== 'string') {
    return { isSafe: true };
  }

  const trimmed = text.trim();

  // Excessive length check
  if (trimmed.length > 12000) {
    return {
      isSafe: false,
      matchedPattern: 'EXCESSIVE_LENGTH',
      safeFallback: 'The provided prompt is too long. Please keep your question or code under 10,000 characters.',
    };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      const isBengali = /[\u0980-\u09FF]/.test(trimmed);
      return {
        isSafe: false,
        matchedPattern: pattern.toString(),
        safeFallback: isBengali
          ? '⚠️ আমি একজন দায়িত্বশীল স্টাডি মেন্টর। নিরাপত্তা ও শিখন নীতিমালার কারণে এই ধরনের প্রম্পটে সাড়া দেওয়া সম্ভব নয়। আপনার প্রোগ্রামিং বা পাঠ্যক্রম সংক্রান্ত কোনো প্রশ্ন থাকলে বলুন, আমি সানন্দে সাহায্য করব!'
          : '⚠️ I am an educational study mentor and companion. For safety and pedagogical reasons, I cannot bypass system guidelines or reveal internal instructions. Please feel free to ask any programming or learning question!',
      };
    }
  }

  return { isSafe: true };
}

/**
 * Sanitizes user prompt by trimming and disarming control characters
 * @param {string} text 
 * @returns {string}
 */
function sanitizeAiInput(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '') // remove invisible ASCII control chars
    .trim();
}

module.exports = {
  checkAiMentionRateLimit,
  inspectPromptSafety,
  sanitizeAiInput,
  MENTION_LIMIT,
  MENTION_WINDOW_MS,
};
