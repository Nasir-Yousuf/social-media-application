import React from 'react';
import {
  User,
  Keyboard,
  HardDrive,
  Cpu,
  Layers,
  Monitor,
  CheckCircle2,
  Activity,
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
  width = 190,
  height = 120,
  isActive = false,
  isSelected = false,
  onSelect,
  onHover,
  liveData = null,
  detailedState = null,
  reducedMotion = false,
}) => {
  const Icon = ICONS[id] || Cpu;
  const isControlUnit = id === 'controlUnit';

  // Aesthetic styling matching laboratory technical visualization
  let borderClass = 'border-neutral-200 dark:border-neutral-800/90';
  let bgClass = 'bg-white/95 dark:bg-[#0f141d]/95';
  let glowClass = 'shadow-xs';
  let badgeBg = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400';

  if (isActive) {
    if (isControlUnit) {
      borderClass = 'border-amber-500 ring-2 ring-amber-500/30';
      bgClass = 'bg-amber-500/5 dark:bg-[#16130d]';
      glowClass = 'shadow-lg shadow-amber-500/20';
      badgeBg = 'bg-amber-500/20 text-amber-700 dark:text-amber-300';
    } else {
      borderClass = 'border-sky-500 ring-2 ring-sky-500/30';
      bgClass = 'bg-sky-500/5 dark:bg-[#0c1524]';
      glowClass = 'shadow-lg shadow-sky-500/20';
      badgeBg = 'bg-sky-500/20 text-sky-700 dark:text-sky-300';
    }
  } else if (isSelected) {
    borderClass = 'border-indigo-500 ring-2 ring-indigo-500/30';
    glowClass = 'shadow-md shadow-indigo-500/20';
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
      className="overflow-visible select-none"
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`${title} (${subtitle}). Current state: ${liveData?.value || 'Standby'}. Press Enter to inspect.`}
        aria-pressed={isSelected}
        onClick={() => onSelect(id)}
        onMouseEnter={() => onHover && onHover(id)}
        onKeyDown={handleKeyDown}
        className={`w-full h-full rounded-2xl border-2 ${borderClass} ${bgClass} ${glowClass} p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-sky-500 relative backdrop-blur-xs ${
          isActive && !reducedMotion ? 'scale-[1.02]' : 'hover:scale-[1.01]'
        }`}
      >
        {/* Top Header: Unit Icon + Title + Status Pulse LED */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`p-1.5 rounded-xl shrink-0 transition-colors ${
                isActive
                  ? isControlUnit
                    ? 'bg-amber-500 text-white shadow-xs shadow-amber-500/40'
                    : 'bg-sky-500 text-white shadow-xs shadow-sky-500/40'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h5 className="text-[11px] font-black text-neutral-900 dark:text-neutral-100 leading-tight truncate">
                {title}
              </h5>
              <span className="text-[9.5px] text-neutral-500 dark:text-neutral-400 font-medium truncate block">
                {subtitle}
              </span>
            </div>
          </div>

          {/* Active Status Beacon */}
          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            {isActive ? (
              <span className="flex h-2 w-2 relative">
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
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            )}
          </div>
        </div>

        {/* ========================================================
            INTERNAL HARDWARE VISUALIZATION LAYER
           ======================================================== */}
        <div className="my-1">
          {/* 1. MEMORY UNIT: Miniature RAM Address Cells */}
          {id === 'memory' && detailedState?.ramCells && (
            <div className="grid grid-cols-3 gap-1 text-[9px] font-mono">
              {detailedState.ramCells.map((cell) => (
                <div
                  key={cell.addr}
                  className={`p-1 rounded-md border text-center transition-all ${
                    cell.isHighlighted
                      ? 'border-sky-500 bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div className="text-[7.5px] text-neutral-400">{cell.addr}</div>
                  <div className="font-black truncate">{cell.val ?? '—'}</div>
                </div>
              ))}
            </div>
          )}

          {/* 2. ALU: Operands Registers & Visual Calculation */}
          {id === 'alu' && detailedState?.aluRegisters && (
            <div className="flex items-center justify-between gap-1 text-[9px] font-mono p-1 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-1">
                <span className="text-[7.5px] text-neutral-400">A:</span>
                <span className="font-black px-1 py-0.5 rounded bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                  {detailedState.aluRegisters.regA ?? '—'}
                </span>
                <span className="font-bold text-sky-500">{detailedState.aluRegisters.op ?? '+'}</span>
                <span className="text-[7.5px] text-neutral-400">B:</span>
                <span className="font-black px-1 py-0.5 rounded bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                  {detailedState.aluRegisters.regB ?? '—'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[7.5px] text-neutral-400 block leading-none">ACC:</span>
                <span
                  className={`font-black text-[10px] ${
                    detailedState.aluRegisters.resultReady
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-neutral-400'
                  }`}
                >
                  {detailedState.aluRegisters.acc ?? '—'}
                </span>
              </div>
            </div>
          )}

          {/* 3. CONTROL UNIT: Instruction Register & Micro-command */}
          {id === 'controlUnit' && detailedState?.cuState && (
            <div className="flex items-center justify-between text-[9px] font-mono px-1.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
              <span className="text-[8px] uppercase tracking-wider text-amber-600/80 dark:text-amber-400/80 font-bold">
                CMD:
              </span>
              <span className="font-black truncate max-w-[130px]">
                {detailedState.cuState.command || 'SUPERVISORY CLK'}
              </span>
            </div>
          )}

          {/* 4. INPUT DEVICE: Keystroke visualizer & ASCII buffer */}
          {id === 'input' && detailedState?.inputState && (
            <div className="flex items-center justify-between text-[9px] font-mono px-1.5 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[8px] text-neutral-400">BIN:</span>
              <span className="text-sky-600 dark:text-sky-400 font-bold truncate max-w-[125px]">
                {detailedState.inputState.binary || '0000 0000'}
              </span>
            </div>
          )}

          {/* 5. OUTPUT DEVICE: Video DAC / Buffer state */}
          {id === 'output' && detailedState?.outputState && (
            <div className="flex items-center justify-between text-[9px] font-mono px-1.5 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[8px] text-neutral-400">VRAM:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[120px]">
                {detailedState.outputState.buffer || 'READY'}
              </span>
            </div>
          )}

          {/* 6. OPERATOR: Current human intent */}
          {id === 'operator' && detailedState?.operatorState && (
            <div className="text-[9px] px-1.5 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 truncate">
              {detailedState.operatorState.text || 'Observing system'}
            </div>
          )}
        </div>

        {/* Bottom Status Pill */}
        <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[9.5px]">
          <span className="text-neutral-500 dark:text-neutral-400 font-medium truncate max-w-[80px]">
            {liveData?.label || 'Status:'}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded font-mono font-bold tracking-tight truncate max-w-[95px] ${badgeBg}`}
          >
            {liveData?.value || 'Idle'}
          </span>
        </div>
      </div>
    </foreignObject>
  );
};

export default ComputerDiagramNode;
