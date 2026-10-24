require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected successfully.');

  const aiService = require('../services/aiService');
  const aiUser = await aiService.ensureAiUser();
  console.log('AI User ID:', aiUser._id.toString(), 'username:', aiUser.username, 'role:', aiUser.role);

  const User = require('../models/User');
  const Conversation = require('../models/Conversation');

  let testUser = await User.findOne({ username: 'nasir' });
  if (!testUser) {
    testUser = await User.findOne({ isApproved: true, username: { $ne: 'ai' } });
  }
  console.log('Test User:', testUser.username, testUser.name);

  // Find or create conversation
  let conv = await Conversation.findOne({
    participants: { $all: [testUser._id, aiUser._id], $size: 2 },
  });
  if (!conv) {
    conv = new Conversation({
      participants: [testUser._id, aiUser._id],
      customAiSettings: {
        customName: 'Maya',
        relationship: 'girlfriend',
        languagePref: 'bangla',
      },
    });
    await conv.save();
  } else {
    conv.customAiSettings = {
      customName: 'Maya',
      relationship: 'girlfriend',
      languagePref: 'bangla',
    };
    await conv.save();
  }
  console.log('Conversation ready with customAiSettings:', conv.customAiSettings);

  // 1. Test 1-on-1 Chat Reply
  console.log('\n--- TEST 1: Direct Chat Reply (Bengali girlfriend persona) ---');
  const chatReply = await aiService.generateDirectChatReply({
    user: testUser,
    conversation: conv,
    recentMessages: [],
    userMessage: 'হাই মায়া, আজকের দিনটা কেমন কাটলো তোমার?',
  });
  console.log('AI Reply:\n', chatReply);

  // 2. Test Learn & Practice Mentor Reply
  console.log('\n--- TEST 2: Learn & Practice Lesson Q&A Mentor (Patient classmate persona) ---');
  const mentorReply = await aiService.generateLessonHelpReply({
    question: {
      title: 'JavaScript এ map আর forEach এর মধ্যে পার্থক্য কী?',
      description: 'আমি বুঝতে পারছি না কখন map ব্যবহার করব আর কখন forEach ব্যবহার করব। সহজভাবে বুঝিয়ে দিন।',
      track: 'javascript',
      lessonId: 'js-array-methods',
    },
    user: testUser,
    languagePref: 'both',
  });
  console.log('Mentor Reply:\n', mentorReply);

  await mongoose.disconnect();
  console.log('\nAll tests passed successfully!');
}

test().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
