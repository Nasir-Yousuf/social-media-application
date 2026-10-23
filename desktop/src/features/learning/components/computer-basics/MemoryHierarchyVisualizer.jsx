import React, { useState } from 'react';

export const MemoryHierarchyVisualizer = () => {
  const [activeTier, setActiveTier] = useState('registers');
  const [activeMedia, setActiveMedia] = useState('hdd');

  const TIERS = [
    {
      id: 'registers',
      name: 'CPU Registers',
      speed: '< 1 nanosecond (Fastest)',
      capacity: 'Few Bytes (32 to 64 bits)',
      cost: 'Extremely Expensive per bit',
      volatility: 'Volatile (Loses data on power off)',
      location: 'Inside CPU Core execution units',
      description:
        'The fastest storage in the entire computer. Directly wired to the ALU and Control Unit, registers hold the immediate instruction, accumulator results, and program counter.',
      color: 'from-amber-500 to-red-500',
      badge: 'Peak Speed',
    },
    {
      id: 'cache',
      name: 'Cache Memory (L1, L2, L3)',
      speed: '1 - 10 nanoseconds',
      capacity: 'Kilobytes to Megabytes (e.g. 32MB L3)',
      cost: 'Very Expensive (SRAM)',
      volatility: 'Volatile',
      location: 'Directly on the CPU die / silicon substrate',
      description:
        'High-speed Static RAM (SRAM) bridging the huge speed gap between the blistering CPU and main memory (DRAM). Keeps copies of frequently requested instructions.',
      color: 'from-orange-500 to-amber-500',
      badge: 'Speed Bridge',
    },
    {
      id: 'ram',
      name: 'Primary Memory / RAM',
      speed: '10 - 30 nanoseconds',
      capacity: '8 GB to 128 GB',
      cost: 'Moderate cost per gigabyte (DRAM)',
      volatility: 'Volatile (Temporary working memory)',
      location: 'Mounted in DIMM slots on Motherboard',
      description:
        'Main working memory. Holds the operating system kernel and all open apps (browser tabs, games, documents). Any address can be accessed randomly in constant time.',
      color: 'from-sky-500 to-blue-600',
      badge: 'Working Hub',
    },
    {
      id: 'secondary',
      name: 'Secondary Storage (Mass Storage)',
      speed: 'Microseconds (SSD) to Milliseconds (HDD)',
      capacity: '512 GB to 20+ Terabytes',
      cost: 'Lowest Cost per gigabyte',
      volatility: 'Non-Volatile (Permanent retention)',
      location: 'Connected via NVMe, SATA, or USB buses',
      description:
        'Permanent archival home for all user files, game installs, operating system drives, and videos. Retains all data safely even when the machine is shut down.',
      color: 'from-emerald-500 to-teal-600',
      badge: 'Permanent Mass Vault',
    },
  ];

  const SECONDARY_MEDIA = [
    {
      id: 'hdd',
      name: 'Hard Disk Drive (HDD)',
      type: 'Magnetic Media',
      capacity: '1 TB – 22+ TB',
      status: 'Active Industry Workhorse',
      notes:
        'Mechanical spinning magnetic platters read by moving actuator heads. Superb cost per terabyte for massive media backups and network attached storage (NAS).',
    },
    {
      id: 'ssd',
      name: 'Solid State Drive (SSD)',
      type: 'NAND Flash Silicon',
      capacity: '500 GB – 8+ TB',
      status: 'Modern High-Speed Standard',
      notes:
        'Electronic flash chips with zero moving parts. Up to 50 times faster than mechanical hard drives, resistant to drops and vibration.',
    },
    {
      id: 'floppy',
      name: 'Floppy Disk (3.5 inch)',
      type: 'Historical Magnetic Diskette',
      capacity: '1.44 Megabytes',
      status: 'Historical Exam Classic',
      notes:
        'Flexible magnetic plastic disk inside a rigid plastic shell. Popular in the 1980s and 1990s as the primary portable distribution medium before CDs.',
    },
    {
      id: 'cd',
      name: 'Compact Disc (CD)',
      type: 'Optical Infrared Laser',
      capacity: '700 Megabytes (~80 min audio)',
      status: 'Legacy Optical',
      notes:
        'Microscopic reflective pits read by a 780nm infrared laser diode. Available as CD-ROM (factory stamped), CD-R (recordable once), and CD-RW (rewritable).',
    },
    {
      id: 'dvd',
      name: 'Digital Versatile Disc (DVD)',
      type: 'Optical Red Laser',
      capacity: '4.7 GB (Single) to 8.5 GB (Dual)',
      status: 'Legacy High-Capacity Optical',
      notes:
        'Uses a shorter 650nm red laser with tighter track pitch, allowing over 6 times more storage than a standard CD for movies and software installers.',
    },
    {
      id: 'tape',
      name: 'Magnetic Tape Storage',
      type: 'Sequential Magnetic Ribbon',
      capacity: '12 TB – 45+ TB per cartridge (LTO)',
      status: 'Enterprise Archival Standard',
      notes:
        'Long magnetic ribbon stored on reels. Slower sequential access, but exceptional shelf lifespan (30+ years) and lowest cost per terabyte for banking and government archives.',
    },
    {
      id: 'pendrive',
      name: 'USB Pen Drive (Thumb Drive)',
      type: 'Portable NAND Flash',
      capacity: '16 GB – 1+ TB',
      status: 'Everyday Portable Standard',
      notes:
        'Pocket-sized portable flash storage with integrated USB plug-and-play connector. Rewritable millions of times, non-volatile, and universally compatible.',
    },
  ];

  const currentTier = TIERS.find((t) => t.id === activeTier) || TIERS[0];
  const currentMedia = SECONDARY_MEDIA.find((m) => m.id === activeMedia) || SECONDARY_MEDIA[0];

  return (
    <div className="space-y-6">
      {/* Part 1: Interactive Memory Pyramid */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-6 shadow-sm space-y-6">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Memory Hierarchy
          </span>
          <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            The Computer Memory Pyramid: Speed vs Capacity vs Cost
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Click on any tier of the hierarchy pyramid below to inspect its access speed, physical location, and volatility.
          </p>
        </div>

        {/* Pyramid Graphic with 4 Interactive Tiers */}
        <div className="space-y-2 max-w-2xl mx-auto py-2">
          {TIERS.map((tier, idx) => {
            const isSelected = activeTier === tier.id;
            // Width percentages create the visual pyramid shape
            const widthStyles = [
              'w-2/5 mx-auto',
              'w-3/5 mx-auto',
              'w-4/5 mx-auto',
              'w-full mx-auto',
            ];

            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setActiveTier(tier.id)}
                className={`block ${widthStyles[idx]} p-3 rounded-2xl border-2 transition-all duration-200 text-center cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-gradient-to-r ' +
                      tier.color +
                      ' text-white shadow-md scale-[1.02]'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-90">
                    Tier {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-black">{tier.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/20">
                    {tier.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pyramid Axis Indicator */}
        <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400 px-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-amber-500">
            <span>▲ Top: Fastest Access & Highest Cost/Bit</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-500">
            <span>▼ Bottom: Largest Capacity & Lowest Cost/Bit</span>
          </div>
        </div>

        {/* Active Tier Inspector Card */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                Selected Tier Profile
              </span>
              <h4 className="text-base font-black text-neutral-900 dark:text-neutral-100">
                {currentTier.name}
              </h4>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                currentTier.volatility.startsWith('Volatile')
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              }`}
            >
              {currentTier.volatility}
            </span>
          </div>

          <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {currentTier.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white dark:bg-neutral-800 p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-700">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold block">
                Access Speed:
              </span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                {currentTier.speed}
              </span>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-700">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold block">
                Typical Capacity:
              </span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                {currentTier.capacity}
              </span>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-700">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold block">
                Relative Cost:
              </span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                {currentTier.cost}
              </span>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-700">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold block">
                Physical Location:
              </span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                {currentTier.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: Secondary Storage Media Cards */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-6 shadow-sm space-y-5">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
            Storage Media Encyclopedia
          </span>
          <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100 mt-1">
            Secondary Storage Devices (Historical Milestones to Modern Fast SSDs)
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {SECONDARY_MEDIA.map((media) => (
            <button
              key={media.id}
              type="button"
              onClick={() => setActiveMedia(media.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMedia === media.id
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {media.name}
            </button>
          ))}
        </div>

        {/* Media Profile Detail */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
            <div>
              <h4 className="text-sm font-black text-neutral-900 dark:text-neutral-100">
                {currentMedia.name}
              </h4>
              <span className="text-xs text-sky-600 dark:text-sky-400 font-bold">
                {currentMedia.type} · Capacity: {currentMedia.capacity}
              </span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 w-fit">
              {currentMedia.status}
            </span>
          </div>

          <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {currentMedia.notes}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemoryHierarchyVisualizer;
