import React, { useState } from 'react';
import {
  Cpu,
  HardDrive,
  Code2,
  Sparkles,
} from 'lucide-react';

export const HardwareSoftwareChart = () => {
  const [selectedNode, setSelectedNode] = useState('hardware');

  const NODES_DATA = {
    system: {
      id: 'system',
      title: 'Computer System',
      badge: 'Integrated Whole',
      desc: 'An integrated combination of hardware, software, data, procedures, and users working in harmony to accept data, process it, and output information.',
      examples: 'Personal Computers, Cloud Servers, Smartphones, Supercomputers',
    },
    hardware: {
      id: 'hardware',
      title: 'Hardware (Physical)',
      badge: 'Tangible Machinery',
      desc: 'The physical, tangible electronic and mechanical equipment that makes up a computer. You can touch, see, and weigh hardware components.',
      examples: 'Motherboard, CPU, RAM sticks, Graphics Card, Power Supply, Keyboard, Monitor',
    },
    software: {
      id: 'software',
      title: 'Software (Programs & Logic)',
      badge: 'Intangible Code',
      desc: 'The intangible collections of instructions, programs, procedures, and documentation that tell the physical hardware exactly how to perform specific tasks.',
      examples: 'Operating Systems (Windows, macOS), Drivers, Browsers, Office Suites, Mobile Apps',
    },
    hwInput: {
      id: 'hwInput',
      title: 'Input Hardware',
      badge: 'Data Intake',
      desc: 'Peripherals that accept external data from the physical world and convert it into binary electrical signals.',
      examples: 'Keyboard, Mouse, Flatbed Scanner, Microphone, Webcam, Barcode Reader, Touchscreen',
    },
    hwProcessing: {
      id: 'hwProcessing',
      title: 'Processing Hardware (CPU & GPU)',
      badge: 'Execution Core',
      desc: 'Microprocessors that execute machine code instructions, perform arithmetic/logical calculations, and coordinate data flow.',
      examples: 'Central Processing Unit (CPU), Graphics Processing Unit (GPU), Math Co-processor',
    },
    hwStorage: {
      id: 'hwStorage',
      title: 'Storage Hardware',
      badge: 'Memory & Retention',
      desc: 'Electronic and magnetic components designed to hold active instructions (primary RAM) or preserve data long-term (secondary SSD/HDD).',
      examples: 'DDR5 RAM, Cache SRAM, NVMe Solid State Drives, SATA Hard Disks, Flash Pen Drives',
    },
    hwOutput: {
      id: 'hwOutput',
      title: 'Output Hardware',
      badge: 'Information Delivery',
      desc: 'Devices that translate processed binary data back into human-perceivable visual, printed, or auditory form.',
      examples: 'LED/OLED Monitors, Laser & Inkjet Printers, Audio Speakers, Digital Projectors',
    },
    swSystem: {
      id: 'swSystem',
      title: 'System Software',
      badge: 'Platform & Foundation',
      desc: 'Low-level software that directly manages hardware resources, allocates memory, schedules CPU time, and provides an environment for applications to execute.',
      examples: 'Operating Systems, Device Drivers, Firmware (BIOS/UEFI), System Utilities',
    },
    swApplication: {
      id: 'swApplication',
      title: 'Application Software',
      badge: 'User Productivity & Tools',
      desc: 'End-user programs designed to accomplish specific creative, business, computational, or communicative tasks.',
      examples: 'Microsoft Word, Google Chrome, Adobe Photoshop, MySQL, VLC Media Player',
    },
    swOS: {
      id: 'swOS',
      title: 'Operating System (OS)',
      badge: 'Master Supervisor',
      desc: 'The master control program that boots first and acts as the intermediary between hardware and all software applications.',
      examples: 'Microsoft Windows 11, Apple macOS, Linux (Ubuntu, Debian), Android, iOS',
    },
    swUtility: {
      id: 'swUtility',
      title: 'Utility Software',
      badge: 'Maintenance & Defense',
      desc: 'Support software designed to optimize, configure, analyze, maintain, and protect computer operations.',
      examples: 'Antivirus tools, Disk Cleanup, File Compressors (7-Zip, WinRAR), Backup utilities',
    },
    swGeneral: {
      id: 'swGeneral',
      title: 'General Purpose Applications',
      badge: 'Everyday Versatile Apps',
      desc: 'Mass-market software designed for broad productivity across millions of different organizations and individuals.',
      examples: 'Word Processors (Word), Spreadsheets (Excel), Web Browsers (Chrome), Media Players',
    },
    swSpecialized: {
      id: 'swSpecialized',
      title: 'Specialized & Custom Software',
      badge: 'Tailored Industry Solutions',
      desc: 'Software built or customized for specific industries, companies, or unique scientific/engineering requirements.',
      examples: 'AutoCAD (engineering design), Airline Reservation Systems, Hospital Billing ERPs',
    },
  };

  const current = NODES_DATA[selectedNode] || NODES_DATA.hardware;

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            Interactive Taxonomy Tree
          </span>
          <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            Organizational Structure of a Computer System
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Click on any branch in the hierarchy to inspect its definition, role, and practical examples.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedNode('system')}
          className="text-xs font-bold text-sky-500 hover:underline shrink-0 cursor-pointer"
        >
          Reset to Root (System)
        </button>
      </div>

      {/* Interactive Tree View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tree Column */}
        <div className="lg:col-span-7 space-y-3">
          {/* Root Node */}
          <button
            type="button"
            onClick={() => setSelectedNode('system')}
            className={`w-full text-left p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              selectedNode === 'system'
                ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/40'
            }`}
          >
            <div className="flex items-center gap-2.5 font-black text-sm">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span>Computer System</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              Root Level
            </span>
          </button>

          {/* Tier 1 Branches: Hardware vs Software */}
          <div className="pl-4 sm:pl-6 space-y-3 border-l-2 border-indigo-200 dark:border-indigo-900/50">
            {/* HARDWARE BRANCH */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedNode('hardware')}
                className={`w-full text-left p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  selectedNode === 'hardware'
                    ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm">
                  <HardDrive className="w-4 h-4 text-sky-500" />
                  <span>Hardware (Physical Components)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                  4 Subunits
                </span>
              </button>

              {/* Hardware Subunits */}
              <div className="pl-4 sm:pl-6 grid grid-cols-2 gap-2 border-l border-sky-200 dark:border-sky-900/40">
                <button
                  type="button"
                  onClick={() => setSelectedNode('hwInput')}
                  className={`p-2 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    selectedNode === 'hwInput'
                      ? 'border-sky-500 bg-sky-500 text-white font-bold'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  • Input Devices
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNode('hwProcessing')}
                  className={`p-2 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    selectedNode === 'hwProcessing'
                      ? 'border-sky-500 bg-sky-500 text-white font-bold'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  • Processing (CPU)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNode('hwStorage')}
                  className={`p-2 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    selectedNode === 'hwStorage'
                      ? 'border-sky-500 bg-sky-500 text-white font-bold'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  • Storage (RAM/SSD)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNode('hwOutput')}
                  className={`p-2 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    selectedNode === 'hwOutput'
                      ? 'border-sky-500 bg-sky-500 text-white font-bold'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  • Output Devices
                </button>
              </div>
            </div>

            {/* SOFTWARE BRANCH */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedNode('software')}
                className={`w-full text-left p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  selectedNode === 'software'
                    ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm">
                  <Code2 className="w-4 h-4 text-purple-500" />
                  <span>Software (Instructions & Programs)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                  2 Major Divisions
                </span>
              </button>

              {/* Software Subunits */}
              <div className="pl-4 sm:pl-6 space-y-2 border-l border-purple-200 dark:border-purple-900/40">
                {/* System Software */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedNode('swSystem')}
                    className={`w-full p-2 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      selectedNode === 'swSystem'
                        ? 'border-purple-500 bg-purple-500 text-white font-bold'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>System Software</span>
                    <span className="text-[10px] opacity-80">OS & Utilities</span>
                  </button>

                  <div className="pl-3 grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedNode('swOS')}
                      className={`p-1.5 rounded-lg border text-left text-[11px] font-medium transition-all cursor-pointer ${
                        selectedNode === 'swOS'
                          ? 'border-purple-400 bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold'
                          : 'border-neutral-200/60 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      → Operating System
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedNode('swUtility')}
                      className={`p-1.5 rounded-lg border text-left text-[11px] font-medium transition-all cursor-pointer ${
                        selectedNode === 'swUtility'
                          ? 'border-purple-400 bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold'
                          : 'border-neutral-200/60 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      → Utility Software
                    </button>
                  </div>
                </div>

                {/* Application Software */}
                <div className="space-y-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedNode('swApplication')}
                    className={`w-full p-2 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      selectedNode === 'swApplication'
                        ? 'border-purple-500 bg-purple-500 text-white font-bold'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>Application Software</span>
                    <span className="text-[10px] opacity-80">User Tasks</span>
                  </button>

                  <div className="pl-3 grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedNode('swGeneral')}
                      className={`p-1.5 rounded-lg border text-left text-[11px] font-medium transition-all cursor-pointer ${
                        selectedNode === 'swGeneral'
                          ? 'border-purple-400 bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold'
                          : 'border-neutral-200/60 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      → General Purpose
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedNode('swSpecialized')}
                      className={`p-1.5 rounded-lg border text-left text-[11px] font-medium transition-all cursor-pointer ${
                        selectedNode === 'swSpecialized'
                          ? 'border-purple-400 bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold'
                          : 'border-neutral-200/60 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      → Specialized / Custom
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Branch Details Card */}
        <div className="lg:col-span-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
                {current.badge}
              </span>
              <h4 className="text-base font-black text-neutral-900 dark:text-neutral-100">
                {current.title}
              </h4>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sky-500">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Description & Role:
            </span>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {current.desc}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 space-y-1">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
              Real-World Examples:
            </span>
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {current.examples}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareSoftwareChart;
