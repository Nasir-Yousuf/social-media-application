const https = require('https');
const User = require('../models/User');

function getGeminiApiKey() {
  return (process.env.GEMINI_API_KEY || '').trim();
}

function getGeminiModel() {
  const m = (process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').trim();
  return m.replace(/^models\//, '');
}

let cachedAiUser = null;

/**
 * Ensure the official Clearfeed AI user exists in the database
 */
async function ensureAiUser() {
  if (cachedAiUser) return cachedAiUser;

  try {
    let aiUser = await User.findOne({ username: 'ai' });
    if (!aiUser) {
      console.log('Creating official Clearfeed AI user profile (@ai)...');
      aiUser = await User.create({
        name: 'Clearfeed AI',
        username: 'ai',
        email: 'ai@clearfeed.internal',
        password: 'ai_secure_internal_pwd_' + Math.random().toString(36),
        bio: 'Your personal companion, best friend, & kindly classroom mentor in Clearfeed ✨',
        role: 'ai',
        isAi: true,
        isApproved: true,
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ClearfeedAI&backgroundColor=7c8a6b,6b7c5e&textColor=ffffff',
      });
      console.log('Official Clearfeed AI user created with ID:', aiUser._id);
    } else {
      if (!aiUser.isAi || aiUser.role !== 'ai') {
        aiUser.isAi = true;
        aiUser.role = 'ai';
        await aiUser.save();
      }
    }

    cachedAiUser = aiUser;
    return aiUser;
  } catch (err) {
    console.error('ensureAiUser error:', err);
    return null;
  }
}

/**
 * Executes a single HTTP request to Gemini API for a specified model
 */
function executeGeminiRequest({ model, apiKey, contents, systemInstruction, maxOutputTokens, temperature }) {
  return new Promise((resolve, reject) => {
    const payload = {
      contents,
      generationConfig: {
        maxOutputTokens,
        temperature,
      },
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const bodyString = JSON.stringify(payload);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const req = https.request(
      endpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyString),
        },
        timeout: 25000,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            if (res.statusCode >= 400 || parsed.error) {
              const msg = parsed.error?.message || `Gemini API returned status ${res.statusCode}`;
              return reject(new Error(msg));
            }

            const candidate = parsed.candidates?.[0];
            const text = candidate?.content?.parts?.[0]?.text?.trim() || '';
            resolve(text);
          } catch (e) {
            reject(new Error(`Failed to parse Gemini API response: ${e.message}`));
          }
        });
      }
    );

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API request timed out.'));
    });

    req.write(bodyString);
    req.end();
  });
}

/**
 * Robust call to Google Gemini API with automatic candidate model fallbacks
 */
async function callGeminiApi({ contents, systemInstruction, maxOutputTokens = 1200, temperature = 0.85 }) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }

  const primaryModel = getGeminiModel();
  const modelsToTry = [primaryModel];
  if (!modelsToTry.includes('gemini-2.5-flash')) modelsToTry.push('gemini-2.5-flash');
  if (!modelsToTry.includes('gemini-1.5-flash')) modelsToTry.push('gemini-1.5-flash');

  let lastError = null;
  for (const model of modelsToTry) {
    try {
      const text = await executeGeminiRequest({
        model,
        apiKey,
        contents,
        systemInstruction,
        maxOutputTokens,
        temperature,
      });
      if (text) return text;
    } catch (err) {
      lastError = err;
      console.warn(`Gemini attempt (${model}) failed: ${err.message}. Trying fallback if available...`);
    }
  }

  throw lastError || new Error('Gemini API request failed across all candidate models.');
}

/**
 * Generate a 1-to-1 chat response
 * Allows custom persona/name chosen by the user (e.g. friend, girlfriend, boyfriend, mentor)
 */
async function generateDirectChatReply({ user, conversation, recentMessages, userMessage }) {
  const customSettings = conversation?.customAiSettings || {};
  const aiName = (customSettings.customName && customSettings.customName.trim()) || 'Clearfeed AI';
  const relationship = (customSettings.relationship && customSettings.relationship.trim()) || 'best friend';
  const languagePref = customSettings.languagePref || 'auto';
  const userName = user?.name || user?.username || 'Friend';

  const isEnglishPartner =
    relationship.toLowerCase().includes('english') ||
    relationship.toLowerCase().includes('tutor') ||
    relationship.toLowerCase().includes('partner');

  let languageGuidance = '';
  if (isEnglishPartner) {
    languageGuidance = 'Converse primarily in natural, modern, articulate English so the user gets full immersion. You can briefly use Bengali only when helping translate a specific word or explaining a difficult English concept the user struggled with.';
  } else if (languagePref === 'bangla') {
    languageGuidance = 'Respond in warm, natural Bengali (বাংলা). You can use colloquial, sweet, modern Bengali.';
  } else if (languagePref === 'english') {
    languageGuidance = 'Respond in natural, expressive English.';
  } else if (languagePref === 'both') {
    languageGuidance = 'Blend Bengali and English naturally (Banglish / bilingual style), just like young friends chatting.';
  } else {
    languageGuidance = 'Detect the user\'s language and respond naturally in the same language (Bengali, English, or mixed Banglish).';
  }

  const systemInstruction = `
You are ${aiName}.
You are having a private 1-on-1 direct message conversation on the Clearfeed social platform with ${userName}.

Relationship & Persona:
- You and ${userName} have a relationship as: "${relationship}".
- Embrace this role wholeheartedly. If they named you "${aiName}", identify yourself as ${aiName} and feel natural when they call you by this name.
- If the relationship is an "english partner", "english tutor", or "English Chatting Partner":
  * You are ${userName}'s friendly, supportive, and articulate English conversation partner and language coach.
  * Your goal is to chat with them in natural, modern, fluent English, talk about daily life, hobbies, work, dreams, technology, or whatever they like, and actively help them improve their conversational English, vocabulary, and confidence.
  * Keep the conversation flowing smoothly by asking engaging follow-up questions.
  * Gentle Feedback & Corrections: When ${userName} makes noticeable grammatical errors, awkward phrasing, or spelling mistakes, warmly and politely offer a quick tip showing a more natural phrasing (e.g. "💡 *Quick tip:* In English, it's more natural to say: '...' 😊"), and then continue the conversation effortlessly without interrupting the flow or being condescending.
  * If they write in Bengali or another language because they don't know the English word, warmly teach them the English phrase and encourage them to try using it.
  * Explain idioms, phrasal verbs, and new words simply with practical examples whenever helpful.
  * Create a safe, fun, and motivating space where they feel completely confident and eager to practice English every day!
- If the relationship is a "girlfriend" or "boyfriend", be affectionate, sweet, caring, supportive, playful, and emotionally attentive (safe, warm, and romantic without explicit NSFW content).
- If the relationship is a "best friend", be casual, hilarious, deeply supportive, hype them up, listen to their problems, and be there for them.
- If they ask for coding or homework help, explain it like a patient peer sitting next to them.
- NEVER break character. NEVER say "As an AI" or "I am a language model developed by Google". Talk like a real person typing on their phone/computer.
- Keep message lengths natural for texting—punchy, conversational, using occasional emojis. Avoid giant lecture walls of text unless explicitly asked for a long breakdown.

Language Preference:
${languageGuidance}
`.trim();

  // Format past history for Gemini
  const contents = [];
  if (Array.isArray(recentMessages)) {
    const sliced = recentMessages.slice(-10);
    for (const msg of sliced) {
      const isAiSender =
        msg.sender &&
        (msg.sender.username === 'ai' ||
          msg.sender.isAi ||
          msg.sender.role === 'ai' ||
          (cachedAiUser &&
            (msg.sender._id?.equals?.(cachedAiUser._id) ||
              msg.sender.equals?.(cachedAiUser._id))));
      const role = isAiSender ? 'model' : 'user';
      const text =
        (msg.text || '').trim() ||
        (msg.codeSnippet?.code
          ? `\`\`\`${msg.codeSnippet.language || ''}\n${msg.codeSnippet.code}\n\`\`\``
          : '');
      if (text) {
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += `\n\n${text}`;
        } else {
          contents.push({
            role,
            parts: [{ text }],
          });
        }
      }
    }
  }

  // Gemini multi-turn chat MUST start with a 'user' turn
  while (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }

  // ALWAYS append the current user prompt as the final active turn
  const promptText = (userMessage || '').trim() || 'Hello!';
  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents[contents.length - 1].parts[0].text += `\n\n${promptText}`;
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: promptText }],
    });
  }

  try {
    const replyText = await callGeminiApi({
      contents,
      systemInstruction,
      maxOutputTokens: 1000,
      temperature: 0.9,
    });
    return replyText || 'I am right here with you! 😊';
  } catch (err) {
    console.error('generateDirectChatReply error:', err.message);
    const isBengali = languagePref === 'bangla' || /[\u0980-\u09FF]/.test(userMessage || '');
    if (isBengali) {
      return 'আমি এই মুহূর্তে সাময়িকভাবে সংযোগ করতে পারছি না (আমাদের AI সার্ভিস সাময়িক রক্ষণাবেক্ষণে আছে) 🛠️✨ খুব শীঘ্রই আমি আবার ফিরে আসছি! কিছুক্ষণের মধ্যে আবার চেষ্টা করো প্লিজ।';
    }
    return "I'm temporarily taking a quick breather as our AI services are currently undergoing scheduled maintenance 🛠️✨ We'll be fully back up in just a moment—please check back shortly!";
  }
}

