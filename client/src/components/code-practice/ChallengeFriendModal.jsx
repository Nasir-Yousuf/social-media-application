import React, { useState, useEffect } from 'react';
import { Swords, Copy, Check, Send, Sparkles, Trophy, Users, ShieldAlert } from 'lucide-react';
import Modal from '../common/Modal';
import api from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../common/Avatar';

export const ChallengeFriendModal = ({
  isOpen = false,
  onClose,
  results = null,
  language = 'javascript',
  snippetTitle = 'Code Typing Battle',
}) => {
  const { showToast } = useNotifications();
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [challengeMsg, setChallengeMsg] = useState('');

  const targetWpm = results?.wpm || 60;
  const targetAcc = results?.accuracy || 98;

  useEffect(() => {
    if (!isOpen) return;

    // Fetch members for friend challenge list
    api
      .get('/users')
      .then((res) => {
        const list = res.data.users || res.data || [];
        setMembers(Array.isArray(list) ? list.slice(0, 15) : []);
      })
      .catch(() => {});

    setChallengeMsg(
      `⚔️ I challenge you to beat my score of ${targetWpm} WPM with ${targetAcc}% accuracy in ${language.toUpperCase()}! Are you fast enough?`
    );
  }, [isOpen, targetWpm, targetAcc, language]);

  if (!isOpen) return null;

  const challengeUrl = `${window.location.origin}/code-practice?challenge=true&wpm=${targetWpm}&lang=${language}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(challengeUrl);
    setCopied(true);
    showToast('Challenge link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChallenge = async () => {
    setSending(true);
    try {
      // Create a challenge post on Clearfeed
      const payload = {
        content: `⚔️ **TYPING CHALLENGE ISSUED!**\n${challengeMsg}\n\n[Accept Challenge Battle](${challengeUrl})`,
      };

      await api.post('/posts', payload);
      showToast('Challenge published to community feed!', 'success');
      window.dispatchEvent(new CustomEvent('clearfeed:newPost'));
      onClose();
    } catch {
      showToast('Failed to post challenge', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚔️ Challenge a Friend to a Typing Duel" maxWidth="max-w-xl">
      <div className="space-y-5 font-sans">
        {/* Challenge Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border border-amber-500/30 text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center mx-auto mb-2 shadow-sm animate-bounce">
            <Swords className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-neutral-900 dark:text-white">
            Target to Beat: {targetWpm} WPM ({targetAcc}% Accuracy)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Send a direct typing battle challenge to your friends or post it to the community feed.
          </p>
        </div>

        {/* Message Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            Battle Challenge Message
          </label>
          <textarea
            value={challengeMsg}
            onChange={(e) => setChallengeMsg(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-[#181a20] border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Select Member to Tag */}
        {members.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Select Member to Challenge
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {members.map((m) => {
                const isSel = selectedMember?._id === m._id;
                return (
                  <button
                    key={m._id || m.id}
                    type="button"
                    onClick={() => setSelectedMember(isSel ? null : m)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      isSel
                        ? 'bg-amber-500 text-black border-amber-500 shadow-md'
                        : 'bg-neutral-50 dark:bg-[#16191f] border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <Avatar src={m.avatarUrl} name={m.name} size="xs" />
                    <span>@{m.username || 'user'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-amber-500" />}
            <span>{copied ? 'Link Copied!' : 'Copy Battle Link'}</span>
          </button>

          <button
            onClick={handleSendChallenge}
            disabled={sending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer ml-auto"
          >
            <Send className="w-4 h-4" />
            <span>{sending ? 'Publishing...' : 'Publish Challenge Battle'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ChallengeFriendModal;
