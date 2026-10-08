const mongoose = require('mongoose');
const TypingResult = require('../models/TypingResult');
const TypingProfile = require('../models/TypingProfile');
const TypingChallenge = require('../models/TypingChallenge');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Helper to get ISO week string (e.g., '2026-W41')
const getIsoWeekString = (date = new Date()) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

// Determine rank title based on WPM
const computeRankTitle = (wpm) => {
  if (wpm >= 120) return 'Transcendent';
  if (wpm >= 100) return 'Cyber Master';
  if (wpm >= 80) return 'Speed Demon';
  if (wpm >= 60) return 'Swift Hacker';
  if (wpm >= 40) return 'Apprentice';
  return 'Novice';
};

// Submit typing practice test result
exports.submitResult = async (req, res) => {
  try {
    let userId = req.user ? req.user._id : null;

    if (!userId) {
      let guestUser = await User.findOne({ username: 'guest' });
      if (!guestUser) {
        guestUser = await User.create({
          name: 'Guest Explorer',
          username: 'guest',
          email: 'guest@clearfeed.local',
          password: 'GuestPassword#2026',
          bio: 'Exploring Clearfeed as a guest community visitor.',
          avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Guest&backgroundColor=0284c7&textColor=ffffff',
          role: 'student',
          isApproved: true,
        });
      }
      userId = guestUser._id;
    }

    const {
      wpm,
      rawWpm,
      accuracy,
      duration,
      mode = 'words_200',
      charCount = 0,
      errorCount = 0,
      highestCombo = 0,
      consistency = 0,
      telemetry = [],
    } = req.body;

    const parsedWpm = Math.max(0, Math.min(350, Math.round(Number(wpm) || 0)));
    const parsedRawWpm = Math.max(0, Math.min(350, Math.round(Number(rawWpm) || parsedWpm)));
    const parsedAcc = Math.max(0, Math.min(100, Math.round(Number(accuracy) || 0)));
    const parsedDur = [15, 30, 60, 120].includes(Number(duration)) ? Number(duration) : 60;
    const sanitizedMode = typeof mode === 'string' && mode.trim() ? mode.trim() : 'words_200';

    // Basic anti-cheat: reject impossible speeds
    if (parsedWpm > 300) {
      return res.status(400).json({ message: 'Score flagged for review by anti-cheat.' });
    }

    const currentWeek = getIsoWeekString();

    // Storage optimization: clamp telemetry to at most 30 integer values to save disk quota
    const compactTelemetry = Array.isArray(telemetry)
      ? telemetry.slice(0, 30).map((v) => Math.round(Number(v) || 0))
      : [];

    const result = new TypingResult({
      user: userId,
      wpm: parsedWpm,
      rawWpm: parsedRawWpm,
      accuracy: parsedAcc,
      duration: parsedDur,
      mode: sanitizedMode,
      charCount: Number(charCount) || 0,
      errorCount: Number(errorCount) || 0,
      highestCombo: Number(highestCombo) || 0,
      consistency: Number(consistency) || 0,
      telemetry: compactTelemetry,
      weeklyContestWeek: currentWeek,
      expireAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Auto-purge practice records in 14 days
    });

    await result.save();

    // Storage optimization: Keep at most 20 recent TypingResult documents per user in Atlas
    const userResultCount = await TypingResult.countDocuments({ user: userId });
    if (userResultCount > 20) {
      const oldestExcess = await TypingResult.find({ user: userId })
        .sort({ wpm: 1, createdAt: 1 })
        .limit(userResultCount - 20)
        .select('_id');
      if (oldestExcess.length > 0) {
        await TypingResult.deleteMany({ _id: { $in: oldestExcess.map((d) => d._id) } });
      }
    }

    // XP calculation: base on WPM and accuracy
    const xpGained = Math.max(10, Math.round(parsedWpm * 2 + parsedAcc * 0.5));

    // Update or create user's typing profile (permanent records live safely here)
    let profile = await TypingProfile.findOne({ user: userId });
    if (!profile) {
      profile = new TypingProfile({
        user: userId,
        testsCompleted: 0,
        bestWpm: 0,
        avgWpm: 0,
        bestAccuracy: 0,
        highestCombo: 0,
        xp: 0,
        badges: ['⌨️ Keyboard Initiate'],
      });
    }

    const prevTests = profile.testsCompleted || 0;
    const newTests = prevTests + 1;
    const newAvgWpm = Math.round(((profile.avgWpm || 0) * prevTests + parsedWpm) / newTests);
    const newBestWpm = Math.max(profile.bestWpm || 0, parsedWpm);
    const newBestAcc = Math.max(profile.bestAccuracy || 0, parsedAcc);
    const newHighestCombo = Math.max(profile.highestCombo || 0, Number(highestCombo) || 0);

    profile.testsCompleted = newTests;
    profile.avgWpm = newAvgWpm;
    profile.bestWpm = newBestWpm;
    profile.bestAccuracy = newBestAcc;
    profile.highestCombo = newHighestCombo;
    profile.xp = (profile.xp || 0) + xpGained;
    profile.currentRank = computeRankTitle(newBestWpm);

    // Badges unlock checks
    const badgesSet = new Set(profile.badges || ['⌨️ Keyboard Initiate']);
    if (newBestWpm >= 60) badgesSet.add('⚡ Swift Hacker (60+ WPM)');
    if (newBestWpm >= 80) badgesSet.add('🔥 Speed Demon (80+ WPM)');
    if (newBestWpm >= 100) badgesSet.add('🚀 Cyber Master (100+ WPM)');
    if (newBestWpm >= 120) badgesSet.add('👑 Transcendent (120+ WPM)');
    if (newHighestCombo >= 50) badgesSet.add('🎯 Streak King (50x Combo)');
    if (newHighestCombo >= 100) badgesSet.add('💥 Supernova (100x Combo)');
    if (parsedAcc === 100 && parsedWpm >= 50) badgesSet.add('🎯 Laser Precision (100% Acc)');
    if (newTests >= 10) badgesSet.add('🏃 Arena Regular (10 Tests)');
    if (newTests >= 50) badgesSet.add('🏆 Typing Veteran (50 Tests)');

    profile.badges = Array.from(badgesSet);

    // Keep last 10 recent scores (bounded array for strict storage limits)
    profile.recentScores.unshift({
      wpm: parsedWpm,
      accuracy: parsedAcc,
      mode: sanitizedMode,
      duration: parsedDur,
      date: new Date(),
    });
    if (profile.recentScores.length > 10) {
      profile.recentScores = profile.recentScores.slice(0, 10);
    }

    await profile.save();

    // Calculate user's immediate rank for this specific duration & mode in all-time
    const higherCount = await TypingResult.distinct('user', {
      duration: parsedDur,
      mode: sanitizedMode,
      $or: [
        { wpm: { $gt: parsedWpm } },
        { wpm: parsedWpm, accuracy: { $gt: parsedAcc } },
      ],
    });
    const immediateRank = higherCount.length + 1;

    return res.status(201).json({
      message: 'Result recorded.',
      result,
      xpGained,
      userRank: immediateRank,
      profile: {
        bestWpm: profile.bestWpm,
        avgWpm: profile.avgWpm,
        currentRank: profile.currentRank,
        xp: profile.xp,
        testsCompleted: profile.testsCompleted,
        badges: profile.badges,
      },
    });
  } catch (err) {
    console.error('submitResult error:', err);
    return res.status(500).json({ message: 'Failed to record score.' });
  }
};

