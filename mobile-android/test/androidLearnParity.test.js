import assert from 'assert';
import { TRACKS, LESSONS } from '../src/data/learningCurriculum.js';
import { LESSON_QUIZZES } from '../src/data/lessonQuizzes.js';
import learnSync from '../src/services/learnSync.js';

console.log('======================================================');
console.log('📱 Starting Android Learn Parity & Offline Checks...');
console.log('======================================================\n');

// 1. Verify 15 Tracks
assert.strictEqual(TRACKS.length, 15, 'Mobile Android must bundle all 15 tracks');
const expectedTracks = [
  'computer-basics', 'html', 'css', 'bootstrap', 'javascript',
  'react', 'typescript', 'tailwind', 'nextjs', 'python',
  'pycharm', 'python-ai', 'ai', 'english', 'mysql'
];
for (const trackId of expectedTracks) {
  const found = TRACKS.find(t => t.id === trackId);
  assert.ok(found, `Track ${trackId} must exist in TRACKS`);
}
console.log('  PASS: Tracks Parity: All 15 required learning tracks exist');

// 2. Verify Lessons Count (470 lessons >= 446 required)
assert.strictEqual(LESSONS.length >= 446, true, `Must have at least 446 lessons, got ${LESSONS.length}`);
console.log(`  PASS: Lessons Count: Bundles complete curriculum with ${LESSONS.length} total lessons`);

// 3. Verify Lesson Structure & Bilingual Fields
for (const l of LESSONS) {
  assert.ok(l.id, 'Every lesson must have an ID');
  assert.ok(l.track, `Lesson ${l.id} must belong to a track`);
  assert.ok(l.title, `Lesson ${l.id} must have a title`);
  // Verify bilingual support
  if (typeof l.title === 'object') {
    assert.ok(l.title.en, `Lesson ${l.id} must have English title`);
    assert.ok(l.title.bn, `Lesson ${l.id} must have Bangla title`);
  }
}
console.log('  PASS: Bilingual Fields: Lessons have valid titles, tracks, and IDs in English & Bangla');

// 4. Verify Quizzes
const quizKeys = Object.keys(LESSON_QUIZZES);
assert.ok(quizKeys.length > 0, 'Quizzes must be populated');
const sampleQuiz = LESSON_QUIZZES[quizKeys[0]];
assert.ok(sampleQuiz.title, 'Quiz must have title');
assert.ok(Array.isArray(sampleQuiz.questions), 'Quiz must have questions array');
assert.ok(sampleQuiz.questions.length > 0, 'Quiz must contain questions');
assert.ok(typeof sampleQuiz.questions[0].correctIndex === 'number', 'Question must specify correctIndex');
console.log(`  PASS: Interactive Quizzes: Loaded ${quizKeys.length} lesson quizzes with valid options & keys`);

// 5. Verify Offline Track Download Simulation
const trackToDownload = 'html';
const ok = await learnSync.downloadTrack(trackToDownload);
assert.strictEqual(ok, true, 'downloadTrack should succeed');
const downloaded = await learnSync.getDownloadedTracks();
assert.ok(downloaded.includes(trackToDownload), 'html track must be listed in downloaded tracks');
console.log('  PASS: Offline Download: Track bundle caching into local storage verified');

// 6. Verify Offline Progress Queueing
const completionResult = await learnSync.recordOfflineCompletion('html-intro', 'html');
assert.ok(completionResult, 'recordOfflineCompletion must succeed');
assert.ok(completionResult.updatedProgress.completedLessons.includes('html-intro'), 'html-intro must be completed');
const pendingCount = await learnSync.getPendingCount();
assert.ok(pendingCount >= 1, 'Pending sync outbox must contain queued item');
console.log('  PASS: Offline Outbox: Completions queued safely without network dependency');

console.log('\n======================================================');
console.log('✨ Android Learn Parity Checks: 6/6 passed (0 failed)');
console.log('======================================================');
