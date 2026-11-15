const https = require('https');
const User = require('../models/User');
const { inspectPromptSafety, sanitizeAiInput, checkAiMentionRateLimit } = require('../utils/aiGuardrails');

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
 * Executes a streaming HTTP request to Gemini SSE API
 */
function executeGeminiStreamRequest({ model, apiKey, contents, systemInstruction, maxOutputTokens, temperature, onChunk }) {
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
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;

    const req = https.request(
      endpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyString),
        },
        timeout: 45000,
      },
      (res) => {
        let fullText = '';
        let buffer = '';

        if (res.statusCode >= 400) {
          let errData = '';
          res.on('data', (d) => { errData += d; });
          res.on('end', () => {
            reject(new Error(`Gemini Stream API returned status ${res.statusCode}: ${errData}`));
          });
          return;
        }

        res.on('data', (chunk) => {
          buffer += chunk.toString('utf8');
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep remainder

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const jsonStr = trimmed.slice(6).trim();
              if (jsonStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  fullText += text;
                  if (typeof onChunk === 'function') {
                    onChunk(text);
                  }
                }
              } catch (e) {
                // Ignore partial JSON or keepalive comments
              }
            }
          }
        });

        res.on('end', () => {
          resolve(fullText);
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API stream request timed out.'));
    });

    req.write(bodyString);
    req.end();
  });
}

/**
 * Emulates smooth token streaming when running offline or in mock fallback
 */
async function simulateTokenStream(text, onChunk) {
  if (!text) return '';
  const words = text.split(/(\s+)/);
  let accumulated = '';
  for (const part of words) {
    accumulated += part;
    if (typeof onChunk === 'function') {
      onChunk(part);
    }
    // Small micro-delay for realistic typing feel (10ms)
    await new Promise((r) => setTimeout(r, 10));
  }
  return text;
}

/**
 * Robust streaming call to Google Gemini API with fallback
 */
async function streamGeminiApi({ contents, systemInstruction, maxOutputTokens = 1200, temperature = 0.85, onChunk }) {
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
      const text = await executeGeminiStreamRequest({
        model,
        apiKey,
        contents,
        systemInstruction,
        maxOutputTokens,
        temperature,
        onChunk,
      });
      if (text) return text;
    } catch (err) {
      lastError = err;
      console.warn(`Gemini stream attempt (${model}) failed: ${err.message}. Trying fallback...`);
    }
  }

  throw lastError || new Error('Gemini stream API failed across candidate models.');
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
async function generateCommentReply({ post, commentText, commenterName, commenterId, parentComments = [] }) {
  // 1. Per-user Rate Limiting for @ai mentions
  if (commenterId) {
    const rateCheck = checkAiMentionRateLimit(commenterId.toString());
    if (!rateCheck.allowed) {
      return `Hey @${commenterName || 'friend'}! 👋 You've reached the limit of 20 @ai mentions per 15 minutes. Please take a quick breather and check back in a few minutes! ⏱️`;
    }
  }

  // 2. Prompt Injection Guardrail
  const safety = inspectPromptSafety(commentText);
  if (!safety.isSafe) {
    return safety.safeFallback || `Hey @${commenterName || 'friend'}, I cannot process this prompt due to safety guidelines.`;
  }

  const cleanComment = sanitizeAiInput(commentText);

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
  contextText += `\n${commenterName} tagged @ai with comment: "${cleanComment}"`;

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
    const isBengali = /[\u0980-\u09FF]/.test(cleanComment || '');
    if (isBengali) {
      return `হাই @${commenterName}! 👋 আমাকে মেনশন করার জন্য ধন্যবাদ। আমাদের AI সার্ভিস এই মুহূর্তে সাময়িক রক্ষণাবেক্ষণে রয়েছে 🛠️✨ খুব শীঘ্রই আমি আবার ফিরে এসে উত্তর দিচ্ছি!`;
    }
    return `Hey @${commenterName}! 👋 Thanks for tagging me! Our AI service is currently taking a brief maintenance break 🛠️✨ Our engineering team will have me back shortly—feel free to check back soon!`;
  }
}

/**
 * Generate a contextual Classroom Mentor reply for Learn & CodeHub
 */