// Get Leaderboards (Weekly Contest, Daily Sprint, All-Time Legends)
exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'all', duration, mode } = req.query;
    const currentUserId = req.user ? req.user._id : null;

    const filter = {};

    if (duration && duration !== 'all') {
      filter.duration = Number(duration);
    }

    if (mode && mode !== 'all') {
      if (mode === 'words') {
        filter.mode = { $in: ['words_200', 'words_1000', 'words_5000', 'words'] };
      } else {
        filter.mode = mode;
      }
    }

    if (period === 'weekly') {
      filter.weeklyContestWeek = getIsoWeekString();
    } else if (period === 'daily') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      filter.createdAt = { $gte: yesterday };
    }

    // Aggregate highest WPM per user to ensure fair competition (1 entry per user)
    const pipeline = [
      { $match: filter },
      { $sort: { wpm: -1, accuracy: -1, createdAt: 1 } },
      {
        $group: {
          _id: '$user',
          bestWpm: { $first: '$wpm' },
          accuracy: { $first: '$accuracy' },
          duration: { $first: '$duration' },
          mode: { $first: '$mode' },
          highestCombo: { $first: '$highestCombo' },
          telemetry: { $first: '$telemetry' },
          createdAt: { $first: '$createdAt' },
          resultId: { $first: '$_id' },
        },
      },
      { $sort: { bestWpm: -1, accuracy: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $match: {
          'user.username': {
            $nin: ['amina_dev', 'tariq_codes', 'elena_r', 'dchen_fullstack', 'sofia_ux', 'dr_vance'],
          },
        },
      },
      {
        $project: {
          _id: '$resultId',
          wpm: '$bestWpm',
          accuracy: 1,
          duration: 1,
          mode: 1,
          highestCombo: 1,
          telemetry: 1,
          createdAt: 1,
          user: {
            _id: '$user._id',
            name: '$user.name',
            username: '$user.username',
            avatarUrl: '$user.avatarUrl',
            role: '$user.role',
            status: '$user.status',
          },
        },
      },
    ];

    const leaderboard = await TypingResult.aggregate(pipeline);

    // Compute user's rank safely
    let userRank = null;
    let userBestScore = null;
    if (currentUserId) {
      const currentUserIdStr = currentUserId.toString();
      const userIndex = leaderboard.findIndex(
        (item) => item.user && item.user._id && item.user._id.toString() === currentUserIdStr
      );

      if (userIndex !== -1) {
        userRank = userIndex + 1;
        userBestScore = leaderboard[userIndex];
      } else {
        // If outside top 50, compute accurate placement
        const userBest = await TypingResult.findOne({
          user: currentUserId,
          ...filter,
        }).sort({ wpm: -1, accuracy: -1 });

        if (userBest) {
          userBestScore = {
            wpm: userBest.wpm,
            accuracy: userBest.accuracy,
            duration: userBest.duration,
            mode: userBest.mode,
          };
          const higherScoresCount = await TypingResult.distinct('user', {
            ...filter,
            $or: [
              { wpm: { $gt: userBest.wpm } },
              { wpm: userBest.wpm, accuracy: { $gt: userBest.accuracy } },
            ],
          });
          userRank = higherScoresCount.length + 1;
        }
      }
    }

    return res.status(200).json({
      period,
      contestWeek: getIsoWeekString(),
      leaderboard,
      userRank,
      userBestScore,
    });
  } catch (err) {
    console.error('getLeaderboard error:', err);
    return res.status(500).json({ message: 'Failed to load leaderboard.' });
  }
};

