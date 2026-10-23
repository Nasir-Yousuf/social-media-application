// Chapter 3: How Computers and AI Actually Work (Lessons 21-30)

export const CHAPTER_3_LESSONS = [
  {
    id: 'ai-21',
    track: 'ai',
    chapter: 3,
    chapterTitle: 'Chapter 3: How Computers and AI Actually Work',
    order: 21,
    difficulty: 'Beginner',
    title: {
      en: '21. How Computers Represent Information Using Bits and Bytes',
      bn: '২১. কম্পিউটার যেভাবে বিট (Bits) ও বাইট (Bytes) দিয়ে তথ্য প্রকাশ করে',
    },
    subtitle: {
      en: 'Understand how text, images, and audio become 0s and 1s inside a computer.',
      bn: 'লেখা, ছবি ও শব্দ যেভাবে ০ ও ১ ম্যাট্রিক্সে রূপান্তরিত হয়।',
    },
    duration: '15 mins',
    objectives: [
      'Explain binary representations (0s and 1s) and transistor switches.',
      'Convert numbers and letters (ASCII/Unicode) to binary.',
      'Understand how pixels, RGB values, and audio samples become numerical arrays.',
    ],
    prerequisites: 'Chapter 2 Complete',
    explanation: {
      simple: {
        en: 'Inside every computer chip are billions of microscopic light switches called transistors. When a switch is OFF, it represents 0. When ON, it represents 1. Everything in AI—text, photos, audio—is turned into combinations of 0s and 1s!',
        bn: 'কম্পিউটার চিপের ভেতরে লাখ লাখ মাইক্রোস্কোপিক ট্রানজিস্টর রয়েছে। সুইচ বন্ধ থাকলে ০ এবং চালু থাকলে ১ নির্দেশ করে।',
      },
      analogy: {
        en: 'Think of Morse code: short and long beeping sounds translate into letters and words. Binary is Morse code using electrical voltage (High voltage = 1, Low voltage = 0).',
        bn: 'এটি মোর্স কোডের মতো। ভোল্টেজ বেশি থাকলে ১, কম থাকলে ০।',
      },
      technical: {
        en: 'Bits (binary digits: 0 or 1) group into Bytes (8 bits). Integers, floating-point numbers (FP32, FP16, INT8), ASCII text tokens, and RGB image tensors are mapped directly onto binary memory addresses.',
        bn: '৮টি বিট মিলে তৈরি হয় ১ বাইট। ডিজিটাল ছবি ও টেক্সট ম্যাট্রিক্সে রূপান্তরিত হয়ে র‍্যামে সংরক্ষিত হয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'Computers understand human words like "cat" or "dog" directly.',
        correction: 'Computers only manipulate numbers. Words must be converted into numerical tokens and vectors before processing.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain how a digital photo of a red apple is represented inside a computer.',
      modelAnswer: 'A digital photo is broken into a grid of tiny dots called pixels. Each pixel has 3 numbers representing Red, Green, and Blue intensity (0-255). The computer stores these numbers as binary 0s and 1s!',
      checklist: ['Mentioned grid of pixels.', 'Explained RGB numbers converted to binary.'],
    },
    quiz: {
      question: 'How many bits make up 1 Byte of computer memory?',
      options: ['2 bits', '4 bits', '8 bits', '16 bits'],
      correctAnswer: 2,
      explanation: '1 Byte consists of exactly 8 bits (e.g. 01000001 = letter A).',
    },
    simulationType: 'binary-pixel-demo',
    codeLab: {
      title: 'String to Binary & RGB Converter',
      language: 'python',
      starterCode: `# Convert Text to Binary ASCII
text = "AI"
binary_rep = [bin(ord(char))[2:].zfill(8) for char in text]
print(f"Text '{text}' in Binary:", binary_rep)

# Red Pixel RGB
red_pixel = (255, 0, 0)
print(f"Red Pixel RGB Numbers: {red_pixel}")
`,
      expectedOutput: "Text 'AI' in Binary: ['01000001', '01001001']\nRed Pixel RGB Numbers: (255, 0, 0)",
      explanation: 'Every character and color value is mapped to numbers and binary bits in memory.',
    },
    summary: ['All text, images, and audio are converted into numerical binary values (0s and 1s) inside computer chips.'],
    glossary: [
      { term: 'Bit', definition: 'The smallest unit of digital data, taking a value of either 0 or 1.' },
      { term: 'Byte', definition: 'A group of 8 bits used to encode a single character or number.' },
    ],
    nextLessonId: 'ai-22',
  },
  {
    id: 'ai-22',
    track: 'ai',
    chapter: 3,
    chapterTitle: 'Chapter 3: How Computers and AI Actually Work',
    order: 22,
    difficulty: 'Beginner',
    title: {
      en: '22. CPU Explained: The General-Purpose Brain of a Computer',
      bn: '২২. সিপিইউ (CPU): কম্পিউটারের মূল সাধারণ-উদ্দেশ্য সম্পন্ন মস্তিষ্ক',
    },
    subtitle: {
      en: 'Understand clock speed, cores, instruction sets, and sequential processing.',
      bn: 'ক্লক স্পিড, প্রসেসর কোর ও সিকোয়েন্সিয়াল প্রক্রিয়াকরণ।',
    },
    duration: '15 mins',
    objectives: [
      'Define Central Processing Unit (CPU) architecture.',
      'Understand how CPU Cores execute sequential instructions at high clock speeds (GHz).',
      'Identify why CPUs excel at general operating system tasks but bottleneck for AI workloads.',
    ],
    prerequisites: 'Lesson 21',
    explanation: {
      simple: {
        en: 'The CPU (Central Processing Unit) is the chief executive of your computer. It has 4 to 16 powerful cores that run at extremely high speeds (like 4.5 GHz), handling your operating system, web browser, and mouse movements one instruction after another.',
        bn: 'সিপিইউ হলো কম্পিউটারের চিফ এক্সিকিউটিভ। এতে ৪ থেকে ১৬টি শক্তিশালী কোর থাকে যা দ্রুত গতিতে সিকোয়েন্সিয়ালি নির্দেশনা মান্য করে।',
      },
      analogy: {
        en: 'A CPU is like a team of 8 brilliant mathematicians. They can solve incredibly complex logic problems sequentially, but if you give them 10,000 simple additions at once, they get overwhelmed!',
        bn: 'সিপিইউ হলো ৮ জন জিনিয়াস গণিতবিদের মতো। জটিল অঙ্কে তারা সেরা, কিন্তু একসাথে ১০,০০০ সহজ যোগ দিলে তারা আটকে যায়।',
      },
      technical: {
        en: 'CPUs utilize complex ALU logic, out-of-order execution, branch prediction, and multi-level Caches (L1, L2, L3) to minimize latency for general-purpose sequential instruction sets (x86, ARM).',
        bn: 'সিপিইউ ব্রাঞ্চ প্রেডিকশন ও ক্যাশ মেমরি দিয়ে ল্যাটেন্সি কমায়।',
      },
    },
    misconceptions: [
      {
        misconception: 'A CPU with 4.0 GHz clock speed is automatically 100 times faster for AI than a GPU with 1.5 GHz clock speed.',
        correction: 'Clock speed is only per core. GPUs have thousands of cores operating simultaneously, drastically outperforming CPUs for parallel matrix math.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain why a CPU is great for opening apps, but struggles with large AI models.',
      modelAnswer: 'A CPU has a few super-fast cores that process tasks one after another (great for apps and logic). But AI models require millions of simple math calculations at the exact same time, which overwhelms the CPU’s small number of cores!',
      checklist: ['Mentioned few fast cores for sequential tasks.', 'Identified bottleneck for massive parallel AI math.'],
    },
    quiz: {
      question: 'What is the primary strength of a Central Processing Unit (CPU)?',
      options: [
        'Running 10,000 parallel matrix multiplications simultaneously.',
        'Low-latency, high-clock-speed sequential execution for general-purpose tasks.',
        'Cooling down graphics cards with built-in fans.',
        'Storing petabytes of permanent cold storage data.',
      ],
      correctAnswer: 1,
      explanation: 'CPUs feature high single-thread clock speeds and complex caches, making them ideal for sequential tasks.',
    },
    simulationType: 'cpu-architecture-demo',
    codeLab: {
      title: 'CPU Core Execution Tracker',
      language: 'python',
      starterCode: `# CPU Sequential Execution Simulation
def cpu_task(task_name):
    print(f"CPU Core 1 executing: {task_name}")

tasks = ["Render Web Page", "Process Mouse Click", "Play Audio Stream"]
for t in tasks:
    cpu_task(t)
`,
      expectedOutput: 'CPU Core 1 executing: Render Web Page\nCPU Core 1 executing: Process Mouse Click\nCPU Core 1 executing: Play Audio Stream',
      explanation: 'CPUs execute tasks sequentially with low latency.',
    },
    summary: ['CPUs feature few, extremely fast cores optimized for sequential, general-purpose computing.'],
    glossary: [
      { term: 'Clock Speed', definition: 'The rate at which a processor executes instructions, measured in Gigahertz (GHz).' },
      { term: 'Cache Memory', definition: 'High-speed SRAM built into the CPU to store frequently accessed data.' },
    ],
    nextLessonId: 'ai-23',
  },
  {
    id: 'ai-23',
    track: 'ai',
    chapter: 3,
    chapterTitle: 'Chapter 3: How Computers and AI Actually Work',
    order: 23,
    difficulty: 'Beginner',
    title: {
      en: '23. GPU Explained: Why Parallel Processing Matters for AI',
      bn: '২৩. জিপিউ (GPU): কেন সমান্তরাল প্রসেসিং AI-এর জন্য অপরিহার্য',
    },
    subtitle: {
      en: 'Discover how thousands of CUDA/Stream cores accelerate neural networks.',
      bn: 'হাজার হাজার জিপিউ কোর যেভাবে ম্যাট্রিক্স গণনার গতি হাজার গুণ বাড়িয়ে দেয়।',
    },
    duration: '15 mins',
    objectives: [
      'Define Graphics Processing Unit (GPU) architecture.',
      'Compare CPU sequential architecture with GPU massively parallel architecture.',
      'Explain how matrix multiplication forms the mathematical core of AI training and inference.',
    ],
    prerequisites: 'Lesson 22',
    explanation: {
      simple: {
        en: 'While a CPU has 4 to 16 cores, a GPU has 3,000 to 16,000 smaller cores! Instead of doing 1 complex task at a time, a GPU performs thousands of simple matrix math multiplications at the exact same instant.',
        bn: 'সিপিইউ-তে ৪ থেকে ১৬টি কোর থাকে, কিন্তু জিপিউ-তে ৩০০০ থেকে ১৬০০০ ছোট কোর থাকে যা একই সেকেন্ডে হাজার হাজার ম্যাট্রিক্স গণনা করতে পারে।',
      },
      analogy: {
        en: 'Imagine painting a giant wall. A CPU is 1 master painter with a small brush carefully painting pixel by pixel. A GPU is a giant spray-rig with 5,000 nozzles that paints the entire wall in one burst!',
        bn: 'সিপিইউ হলো ১ জন চিত্রশিল্পী যে ব্রাশ দিয়ে ধরে ধরে ছবি আঁকে। আর জিপিউ হলো ৫০০০ স্প্রে যা এক ক্লিকে পুরো দেওয়ালে রং করে দেয়।',
      },
      technical: {
        en: 'GPUs (e.g. NVIDIA H100) feature thousands of SIMD (Single Instruction, Multiple Data) cores. Tensor Cores specifically execute Fused Multiply-Add (FMA) matrix operations: D = A × B + C in a single clock cycle.',
        bn: 'জিপিউ-তে SIMD এবং টেনসর কোর থাকে যা এক ক্লক সাইকেলে ম্যাট্রিক্স গুণ সম্পাদন করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'Replacing your CPU with a GPU will make your web browser run 1,000 times faster.',
        correction: 'No. Web browsers are sequential programs that run on CPUs. GPUs only accelerate parallel workloads like 3D graphics and neural networks.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain to a non-technical friend why GPUs are the foundational hardware of modern AI.',
      modelAnswer: 'AI requires multiplying massive grids of numbers (matrices) millions of times. While CPUs do math one by one, GPUs have thousands of cores that do thousands of matrix multiplications at the exact same time, making AI training years faster!',
      checklist: ['Mentioned grids of numbers (matrices).', 'Explained thousands of GPU cores working in parallel.'],
    },
    quiz: {
      question: 'What architectural feature makes GPUs superior to CPUs for training neural networks?',
      options: [
        'Higher individual core clock speed (e.g. 6.0 GHz).',
        'Thousands of parallel cores designed to execute SIMD matrix operations simultaneously.',
        'Larger optical disk drives.',
        'Built-in audio sound cards.',
      ],
      correctAnswer: 1,
      explanation: 'GPUs contain thousands of cores operating in parallel, perfect for neural network matrix multiplications.',
    },
    simulationType: 'cpu-gpu-comparison-demo',
    codeLab: {
      title: 'Matrix Multiplication Parallel Simulation',
      language: 'python',
      starterCode: `# Simulating Parallel Matrix Operation (GPU Style)
matrix_a = [1, 2, 3, 4]
matrix_b = [10, 20, 30, 40]

# All 4 CUDA cores execute simultaneously in 1 step!
gpu_parallel_output = [a * b for a, b in zip(matrix_a, matrix_b)]
print("GPU Parallel Result (1 step):", gpu_parallel_output)
`,
      expectedOutput: 'GPU Parallel Result (1 step): [10, 40, 90, 160]',
      explanation: 'GPU SIMD execution multiplies matching vector elements across parallel execution channels.',
    },
    summary: ['GPUs contain thousands of parallel cores optimized for SIMD matrix multiplication, the engine of deep learning.'],
    glossary: [
      { term: 'SIMD', definition: 'Single Instruction, Multiple Data: executing one instruction across multiple data points in parallel.' },
      { term: 'CUDA Core', definition: 'NVIDIA’s parallel processing unit capable of executing mathematical calculations simultaneously.' },
    ],
    nextLessonId: 'ai-24',
  },
  {
    id: 'ai-24',
    track: 'ai',
    chapter: 3,
    chapterTitle: 'Chapter 3: How Computers and AI Actually Work',
    order: 24,
    difficulty: 'Beginner',
    title: {
      en: '24. CPU vs. GPU vs. TPU vs. NPU: Different Chips for Different Jobs',
      bn: '২৪. CPU বনাম GPU বনাম TPU বনাম NPU: কোন চিপ কিসের জন্য?',
    },
    subtitle: {
      en: 'Compare general processors, graphics cards, Google TPUs, and smartphone NPUs.',
      bn: 'গুগল TPU, জিপিউ, সিপিইউ ও স্মার্টফোনের NPU চিপের তুলনামূলক বিশ্লেষণ।',
    },
    duration: '15 mins',
    objectives: [
      'Compare CPU, GPU, TPU (Tensor Processing Unit), and NPU (Neural Processing Unit).',
      'Understand Application-Specific Integrated Circuits (ASICs).',
      'Identify which chip is used for cloud data centers vs mobile edge devices.',
    ],
    prerequisites: 'Lesson 23',
    explanation: {
      simple: {
        en: 'Different chips are built for different jobs! 1) CPU = Flexible Generalist, 2) GPU = Parallel Graphics & AI Specialist, 3) TPU = Supercharged Google AI Factory Chip, 4) NPU = Ultra-low-power AI chip inside your phone.',
        bn: 'বিভিন্ন কাজের জন্য বিভিন্ন চিপ: সিপিইউ (অলরাউন্ডার), জিপিউ (প্যারালাল স্পেশালিস্ট), টিপিইউ (গুগলের হাই-স্পিড এআই ফ্যাক্টরি চিপ), এনপিইউ (মোবাইলের ব্যাটারি-সাশ্রয়ী এআই চিপ)।',
      },
      analogy: {
        en: 'CPU is a Swiss Army Knife (does everything okay). GPU is a heavy excavator (moves huge loads). TPU is a high-speed factory conveyor belt (built for 1 task at maximum speed). NPU is a tiny pocket multi-tool inside your phone!',
        bn: 'সিপিইউ হলো সুইস আর্মি নাইফ। জিপিউ হলো এক্সেভেটর। টিপিইউ হলো কারখানার কনভেয়র বেল্ট। এনপিইউ হলো পকেটের ছোট মাল্টি-টুল।',
      },
      technical: {
        en: 'TPUs (Google) use Systolic Array architectures that stream matrix multiplications without accessing register files between ops. NPUs optimize INT8/INT4 quantization for low-power edge inference.',
        bn: 'টিপিইউ সিস্টোলিক অ্যারে আর্কিটেকচার ব্যবহার করে সরাসরি ম্যাট্রিক্স মাল্টিপ্লিকেশন করে।',
      },
    },
    misconceptions: [
      {
        misconception: 'TPUs will completely replace CPUs in personal computers.',
        correction: 'No. TPUs are specialized ASICs for matrix math. They cannot run operating systems, file systems, or general software.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain the main difference between a GPU and a smartphone NPU.',
      modelAnswer: 'A GPU is a powerful, power-hungry card used for massive 3D graphics and training AI in servers. An NPU is a tiny, energy-efficient chip inside your phone designed specifically to run small AI tasks (like face unlock) without draining your battery!',
      checklist: ['Mentioned GPU power and server training.', 'Mentioned NPU battery efficiency and mobile tasks.'],
    },
    quiz: {
      question: 'Which chip is specifically designed by Google as an ASIC to accelerate matrix operations in cloud data centers?',
      options: [
        'CPU (Central Processing Unit)',
        'TPU (Tensor Processing Unit)',
        'VGA (Video Graphics Array)',
        'HDD (Hard Disk Drive)',
      ],
      correctAnswer: 1,
      explanation: 'Google’s TPU is a custom ASIC designed specifically for high-throughput tensor matrix operations.',
    },
    simulationType: 'chip-comparison-demo',
    codeLab: {
      title: 'Chip Selection Logic',
      language: 'python',
      starterCode: `# Selecting the Right Hardware for the Job
def select_hardware(task, power_budget_watts):
    if task == "OS & File Management":
        return "CPU"
    elif task == "Train LLM in Cloud" and power_budget_watts > 300:
        return "GPU / TPU Cluster"
    elif task == "Mobile On-Device FaceID" and power_budget_watts < 5:
        return "NPU"
    return "GPU"

print("Mobile Camera Filter ->", select_hardware("Mobile On-Device FaceID", 2))
print("Cloud AI Training ->", select_hardware("Train LLM in Cloud", 500))
`,
      expectedOutput: 'Mobile Camera Filter -> NPU\nCloud AI Training -> GPU / TPU Cluster',
      explanation: 'Hardware choices balance matrix throughput against power and latency constraints.',
    },
    summary: ['CPU = General logic; GPU = Parallel graphics/AI; TPU = Dedicated cloud AI ASIC; NPU = Efficient mobile edge AI.'],
    glossary: [
      { term: 'ASIC', definition: 'Application-Specific Integrated Circuit: a chip customized for a particular use rather than general-purpose use.' },
      { term: 'TPU', definition: 'Tensor Processing Unit: Google’s proprietary AI accelerator chip.' },
    ],
    nextLessonId: 'ai-25',
  },
  {
    id: 'ai-25',
    track: 'ai',
    chapter: 3,
    chapterTitle: 'Chapter 3: How Computers and AI Actually Work',
    order: 25,
    difficulty: 'Beginner',
    title: {
      en: '25. RAM, VRAM, Storage, Bandwidth, and Why Memory Matters',
      bn: '২৫. RAM, VRAM, মেমরি ব্র্যান্ডউইথ এবং AI-তে কেন মেমরি এত গুরুত্বপূর্ণ',
    },
    subtitle: {
      en: 'Understand how model size (7B, 70B parameters) maps to VRAM requirements.',
      bn: '৭ বিলিয়ন ও ৭০ বিলিয়ন প্যারামিটার মডেলের জন্য মেমরির প্রয়োজনীয়তা।',
    },
    duration: '15 mins',
    objectives: [
      'Differentiate System RAM, GPU VRAM, and Storage (SSD/NVMe).',
      'Calculate model memory footprint based on parameter count and precision (FP16, INT8).',
      'Explain memory bandwidth bottlenecks in AI inference.',
    ],
    prerequisites: 'Lesson 24',
    explanation: {
      simple: {
        en: 'Before an AI model can generate a single word, its billions of numbers (weights) must fit directly inside high-speed GPU Video Memory (VRAM). If your model is bigger than your VRAM, the AI slows down to a crawl or crashes with an "Out of Memory" error!',
        bn: 'AI মডেল চলার জন্য তার সব প্যারামিটার জিপিউ-এর VRAM মেমরিতে লোড হতে হয়। মেমরি কম পড়লে Out of Memory এরর দেখায়।',
      },
      analogy: {
        en: 'Storage (SSD) is like a giant library in the basement. RAM/VRAM is the desk in front of you. If a book doesn’t fit on your desk, you have to keep running up and down the stairs to the basement every time you read a page!',
        bn: 'এসএসডি হলো মেঝের বইয়ের লাইব্রেরি। ভি-র‍্যাম হলো আপনার পড়ার টেবিল। টেবিলে জায়গা না থাকলে নিচে হেঁটে বই এনে পড়া ধীরগতির হয়।',
      },
      technical: {
        en: 'Memory Estimation Formula: Model VRAM ≈ Parameters (in Billions) × Bytes Per Precision + Overhead (20%). At 16-bit precision (FP16), 1 Parameter = 2 Bytes. A 7B model requires ~14 GB VRAM for weights alone.',
        bn: 'ভি-র‍্যাম মেমরি ফর্মুলা: প্যারামিটার (বিলিয়ন) × প্রিসিশন বাইট + ওভারহেড। FP16-এ ৭B মডেলের জন্য প্রায় ১৪ GB VRAM লাগে।',
      },
    },
    misconceptions: [
      {
        misconception: 'Having a 2 Terabyte SSD means you can run a 70 Billion parameter AI model at lightning speed.',
        correction: 'SSD storage is cold storage. The model weights MUST be loaded into GPU VRAM (high-bandwidth memory) to achieve fast inference.',
      },
    ],
    feynmanChallenge: {
      prompt: 'How much VRAM does a 7 Billion parameter model require in FP16 precision, and why?',
      modelAnswer: 'It requires roughly 14 GB of VRAM. Because in 16-bit (FP16) precision, each parameter takes 2 Bytes of memory (7 Billion × 2 Bytes = 14 GB)!',
      checklist: ['Calculated 7B × 2 Bytes = 14 GB.', 'Mentioned loading into GPU VRAM.'],
    },
    quiz: {
      question: 'How much VRAM is required to load a 13 Billion parameter model in FP16 (2 bytes per parameter) precision for model weights?',
      options: ['4 GB VRAM', '13 GB VRAM', '26 GB VRAM', '100 GB VRAM'],
      correctAnswer: 2,
      explanation: '13 Billion parameters × 2 Bytes/param = 26 GB VRAM minimum for model weights.',
    },
    simulationType: 'vram-calculator-demo',
    codeLab: {
      title: 'Model VRAM Footprint Calculator',
      language: 'python',
      starterCode: `# VRAM Calculator
def calculate_vram(params_billions, precision_bits=16):
    bytes_per_param = precision_bits / 8
    model_gb = params_billions * bytes_per_param
    total_needed_gb = model_gb * 1.20 # Adding 20% overhead for context & activation
    return total_needed_gb

print("7B Model FP16 Needed:", calculate_vram(7, 16), "GB VRAM")
print("70B Model FP16 Needed:", calculate_vram(70, 16), "GB VRAM")
print("70B Model INT4 (Quantized) Needed:", calculate_vram(70, 4), "GB VRAM")
`,
      expectedOutput: '7B Model FP16 Needed: 16.8 GB VRAM\n70B Model FP16 Needed: 168.0 GB VRAM\n70B Model INT4 (Quantized) Needed: 42.0 GB VRAM',
      explanation: 'Quantization (converting FP16 to INT4) reduces VRAM memory requirements by 4x.',
    },
    summary: ['AI models must load parameters into high-speed GPU VRAM; quantization reduces VRAM requirements.'],
    glossary: [
      { term: 'VRAM', definition: 'Video RAM: dedicated high-bandwidth memory attached directly to the GPU graphics card.' },
      { term: 'Quantization', definition: 'Reducing the numerical precision of model weights (e.g. 16-bit to 4-bit) to save memory.' },
    ],
    nextLessonId: 'ai-26',
  },
  {
    id: 'ai-26',
    track: 'ai',
    chapter: 3,
    chapterTitle: 'Chapter 3: How Computers and AI Actually Work',
    order: 26,
    difficulty: 'Beginner',
    title: {
      en: '26. How Data Moves Through a Computer: Processing and Bottlenecks',
      bn: '২৬. ডেটার গতিপথ ও কম্পিউটারের পারফরম্যান্স বোতলনেক (Bottlenecks)',
    },
    subtitle: {
      en: 'Understand PCIe bus lanes, memory bandwidth, and the Memory Wall.',
      bn: 'মেমরি থেকে প্রসেসরে ডেটা স্থানান্তরের ল্যাটেন্সি ও বাধা।',
    },
    duration: '15 mins',
    objectives: [
      'Trace data movement: Storage -> System RAM -> PCIe Bus -> GPU VRAM -> Tensor Cores.',
      'Explain the "Memory Wall" problem in modern computing.',
      'Understand why data transfer bandwidth is often a bigger bottleneck than compute speed.',
    ],
    prerequisites: 'Lesson 25',
    explanation: {
      simple: {
        en: 'No matter how fast a GPU chip is, it cannot do calculations if it is waiting for data to travel over the wire from your hard drive! The delay during data transfer is called a Bottleneck.',
        bn: 'জিপিউ যত দ্রুতই হোক না কেন, ড্রাইভ থেকে ডেটা পৌঁছাতে দেরি হলে কাজের গতি কমে যায়। একে বোতলনেক বা বাধা বলে।',
      },
      analogy: {
        en: 'Imagine a super-fast chef who can cook a meal in 5 seconds, but the grocery delivery truck takes 2 hours to arrive. The chef spends 99% of the day standing around doing nothing!',
        bn: 'একজন প্রফেশনাল শেফ ৫ সেকেন্ডে রান্না করতে পারেন, কিন্তু বাজার পৌঁছাতে ২ ঘণ্টা লাগলে তাকে বসে থাকতে হয়।',
      },
      technical: {
        en: 'The Memory Wall occurs because compute operations (FLOPs) have grown by ~60% annually while memory access latency has improved by only ~7% annually. PCIe Gen 5 provides ~64 GB/s throughput, whereas HBM3 GPU memory bandwidth exceeds 3,000 GB/s.',
        bn: 'মেমরি ব্যান্ডউইথ এবং প্রসেসরের গতি বৈষম্যকে মেমরি ওয়াল প্রবলেম বলা হয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'AI models spend most of their execution time doing math.',
        correction: 'In single-batch LLM inference, models are frequently "Memory Bandwidth Bound"—spending more time fetching weights from VRAM than performing math.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain what the "Memory Wall" is using a real-world bottleneck analogy.',
      modelAnswer: 'The Memory Wall means processors have become super fast at math, but memory transfer speeds haven’t kept up. It’s like a super-fast factory worker standing idle because the delivery truck takes forever to bring parts!',
      checklist: ['Identified fast processor vs slow memory transfer.', 'Explained idle waiting time.'],
    },
    quiz: {
      question: 'What is the "Memory Wall" in computer architecture?',
      options: [
        'A physical barrier built inside cleanroom chip factories.',
        'The growing gap between fast processor calculation speeds and slower memory transfer speeds.',
        'A fire prevention protocol for data center server racks.',
        'The total storage capacity limit of SSD hard drives.',
      ],
      correctAnswer: 1,
      explanation: 'The Memory Wall refers to processor speeds outpacing data transfer speeds from memory.',
    },
    simulationType: 'data-pipeline-demo',
    codeLab: {
      title: 'Data Pipeline Transfer Bottleneck Simulator',
      language: 'python',
      starterCode: `# Data Transfer Latency Simulation
storage_transfer_speed_gbps = 5
vram_bandwidth_gbps = 2000

model_size_gb = 14

time_from_ssd = model_size_gb / storage_transfer_speed_gbps
time_from_vram = model_size_gb / vram_bandwidth_gbps

print(f"Time to load from SSD: {time_from_ssd:.2f} seconds")
print(f"Time to access in VRAM: {time_from_vram:.5f} seconds")
`,
      expectedOutput: 'Time to load from SSD: 2.80 seconds\nTime to access in VRAM: 0.00700 seconds',
      explanation: 'VRAM is over 400x faster than SSD storage access.',
    },
    summary: ['Data transfer bottlenecks (Memory Wall) often limit AI speed more than raw compute speed.'],
    glossary: [
      { term: 'PCIe Bus', definition: 'The high-speed expansion bus connecting hardware components to the motherboard.' },
      { term: 'Memory Wall', definition: 'The disparity between processor execution speeds and memory access bandwidth.' },
    ],
    nextLessonId: 'ai-27',
  },
  {
    id: 'ai-27',
    track: 'ai',
    chapter: 3,
    chapterTitle: 'Chapter 3: How Computers and AI Actually Work',
    order: 27,
    difficulty: 'Beginner',
    title: {
      en: '27. Parallel Computing: Why Thousands of Small Operations Matter',
      bn: '২৭. প্যারালাল কম্পিউটিং: কেন হাজার হাজার ক্ষুদ্র অপারেশন একসাথে কাজ করে',
    },
    subtitle: {
      en: 'Understand vectorization, matrix multiplication, and SIMD instruction streams.',
      bn: 'ভেক্টরাইজেশন ও সমান্তরাল ডেটা প্রসেসিংয়ের গণিত।',
    },
    duration: '15 mins',
    objectives: [
      'Explain the difference between Sequential loops vs Vectorized parallel operations.',
      'Understand how matrix multiplication (A × B) breaks into independent parallel dot products.',
      'Learn why AI models scale predictably with parallel compute hardware.',
    ],
    prerequisites: 'Lesson 26',
    explanation: {
      simple: {
        en: 'Instead of doing a FOR-loop that processes 1 million items 1-by-1, Parallel Computing splits the 1 million items across 1,000 cores so everyone finishes at the exact same time!',
        bn: '১ মিলিয়নের লুপ একটার পর একটা না চালিয়ে, ১০০০টি কোরে ভাগ করে এক সেকেণ্ডে কাজ শেষ করাই হলো প্যারালাল কম্পিউটিং।',
      },
      analogy: {
        en: 'If 100 students have to sign a attendance sheet, passing 1 pen around takes 100 minutes. Giving 100 pens to 100 students takes 1 minute!',
        bn: '১০০ জন ছাত্রকে ১টি কলম দিয়ে সই করালে ১০০ মিনিট লাগে। ১০০ জনকে ১০০টি কলম দিলে ১ মিনিটেই শেষ!',
      },
      technical: {
        en: 'Vectorization transforms iterative scalar loops into SIMD matrix operations. Matrix multiplication C_ij = ∑ A_ik * B_kj computes dot products independently in parallel threads without data dependencies.',
        bn: 'ম্যাট্রিক্সের প্রতি সারির ডট প্রোডাক্ট স্বয়ংসম্পূর্ণভাবে আলাদা আলাদা প্যারালাল থ্রেডে নির্বাহিত হয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'Any program can be sped up 1,000x simply by running it on a parallel GPU.',
        correction: 'Amdahl’s Law shows that parallel speedup is limited by the sequential fraction of a program that cannot be split.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain what vectorization means in computer programming.',
      modelAnswer: 'Vectorization means performing a math operation on an entire list or grid of numbers all at once in parallel, instead of writing a loop that processes numbers one by one!',
      checklist: ['Compared single-item loop to parallel vector operation.'],
    },
    quiz: {
      question: 'Why can matrix multiplication be parallelized so effectively on GPUs?',
      options: [
        'Because matrix math requires no multiplication.',
        'Because each output cell calculation is independent and can be calculated in its own thread simultaneously.',
        'Because GPUs automatically turn off when multiplying numbers.',
        'Because matrix multiplication requires no computer memory.',
      ],
      correctAnswer: 1,
      explanation: 'Matrix cell calculations do not depend on each other, allowing independent parallel execution.',
    },
    simulationType: 'vectorization-demo',
    codeLab: {
      title: 'Sequential Loop vs Vectorized NumPy Addition',
      language: 'python',
      starterCode: `# Sequential Loop vs Parallel Array Math
numbers = [1, 2, 3, 4, 5]

# Sequential Loop
seq_result = []
for n in numbers:
    seq_result.append(n * 10)

# Vectorized Concept (Simulated)
parallel_result = [n * 10 for n in numbers]

print("Sequential Result:", seq_result)
print("Vectorized Result:", parallel_result)
`,
      expectedOutput: 'Sequential Result: [10, 20, 30, 40, 50]\nVectorized Result: [10, 20, 30, 40, 50]',
      explanation: 'Vectorized operations process entire arrays in parallel memory blocks.',
    },
    summary: ['Parallel computing splits independent matrix calculations across thousands of hardware threads simultaneously.'],
    glossary: [
      { term: 'Vectorization', definition: 'Converting scalar algorithms to operate on entire vectors or arrays at once.' },
      { term: 'Amdahl’s Law', definition: 'A formula giving the theoretical speedup of a task executing on a parallel architecture.' },
    ],
    nextLessonId: 'ai-28',
  },
  {
    id: 'ai-28',
    track: 'ai',
    chapter: 3,
    chapterTitle: 'Chapter 3: How Computers and AI Actually Work',
    order: 28,
    difficulty: 'Beginner',
    title: {
      en: '28. Cloud Computing and AI Data Centers: Running Models at Scale',
      bn: '২৮. ক্লাউড কম্পিউটিং ও AI ডাটা সেন্টার: বড় স্কেলে মডেল পরিচালনা',
    },
    subtitle: {
      en: 'Explore server clusters, InfiniBand networking, and supercomputer pods.',
      bn: 'সার্ভার ক্লাস্টার, ইনফিনিব্যান্ড নেটওয়ার্ক ও সুপারকম্পিউটার পড।',
    },
    duration: '15 mins',
    objectives: [
      'Understand how AI models are trained across thousands of interconnected server nodes.',
      'Explain ultra-high-speed cluster networking (InfiniBand, 800 Gbps).',
      'Distinguish cloud infrastructure (AWS, GCP, Azure, Lambda) from local computing.',
    ],
    prerequisites: 'Lesson 27',
    explanation: {
      simple: {
        en: 'Giant AI models (like GPT-4 or Gemini) are too big to fit on a single GPU card. They are trained in massive data centers containing tens of thousands of GPUs linked together with superfast network cables!',
        bn: 'বড় AI মডেল ১টি জিপিউ কার্ডে আটে না। এগুলোকে বিশাল ডাটা সেন্টারের হাজার হাজার জিপিউ দিয়ে ট্রেইন করানো হয়।',
      },
      analogy: {
        en: 'It’s like building a mega skyscraper. A single construction worker can’t carry a steel beam alone. You need 1,000 workers synchronized with walkie-talkies carrying the beam together in unison!',
        bn: 'বড় বহুতল ভবন বানানোর জন্য ১০০০ শ্রমিকের সাথে ওয়াকিটকিতে যোগাযোগ রেখে একসাথে কাজ করার মতো।',
      },
      technical: {
        en: 'Distributed training uses Data Parallelism (splitting batch across GPUs) and Model/Tensor Parallelism (splitting layer weights across GPUs). High-bandwidth InfiniBand (NVLink/NVSwitch) minimizes inter-node latency during All-Reduce weight synchronization.',
        bn: 'ডিস্ট্রিবিউটেড ট্রেনিংয়ের জন্য ডেটা ও মডেল প্যারালালিজম ব্যবহার করে এনভিলিঙ্ক ইন্টারকানেক্ট দিয়ে ডেটা সিঙ্ক করা হয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'Cloud data centers just store web pages in basic hard drives.',
        correction: 'Modern AI data centers are custom supercomputers with liquid cooling, high-speed InfiniBand switches, and thousands of interconnected GPUs.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Why do data centers need high-speed network connections between GPUs when training huge models?',
      modelAnswer: 'Because a huge model is split across thousands of GPUs. After every training step, all GPUs must talk to each other over the network to sync their updated weights. If the network is slow, all GPUs sit idle waiting!',
      checklist: ['Mentioned splitting models across GPUs.', 'Explained syncing weights over high-speed networks.'],
    },
    quiz: {
      question: 'What technique is used when an AI model is too large to fit inside a single GPU’s VRAM?',
      options: [
        'Model / Tensor Parallelism (splitting model layers across multiple GPUs)',
        'Formatting the hard drive to FAT32',
        'Converting all floating point numbers into text files',
        'Running the model on a smartphone battery',
      ],
      correctAnswer: 0,
      explanation: 'Model/Tensor Parallelism splits model weights across multiple GPUs to share memory capacity.',
    },
    simulationType: 'data-center-cluster-demo',
    codeLab: {
      title: 'Multi-GPU Cluster Distributed Workload Splitter',
      language: 'python',
      starterCode: `# Distributed Data Parallel Batch Splitter
total_batch_size = 512
available_gpus = 8

batch_per_gpu = total_batch_size // available_gpus
print(f"Total Training Batch: {total_batch_size} samples")
print(f"Each of the {available_gpus} GPUs processes: {batch_per_gpu} samples in parallel!")
`,
      expectedOutput: 'Total Training Batch: 512 samples\nEach of the 8 GPUs processes: 64 samples in parallel!',
      explanation: 'Data Parallelism splits large batch sizes evenly across multiple GPU cluster nodes.',
    },
    summary: ['Modern AI models are trained across massive cloud data center clusters linked via high-speed NVLink/InfiniBand networks.'],
    glossary: [
      { term: 'Distributed Training', definition: 'Splitting training workloads across multiple compute nodes or GPUs.' },
      { term: 'NVLink', definition: 'NVIDIA’s high-speed direct GPU-to-GPU interconnect technology.' },
    ],
    nextLessonId: 'ai-29',
  },
  {
    id: 'ai-29',
    track: 'ai',
    chapter: 3,
    chapterTitle: 'Chapter 3: How Computers and AI Actually Work',
    order: 29,
    difficulty: 'Beginner',
    title: {
      en: '29. The Cost of AI: Compute, Electricity, Cooling, and Inference',
      bn: '২৯. AI-এর আর্থিক ও পরিবেশগত খরচ: কম্পিউট, বিদ্যুৎ, কুলিং ও ইনফারেঞ্চ',
    },
    subtitle: {
      en: 'Examine the economics, power consumption, and environmental footprint of training LLMs.',
      bn: 'বিদ্যুৎ খরচ, ডাটা সেন্টারের পানি দিয়ে কুলিং ও মডেল চালানোর আসল খরচ।',
    },
    duration: '15 mins',
    objectives: [
      'Calculate the financial and energy costs of training frontier models (e.g. $10M+ to $100M+ per run).',
      'Understand Megawatt (MW) power requirements and liquid cooling systems in data centers.',
      'Contrast Training Cost (one-time high cost) vs Inference Cost (ongoing operational cost).',
    ],
    prerequisites: 'Lesson 28',
    explanation: {
      simple: {
        en: 'Training a state-of-the-art AI model can cost over $50 million in hardware and electricity! Running a data center requires megawatts of power—enough energy to power a small city—and millions of gallons of water for cooling systems.',
        bn: 'একটি বড় AI মডেল ট্রেইন করতে ৫০ মিলিয়ন ডলারের বেশি খরচ এবং একটি ছোট শহরের সমান বিদ্যুৎ ও বিপুল পানির প্রয়োজন হয়।',
      },
      analogy: {
        en: 'Training an AI is like building and launching a space rocket ($100 million upfront). Inference (answering user queries) is like fueling a taxi fleet every day ($0.002 per ride, but millions of rides daily!).',
        bn: 'মডেল ট্রেইনিং হলো রকেট তৈরির সমান খরচ। আর ইনফারেঞ্চ (ইউজারের উত্তর দেওয়া) হলো প্রতিদিন ট্যাক্সি জ্বালানির ছোট খরচের সমান।',
      },
      technical: {
        en: 'Energy Consumption (kWh) = Total FLOPs / (Flops per Watt * 3600). A 100,000 H100 GPU cluster draws ~70 MegaWatts (MW) of continuous electrical power, requiring closed-loop liquid cooling or evaporative chilling towers.',
        bn: '১০০,০০০ H100 জিপিউ ক্লাস্টারে প্রায় ৭০ মেগাওয়াট বিদ্যুৎ প্রয়োজন হয়।',
      },
    },
    misconceptions: [
      {
        misconception: 'The total cost of AI stops completely once model training is finished.',
        correction: 'Inference costs for serving millions of daily user prompts often exceed initial training costs over the model’s lifetime.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Explain the difference between Training Cost and Inference Cost.',
      modelAnswer: 'Training Cost is the huge one-time expense (millions of dollars in GPUs & electricity) to teach the model. Inference Cost is the small ongoing cost incurred every time a user asks the model a question!',
      checklist: ['Defined one-time training expense.', 'Defined ongoing inference per-query cost.'],
    },
    quiz: {
      question: 'Which component represents the continuous operational cost incurred whenever a user asks an AI chatbot a question?',
      options: ['Initial Data Labeling Cost', 'Inference Cost', 'Patent Registration Cost', 'Hard Drive Manufacturing Cost'],
      correctAnswer: 1,
      explanation: 'Inference cost refers to the ongoing hardware/electricity compute cost to generate responses for user queries.',
    },
    simulationType: 'ai-cost-calculator-demo',
    codeLab: {
      title: 'Training vs Inference Cost Calculator',
      language: 'python',
      starterCode: `# Cost Comparison Estimator
training_gpu_hours = 500000
gpu_cost_per_hour = 3.00

training_total_cost = training_gpu_hours * gpu_cost_per_hour

# Daily Inference Cost
daily_queries = 1000000
cost_per_query = 0.002
daily_inference_cost = daily_queries * cost_per_query

print(f"One-Time Model Training Cost: \${training_total_cost:,.2f}")
print(f"Daily Inference Cost: \${daily_inference_cost:,.2f}")
print(f"30-Day Inference Cost: \${daily_inference_cost * 30:,.2f}")
`,
      expectedOutput: 'One-Time Model Training Cost: $1,500,000.00\nDaily Inference Cost: $2,000.00\n30-Day Inference Cost: $60,000.00',
      explanation: 'High-volume user queries accumulate significant operational inference expenses over time.',
    },
    summary: ['AI compute requires substantial capital investment, high electrical power, and cooling infrastructure for both training and inference.'],
    glossary: [
      { term: 'Inference', definition: 'Executing a trained model to produce predictions on new user input.' },
      { term: 'Power Usage Effectiveness (PUE)', definition: 'A metric comparing total data center energy against energy consumed by IT equipment.' },
    ],
    nextLessonId: 'ai-30',
  },
  {
    id: 'ai-30',
    track: 'ai',
    chapter: 3,
    chapterTitle: 'Chapter 3: How Computers and AI Actually Work',
    order: 30,
    difficulty: 'Beginner',
    title: {
      en: '30. Chapter 3 Project: Simulate a Small AI Workload and Compare Processors',
      bn: '৩০. ৩য় অধ্যায়ের প্রজেক্ট: একটি ক্ষুদ্র AI ওয়ার্কলোড সিমুলেট করে প্রসেসর তুলনা',
    },
    subtitle: {
      en: 'Synthesize computer hardware, VRAM, parallel compute, and processing efficiency.',
      bn: 'সিপিইউ ও জিপিউতে ম্যাট্রিক্স গণনার পারফরম্যান্স টিউন করে ৩য় অধ্যায় শেষ করুন।',
    },
    duration: '25 mins',
    objectives: [
      'Simulate an AI matrix workload on CPU vs GPU architectural models.',
      'Calculate parameters, memory VRAM, and estimated processing latency.',
      'Complete Chapter 3 milestone assessment and earn your Chapter 3 Badge!',
    ],
    prerequisites: 'Lessons 21 to 29 of Chapter 3',
    explanation: {
      simple: {
        en: 'Welcome to the Chapter 3 Capstone! You will simulate how an AI workload travels through bits, memory, and parallel processors, proving why modern AI requires dedicated GPU hardware.',
        bn: '৩য় অধ্যায়ের সমাপ্তি প্রজেক্টে আপনাকে স্বাগতম! সিপিইউ ও জিপিউ-তে এআই প্রসেসিংয়ের সময় ও মেমরি পরীক্ষা করে সার্টিফিকেট অর্জন করুন।',
      },
      analogy: {
        en: 'A crash test simulation tests how a car performs under load. This workload simulation tests how hardware handles millions of numerical matrix operations!',
        bn: 'গাড়ির ক্র্যাশ টেস্টের মতো এখানে হার্ডওয়্যারের সর্বোচ্চ সহনশীলতা পরীক্ষা করা হয়।',
      },
      technical: {
        en: 'Workload Metrics: 1) FLOPs (Floating Point Operations) = 2 * Params * Tokens, 2) VRAM Footprint = Params * Precision + KV Cache, 3) Memory Bandwidth Saturation Rate.',
        bn: 'ওয়ার্কলোড মেট্রিক্স: মোট ফ্লপস, ভি-র‍্যাম মেমরি ও ব্যান্ডউইথ স্যাচুরেশন রেট।',
      },
    },
    misconceptions: [
      {
        misconception: 'Higher parameter count always means a model is faster.',
        correction: 'More parameters increase memory footprint and compute FLOPs, increasing latency unless hardware parallelization is scaled proportionately.',
      },
    ],
    feynmanChallenge: {
      prompt: 'Summarize how bits, VRAM, and GPUs interact when an AI generates a response to a user prompt.',
      modelAnswer: '1. Bits/Bytes: User prompt text is tokenized into numerical binary numbers.\n2. VRAM: Model parameters and weights are loaded into high-speed GPU VRAM.\n3. GPU: Thousands of parallel cores execute matrix math on VRAM data simultaneously to predict the next word!',
      checklist: ['Connected binary bits to tokens.', 'Mentioned VRAM loading.', 'Explained GPU parallel matrix calculation.'],
    },
    quiz: {
      question: 'In your Chapter 3 Hardware Simulation, which factor determines whether a 70B parameter model can run without crashes?',
      options: [
        'The size of the computer’s monitor screen.',
        'Sufficient GPU VRAM capacity to hold the model weights and context KV cache.',
        'The color of the computer case.',
        'The length of the power cord.',
      ],
      correctAnswer: 1,
      explanation: 'Sufficient GPU VRAM capacity is strictly required to hold model parameters and KV cache memory.',
    },
    simulationType: 'chapter3-capstone-demo',
    codeLab: {
      title: 'Chapter 3 Hardware Performance Benchmark',
      language: 'python',
      starterCode: `# Hardware Benchmark Simulator
def benchmark_hardware(params_b, precision_bytes, cores, clock_ghz):
    vram_needed = params_b * precision_bytes * 1.2
    compute_ops = params_b * 2 # 2 FLOPs per param for matrix multiply
    simulated_seconds = compute_ops / (cores * clock_ghz * 0.1)
    return vram_needed, simulated_seconds

cpu_vram, cpu_time = benchmark_hardware(params_b=7, precision_bytes=2, cores=8, clock_ghz=3.5)
gpu_vram, gpu_time = benchmark_hardware(params_b=7, precision_bytes=2, cores=3584, clock_ghz=1.5)

print(f"CPU Config -> VRAM: {cpu_vram:.1f}GB, Estimated Latency: {cpu_time:.2f}s")
print(f"GPU Config -> VRAM: {gpu_vram:.1f}GB, Estimated Latency: {gpu_time:.4f}s")
`,
      expectedOutput: 'CPU Config -> VRAM: 16.8GB, Estimated Latency: 5.00s\nGPU Config -> VRAM: 16.8GB, Estimated Latency: 0.0260s',
      explanation: 'Congratulations! You have successfully completed Chapter 3 of the AI Academy!',
    },
    summary: [
      'Chapter 3 Complete! You understand bits, bytes, CPUs, GPUs, TPUs, and NPUs.',
      'You can calculate VRAM requirements for models (7B = ~14GB FP16).',
      'You understand the Memory Wall and parallel SIMD vector processing.',
      'You know how cloud data centers train massive models across GPU clusters.',
    ],
    glossary: [{ term: 'FLOPs', definition: 'Floating Point Operations per Second: a measure of computer performance.' }],
    nextLessonId: 'ai-31',
  },
];
