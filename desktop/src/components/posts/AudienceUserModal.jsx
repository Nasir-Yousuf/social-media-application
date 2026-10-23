import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Check, Target, UserX, Users, ShieldAlert, Sparkles, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import api from '../../api/client';
import { fetchMentionUsers } from '../common/MentionAutocomplete';

/**
 * AudienceUserModal
 * Interactive picker modal to select users for:
 * 1. 'specific' whitelist: Only chosen people can see this post
 * 2. 'exclude' blacklist: Everyone can see this post EXCEPT chosen people
 */
export const AudienceUserModal = ({
  isOpen,
  onClose,
  mode = 'specific', // 'specific' | 'exclude'
  initialSelected = [], // array of User objects or User IDs
  onSave,
}) => {
  const [directory, setDirectory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedList, setSelectedList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchingRemote, setSearchingRemote] = useState(false);

  // Sync initialSelected on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      // Load user directory
      setLoading(true);
      fetchMentionUsers()
        .then((members) => {
          setDirectory(members || []);
          // Normalize initialSelected into full user objects
          const normalized = (initialSelected || []).map((item) => {
            if (typeof item === 'object' && item !== null && item._id) {
              return item;
            }
            const found = (members || []).find((m) => m._id === item || m.id === item);
            return found || { _id: item, name: 'User', username: 'user' };
          });
          setSelectedList(normalized);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, initialSelected]);

  // Handle remote search if query is typed
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) {
      setSearchResults([]);
      setSearchingRemote(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingRemote(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
        const remoteUsers = res.data?.users || [];
        setSearchResults(remoteUsers);
      } catch (err) {
        console.warn('Audience search error:', err);
      } finally {
        setSearchingRemote(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Combine local directory with search results
  const displayedUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const map = new Map();

    // First add directory matching query
    for (const u of directory) {
      if (u.isSpecial) continue;
      if (
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q)
      ) {
        map.set(u._id.toString(), u);
      }
    }

    // Then add remote search results
    for (const u of searchResults) {
      if (u._id && !map.has(u._id.toString())) {
        map.set(u._id.toString(), u);
      }
    }

    return Array.from(map.values());
  }, [directory, searchResults, searchQuery]);

  const isSelected = (userId) => {
    const idStr = userId?._id ? userId._id.toString() : userId?.toString();
    return selectedList.some((u) => (u._id ? u._id.toString() : u.toString()) === idStr);
  };

  const handleToggleUser = (user) => {
    const idStr = user._id ? user._id.toString() : user.toString();
    if (isSelected(user)) {
      setSelectedList((prev) =>
        prev.filter((u) => (u._id ? u._id.toString() : u.toString()) !== idStr)
      );
    } else {
      setSelectedList((prev) => [...prev, user]);
    }
  };

  const handleRemoveUser = (userId) => {
    const idStr = userId?._id ? userId._id.toString() : userId?.toString();
    setSelectedList((prev) =>
      prev.filter((u) => (u._id ? u._id.toString() : u.toString()) !== idStr)
    );
  };

  const handleClearAll = () => {
    setSelectedList([]);
  };

  const handleConfirm = () => {
    onSave?.(selectedList);
    onClose();
  };

  const isSpecific = mode === 'specific';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-xl ${
              isSpecific ? 'bg-sky-500/15 text-sky-400' : 'bg-rose-500/15 text-rose-400'
            }`}
          >
            {isSpecific ? <Target className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
          </div>
          <span>
            {isSpecific ? 'Select Specific Audience' : 'Hide Post From Specific People'}
          </span>
        </div>
      }
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Descriptive Banner */}
        <div
          className={`p-3 rounded-2xl border text-xs font-sans ${
            isSpecific
              ? 'bg-sky-500/5 border-sky-500/20 text-sky-800 dark:text-sky-300'
              : 'bg-rose-500/5 border-rose-500/20 text-rose-800 dark:text-rose-300'
          }`}
        >
          {isSpecific ? (
            <p>
              🎯 <strong>Whitelist:</strong> Only the members you select below will be able to see and interact with this post.
            </p>
          ) : (
            <p>
              🚫 <strong>Blacklist:</strong> Everyone in the world can see this post <em>except</em> the specific members you select below.
            </p>
          )}
        </div>

        {/* Selected Users Chips */}
        {selectedList.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-500 font-sans px-1">
              <span>
                {isSpecific ? 'Allowed Members' : 'Hidden From'} ({selectedList.length})
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] text-neutral-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear all</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              {selectedList.map((user) => (
                <span
                  key={user._id}
                  className={`inline-flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
                    isSpecific
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  <Avatar src={user.avatarUrl} name={user.name} size="xs" />
                  <span className="font-semibold text-[11px]">@{user.username}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(user)}
                    className="hover:opacity-80 p-0.5 rounded-full cursor-pointer ml-0.5"
                    aria-label={`Remove @${user.username}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member by name or @username..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-sans text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-sky-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Members List */}
        <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-neutral-100 dark:divide-neutral-800/60 pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-neutral-400 font-sans">
              Loading members directory...
            </div>
          ) : displayedUsers.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400 font-sans">
              No matching members found.
            </div>
          ) : (
            displayedUsers.map((user) => {
              const selected = isSelected(user);
              return (
                <div
                  key={user._id}
                  onClick={() => handleToggleUser(user)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                    selected
                      ? isSpecific
                        ? 'bg-sky-500/10 dark:bg-sky-500/15'
                        : 'bg-rose-500/10 dark:bg-rose-500/15'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      src={user.avatarUrl}
                      name={user.name}
                      size="sm"
                      role={user.role}
                      showRoleBadge={true}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                          {user.name}
                        </span>
                        {user.role === 'admin' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-500 font-bold uppercase">
                            Admin
                          </span>
                        )}
                        {user.role === 'faculty' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-400 font-bold uppercase">
                            Faculty
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate block">
                        @{user.username}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleUser(user);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selected
                        ? isSpecific
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-rose-500 text-white shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {selected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{isSpecific ? 'Added' : 'Excluded'}</span>
                      </>
                    ) : (
                      <span>+ Add</span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
          <span className="text-xs text-neutral-400 font-sans">
            {selectedList.length === 0
              ? 'No users selected yet'
              : `${selectedList.length} member${selectedList.length > 1 ? 's' : ''} ${
                  isSpecific ? 'allowed' : 'hidden'
                }`}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={isSpecific ? 'primary' : 'danger'}
              size="sm"
              onClick={handleConfirm}
            >
              Confirm ({selectedList.length})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AudienceUserModal;
