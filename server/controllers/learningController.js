const mongoose = require('mongoose');
const LearningProgress = require('../models/LearningProgress');
const LearningQuestion = require('../models/LearningQuestion');
const LearningAnswer = require('../models/LearningAnswer');
const Notification = require('../models/Notification');
const { notifyMentions } = require('../utils/mentionUtils');

// ==========================================
// 1. Progress Tracking
// ==========================================

// Get user learning progress
exports.getProgress = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({
        progress: {
          completedLessons: [],
          currentTrack: 'html',
          currentLessonId: 'html-intro',
          xp: 0,
          streak: 1,
        },
      });
    }

    let progress = await LearningProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await LearningProgress.create({
        user: req.user._id,
        completedLessons: [],
        currentTrack: 'html',
        currentLessonId: 'html-intro',
        xp: 0,
        streak: 1,
      });
    }

    return res.status(200).json({ progress });
  } catch (err) {
    console.error('getProgress error:', err);
    return res.status(500).json({ message: 'Error retrieving learning progress.' });
  }
};

// Complete a lesson & earn XP
exports.completeLesson = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required to save progress.' });
    }

    const { lessonId, track } = req.body;
    if (!lessonId) {
      return res.status(400).json({ message: 'Lesson ID is required.' });
    }

    let progress = await LearningProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = new LearningProgress({
        user: req.user._id,
        completedLessons: [],
        xp: 0,
      });
    }

    const isAlreadyCompleted = progress.completedLessons.includes(lessonId);
    if (!isAlreadyCompleted) {
      progress.completedLessons.push(lessonId);
      progress.xp += 25; // 25 XP per lesson completion
    }

    if (track) progress.currentTrack = track;
    progress.currentLessonId = lessonId;
    progress.lastActiveAt = new Date();

    await progress.save();

    return res.status(200).json({
      message: 'Lesson completed successfully!',
      progress,
      xpEarned: isAlreadyCompleted ? 0 : 25,
    });
  } catch (err) {
    console.error('completeLesson error:', err);
    return res.status(500).json({ message: 'Error updating learning progress.' });
  }
};

// Save draft code for a lesson
exports.saveLessonCode = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required to save code.' });
    }

    const { lessonId, code } = req.body;
    if (!lessonId || !code) {
      return res.status(400).json({ message: 'Lesson ID and code are required.' });
    }

    let progress = await LearningProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = new LearningProgress({ user: req.user._id });
    }

    if (!progress.savedCode) {
      progress.savedCode = new Map();
    }

    progress.savedCode.set(lessonId, {
      html: code.html || '',
      css: code.css || '',
      javascript: code.javascript || '',
    });

    await progress.save();
    return res.status(200).json({ message: 'Code saved successfully.' });
  } catch (err) {
    console.error('saveLessonCode error:', err);
    return res.status(500).json({ message: 'Error saving code.' });
  }
};

// ==========================================
// 2. Community Q&A System
// ==========================================

// Get questions list
exports.getQuestions = async (req, res) => {
  try {
    const { track, tag, search, sort = 'newest', page = 1, limit = 20 } = req.query;
    const filter = {};

    if (track && track !== 'all') {
      filter.track = track;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'answers') {
      sortOptions = { answersCount: -1, createdAt: -1 };
    } else if (sort === 'unsolved') {
      filter.isSolved = false;
      sortOptions = { createdAt: -1 };
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    const [questions, total] = await Promise.all([
      LearningQuestion.find(filter)
        .populate('author', 'name username avatarUrl role status')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit, 10)),
      LearningQuestion.countDocuments(filter),
    ]);

    const enriched = questions.map((q) => {
      const qObj = q.toObject();
      const currentUserId = req.user?._id;
      return {
        ...qObj,
        isUpvoted: currentUserId ? q.upvotes.some((u) => u.equals(currentUserId)) : false,
        upvotesCount: q.upvotes?.length || 0,
        isOwner: currentUserId ? q.author?._id?.equals(currentUserId) : false,
      };
    });

    return res.status(200).json({
      questions: enriched,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        hasMore: skip + questions.length < total,
      },
    });
  } catch (err) {
    console.error('getQuestions error:', err);
    return res.status(500).json({ message: 'Error retrieving learning questions.' });
  }
};

