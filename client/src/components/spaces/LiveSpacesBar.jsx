import React, { useState } from 'react';
import { Radio, Users, Plus, Volume2, PhoneCall } from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import CreateSpaceModal from './CreateSpaceModal';

export const LiveSpacesBar = () => {
  const { spacesList, joinSpace, activeSpace, openNewCallModal } = useCall();
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="mb-3 font-sans">
      {/* Container Card */}
      <div className="rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 p-3 shadow-2xs">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Live Audio & Spaces
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block leading-none">
                Group voice streaming & rooms
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openNewCallModal('group')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Start a group audio call"
            >
              <Users className="w-3.5 h-3.5 text-sky-500" />
              <span>Group Call</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Host Space</span>
            </button>
          </div>
        </div>

        {/* Spaces Horizontal Scroller */}
        {spacesList.length === 0 ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#16181c] border border-dashed border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-sky-500" />
              <span>No live spaces right now. Host one to start talking!</span>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="text-xs font-bold text-sky-500 hover:underline cursor-pointer"
            >
              Go Live →
            </button>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {spacesList.map((space) => {
              const isCurrent = activeSpace?.id === space.id;
              const participants = (space.speakers?.length || 0) + (space.listeners?.length || 0) + 1;

              return (
                <div
                  key={space.id}
                  onClick={() => joinSpace(space)}
                  className={`min-w-[260px] max-w-[280px] p-3 rounded-xl cursor-pointer transition-all flex flex-col justify-between shrink-0 border ${
                    isCurrent
                      ? 'bg-sky-50 dark:bg-sky-950/20 border-sky-500 shadow-md shadow-sky-500/10'
                      : 'bg-neutral-50 dark:bg-[#16181c] hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800 hover:border-sky-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                        LIVE
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold border border-sky-500/20">
                        #{space.topic}
                      </span>
                    </div>

                    <span className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
                      <Users className="w-3 h-3" />
                      {participants}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1 mb-2">
                    {space.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
                    <div className="flex items-center gap-1.5">
                      <Avatar src={space.host?.avatarUrl} name={space.host?.name} size="xs" />
                      <span className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate max-w-[120px]">
                        {space.host?.name}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-sky-500">
                      {isCurrent ? 'Listening 🎧' : 'Tune in →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateSpaceModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};

export default LiveSpacesBar;