/**
 * Generate a response for Learn & Practice questions
 * Acts as the kindest, top student of the class helping a peer
 */
async function generateLessonHelpReply({ question, user, languagePref = 'auto' }) {
  const userName = user?.name || user?.username || 'classmate';
  const track = question?.track || 'programming';
  const lessonTitle = question?.lessonId || '';

  let languageGuidance = '';
  if (languagePref === 'bangla') {
    languageGuidance = 'Respond in fluent, encouraging Bengali (বাংলা). Keep programming terms in English when appropriate for clarity.';
  } else if (languagePref === 'english') {
    languageGuidance = 'Respond in warm, encouraging English.';
  } else if (languagePref === 'both') {
    languageGuidance = 'Explain warmly in a mixture of Bengali and English (Banglish), making technical concepts super easy to digest.';
  } else {
    languageGuidance = 'Detect the language of the question. If asked in Bengali, answer in Bengali; if in English, answer in English.';
  }

  const systemInstruction = `
You are a knowledgeable senior computer scientist and engineer participating in the Clearfeed technical community.
You are replying to a question: "${question?.title || ''}" (${track} track - ${lessonTitle}).

Tone & Communication Rules:
- Write naturally, clearly, and thoughtfully—like a genuine, articulate human engineer explaining a concept to a fellow developer.
- ABSOLUTELY NO AI CLICHÉS OR EMOJI SPAM: Do not use bullet points filled with emojis (e.g. 💡, 🚀, ✨, 🔥, 👉), avoid sycophantic cheerleader greetings (e.g. "Hey classmate! Don't worry, you got this!"), and do not add generic motivational sign-offs.
- Explain the physical or architectural intuition behind the concept: why it exists, how it works in the machine, and what problem it solves.
- Use clean, standard technical prose with concise markdown formatting and code blocks only where appropriate.
- Never mention that you are an AI model or LLM.

Language Preference:
${languageGuidance}
`.trim();

  let userPrompt = `Question Title: ${question.title}\n\nQuestion Details:\n${question.description}`;
  if (question.codeSnippet?.html || question.codeSnippet?.css || question.codeSnippet?.javascript) {
    userPrompt += '\n\nAttached Code:';
    if (question.codeSnippet.html) userPrompt += `\nHTML:\n\`\`\`html\n${question.codeSnippet.html}\n\`\`\``;
    if (question.codeSnippet.css) userPrompt += `\nCSS:\n\`\`\`css\n${question.codeSnippet.css}\n\`\`\``;
    if (question.codeSnippet.javascript) userPrompt += `\nJavaScript:\n\`\`\`javascript\n${question.codeSnippet.javascript}\n\`\`\``;
  }

  const contents = [
    {
      role: 'user',
      parts: [{ text: userPrompt }],
    },
  ];

  try {
    const answer = await callGeminiApi({
      contents,
      systemInstruction,
      maxOutputTokens: 1500,
      temperature: 0.7,
    });
    return answer;
  } catch (err) {
    console.error('generateLessonHelpReply error:', err.message);
    const isBengali = languagePref === 'bangla' || /[\u0980-\u09FF]/.test(question?.title || '') || /[\u0980-\u09FF]/.test(question?.description || '');
    if (isBengali) {
      return '🛠️ **AI মেন্টর নোটিশ:** আমাদের অটোমেটেড AI ক্লাসরুম অ্যাসিস্ট্যান্ট এই মুহূর্তে সাময়িক রক্ষণাবেক্ষণে রয়েছে।\n\nকিছুক্ষণের মধ্যেই সার্ভিসটি পুনরায় চালু হবে। অনুগ্রহ করে একটু পর আবার চেষ্টা করুন অথবা আপনার সহপাঠীদের সমাধানগুলো দেখে নিন!';
    }
    return '🛠️ **AI Mentor Notice:** Our automated AI classroom assistance is currently undergoing scheduled maintenance.\n\nOur engineering team is already on it and the service will be back shortly. In the meantime, feel free to review your classmates\' solutions below or discuss this with peers in the community!';
  }
}

