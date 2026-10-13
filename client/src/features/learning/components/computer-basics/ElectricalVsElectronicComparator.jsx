import React, { useState } from 'react';
import {
  Flame,
  Sun,
  Lightbulb,
} from 'lucide-react';

export const ElectricalVsElectronicComparator = () => {
  // Simulator states for Toaster and Light Sensor
  const [isToasterOn, setIsToasterOn] = useState(false);
  const [ambientLight, setAmbientLight] = useState(30); // 0 to 100%

  // Transistor demonstration state
  const [gateVoltage, setGateVoltage] = useState(false); // Base/Gate: 0 or 1

  // Practice classifier quiz
  const [classifiedDevices, setClassifiedDevices] = useState({});

  const PRACTICE_DEVICES = [
    {
      id: 'toaster',
      name: 'Classic Bread Toaster',
      correct: 'electrical',
      explanation:
        'Primarily Electrical: Electricity flows through high-resistance nichrome wires, converting raw current directly into thermal heat without data processing.',
    },
    {
      id: 'smartphone',
      name: 'Smartphone',
      correct: 'electronic',
      explanation:
        'Electronic: Contains billions of microscopic semiconductor transistors, processing digital binary data, network packets, and operating system logic.',
    },
    {
      id: 'ceiling-fan',
      name: 'Standard Ceiling Fan',
      correct: 'electrical',
      explanation:
        'Electrical: Electric current passes through copper wire coils in an induction motor to generate magnetic torque and mechanical rotary motion.',
    },
    {
      id: 'digital-watch',
      name: 'Digital Quartz Watch',
      correct: 'electronic',
      explanation:
        'Electronic: Uses a quartz crystal oscillator and integrated microchip circuits to divide electrical oscillations into precise binary time counting.',
    },
    {
      id: 'smart-microwave',
      name: 'Modern Smart Microwave',
      correct: 'hybrid',
      explanation:
        'Hybrid (Both): Uses high-voltage electrical transformers and magnetron coils to heat food, guided by a digital electronic microcontroller circuit with a timer display.',
    },
    {
      id: 'light-sensor',
      name: 'Automatic Night Lamp (LDR Sensor)',
      correct: 'electronic',
      explanation:
        'Electronic: Light-dependent semiconductor sensor reads ambient light levels as an analog voltage signal, which transistor switches evaluate to turn on the lamp.',
    },
  ];

  const handleClassify = (deviceId, choice) => {
    setClassifiedDevices((prev) => ({
      ...prev,
      [deviceId]: choice,
    }));
  };

  const isLightSensorTriggered = ambientLight < 40; // Triggers night light when dark

  return (
    <div className="space-y-6">
      {/* Part 1: Interactive Lecture Demonstrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* The Toaster (Electrical Demonstration) */}
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400">
                  Lecture Example 1
                </span>
                <h4 className="text-sm font-black text-neutral-900 dark:text-neutral-100">
                  The Bread Toaster (Electrical)
                </h4>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
              Raw Energy Conversion
            </span>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Push down the lever to send current through nichrome resistance heating coils. The electrical current converts directly into radiant heat to toast bread. Notice: zero data calculation or decision logic is involved!
          </p>

          {/* Interactive Toaster Stage */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4 text-center space-y-3">
            <div
              className={`h-24 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                isToasterOn
                  ? 'border-orange-500 bg-gradient-to-t from-red-500/20 via-orange-500/30 to-amber-500/20 shadow-lg shadow-orange-500/20'
                  : 'border-neutral-300 dark:border-neutral-700 bg-neutral-200/50 dark:bg-neutral-800/50'
              }`}
            >
              <div className="space-y-1">
                <div
                  className={`text-2xl transition-transform duration-300 ${
                    isToasterOn ? 'scale-110 animate-bounce' : 'opacity-60'
                  }`}
                >
                  🍞
                </div>
                <span
                  className={`text-xs font-black ${
                    isToasterOn ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-500'
                  }`}
                >
                  {isToasterOn
                    ? 'Coils Glowing Red-Hot! (Current -> Heat Energy)'
                    : 'Toaster Idle (Lever Up)'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsToasterOn(!isToasterOn)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isToasterOn
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90'
              }`}
            >
              {isToasterOn ? 'Release Lever (Turn Off)' : 'Push Lever Down (Turn On)'}
            </button>
          </div>
        </div>

        {/* The Light Sensor Circuit (Electronic Demonstration) */}
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400">
                  Lecture Example 2
                </span>
                <h4 className="text-sm font-black text-neutral-900 dark:text-neutral-100">
                  Battery & Light Sensor (Electronic)
                </h4>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
              Signal & Decision Logic
            </span>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            A semiconductor sensor (LDR / photodiode) continuously measures ambient light levels as an analog signal. When light dips below 40%, the electronic transistor evaluates the signal and triggers the night lamp!
          </p>

          {/* Interactive Light Sensor Stage */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Simulate Ambient Daylight:
                </span>
                <span className="text-sky-600 dark:text-sky-400 font-mono">
                  {ambientLight}% ({ambientLight >= 40 ? 'Daylight' : 'Darkness'})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={ambientLight}
                onChange={(e) => setAmbientLight(Number(e.target.value))}
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                isLightSensorTriggered
                  ? 'border-amber-400 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                  : 'border-neutral-300 dark:border-neutral-700 bg-neutral-200/40 dark:bg-neutral-800/40 text-neutral-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lightbulb
                  className={`w-5 h-5 ${isLightSensorTriggered ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-neutral-400'}`}
                />
                <span className="text-xs font-bold">
                  {isLightSensorTriggered
                    ? 'Electronic Decision: Darkness detected! Night lamp switched ON.'
                    : 'Electronic Decision: Sufficient ambient light. Lamp stays OFF.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: Interactive Transistor Switch Demonstration */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-6 shadow-sm space-y-4">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
            The Building Block of Computers
          </span>
          <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100 mt-1">
            How a Semiconductor Transistor Works: Electronic Binary Switching (0 vs 1)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            A transistor has no moving mechanical parts. Applying a tiny voltage to the control gate allows electric current to flow through the semiconductor channel, representing binary 1. Removing it represents binary 0.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGateVoltage(!gateVoltage)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                gateVoltage
                  ? 'bg-purple-600 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              Control Gate Voltage: {gateVoltage ? 'ON (+V)' : 'OFF (0V)'}
            </button>
            <div className="text-xs">
              <span className="text-neutral-500 dark:text-neutral-400 font-semibold block">
                Channel State:
              </span>
              <span
                className={`font-black font-mono ${
                  gateVoltage ? 'text-purple-600 dark:text-purple-400' : 'text-neutral-500'
                }`}
              >
                {gateVoltage ? 'Conducting (Current Flows)' : 'Blocked (High Resistance)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
              Binary Bit Produced:
            </span>
            <span
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-lg transition-all ${
                gateVoltage
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                  : 'bg-neutral-300 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {gateVoltage ? '1' : '0'}
            </span>
          </div>
        </div>
      </div>

      {/* Part 3: Interactive Device Classification Drill */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-6 shadow-sm space-y-4">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Self-Assessment Challenge
          </span>
          <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100 mt-1">
            Classify Real-World Devices: Electrical, Electronic, or Hybrid?
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Test your understanding of the scientific distinction and modern device overlaps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRACTICE_DEVICES.map((dev) => {
            const userChoice = classifiedDevices[dev.id];
            const isAnswered = !!userChoice;
            const isCorrect = userChoice === dev.correct;

            return (
              <div
                key={dev.id}
                className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-black text-neutral-900 dark:text-neutral-100">
                    {dev.name}
                  </h4>
                  {isAnswered && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isCorrect
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}
                    >
                      {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                    </span>
                  )}
                </div>

                {/* 3 Option Buttons */}
                <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => handleClassify(dev.id, 'electrical')}
                    className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                      userChoice === 'electrical'
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    Electrical
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClassify(dev.id, 'electronic')}
                    className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                      userChoice === 'electronic'
                        ? 'border-sky-500 bg-sky-500 text-white'
                        : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    Electronic
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClassify(dev.id, 'hybrid')}
                    className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                      userChoice === 'hybrid'
                        ? 'border-purple-500 bg-purple-500 text-white'
                        : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    Hybrid (Both)
                  </button>
                </div>

                {/* Feedback Explanation */}
                {isAnswered && (
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed bg-white dark:bg-neutral-800 p-2 rounded-xl border border-neutral-100 dark:border-neutral-700">
                    {dev.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ElectricalVsElectronicComparator;
