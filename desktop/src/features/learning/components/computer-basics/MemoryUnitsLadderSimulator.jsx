import React, { useState } from 'react';
import {
  HardDrive,
  Layers,
  Sparkles,
  Calculator,
  ChevronRight,
  Database,
  ArrowRight,
} from 'lucide-react';

const MEMORY_UNITS = [
  {
    unit: '1 Bit',
    symbol: 'b',
    bytes: 0.125,
    exactFormula: 'Binary Digit (0 or 1)',
    analogyEn: 'A single light switch turned ON or OFF. The atom of all computing.',
    analogyBn: 'একটি বৈদ্যুতিক সুইচ চালু (১) বা বন্ধ (০)। সমস্ত কম্পিউটার জগতের পরমাণু।',
    realWorld: '1 microscopic electrical charge in RAM capacitor',
    multiplier: 'Base',
    color: 'from-neutral-500 to-neutral-700',
  },
  {
    unit: '1 Nibble',
    symbol: 'nibble',
    bytes: 0.5,
    exactFormula: '4 Bits (Half of a Byte)',
    analogyEn: 'A 4-digit code lock (like 1010). Exactly one single Hexadecimal digit (0-F).',
    analogyBn: '৪টি বিটের সমষ্টি (একটি বাইটের অর্ধেক)। হেক্সাডেসিমেলের একটি অক্ষর।',
    realWorld: 'Represents hex numbers like 0xF or 0x9 in low-level microcontrollers',
    multiplier: '4x bit',
    color: 'from-amber-600 to-orange-600',
  },
  {
    unit: '1 Byte',
    symbol: 'B',
    bytes: 1,
    exactFormula: '8 Bits',
    analogyEn: 'A single English letter or character, like the letter "A" or symbol "$".',
    analogyBn: '৮টি বিটের দল। কীবোর্ডের একটি একক অক্ষর—যেমন "A" বা "$"।',
    realWorld: 'ASCII character "A" is binary 01000001',
    multiplier: '8x bit',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    unit: '1 Kilobyte (KB)',
    symbol: 'KB',
    bytes: 1024,
    exactFormula: '1,024 Bytes (2¹⁰ Bytes)',
    analogyEn: 'A short 1-page typed homework essay or a short text message.',
    analogyBn: '১,০২৪ বাইট (২¹⁰)। একটি টাইপ করা পৃষ্ঠার রচনা বা সংক্ষিপ্ত টেক্সট বার্তা।',
    realWorld: 'A clean plain-text resume or email is around 15 KB',
    multiplier: '1,024 B',
    color: 'from-sky-600 to-blue-600',
  },
  {
    unit: '1 Megabyte (MB)',
    symbol: 'MB',
    bytes: 1024 * 1024,
    exactFormula: '1,024 KB = 1,048,576 Bytes (2²⁰)',
    analogyEn: 'One 3-minute high-quality MP3 song, or a crisp smartphone selfie photo.',
    analogyBn: '১,০২৪ কিলোবাইট। একটি ৩ মিনিটের এমপিথ্রি গান বা একটি সুন্দর সেলফি ছবি।',
    realWorld: 'A 400-page novel in PDF without pictures is roughly 2 to 5 MB',
    multiplier: '1,024 KB',
    color: 'from-indigo-600 to-violet-600',
  },
  {
    unit: '1 Gigabyte (GB)',
    symbol: 'GB',
    bytes: 1024 * 1024 * 1024,
    exactFormula: '1,024 MB = 1,073,741,824 Bytes (2³⁰)',
    analogyEn: 'A full-length 1080p movie, or an entire pickup truck filled with printed books!',
    analogyBn: '১,০২৪ মেগাবাইট। একটি পুরো এইচডি সিনেমা বা বইয়ে ঠাসা একটি পিকআপ ভ্যান!',
    realWorld: 'Spotify downloads for 250 songs, or a modern mobile phone game',
    multiplier: '1,024 MB',
    color: 'from-purple-600 to-pink-600',
  },
  {
    unit: '1 Terabyte (TB)',
    symbol: 'TB',
    bytes: 1024 * 1024 * 1024 * 1024,
    exactFormula: '1,024 GB = 1,099,511,627,776 Bytes (2⁴⁰)',
    analogyEn: 'An entire university library! Around 250,000 photos or 500 hours of HD video.',
    analogyBn: '১,০২৪ গিগাবাইট। একটি পূর্ণাঙ্গ বিশ্ববিদ্যালয় লাইব্রেরির সব বই বা আড়াই লক্ষ ছবি!',
    realWorld: 'A standard modern laptop NVMe SSD storage drive is 1 TB or 2 TB',
    multiplier: '1,024 GB',
    color: 'from-rose-600 to-red-600',
  },
  {
    unit: '1 Petabyte (PB)',
    symbol: 'PB',
    bytes: 1024 * 1024 * 1024 * 1024 * 1024,
    exactFormula: '1,024 TB = 1,125,899,906,842,624 Bytes (2⁵⁰)',
    analogyEn: '500 billion pages of printed standard text, or 58 years of continuous 4K video!',
    analogyBn: '১,০২৪ টেরাবাইট। ৫০০ বিলিয়ন পৃষ্ঠার ছাপা বই বা ৫৮ বছরের একটানা ৪কে ভিডিও!',
    realWorld: 'The Large Hadron Collider at CERN generates ~30 Petabytes of data every year',
    multiplier: '1,024 TB',
    color: 'from-amber-500 to-yellow-600',
  },
  {
    unit: '1 Exabyte (EB)',
    symbol: 'EB',
    bytes: 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
    exactFormula: '1,024 PB = 1,152,921,504,606,846,976 Bytes (2⁶⁰)',
    analogyEn: 'Roughly 50% of all the words ever spoken by all humans throughout recorded history!',
    analogyBn: '১,০২৪ পেটাবাইট। মানব ইতিহাসের সূচনালগ্ন থেকে মানুষের বলা মোট কথার প্রায় অর্ধেক!',
    realWorld: 'Monthly global internet traffic is measured in hundreds of Exabytes',
    multiplier: '1,024 PB',
    color: 'from-emerald-500 to-teal-500',
  },
];

