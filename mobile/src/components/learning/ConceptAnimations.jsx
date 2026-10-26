import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

// ============================================================================
// 1. IPO Machine Simulator (Input -> Process -> Output + Storage)
// ============================================================================
export const MobileIPOSimulator = ({ lang = 'both' }) => {
  const { colors: themeColors } = useTheme();
  const styles = getStyles(themeColors);

  const [selectedExample, setSelectedExample] = useState(0);
  const [stage, setStage] = useState('idle'); // 'idle' | 'input' | 'processing' | 'output'
  const [storageItems, setStorageItems] = useState(['History: System Boot']);

  const animPacket = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const EXAMPLES = [
    {
      title: 'Calculator: 25 + 75',
      titleBn: 'ক্যালকুলেটর: ২৫ + ৭৫',
      input: 'Numbers 25 and 75, Plus Operator (+)',
      inputBn: 'সংখ্যা ২৫ ও ৭৫, যোগ চিহ্ন (+)',
      process: 'ALU loads numbers into registers & adds binary bits',
      processBn: 'ALU রেজিস্টারে লোড করে বাইনারি যোগ করে',
      output: 'Result displayed: 100',
      outputBn: 'ফলাফল স্ক্রিনে দেখালো: ১০০',
      storage: 'Calculation saved: 25 + 75 = 100',
    },
    {
      title: 'Camera: Snapshot',
      titleBn: 'ক্যামেরা: ছবি তোলা',
      input: 'Light photons hit CMOS camera sensor',
      inputBn: 'ক্যামেরা লেন্সে আলো পড়ে সেন্সরে সংকেত দেয়',
      process: 'Image Processor (ISP) adjusts colors & compresses to JPG',
      processBn: 'প্রসেসর রং সামঞ্জস্য করে JPG ফরম্যাটে সাজায়',
      output: 'High-res image rendered on screen',
      outputBn: 'স্ক্রিনে চকচকে ছবি দেখা গেল',
      storage: 'Saved to Photo Gallery / DCIM / photo_01.jpg',
    },
    {
      title: 'Search: "Clearfeed"',
      titleBn: 'সার্চ: "Clearfeed"',
      input: 'Typing letters "C-l-e-a-r-f-e-e-d" on keyboard',
      inputBn: 'কীবোর্ডে "Clearfeed" টাইপ করা হলো',
      process: 'CPU queries in-memory index & filters matches',
      processBn: 'সিপিইউ মেমোরিতে সার্চ করে ফলাফল খুঁজে বের করে',
      output: 'Filtered peer feeds displayed on screen',
      outputBn: 'স্ক্রিনে ফিডের ফলাফল সাজিয়ে দিলো',
      storage: 'Search term added to Recent History',
    },
  ];

  const current = EXAMPLES[selectedExample];

  const runSimulation = () => {
    if (stage !== 'idle') return;

    setStage('input');
    animPacket.setValue(0);

    // Pulse animation on CPU
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    ).start();

    // 1. Move packet from Input to CPU
    Animated.timing(animPacket, {
      toValue: 0.5,
      duration: 1200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      setStage('processing');

      // 2. CPU Processing time
      setTimeout(() => {
        setStage('output');

        // 3. Move packet from CPU to Output & Storage
        Animated.timing(animPacket, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start(() => {
          pulseAnim.stopAnimation();
          pulseAnim.setValue(1);
          setStorageItems((prev) => [current.storage, ...prev.slice(0, 3)]);
        });
      }, 1500);
    });
  };

  const resetSimulation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    animPacket.setValue(0);
    setStage('idle');
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <MaterialCommunityIcons name="conveyor-trail" size={16} color="#10b981" />
          <Text style={styles.headerBadge}>Interactive Animation</Text>
        </View>
        <Text style={styles.headerTitle}>IPO Machine Simulator</Text>
        <Text style={styles.headerSubtitle}>
          {lang === 'bn'
            ? 'ইনপুট ➔ প্রসেসিং ➔ আউটপুট ও স্টোরেজ সাইকেল'
            : 'Input ➔ Processing ➔ Output & Storage Cycle'}
        </Text>
      </View>

      {/* Preset Selectors */}
      <View style={styles.selectorRow}>
        {EXAMPLES.map((ex, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.selectorBtn, selectedExample === idx && styles.selectorBtnActive]}
            onPress={() => {
              setSelectedExample(idx);
              resetSimulation();
            }}
          >
            <Text
              style={[
                styles.selectorBtnText,
                selectedExample === idx && styles.selectorBtnTextActive,
              ]}
              numberOfLines={1}
            >
              {lang === 'bn' ? ex.titleBn : ex.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conveyor Pipeline Visualization */}
      <View style={styles.conveyorBox}>
        {/* Step 1: Input */}
        <View
          style={[
            styles.pipelineNode,
            stage === 'input' && styles.pipelineNodeActive,
            (stage === 'processing' || stage === 'output') && styles.pipelineNodeDone,
          ]}
        >
          <Ionicons
            name="log-in-outline"
            size={22}
            color={stage === 'input' ? '#38bdf8' : stage !== 'idle' ? '#10b981' : '#94a3b8'}
          />
          <Text style={styles.nodeTitle}>1. INPUT</Text>
          <Text style={styles.nodeLabel} numberOfLines={2}>
            {lang === 'bn' ? current.inputBn : current.input}
          </Text>
        </View>

        <Ionicons name="arrow-forward" size={18} color="#64748b" style={{ marginHorizontal: 2 }} />

        {/* Step 2: Processing (CPU) */}
        <Animated.View
          style={[
            styles.pipelineNode,
            styles.cpuNode,
            stage === 'processing' && styles.pipelineNodeActive,
            stage === 'output' && styles.pipelineNodeDone,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <MaterialCommunityIcons
            name="cpu-64-bit"
            size={24}
            color={stage === 'processing' ? '#f59e0b' : stage === 'output' ? '#10b981' : '#94a3b8'}
          />
          <Text style={styles.nodeTitle}>2. CPU / ALU</Text>
          <Text style={styles.nodeLabel} numberOfLines={2}>
            {stage === 'processing'
              ? (lang === 'bn' ? 'প্রসেসিং হচ্ছে...' : 'Crunching data...')
              : (lang === 'bn' ? current.processBn : current.process)}
          </Text>
        </Animated.View>

        <Ionicons name="arrow-forward" size={18} color="#64748b" style={{ marginHorizontal: 2 }} />

        {/* Step 3: Output */}
        <View
          style={[
            styles.pipelineNode,
            stage === 'output' && styles.pipelineNodeDone,
          ]}
        >
          <Ionicons
            name="tv-outline"
            size={22}
            color={stage === 'output' ? '#10b981' : '#94a3b8'}
          />
          <Text style={styles.nodeTitle}>3. OUTPUT</Text>
          <Text style={styles.nodeLabel} numberOfLines={2}>
            {stage === 'output'
              ? (lang === 'bn' ? current.outputBn : current.output)
              : (lang === 'bn' ? 'ফলাফলের অপেক্ষা' : 'Awaiting result')}
          </Text>
        </View>
      </View>

      {/* Storage Tray */}
      <View style={styles.storageBox}>
        <View style={styles.storageHeader}>
          <Ionicons name="server-outline" size={15} color="#10b981" />
          <Text style={styles.storageTitle}>4. Storage Memory (Saved in Non-Volatile Disk):</Text>
        </View>
        {storageItems.map((item, idx) => (
          <Text key={idx} style={styles.storageItem}>
            • {item}
          </Text>
        ))}
      </View>

      {/* Control Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.primaryRunBtn, stage !== 'idle' && stage !== 'output' && styles.btnDisabled]}
          onPress={stage === 'output' ? resetSimulation : runSimulation}
          disabled={stage === 'input' || stage === 'processing'}
        >
          <Ionicons
            name={stage === 'output' ? 'refresh' : 'play'}
            size={16}
            color="#ffffff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.runBtnText}>
            {stage === 'output'
              ? (lang === 'bn' ? 'পুনরায় চালান (Reset)' : 'Reset Simulation')
              : stage === 'processing'
              ? (lang === 'bn' ? 'গণনা চলছে...' : 'Processing...')
              : (lang === 'bn' ? 'আইপিও সাইকেল চালান' : 'Run IPO Cycle')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// 2. Speed Race Simulator (Human vs Computer)
// ============================================================================
export const MobileSpeedRaceSimulator = ({ lang = 'both' }) => {
  const { colors: themeColors } = useTheme();
  const styles = getStyles(themeColors);

  const [racing, setRacing] = useState(false);
  const [computerDone, setComputerDone] = useState(false);
  const humanProgress = useRef(new Animated.Value(0)).current;
  const computerProgress = useRef(new Animated.Value(0)).current;

  const startRace = () => {
    setRacing(true);
    setComputerDone(false);
    humanProgress.setValue(0);
    computerProgress.setValue(0);

    // Computer finishes 1,000,000,000 calculations almost instantaneously
    Animated.timing(computerProgress, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      setComputerDone(true);
    });

    // Human calculates slowly (only reaches 4% before giving up / tired)
    Animated.timing(humanProgress, {
      toValue: 0.05,
      duration: 3500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      setRacing(false);
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <FontAwesome5 name="bolt" size={14} color="#f59e0b" />
          <Text style={[styles.headerBadge, { color: '#f59e0b', borderColor: '#f59e0b44' }]}>
            Speed Race Demonstration
          </Text>
        </View>
        <Text style={styles.headerTitle}>Human vs. Computer Speed Race</Text>
        <Text style={styles.headerSubtitle}>
          {lang === 'bn'
            ? '১ বিলিয়ন (১,০০০,০০০,০০০) জটিল যোগ অংক করার গতি পরীক্ষা'
            : 'Race: Solve 1 Billion (1,000,000,000) Arithmetic Operations'}
        </Text>
      </View>

      <View style={{ marginVertical: 12 }}>
        {/* Computer Track */}
        <View style={styles.raceLane}>
          <View style={styles.raceLaneHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="cpu-64-bit" size={18} color="#38bdf8" />
              <Text style={styles.raceLaneName}>Computer (3.5 GHz Multi-Core)</Text>
            </View>
            <Text style={styles.raceLaneStat}>
              {computerDone ? '⚡ Done in 0.0003s!' : 'Speed: 3.5B ops/sec'}
            </Text>
          </View>
          <View style={styles.raceProgressBarTrack}>
            <Animated.View
              style={[
                styles.raceProgressBarFill,
                {
                  backgroundColor: '#38bdf8',
                  width: computerProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Human Track */}
        <View style={[styles.raceLane, { marginTop: 14 }]}>
          <View style={styles.raceLaneHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="person" size={18} color="#f97316" />
              <Text style={styles.raceLaneName}>Human Brain (Mental Math)</Text>
            </View>
            <Text style={[styles.raceLaneStat, { color: '#f97316' }]}>
              {racing ? '😰 Exhausted! (1 op/sec)' : 'Takes ~31.7 Years!'}
            </Text>
          </View>
          <View style={styles.raceProgressBarTrack}>
            <Animated.View
              style={[
                styles.raceProgressBarFill,
                {
                  backgroundColor: '#f97316',
                  width: humanProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryRunBtn, { backgroundColor: '#f59e0b' }]}
        onPress={startRace}
        disabled={racing}
      >
        <Ionicons name="flash" size={16} color="#ffffff" style={{ marginRight: 6 }} />
        <Text style={styles.runBtnText}>
          {racing
            ? (lang === 'bn' ? 'রেস চলছে...' : 'Racing...')
            : (lang === 'bn' ? 'রেস শুরু করুন (Start Race)' : 'Start Speed Race')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ============================================================================
// 3. Five Units Hub Visualizer (Lesson 2 Suite)
// ============================================================================
export const MobileFiveUnitsVisualizer = ({ lang = 'both' }) => {
  const { colors: themeColors } = useTheme();
  const styles = getStyles(themeColors);

  const [activeUnit, setActiveUnit] = useState(0);
  const [signalActive, setSignalActive] = useState(false);

  const UNITS = [
    {
      id: 'input',
      title: '1. Input Unit',
      titleBn: '১. ইনপুট ইউনিট',
      icon: 'keyboard-outline',
      color: '#38bdf8',
      role: 'Translates human actions into binary machine language (0s and 1s).',
      roleBn: 'মানুষের ভাষা বা ক্রিয়াকে কম্পিউটারের ভাষা (০ ও ১)-এ রূপান্তর করে।',
      examples: 'Keyboard, Mouse, Microphone, Touchscreen, Barcode Scanner, Web Camera',
      signal: 'Converts keypress "A" into binary 01000001',
    },
    {
      id: 'cu',
      title: '2. Control Unit (CU)',
      titleBn: '২. কন্ট্রোল ইউনিট (CU)',
      icon: 'compass-outline',
      color: '#f59e0b',
      role: 'The Traffic Cop / Orchestrator of the CPU. Directs data movement and sends clock signals.',
      roleBn: 'সিপিইউ-এর ট্রাফিক পুলিশ। এটি ডাটার চলাচল পরিচালনা করে ও কাজের সমন্বয় করে।',
      examples: 'Instruction Register, Program Counter, Timing Pulse Generator',
      signal: 'Dispatches Read signal from RAM to CPU Register',
    },
    {
      id: 'alu',
      title: '3. ALU (Arithmetic & Logic)',
      titleBn: '৩. এএলইউ (ALU)',
      icon: 'calculator-outline',
      color: '#10b981',
      role: 'The Digital Calculator: executes math (+, -, *, /) and logical decisions (AND, OR, ==, <).',
      roleBn: 'ডিজিটাল ক্যালকুলেটর: গাণিতিক ও যৌক্তিক সিদ্ধান্ত গ্রহণ করে।',
      examples: 'Full Adders, Logic Gates, Comparator, Bit-shift Circuits',
      signal: 'Executes binary addition: 0010 + 0011 = 0101 (5)',
    },
    {
      id: 'memory',
      title: '4. Memory / Storage',
      titleBn: '৪. মেমোরি ও স্টোরেজ',
      icon: 'server-outline',
      color: '#a855f7',
      role: 'Primary RAM (Ultra fast, volatile workspace) + Secondary SSD/HDD (Massive, persistent vault).',
      roleBn: 'র‍্যাম (দ্রুত কিন্তু বিদ্যুৎ গেলে মুছে যায়) এবং এসএসডি/হার্ডডিস্ক (স্থায়ী সংরক্ষণ)।',
      examples: 'L1/L2/L3 Cache, DDR5 RAM, NVMe SSD, Cloud Storage',
      signal: 'Reads 64-bit word at memory address 0x7FFF00',
    },
    {
      id: 'output',
      title: '5. Output Unit',
      titleBn: '৫. আউটপুট ইউনিট',
      icon: 'tv-outline',
      color: '#ec4899',
      role: 'Translates machine binary output into human-readable text, graphics, motion, or audio.',
      roleBn: 'বাইনারি ফলাফলকে মানুষ বুঝতে পারে এমন লেখা, ছবি বা শব্দে রূপান্তর করে।',
      examples: '4K Display Monitor, Stereo Speakers, 3D Printer, Robotic Actuators',
      signal: 'Illuminates screen pixels in RGB hex #10B981',
    },
  ];

  const current = UNITS[activeUnit];

  const triggerSignal = () => {
    setSignalActive(true);
    setTimeout(() => setSignalActive(false), 1500);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <Ionicons name="git-network-outline" size={15} color="#38bdf8" />
          <Text style={styles.headerBadge}>5 Functional Units Hub</Text>
        </View>
        <Text style={styles.headerTitle}>Computer 5 Functional Units</Text>
        <Text style={styles.headerSubtitle}>
          {lang === 'bn'
            ? 'কম্পিউটারের ৫টি মৌলিক ইউনিটের যোগাযোগ ব্যবস্থা'
            : 'Interactive Architecture & Inter-Unit Communication Hub'}
        </Text>
      </View>

      {/* 5 Units Selector Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
        {UNITS.map((u, idx) => (
          <TouchableOpacity
            key={u.id}
            style={[
              styles.unitTab,
              activeUnit === idx && { borderColor: u.color, backgroundColor: `${u.color}18` },
            ]}
            onPress={() => setActiveUnit(idx)}
          >
            <Ionicons
              name={u.icon}
              size={18}
              color={activeUnit === idx ? u.color : '#94a3b8'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.unitTabText,
                activeUnit === idx && { color: u.color, fontWeight: 'bold' },
              ]}
            >
              {lang === 'bn' ? u.titleBn : u.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selected Unit Details Panel */}
      <View style={[styles.unitDetailsBox, { borderColor: `${current.color}44` }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={[styles.unitIconCircle, { backgroundColor: `${current.color}22` }]}>
            <Ionicons name={current.icon} size={20} color={current.color} />
          </View>
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={[styles.unitDetailTitle, { color: current.color }]}>
              {lang === 'bn' ? current.titleBn : current.title}
            </Text>
            <Text style={styles.unitDetailRole}>
              {lang === 'bn' ? current.roleBn : current.role}
            </Text>
          </View>
        </View>

        <View style={styles.unitExamplesBox}>
          <Text style={styles.unitExamplesLabel}>Real-World Hardware Examples:</Text>
          <Text style={styles.unitExamplesText}>{current.examples}</Text>
        </View>

        {/* Live Signal Probe */}
        <View style={styles.signalProbeBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.signalLed,
                  signalActive && { backgroundColor: '#10b981', shadowColor: '#10b981', elevation: 4 },
                ]}
              />
              <Text style={styles.signalProbeText}>
                {signalActive ? `Bus Signal Active: ${current.signal}` : 'Data Bus Idle (Ready)'}
              </Text>
            </View>
            <TouchableOpacity style={styles.probeBtn} onPress={triggerSignal}>
              <Text style={styles.probeBtnText}>Probe Signal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// 4. Desk vs Bookshelf Simulator (RAM vs SSD) - Lesson 5 Suite
// ============================================================================
export const MobileDeskBookshelfSimulator = ({ lang = 'both' }) => {
  const { colors: themeColors } = useTheme();
  const styles = getStyles(themeColors);

  const [deskItems, setDeskItems] = useState(['Browser Tab: Clearfeed', 'Calculator Code']);
  const [powerOff, setPowerOff] = useState(false);

  const simulatePowerCut = () => {
    setPowerOff(true);
    setDeskItems([]);
  };

  const restorePower = () => {
    setPowerOff(false);
    setDeskItems(['OS Kernel', 'Clearfeed Desktop App']);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <MaterialCommunityIcons name="table-furniture" size={16} color="#a855f7" />
          <Text style={[styles.headerBadge, { color: '#a855f7', borderColor: '#a855f744' }]}>
            Memory Analogy
          </Text>
        </View>
        <Text style={styles.headerTitle}>The Desk (RAM) vs. The Bookshelf (SSD)</Text>
        <Text style={styles.headerSubtitle}>
          {lang === 'bn'
            ? 'র‍্যাম (অস্থায়ী দ্রুত টেবিল) বনাম এসএসডি (স্থায়ী আলমারি)'
            : 'Volatile Instant Desk (RAM) vs Non-Volatile Library Vault (SSD)'}
        </Text>
      </View>

      <View style={styles.comparatorGrid}>
        {/* The Desk (RAM) */}
        <View style={[styles.comparatorBox, powerOff && styles.powerOffBox]}>
          <View style={styles.compHeader}>
            <MaterialCommunityIcons name="desk" size={20} color={powerOff ? '#ef4444' : '#38bdf8'} />
            <Text style={styles.compTitle}>Desk (RAM / DDR5)</Text>
          </View>
          <Text style={styles.compSub}>
            {powerOff
              ? '⚡ POWER CUT: Volatile memory wiped to 0!'
              : '⚡ Ultra-Fast (~80 GB/s) · Volatile Workspace'}
          </Text>

          <View style={styles.itemSlotContainer}>
            {deskItems.length === 0 ? (
              <Text style={styles.emptySlotText}>Desk Empty (No open programs)</Text>
            ) : (
              deskItems.map((item, idx) => (
                <View key={idx} style={styles.itemBadge}>
                  <Text style={styles.itemBadgeText}>📄 {item}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* The Bookshelf (SSD) */}
        <View style={styles.comparatorBox}>
          <View style={styles.compHeader}>
            <MaterialCommunityIcons name="bookshelf" size={20} color="#10b981" />
            <Text style={styles.compTitle}>Bookshelf (SSD Storage)</Text>
          </View>
          <Text style={styles.compSub}>
            🔒 Permanent Storage · Survives Power Loss
          </Text>

          <View style={styles.itemSlotContainer}>
            {['clearfeed_database.sqlite', 'photos_2026.zip', 'operating_system.iso'].map(
              (file, idx) => (
                <View key={idx} style={[styles.itemBadge, { backgroundColor: '#10b98118' }]}>
                  <Text style={[styles.itemBadgeText, { color: '#10b981' }]}>💾 {file}</Text>
                </View>
              )
            )}
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <TouchableOpacity
          style={[styles.primaryRunBtn, { flex: 1, backgroundColor: powerOff ? '#10b981' : '#ef4444' }]}
          onPress={powerOff ? restorePower : simulatePowerCut}
        >
          <Ionicons name={powerOff ? 'power' : 'flash-off'} size={16} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.runBtnText}>
            {powerOff
              ? (lang === 'bn' ? 'বিদ্যুৎ চালু করুন (Turn On)' : 'Power Restored (Boot)')
              : (lang === 'bn' ? 'বিদ্যুৎ বন্ধ করুন (Cut Power!)' : 'Cut Power! (Test Volatility)')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// 5. Memory Hierarchy Pyramid (Registers -> Cache -> RAM -> SSD)
// ============================================================================
export const MobileMemoryHierarchy = ({ lang = 'both' }) => {
  const { colors: themeColors } = useTheme();
  const styles = getStyles(themeColors);

  const [activeTier, setActiveTier] = useState(0);

  const TIERS = [
    {
      level: 'Registers (CPU Core)',
      levelBn: 'রেজিস্টার (সিপিইউ-এর ভেতরে)',
      speed: '< 1 Nanosecond (Immediate)',
      size: '~ 1 to 2 KB',
      cost: 'Extreme (Silicon space on CPU dye)',
      color: '#ef4444',
      analogy: 'Holding pen in your hand',
    },
    {
      level: 'L1 / L2 / L3 CPU Cache',
      levelBn: 'এল১/এল২/এল৩ ক্যাশ মেমোরি',
      speed: '1 to 10 Nanoseconds',
      size: '~ 16 to 64 MB',
      cost: 'Very High (SRAM technology)',
      color: '#f59e0b',
      analogy: 'Items right in front on your desk',
    },
    {
      level: 'Main Memory (DRAM / RAM)',
      levelBn: 'মূল মেমোরি (র‍্যাম)',
      speed: '50 to 100 Nanoseconds',
      size: '16 GB to 64 GB',
      cost: 'Moderate ($4/GB)',
      color: '#10b981',
      analogy: 'Drawer beneath your desk',
    },
    {
      level: 'Secondary Storage (NVMe SSD)',
      levelBn: 'সেকেন্ডারি স্টোরেজ (এসএসডি)',
      speed: '10 to 50 Microseconds (1000x slower than RAM)',
      size: '512 GB to 2 TB',
      cost: 'Low ($0.08/GB)',
      color: '#38bdf8',
      analogy: 'Filing cabinet across the room',
    },
    {
      level: 'Cloud Storage & Tape Backup',
      levelBn: 'ক্লাউড ও ব্যাকআপ স্টোরেজ',
      speed: '10 to 100 Milliseconds (Network delay)',
      size: 'Infinite / Petabytes',
      cost: 'Pennies per GB / month',
      color: '#8b5cf6',
      analogy: 'Warehouse in another town',
    },
  ];

  const current = TIERS[activeTier];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <MaterialCommunityIcons name="pyramid" size={16} color="#10b981" />
          <Text style={styles.headerBadge}>Memory Hierarchy</Text>
        </View>
        <Text style={styles.headerTitle}>The Memory Pyramid</Text>
        <Text style={styles.headerSubtitle}>
          {lang === 'bn'
            ? 'গতি, ধারণক্ষমতা ও খরচের ভারসাম্য পিরামিড'
            : 'Trade-off between Speed, Capacity, and Cost'}
        </Text>
      </View>

      {/* Pyramid Tiers Visualizer */}
      <View style={styles.pyramidContainer}>
        {TIERS.map((tier, idx) => {
          const widthPct = `${50 + idx * 12}%`;
          const isSelected = activeTier === idx;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.pyramidTier,
                { width: widthPct, backgroundColor: isSelected ? `${tier.color}33` : '#1e293b' },
                isSelected && { borderColor: tier.color, borderWidth: 1.5 },
              ]}
              onPress={() => setActiveTier(idx)}
            >
              <Text
                style={[
                  styles.pyramidTierText,
                  isSelected && { color: tier.color, fontWeight: 'bold' },
                ]}
                numberOfLines={1}
              >
                {lang === 'bn' ? tier.levelBn : tier.level}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tier Details Card */}
      <View style={[styles.tierDetailCard, { borderColor: `${current.color}44` }]}>
        <Text style={[styles.tierDetailTitle, { color: current.color }]}>
          {lang === 'bn' ? current.levelBn : current.level}
        </Text>
        <View style={styles.tierStatRow}>
          <Text style={styles.tierStatKey}>⚡ Access Latency:</Text>
          <Text style={styles.tierStatVal}>{current.speed}</Text>
        </View>
        <View style={styles.tierStatRow}>
          <Text style={styles.tierStatKey}>📦 Typical Capacity:</Text>
          <Text style={styles.tierStatVal}>{current.size}</Text>
        </View>
        <View style={styles.tierStatRow}>
          <Text style={styles.tierStatKey}>☕ Real-Life Analogy:</Text>
          <Text style={styles.tierStatVal}>{current.analogy}</Text>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// 6. Mobile Bus Highway Simulator (Address, Data, Control Bus)
// ============================================================================
export const MobileBusHighwaySimulator = ({ lang = 'both' }) => {
  const { colors: themeColors } = useTheme();
  const styles = getStyles(themeColors);

  const [bits, setBits] = useState(16);
  const [activeSignal, setActiveSignal] = useState(null); // 'READ' | 'WRITE' | null
  const [packetPos] = useState(new Animated.Value(0));

  const maxAddress = bits === 16 ? '64 KB (65,536 bytes)' : bits === 32 ? '4 GB (4,294,967,296 bytes)' : '16 EB (18.4 Quintillion bytes)';
  const maxAddressBn = bits === 16 ? '৬৪ কিলোবাইট (৬৫,৫৩৬ লোকেশন)' : bits === 32 ? '৪ গিগাবাইট (৪ বিলিয়ন লোকেশন)' : '১৬ এক্সাবাইট (১৮.৪ কুইন্টিলিয়ন)';

  const triggerPulse = (type) => {
    setActiveSignal(type);
    packetPos.setValue(0);
    Animated.sequence([
      Animated.timing(packetPos, {
        toValue: 1,
        duration: 900,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.delay(300),
      Animated.timing(packetPos, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => setActiveSignal(null));
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <MaterialCommunityIcons name="transit-connection-variant" size={16} color="#38bdf8" />
          <Text style={[styles.headerBadge, { color: '#38bdf8' }]}>Bus Highway Visualizer</Text>
        </View>
        <Text style={styles.headerTitle}>System Bus Architecture (৩-লেন হাইওয়ে)</Text>
        <Text style={styles.headerSubtitle}>
          {lang === 'bn'
            ? 'এড্রেস, ডেটা এবং কন্ট্রোল বাসের সিগন্যাল প্রবাহ'
            : 'Address, Data & Control Bus Electrical Pathways'}
        </Text>
      </View>

      {/* Bit Width Selector */}
      <View style={styles.selectorRow}>
        {[16, 32, 64].map((b) => (
          <TouchableOpacity
            key={b}
            style={[styles.selectorBtn, bits === b && styles.selectorBtnActive]}
            onPress={() => setBits(b)}
          >
            <Text style={[styles.selectorBtnText, bits === b && styles.selectorBtnTextActive]}>
              {b}-Bit Bus
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bus Highway Visualization */}
      <View style={{ backgroundColor: '#090d16', borderRadius: 14, padding: 12, marginVertical: 8, borderWidth: 1, borderColor: '#1e293b' }}>
        {/* Address Bus Lane */}
        <View style={{ marginBottom: 10, backgroundColor: '#0369a118', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#0284c744' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="arrow-forward" size={14} color="#38bdf8" />
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#38bdf8', marginLeft: 4 }}>
                1. Address Bus (Unidirectional ➔)
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: '#94a3b8' }}>{bits} lines (2^{bits})</Text>
          </View>
          <Text style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>
            {lang === 'bn'
              ? `সিপিইউ মেমোরি এড্রেস পাঠায়। সর্বোচ্চ ধারণক্ষমতা: ${maxAddressBn}`
              : `Carries location indices from CPU. Max RAM: ${maxAddress}`}
          </Text>
        </View>

        {/* Data Bus Lane */}
        <View style={{ marginBottom: 10, backgroundColor: '#04785718', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#05966944' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="swap-horizontal" size={14} color="#34d399" />
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#34d399', marginLeft: 4 }}>
                2. Data Bus (Bidirectional ⇄)
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: '#94a3b8' }}>8/16/32/64 bits wide</Text>
          </View>
          <Text style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>
            {lang === 'bn'
              ? 'আসল তথ্য বা ডেটা আদান-প্রদান করে (Read এ CPU পায়, Write এ মেমোরিতে যায়)'
              : 'Transfers actual payload data back and forth between CPU & RAM'}
          </Text>
        </View>

        {/* Control Bus Lane */}
        <View style={{ backgroundColor: '#b4530918', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#d9770644' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="flash-outline" size={14} color="#fbbf24" />
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#fbbf24', marginLeft: 4 }}>
                3. Control Bus (Timing & Command Signals)
              </Text>
            </View>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: activeSignal ? '#10b981' : '#64748b' }} />
          </View>
          <Text style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>
            {lang === 'bn'
              ? 'সিপিইউর আদেশ সিগন্যাল (যেমন: Read, Write, Clock Pulse, Interrupt)'
              : 'Synchronizes system clock & command signals (Read/Write pulses)'}
          </Text>
        </View>
      </View>

      {/* Trigger Buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
        <TouchableOpacity
          style={[styles.selectorBtn, { backgroundColor: '#0369a133', borderColor: '#38bdf8' }]}
          onPress={() => triggerPulse('READ')}
        >
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#38bdf8' }}>
            ⚡ Trigger READ Cycle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.selectorBtn, { backgroundColor: '#b4530933', borderColor: '#fbbf24' }]}
          onPress={() => triggerPulse('WRITE')}
        >
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#fbbf24' }}>
            💾 Trigger WRITE Cycle
          </Text>
        </TouchableOpacity>
      </View>

      {activeSignal && (
        <View style={{ marginTop: 8, padding: 8, backgroundColor: '#10b98122', borderRadius: 8, borderWidth: 1, borderColor: '#10b981' }}>
          <Text style={{ fontSize: 11, color: '#10b981', fontWeight: 'bold', textAlign: 'center' }}>
            Active: Control Bus fired [{activeSignal}] Strobe ➔ Bus lines decoded!
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// 7. Mobile RISC vs CISC Architecture Race Simulator
// ============================================================================
export const MobileRiscCiscSimulator = ({ lang = 'both' }) => {
  const { colors: themeColors } = useTheme();
  const styles = getStyles(themeColors);

  const [racing, setRacing] = useState(false);
  const [riscProgress, setRiscProgress] = useState(0);
  const [ciscProgress, setCiscProgress] = useState(0);
  const [winner, setWinner] = useState(null);

  const startRace = () => {
    if (racing) return;
    setRacing(true);
    setWinner(null);
    setRiscProgress(0);
    setCiscProgress(0);

    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      setRiscProgress((prev) => Math.min(100, prev + 25)); // 4 cycles to complete 100%
      setCiscProgress((prev) => Math.min(100, prev + 12.5)); // 8 cycles to complete 100%

      if (tick >= 8) {
        clearInterval(interval);
        setRacing(false);
        setWinner('RISC');
      }
    }, 300);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <FontAwesome5 name="tachometer-alt" size={14} color="#f59e0b" />
          <Text style={[styles.headerBadge, { color: '#f59e0b' }]}>Processor Race</Text>
        </View>
        <Text style={styles.headerTitle}>RISC vs CISC Architecture Showdown</Text>
        <Text style={styles.headerSubtitle}>
          {lang === 'bn'
            ? '১-ক্লক সাইকেল (স্মার্টফোন ARM) বনাম মাল্টি-সাইকেল (ইন্টেল x86)'
            : 'Single-cycle pipelined vs Multi-cycle microcode execution'}
        </Text>
      </View>

      {/* Progress Bars */}
      <View style={{ backgroundColor: '#090d16', borderRadius: 12, padding: 12, marginVertical: 8, borderWidth: 1, borderColor: '#1e293b' }}>
        {/* RISC Bar */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10b981' }}>
              🚀 RISC (ARM / Smartphone / Apple Silicon)
            </Text>
            <Text style={{ fontSize: 11, color: '#94a3b8' }}>{riscProgress}% (4 Cycles)</Text>
          </View>
          <View style={{ height: 10, backgroundColor: '#1e293b', borderRadius: 5, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${riscProgress}%`, backgroundColor: '#10b981', borderRadius: 5 }} />
          </View>
          <Text style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
            Simple &lt;200 fixed-length instructions • 1 clock tick per instruction
          </Text>
        </View>

        {/* CISC Bar */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#38bdf8' }}>
              ⚙️ CISC (x86 / Intel Core / AMD Ryzen)
            </Text>
            <Text style={{ fontSize: 11, color: '#94a3b8' }}>{ciscProgress}% (8 Cycles)</Text>
          </View>
          <View style={{ height: 10, backgroundColor: '#1e293b', borderRadius: 5, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${ciscProgress}%`, backgroundColor: '#38bdf8', borderRadius: 5 }} />
          </View>
          <Text style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
            Complex 200–300 variable instructions • Multi-step microcode hardware
          </Text>
        </View>
      </View>

      {/* Race Trigger Button */}
      <TouchableOpacity
        style={[styles.selectorBtn, { backgroundColor: '#10b98133', borderColor: '#10b981', marginTop: 4 }]}
        onPress={startRace}
        disabled={racing}
      >
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10b981', textAlign: 'center' }}>
          {racing ? '⏳ Executing Pipeline Instructions...' : '▶ Start Instruction Cycle Race'}
        </Text>
      </TouchableOpacity>

      {winner && (
        <View style={{ marginTop: 8, padding: 8, backgroundColor: '#10b98122', borderRadius: 8, borderWidth: 1, borderColor: '#10b981' }}>
          <Text style={{ fontSize: 11, color: '#10b981', textAlign: 'center', fontWeight: 'bold' }}>
            {lang === 'bn'
              ? '🏆 RISC জয়ী! পাইপলাইনিংয়ের কারণে প্রতি ক্লকে ১টি নির্দেশ শেষ হয়।'
              : '🏆 RISC finishes first! Fixed-length instructions execute 1-per-cycle with low power.'}
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// 8. Mobile Memory Units Ladder Simulator (Bit to Exabyte)
// ============================================================================
export const MobileMemoryLadderSimulator = ({ lang = 'both' }) => {
  const { colors: themeColors } = useTheme();
  const styles = getStyles(themeColors);

  const [selectedIdx, setSelectedIdx] = useState(2); // Default: Byte

  const UNITS = [
    { name: 'Bit (b)', bytes: '1/8 Byte', analogy: 'Single binary switch (0 or 1)', analogyBn: 'একটি বৈদ্যুতিক সুইচ (০ বা ১)' },
    { name: 'Nibble', bytes: '1/2 Byte (4 bits)', analogy: 'One hexadecimal digit (0 to F)', analogyBn: '৪টি বিটের দল বা ১টি হেক্সাডেসিমেল ডিজিট' },
    { name: 'Byte (B)', bytes: '1 Byte (8 bits)', analogy: 'Single ASCII character (e.g. letter "A")', analogyBn: '১টি সাধারণ বর্ণ বা ক্যারেক্টার (যেমন "A")' },
    { name: 'Kilobyte (KB)', bytes: '1,024 Bytes', analogy: '1-page text essay file', analogyBn: '১ পৃষ্ঠার সাধারণ টেক্সট ডকুমেন্ট' },
    { name: 'Megabyte (MB)', bytes: '1,024 KB', analogy: '1 high-res smartphone photo or 1 MP3 song', analogyBn: '১টি সুন্দর ফটো বা ১টি এমপিথ্রি গান' },
    { name: 'Gigabyte (GB)', bytes: '1,024 MB', analogy: '1 full HD Bollywood movie or 250 songs', analogyBn: '১টি ফুল এইচডি মুভি বা ১ ঘণ্টার ভিডিও' },
    { name: 'Terabyte (TB)', bytes: '1,024 GB', analogy: '250,000 photos or 1,000 HD movies', analogyBn: 'ল্যাপটপের হার্ডডিস্ক (লাখ লাখ ছবি ও ভিডিও)' },
    { name: 'Petabyte (PB)', bytes: '1,024 TB', analogy: 'Google processing 24 PB of search data daily', analogyBn: 'গুগল বা ফেসবুকের বিশাল সার্ভার ক্লাস্টার' },
    { name: 'Exabyte (EB)', bytes: '1,024 PB', analogy: 'All words ever spoken by humans throughout history', analogyBn: 'সমগ্র মানবজাতির ইতিহাসের সমস্ত কথার সমান ডেটা' },
  ];

  const current = UNITS[selectedIdx];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <MaterialCommunityIcons name="ladder" size={16} color="#ec4899" />
          <Text style={[styles.headerBadge, { color: '#ec4899' }]}>Capacity Ladder</Text>
        </View>
        <Text style={styles.headerTitle}>Memory Units: Bit to Exabyte</Text>
        <Text style={styles.headerSubtitle}>
          {lang === 'bn'
            ? 'বাইনারি গুণক (১০২৪ গুণ) এবং বাস্তব জীবনের উপমা'
            : '1024x Binary Multipliers & Real-World Scales'}
        </Text>
      </View>

      {/* Horizontal Pill Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {UNITS.map((u, idx) => (
            <TouchableOpacity
              key={u.name}
              style={[
                styles.selectorBtn,
                { paddingHorizontal: 10, minWidth: 60 },
                selectedIdx === idx && { backgroundColor: '#ec489933', borderColor: '#ec4899' },
              ]}
              onPress={() => setSelectedIdx(idx)}
            >
              <Text style={[styles.selectorBtnText, selectedIdx === idx && { color: '#ec4899', fontWeight: 'bold' }]}>
                {u.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Capacity Card */}
      <View style={{ backgroundColor: '#090d16', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#ec489944' }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ec4899' }}>{current.name}</Text>
        <Text style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4 }}>
          📐 <Text style={{ fontWeight: 'bold' }}>Exact Binary Size:</Text> {current.bytes}
        </Text>
        <View style={{ marginTop: 8, padding: 8, backgroundColor: '#1e293b', borderRadius: 8 }}>
          <Text style={{ fontSize: 11, color: '#fbcfe8', fontStyle: 'italic' }}>
            💡 <Text style={{ fontWeight: 'bold' }}>Analogy:</Text>{' '}
            {lang === 'bn' ? current.analogyBn : current.analogy}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// 9. Mobile Keyboard IRQ Interrupt Simulator
// ============================================================================
export const MobileKeyboardIrqSimulator = ({ lang = 'both' }) => {
  const { colors: themeColors } = useTheme();
  const styles = getStyles(themeColors);

  const [activeKey, setActiveKey] = useState(null);
  const [irqFired, setIrqFired] = useState(false);
  const [buffer, setBuffer] = useState(['C', 'P', 'U']);

  const KEYS = [
    { label: 'A', scanCode: '0x1E', ascii: 65 },
    { label: 'B', scanCode: '0x30', ascii: 66 },
    { label: 'Enter', scanCode: '0x1C', ascii: 13 },
    { label: 'Space', scanCode: '0x39', ascii: 32 },
  ];

  const pressKey = (keyObj) => {
    setActiveKey(keyObj);
    setIrqFired(true);
    setBuffer((prev) => [keyObj.label, ...prev.slice(0, 3)]);

    setTimeout(() => {
      setIrqFired(false);
    }, 700);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <Ionicons name="hardware-chip-outline" size={16} color="#ef4444" />
          <Text style={[styles.headerBadge, { color: '#ef4444' }]}>Hardware Interrupt</Text>
        </View>
        <Text style={styles.headerTitle}>Keyboard Controller & IRQ 1 Line</Text>
        <Text style={styles.headerSubtitle}>
          {lang === 'bn'
            ? 'কী প্রেস ➔ স্ক্যান কোড ➔ বাফার ➔ IRQ 1 ইন্টারাপ্ট'
            : 'Key Press ➔ Scan Code ➔ Buffer ➔ IRQ 1 Interrupt Request'}
        </Text>
      </View>

      {/* Mini Virtual Keypad */}
      <View style={{ flexDirection: 'row', gap: 6, marginVertical: 8 }}>
        {KEYS.map((k) => (
          <TouchableOpacity
            key={k.label}
            style={[styles.selectorBtn, { flex: 1, backgroundColor: '#1e293b', borderColor: '#475569' }]}
            onPress={() => pressKey(k)}
          >
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#f8fafc', textAlign: 'center' }}>
              [{k.label}]
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Flow & IRQ Alert */}
      <View style={{ backgroundColor: '#090d16', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1e293b' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#94a3b8' }}>Circular 16-byte Buffer:</Text>
          <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#38bdf8' }}>
            [{buffer.join(', ')}]
          </Text>
        </View>

        <View style={{ marginTop: 8, padding: 8, borderRadius: 8, backgroundColor: irqFired ? '#dc262622' : '#1e293b', borderWidth: 1, borderColor: irqFired ? '#ef4444' : '#334155' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: irqFired ? '#ef4444' : '#64748b', marginRight: 8 }} />
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: irqFired ? '#ef4444' : '#94a3b8' }}>
              {irqFired ? '⚡ IRQ 1 Signal Sent to CPU Interrupt Controller!' : 'IRQ 1 Line: Listening for Keypress...'}
            </Text>
          </View>
          {activeKey && (
            <Text style={{ fontSize: 10, color: '#cbd5e1', marginTop: 4 }}>
              Make Scan Code: <Text style={{ fontFamily: 'monospace', color: '#f59e0b' }}>{activeKey.scanCode}</Text> • ASCII: <Text style={{ fontFamily: 'monospace', color: '#10b981' }}>{activeKey.ascii}</Text>
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// 10. Mobile Print Spooler Simulator (SPOOL Buffer)
// ============================================================================
export const MobilePrintSpoolerSimulator = ({ lang = 'both' }) => {
  const { colors: themeColors } = useTheme();
  const styles = getStyles(themeColors);

  const [spoolingOn, setSpoolingOn] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [pagesLeft, setPagesLeft] = useState(0);

  const sendJob = () => {
    if (printing) return;
    setPrinting(true);
    setPagesLeft(5);

    let count = 5;
    const interval = setInterval(() => {
      count -= 1;
      setPagesLeft(count);
      if (count <= 0) {
        clearInterval(interval);
        setPrinting(false);
      }
    }, spoolingOn ? 600 : 1200);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <Ionicons name="print-outline" size={16} color="#8b5cf6" />
          <Text style={[styles.headerBadge, { color: '#8b5cf6' }]}>Print Spooler</Text>
        </View>
        <Text style={styles.headerTitle}>SPOOLing Buffer vs Direct Printing</Text>
        <Text style={styles.headerSubtitle}>
          {lang === 'bn'
            ? 'Simultaneous Peripheral Operations On-Line (ডিস্কে বাফার রাখা)'
            : 'Decoupling Fast CPU from Slow Mechanical Print Head'}
        </Text>
      </View>

      {/* Mode Toggle */}
      <View style={styles.selectorRow}>
        <TouchableOpacity
          style={[styles.selectorBtn, spoolingOn && styles.selectorBtnActive]}
          onPress={() => setSpoolingOn(true)}
        >
          <Text style={[styles.selectorBtnText, spoolingOn && styles.selectorBtnTextActive]}>
            ✅ SPOOL Buffer (Modern OS)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.selectorBtn, !spoolingOn && { backgroundColor: '#ef444422', borderColor: '#ef4444' }]}
          onPress={() => setSpoolingOn(false)}
        >
          <Text style={[styles.selectorBtnText, !spoolingOn && { color: '#ef4444', fontWeight: 'bold' }]}>
            ❌ No SPOOL (CPU Frozen)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Box */}
      <View style={{ backgroundColor: '#090d16', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1e293b', marginVertical: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 11, color: '#94a3b8' }}>CPU Responsiveness:</Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: spoolingOn ? '#10b981' : printing ? '#ef4444' : '#10b981' }}>
            {spoolingOn ? '🟢 100% Free & Interactive' : printing ? '🔴 0% Frozen (Waiting on Printer)' : '🟢 Idle'}
          </Text>
        </View>
        {printing && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 11, color: '#cbd5e1' }}>Printing mechanical pages: {pagesLeft} pages left...</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.selectorBtn, { backgroundColor: '#8b5cf633', borderColor: '#8b5cf6' }]}
        onPress={sendJob}
        disabled={printing}
      >
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#c084fc', textAlign: 'center' }}>
          {printing ? '🖨️ Printer Working...' : '📄 Send 5-Page Document to Print'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ============================================================================
// 11. Mobile OS Scheduler & Defrag Simulator
// ============================================================================
export const MobileOsSchedulerSimulator = ({ lang = 'both' }) => {
  const { colors: themeColors } = useTheme();
  const styles = getStyles(themeColors);

  const [activeTask, setActiveTask] = useState(0);
  const [fragmented, setFragmented] = useState(true);

  const TASKS = ['Music Player', 'Web Browser', 'Code Editor'];

  const switchTask = () => {
    setActiveTask((prev) => (prev + 1) % TASKS.length);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <MaterialCommunityIcons name="cog-sync" size={16} color="#14b8a6" />
          <Text style={[styles.headerBadge, { color: '#14b8a6' }]}>OS Multitasking</Text>
        </View>
        <Text style={styles.headerTitle}>Round-Robin Scheduling & Disk Defrag</Text>
        <Text style={styles.headerSubtitle}>
          {lang === 'bn'
            ? 'সিপিইউ টাইম-স্লাইস সুইচিং এবং ডিস্ক ক্লাস্টার বিন্যাস'
            : 'CPU Time-Slicing Multitasking & Disk Optimization'}
        </Text>
      </View>

      {/* Task Slices */}
      <View style={{ backgroundColor: '#090d16', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1e293b' }}>
        <Text style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>Round-Robin CPU Quantum (10ms slices):</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {TASKS.map((t, idx) => (
            <View
              key={t}
              style={[
                styles.selectorBtn,
                { flex: 1, paddingVertical: 6 },
                activeTask === idx && { backgroundColor: '#14b8a633', borderColor: '#14b8a6' },
              ]}
            >
              <Text style={[styles.selectorBtnText, activeTask === idx && { color: '#14b8a6', fontWeight: 'bold' }]}>
                {t}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.selectorBtn, { backgroundColor: '#1e293b', marginTop: 8, paddingVertical: 6 }]}
          onPress={switchTask}
        >
          <Text style={{ fontSize: 11, color: '#38bdf8', textAlign: 'center' }}>
            🔄 Next CPU Time-Slice (Context Switch)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Disk Defrag Section */}
      <View style={{ marginTop: 10, padding: 10, backgroundColor: '#090d16', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#cbd5e1' }}>Disk Clusters:</Text>
          <Text style={{ fontSize: 10, color: fragmented ? '#ef4444' : '#10b981' }}>
            {fragmented ? '⚠️ Fragmented (Slow Seek Time)' : '✅ Defragmented (Contiguous)'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 4, marginVertical: 8 }}>
          {(fragmented ? ['#ef4444', '#38bdf8', '#ef4444', '#10b981', '#38bdf8', '#10b981'] : ['#38bdf8', '#38bdf8', '#10b981', '#10b981', '#ef4444', '#ef4444']).map((col, i) => (
            <View key={i} style={{ flex: 1, height: 16, backgroundColor: col, borderRadius: 3 }} />
          ))}
        </View>
        <TouchableOpacity
          style={[styles.selectorBtn, { backgroundColor: fragmented ? '#10b98122' : '#334155', borderColor: fragmented ? '#10b981' : '#475569', paddingVertical: 6 }]}
          onPress={() => setFragmented(!fragmented)}
        >
          <Text style={{ fontSize: 11, color: fragmented ? '#10b981' : '#94a3b8', textAlign: 'center', fontWeight: 'bold' }}>
            {fragmented ? '🧹 Run Disk Defragmenter' : 'Scatter Clusters (Simulate Usage)'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================
const getStyles = (themeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: themeColors.surface || '#0f172a',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: themeColors.border || '#1e293b',
      padding: 16,
      marginVertical: 10,
    },
    headerRow: {
      marginBottom: 10,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    headerBadge: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#10b981',
      marginLeft: 5,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.text || '#ffffff',
    },
    headerSubtitle: {
      fontSize: 12,
      color: themeColors.textSecondary || '#94a3b8',
      marginTop: 2,
    },
    selectorRow: {
      flexDirection: 'row',
      gap: 6,
      marginVertical: 8,
    },
    selectorBtn: {
      flex: 1,
      paddingVertical: 7,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor: '#1e293b',
      borderWidth: 1,
      borderColor: '#334155',
      alignItems: 'center',
    },
    selectorBtnActive: {
      backgroundColor: '#0284c722',
      borderColor: '#38bdf8',
    },
    selectorBtnText: {
      fontSize: 11,
      color: '#94a3b8',
      fontWeight: '600',
    },
    selectorBtnTextActive: {
      color: '#38bdf8',
      fontWeight: 'bold',
    },
    conveyorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#090d16',
      borderRadius: 14,
      padding: 10,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: '#1e293b',
    },
    pipelineNode: {
      flex: 1,
      alignItems: 'center',
      padding: 8,
      borderRadius: 10,
      backgroundColor: '#131b2e',
      borderWidth: 1,
      borderColor: '#1e293b',
      minHeight: 80,
      justifyContent: 'center',
    },
    cpuNode: {
      backgroundColor: '#1e1b2e',
      borderColor: '#2e284a',
    },
    pipelineNodeActive: {
      borderColor: '#38bdf8',
      backgroundColor: '#0c2742',
    },
    pipelineNodeDone: {
      borderColor: '#10b981',
      backgroundColor: '#062d22',
    },
    nodeTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#e2e8f0',
      marginTop: 4,
    },
    nodeLabel: {
      fontSize: 9,
      color: '#94a3b8',
      textAlign: 'center',
      marginTop: 2,
    },
    storageBox: {
      backgroundColor: '#090d16',
      borderRadius: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: '#1e293b',
      marginVertical: 6,
    },
    storageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    storageTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#10b981',
      marginLeft: 6,
    },
    storageItem: {
      fontSize: 11,
      color: '#cbd5e1',
      marginTop: 2,
      fontFamily: 'monospace',
    },
    actionRow: {
      marginTop: 8,
    },
    primaryRunBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0284c7',
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    btnDisabled: {
      opacity: 0.6,
    },
    runBtnText: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    raceLane: {
      backgroundColor: '#090d16',
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: '#1e293b',
    },
    raceLaneHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    raceLaneName: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#e2e8f0',
      marginLeft: 6,
    },
    raceLaneStat: {
      fontSize: 11,
      color: '#38bdf8',
      fontWeight: '600',
    },
    raceProgressBarTrack: {
      height: 8,
      backgroundColor: '#1e293b',
      borderRadius: 4,
      overflow: 'hidden',
    },
    raceProgressBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    unitTab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: '#1e293b',
      borderWidth: 1,
      borderColor: '#334155',
      marginRight: 6,
    },
    unitTabText: {
      fontSize: 11,
      color: '#94a3b8',
    },
    unitDetailsBox: {
      backgroundColor: '#090d16',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      marginTop: 4,
    },
    unitIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unitDetailTitle: {
      fontSize: 13,
      fontWeight: 'bold',
    },
    unitDetailRole: {
      fontSize: 11,
      color: '#cbd5e1',
      marginTop: 2,
      lineHeight: 16,
    },
    unitExamplesBox: {
      backgroundColor: '#131b2e',
      borderRadius: 8,
      padding: 8,
      marginVertical: 8,
    },
    unitExamplesLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#94a3b8',
      textTransform: 'uppercase',
    },
    unitExamplesText: {
      fontSize: 11,
      color: '#e2e8f0',
      marginTop: 2,
    },
    signalProbeBox: {
      backgroundColor: '#1e293b',
      borderRadius: 8,
      padding: 8,
    },
    signalLed: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#64748b',
      marginRight: 8,
    },
    signalProbeText: {
      fontSize: 11,
      color: '#e2e8f0',
      fontFamily: 'monospace',
    },
    probeBtn: {
      backgroundColor: '#38bdf8',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
    },
    probeBtnText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    comparatorGrid: {
      flexDirection: 'row',
      gap: 10,
      marginVertical: 8,
    },
    comparatorBox: {
      flex: 1,
      backgroundColor: '#090d16',
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: '#1e293b',
    },
    powerOffBox: {
      borderColor: '#ef444466',
      backgroundColor: '#1f0d0d',
    },
    compHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    compTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#e2e8f0',
    },
    compSub: {
      fontSize: 10,
      color: '#94a3b8',
      marginTop: 2,
    },
    itemSlotContainer: {
      marginTop: 8,
      gap: 4,
    },
    itemBadge: {
      backgroundColor: '#0284c718',
      paddingVertical: 4,
      paddingHorizontal: 6,
      borderRadius: 6,
    },
    itemBadgeText: {
      fontSize: 10,
      color: '#38bdf8',
    },
    emptySlotText: {
      fontSize: 10,
      color: '#ef4444',
      fontStyle: 'italic',
      marginVertical: 6,
    },
    pyramidContainer: {
      alignItems: 'center',
      gap: 6,
      marginVertical: 10,
    },
    pyramidTier: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    pyramidTierText: {
      fontSize: 11,
      color: '#94a3b8',
    },
    tierDetailCard: {
      backgroundColor: '#090d16',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      marginTop: 6,
    },
    tierDetailTitle: {
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 6,
    },
    tierStatRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 3,
    },
    tierStatKey: {
      fontSize: 11,
      color: '#94a3b8',
    },
    tierStatVal: {
      fontSize: 11,
      fontWeight: '600',
      color: '#e2e8f0',
    },
  });

export default {
  MobileIPOSimulator,
  MobileSpeedRaceSimulator,
  MobileFiveUnitsVisualizer,
  MobileDeskBookshelfSimulator,
  MobileMemoryHierarchy,
  MobileBusHighwaySimulator,
  MobileRiscCiscSimulator,
  MobileMemoryLadderSimulator,
  MobileKeyboardIrqSimulator,
  MobilePrintSpoolerSimulator,
  MobileOsSchedulerSimulator,
};