// Get single question with answers
exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const question = await LearningQuestion.findById(id).populate(
      'author',
      'name username avatarUrl role status'
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const answers = await LearningAnswer.find({ question: id })
      .populate('author', 'name username avatarUrl role status')
      .sort({ isAccepted: -1, createdAt: 1 });

    const currentUserId = req.user?._id;
    const qObj = question.toObject();

    const enrichedAnswers = answers.map((a) => {
      const aObj = a.toObject();
      return {
        ...aObj,
        isUpvoted: currentUserId ? a.upvotes.some((u) => u.equals(currentUserId)) : false,
        upvotesCount: a.upvotes?.length || 0,
        isOwner: currentUserId ? a.author?._id?.equals(currentUserId) : false,
      };
    });

    return res.status(200).json({
      question: {
        ...qObj,
        isUpvoted: currentUserId ? question.upvotes.some((u) => u.equals(currentUserId)) : false,
        upvotesCount: question.upvotes?.length || 0,
        isOwner: currentUserId ? question.author?._id?.equals(currentUserId) : false,
      },
      answers: enrichedAnswers,
    });
  } catch (err) {
    console.error('getQuestionById error:', err);
    return res.status(500).json({ message: 'Error retrieving question.' });
  }
};

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const { title, description, track = 'general', tags = [], lessonId = '', codeSnippet } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Question title is required.' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Question description is required.' });
    }

    const formattedTags = Array.isArray(tags)
      ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 5)
      : [];

    const newQuestion = await LearningQuestion.create({
      author: req.user._id,
      title: title.trim(),
      description: description.trim(),
      track: ['html', 'css', 'javascript', 'bootstrap', 'general'].includes(track) ? track : 'general',
      lessonId: (lessonId || '').trim(),
      tags: formattedTags,
      codeSnippet: {
        html: codeSnippet?.html || '',
        css: codeSnippet?.css || '',
        javascript: codeSnippet?.javascript || '',
      },
    });

    await newQuestion.populate('author', 'name username avatarUrl role status');

    // Notify mentions (e.g. @username, @everyone, @followers)
    try {
      await notifyMentions({
        texts: [newQuestion.title, newQuestion.description],
        senderId: req.user._id,
        refs: { question: newQuestion._id },
        directType: 'question_mention',
        broadcastType: 'everyone_mention',
      });
    } catch (mentionErr) {
      console.warn('createQuestion mention notify error:', mentionErr.message);
    }

    return res.status(201).json({
      message: 'Question posted successfully!',
      question: newQuestion,
    });
  } catch (err) {
    console.error('createQuestion error:', err);
    return res.status(500).json({ message: 'Error posting question.' });
  }
};

// Toggle question upvote
exports.toggleQuestionUpvote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const question = await LearningQuestion.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const currentUserId = req.user._id;
    const index = question.upvotes.findIndex((u) => u.equals(currentUserId));

    let isUpvoted = false;
    if (index > -1) {
      question.upvotes.splice(index, 1);
      isUpvoted = false;
    } else {
      question.upvotes.push(currentUserId);
      isUpvoted = true;
    }

    await question.save();

    return res.status(200).json({
      isUpvoted,
      upvotesCount: question.upvotes.length,
    });
  } catch (err) {
    console.error('toggleQuestionUpvote error:', err);
    return res.status(500).json({ message: 'Error updating upvote.' });
  }
};

// Create an answer
exports.createAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, codeSnippet } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Answer content cannot be empty.' });
    }

    const question = await LearningQuestion.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const newAnswer = await LearningAnswer.create({
      question: question._id,
      author: req.user._id,
      content: content.trim(),
      codeSnippet: {
        html: codeSnippet?.html || '',
        css: codeSnippet?.css || '',
        javascript: codeSnippet?.javascript || '',
      },
    });

    question.answersCount += 1;
    await question.save();

    await newAnswer.populate('author', 'name username avatarUrl role status');

    // Send notification to question author if not self
    if (!question.author.equals(req.user._id)) {
      try {
        await Notification.create({
          recipient: question.author,
          sender: req.user._id,
          type: 'question_answer',
          question: question._id,
        });
      } catch (notifyErr) {
        console.warn('Failed to send question answer notification:', notifyErr.message);
      }
    }

    // Notify any mentions inside answer content (excluding question author who already got question_answer)
    try {
      await notifyMentions({
        texts: [content.trim()],
        senderId: req.user._id,
        refs: { question: question._id },
        directType: 'question_mention',
        broadcastType: 'everyone_mention',
        excludeIds: [question.author],
      });
    } catch (mentionErr) {
      console.warn('createAnswer mention notify error:', mentionErr.message);
    }

    return res.status(201).json({
      message: 'Answer posted successfully!',
      answer: {
        ...newAnswer.toObject(),
        isUpvoted: false,
        upvotesCount: 0,
        isOwner: true,
      },
      answersCount: question.answersCount,
    });
  } catch (err) {
    console.error('createAnswer error:', err);
    return res.status(500).json({ message: 'Error posting answer.' });
  }
};

