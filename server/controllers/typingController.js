const mongoose = require('mongoose');
const TypingResult = require('../models/TypingResult');
const TypingProfile = require('../models/TypingProfile');
const User = require('../models/User');

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
    const userId = req.user._id;
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

    // Basic anti-cheat: reject impossible speeds
    if (parsedWpm > 300) {
      return res.status(400).json({ message: 'Score flagged for review by anti-cheat.' });
    }

    const currentWeek = getIsoWeekString();

    const result = new TypingResult({
      user: userId,
      wpm: parsedWpm,
      rawWpm: parsedRawWpm,
      accuracy: parsedAcc,
      duration: parsedDur,
      mode,
      charCount: Number(charCount) || 0,
      errorCount: Number(errorCount) || 0,
      highestCombo: Number(highestCombo) || 0,
      consistency: Number(consistency) || 0,
      telemetry: Array.isArray(telemetry) ? telemetry.slice(0, 120) : [],
      weeklyContestWeek: currentWeek,
    });

    await result.save();

    // XP calculation: base on WPM and accuracy
    const xpGained = Math.max(10, Math.round(parsedWpm * 2 + parsedAcc * 0.5));

    // Update or create user's typing profile
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

    // Keep last 10 recent scores
    profile.recentScores.unshift({
      wpm: parsedWpm,
      accuracy: parsedAcc,
      mode,
      duration: parsedDur,
      date: new Date(),
    });
    if (profile.recentScores.length > 10) {
      profile.recentScores = profile.recentScores.slice(0, 10);
    }

    await profile.save();

    return res.status(201).json({
      message: 'Result recorded.',
      result,
      xpGained,
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
    const { period = 'weekly', duration, mode } = req.query;
    const currentUserId = req.user ? req.user._id : null;

    const filter = {};

    if (duration && duration !== 'all') {
      filter.duration = Number(duration);
    }

    if (mode && mode !== 'all') {
      filter.mode = mode;
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

    // Compute user's rank
    let userRank = null;
    if (currentUserId) {
      const userIndex = leaderboard.findIndex((item) => item.user._id.equals(currentUserId));
      if (userIndex !== -1) {
        userRank = userIndex + 1;
      }
    }

    return res.status(200).json({
      period,
      contestWeek: getIsoWeekString(),
      leaderboard,
      userRank,
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