// Get user typing stats & profile
exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const targetUser = await User.findOne({ username: username.toLowerCase() });

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let profile = await TypingProfile.findOne({ user: targetUser._id });
    if (!profile) {
      profile = {
        testsCompleted: 0,
        bestWpm: 0,
        avgWpm: 0,
        bestAccuracy: 0,
        highestCombo: 0,
        xp: 0,
        currentRank: 'Novice',
        badges: ['⌨️ Keyboard Initiate'],
        recentScores: [],
      };
    }

    return res.status(200).json({
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        username: targetUser.username,
        avatarUrl: targetUser.avatarUrl,
        role: targetUser.role,
      },
      profile,
    });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ message: 'Failed to retrieve typing profile.' });
  }
};

// Get Weekly Ongoing Contest Info
exports.getWeeklyContest = async (req, res) => {
  try {
    const weekId = getIsoWeekString();

    // Calculate end of current week (Sunday midnight UTC)
    const now = new Date();
    const currentDay = now.getUTCDay();
    const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
    const sundayMidnight = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilSunday, 23, 59, 59)
    );
    const msRemaining = Math.max(0, sundayMidnight.getTime() - now.getTime());

    const totalParticipants = await TypingResult.distinct('user', { weeklyContestWeek: weekId });

    return res.status(200).json({
      weekId,
      title: `Clearfeed Typing Championship · ${weekId}`,
      msRemaining,
      participantsCount: totalParticipants.length,
      prizeTitle: 'Champion Badge + 500 XP',
    });
  } catch (err) {
    console.error('getWeeklyContest error:', err);
    return res.status(500).json({ message: 'Failed to load contest info.' });
  }
};

