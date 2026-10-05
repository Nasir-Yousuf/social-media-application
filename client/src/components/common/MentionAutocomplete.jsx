import React, { useState, useEffect, useRef, useCallback } from 'react';
import Avatar from './Avatar';
import { FacultyBadge } from './ClearfeedIcons';
import api from '../../api/client';

// Global cache for member directory to avoid refetching on every keystroke
let cachedUsers = null;
let lastFetchTime = 0;

export const fetchMentionUsers = async () => {
  const now = Date.now();
  // Cache for 60 seconds
  if (cachedUsers && now - lastFetchTime < 60000) {
    return cachedUsers;
  }
  try {
    const res = await api.get('/users/directory');
    cachedUsers = res.data.members || [];
    lastFetchTime = now;
    return cachedUsers;
  } catch (err) {
    console.warn('Failed to load users for mention autocomplete:', err);
    return cachedUsers || [];
  }
};

/**
 * Custom hook to attach @mention detection and autocomplete behavior to any textarea or input.
 */
export const useMentionAutocomplete = (text, setText, inputRef) => {
  const [mentionActive, setMentionActive] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Load user directory on mount
  useEffect(() => {
    fetchMentionUsers().then((users) => {
      setAllUsers(users);
    });
  }, []);

  // Filter users based on mentionQuery
  const filteredUsers = React.useMemo(() => {
    if (!mentionActive) return [];
    const q = mentionQuery.toLowerCase().trim();
    if (!q) {
      // Return top 6 users when just '@' is typed
      return allUsers.slice(0, 6);
    }
    return allUsers
      .filter((u) => {
        const uName = (u.name || '').toLowerCase();
        const uHandle = (u.username || '').toLowerCase();
        return uHandle.includes(q) || uName.includes(q);
      })
      .slice(0, 6);
  }, [mentionActive, mentionQuery, allUsers]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredUsers]);

  // Check text and cursor position for @mention triggers
  const checkMention = useCallback(() => {
    if (!inputRef.current) return;
    const cursorPos = inputRef.current.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);

    // Look for @ followed by word characters right before cursor
    const match = textBeforeCursor.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/);

    if (match) {
      const matchIndex = match.index + (match[0].startsWith('@') ? 0 : 1);
      setMentionActive(true);
      setMentionQuery(match[1]);
      setMentionStartIndex(matchIndex);
    } else {
      setMentionActive(false);
      setMentionQuery('');
      setMentionStartIndex(-1);
    }
  }, [text, inputRef]);

  // Trigger check whenever text changes
  useEffect(() => {
    checkMention();
  }, [checkMention]);

  // Insert chosen mention
  const insertMention = useCallback(
    (userToInsert) => {
      if (!userToInsert || !inputRef.current) return;
      const cursorPos = inputRef.current.selectionStart || text.length;
      const before = text.slice(0, mentionStartIndex);
      const after = text.slice(cursorPos);

      const username = userToInsert.username;
      const newText = `${before}@${username} ${after}`;
      setText(newText);
      setMentionActive(false);

      // Restore cursor position right after mention and trailing space
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const nextPos = before.length + username.length + 2; // '@' + username + ' '
          inputRef.current.setSelectionRange(nextPos, nextPos);
        }
      }, 10);
    },
    [text, setText, mentionStartIndex, inputRef]
  );

  // Handle key navigation (Up, Down, Enter, Tab, Escape)
  const handleKeyDown = useCallback(
    (e) => {
      if (!mentionActive || filteredUsers.length === 0) return false;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
        return true;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        return true;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredUsers[selectedIndex]);
        return true;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionActive(false);
        return true;
      }
      return false;
    },
    [mentionActive, filteredUsers, selectedIndex, insertMention]
  );

  return {
    mentionActive: mentionActive && filteredUsers.length > 0,
    filteredUsers,
    selectedIndex,
    setSelectedIndex,
    insertMention,
    handleKeyDown,
    checkMention,
    closeMention: () => setMentionActive(false),
  };
};

/**
 * Visual Dropdown List rendered when @mention is active.
 */
export const MentionDropdown = ({
  users = [],
  selectedIndex = 0,
  onSelect,
  className = '',
}) => {
  if (!users || users.length === 0) return null;

  return (
    <div
      className={`z-50 w-72 max-w-full bg-white dark:bg-[#181b20] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden py-1 animate-fade-in font-sans ${className}`}
      onMouseDown={(e) => e.preventDefault()} // Prevent textarea blur on click
    >
      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-800/80">
        Mention Member
      </div>
      <div className="max-h-60 overflow-y-auto py-1">
        {users.map((u, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={u._id || u.username}
              type="button"
              onClick={() => onSelect(u)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              <Avatar src={u.avatarUrl} name={u.name} size="xs" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xs truncate text-neutral-900 dark:text-neutral-100">
                    {u.name}
                  </span>
                  {u.role === 'admin' && (
                    <FacultyBadge className="w-3 h-3 text-amber-500 shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block truncate">
                  @{u.username}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MentionDropdown;
