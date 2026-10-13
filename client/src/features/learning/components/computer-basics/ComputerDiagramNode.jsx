import React from 'react';
import {
  User,
  Keyboard,
  HardDrive,
  Cpu,
  Layers,
  Monitor,
} from 'lucide-react';

const ICONS = {
  operator: User,
  input: Keyboard,
  memory: HardDrive,
  alu: Cpu,
  controlUnit: Layers,
  output: Monitor,
};

export const ComputerDiagramNode = ({
  id,
  title,
  subtitle,
  x,
  y,
  width = 180,
  height = 110,
  isActive = false,
  isSelected = false,
  onSelect,
  onHover,
  liveData = null,
  reducedMotion = false,
}) => {
  const Icon = ICONS[id] || Cpu;

  const isControlUnit = id === 'controlUnit';

  // Styling based on state and unit type
  let borderColor = 'border-neutral-200 dark:border-neutral-800';
  let headerBg = 'bg-neutral-100 dark:bg-neutral-800';
  let glowStyle = '';

  if (isActive) {
    if (isControlUnit) {
      borderColor = 'border-amber-500 ring-4 ring-amber-500/20';
      headerBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      glowStyle = 'shadow-lg shadow-amber-500/25';
    } else {
      borderColor = 'border-sky-500 ring-4 ring-sky-500/20';
      headerBg = 'bg-sky-500/10 text-sky-600 dark:text-sky-400';
      glowStyle = 'shadow-lg shadow-sky-500/25';
    }
  } else if (isSelected) {
    borderColor = 'border-indigo-500 ring-2 ring-indigo-500/30';
    glowStyle = 'shadow-md shadow-indigo-500/20';
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      className="overflow-visible"
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`${title} component. ${subtitle}. Press Enter to view detailed explanation.`}
        aria-pressed={isSelected}
        onClick={() => onSelect(id)}
        onMouseEnter={() => onHover && onHover(id)}
        onKeyDown={handleKeyDown}
        className={`w-full h-full rounded-2xl bg-white dark:bg-[#12161f] border-2 ${borderColor} ${glowStyle} p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-sky-500 ${
          isActive && !reducedMotion ? 'scale-[1.02]' : 'hover:scale-[1.01]'
        }`}
      >
        {/* Top: Icon + Title + Active pulse */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-xl transition-colors ${headerBg}`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-black text-neutral-900 dark:text-neutral-100 leading-tight">
                {title}
              </h5>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                {subtitle}
              </span>
            </div>
          </div>

          {/* Active indicator dot */}
          {isActive && (
            <span className="flex h-2 w-2 relative shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isControlUnit ? 'bg-amber-400' : 'bg-sky-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isControlUnit ? 'bg-amber-500' : 'bg-sky-500'
                }`}
              />
            </span>
          )}
        </div>

        {/* Live internal component state display */}
        <div className="mt-1 pt-1.5 border-t border-neutral-100 dark:border-neutral-800/80">
          {liveData ? (
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-neutral-500 dark:text-neutral-400 font-semibold truncate max-w-[85px]">
                {liveData.label || 'State:'}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded font-black font-mono tracking-tight truncate max-w-[95px] ${
                  isActive
                    ? isControlUnit
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      : 'bg-sky-500/20 text-sky-700 dark:text-sky-300'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {liveData.value}
              </span>
            </div>
          ) : (
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 italic flex items-center justify-between">
              <span>{isControlUnit ? 'Supervisory' : 'Idle'}</span>
              <span className="text-[9px] group-hover:text-sky-500 transition-colors">
                Info ↗
              </span>
            </div>
          )}
        </div>
      </div>
    </foreignObject>
  );
};

export default ComputerDiagramNode;