// Default words pool if not passed from client
const DEFAULT_WORDS_POOL = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they',
  'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'his',
  'from', 'they', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would',
  'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
  'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
  'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use',
  'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'us', 'code', 'speed', 'arena', 'system', 'build'
];

// Issue / create a 1v1 challenge (ultra-efficient storage format)
exports.createChallenge = async (req, res) => {
  try {
    let challengerId = req.user ? req.user._id : null;
    let challengerUsername = req.user ? req.user.username : 'guest';

    if (!challengerId) {
      let guestUser = await User.findOne({ username: 'guest' });
      if (!guestUser) {
        guestUser = await User.create({
          name: 'Guest Explorer',
          username: 'guest',
          email: 'guest@clearfeed.local',
          password: 'GuestPassword#2026',
          bio: 'Exploring Clearfeed as a guest community visitor.',
          avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Guest&backgroundColor=0284c7&textColor=ffffff',
          role: 'student',
          isApproved: true,
        });
      }
      challengerId = guestUser._id;
      challengerUsername = guestUser.username;
    }

    const {
      challengedUserId,
      challengedUsername,
      targetUserId,
      targetUsername,
      duration = 15,
      mode = 'words_200',
      words = [],
      quoteAuthor = null,
      challengerWpm,
      challengerAccuracy = 100,
      challengerRawWpm,
      challengerTelemetry = [],
      customMessage,
      carId = 'street_phantom',
      carName = 'Supercar',
      isRace = false,
    } = req.body;

    const actualTargetId = challengedUserId || targetUserId;
    const actualTargetUsername = challengedUsername || targetUsername;

    let targetUser = null;
    if (actualTargetId && mongoose.Types.ObjectId.isValid(actualTargetId)) {
      targetUser = await User.findById(actualTargetId);
    }
    if (!targetUser && actualTargetUsername) {
      targetUser = await User.findOne({ username: String(actualTargetUsername).toLowerCase().trim() });
    }
    if (!targetUser && actualTargetId && typeof actualTargetId === 'string') {
      targetUser = await User.findOne({ username: actualTargetId.toLowerCase().trim() });
    }

    if (!targetUser) {
      return res.status(404).json({ message: `Racer @${actualTargetUsername || 'user'} not found in community directory.` });
    }

    if (targetUser._id.equals(challengerId)) {
      return res.status(400).json({ message: 'You cannot challenge yourself!' });
    }

    const parsedWpm = Math.max(0, Math.min(350, Math.round(Number(challengerWpm) || 0)));
    const parsedAcc = Math.max(0, Math.min(100, Math.round(Number(challengerAccuracy) || 100)));
    const parsedDur = [15, 30, 60, 120].includes(Number(duration)) ? Number(duration) : 15;
    const isHighwayRace = Boolean(isRace || mode === 'race_highway');

    // Storage optimization: cap challenge words to 35 max instead of 150 (saving ~80% BSON storage)
    let challengeWords = Array.isArray(words) && words.length > 0 ? words.slice(0, 35) : [];
    if (challengeWords.length === 0) {
      const pool = [...DEFAULT_WORDS_POOL];
      for (let i = 0; i < 35; i++) {
        challengeWords.push(pool[Math.floor(Math.random() * pool.length)]);
      }
    }

    // Storage optimization: cap telemetry to 30 integer values
    const compactTelemetry = Array.isArray(challengerTelemetry)
      ? challengerTelemetry.slice(0, 30).map((v) => Math.round(Number(v) || 0))
      : [];

    const defaultMsg = isHighwayRace
      ? `🏎️ I challenge you to a Highway Race in the Typing Arena! My car is the ${carName}. Let's burn some rubber! ⚡`
      : 'I challenge you to beat my typing speed in Clearfeed Arena!';

    // Anti-bloat protection: prune pending challenges if challenger already has >= 10 pending
    const challengerPendingCount = await TypingChallenge.countDocuments({
      challenger: challengerId,
      status: 'pending',
    });
    if (challengerPendingCount >= 10) {
      const oldestPending = await TypingChallenge.find({ challenger: challengerId, status: 'pending' })
        .sort({ createdAt: 1 })
        .limit(challengerPendingCount - 9)
        .select('_id');
      if (oldestPending.length > 0) {
        await TypingChallenge.deleteMany({ _id: { $in: oldestPending.map((d) => d._id) } });
      }
    }

    const challenge = new TypingChallenge({
      challenger: challengerId,
      challenged: targetUser._id,
      duration: parsedDur,
      mode: isHighwayRace ? 'race_highway' : (mode || 'words_200').trim(),
      words: challengeWords,
      quoteAuthor,
      challengerWpm: parsedWpm,
      challengerAccuracy: parsedAcc,
      challengerRawWpm: Math.round(Number(challengerRawWpm) || parsedWpm),
      challengerTelemetry: compactTelemetry,
      customMessage: (customMessage?.trim() || defaultMsg).slice(0, 200),
      carId: carId || 'street_phantom',
      isRace: isHighwayRace,
      status: 'pending',
      expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Auto-expire pending challenge after 7 days
    });

    await challenge.save();

    // 1. Create notification for challenged user
    await Notification.create({
      recipient: targetUser._id,
      sender: challengerId,
      type: 'typing_challenge',
      typingChallenge: challenge._id,
    });

    // 2. Drop duel invitation message into their direct conversation
    try {
      let conversation = await Conversation.findOne({
        participants: { $all: [challengerId, targetUser._id] },
      });

      const duelTitle = isHighwayRace
        ? `🏎️ Highway Supercar Race Challenge: Can you beat my ${parsedWpm} WPM on the track in my ${carName}?`
        : `⚔️ Typing Duel Challenge: Can you beat my ${parsedWpm} WPM in ${parsedDur}s?`;

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [challengerId, targetUser._id],
          unreadCounts: new Map([[targetUser._id.toString(), 1]]),
          lastMessage: {
            text: duelTitle,
            sender: challengerId,
            createdAt: new Date(),
          },
        });
      } else {
        const currentUnread = conversation.unreadCounts?.get(targetUser._id.toString()) || 0;
        if (!conversation.unreadCounts) conversation.unreadCounts = new Map();
        conversation.unreadCounts.set(targetUser._id.toString(), currentUnread + 1);
        conversation.lastMessage = {
          text: duelTitle,
          sender: challengerId,
          createdAt: new Date(),
        };
        await conversation.save();
      }

      await Message.create({
        conversation: conversation._id,
        sender: challengerId,
        recipient: targetUser._id,
        text: `${duelTitle}\n"${challenge.customMessage}"`,
        typingChallenge: challenge._id,
      });
    } catch (msgErr) {
      console.warn('Could not post duel message to conversation:', msgErr);
    }

    return res.status(201).json({
      message: `Challenge sent to @${targetUser.username}!`,
      challenge,
    });
  } catch (err) {
    console.error('createChallenge error:', err);
    return res.status(500).json({ message: 'Failed to issue typing challenge.' });
  }
};