// Accept an answer (only by question author)
exports.acceptAnswer = async (req, res) => {
  try {
    const { id, answerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(answerId)) {
      return res.status(400).json({ message: 'Invalid ID specified.' });
    }

    const question = await LearningQuestion.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    if (!question.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the question author can accept an answer.' });
    }

    const answer = await LearningAnswer.findById(answerId);
    if (!answer || !answer.question.equals(question._id)) {
      return res.status(404).json({ message: 'Answer not found for this question.' });
    }

    // Unmark any previous accepted answers
    await LearningAnswer.updateMany({ question: question._id }, { isAccepted: false });

    answer.isAccepted = true;
    await answer.save();

    question.isSolved = true;
    question.acceptedAnswer = answer._id;
    await question.save();

    // Send notification to answer author
    if (!answer.author.equals(req.user._id)) {
      try {
        await Notification.create({
          recipient: answer.author,
          sender: req.user._id,
          type: 'question_accepted',
          question: question._id,
        });
      } catch (notifyErr) {
        console.warn('Failed to send question accepted notification:', notifyErr.message);
      }
    }

    return res.status(200).json({
      message: 'Answer accepted as best solution!',
      acceptedAnswerId: answer._id,
    });
  } catch (err) {
    console.error('acceptAnswer error:', err);
    return res.status(500).json({ message: 'Error accepting answer.' });
  }
};

// Toggle answer upvote
exports.toggleAnswerUpvote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Answer not found.' });
    }

    const answer = await LearningAnswer.findById(id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found.' });
    }

    const currentUserId = req.user._id;
    const index = answer.upvotes.findIndex((u) => u.equals(currentUserId));

    let isUpvoted = false;
    if (index > -1) {
      answer.upvotes.splice(index, 1);
      isUpvoted = false;
    } else {
      answer.upvotes.push(currentUserId);
      isUpvoted = true;
    }

    await answer.save();

    return res.status(200).json({
      isUpvoted,
      upvotesCount: answer.upvotes.length,
    });
  } catch (err) {
    console.error('toggleAnswerUpvote error:', err);
    return res.status(500).json({ message: 'Error updating answer upvote.' });
  }
};

// ==========================================
// 3. Quizzes & Certification Exams
// ==========================================

// Submit Lesson Quiz & award XP
exports.submitQuiz = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { lessonId, track, score, passed } = req.body;
    if (!lessonId) {
      return res.status(400).json({ message: 'lessonId is required.' });
    }

    let progress = await LearningProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = new LearningProgress({
        user: req.user._id,
        completedLessons: [],
        passedQuizzes: [],
        xp: 0,
      });
    }

    const isAlreadyPassed = progress.passedQuizzes.includes(lessonId);
    let xpEarned = 0;

    if (passed) {
      if (!isAlreadyPassed) {
        progress.passedQuizzes.push(lessonId);
        xpEarned += 25; // 25 XP for passing quiz
      }
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
        xpEarned += 25; // 25 XP for completing lesson
      }
      progress.xp += xpEarned;
    }

    if (track) progress.currentTrack = track;
    progress.lastActiveAt = new Date();
    await progress.save();

    return res.status(200).json({
      message: passed ? 'Knowledge check passed!' : 'Quiz submitted.',
      passed,
      score,
      xpEarned,
      progress,
    });
  } catch (err) {
    console.error('submitQuiz error:', err);
    return res.status(500).json({ message: 'Error submitting quiz.' });
  }
};

// Submit Final Track Certification Exam & issue certificate
exports.submitExam = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { trackId, trackTitle, score, studentName } = req.body;
    if (!trackId || score === undefined) {
      return res.status(400).json({ message: 'trackId and score are required.' });
    }

    const passed = score >= 80;
    let progress = await LearningProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = new LearningProgress({ user: req.user._id, completedLessons: [], xp: 0 });
    }

    let certificate = null;
    let xpEarned = 0;

    if (passed) {
      const existingCert = progress.certificates.find((c) => c.trackId === trackId);
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const certificateId = existingCert
        ? existingCert.certificateId
        : `CF-CERT-${trackId.toUpperCase()}-${randomSuffix}`;

      certificate = {
        trackId,
        trackTitle: trackTitle || trackId.toUpperCase(),
        certificateId,
        score,
        issuedAt: new Date(),
        studentName: studentName || req.user.name || req.user.username,
      };

      if (!existingCert) {
        progress.certificates.push(certificate);
        xpEarned = 150; // 150 XP for earning certificate
        progress.xp += xpEarned;
      } else {
        // Update score if higher
        if (score > existingCert.score) {
          existingCert.score = score;
        }
      }

      progress.lastActiveAt = new Date();
      await progress.save();
    }

    return res.status(200).json({
      message: passed ? 'Congratulations! You passed the Certification Exam!' : 'Exam completed.',
      passed,
      score,
      xpEarned,
      certificate,
      progress,
    });
  } catch (err) {
    console.error('submitExam error:', err);
    return res.status(500).json({ message: 'Error submitting exam.' });
  }
};

// Get Certificate by Verification ID
exports.getCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const progress = await LearningProgress.findOne({
      'certificates.certificateId': certificateId,
    }).populate('user', 'username name avatar');

    if (!progress) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }

    const cert = progress.certificates.find((c) => c.certificateId === certificateId);
    return res.status(200).json({
      certificate: cert,
      user: progress.user,
    });
  } catch (err) {
    console.error('getCertificate error:', err);
    return res.status(500).json({ message: 'Error retrieving certificate.' });
  }
};

