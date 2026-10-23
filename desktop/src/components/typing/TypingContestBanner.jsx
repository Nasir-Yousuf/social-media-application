import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Users, Sparkles } from 'lucide-react';
import api from '../../api/client';

export const TypingContestBanner = () => {
  const [contest, setContest] = useState(null);
  const [timeLeftStr, setTimeLeftStr] = useState('');

  useEffect(() => {
    let timer;
    api.get('/typing/contest')
      .then((res) => {
        setContest(res.data);
        let ms = res.data.msRemaining || 0;

        const updateTimer = () => {
          if (ms <= 0) {
            setTimeLeftStr('Ending soon...');
            return;
          }
          const totalSec = Math.floor(ms / 1000);
          const days = Math.floor(totalSec / 86400);
          const hours = Math.floor((totalSec % 86400) / 3600);
          const mins = Math.floor((totalSec % 3600) / 60);
          const secs = totalSec % 60;

          if (days > 0) {
            setTimeLeftStr(`${days}d ${hours}h ${mins}m`);
          } else {
            setTimeLeftStr(`${hours}h ${mins}m ${secs}s`);
          }
          ms -= 1000;
        };

        updateTimer();
        timer = setInterval(updateTimer, 1000);
      })
      .catch(() => {});

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  if (!contest) return null;

  return (
    <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-sky-950/40 via-neutral-900 to-amber-950/30 border border-sky-500/20 mb-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Weekly Championship
              </span>
              <span className="text-xs text-neutral-400 font-mono">Week {contest.weekId}</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white mt-1">
              {contest.title}
            </h4>
            <p className="text-xs text-neutral-400">
              Compete on the 60s Top 200 sprint to claim the Weekly Champion badge and {contest.prizeTitle}
            </p>
          </div>
        </div>

        {/* Contest Info Pills */}
        <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-neutral-800 text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{timeLeftStr || 'Active'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-neutral-800 text-neutral-300">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>{contest.participantsCount || 1} Typists</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingContestBanner;