// Get current user's challenges (incoming, outgoing, history)
exports.getChallenges = async (req, res) => {
  try {
    let userId = req.user ? req.user._id : null;

    if (!userId && req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
      userId = req.query.userId;
    }
    if (!userId && req.query.username) {
      const u = await User.findOne({ username: req.query.username.toLowerCase().trim() });
      if (u) userId = u._id;
    }
    if (!userId) {
      const guest = await User.findOne({ username: 'guest' });
      if (guest) userId = guest._id;
    }

    if (!userId) {
      return res.status(200).json({ incoming: [], outgoing: [], history: [] });
    }

    const [incoming, outgoing, history] = await Promise.all([
      TypingChallenge.find({ challenged: userId, status: 'pending' })
        .populate('challenger', 'name username avatarUrl')
        .sort({ createdAt: -1 })
        .limit(15),
      TypingChallenge.find({ challenger: userId, status: 'pending' })
        .populate('challenged', 'name username avatarUrl')
        .sort({ createdAt: -1 })
        .limit(15),
      TypingChallenge.find({
        $or: [{ challenger: userId }, { challenged: userId }],
        status: { $in: ['completed', 'declined'] },
      })
        .populate('challenger', 'name username avatarUrl')
        .populate('challenged', 'name username avatarUrl')
        .populate('winner', 'name username')
        .sort({ updatedAt: -1 })
        .limit(15),
    ]);

    return res.status(200).json({
      incoming,
      outgoing,
      history,
    });
  } catch (err) {
    console.error('getChallenges error:', err);
    return res.status(500).json({ message: 'Failed to retrieve challenges.' });
  }
};

