/**
 * Clearfeed AI Companion & Classroom Mentor Controller
 * 
 * Manages:
 * - AIPersonaConfig persistence per user
 * - Multi-thread AIConversation history
 * - Streaming (SSE) and JSON responses for Chat, Classroom Mentor, and Code Explanation
 * - Rate limiting and prompt injection security
 */

const AIConversation = require('../models/AIConversation');
const AIPersonaConfig = require('../models/AIPersonaConfig');
const aiService = require('../services/aiService');
const { inspectPromptSafety, sanitizeAiInput } = require('../utils/aiGuardrails');

/**
 * Helper to get or fallback to user's saved AIPersonaConfig
 */
async function getUserPersona(userId) {
  if (!userId) {
    return {
      customName: 'Clearfeed AI',
      rolePersona: 'Socratic Coding Mentor',
      preferredLanguage: 'auto',
      systemInstructions: '',
      temperature: 0.85,
    };
  }

  const saved = await AIPersonaConfig.findOne({ user: userId });
  if (saved) return saved.toObject();

  return {
    customName: 'Clearfeed AI',
    rolePersona: 'Socratic Coding Mentor',
    preferredLanguage: 'auto',
    systemInstructions: '',
    temperature: 0.85,
  };
}

/**
 * GET /api/ai/persona
 */
exports.getPersonaConfig = async (req, res) => {
  try {
    const persona = await getUserPersona(req.user._id);
    return res.status(200).json({ success: true, persona });
  } catch (err) {
    console.error('getPersonaConfig error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve AI persona.' });
  }
};

/**
 * PUT /api/ai/persona
 */
exports.updatePersonaConfig = async (req, res) => {
  try {
    const { customName, rolePersona, systemInstructions, preferredLanguage, temperature } = req.body;

    const safety = inspectPromptSafety(systemInstructions || '');
    if (!safety.isSafe) {
      return res.status(400).json({
        success: false,
        message: 'System instructions contained prohibited safety override patterns.',
      });
    }

    const updated = await AIPersonaConfig.findOneAndUpdate(
      { user: req.user._id },
      {
        customName: (customName || 'Clearfeed AI').trim().slice(0, 60),
        rolePersona: (rolePersona || 'Socratic Coding Mentor').trim().slice(0, 80),
        systemInstructions: (systemInstructions || '').trim().slice(0, 2000),
        preferredLanguage: ['en', 'bn', 'bilingual', 'auto'].includes(preferredLanguage)
          ? preferredLanguage
          : 'auto',
        temperature: typeof temperature === 'number' ? Math.max(0, Math.min(2, temperature)) : 0.85,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: 'AI persona preferences updated successfully.',
      persona: updated,
    });
  } catch (err) {
    console.error('updatePersonaConfig error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update AI persona.' });
  }
};

/**
 * GET /api/ai/conversations
 */
exports.listConversations = async (req, res) => {
  try {
    const conversations = await AIConversation.aggregate([
      { $match: { user: req.user._id } },
      { $sort: { pinned: -1, lastMessageAt: -1 } },
      {
        $project: {
          _id: 1,
          title: 1,
          persona: 1,
          pinned: 1,
          lastMessageAt: 1,
          createdAt: 1,
          updatedAt: 1,
          messageCount: { $size: '$messages' },
          lastMessage: { $arrayElemAt: ['$messages', -1] },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (err) {
    console.error('listConversations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to list conversations.' });
  }
};

/**
 * POST /api/ai/conversations
 */
exports.createConversation = async (req, res) => {
  try {
    const { title, persona } = req.body;
    const defaultPersona = await getUserPersona(req.user._id);

    const newConv = new AIConversation({
      user: req.user._id,
      title: (title || 'New Conversation').trim().slice(0, 120),
      persona: {
        customName: persona?.customName || defaultPersona.customName,
        rolePersona: persona?.rolePersona || defaultPersona.rolePersona,
        preferredLanguage: persona?.preferredLanguage || defaultPersona.preferredLanguage,
      },
      messages: [],
      lastMessageAt: new Date(),
    });

    await newConv.save();
    return res.status(201).json({ success: true, conversation: newConv });
  } catch (err) {
    console.error('createConversation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create conversation.' });
  }
};

/**
 * GET /api/ai/conversations/:id
 */
exports.getConversation = async (req, res) => {
  try {
    const conv = await AIConversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    return res.status(200).json({ success: true, conversation: conv });
  } catch (err) {
    console.error('getConversation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve conversation.' });
  }
};

/**
 * PATCH /api/ai/conversations/:id
 */
exports.updateConversation = async (req, res) => {
  try {
    const { title, pinned, persona } = req.body;
    const updateData = {};

    if (typeof title === 'string') {
      updateData.title = title.trim().slice(0, 120);
    }
    if (typeof pinned === 'boolean') {
      updateData.pinned = pinned;
    }
    if (persona && typeof persona === 'object') {
      if (persona.customName) updateData['persona.customName'] = persona.customName.trim();
      if (persona.rolePersona) updateData['persona.rolePersona'] = persona.rolePersona.trim();
      if (persona.preferredLanguage) updateData['persona.preferredLanguage'] = persona.preferredLanguage;
    }

    const updated = await AIConversation.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    return res.status(200).json({ success: true, conversation: updated });
  } catch (err) {
    console.error('updateConversation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update conversation.' });
  }
};

/**
 * DELETE /api/ai/conversations/:id
 */
exports.deleteConversation = async (req, res) => {
  try {
    const deleted = await AIConversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    return res.status(200).json({ success: true, message: 'Conversation deleted.' });
  } catch (err) {
    console.error('deleteConversation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete conversation.' });
  }
};

