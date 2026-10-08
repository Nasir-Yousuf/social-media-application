import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Shield,
  Zap,
  Gauge,
  Flame,
  Palette,
  Type,
} from 'lucide-react';
import {
  CAR_CATALOG,
  getPlayerGarage,
  savePlayerGarage,
} from '../../../utils/racingStorage';
import racingAudio from '../../../utils/racingAudio';

/**
 * Dedicated Garage Customizer View
 * Allows choosing car, inspecting stats, choosing custom license plate,
 * selecting neon underglow, paint colors, and wheel trims.
 */
export const GarageView = ({ onBack = () => {}, currentUser = null }) => {
  const [garage, setGarage] = useState(() => getPlayerGarage(currentUser));
  const [activeCarIndex, setActiveCarIndex] = useState(() => {
    const cur = getPlayerGarage(currentUser);
    const idx = CAR_CATALOG.findIndex((c) => c.id === cur.selectedCarId);
    return idx >= 0 ? idx : 0;
  });
  const [plateInput, setPlateInput] = useState(garage.licensePlate || 'NASIR');

  const currentCar = CAR_CATALOG[activeCarIndex] || CAR_CATALOG[0];

  const handleSelectCar = (index) => {
    setActiveCarIndex(index);
    const car = CAR_CATALOG[index];
    const updated = savePlayerGarage({ selectedCarId: car.id, paintColor: car.color });
    if (updated) setGarage(updated);
    racingAudio.playKey(true);
  };

  const handleUpdatePlate = (e) => {
    e.preventDefault();
    const clean = plateInput.toUpperCase().trim().slice(0, 8);
    const updated = savePlayerGarage({ licensePlate: clean });
    if (updated) {
      setGarage(updated);
      racingAudio.playVictory();
    }
  };

  const handleColorChange = (hex) => {
    const updated = savePlayerGarage({ paintColor: hex });
    if (updated) setGarage(updated);
    racingAudio.playKey(true);
  };

  const handleUnderglowChange = (hex) => {
    const updated = savePlayerGarage({ neonUnderglow: hex });
    if (updated) setGarage(updated);
    racingAudio.playKey(true);
  };

  const paintPresets = [
    '#a855f7', // Purple
    '#ef4444', // Red
    '#22c55e', // Green
    '#3b82f6', // Blue
    '#eab308', // Gold
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#f97316', // Orange
    '#e2e8f0', // Titanium Silver
    '#0f172a', // Midnight Black
  ];

  return (
    <div className="w-full space-y-6 select-none font-sans text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black italic tracking-wide text-white">
              CUSTOM GARAGE
            </h2>
            <p className="text-xs text-slate-400">
              Personalize your hypercar, license plate & neon setup
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition shadow-lg shadow-cyan-950/40"
        >
          READY TO RACE
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Turntable Showroom (7 Columns) */}
        <div className="lg:col-span-7 rounded-3xl bg-gradient-to-b from-slate-950 via-indigo-950/50 to-slate-950 border border-slate-800/90 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Ambient glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-35 pointer-events-none transition-all duration-300"
            style={{ backgroundColor: garage.paintColor || currentCar.color }}
          />

          <div className="flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs uppercase border border-amber-500/40">
              {currentCar.tier}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              CAR #{activeCarIndex + 1} / {CAR_CATALOG.length}
            </span>
          </div>

          {/* Turntable Center Presentation */}
          <div className="relative my-8 flex flex-col items-center justify-center z-10">
            {/* Turntable platform ring */}
            <div className="relative flex flex-col items-center">
              {/* Car Body Presentation */}
              <div
                className="w-56 sm:w-72 h-28 sm:h-36 rounded-2xl border-2 border-white/20 shadow-2xl flex flex-col items-center justify-between p-3 relative transition-all duration-300"
                style={{
                  backgroundColor: garage.paintColor || currentCar.color,
                  boxShadow: `0 0 35px ${garage.neonUnderglow || '#c084fc'}88`,
                }}
              >
                {/* Windshield */}
                <div className="w-32 h-10 rounded-lg bg-slate-950/80 border border-white/10" />

                {/* Custom License Plate Display */}
                <div className="px-3 py-1 rounded bg-slate-950 border border-white/30 text-white font-mono text-xs font-black tracking-widest shadow-inner">
                  {garage.licensePlate || 'NASIR'}
                </div>
              </div>

              {/* Glowing Turntable Base */}
              <div
                className="w-72 sm:w-96 h-8 rounded-full bg-slate-900 border-2 border-cyan-500/40 -mt-4 -z-10 shadow-lg"
                style={{
                  boxShadow: `0 0 20px ${garage.neonUnderglow || '#c084fc'}44`,
                }}
              />
            </div>
          </div>

          {/* Carousel Arrows & Car List */}
          <div className="z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-white">{currentCar.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentCar.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleSelectCar(
                      activeCarIndex > 0 ? activeCarIndex - 1 : CAR_CATALOG.length - 1
                    )
                  }
                  className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() =>
                    handleSelectCar(
                      activeCarIndex < CAR_CATALOG.length - 1 ? activeCarIndex + 1 : 0
                    )
                  }
                  className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Car Thumbnails Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CAR_CATALOG.map((car, idx) => (
                <button
                  key={car.id}
                  onClick={() => handleSelectCar(idx)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl border flex items-center gap-2 transition ${
                    activeCarIndex === idx
                      ? 'border-cyan-400 bg-slate-800 text-white'
                      : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="w-5 h-3 rounded" style={{ backgroundColor: car.color }} />
                  <span className="text-xs font-bold">{car.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Customization Panels & Stats (5 Columns) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Car Performance Telemetry Stats */}
          <div className="p-5 rounded-3xl bg-slate-950/90 border border-slate-800/80 shadow-xl space-y-3">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Gauge size={16} className="text-cyan-400" />
              <span>Specs & Telemetry</span>
            </h4>

            {[
              { label: 'Top Speed', val: currentCar.stats.speed, icon: Zap, color: 'from-cyan-500 to-sky-400' },
              { label: 'Acceleration', val: currentCar.stats.acceleration, icon: Flame, color: 'from-fuchsia-500 to-pink-400' },
              { label: 'Handling', val: currentCar.stats.handling, icon: Shield, color: 'from-emerald-500 to-green-400' },
              { label: 'Nitro Boost', val: currentCar.stats.nitro, icon: Sparkles, color: 'from-amber-500 to-yellow-400' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <stat.icon size={13} className="text-slate-400" />
                    <span>{stat.label}</span>
                  </span>
                  <span className="text-white font-mono">{stat.val} / 100</span>
                </div>
                <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                    style={{ width: `${stat.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Custom License Plate Editor */}
          <div className="p-5 rounded-3xl bg-slate-950/90 border border-slate-800/80 shadow-xl space-y-3">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Type size={16} className="text-purple-400" />
              <span>Custom License Plate</span>
            </h4>

            <form onSubmit={handleUpdatePlate} className="flex items-center gap-2">
              <input
                type="text"
                value={plateInput}
                onChange={(e) => setPlateInput(e.target.value)}
                maxLength={8}
                placeholder="YOUR NAME"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold uppercase text-sm tracking-widest focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
              >
                APPLY
              </button>
            </form>
          </div>

          {/* Paint & Underglow Chooser */}
          <div className="p-5 rounded-3xl bg-slate-950/90 border border-slate-800/80 shadow-xl space-y-4">
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2 mb-2">
                <Palette size={16} className="text-emerald-400" />
                <span>Body Paint Finish</span>
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {paintPresets.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => handleColorChange(hex)}
                    className={`w-7 h-7 rounded-full border-2 transition ${
                      garage.paintColor === hex ? 'border-white scale-110 shadow-md' : 'border-black/50'
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-cyan-400" />
                <span>Neon Underglow Aura</span>
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {['#c084fc', '#38bdf8', '#4ade80', '#f43f5e', '#fde047', '#fb923c'].map((hex) => (
                  <button
                    key={hex}
                    onClick={() => handleUnderglowChange(hex)}
                    className={`w-7 h-7 rounded-full border-2 transition ${
                      garage.neonUnderglow === hex ? 'border-white scale-110 shadow-md' : 'border-black/50'
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GarageView;