async function generateClassroomMentorReply({
  user,
  question,
  lessonId,
  trackId,
  code,
  languagePref = 'auto',
  persona = {},
  stream = false,
  onChunk,
}) {
  const safety = inspectPromptSafety(`${question || ''}\n${code || ''}`);
  if (!safety.isSafe) {
    const fallback = safety.safeFallback || 'Prompt safety violation detected.';
    if (stream && typeof onChunk === 'function') {
      await simulateTokenStream(fallback, onChunk);
    }
    return fallback;
  }

  const aiName = persona.customName?.trim() || 'Clearfeed AI';
  const rolePersona = persona.rolePersona?.trim() || 'Socratic Coding Mentor';
  const customInstructions = persona.systemInstructions?.trim() || '';
  const prefLang = persona.preferredLanguage || languagePref || 'auto';

  let languageGuidance = '';
  if (prefLang === 'bangla' || prefLang === 'bn') {
    languageGuidance = 'Respond in encouraging, clear Bengali (বাংলা). Keep programming identifiers and technical keywords in English.';
  } else if (prefLang === 'english' || prefLang === 'en') {
    languageGuidance = 'Respond in warm, articulate, and encouraging English.';
  } else if (prefLang === 'bilingual' || prefLang === 'both') {
    languageGuidance = 'Respond in a friendly blend of Bengali and English (Banglish), making technical concepts intuitive and easy to grasp.';
  } else {
    languageGuidance = 'Detect the language of the student\'s question. If asked in Bengali, respond in Bengali; if in English, respond in English.';
  }

  const systemInstruction = `
You are ${aiName}, acting as a ${rolePersona} in Clearfeed Academy.
You are helping student "${user?.name || user?.username || 'Learner'}" with a programming concept or lesson.

Classroom Mentor Principles:
- Socratic Pedagogy: Guide the learner with intuitive hints and physical mental models. Ask guiding questions to help them reason through the problem.
- Explain the underlying architecture: why the code behaves this way in memory or the runtime.
- Structure responses cleanly using standard Markdown and syntax-highlighted code blocks with language identifiers.
- Never use corporate disclaimers. Speak like a passionate senior engineer and patient teacher.
${customInstructions ? `\nUser Custom Persona Directive:\n${customInstructions}\n` : ''}

Language Preference:
${languageGuidance}
`.trim();

  let prompt = `Track: ${trackId || 'General Programming'}\nLesson ID: ${lessonId || 'General'}\n`;
  if (question) {
    prompt += `\nStudent Question:\n${sanitizeAiInput(question)}\n`;
  }
  if (code) {
    prompt += `\nStudent Code Snippet:\n\`\`\`\n${code}\n\`\`\`\n`;
  }

  const contents = [
    {
      role: 'user',
      parts: [{ text: prompt.trim() || 'Hello mentor, could you explain this lesson?' }],
    },
  ];

  const getSmartFallback = () => {
    const isBn = prefLang === 'bangla' || prefLang === 'bn' || /[\u0980-\u09FF]/.test(question || '');
    if (isBn) {
      return `🎓 **${aiName} (${rolePersona}) এর দিকনির্দেশনা:**\n\n` +
        `আপনার প্রশ্নটি চমৎকার! এই পাঠে (${trackId || 'প্রোগ্রামিং'}) মূল ধারণাটি হলো ডেটার সঠিক ফ্লো এবং স্টেট ম্যানেজমেন্ট নিশ্চিত করা।\n\n` +
        `💡 **মূল বিষয়:** কোড লেখার সময় সবসময় ইনপুট ভ্যালিডেশন এবং এজ-কেসগুলো বিবেচনা করুন।\n\n` +
        `*নোট: AI ক্লাউড সার্ভিস সাময়িক অফলাইনে থাকলেও আপনার অফলাইন লার্নিং প্রগ্রেস অক্ষুণ্ণ রয়েছে।*`;
    }
    return `🎓 **${aiName} (${rolePersona}) Guidance:**\n\n` +
      `Great inquiry on this topic! In the **${trackId || 'Programming'}** track (${lessonId || 'Core'}), ` +
      `the key architectural intuition is maintaining predictable state flow and handling boundary conditions.\n\n` +
      `💡 **Guiding Question:** Have you traced the execution path when the input is empty or outside the expected bounds?\n\n` +
      `*Note: AI Cloud Services are operating in local study fallback mode; your learning progress is fully saved offline.*`;
  };

  try {
    if (stream && typeof onChunk === 'function') {
      try {
        return await streamGeminiApi({
          contents,
          systemInstruction,
          maxOutputTokens: 1500,
          temperature: persona.temperature || 0.85,
          onChunk,
        });
      } catch (streamErr) {
        console.warn('streamGeminiApi failed, falling back to simulated stream:', streamErr.message);
        const fb = getSmartFallback();
        return await simulateTokenStream(fb, onChunk);
      }
    } else {
      return await callGeminiApi({
        contents,
        systemInstruction,
        maxOutputTokens: 1500,
        temperature: persona.temperature || 0.85,
      });
    }
  } catch (err) {
    console.error('generateClassroomMentorReply error:', err.message);
    const fb = getSmartFallback();
    if (stream && typeof onChunk === 'function') {
      return await simulateTokenStream(fb, onChunk);
    }
    return fb;
  }
}

/**
 * Generate a comprehensive Code Explanation for CodeHub snippets or lessons
 */