/**
 * DELETE /api/ai/conversations/:id/messages
 */
exports.clearConversationMessages = async (req, res) => {
  try {
    const updated = await AIConversation.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { messages: [], lastMessageAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    return res.status(200).json({ success: true, message: 'Conversation history cleared.', conversation: updated });
  } catch (err) {
    console.error('clearConversationMessages error:', err);
    return res.status(500).json({ success: false, message: 'Failed to clear conversation messages.' });
  }
};

/**
 * POST /api/ai/chat
 * Multi-session AI Chat endpoint supporting SSE streaming & standard JSON modes
 */
exports.chat = async (req, res) => {
  const { message, conversationId, stream, languagePref, customName, rolePersona, codeSnippets } = req.body;
  const isSse = stream === true || req.headers.accept === 'text/event-stream';

  const trimmedText = sanitizeAiInput(message || '');
  if (!trimmedText && (!codeSnippets || codeSnippets.length === 0)) {
    return res.status(400).json({ success: false, message: 'Message content is required.' });
  }

  // Guardrail safety inspection
  const safety = inspectPromptSafety(trimmedText);
  if (!safety.isSafe) {
    const fallbackText = safety.safeFallback || 'Prompt safety violation detected.';
    if (isSse) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.write(`event: chunk\ndata: ${JSON.stringify({ chunk: fallbackText })}\n\n`);
      res.write(`event: done\ndata: ${JSON.stringify({ reply: fallbackText })}\n\n`);
      return res.end();
    }
    return res.status(200).json({
      success: true,
      reply: fallbackText,
      message: { role: 'model', content: fallbackText, timestamp: new Date() },
    });
  }

  try {
    // 1. Resolve or create AIConversation
    let conv = null;
    if (conversationId) {
      conv = await AIConversation.findOne({ _id: conversationId, user: req.user._id });
    }

    const defaultPersona = await getUserPersona(req.user._id);
    const activePersona = {
      customName: customName || conv?.persona?.customName || defaultPersona.customName,
      rolePersona: rolePersona || conv?.persona?.rolePersona || defaultPersona.rolePersona,
      preferredLanguage: languagePref || conv?.persona?.preferredLanguage || defaultPersona.preferredLanguage,
    };

    if (!conv) {
      // Auto-generate title from first 6 words
      const autoTitle = trimmedText.split(/\s+/).slice(0, 6).join(' ').slice(0, 60) || 'New Conversation';
      conv = new AIConversation({
        user: req.user._id,
        title: autoTitle,
        persona: activePersona,
        messages: [],
        lastMessageAt: new Date(),
      });
    }

    // 2. Append User Message
    const userMsgObj = {
      role: 'user',
      content: trimmedText,
      codeSnippets: Array.isArray(codeSnippets) ? codeSnippets : [],
      timestamp: new Date(),
    };
    conv.messages.push(userMsgObj);

    // 3. Build Gemini multi-turn contents from history (last 12 messages)
    const historySlice = conv.messages.slice(-12);
    const contents = [];

    for (const msg of historySlice) {
      const role = msg.role === 'model' ? 'model' : 'user';
      let text = msg.content || '';
      if (msg.codeSnippets && msg.codeSnippets.length > 0) {
        msg.codeSnippets.forEach((cs) => {
          if (cs.code) text += `\n\`\`\`${cs.language || ''}\n${cs.code}\n\`\`\``;
        });
      }

      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += `\n\n${text}`;
      } else {
        contents.push({ role, parts: [{ text }] });
      }
    }

    // Ensure first turn is user
    while (contents.length > 0 && contents[0].role !== 'user') {
      contents.shift();
    }

    // 4. Construct System Instructions
    let langGuidance = '';
    const pl = activePersona.preferredLanguage;
    if (pl === 'bangla' || pl === 'bn') {
      langGuidance = 'Respond in warm, natural Bengali (বাংলা).';
    } else if (pl === 'english' || pl === 'en') {
      langGuidance = 'Respond in natural, articulate English.';
    } else if (pl === 'bilingual' || pl === 'both') {
      langGuidance = 'Respond in a friendly mix of Bengali and English (Banglish).';
    } else {
      langGuidance = 'Detect user language and reply naturally in the same language.';
    }

    const systemInstruction = `
You are ${activePersona.customName}.
Role & Persona: ${activePersona.rolePersona}.
You are assisting ${req.user.name || req.user.username} on Clearfeed.
- Maintain an encouraging, intellectually rigorous, and helpful persona.
- Render all code inside markdown code fences with proper language tags.
- Provide practical explanations and mechanical intuition.
Language Preference:
${langGuidance}
`.trim();

    // 5. Stream or standard response
    if (isSse) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      res.write(`event: conversation\ndata: ${JSON.stringify({ conversationId: conv._id, title: conv.title })}\n\n`);

      let fullGeneratedText = '';
      const onChunk = (chunk) => {
        fullGeneratedText += chunk;
        res.write(`event: chunk\ndata: ${JSON.stringify({ chunk })}\n\n`);
      };

      try {
        await aiService.streamGeminiApi({
          contents,
          systemInstruction,
          maxOutputTokens: 1500,
          temperature: defaultPersona.temperature || 0.85,
          onChunk,
        });
      } catch (streamErr) {
        console.warn('Chat streamGeminiApi fallback:', streamErr.message);
        const isBn = pl === 'bangla' || pl === 'bn' || /[\u0980-\u09FF]/.test(trimmedText);
        const fallbackText = isBn
          ? `আমি ${activePersona.customName} (${activePersona.rolePersona})। আপনার বার্তাটি পেয়েছি! বর্তমানে AI ক্লাউড সার্ভিস অফলাইন মোডে থাকায় আপনার চ্যাট হিস্ট্রি লোকালি সংরক্ষিত হয়েছে।`
          : `I am ${activePersona.customName} (${activePersona.rolePersona}). I received your inquiry! Our AI proxy is running in local study mode; your conversations are fully saved.`;
        await aiService.simulateTokenStream(fallbackText, onChunk);
      }

      // Save Model Message
      const modelMsgObj = {
        role: 'model',
        content: fullGeneratedText,
        codeSnippets: [],
        timestamp: new Date(),
      };
      conv.messages.push(modelMsgObj);
      conv.lastMessageAt = new Date();
      await conv.save();

      res.write(
        `event: done\ndata: ${JSON.stringify({
          conversationId: conv._id,
          reply: fullGeneratedText,
          message: modelMsgObj,
        })}\n\n`
      );
      return res.end();
    } else {
      // Standard JSON response
      let replyText = '';
      try {
        replyText = await aiService.callGeminiApi({
          contents,
          systemInstruction,
          maxOutputTokens: 1500,
          temperature: defaultPersona.temperature || 0.85,
        });
      } catch (geminiErr) {
        console.warn('Chat callGeminiApi fallback:', geminiErr.message);
        const isBn = pl === 'bangla' || pl === 'bn' || /[\u0980-\u09FF]/.test(trimmedText);
        replyText = isBn
          ? `আমি ${activePersona.customName} (${activePersona.rolePersona})। আপনার বার্তাটি পেয়েছি! বর্তমানে AI ক্লাউড সার্ভিস অফলাইন মোডে থাকায় আপনার চ্যাট হিস্ট্রি লোকালি সংরক্ষিত হয়েছে।`
          : `I am ${activePersona.customName} (${activePersona.rolePersona}). I received your inquiry! Our AI proxy is running in local study mode; your conversations are fully saved.`;
      }

      const modelMsgObj = {
        role: 'model',
        content: replyText,
        codeSnippets: [],
        timestamp: new Date(),
      };
      conv.messages.push(modelMsgObj);
      conv.lastMessageAt = new Date();
      await conv.save();

      return res.status(200).json({
        success: true,
        conversationId: conv._id,
        title: conv.title,
        reply: replyText,
        message: modelMsgObj,
      });
    }
  } catch (err) {
    console.error('aiController.chat error:', err);
    if (isSse) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`);
      return res.end();
    }
    return res.status(500).json({ success: false, message: 'Failed to process AI chat: ' + err.message });
  }
};

/**
 * POST /api/ai/classroom-mentor
 * Contextual mentor endpoint for Clearfeed Learn & CodeHub
 */
exports.classroomMentor = async (req, res) => {
  const { question, lessonId, trackId, code, languagePref, stream, conversationId } = req.body;
  const isSse = stream === true || req.headers.accept === 'text/event-stream';

  try {
    const persona = await getUserPersona(req.user._id);

    if (isSse) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      let fullGeneratedText = '';
      const onChunk = (chunk) => {
        fullGeneratedText += chunk;
        res.write(`event: chunk\ndata: ${JSON.stringify({ chunk })}\n\n`);
      };

      await aiService.generateClassroomMentorReply({
        user: req.user,
        question,
        lessonId,
        trackId,
        code,
        languagePref: languagePref || persona.preferredLanguage,
        persona,
        stream: true,
        onChunk,
      });

      // Optionally save to an AIConversation thread
      let savedConvId = conversationId;
      if (conversationId) {
        try {
          await AIConversation.findOneAndUpdate(
            { _id: conversationId, user: req.user._id },
            {
              $push: {
                messages: [
                  { role: 'user', content: `[${trackId} - ${lessonId}] ${question || 'Explain lesson'}`, timestamp: new Date() },
                  { role: 'model', content: fullGeneratedText, timestamp: new Date() },
                ],
              },
              $set: { lastMessageAt: new Date() },
            }
          );
        } catch {}
      }

      res.write(
        `event: done\ndata: ${JSON.stringify({
          reply: fullGeneratedText,
          lessonId,
          trackId,
          conversationId: savedConvId,
        })}\n\n`
      );
      return res.end();
    } else {
      const reply = await aiService.generateClassroomMentorReply({
        user: req.user,
        question,
        lessonId,
        trackId,
        code,
        languagePref: languagePref || persona.preferredLanguage,
        persona,
        stream: false,
      });

      if (conversationId) {
        try {
          await AIConversation.findOneAndUpdate(
            { _id: conversationId, user: req.user._id },
            {
              $push: {
                messages: [
                  { role: 'user', content: `[${trackId} - ${lessonId}] ${question || 'Explain lesson'}`, timestamp: new Date() },
                  { role: 'model', content: reply, timestamp: new Date() },
                ],
              },
              $set: { lastMessageAt: new Date() },
            }
          );
        } catch {}
      }

      return res.status(200).json({
        success: true,
        reply,
        lessonId,
        trackId,
        conversationId,
      });
    }
  } catch (err) {
    console.error('classroomMentor error:', err);
    if (isSse) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`);
      return res.end();
    }
    return res.status(500).json({ success: false, message: 'Classroom mentor failed: ' + err.message });
  }
};