export const MemoryUnitsLadderSimulator = ({ lang = 'both' }) => {
  const [selectedIdx, setSelectedIdx] = useState(3); // default 1 KB
  const [converterValue, setConverterValue] = useState(16); // e.g. 16
  const [converterUnit, setConverterUnit] = useState('GB'); // from unit

  const current = MEMORY_UNITS[selectedIdx];

  // Quick unit calculation helpers
  const getConvertedOutputs = () => {
    const val = parseFloat(converterValue) || 0;
    let bytes = 0;
    if (converterUnit === 'KB') bytes = val * 1024;
    else if (converterUnit === 'MB') bytes = val * 1024 * 1024;
    else if (converterUnit === 'GB') bytes = val * 1024 * 1024 * 1024;
    else if (converterUnit === 'TB') bytes = val * 1024 * 1024 * 1024 * 1024;

    return {
      bits: (bytes * 8).toLocaleString(),
      bytes: bytes.toLocaleString(),
      kb: (bytes / 1024).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      mb: (bytes / (1024 * 1024)).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      gb: (bytes / (1024 * 1024 * 1024)).toLocaleString(undefined, { maximumFractionDigits: 4 }),
      tb: (bytes / (1024 * 1024 * 1024 * 1024)).toLocaleString(undefined, { maximumFractionDigits: 6 }),
    };
  };

  const outputs = getConvertedOutputs();

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-7 shadow-sm space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              Interactive Capacity Ladder
            </span>
            <span className="text-xs text-neutral-400 font-mono">Lecture 03 · Topic 1.2</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            Units of Digital Memory (From 1 Bit to 1 Exabyte)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {lang === 'bn'
              ? 'বিট, নিবল, বাইট থেকে শুরু করে এক্সাবাইট পর্যন্ত মেমোরির সিঁড়ি এবং বাস্তব জীবনের সাথে আকর্ষণীয় উপমা।'
              : 'Climb the 9-step staircase of computer storage and discover real-world mind-blowing analogies!'}
          </p>
        </div>
      </div>

      {/* Step Selector Ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {MEMORY_UNITS.map((item, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={item.symbol}
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-md scale-105'
                  : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              <span>{item.symbol}</span>
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Featured Active Unit Showcase Card */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-900/60 dark:to-neutral-950 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
              Step {selectedIdx + 1} of 9
            </span>
            <h4 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-0.5">
              {current.unit}
            </h4>
            <div className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 mt-0.5">
              Exact Size: {current.exactFormula}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 shadow-xs text-right">
            <span className="text-[10px] text-neutral-400 block font-mono">Scale Multiplier</span>
            <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {current.multiplier}
            </strong>
          </div>
        </div>

        {/* Real World Analogy Box */}
        <div className="p-4 rounded-xl bg-white/90 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
          <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>The Mind-Blowing Analogy / সহজ উপমা:</span>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {lang === 'bn' ? current.analogyBn : current.analogyEn}
          </p>
          {lang === 'both' && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800">
              🇧🇩 {current.analogyBn}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <HardDrive className="w-4 h-4 text-neutral-400 shrink-0" />
          <span>Real-World Benchmark: <strong>{current.realWorld}</strong></span>
        </div>
      </div>

      {/* Interactive Quick-Converter Calculator */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-[#151a24] space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-indigo-500" />
            <span>Live Binary Conversion Calculator / তাৎক্ষণিক রূপান্তর</span>
          </h4>
          <span className="text-[10px] text-neutral-400 font-mono">1024-based binary calculation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5 flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={converterValue}
              onChange={(e) => setConverterValue(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm font-mono font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <select
              value={converterUnit}
              onChange={(e) => setConverterUnit(e.target.value)}
              className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-xs font-bold text-neutral-700 dark:text-neutral-200 focus:outline-none"
            >
              <option value="KB">KB</option>
              <option value="MB">MB</option>
              <option value="GB">GB</option>
              <option value="TB">TB</option>
            </select>
          </div>

          <div className="sm:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 block">Total Bytes</span>
              <strong className="text-neutral-900 dark:text-neutral-100">{outputs.bytes} B</strong>
            </div>
            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 block">In MB</span>
              <strong className="text-sky-600 dark:text-sky-400">{outputs.mb} MB</strong>
            </div>
            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
              <span className="text-[10px] text-neutral-400 block">In GB</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{outputs.gb} GB</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryUnitsLadderSimulator;