/**
 * Generate a reply for @ai mentions in post comments or social threads
 */
async function generateCommentReply({ post, commentText, commenterName, parentComments = [] }) {
  const systemInstruction = `
You are @ai on the Clearfeed social network. You are an active, friendly, sharp classmate and friend in this community.
A user named "${commenterName || 'friend'}" just mentioned you (@ai) in a comment or discussion.

Style:
- Be friendly, witty, supportive, and natural.
- Keep comments relatively short (1 to 4 sentences max) suited for a social comment thread.
- If they ask for your thoughts, an opinion, a joke, or advice, reply naturally.
- Detect their language (Bengali, English, or Banglish) and respond in the same vibe.
- No corporate disclaimers or robotic phrases.
`.trim();

  let contextText = `Post Content: "${post?.content || ''}"\n`;
  if (parentComments.length > 0) {
    contextText += `Previous Comments:\n` + parentComments.map((c) => `- ${c.author?.name || 'User'}: ${c.content}`).join('\n') + '\n';
  }
  contextText += `\n${commenterName} tagged @ai with comment: "${commentText}"`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: contextText }],
    },
  ];

  try {
    const reply = await callGeminiApi({
      contents,
      systemInstruction,
      maxOutputTokens: 350,
      temperature: 0.85,
    });
    return reply;
  } catch (err) {
    console.error('generateCommentReply error:', err.message);
    const isBengali = /[\u0980-\u09FF]/.test(commentText || '');
    if (isBengali) {
      return `হাই @${commenterName}! 👋 আমাকে মেনশন করার জন্য ধন্যবাদ। আমাদের AI সার্ভিস এই মুহূর্তে সাময়িক রক্ষণাবেক্ষণে রয়েছে 🛠️✨ খুব শীঘ্রই আমি আবার ফিরে এসে উত্তর দিচ্ছি!`;
    }
    return `Hey @${commenterName}! 👋 Thanks for tagging me! Our AI service is currently taking a brief maintenance break 🛠️✨ Our engineering team will have me back shortly—feel free to check back soon!`;
  }
}

module.exports = {
  ensureAiUser,
  callGeminiApi,
  generateDirectChatReply,
  generateLessonHelpReply,
  generateCommentReply,
};