/**
 * POST /api/ai/explain-code
 * Contextual code explanation for CodeHub & Learn playground
 */
exports.explainCode = async (req, res) => {
  const { code, language, context, question, languagePref, stream, conversationId } = req.body;
  const isSse = stream === true || req.headers.accept === 'text/event-stream';

  if (!code || !code.trim()) {
    return res.status(400).json({ success: false, message: 'Code content is required.' });
  }

  try {
    const persona = await getUserPersona(req.user._id);

    if (isSse) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      let fullGeneratedText = '';
      const onChunk = (chunk) => {
        fullGeneratedText += chunk;
        res.write(`event: chunk\ndata: ${JSON.stringify({ chunk })}\n\n`);
      };

      await aiService.generateCodeExplanation({
        user: req.user,
        code,
        language,
        context,
        question,
        persona,
        languagePref: languagePref || persona.preferredLanguage,
        stream: true,
        onChunk,
      });

      res.write(
        `event: done\ndata: ${JSON.stringify({
          explanation: fullGeneratedText,
          language,
          conversationId,
        })}\n\n`
      );
      return res.end();
    } else {
      const explanation = await aiService.generateCodeExplanation({
        user: req.user,
        code,
        language,
        context,
        question,
        persona,
        languagePref: languagePref || persona.preferredLanguage,
        stream: false,
      });

      return res.status(200).json({
        success: true,
        explanation,
        language,
        conversationId,
      });
    }
  } catch (err) {
    console.error('explainCode error:', err);
    if (isSse) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`);
      return res.end();
    }
    return res.status(500).json({ success: false, message: 'Code explanation failed: ' + err.message });
  }
};
