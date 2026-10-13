import React, { useState } from 'react';
import {
  Award,
  Eye,
  EyeOff,
} from 'lucide-react';

export const ComputerBasicsQuiz = ({
  onComplete,
}) => {
  // Active Tab: 'mcq' | 'sort' | 'shortAnswer'
  const [activeTab, setActiveTab] = useState('mcq');

  // MCQ state
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Short answer reveal state
  const [revealedShortAnswers, setRevealedShortAnswers] = useState({});

  // Interactive sorting exercises state
  const [hwSwSorting, setHwSwSorting] = useState({});
  const [ioSorting, setIoSorting] = useState({});

  const MCQS = [
    {
      id: 'q1',
      question: 'Where does the English word "computer" originate from, and what was its original historical meaning?',
      options: [
        'From the Greek word "computos", meaning an electronic thinking device.',
        'From the Latin verb "computare" (meaning to reckon/calculate), originally referring to a human job title for mathematicians.',
        'From the German term "Komput", meaning mechanical brass clockwork.',
        'From an acronym invented by Charles Babbage meaning "Central Operator Machine".',
      ],
      correctIndex: 1,
      explanation:
        'Correct! The word computer comes from the Latin "computare" (to reckon or calculate). Before mechanical/electronic computers were invented, "computer" was a human job title for mathematicians who manually calculated complex ballistic and astronomical tables.',
    },
    {
      id: 'q2',
      question: 'Which of the following describes the correct conceptual flow of information in a typical computer architecture diagram?',
      options: [
        'Operator → Input Device → Directly to ALU → Memory → Output Device',
        'Operator → Input Device → Memory ↔ ALU, then Memory → Output Device → Operator',
        'Operator → Control Unit → Memory → ALU → Operator',
        'Operator → Output Device → Memory → Input Device → Operator',
      ],
      correctIndex: 1,
      explanation:
        'Correct! Data travels from the Operator to the Input Device, then enters Memory. The ALU reads operands from Memory and writes results back into Memory (bidirectional ↔). Finally, Memory sends the result to the Output Device, which displays it back to the Operator.',
    },
    {
      id: 'q3',
      question: 'What is the primary role of the Control Unit (CU) in the Central Processing Unit?',
      options: [
        'It performs additions, subtractions, and boolean logical comparisons.',
        'It permanently preserves user files when the computer is turned off.',
        'It directs and coordinates all operations, fetches and decodes instructions, and sends timing/control signals.',
        'It converts high-voltage alternating current into direct current for the motherboard.',
      ],
      correctIndex: 2,
      explanation:
        'Correct! The Control Unit (CU) acts like an orchestra conductor or traffic supervisor. It does not perform mathematical arithmetic itself; rather, it coordinates timing, instruction decoding, and data routing across the system.',
    },
    {
      id: 'q4',
      question: 'Why is RAM considered "volatile" memory, while an SSD or Hard Disk is considered "non-volatile"?',
      options: [
        'RAM is made of spinning magnetic platters that quickly degrade over time.',
        'RAM loses all stored data immediately when electrical power is switched off; secondary storage retains data permanently.',
        'RAM can only be written to once by the manufacturer and cannot be changed.',
        'RAM is cheaper per gigabyte than mechanical hard disk storage.',
      ],
      correctIndex: 1,
      explanation:
        'Correct! "Volatile" means dependent on continuous electrical power. When your PC shuts down, the capacitor charges in RAM vanish. Non-volatile media (SSD, HDD, flash drives) safely preserve data without electrical power.',
    },
    {
      id: 'q5',
      question: 'In the memory hierarchy pyramid, which storage tier is the fastest and closest to the CPU execution core?',
      options: [
        'Main Memory (DDR5 RAM)',
        'NVMe Solid State Drive',
        'CPU Internal Registers',
        'L3 Shared Cache',
      ],
      correctIndex: 2,
      explanation:
        'Correct! CPU Registers (such as the Program Counter and Accumulator) are located directly inside the CPU execution core and operate at sub-nanosecond speeds, making them the fastest memory in the computer.',
    },
    {
      id: 'q6',
      question: 'What distinguishes an electrical device (like a classic toaster) from an electronic device (like a computer or light sensor circuit)?',
      options: [
        'Electrical devices run on AC power, while all electronic devices must run on solar power.',
        'Electrical devices convert electrical energy directly into heat or motion without signal logic, whereas electronics manipulate electron flow through semiconductors to process data and signals.',
        'Electrical devices are always more expensive and smaller than electronic devices.',
        'There is no scientific difference between the two terms.',
      ],
      correctIndex: 1,
      explanation:
        'Correct! Electrical devices primarily convert raw electric current into work, heat, or mechanical rotation (nichrome heating coils, motors). Electronic devices utilize semiconductors (transistors, microchips) to manipulate and switch electrical signals for information processing and decisions.',
    },
    {
      id: 'q7',
      question: 'Which of the following historical software packages was the world’s landmark pioneer in spreadsheet analysis before modern Microsoft Excel?',
      options: [
        'WordPerfect',
        'Lotus 1-2-3 (and VisiCalc)',
        'Netscape Navigator',
        'dBASE III',
      ],
      correctIndex: 1,
      explanation:
        'Correct! Lotus 1-2-3 and VisiCalc were the revolutionary spreadsheet applications that drove early personal computer adoption in businesses during the 1980s before Excel became the dominant standard.',
    },
    {
      id: 'q8',
      question: 'A learner claims: "Data travels straight from the keyboard into the ALU for instant calculation without touching memory." Is this statement correct according to the lecture’s architectural model?',
      options: [
        'Yes, input always goes straight into the ALU to minimize memory latency.',
        'No, input data must always be stored in Memory first before the ALU can fetch operands and compute.',
        'Yes, provided the keyboard is connected via a USB 3.0 port.',
        'Only when the computer has no Control Unit installed.',
      ],
      correctIndex: 1,
      explanation:
        'Correct! In the conceptual architecture model, data NEVER travels straight from an Input Device into the ALU. It must always be buffered into Memory first; only then does the ALU fetch the operands from Memory under Control Unit supervision.',
    },
  ];

  // Sorting items for Hardware vs Software drill
  const HW_SW_ITEMS = [
    { id: 'item1', name: 'Microprocessor (CPU)', type: 'hardware' },
    { id: 'item2', name: 'Windows 11 Operating System', type: 'software' },
    { id: 'item3', name: 'DDR4 RAM Stick', type: 'hardware' },
    { id: 'item4', name: 'Google Chrome Web Browser', type: 'software' },
    { id: 'item5', name: 'Flatbed Optical Scanner', type: 'hardware' },
    { id: 'item6', name: 'Device Driver for Graphics Card', type: 'software' },
  ];

  // Sorting items for Input vs Output drill
  const IO_ITEMS = [
    { id: 'io1', name: 'QWERTY Keyboard', type: 'input' },
    { id: 'io2', name: 'Color Laser Printer', type: 'output' },
    { id: 'io3', name: 'Studio Microphone', type: 'input' },
    { id: 'io4', name: 'OLED Monitor Screen', type: 'output' },
    { id: 'io5', name: 'Barcode Scanner', type: 'input' },
    { id: 'io6', name: 'Stereo Audio Speakers', type: 'output' },
  ];

  // Short answer model questions
  const SHORT_QUESTIONS = [
    {
      id: 'sq1',
      question: 'Define a Computer and list its four basic working stages (the IPO cycle).',
      modelAnswer:
        'A computer is an electronic device operating under stored instructions that accepts raw data (Input), processes it according to logical/arithmetical rules (Processing), produces meaningful results (Output), and preserves information for future use (Storage).',
      examPoints: ['Mention electronic device', 'State Input, Processing, Output, and Storage', 'Distinguish raw data from processed information'],
    },
    {
      id: 'sq2',
      question: 'Explain why the Control Unit (CU) is compared to an orchestra conductor.',
      modelAnswer:
        'An orchestra conductor does not play any instruments directly, but ensures that every violin, flute, and drum plays in precise tempo and harmony. Similarly, the Control Unit does not perform arithmetic calculations itself, but issues synchronized timing pulses that instruct Memory, ALU, Input, and Output units exactly when to send, read, or process data.',
      examPoints: ['Does not compute math directly', 'Coordinates timing & synchronization', 'Fetches & decodes instructions'],
    },
    {
      id: 'sq3',
      question: 'Why do modern smart devices (such as a microwave oven or electric car) demonstrate an overlap between electrical and electronic classifications?',
      modelAnswer:
        'Because they combine high-power electrical systems (like electric motors, heating elements, and high-voltage transformers that convert electrical energy into work or heat) with digital electronic microcontroller circuits (semiconductor microchips, digital displays, and sensors that measure temperature and execute programmed control logic).',
      examPoints: ['Contains high-power energy conversion parts (electrical)', 'Contains semiconductor sensor/microprocessor logic (electronic)', 'Overlaps to form an automated hybrid system'],
    },
  ];

  const handleSelectAnswer = (qId, optionIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
    setShowExplanations((prev) => ({
      ...prev,
      [qId]: true,
    }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    MCQS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const score = calculateScore();
  const allAnswered = Object.keys(selectedAnswers).length === MCQS.length;
  const isPassing = score >= 6; // 6 out of 8

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('mcq')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'mcq'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Multiple-Choice Exam ({score}/{MCQS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sort')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sort'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Interactive Sorting Drills
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shortAnswer')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'shortAnswer'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Short-Answer Questions
          </button>
        </div>

        {allAnswered && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs font-bold">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Score: {score} / {MCQS.length} ({Math.round((score / MCQS.length) * 100)}%)</span>
          </div>
        )}
      </div>

      {/* ========================================================
          TAB 1: MULTIPLE CHOICE QUESTIONS
         ======================================================== */}
      {activeTab === 'mcq' && (
        <div className="space-y-4">
          {MCQS.map((q, qIndex) => {
            const chosen = selectedAnswers[q.id];
            const isAnswered = chosen !== undefined;
            const isCorrect = chosen === q.correctIndex;

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-black text-xs flex items-center justify-center shrink-0">
                      {qIndex + 1}
                    </span>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {q.question}
                    </h4>
                  </div>

                  {isAnswered && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}
                    >
                      {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                    </span>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIndex) => {
                    const isSelectedOpt = chosen === optIndex;
                    const isCorrectOpt = optIndex === q.correctIndex;

                    let btnStyle =
                      'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800';

                    if (isAnswered) {
                      if (isCorrectOpt) {
                        btnStyle =
                          'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold';
                      } else if (isSelectedOpt && !isCorrect) {
                        btnStyle =
                          'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold';
                      }
                    }

                    return (
                      <button
                        key={optIndex}
                        type="button"
                        onClick={() => handleSelectAnswer(q.id, optIndex)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${btnStyle}`}
                      >
                        <span className="w-5 h-5 rounded-md border border-current font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Banner */}
                {isAnswered && (
                  <div
                    className={`p-3 rounded-xl border text-xs leading-relaxed ${
                      isCorrect
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                        : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    <p className="font-semibold">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Assessment Summary & Completion */}
          {allAnswered && (
            <div className="rounded-2xl border border-sky-300 dark:border-sky-800 bg-sky-500/10 p-5 text-center space-y-3">
              <div className="inline-flex p-3 rounded-2xl bg-sky-500 text-white shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100">
                {isPassing ? 'Exam Preparation Drill Passed!' : 'Good Effort! Review & Try Again'}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 max-w-md mx-auto">
                {isPassing
                  ? `Outstanding! You answered ${score} out of ${MCQS.length} correctly. You have completed the Computer Basics learning curriculum!`
                  : `You scored ${score} out of ${MCQS.length}. Review the explanations above to achieve full mastery.`}
              </p>

              {onComplete && isPassing && (
                <button
                  type="button"
                  onClick={onComplete}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition-colors shadow-sm shadow-sky-500/20 cursor-pointer"
                >
                  Mark Course Completed (+25 XP)
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: INTERACTIVE SORTING DRILLS
         ======================================================== */}
      {activeTab === 'sort' && (
        <div className="space-y-6">
          {/* Drill 1: Hardware vs Software */}
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 shadow-xs space-y-4">
            <div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                Classification Drill 1
              </span>
              <h3 className="text-sm font-black text-neutral-900 dark:text-neutral-100 mt-1">
                Hardware versus Software Classification
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Classify each computer component as either physical Hardware or intangible Software.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {HW_SW_ITEMS.map((item) => {
                const choice = hwSwSorting[item.id];
                const isSelected = choice !== undefined;
                const isCorrect = choice === item.type;

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {item.name}
                      </span>
                      {isSelected && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            isCorrect ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          {isCorrect ? '✓' : '✗'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() =>
                          setHwSwSorting((prev) => ({ ...prev, [item.id]: 'hardware' }))
                        }
                        className={`py-1 rounded-lg border transition-all cursor-pointer ${
                          choice === 'hardware'
                            ? 'border-sky-500 bg-sky-500 text-white'
                            : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        Hardware
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setHwSwSorting((prev) => ({ ...prev, [item.id]: 'software' }))
                        }
                        className={`py-1 rounded-lg border transition-all cursor-pointer ${
                          choice === 'software'
                            ? 'border-purple-500 bg-purple-500 text-white'
                            : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        Software
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drill 2: Input vs Output */}
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 shadow-xs space-y-4">
            <div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Classification Drill 2
              </span>
              <h3 className="text-sm font-black text-neutral-900 dark:text-neutral-100 mt-1">
                Input Devices versus Output Devices
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Identify whether each peripheral feeds data into the machine or presents results to the user.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {IO_ITEMS.map((item) => {
                const choice = ioSorting[item.id];
                const isSelected = choice !== undefined;
                const isCorrect = choice === item.type;

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {item.name}
                      </span>
                      {isSelected && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            isCorrect ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          {isCorrect ? '✓' : '✗'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() =>
                          setIoSorting((prev) => ({ ...prev, [item.id]: 'input' }))
                        }
                        className={`py-1 rounded-lg border transition-all cursor-pointer ${
                          choice === 'input'
                            ? 'border-sky-500 bg-sky-500 text-white'
                            : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        Input
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setIoSorting((prev) => ({ ...prev, [item.id]: 'output' }))
                        }
                        className={`py-1 rounded-lg border transition-all cursor-pointer ${
                          choice === 'output'
                            ? 'border-rose-500 bg-rose-500 text-white'
                            : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        Output
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: SHORT-ANSWER QUESTIONS
         ======================================================== */}
      {activeTab === 'shortAnswer' && (
        <div className="space-y-4">
          {SHORT_QUESTIONS.map((sq, index) => {
            const isRevealed = !!revealedShortAnswers[sq.id];

            return (
              <div
                key={sq.id}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black text-xs flex items-center justify-center shrink-0">
                      Q{index + 1}
                    </span>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {sq.question}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setRevealedShortAnswers((prev) => ({
                        ...prev,
                        [sq.id]: !prev[sq.id],
                      }))
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isRevealed ? 'Hide Model Answer' : 'Reveal Model Answer'}</span>
                  </button>
                </div>

                {isRevealed && (
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3 animate-in fade-in duration-150">
                    <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      <span className="font-bold text-purple-700 dark:text-purple-400 block mb-1">
                        Exam Model Answer:
                      </span>
                      {sq.modelAnswer}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                        Essential Key Marking Points:
                      </span>
                      <ul className="text-xs text-neutral-600 dark:text-neutral-400 list-disc list-inside space-y-0.5">
                        {sq.examPoints.map((pt, pIdx) => (
                          <li key={pIdx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComputerBasicsQuiz;
