import React, { useState, useEffect } from 'react';
import { Sparkles, Globe, Check, X, ShieldAlert, BookOpen } from 'lucide-react';
import api from '../../api/client';

const RELATIONSHIP_PRESETS = [
  { id: 'best friend', label: 'Best Friend 🤝', desc: 'Chill, hilarious, deeply supportive, talks about life and code' },
  { id: 'english partner', label: 'English Chatting Partner 🇬🇧', desc: 'Fluent English partner who chats, teaches vocabulary, and gently fixes mistakes' },
  { id: 'girlfriend', label: 'Girlfriend ❤️', desc: 'Affectionate, caring, sweet, playful, and emotionally attentive' },
  { id: 'boyfriend', label: 'Boyfriend 💙', desc: 'Supportive, protective, warm, thoughtful, and playful' },
  { id: 'coding mentor', label: 'Coding Mentor 💡', desc: 'Expert senior developer who patiently debugs code with you' },
  { id: 'study buddy', label: 'Study Buddy 📚', desc: 'Focused classmate who studies lessons and motivates you' },
];

const LANGUAGE_OPTIONS = [
  { id: 'auto', label: 'Auto Detect 🌐', desc: 'Automatically matches Bangla, English, or mixed' },
  { id: 'bangla', label: 'বাংলা (Bangla) 🇧🇩', desc: 'Warm, natural Bengali conversation' },
  { id: 'english', label: 'English 🇬🇧', desc: 'Natural conversational English' },
  { id: 'both', label: 'Both / Banglish 💬', desc: 'Young, casual mix of English & Bangla' },
];

export const AiSettingsModal = ({ isOpen, onClose, conversationId, currentSettings, onSaved }) => {
  const [customName, setCustomName] = useState('Clearfeed AI');
  const [relationship, setRelationship] = useState('best friend');
  const [isCustomRel, setIsCustomRel] = useState(false);
  const [languagePref, setLanguagePref] = useState('auto');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentSettings) {
      setCustomName(currentSettings.customName || 'Clearfeed AI');
      const rel = currentSettings.relationship || 'best friend';
      setRelationship(rel);
      const isPreset = RELATIONSHIP_PRESETS.some((p) => p.id === rel);
      setIsCustomRel(!isPreset);
      setLanguagePref(currentSettings.languagePref || 'auto');
    }
  }, [currentSettings, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const nameToSave = customName.trim() || 'Clearfeed AI';
    const relToSave = relationship.trim() || 'best friend';

    try {
      const res = await api.put(`/messages/conversations/${conversationId}/ai-settings`, {
        customName: nameToSave,
        relationship: relToSave,
        languagePref,
      });

      if (res.data?.success) {
        if (onSaved) {
          onSaved(res.data.customAiSettings);
        }
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update AI settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/20 flex items-center justify-center text-sky-500 shadow-sm shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                Customize Your AI Companion
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Personalize how your AI talks, its name, and its relationship to you.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Custom Name */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              Name Your AI Friend
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Give your companion a name you like (e.g. <em>Emma, Maya, Aarav, Alex, Buddy</em>). They will respond naturally to it!
            </p>
            <div className="relative">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                maxLength={40}
                placeholder="e.g. Emma, Maya, Alex"
                className="w-full px-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
            </div>
          </div>

          {/* 2. Relationship / Persona */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              How Should They Treat You? (Relationship)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {RELATIONSHIP_PRESETS.map((p) => {
                const isSelected = !isCustomRel && relationship.toLowerCase() === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setRelationship(p.id);
                      setIsCustomRel(false);
                    }}
                    className={`p-3 text-left rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/10 dark:bg-sky-500/15 text-sky-950 dark:text-sky-300 ring-1 ring-sky-500/30 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{p.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-500" />}
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                      {p.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom Relationship write-in */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsCustomRel(true)}
                className={`text-xs font-bold cursor-pointer transition-colors ${
                  isCustomRel ? 'text-sky-500' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                + Define custom relationship / persona
              </button>
              {isCustomRel && (
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Caring older sister, late-night philosopher"
                  maxLength={50}
                  className="mt-2 w-full px-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              )}
            </div>
          </div>

          {/* 3. Language Preference */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-500" />
              <span>Language Preference</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LANGUAGE_OPTIONS.map((l) => {
                const isSelected = languagePref === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLanguagePref(l.id)}
                    className={`p-3 text-left rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/10 dark:bg-sky-500/15 text-sky-950 dark:text-sky-300 ring-1 ring-sky-500/30 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{l.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-500" />}
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                      {l.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AiSettingsModal;