// Get single challenge by ID
exports.getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Invalid challenge ID.' });
    }

    const challenge = await TypingChallenge.findById(id)
      .populate('challenger', 'name username avatarUrl')
      .populate('challenged', 'name username avatarUrl')
      .populate('winner', 'name username avatarUrl');

    if (!challenge) {
      return res.status(404).json({ message: 'Typing challenge not found.' });
    }

    return res.status(200).json({ challenge });
  } catch (err) {
    console.error('getChallengeById error:', err);
    return res.status(500).json({ message: 'Failed to load challenge details.' });
  }
};

// Complete challenge race (updates document and sets 3-day auto-purge TTL)
exports.completeChallenge = async (req, res) => {
  try {
    let userId = req.user ? req.user._id : null;
    if (!userId) {
      const guest = await User.findOne({ username: 'guest' });
      if (guest) userId = guest._id;
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Invalid challenge ID.' });
    }

    const { wpm, accuracy = 100, rawWpm, telemetry = [] } = req.body;

    const challenge = await TypingChallenge.findById(id)
      .populate('challenger', 'name username avatarUrl')
      .populate('challenged', 'name username avatarUrl');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found.' });
    }

    if (challenge.status === 'completed') {
      return res.status(400).json({ message: 'Challenge has already been completed.' });
    }

    const parsedWpm = Math.max(0, Math.min(350, Math.round(Number(wpm) || 0)));
    const parsedAcc = Math.max(0, Math.min(100, Math.round(Number(accuracy) || 100)));
    const parsedRaw = Math.max(0, Math.min(350, Math.round(Number(rawWpm) || parsedWpm)));
    const compactTelemetry = Array.isArray(telemetry)
      ? telemetry.slice(0, 30).map((v) => Math.round(Number(v) || 0))
      : [];

    // If challenger is setting initial benchmark score
    if (userId && challenge.challenger._id.equals(userId) && (!challenge.challengerWpm || challenge.challengerWpm === 0)) {
      challenge.challengerWpm = parsedWpm;
      challenge.challengerAccuracy = parsedAcc;
      challenge.challengerRawWpm = parsedRaw;
      challenge.challengerTelemetry = compactTelemetry;
      await challenge.save();
      return res.status(200).json({
        message: `Benchmark set to ${parsedWpm} WPM! Challenge sent to @${challenge.challenged.username}.`,
        challenge,
        isBenchmarkSet: true,
      });
    }

    challenge.challengedWpm = parsedWpm;
    challenge.challengedAccuracy = parsedAcc;
    challenge.challengedRawWpm = parsedRaw;
    challenge.challengedTelemetry = compactTelemetry;
    challenge.status = 'completed';
    challenge.completedAt = new Date();
    // Storage optimization: set auto-purge TTL to 3 days after completion
    challenge.expireAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    // Determine winner
    let winnerId = null;
    let isWinner = false;
    let isTie = false;

    if (parsedWpm > challenge.challengerWpm) {
      winnerId = challenge.challenged._id;
      isWinner = userId ? challenge.challenged._id.equals(userId) : true;
    } else if (challenge.challengerWpm > parsedWpm) {
      winnerId = challenge.challenger._id;
      isWinner = userId ? challenge.challenger._id.equals(userId) : false;
    } else {
      isTie = true;
    }

    challenge.winner = winnerId;
    await challenge.save();

    // XP calculation: 150 for winner, 60 for participant
    const xpGained = isWinner ? 150 : (isTie ? 100 : 60);

    if (userId) {
      // Update challenged profile
      let challengedProfile = await TypingProfile.findOne({ user: userId });
      if (!challengedProfile) {
        challengedProfile = new TypingProfile({ user: userId });
      }
      challengedProfile.xp = (challengedProfile.xp || 0) + xpGained;
      challengedProfile.testsCompleted = (challengedProfile.testsCompleted || 0) + 1;
      challengedProfile.bestWpm = Math.max(challengedProfile.bestWpm || 0, parsedWpm);
      challengedProfile.bestAccuracy = Math.max(challengedProfile.bestAccuracy || 0, parsedAcc);
      if (winnerId && winnerId.equals(userId)) {
        challengedProfile.duelsWon = (challengedProfile.duelsWon || 0) + 1;
      }
      await challengedProfile.save();
    }

    // Also update challenger XP and duelsWon if challenger won
    if (winnerId && winnerId.equals(challenge.challenger._id)) {
      let challengerProfile = await TypingProfile.findOne({ user: challenge.challenger._id });
      if (challengerProfile) {
        challengerProfile.xp = (challengerProfile.xp || 0) + 150;
        challengerProfile.duelsWon = (challengerProfile.duelsWon || 0) + 1;
        await challengerProfile.save();
      }
    }

    // Save as standard TypingResult so it counts for leaderboard (with auto-expire TTL)
    if (userId) {
      try {
        const result = new TypingResult({
          user: userId,
          wpm: parsedWpm,
          rawWpm: parsedRaw,
          accuracy: parsedAcc,
          duration: challenge.duration,
          mode: challenge.mode,
          telemetry: compactTelemetry,
          weeklyContestWeek: getIsoWeekString(),
          expireAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Auto-expire in 14 days
        });
        await result.save();

        // Prune excess TypingResult entries if > 20
        const resultCount = await TypingResult.countDocuments({ user: userId });
        if (resultCount > 20) {
          const excess = await TypingResult.find({ user: userId })
            .sort({ wpm: 1, createdAt: 1 })
            .limit(resultCount - 20)
            .select('_id');
          if (excess.length > 0) {
            await TypingResult.deleteMany({ _id: { $in: excess.map((r) => r._id) } });
          }
        }
      } catch (saveErr) {
        console.warn('Could not record challenge as typing result:', saveErr);
      }
    }

    // Notify challenger that the duel was completed
    if (userId) {
      const otherUserId = challenge.challenged._id.equals(userId)
        ? challenge.challenger._id
        : challenge.challenged._id;

      await Notification.create({
        recipient: otherUserId,
        sender: userId,
        type: 'typing_challenge_result',
        typingChallenge: challenge._id,
      });
    }

    return res.status(200).json({
      message: isWinner
        ? '🏆 VICTORY! You won the typing duel!'
        : isTie
        ? '🤝 DRAW! An exact match!'
        : '⚔️ Duel completed! Good battle!',
      challenge,
      isWinner,
      isTie,
      xpGained,
    });
  } catch (err) {
    console.error('completeChallenge error:', err);
    return res.status(500).json({ message: 'Failed to complete challenge.' });
  }
};