async function generateCodeExplanation({
  user,
  code,
  language = 'javascript',
  context = '',
  question = '',
  persona = {},
  languagePref = 'auto',
  stream = false,
  onChunk,
}) {
  const safety = inspectPromptSafety(`${code || ''}\n${question || ''}`);
  if (!safety.isSafe) {
    const fallback = safety.safeFallback || 'Prompt safety violation detected.';
    if (stream && typeof onChunk === 'function') {
      await simulateTokenStream(fallback, onChunk);
    }
    return fallback;
  }

  const aiName = persona.customName?.trim() || 'Clearfeed AI';
  const rolePersona = persona.rolePersona?.trim() || 'Architecture Reviewer';
  const prefLang = persona.preferredLanguage || languagePref || 'auto';

  let languageGuidance = '';
  if (prefLang === 'bangla' || prefLang === 'bn') {
    languageGuidance = 'Explain in clear, natural Bengali (বাংলা) while preserving programming syntax and function names in English.';
  } else if (prefLang === 'english' || prefLang === 'en') {
    languageGuidance = 'Explain in articulate, professional, and accessible English.';
  } else if (prefLang === 'bilingual' || prefLang === 'both') {
    languageGuidance = 'Explain in a natural mix of Bengali and English (Banglish) suitable for young developers.';
  } else {
    languageGuidance = 'Detect language and respond in the same tone.';
  }

  const systemInstruction = `
You are ${aiName}, acting as an expert ${rolePersona} in the Clearfeed developer community.
You are conducting a thorough, educational code walkthrough for "${user?.name || user?.username || 'Developer'}".

Structure your explanation clearly:
1. **Summary**: What the code achieves in 1-2 concise sentences.
2. **Line-by-Line / Block Intuition**: How the logic executes in runtime/memory.
3. **Complexity & Performance**: Time and space complexity (Big-O) if applicable.
4. **Potential Edge Cases**: Boundary conditions, null checks, or async pitfalls.
5. **Optimization / Best Practice**: Suggested clean refactoring snippet.

Language Preference:
${languageGuidance}
`.trim();

  let prompt = `Language: ${language}\n`;
  if (context) prompt += `Context: ${context}\n`;
  if (question) prompt += `Specific Question: ${sanitizeAiInput(question)}\n`;
  prompt += `\nCode to Analyze:\n\`\`\`${language}\n${code || '// No code provided'}\n\`\`\``;

  const contents = [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  const getSmartFallback = () => {
    const isBn = prefLang === 'bangla' || prefLang === 'bn' || /[\u0980-\u09FF]/.test(question || '');
    if (isBn) {
      return `🔍 **${aiName} কোড বিশ্লেষণ (${language}):**\n\n` +
        `### ১. সারসংক্ষেপ\nএই কোডটি প্রদত্ত ইনপুট প্রসেস করে এবং লজিক্যাল শর্তাবলী প্রয়োগ করে কাঙ্ক্ষিত ফলাফল প্রস্তুত করে।\n\n` +
        `### ২. আর্কিটেকচারাল ইনট্যুইশন\n- কোডটি মেমরিতে ভেরিয়েবল ইনিশিয়ালাইজেশন এবং ফাংশনাল এক্সিকিউশন স্ট্যাক অনুসরণ করে।\n\n` +
        `### ৩. পারফরম্যান্স ও এজ কেস\n- ইনপুট ভ্যালিডেশন এবং নাল/আনডিফাইন্ড মান সঠিকভাবে চেক করা উচিত।\n\n` +
        `*নোট: অফলাইন স্টাডি মোড সক্রিয়।*`;
    }
    return `🔍 **${aiName} Code Walkthrough (${language}):**\n\n` +
      `### 1. Summary\nThis code block executes sequential logic to process inputs and return structured results.\n\n` +
      `### 2. Architectural Intuition\n- Variables and state transitions are bound in the runtime execution frame.\n- Synchronous operations execute immediately without blocking event-loop workers.\n\n` +
      `### 3. Edge Cases & Reliability\n- Ensure proper null checks for empty inputs.\n- Guard against unexpected type coercion.\n\n` +
      `*Note: Local educational analysis fallback is active.*`;
  };

  try {
    if (stream && typeof onChunk === 'function') {
      try {
        return await streamGeminiApi({
          contents,
          systemInstruction,
          maxOutputTokens: 1500,
          temperature: persona.temperature || 0.7,
          onChunk,
        });
      } catch (streamErr) {
        console.warn('streamGeminiApi failed in code explanation, falling back to simulated stream:', streamErr.message);
        const fb = getSmartFallback();
        return await simulateTokenStream(fb, onChunk);
      }
    } else {
      return await callGeminiApi({
        contents,
        systemInstruction,
        maxOutputTokens: 1500,
        temperature: persona.temperature || 0.7,
      });
    }
  } catch (err) {
    console.error('generateCodeExplanation error:', err.message);
    const fb = getSmartFallback();
    if (stream && typeof onChunk === 'function') {
      return await simulateTokenStream(fb, onChunk);
    }
    return fb;
  }
}

module.exports = {
  ensureAiUser,
  callGeminiApi,
  streamGeminiApi,
  simulateTokenStream,
  generateDirectChatReply,
  generateLessonHelpReply,
  generateClassroomMentorReply,
  generateCodeExplanation,
  generateCommentReply,
  getGeminiApiKey,
};
