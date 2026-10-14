import React from 'react';
import { Monitor, Tv, Wifi } from 'lucide-react';

/**
 * VirtualMonitor
 * Represents the dedicated user-facing display screen connected to the Output Device.
 * Displays scanlines, pixel illumination, signal status, and the computed mathematical result.
 */
export const VirtualMonitor = ({
  x = 615,
  y = 345,
  width = 240,
  height = 120,
  isOn = false,
  displayValue = null,
  formula = '',
  status = 'STANDBY',
  reducedMotion = false,
}) => {
  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      className="overflow-visible select-none"
    >
      <div
        className={`w-full h-full rounded-2xl border-2 transition-all duration-300 p-2.5 flex flex-col justify-between relative overflow-hidden backdrop-blur-md shadow-md ${
          isOn
            ? 'border-emerald-500/80 bg-neutral-950 shadow-emerald-500/20 ring-2 ring-emerald-500/20'
            : 'border-neutral-300 dark:border-neutral-800 bg-neutral-900/90'
        }`}
      >
        {/* CRT Scanline Simulation Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
            backgroundSize: '100% 4px',
          }}
        />

        {/* Monitor Bezel Header */}
        <div className="flex items-center justify-between z-10 text-[9px] font-mono border-b border-neutral-800 pb-1">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Tv className="w-3 h-3 text-emerald-400" />
            <span className="font-bold tracking-wider">VIRTUAL DISPLAY</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOn ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'
              }`}
            />
            <span
              className={`text-[8.5px] font-bold ${
                isOn ? 'text-emerald-400' : 'text-neutral-500'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Screen Center: High-contrast Pixel Readout */}
        <div className="my-auto text-center z-10 py-1">
          {isOn && displayValue !== null ? (
            <div className="space-y-0.5">
              {formula && (
                <div className="text-[9.5px] font-mono text-emerald-400/70 tracking-widest">
                  {formula}
                </div>
              )}
              <div
                className={`text-2xl font-black font-mono text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)] tracking-wider ${
                  !reducedMotion ? 'animate-in zoom-in-95 duration-200' : ''
                }`}
              >
                {displayValue}
              </div>
            </div>
          ) : (
            <div className="text-[10px] font-mono text-neutral-600 italic">
              [ NO SIGNAL INPUT ]
            </div>
          )}
        </div>

        {/* Screen Footer */}
        <div className="flex items-center justify-between text-[8px] font-mono text-neutral-500 z-10 pt-1 border-t border-neutral-900">
          <span>60Hz RGB PIXEL MATRIX</span>
          <span className="text-emerald-500/80 font-bold">
            {isOn ? 'SIGNAL LOCKED' : 'SYNC STANDBY'}
          </span>
        </div>
      </div>
    </foreignObject>
  );
};

export default VirtualMonitor;
