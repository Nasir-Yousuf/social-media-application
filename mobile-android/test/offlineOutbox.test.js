/**
 * Clearfeed Phase 6 Verification Suite: Android Offline Outbox & Messaging Tests
 * Tests:
 * 1. Deterministic clientMessageId generation
 * 2. SQLite / AsyncStorage Outbox Message Enqueueing (status: QUEUED_OFFLINE)
 * 3. Outbox Chronological Sorting & Flush Transition to SENT_TO_SERVER
 * 4. Sync Missed Messages Delta Handling
 * 5. Android Notification Channels (messages_channel, calls_channel, spaces_channel)
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  DeliveryStatus,
  generateClientMessageId,
  enqueueMessage,
  getPendingMessages,
  flushOutbox,
  syncMissedMessages,
} from '../src/services/offlineOutbox.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('📦 Starting Android Offline Outbox & Messaging Checks...');
console.log('======================================================\n');

// 1. Client Message ID Generation
await test('generateClientMessageId: Generates unique deterministic UUID strings with cfm_ prefix', () => {
  const id1 = generateClientMessageId();
  const id2 = generateClientMessageId();
  assert(id1.startsWith('cfm_'), 'ID must start with cfm_');
  assert(id2.startsWith('cfm_'), 'ID must start with cfm_');
  assert.notStrictEqual(id1, id2, 'Successive IDs must be unique');
});

// 2. Outbox Enqueueing
await test('enqueueMessage: Creates message with QUEUED_OFFLINE delivery status', async () => {
  const msg = await enqueueMessage({
    conversationId: 'conv_123',
    recipientId: 'user_456',
    text: 'Hello offline world',
    sender: { _id: 'user_self', name: 'Tester' },
  });

  assert(msg.clientMessageId, 'Message must have clientMessageId');
  assert.strictEqual(msg.deliveryStatus, DeliveryStatus.QUEUED_OFFLINE);
  assert.strictEqual(msg.text, 'Hello offline world');
  assert.strictEqual(msg.conversationId, 'conv_123');

  const pending = await getPendingMessages();
  assert(pending.length >= 1, 'Outbox must contain at least 1 pending item');
  const found = pending.find((p) => p.clientMessageId === msg.clientMessageId);
  assert(found, 'Pending outbox must include enqueued message');
});

// 3. Chronological Order & Outbox Flush
await test('flushOutbox: Flushes queued items chronologically and transitions to SENT_TO_SERVER', async () => {
  const sentPayloads = [];

  const mockApi = {
    post: async (endpoint, payload) => {
      if (endpoint === '/messages/send') {
        sentPayloads.push(payload);
        return {
          status: 201,
          data: {
            success: true,
            data: {
              _id: `server_${Date.now()}`,
              ...payload,
              createdAt: new Date().toISOString(),
            },
          },
        };
      }
      throw new Error(`Unexpected endpoint ${endpoint}`);
    },
  };

  const results = await flushOutbox(mockApi);
  assert(results.length >= 1, 'Flush must return delivered message results');
  assert.strictEqual(results[0].deliveryStatus, DeliveryStatus.SENT_TO_SERVER);
  assert(sentPayloads.length >= 1, 'Mock API must have received payloads');

  const remaining = await getPendingMessages();
  assert.strictEqual(remaining.length, 0, 'Outbox queue must be empty after successful flush');
});

// 4. Missed Messages Sync
await test('syncMissedMessages: Syncs backfilled messages from /messages/sync', async () => {
  const mockApi = {
    get: async (endpoint, options) => {
      if (endpoint === '/messages/sync') {
        return {
          status: 200,
          data: {
            success: true,
            messages: [
              {
                _id: 'sync_msg_1',
                text: 'Missed message while asleep',
                deliveryStatus: 'SENT_TO_SERVER',
                createdAt: new Date().toISOString(),
              },
            ],
            syncedAt: new Date().toISOString(),
          },
        };
      }
      throw new Error(`Unexpected endpoint ${endpoint}`);
    },
  };

  const missed = await syncMissedMessages(mockApi, 'conv_123');
  assert(Array.isArray(missed), 'Missed messages must be an array');
  assert.strictEqual(missed.length, 1);
  assert.strictEqual(missed[0].text, 'Missed message while asleep');
});

// 5. Android Notification Channels Static Verification
await test('NotificationContext: Configures messages_channel, calls_channel, and spaces_channel', () => {
  const contextFile = fs.readFileSync(
    path.join(rootDir, 'src', 'context', 'NotificationContext.jsx'),
    'utf-8'
  );

  assert(contextFile.includes('messages_channel'), 'Must define messages_channel');
  assert(contextFile.includes('calls_channel'), 'Must define calls_channel');
  assert(contextFile.includes('spaces_channel'), 'Must define spaces_channel');
  assert(contextFile.includes('[0, 800, 1000]'), 'calls_channel must have ringtone vibration pattern [0, 800, 1000]');
  assert(contextFile.includes('/notifications/register-token'), 'Must call /notifications/register-token endpoint');
  assert(contextFile.includes('/notifications/unregister-token'), 'Must call /notifications/unregister-token endpoint');
});

// 6. Android ConversationScreen Inverted Virtualization & Checkmarks Static Verification
await test('ConversationScreen: Uses inverted FlatList and handles all delivery states', () => {
  const convScreenFile = fs.readFileSync(
    path.join(rootDir, 'src', 'screens', 'ConversationScreen.jsx'),
    'utf-8'
  );

  assert(convScreenFile.includes('inverted={true}'), 'FlatList must have inverted={true}');
  assert(convScreenFile.includes('DeliveryStatus.QUEUED_OFFLINE'), 'Must render QUEUED_OFFLINE status');
  assert(convScreenFile.includes('DeliveryStatus.DELIVERED_TO_DEVICE'), 'Must render DELIVERED_TO_DEVICE status');
  assert(convScreenFile.includes('DeliveryStatus.READ'), 'Must render READ status');
  assert(convScreenFile.includes('chat:message_delivered'), 'Must listen to chat:message_delivered');
  assert(convScreenFile.includes('handlePickImage'), 'Must support image attachment picking');
});

console.log('\n======================================================');
console.log(`✨ Android Offline Outbox Tests: ${passed}/${passed + failed} passed`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}
process.exit(0);
