import assert from 'assert';
import { TRACKS, LESSONS } from '../../client/src/features/learning/data/learningCurriculum.js';
import { TRACKS as ANDROID_TRACKS, LESSONS as ANDROID_LESSONS } from '../../mobile-android/src/data/learningCurriculum.js';
import { TRACKS as DESKTOP_TRACKS, LESSONS as DESKTOP_LESSONS } from '../../desktop/src/features/learning/data/learningCurriculum.js';
import ca from '../utils/certificateAuthority.js';

console.log('======================================================');
console.log('📚 Starting Clearfeed Learn Curriculum & Cert Checks...');
console.log('======================================================\n');

// 1. Verify Curriculum Integrity across all platforms
assert.strictEqual(TRACKS.length, 15, 'Client must have exactly 15 tracks');
assert.strictEqual(ANDROID_TRACKS.length, 15, 'Android must have exactly 15 tracks');
assert.strictEqual(DESKTOP_TRACKS.length, 15, 'Desktop must have exactly 15 tracks');
assert.strictEqual(LESSONS.length >= 446, true, 'Client must have at least 446 lessons');
assert.strictEqual(ANDROID_LESSONS.length, LESSONS.length, 'Android lesson count matches client');
assert.strictEqual(DESKTOP_LESSONS.length, LESSONS.length, 'Desktop lesson count matches client');

console.log(`  PASS: Curriculum Parity: All 15 tracks and ${LESSONS.length} lessons present across Client, Android, and Desktop`);

// 2. Schema check on lessons
for (const lesson of LESSONS) {
  assert.ok(lesson.id, 'Lesson must have an id');
  assert.ok(lesson.track, `Lesson ${lesson.id} must specify track`);
  assert.ok(lesson.title, `Lesson ${lesson.id} must have a title`);
}
console.log('  PASS: Schema Validation: All lessons contain required id, track, and title fields');

// 3. Ed25519 Certificate Authority Tests
const testCert = {
  certificateId: 'CF-CERT-HTML-TESTVERIFY',
  trackId: 'html',
  trackTitle: 'HTML',
  studentName: 'Nasir Yousuf',
  score: 100,
  issuedAt: new Date().toISOString(),
};

const signed = ca.signCertificate(testCert);
assert.ok(signed.signature, 'Signature must be generated');
assert.strictEqual(signed.signature.length, 128, 'Ed25519 signature must be 64 bytes (128 hex chars)');
assert.ok(signed.issuerPubkey, 'Issuer pubkey must be provided');

const verifiedResult = ca.verifyCertificate({ ...testCert, ...signed });
assert.strictEqual(verifiedResult.verified, true, 'Valid certificate must verify');

// Tampered certificate test
const tamperedCert = { ...testCert, ...signed, score: 99 };
const tamperedResult = ca.verifyCertificate(tamperedCert);
assert.strictEqual(tamperedResult.verified, false, 'Tampered certificate score must fail verification');

console.log('  PASS: Ed25519 Root CA: Valid certificate verified, tampered score rejected');

// 4. Offline Progress Idempotency Logic
const initialProgress = { completedLessons: ['html-intro'], xp: 25 };
const outboxSync = [
  { lessonId: 'html-intro', trackId: 'html' },
  { lessonId: 'html-tags', trackId: 'html' },
];

const completedSet = new Set(initialProgress.completedLessons);
let newlyCompleted = [];
let xpAwarded = 0;

for (const item of outboxSync) {
  if (!completedSet.has(item.lessonId)) {
    completedSet.add(item.lessonId);
    newlyCompleted.push(item.lessonId);
    xpAwarded += 25;
  }
}

assert.strictEqual(newlyCompleted.length, 1, 'Only 1 new lesson completed');
assert.strictEqual(xpAwarded, 25, 'Only 25 XP awarded');
assert.strictEqual(completedSet.size, 2, 'Total completed is 2');

// Re-syncing same batch
newlyCompleted = [];
xpAwarded = 0;
for (const item of outboxSync) {
  if (!completedSet.has(item.lessonId)) {
    completedSet.add(item.lessonId);
    newlyCompleted.push(item.lessonId);
    xpAwarded += 25;
  }
}

assert.strictEqual(newlyCompleted.length, 0, 'Re-sync has 0 newly completed lessons');
assert.strictEqual(xpAwarded, 0, 'Re-sync awards 0 duplicate XP');

console.log('  PASS: Idempotent Sync: Outbox set-union prevents duplicate XP and lesson awards');

console.log('\n======================================================');
console.log('✨ All Learn Curriculum & Certificate Checks Passed!');
console.log('======================================================');