// Decline challenge (sets 1-day auto-purge TTL)
exports.declineChallenge = async (req, res) => {
  try {
    let userId = req.user ? req.user._id : null;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Invalid challenge ID.' });
    }

    const query = userId
      ? { _id: id, $or: [{ challenged: userId }, { challenger: userId }] }
      : { _id: id };

    const challenge = await TypingChallenge.findOne(query);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found.' });
    }

    challenge.status = 'declined';
    challenge.expireAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // Purge after 1 day
    await challenge.save();

    return res.status(200).json({ message: 'Challenge declined.', challenge });
  } catch (err) {
    console.error('declineChallenge error:', err);
    return res.status(500).json({ message: 'Failed to decline challenge.' });
  }
};


// Admin: Remove specific leaderboard entry / score
exports.removeLeaderboardEntry = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if valid ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    let result = null;

    if (isObjectId) {
      result = await TypingResult.findById(id);
    }

    if (!result) {
      // If not found by direct _id, it could be a query by user ID
      if (isObjectId) {
        const deletedMany = await TypingResult.deleteMany({ user: id });
        if (deletedMany.deletedCount > 0) {
          return res.status(200).json({
            success: true,
            message: `Admin removed ${deletedMany.deletedCount} scores for user.`,
          });
        }
      }
      return res.status(200).json({
        success: true,
        message: 'Leaderboard score removed successfully.',
      });
    }

    const userId = result.user;
    const { duration } = result;

    // Delete the specific typing result
    await TypingResult.findByIdAndDelete(id);

    // Recalculate user's bests for that duration & overall profile
    const remainingForDur = await TypingResult.find({ user: userId, duration })
      .sort({ wpm: -1, accuracy: -1 })
      .limit(1);

    const userProfile = await TypingProfile.findOne({ user: userId });
    if (userProfile) {
      const bests = userProfile.personalBests || new Map();
      const durKey = String(duration);

      if (remainingForDur.length > 0) {
        bests.set(durKey, {
          wpm: remainingForDur[0].wpm,
          rawWpm: remainingForDur[0].rawWpm,
          accuracy: remainingForDur[0].accuracy,
          highestCombo: remainingForDur[0].highestCombo,
          date: remainingForDur[0].createdAt,
        });
      } else {
        bests.delete(durKey);
      }

      // Re-evaluate overall best WPM
      const allRemaining = await TypingResult.find({ user: userId })
        .sort({ wpm: -1 })
        .limit(1);

      userProfile.bestWpm = allRemaining.length > 0 ? allRemaining[0].wpm : 0;
      userProfile.testsCompleted = Math.max(0, (userProfile.testsCompleted || 1) - 1);
      userProfile.personalBests = bests;
      await userProfile.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Typing leaderboard score removed by admin.',
      deletedId: id,
    });
  } catch (err) {
    console.error('removeLeaderboardEntry error:', err);
    return res.status(500).json({ message: 'Failed to remove score from leaderboard: ' + err.message });
  }
};

// Admin: Disqualify / purge a user completely from the typing leaderboard
exports.removeUserFromLeaderboard = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    const deleted = await TypingResult.deleteMany({ user: userId });

    const profile = await TypingProfile.findOne({ user: userId });
    if (profile) {
      profile.bestWpm = 0;
      profile.personalBests = new Map();
      profile.testsCompleted = 0;
      profile.xp = 0;
      await profile.save();
    }

    return res.status(200).json({
      success: true,
      message: `User disqualified. Purged ${deleted.deletedCount} scores from leaderboard.`,
      purgedCount: deleted.deletedCount,
    });
  } catch (err) {
    console.error('removeUserFromLeaderboard error:', err);
    return res.status(500).json({ message: 'Failed to purge user from leaderboard: ' + err.message });
  }
};
