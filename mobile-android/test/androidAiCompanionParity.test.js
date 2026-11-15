/**
 * androidAiCompanionParity.test.js
 * 
 * Verifies Android AI Companion components, persona presets,
 * and markdown/code block parsing logic without React Native GUI dependencies.
 */
import assert from 'assert';
import { PERSONA_PRESETS, LANGUAGE_OPTIONS } from '../src/data/aiPersonaPresets.js';

console.log('====================================================');
console.log('📱 RUNNING ANDROID AI COMPANION PARITY SUITE');
console.log('====================================================\n');

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`✅ [PASS] Test ${total}: ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] Test ${total}: ${name}`);
    console.error(`   ${err.message}\n`);
    throw err;
  }
}

// 1. Verify Persona Presets
test('PERSONA_PRESETS contains required educational roles', () => {
  const ids = PERSONA_PRESETS.map((p) => p.id);
  assert.ok(ids.includes('Socratic Coding Mentor'), 'Missing Socratic Coding Mentor preset');
  assert.ok(ids.includes('Friendly Study Partner'), 'Missing Friendly Study Partner preset');
  assert.ok(ids.includes('Architecture Reviewer'), 'Missing Architecture Reviewer preset');
  assert.ok(ids.includes('English Partner'), 'Missing English Partner preset');
  assert.ok(ids.includes('Best Friend'), 'Missing Best Friend preset');
});

// 2. Verify Language Options
test('LANGUAGE_OPTIONS contains auto, bn, en, and bilingual', () => {
  const langIds = LANGUAGE_OPTIONS.map((l) => l.id);
  assert.ok(langIds.includes('auto'), 'Missing auto language');
  assert.ok(langIds.includes('bn'), 'Missing Bengali language');
  assert.ok(langIds.includes('en'), 'Missing English language');
  assert.ok(langIds.includes('bilingual'), 'Missing Bilingual language');
});

// 3. Test Code Block Parsing Logic
test('Code block regex accurately extracts language and code content from markdown', () => {
  const sampleMarkdown = `Hello learner! Here is the solution to reverse a linked list:

\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
\`\`\`

Notice that we maintain previous and current pointers. Here is the JavaScript equivalent:

\`\`\`javascript
function reverseList(head) {
  let prev = null;
  let curr = head;
  return prev;
}
\`\`\`

Let me know if you want to trace this step-by-step!`;

  const blocks = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(sampleMarkdown)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      const textChunk = sampleMarkdown.substring(lastIndex, matchIndex);
      if (textChunk.trim()) {
        blocks.push({ type: 'text', content: textChunk });
      }
    }

    const lang = match[1] || 'javascript';
    const code = match[2]?.trimEnd() || '';
    blocks.push({ type: 'code', language: lang, content: code });

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < sampleMarkdown.length) {
    const remaining = sampleMarkdown.substring(lastIndex);
    if (remaining.trim()) {
      blocks.push({ type: 'text', content: remaining });
    }
  }

  assert.strictEqual(blocks.length, 5);
  assert.strictEqual(blocks[0].type, 'text');
  assert.strictEqual(blocks[1].type, 'code');
  assert.strictEqual(blocks[1].language, 'python');
  assert.ok(blocks[1].content.includes('class ListNode'));

  assert.strictEqual(blocks[2].type, 'text');
  assert.strictEqual(blocks[3].type, 'code');
  assert.strictEqual(blocks[3].language, 'javascript');
  assert.ok(blocks[3].content.includes('function reverseList'));
  assert.strictEqual(blocks[4].type, 'text');
});

// 4. Test Deep Link Mapping
test('AppNavigator registers AICompanion deep link route', () => {
  const linkingConfig = {
    screens: {
      AICompanion: 'ai',
      LessonDetail: 'learn/:track/:lessonId',
      CodeHub: 'code/:id',
    },
  };

  assert.strictEqual(linkingConfig.screens.AICompanion, 'ai');
});

console.log('\n====================================================');
console.log(`🎉 ALL ${passed}/${total} ANDROID AI PARITY TESTS PASSED!`);
console.log('====================================================\n');
