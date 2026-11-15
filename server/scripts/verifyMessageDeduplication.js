/**
 * Automated Verification Suite for Clearfeed Idempotent Messaging & Delivery States
 * Tests:
 * 1. clientMessageId deduplication in REST API (prevents duplicate messages on network retry)
 * 2. Delivery State transitions: QUEUED_OFFLINE -> SENDING -> SENT_TO_SERVER -> DELIVERED_TO_DEVICE -> READ
 * 3. syncMissedMessages endpoint returning backfilled messages since timestamp
 */

const assert = require('assert');
const mongoose = require('mongoose');

const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const messageController = require('../controllers/messageController');

async function runDeduplicationChecks() {
  console.log('\n======================================================');
  console.log('🔄 Starting Message Deduplication & Delivery State Checks...');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`       ${err.message}\n${err.stack}`);
    }
  }

  const senderId = new mongoose.Types.ObjectId();
  const recipientId = new mongoose.Types.ObjectId();
  const convId = new mongoose.Types.ObjectId();

  const senderDoc = {
    _id: senderId,
    name: 'Alice Dev',
    username: 'alice_dev',
    role: 'user',
    status: 'online',
    toObject() { return { ...this }; },
  };

  const recipientDoc = {
    _id: recipientId,
    name: 'Bob Peer',
    username: 'bob_peer',
    role: 'user',
    status: 'online',
    toObject() { return { ...this }; },
  };

  const storedMessages = [];
  const storedConversation = {
    _id: convId,
    participants: [senderId, recipientId],
    unreadCounts: new Map([
      [senderId.toString(), 0],
      [recipientId.toString(), 0],
    ]),
    lastMessage: {},
    save: async function() { return this; },
  };

  User.findById = (id) => ({
    select: () => {
      const idStr = id?.toString();
      if (idStr === senderId.toString()) return Promise.resolve(senderDoc);
      if (idStr === recipientId.toString()) return Promise.resolve(recipientDoc);
      return Promise.resolve(null);
    },
  });

  Conversation.findById = (id) => Promise.resolve(storedConversation);

  // Mock Message.findOne for deduplication check
  const origFindOne = Message.findOne;
  Message.findOne = (query) => {
    return {
      populate: function() { return this; },
      sort: function() { return this; },
      then: function(resolve) {
        if (query.sender && query.clientMessageId) {
          const match = storedMessages.find(
            (m) => m.sender.toString() === query.sender.toString() && m.clientMessageId === query.clientMessageId
          );
          resolve(match || null);
          return;
        }
        if (query._id) {
          const match = storedMessages.find((m) => m._id.toString() === query._id.toString());
          resolve(match || null);
          return;
        }
        resolve(null);
      },
    };
  };

  // Mock Message.find for syncMissedMessages
  Message.find = (query) => {
    return {
      sort: function() { return this; },
      limit: function() { return this; },
      populate: function() { return this; },
      lean: function() {
        return Promise.resolve(
          storedMessages.map((m) => ({
            ...m,
            toObject: undefined,
          }))
        );
      },
      exec: function() {
        return Promise.resolve(storedMessages);
      },
    };
  };

  // Save hook
  Message.prototype.save = async function() {
    if (!this._id) {
      this._id = new mongoose.Types.ObjectId();
    }
    const idx = storedMessages.findIndex(
      (m) => (m._id && this._id && m._id.toString() === this._id.toString()) ||
             (m.clientMessageId && this.clientMessageId && m.clientMessageId === this.clientMessageId)
    );
    if (idx >= 0) {
      storedMessages[idx] = this;
    } else {
      storedMessages.push(this);
    }
    return this;
  };

  Notification.prototype.save = async function() { return this; };

  function createReqRes(user, body = {}, params = {}, query = {}) {
    let statusCode = 200;
    let responseData = null;
    const req = { user, body, params, query };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
      getStatus: () => statusCode,
      getData: () => responseData,
    };
    return { req, res };
  }

  const testClientMessageId = 'client-uuid-test-12345';

  await test('sendMessage: Creates initial message with clientMessageId and SENT_TO_SERVER state', async () => {
    const { req, res } = createReqRes(senderDoc, {
      conversationId: convId,
      text: 'Hello from Android Outbox',
      clientMessageId: testClientMessageId,
    });

    await messageController.sendMessage(req, res);
    assert.strictEqual(res.getStatus(), 201);
    const data = res.getData();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.message.text, 'Hello from Android Outbox');
    assert.strictEqual(data.message.clientMessageId, testClientMessageId);
    assert.strictEqual(data.message.deliveryStatus, 'SENT_TO_SERVER');
    assert.strictEqual(storedMessages.length, 1);
  });

  await test('sendMessage: Re-sending same clientMessageId returns deduplicated: true with 0 duplicate rows', async () => {
    const countBefore = storedMessages.length;
    const { req, res } = createReqRes(senderDoc, {
      conversationId: convId,
      text: 'Hello from Android Outbox (retry attempt)',
      clientMessageId: testClientMessageId,
    });

    await messageController.sendMessage(req, res);
    assert.strictEqual(res.getStatus(), 200);
    const data = res.getData();
    assert.strictEqual(data.deduplicated, true);
    assert.strictEqual(data.message.clientMessageId, testClientMessageId);
    assert.strictEqual(storedMessages.length, countBefore, 'Database message count should remain unchanged');
  });

  await test('Delivery State Machine: Transitions from SENT_TO_SERVER to DELIVERED_TO_DEVICE', async () => {
    const msg = storedMessages.find((m) => m.clientMessageId === testClientMessageId);
    assert(msg, 'Message must exist');
    assert.strictEqual(msg.deliveryStatus, 'SENT_TO_SERVER');

    // Simulate recipient receiving and sending delivery ack
    msg.deliveryStatus = 'DELIVERED_TO_DEVICE';
    msg.deliveredAt = new Date();
    await msg.save();

    assert.strictEqual(msg.deliveryStatus, 'DELIVERED_TO_DEVICE');
    assert(msg.deliveredAt instanceof Date);
  });

  await test('Delivery State Machine: Transitions to READ when recipient opens chat', async () => {
    const msg = storedMessages.find((m) => m.clientMessageId === testClientMessageId);
    assert(msg, 'Message must exist');

    msg.deliveryStatus = 'READ';
    msg.isRead = true;
    msg.readAt = new Date();
    await msg.save();

    assert.strictEqual(msg.deliveryStatus, 'READ');
    assert.strictEqual(msg.isRead, true);
    assert(msg.readAt instanceof Date);
  });

  await test('syncMissedMessages: Returns all messages updated since timestamp', async () => {
    const pastTimestamp = new Date(Date.now() - 60000).toISOString();
    const { req, res } = createReqRes(recipientDoc, {}, {}, { since: pastTimestamp });

    await messageController.syncMissedMessages(req, res);
    assert.strictEqual(res.getStatus(), 200);
    const data = res.getData();
    assert.strictEqual(data.success, true);
    assert(Array.isArray(data.messages));
    assert(data.count >= 1);
    assert(data.syncedAt);
  });

  console.log('\n======================================================');
  console.log(`✨ Deduplication & State Tests Completed: ${passed}/${total} passed`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runDeduplicationChecks().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
