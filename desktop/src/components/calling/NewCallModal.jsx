import React, { useState, useEffect } from "react";
import {
  Phone,
  Users,
  Radio,
  Search,
  X,
  Check,
  Sparkles,
  Volume2,
  Plus,
} from "lucide-react";
import { useCall } from "../../context/CallContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import Avatar from "../common/Avatar";
import TwitterSpinner from "../common/TwitterSpinner";

export const NewCallModal = () => {
  const { user: currentUser } = useAuth();
  const {
    isNewCallModalOpen,
    newCallModalTab,
    closeNewCallModal,
    startCall,
    startGroupCall,
    createSpace,
    spacesList,
    joinSpace,
  } = useCall();

  const [activeTab, setActiveTab] = useState(newCallModalTab || "direct");
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [search, setSearch] = useState("");

  // Group Call state
  const [groupRoomName, setGroupRoomName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Space creation state
  const [spaceTitle, setSpaceTitle] = useState("");
  const [spaceTopic, setSpaceTopic] = useState("Tech & Code");
  const [isSubmittingSpace, setIsSubmittingSpace] = useState(false);

  useEffect(() => {
    if (newCallModalTab) {
      setActiveTab(newCallModalTab);
    }
  }, [newCallModalTab]);

  useEffect(() => {
    if (!isNewCallModalOpen) return;

    const fetchDirectory = async () => {
      setLoadingMembers(true);
      try {
        const res = await api.get("/users/directory");
        const list = res.data.members || [];
        // Filter out current user
        setMembers(list.filter((m) => m._id !== currentUser?._id));
      } catch {
        setMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchDirectory();
  }, [isNewCallModalOpen, currentUser]);

  if (!isNewCallModalOpen) return null;

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.username?.toLowerCase().includes(q) ||
      m.status?.toLowerCase().includes(q)
    );
  });

  const toggleSelectUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleStartDirectCall = (targetUser) => {
    closeNewCallModal();
    startCall(targetUser);
  };

  const handleStartGroupCall = () => {
    if (selectedUserIds.length === 0) return;
    closeNewCallModal();
    startGroupCall({
      roomName: groupRoomName.trim() || "Group Audio Call",
      targetUserIds: selectedUserIds,
    });
    setSelectedUserIds([]);
    setGroupRoomName("");
  };

  const handleCreateSpace = async (e) => {
    e.preventDefault();
    if (!spaceTitle.trim() || isSubmittingSpace) return;
    try {
      setIsSubmittingSpace(true);
      await createSpace({ title: spaceTitle.trim(), topic: spaceTopic });
      closeNewCallModal();
      setSpaceTitle("");
    } finally {
      setIsSubmittingSpace(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header with Tabs */}
        <div className="px-6 pt-5 pb-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                Audio Calls & Spaces
              </h2>
            </div>

            <button
              type="button"
              onClick={closeNewCallModal}
              className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Three Option Tabs */}
          <div className="flex p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-900/90 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("direct")}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "direct"
                  ? "bg-white dark:bg-[#16181c] text-sky-500 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>1-on-1 Call</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("group")}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "group"
                  ? "bg-white dark:bg-[#16181c] text-sky-500 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Group Call</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("spaces")}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "spaces"
                  ? "bg-white dark:bg-[#16181c] text-sky-500 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Audio Spaces</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: 1-ON-1 VOICE CALL */}
          {activeTab === "direct" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search member by name or username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-neutral-100 dark:bg-[#16181c] border border-transparent focus:border-sky-500 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {loadingMembers ? (
                  <div className="py-8 flex justify-center">
                    <TwitterSpinner size="sm" />
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    No members found.
                  </div>
                ) : (
                  filteredMembers.map((m) => (
                    <div
                      key={m._id}
                      className="p-2.5 rounded-2xl hover:bg-neutral-50 dark:hover:bg-[#16181c] border border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={m.avatarUrl} name={m.name} size="md" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white truncate block">
                            {m.name}
                          </span>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono truncate block">
                            @{m.username}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartDirectCall(m)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all active:scale-95 shadow-xs cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GROUP VOICE CALL */}
          {activeTab === "group" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Group Call Room Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Study Group / Team Sync"
                  value={groupRoomName}
                  onChange={(e) => setGroupRoomName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-[#16181c] border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Select Members ({selectedUserIds.length} selected)
                  </label>
                  {selectedUserIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedUserIds([])}
                      className="text-[11px] text-sky-500 hover:underline"
                    >
                      Clear selection
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {loadingMembers ? (
                    <div className="py-8 flex justify-center">
                      <TwitterSpinner size="sm" />
                    </div>
                  ) : (
                    members.map((m) => {
                      const isSelected = selectedUserIds.includes(m._id);
                      return (
                        <div
                          key={m._id}
                          onClick={() => toggleSelectUser(m._id)}
                          className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? "bg-sky-50 dark:bg-sky-950/20 border-sky-500"
                              : "hover:bg-neutral-50 dark:hover:bg-[#16181c] border-neutral-100 dark:border-neutral-800/60"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar src={m.avatarUrl} name={m.name} size="sm" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-neutral-900 dark:text-white truncate block">
                                {m.name}
                              </span>
                              <span className="text-[11px] text-neutral-500 font-mono">
                                @{m.username}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                              isSelected
                                ? "bg-sky-500 border-sky-500 text-white"
                                : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                type="button"
                disabled={selectedUserIds.length === 0}
                onClick={handleStartGroupCall}
                className="w-full py-3 rounded-full bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Start Group Call ({selectedUserIds.length} members)</span>
              </button>
            </div>
          )}

          {/* TAB 3: AUDIO SPACES & LIVE STREAMING */}
          {activeTab === "spaces" && (
            <div className="space-y-5">
              {/* Active Spaces List */}
              {spacesList.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Happening Now ({spacesList.length})
                  </h4>
                  <div className="space-y-2">
                    {spacesList.map((sp) => (
                      <div
                        key={sp.id}
                        onClick={() => {
                          closeNewCallModal();
                          joinSpace(sp);
                        }}
                        className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#16181c] border border-neutral-200 dark:border-neutral-800 hover:border-sky-500 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white block truncate">
                            {sp.title}
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            Host: {sp.host?.name} • #{sp.topic}
                          </span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-sky-500 text-white font-bold text-xs shrink-0">
                          Tune in 🎧
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Start New Space Form */}
              <form onSubmit={handleCreateSpace} className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Host an Audio Space
                </h4>

                <div>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    placeholder="Space Title (e.g. Next.js 15 Deep Dive)"
                    value={spaceTitle}
                    onChange={(e) => setSpaceTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-[#16181c] border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Tech & Code",
                    "Design & UI",
                    "Career & Jobs",
                    "Open Mic",
                    "Chillout",
                  ].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSpaceTopic(t)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        spaceTopic === t
                          ? "bg-sky-500 text-white shadow-xs"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!spaceTitle.trim() || isSubmittingSpace}
                  className="w-full py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Go Live Now</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewCallModal;
