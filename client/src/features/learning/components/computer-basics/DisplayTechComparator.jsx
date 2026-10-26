import React, { useState } from 'react';
import {
  Tv,
  Monitor,
  Eye,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Sun,
  ShieldAlert,
} from 'lucide-react';

export const DisplayTechComparator = ({ lang = 'both' }) => {
  const [displayType, setDisplayType] = useState('crt'); // 'crt' | 'lcd'
  const [refreshRate, setRefreshRate] = useState(75); // Hz
  const [dotPitch, setDotPitch] = useState(0.24); // mm
  const [resolution, setResolution] = useState('1080p'); // '640x480' | '720p' | '1080p'

  const isFlickering = displayType === 'crt' && refreshRate < 72;

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-7 shadow-sm space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Interactive Display Physics
            </span>
            <span className="text-xs text-neutral-400 font-mono">Lecture 05 · Topic 4.2</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            Display Physics: CRT (Electron Beams) vs LCD (Liquid Crystals)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {lang === 'bn'
              ? 'সিআরটি বনাম এলসিডি মনিটর: রিফ্রেশ রেট (Hz), ডট পিচ (mm) এবং স্ক্রিন রেজোলিউশনের প্রভাব।'
              : 'Test refresh rate flicker, dot pitch sharpness, and explore the internal physics of computer screens!'}
          </p>
        </div>

        {/* Monitor Technology Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setDisplayType('crt')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              displayType === 'crt'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Cathode Ray Tube (CRT)</span>
          </button>
          <button
            onClick={() => setDisplayType('lcd')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              displayType === 'lcd'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Liquid Crystal Display (LCD)</span>
          </button>
        </div>
      </div>

      {/* Interactive Sliders (Refresh Rate & Dot Pitch) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Refresh Rate Slider */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-sky-500" />
              Refresh Rate (Scans Per Second):
            </span>
            <span className="font-mono text-sky-600 dark:text-sky-400 text-sm font-black">
              {refreshRate} Hz
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="144"
            step="5"
            value={refreshRate}
            onChange={(e) => setRefreshRate(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] text-neutral-400">
            <span>50 Hz (Severe Eye Flicker)</span>
            <span className="font-bold text-emerald-500">≥ 72 Hz (Flicker-Free Standard)</span>
            <span>144 Hz (Pro Gaming)</span>
          </div>
        </div>

        {/* Dot Pitch Slider */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-500" />
              Dot Pitch (RGB Pixel Distance):
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm font-black">
              {dotPitch} mm
            </span>
          </div>
          <input
            type="range"
            min="0.20"
            max="0.40"
            step="0.02"
            value={dotPitch}
            onChange={(e) => setDotPitch(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] text-neutral-400">
            <span>0.20 mm (Ultra Crisp)</span>
            <span className="font-bold text-emerald-500">Recommended ≤ 0.28 mm</span>
            <span>0.40 mm (Pixelated Grain)</span>
          </div>
        </div>
      </div>

      {/* Simulated Display Screen Window */}
      <div className="rounded-2xl bg-black p-6 border-4 border-neutral-800 relative overflow-hidden text-center space-y-3 min-h-[160px] flex flex-col items-center justify-center">
        {/* Live CRT Flicker Overlay */}
        {isFlickering && (
          <div className="absolute inset-0 bg-white/10 animate-ping pointer-events-none" />
        )}

        <div
          className={`space-y-1 transition-all ${
            isFlickering ? 'opacity-80 blur-[0.5px]' : 'opacity-100'
          }`}
          style={{
            filter: dotPitch > 0.3 ? 'contrast(90%) brightness(95%)' : 'none',
          }}
        >
          <div className="text-2xl font-black text-white tracking-wide">
            {displayType === 'crt' ? '📺 CATHODE RAY TUBE' : '🖥️ LIQUID CRYSTAL DISPLAY'}
          </div>
          <p className="text-xs font-mono text-neutral-400">
            Current Signal: 1920 × 1080 @ {refreshRate} Hz · Dot Pitch: {dotPitch} mm
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            {isFlickering ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Visible Flicker Detected! Eyes will tire quickly.
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ✓ Smooth, stable display. Zero eye fatigue.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Physics Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div
          className={`p-4 rounded-2xl border space-y-2 ${
            displayType === 'crt'
              ? 'bg-amber-950/20 border-amber-500/40 text-neutral-300'
              : 'bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 text-neutral-500'
          }`}
        >
          <div className="font-bold text-amber-500 flex items-center gap-1.5">
            <Tv className="w-4 h-4" />
            <span>CRT Mechanics (The Glass Vacuum Bottle)</span>
          </div>
          <ul className="space-y-1 text-[11px] list-disc list-inside">
            <li>Electron gun heats up and shoots 3 streams (Red, Green, Blue).</li>
            <li>Magnetic deflection yoke coils steer the beam across the screen.</li>
            <li>Phosphor dots glow when hit by high-voltage electrons.</li>
            <li><strong>Drawbacks:</strong> Heavy (20+ kg), high heat, high electrical power, slight X-ray radiation.</li>
          </ul>
        </div>

        <div
          className={`p-4 rounded-2xl border space-y-2 ${
            displayType === 'lcd'
              ? 'bg-blue-950/20 border-blue-500/40 text-neutral-300'
              : 'bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 text-neutral-500'
          }`}
        >
          <div className="font-bold text-blue-500 flex items-center gap-1.5">
            <Monitor className="w-4 h-4" />
            <span>LCD Mechanics (Liquid Crystal Shutter)</span>
          </div>
          <ul className="space-y-1 text-[11px] list-disc list-inside">
            <li>Flat LED backlight shines steady white light.</li>
            <li>Electric voltage twists liquid crystal molecules like microscopic window blinds.</li>
            <li>Polarizing filters only let aligned light pass through RGB color filters.</li>
            <li><strong>Superpowers:</strong> Razor thin (5 mm), lightweight, zero radiation, ultra-low battery consumption!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DisplayTechComparator;
