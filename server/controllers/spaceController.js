const { getIO } = require('../sockets/socketManager');
const { spaceSessionManager, SpaceRole } = require('../services/spaceSessionManager');
const SpaceRoom = require('../models/SpaceRoom');

/**
 * List all active and live spaces
 */
exports.getActiveSpaces = async (req, res) => {
  try {
    const spaces = spaceSessionManager.getActiveSpaces();
    return res.status(200).json({ spaces });
  } catch (err) {
    console.error('getActiveSpaces error:', err);
    return res.status(500).json({ message: 'Failed to retrieve active spaces.' });
  }
};

/**
 * Get details for a specific Space by ID
 */
exports.getSpaceById = async (req, res) => {
  try {
    const roomId = req.params.id;
    const space = spaceSessionManager.getSpace(roomId);

    if (space) {
      return res.status(200).json({ space });
    }

    // Check database for ended or scheduled space record
    const dbRoom = await SpaceRoom.findOne({ roomId }).populate('host', 'name username avatarUrl');
    if (!dbRoom) {
      return res.status(404).json({ message: 'Space is not active or has ended.' });
    }

    return res.status(200).json({
      space: {
        id: dbRoom.roomId,
        roomId: dbRoom.roomId,
        title: dbRoom.title,
        description: dbRoom.description,
        topic: dbRoom.topicTags[0] || 'General',
        topicTags: dbRoom.topicTags,
        visibility: dbRoom.visibility,
        host: dbRoom.host,
        status: dbRoom.status,
        startedAt: dbRoom.startedAt,
        endedAt: dbRoom.endedAt,
        isLive: dbRoom.status === 'live',
        speakersCount: 0,
        listenersCount: 0,
        totalParticipants: 0,
        speakers: [],
        listeners: [],
      },
    });
  } catch (err) {
    console.error('getSpaceById error:', err);
    return res.status(500).json({ message: 'Failed to retrieve space.' });
  }
};

/**
 * Create a new live audio Space
 */
exports.createSpace = async (req, res) => {
  try {
    const { title, description, topic, topicTags, visibility } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Space title is required.' });
    }

    const hostUser = req.user
      ? {
          _id: req.user._id.toString(),
          name: req.user.name,
          username: req.user.username,
          avatarUrl: req.user.avatarUrl,
        }
      : {
          _id: 'guest_' + Date.now(),
          name: 'Guest Host',
          username: 'guest',
          avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Guest',
        };

    const roomId = 'space_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    let parsedTags = ['General'];
    if (Array.isArray(topicTags) && topicTags.length > 0) {
      parsedTags = topicTags.map((t) => t.trim().slice(0, 30));
    } else if (topic && typeof topic === 'string' && topic.trim()) {
      parsedTags = [topic.trim().slice(0, 30)];
    }

    // Persist in MongoDB
    try {
      if (req.user && req.user._id) {
        await SpaceRoom.create({
          roomId,
          title: title.trim().slice(0, 120),
          description: (description || '').trim().slice(0, 500),
          topicTags: parsedTags,
          visibility: ['public', 'community', 'private'].includes(visibility) ? visibility : 'public',
          host: req.user._id,
          status: 'live',
          startedAt: new Date(),
          mediaMode: process.env.LIVEKIT_URL ? 'sfu' : 'speaker_mesh',
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ Could not persist SpaceRoom to DB (running memory mode):', dbErr.message);
    }

    // Initialize in-memory Authoritative Session Engine
    const session = spaceSessionManager.createSpace({
      roomId,
      title: title.trim().slice(0, 120),
      description: (description || '').trim().slice(0, 500),
      topicTags: parsedTags,
      visibility: visibility || 'public',
      hostUser,
    });

    const io = getIO();
    if (io) {
      io.emit('spaces:updated', { spaces: spaceSessionManager.getActiveSpaces() });
    }

    const formatted = spaceSessionManager.formatSession(session);

    return res.status(201).json({
      message: 'Space created successfully.',
      space: formatted,
    });
  } catch (err) {
    console.error('createSpace error:', err);
    return res.status(500).json({ message: 'Failed to create space.' });
  }
};

/**
 * End a Space (Host or Admin only)
 */
exports.endSpace = async (req, res) => {
  try {
    const roomId = req.params.id;
    const session = spaceSessionManager.sessions.get(roomId);

    if (!session) {
      return res.status(404).json({ message: 'Space not found or already ended.' });
    }

    const requesterId = req.user ? req.user._id.toString() : null;
    const isAdmin = req.user?.role === 'admin';
    const isHost = session.hostId === requesterId;

    if (!isHost && !isAdmin) {
      return res.status(403).json({ message: 'Only the host or an administrator can end this space.' });
    }

    const io = getIO();
    spaceSessionManager.endSpace(roomId, io, 'host_ended');

    // Update database record if exists
    try {
      await SpaceRoom.findOneAndUpdate(
        { roomId },
        { status: 'ended', endedAt: new Date(), endReason: 'host_ended' }
      );
    } catch {}

    return res.status(200).json({ message: 'Space ended successfully.' });
  } catch (err) {
    console.error('endSpace error:', err);
    return res.status(500).json({ message: 'Failed to end space.' });
  }
};

/**
 * Generate or refresh media transport token for participant
 */
exports.getSpaceToken = async (req, res) => {
  try {
    const roomId = req.params.id;
    const session = spaceSessionManager.sessions.get(roomId);

    if (!session) {
      return res.status(404).json({ message: 'Space not found' });
    }

    const userId = req.user ? req.user._id.toString() : req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User identifier required' });
    }

    const participant = session.participants.get(userId.toString());
    if (!participant) {
      return res.status(403).json({ message: 'Participant is not joined to this space' });
    }

    const mediaToken = spaceSessionManager.generateTransportToken(session, participant);
    return res.status(200).json(mediaToken);
  } catch (err) {
    console.error('getSpaceToken error:', err);
    return res.status(500).json({ message: 'Failed to generate media token' });
  }
};

// Export active instances for direct Socket.io integration & unit tests
exports.spaceSessionManager = spaceSessionManager;
exports.SpaceRole = SpaceRole;
