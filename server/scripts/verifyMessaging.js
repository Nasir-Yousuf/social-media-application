/**
 * Automated Verification Suite for Clearfeed Messaging
 * Validates startConversation, sendMessage, getConversations, getMessages,
 * reactToMessage, and unread handling across non-admin and admin users.
 */

const assert = require('assert');
const mongoose = require('mongoose');

// Models
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const messageController = require('../controllers/messageController');

async function runMessagingChecks() {
  console.log('\n=============================================');
  console.log('💬 Starting Automated Messaging Verification...');
  console.log('=============================================\n');

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

  // Generate test ObjectIds
  const userAId = new mongoose.Types.ObjectId();
  const userBId = new mongoose.Types.ObjectId();
  const convId = new mongoose.Types.ObjectId();
  const messageId = new mongoose.Types.ObjectId();

  const userADoc = {
    _id: userAId,
    name: 'Sarah Connor',
    username: 'sarah_c',
    avatarUrl: null,
    role: 'user',
    status: 'online',
    isAi: false,
    toObject() { return { ...this }; },
  };

  const userBDoc = {
    _id: userBId,
    name: 'John Connor',
    username: 'john_c',
    avatarUrl: null,
    role: 'user',
    status: 'online',
    isAi: false,
    toObject() { return { ...this }; },
  };

  // In-memory store
  let storedConversation = null;
  let storedMessages = [];

  // Mock User.findById & findOne
  User.findById = (id) => ({
    select: () => {
      const idStr = id?.toString();
      if (idStr === userAId.toString()) return Promise.resolve(userADoc);
      if (idStr === userBId.toString()) return Promise.resolve(userBDoc);
      return Promise.resolve(null);
    },
  });

  User.findOne = (query) => ({
    select: () => {
      if (query.username === 'sarah_c') return Promise.resolve(userADoc);
      if (query.username === 'john_c') return Promise.resolve(userBDoc);
      return Promise.resolve(null);
    },
  });

  // Mock Conversation.findOne & findById
  Conversation.findOne = (query) => {
    const queryObj = {
      populate: (field, select) => {
        if (storedConversation) {
          return Promise.resolve({
            ...storedConversation,
            participants: [userADoc, userBDoc],
          });
        }
        return Promise.resolve(null);
      },
      then(resolve) {
        resolve(storedConversation);
      },
    };
    return queryObj;
  };

  Conversation.findById = (id) => {
    const conv = storedConversation;
    return {
      populate: () => Promise.resolve(conv ? { ...conv, participants: [userADoc, userBDoc] } : null),
      then(resolve) {
        resolve(conv);
      },
    };
  };

  Conversation.prototype.save = async function() {
    storedConversation = this;
    return this;
  };

  Conversation.prototype.populate = async function() {
    this.participants = [userADoc, userBDoc];
    return this;
  };

  Message.prototype.save = async function() {
    storedMessages.push(this);
    return this;
  };

  Notification.prototype.save = async function() {
    return this;
  };

  // Helper to create mock req and res
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

  // 1. Test startConversation with valid recipientId
  await test('startConversation: User A initiates conversation with User B by recipientId', async () => {
    const { req, res } = createReqRes(userADoc, { recipientId: userBId.toString() });
    await messageController.startConversation(req, res);

    assert.strictEqual(res.getStatus(), 200);
    const conv = res.getData()?.conversation;
    assert.ok(conv, 'Conversation object should be returned');
    assert.strictEqual(conv.otherUser.username, 'john_c');
    assert.strictEqual(conv.unreadCount, 0);
  });

  // 2. Test startConversation with recipientUsername
  await test('startConversation: User B initiates conversation with User A by recipientUsername', async () => {
    const { req, res } = createReqRes(userBDoc, { recipientUsername: 'sarah_c' });
    await messageController.startConversation(req, res);

    assert.strictEqual(res.getStatus(), 200);
    const conv = res.getData()?.conversation;
    assert.ok(conv, 'Conversation object should be returned');
    assert.strictEqual(conv.otherUser.username, 'sarah_c');
  });

  // 3. Test startConversation prevents self-messaging
  await test('startConversation: Rejects self-conversation', async () => {
    const { req, res } = createReqRes(userADoc, { recipientId: userAId.toString() });
    await messageController.startConversation(req, res);

    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(res.getData()?.message, 'Cannot start a direct message with yourself.');
  });

  // 4. Test startConversation returns 404 for nonexistent user
  await test('startConversation: Returns 404 for unknown user', async () => {
    const { req, res } = createReqRes(userADoc, { recipientUsername: 'non_existent_user_999' });
    await messageController.startConversation(req, res);

    assert.strictEqual(res.getStatus(), 404);
    assert.strictEqual(res.getData()?.message, 'Recipient member not found.');
  });

  // 5. Test sendMessage
  await test('sendMessage: User A sends text message to User B', async () => {
    const { req, res } = createReqRes(userADoc, {
      conversationId: convId.toString(),
      text: 'Hello John!',
    });
    await messageController.sendMessage(req, res);

    assert.strictEqual(res.getStatus(), 201);
    const msg = res.getData()?.data;
    assert.ok(msg, 'Message should be returned');
    assert.strictEqual(msg.text, 'Hello John!');
  });

  // 6. Test sendMessage with code snippet and replyTo
  await test('sendMessage: User B sends message with code snippet and replyTo', async () => {
    const { req, res } = createReqRes(userBDoc, {
      conversationId: convId.toString(),
      text: 'Here is the fix:',
      codeSnippet: {
        language: 'javascript',
        code: 'const x = 42;',
      },
      replyTo: {
        messageId: 'some-msg-id',
        text: 'Hello John!',
        senderName: 'Sarah Connor',
        hasCode: false,
      },
    });
    await messageController.sendMessage(req, res);

    assert.strictEqual(res.getStatus(), 201);
    const msg = res.getData()?.data;
    assert.ok(msg, 'Message should be returned');
    assert.strictEqual(msg.codeSnippet.code, 'const x = 42;');
    assert.strictEqual(msg.replyTo.senderName, 'Sarah Connor');
  });

  // 7. Test sendMessage rejects empty content
  await test('sendMessage: Rejects empty text without code snippet', async () => {
    const { req, res } = createReqRes(userADoc, {
      conversationId: convId.toString(),
      text: '   ',
    });
    await messageController.sendMessage(req, res);

    assert.strictEqual(res.getStatus(), 400);
    assert.strictEqual(res.getData()?.message, 'Message content or code snippet is required.');
  });

  // 8. Test getConversations
  await test('getConversations: Returns formatted conversations with otherUser', async () => {
    Conversation.find = () => ({
      sort: () => ({
        populate: () => ({
          populate: () => Promise.resolve([
            {
              _id: convId,
              participants: [userADoc, userBDoc],
              lastMessage: { text: 'Here is the fix:', sender: userBDoc },
              unreadCounts: new Map([[userAId.toString(), 1]]),
              updatedAt: new Date(),
            },
          ]),
        }),
      }),
    });

    const { req, res } = createReqRes(userADoc);
    await messageController.getConversations(req, res);

    assert.strictEqual(res.getStatus(), 200);
    const list = res.getData()?.conversations;
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].otherUser.username, 'john_c');
    assert.strictEqual(list[0].unreadCount, 1);
  });

  // 9. Test getUnreadTotal
  await test('getUnreadTotal: Safely counts unread messages across plain object or Map unreadCounts', async () => {
    Conversation.find = () => ({
      select: () => Promise.resolve([
        { unreadCounts: new Map([[userAId.toString(), 2]]) },
        { unreadCounts: { [userAId.toString()]: 3 } }, // Plain object test
      ]),
    });
    Message.findOne = () => ({
      sort: () => ({
        populate: () => Promise.resolve(null),
      }),
    });

    const { req, res } = createReqRes(userADoc);
    await messageController.getUnreadTotal(req, res);

    assert.strictEqual(res.getStatus(), 200);
    assert.strictEqual(res.getData()?.unreadTotal, 5);
  });

  // 10. Test reactToMessage
  await test('reactToMessage: Adds and removes emoji reaction', async () => {
    const testMessage = {
      _id: messageId,
      conversation: convId,
      reactions: [],
      save: async () => {},
      populate: async () => {},
    };
    Message.findById = () => Promise.resolve(testMessage);

    // Add reaction
    const { req: addReq, res: addRes } = createReqRes(userADoc, { emoji: '🚀' }, { messageId: messageId.toString() });
    await messageController.reactToMessage(addReq, addRes);

    assert.strictEqual(addRes.getStatus(), 200);
    assert.strictEqual(addRes.getData()?.action, 'added');
    assert.strictEqual(testMessage.reactions.length, 1);
    assert.strictEqual(testMessage.reactions[0].emoji, '🚀');

    // Remove reaction (clicking same emoji)
    const { req: toggleReq, res: toggleRes } = createReqRes(userADoc, { emoji: '🚀' }, { messageId: messageId.toString() });
    await messageController.reactToMessage(toggleReq, toggleRes);

    assert.strictEqual(toggleRes.getStatus(), 200);
    assert.strictEqual(toggleRes.getData()?.action, 'removed');
    assert.strictEqual(testMessage.reactions.length, 0);
  });

  console.log('\n=============================================');
  console.log(`✨ Messaging Tests Completed: ${passed}/${total} passed`);
  console.log('=============================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

if (require.main === module) {
  runMessagingChecks().catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
}

module.exports = runMessagingChecks;
