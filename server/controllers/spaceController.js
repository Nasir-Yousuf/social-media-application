const { getIO } = require('../sockets/socketManager');

// In-memory active spaces registry for high performance real-time audio rooms
// (Space lifecycle is tied to active host and participants)
const activeSpacesMap = new Map();

// Helper to format space object for JSON clients
const formatSpace = (space) => {
  return {
    id: space.id,
    title: space.title,
    topic: space.topic,
    host: space.host,
    speakersCount: space.speakers.size,
    listenersCount: space.listeners.size,
    totalParticipants: space.speakers.size + space.listeners.size,
    speakers: Array.from(space.speakers.values()),
    listeners: Array.from(space.listeners.values()),
    handRaised: Array.from(space.handRaised),
    createdAt: space.createdAt,
    isLive: true,
  };
};

exports.getActiveSpaces = (req, res) => {
  const spaces = Array.from(activeSpacesMap.values()).map(formatSpace);
  return res.status(200).json({ spaces });
};

exports.getSpaceById = (req, res) => {
  const space = activeSpacesMap.get(req.params.id);
  if (!space) {
    return res.status(404).json({ message: 'Space is not active or has ended.' });
  }
  return res.status(200).json({ space: formatSpace(space) });
};

exports.createSpace = (req, res) => {
  try {
    const { title, topic } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Space title is required.' });
    }

    const hostUser = req.user ? {
      _id: req.user._id.toString(),
      name: req.user.name,
      username: req.user.username,
      avatarUrl: req.user.avatarUrl,
    } : {
      _id: 'guest_' + Date.now(),
      name: 'Guest Host',
      username: 'guest',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Guest',
    };

    const spaceId = 'space_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const newSpace = {
      id: spaceId,
      title: title.trim().slice(0, 100),
      topic: topic ? topic.trim().slice(0, 50) : 'General Tech',
      host: hostUser,
      speakers: new Map([[hostUser._id, { user: hostUser, isMuted: false, role: 'host' }]]),
      listeners: new Map(),
      handRaised: new Set(),
      createdAt: new Date(),
    };

    activeSpacesMap.set(spaceId, newSpace);

    const io = getIO();
    if (io) {
      io.emit('spaces:updated', { spaces: Array.from(activeSpacesMap.values()).map(formatSpace) });
    }

    return res.status(201).json({
      message: 'Space created successfully.',
      space: formatSpace(newSpace),
    });
  } catch (err) {
    console.error('createSpace error:', err);
    return res.status(500).json({ message: 'Failed to create space.' });
  }
};

exports.endSpace = (req, res) => {
  const space = activeSpacesMap.get(req.params.id);
  if (!space) {
    return res.status(404).json({ message: 'Space not found.' });
  }

  const requesterId = req.user ? req.user._id.toString() : null;
  const isAdmin = req.user?.role === 'admin';
  const isHost = space.host._id === requesterId;

  if (!isHost && !isAdmin) {
    return res.status(403).json({ message: 'Only the host or admin can end this space.' });
  }

  activeSpacesMap.delete(req.params.id);

  const io = getIO();
  if (io) {
    io.to(`space:${req.params.id}`).emit('space:ended', { spaceId: req.params.id });
    io.emit('spaces:updated', { spaces: Array.from(activeSpacesMap.values()).map(formatSpace) });
  }

  return res.status(200).json({ message: 'Space ended successfully.' });
};

exports.activeSpacesMap = activeSpacesMap;
exports.formatSpace = formatSpace;
