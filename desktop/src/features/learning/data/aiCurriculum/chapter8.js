// Chapter 8: Build Real AI Applications (Lessons 71-80)

export const CHAPTER_8_LESSONS = [
  {
    id: 'ai-71',
    track: 'ai',
    chapter: 8,
    chapterTitle: 'Chapter 8: Build Real AI Applications',
    order: 71,
    difficulty: 'Intermediate',
    title: {
      en: '71. Choosing the Right Approach: Rules, Traditional ML, Pretrained Models, or APIs',
      bn: '৭১. সঠিক পদ্ধতি নির্বাচন: রুলস, ট্র্যাডিশনাল এমএল, প্রি-ট্রেইনড মডেল নাকি এপিআই',
    },
    subtitle: {
      en: 'Learn how to select the simplest, most cost-effective architecture for any engineering problem.',
      bn: 'যেকোনো সফটওয়্যার সমস্যায় অযথা এআই ব্যবহার না করে সঠিক ও সাশ্রয়ী প্রযুক্তি নির্বাচনের টেকনিক।',
    },
    duration: '15 mins',
    objectives: [
      'Evaluate whether a problem requires Rule-Based logic, Traditional ML, Pretrained Models, or LLM APIs.',
      'Apply the Principle of Least Complexity in AI software engineering.',
      'Analyze trade-offs in financial cost, maintenance overhead, and latency.',
    ],
    prerequisites: 'Chapter 7 Complete',
    explanation: {
      simple: {
        en: 'Do not use a billion-parameter LLM API to check if an email contains an "@" symbol! Good engineers choose the simplest solution. Rule-based code is free and instant; Traditional ML works for tabular numbers; Pretrained Models solve vision; LLM APIs solve complex natural language.',
        bn: 'সাধারণ ইমেইল ফরম্যাট চেক করতে কোটি টাকার এলএলএম ব্যবহারের প্রয়োজন নেই। রুলস ফ্রি ও দ্রুত, আর জটিল ভাষার টেক্সটের জন্য এপিআই ব্যবহার করা উচিত।',
      },
      analogy: {
        en: 'Choosing your tech approach is like choosing transportation. Walking (Rule-based) is free for 100 meters. A bicycle (ML) is great for 2 miles. A rocket ship (LLM API) is for reaching the moon—do not ignite a rocket to visit your next-door neighbor!',
        bn: 'পাশের বাড়ি যেতে রকেট চালু করার প্রয়োজন নেই; হেঁটে যাওয়াই ভালো। কাজের ধরন বুঝে বাহন বা প্রযুক্তি বেছে নিন।',
      },
      technical: {
        en: 'Decision hierarchy: 1. Deterministic rules (if/else). 2. Tabular statistical ML (XGBoost/LightGBM). 3. Computer Vision domain models (YOLO/ResNet). 4. Zero-shot LLM APIs (GPT-4/Gemini) when unstructured textual reasoning is mandatory.',
        bn: 'সিদ্ধান্তের ধাপ: ডার্টারমিনিস্টিক রুলস -> ট্যাবিউলার XGBoost -> কম্পিউটার ভিশন YOLO -> জিরো শট এলএলএম এপিআই।',
      },
    },
    misconceptions: [
      'Assuming modern AI replaces traditional software engineering logic completely.',
      'Over-engineering simple tasks by throwing expensive generative LLMs at basic database queries.',
    ],
    feynmanChallenge: {
      question: 'When should an engineer prefer traditional XGBoost over an expensive Large Language Model?',
      sampleAnswer: 'When working with structured tabular numbers (e.g. credit card fraud detection on CSV rows) where speed, low cost, and strict tabular statistical metrics matter more than processing natural language text.',
    },
    quiz: [
      {
        question: 'Which solution is best suited for validating whether a user input phone number contains exactly 10 digits?',
        options: [
          'Deterministic regex rule in standard code',
          'Fine-tuning a 70B parameter Transformer',
          'Calling a cloud LLM API',
          'Training a Convolutional Neural Network',
        ],
        correctAnswer: 0,
        explanation: 'Simple validation is deterministic and best solved using regular expressions in basic standard code without any AI overhead.',
      },
    ],
    summary: [
      'Always start with the simplest solution (Rule-based standard code).',
      'Use traditional ML (XGBoost/RandomForest) for structured tabular datasets.',
      'Reserve LLM APIs for complex unstructured text, reasoning, and conversational tasks.',
    ],
    glossary: [
      { term: 'Occam’s Razor in AI', definition: 'The engineering principle stating that the simplest sufficient model architecture should always be chosen.' },
    ],
    nextLessonId: 'ai-72',
  },
  {
    id: 'ai-72',
    track: 'ai',
    chapter: 8,
    chapterTitle: 'Chapter 8: Build Real AI Applications',
    order: 72,
    difficulty: 'Intermediate',
    title: {
      en: '72. Build a Text Classification or Sentiment Analysis Application',
      bn: '৭২. টেক্সট ক্লাসিফিকেশন বা সেন্টিনেন্ট অ্যানালাইসিস অ্যাপ তৈরি',
    },
    subtitle: {
      en: 'Classify user reviews into Positive, Negative, or Neutral sentiment using TF-IDF and Logistic Regression.',
      bn: 'TF-IDF এবং লজিস্টিক রিগ্রেশন ব্যবহার করে কাস্টমার রিভিউ ধনাত্মক নাকি ঋণাত্মক তা শনাক্ত করুন।',
    },
    duration: '20 mins',
    objectives: [
      'Understand TF-IDF (Term Frequency-Inverse Document Frequency) text vectorization.',
      'Train a text classifier using Scikit-Learn LogisticRegression.',
      'Deploy a sentiment analyzer function to process live customer input strings.',
    ],
    prerequisites: 'Lesson 71 Complete',
    explanation: {
      simple: {
        en: 'Sentiment Analysis classifies text as positive, negative, or neutral. TF-IDF turns words into numbers by calculating how important a word is in a document compared to all documents (e.g. "fantastic" signals high positive sentiment).',
        bn: 'সেন্টিনেন্ট অ্যানালাইসিস টেক্সটের মেজাজ (পজিটিভ বা নেগেটিভ) শনাক্ত করে। TF-IDF শব্দকে গাণিতিক গুরুত্বে রূপান্তর করে।',
      },
      analogy: {
        en: 'TF-IDF is like a detective weighing clues. Common words like "the" or "is" carry zero weight. Rare words like "disastrous" or "breathtaking" carry heavy weight to determine the sentiment verdict.',
        bn: 'TF-IDF হলো গোয়েন্দার মতো—সাধারণ শব্দ বাদ দিয়ে গুরুত্বপূর্ণ শব্দগুলোকে বিশেষ গুরুত্ব দিয়ে ফলাফল ঠিক করে।',
      },
      technical: {
        en: 'TF-IDF formula: TF(t,d) * IDF(t, D) = (count of t in d) * log(Total docs D / docs containing t). Vectors feed into Logistic Regression to compute sigmoid probabilities P(y=1|x).',
        bn: 'TF-IDF গাণিতিক সূত্রে সাধারণ শব্দকে ফিল্টার করে ভেক্টরে রূপান্তর করে লজিস্টিক রিগ্রেশনে প্রেডিক্ট করে।',
      },
    },
    misconceptions: [
      'Thinking sentiment analysis requires a massive deep learning GPU server for simple review scoring.',
    ],
    feynmanChallenge: {
      question: 'Why does TF-IDF give a low weight score to common words like "is", "a", and "the"?',
      sampleAnswer: 'Because those words appear in almost every document and carry no distinctive informative clue to differentiate positive sentiment from negative sentiment.',
    },
    codeLab: {
      initialCode: '# Sentiment Analysis Pipeline in Python\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.linear_model import LogisticRegression\n\n# Sample dataset\nreviews = ["This product is fantastic and fast!", "Terrible quality, broken item.", "Amazing customer support!"]\nlabels = [1, 0, 1]  # 1: Positive, 0: Negative\n\n# Vectorize\nvectorizer = TfidfVectorizer()\nX = vectorizer.fit_transform(reviews)\n\n# Train model\nclf = LogisticRegression()\nclf.fit(X, labels)\n\n# Predict new sample\ntest_review = vectorizer.transform(["Very fast delivery, I love it!"])\npred = clf.predict(test_review)\nprint("Predicted Sentiment:", "POSITIVE" if pred[0] == 1 else "NEGATIVE")\n',
      expectedOutput: 'Predicted Sentiment: POSITIVE',
      explanation: 'Your trained TF-IDF Logistic Regression pipeline correctly classified the unseen review!',
    },
    quiz: [
      {
        question: 'What does IDF stand for in TF-IDF text processing?',
        options: [
          'Inverse Document Frequency',
          'Internal Data Format',
          'Integrated Deep Feature',
          'Interactive Diagram Function',
        ],
        correctAnswer: 0,
        explanation: 'IDF stands for Inverse Document Frequency, which diminishes the weight of terms that occur very frequently in the document set.',
      },
    ],
    summary: [
      'TF-IDF converts text documents into numerical feature vectors.',
      'Logistic Regression fits hyperplanes to separate positive and negative classes.',
      'Extremely fast and lightweight for customer feedback categorization.',
    ],
    glossary: [
      { term: 'TF-IDF', definition: 'Numerical statistic reflecting how important a word is to a document in a collection or corpus.' },
      { term: 'Sentiment Analysis', definition: 'The process of computationally identifying and categorizing opinions expressed in text.' },
    ],
    nextLessonId: 'ai-73',
  },
  {
    id: 'ai-73',
    track: 'ai',
    chapter: 8,
    chapterTitle: 'Chapter 8: Build Real AI Applications',
    order: 73,
    difficulty: 'Intermediate',
    title: {
      en: '73. Build a Simple Image Classification Application',
      bn: '৭৩. ইমেজ ক্লাসিফিকেশন অ্যাপ তৈরি',
    },
    subtitle: {
      en: 'Use transfer learning with MobileNet to classify images directly in Python or the browser.',
      bn: 'মোবাইলনেট প্রি-ট্রেইনড মডেল দিয়ে ছবি চেনার অ্যাপ বানানোর উপায়।',
    },
    duration: '20 mins',
    objectives: [
      'Understand Image Classification pipeline: Image input -> Preprocessing -> Model -> Top-K Probabilities.',
      'Utilize Transfer Learning using lightweight architectures like MobileNet.',
      'Perform inference on sample image pixels to classify target objects.',
    ],
    prerequisites: 'Lesson 72 Complete',
    explanation: {
      simple: {
        en: 'Instead of training a vision model for weeks on millions of images, Transfer Learning lets us take a model that already knows shapes and colors (like MobileNet) and use it instantly to identify objects in new photos!',
        bn: 'ট্রান্সফার লার্নিংয়ের মাধ্যমে আগে থেকেই ট্রেইন করা মোবাইলনেট ব্যবহার করে মুহূর্তেই ছবি চেনা সম্ভব।',
      },
      analogy: {
        en: 'Transfer learning is like hiring an experienced chef who already knows how to chop vegetables and use knives. You only need to teach them 1 new regional recipe rather than sending them to culinary school for 4 years!',
        bn: 'ট্রান্সফার লার্নিং হলো অভিজ্ঞতা থাকা রাঁধুনীকে সরাসরি একটি নতুন রেসিপি তৈরি করতে দেওয়ার মতো।',
      },
      technical: {
        en: 'Transfer Learning freezes feature extractor layers (Convolutional backbone trained on ImageNet) and replaces only the final dense classification head with softmax outputs for new target categories.',
        bn: 'কনভোলিউশনাল ব্যাকবোনকে ফ্রিজ করে কেবল শেষ সফটম্যাক্স লেয়ার আপডেট করে নতুন শ্রেণিতে ক্লাসিফাই করা হয়।',
      },
    },
    misconceptions: [
      'Believing you must gather 1,000,000 images to build a working image classifier from scratch.',
    ],
    feynmanChallenge: {
      question: 'What is the main advantage of Transfer Learning when building an image classification app with small datasets?',
      sampleAnswer: 'Transfer Learning reuses rich visual feature representations (edges, textures, shapes) already learned from millions of general images, requiring only a tiny dataset to fine-tune high accuracy.',
    },
    codeLab: {
      initialCode: '# Transfer Learning Image Classification pipeline logic concept\nimport numpy as np\n\ndef classify_image_features(features):\n    # Simulated pretrained MobileNet output vector\n    classes = ["Cat", "Dog", "Car", "Airplane"]\n    probs = [0.02, 0.94, 0.03, 0.01]\n    top_idx = np.argmax(probs)\n    return classes[top_idx], probs[top_idx]\n\nlabel, confidence = classify_image_features(None)\nprint(f"Top Prediction: {label} ({confidence * 100:.1f}% confidence)")\n',
      expectedOutput: 'Top Prediction: Dog (94.0% confidence)',
      explanation: 'Pretrained MobileNet outputs softmax probability scores across thousands of object classes.',
    },
    quiz: [
      {
        question: 'What technique reuses feature extractors from a model trained on a huge dataset to solve a new task?',
        options: ['Transfer Learning', 'Linear Regression', 'Overfitting', 'Data Deduplication'],
        correctAnswer: 0,
        explanation: 'Transfer Learning repurposes pretrained weights to achieve high accuracy on new tasks with minimal training time.',
      },
    ],
    summary: [
      'MobileNet provides fast, lightweight vision classification for mobile and web.',
      'Transfer Learning eliminates the need to train visual feature detectors from scratch.',
      'Softmax output layers produce probability distributions across predicted classes.',
    ],
    glossary: [
      { term: 'Transfer Learning', definition: 'ML technique where a model developed for a task is reused as the starting point for a model on a second task.' },
      { term: 'Softmax', definition: 'Activation function converting a vector of numbers into a normalized probability distribution summing to 1.' },
    ],
    nextLessonId: 'ai-74',
  },
  {
    id: 'ai-74',
    track: 'ai',
    chapter: 8,
    chapterTitle: 'Chapter 8: Build Real AI Applications',
    order: 74,
    difficulty: 'Intermediate',
    title: {
      en: '74. Understanding Computer Vision: Pixels, Features, CNNs, and Vision Transformers',
      bn: '৭৪. কম্পিউটার ভিশন বোঝা: পিক্সেল, ফিচার, সিএনএন এবং ভিশন ট্র্যান্সফরমার',
    },
    subtitle: {
      en: 'Discover how computers see images—from 2D RGB pixel grids to Convolutional filters and Patch-based ViTs.',
      bn: 'কম্পিউটার কীভাবে ছবি দেখে—পিক্সেল গ্রিড থেকে কনভোলিউশনাল ফিল্টার এবং ভিশন ট্র্যান্সফরমার।',
    },
    duration: '20 mins',
    objectives: [
      'Understand how 2D images are stored as 3D tensors (Height x Width x RGB Channels).',
      'Explain Convolutional Neural Networks (CNN) sliding filters, kernel operations, and Pooling.',
      'Compare Convolutional networks with modern Vision Transformers (ViT) patch tokenization.',
    ],
    prerequisites: 'Lesson 73 Complete',
    explanation: {
      simple: {
        en: 'To a computer, an image is just a grid of numbers from 0 to 255 representing Red, Green, and Blue brightness. CNNs slide small 3x3 filter boxes across pixels to detect lines, corners, and eyes. Vision Transformers break images into puzzle pieces (patches) and process them like sentences!',
        bn: 'কম্পিউটারের কাছে ছবি হলো ০-২৫৫ সংখ্যার পিক্সেল গ্রিড। সিএনএন ফিল্টার দিয়ে লাইন বা কোণা খোঁজে, আর ভিশন ট্র্যান্সফরমার ছবিকে টুকরো করে দেখে।',
      },
      analogy: {
        en: 'CNN feature extraction is like inspecting a painting through a magnifying glass moving inch by inch. Vision Transformer (ViT) is like slicing the painting into 16 square jigsaw pieces and observing how all pieces relate to each other simultaneously.',
        bn: 'সিএনএন হলো ম্যাগনিফাইং গ্লাস দিয়ে ইঞ্চি ইঞ্চি করে দেখার মতো, আর ভিশন ট্র্যান্সফরমার হলো পাজল জিকস টুকরো মিলিয়ে দেখার মতো।',
      },
      technical: {
        en: 'CNN: Convolution layer computes cross-correlation with kernels (W * X + b), MaxPool downsamples spatial dimensions. ViT: Reshapes image X into flattened 2D patches, projects via linear embedding layer, and applies self-attention.',
        bn: 'CNN ফিল্টার কার্নেল দিয়ে কাজ করে; ViT ছবিকে প্যাচে রূপান্তর করে সেলফ-এটেনশন অ্যাপ্লাই করে।',
      },
    },
    misconceptions: [
      'Thinking computers perceive colors and objects conceptually rather than processing numeric 3D pixel matrices.',
    ],
    feynmanChallenge: {
      question: 'What is the structural difference in how a CNN and a Vision Transformer process an input photo?',
      sampleAnswer: 'A CNN slides small local convolutional filter kernels across adjacent pixels step-by-step, while a Vision Transformer splits the photo into non-overlapping patches and processes global relationships using self-attention.',
    },
    quiz: [
      {
        question: 'How does a Vision Transformer (ViT) divide an input image before processing?',
        options: [
          'Into non-overlapping square patches treated like token words',
          'Into audio soundwaves',
          'Into 1D string text characters',
          'Into a single giant scalar number',
        ],
        correctAnswer: 0,
        explanation: 'ViT splits images into regular grid patches (e.g. 16x16 pixels) and projects them as tokens into transformer blocks.',
      },
    ],
    summary: [
      'Images are 3D tensors (Height, Width, Color Channels RGB).',
      'CNN filters extract hierarchical visual features (edges -> textures -> shapes -> objects).',
      'Vision Transformers (ViT) use patch tokenization and self-attention for vision tasks.',
    ],
    glossary: [
      { term: 'Kernel / Filter', definition: 'A small matrix slid over input pixel data to perform feature extraction convolutions.' },
      { term: 'Vision Transformer (ViT)', definition: 'Transformer architecture adapted directly for computer vision patch processing.' },
    ],
    nextLessonId: 'ai-75',
  },
  {
    id: 'ai-75',
    track: 'ai',
    chapter: 8,
    chapterTitle: 'Chapter 8: Build Real AI Applications',
    order: 75,
    difficulty: 'Intermediate',
    title: {
      en: '75. Understanding Speech AI: Speech Recognition, Audio Generation, and Voice Interfaces',
      bn: '৭৫. স্পিচ এআই: স্পিচ রিকগনিশন, অডিও জেনারেশন এবং ভয়েস ইন্টারফেস',
    },
    subtitle: {
      en: 'Convert continuous audio waveforms into Spectrograms, Speech-to-Text (Whisper), and Text-to-Speech synthesis.',
      bn: 'শব্দ তরঙ্গকে স্পেকট্রোগ্রামে রূপান্তর, ভয়েস টু টেক্সট (উইস্পার) এবং টেক্সট টু স্পিচ শেখা।',
    },
    duration: '20 mins',
    objectives: [
      'Understand audio digital representation: Sampling Rate (e.g. 16kHz) and Waveforms.',
      'Explain Spectrogram transformation via Fourier Transform (STFT).',
      'Master Speech-to-Text (Whisper STT) and Text-to-Speech (TTS) voice agent pipelines.',
    ],
    prerequisites: 'Lesson 74 Complete',
    explanation: {
      simple: {
        en: 'Sound travels as air waves! Computers sample air pressure thousands of times per second (e.g. 16,000 Hz). By running a Fourier Transform, we turn audio into a visual picture called a Spectrogram. Models like OpenAI Whisper look at this audio picture and write out words!',
        bn: 'শব্দ হলো বাতাসের তরঙ্গ। স্পেকট্রোগ্রামের মাধ্যমে শব্দকে ভিজ্যুয়াল ছবিতে বদলে উইস্পার এআই টেক্সট তৈরি করে।',
      },
      analogy: {
        en: 'A Spectrogram is like a sheet of musical notation paper. High notes are drawn at the top, low bass notes at the bottom, and loudness is represented by how brightly colored the notes shine.',
        bn: 'স্পেকট্রোগ্রাম হলো মিউজিক্যাল শিটের মতো—উপরে হাই নোট আর নিচে লো নোটের রঙিন ছবি দেখায়।',
      },
      technical: {
        en: 'Audio signals undergo Short-Time Fourier Transform (STFT) producing Log-Mel Spectrogram 2D representations. Encoder-decoder Transformers (e.g. Whisper) process log-mel spectrogram features to output autoregressive text tokens.',
        bn: 'STFT দ্বারা Log-Mel Spectrogram তৈরি করে এনকোডার-ডিকোডার ট্র্যান্সফরমার অডিও ফাইল থেকে টেক্সট প্রেডিক্ট করে।',
      },
    },
    misconceptions: [
      'Thinking Speech-to-Text reads sound files as single continuous MP3 streams without time slicing and spectrogram conversion.',
    ],
    feynmanChallenge: {
      question: 'What is a Spectrogram and why is it useful for Speech AI models?',
      sampleAnswer: 'A Spectrogram is a visual 2D representation of audio frequency over time, allowing AI vision/transformer architectures to process sound as visual input matrices.',
    },
    quiz: [
      {
        question: 'Which OpenAI open-source model is widely celebrated for state-of-the-art Speech-to-Text (STT) transcription?',
        options: ['Whisper', 'DALL-E', 'CLIP', 'Sora'],
        correctAnswer: 0,
        explanation: 'Whisper is a multilingual automatic speech recognition (ASR) model trained on 680,000 hours of audio data.',
      },
    ],
    summary: [
      'Digital audio is sampled continuously (kHz sample rate).',
      'Spectrograms transform raw waveforms into time-frequency visual matrices.',
      'Voice interfaces combine Speech-to-Text (STT), LLM reasoning, and Text-to-Speech (TTS).',
    ],
    glossary: [
      { term: 'Spectrogram', definition: 'A visual representation of the spectrum of frequencies of a signal as it varies with time.' },
      { term: 'STT / TTS', definition: 'Speech-to-Text (transcription) and Text-to-Speech (audio synthesis).' },
    ],
    nextLessonId: 'ai-76',
  },
  {
    id: 'ai-76',
    track: 'ai',
    chapter: 8,
    chapterTitle: 'Chapter 8: Build Real AI Applications',
    order: 76,
    difficulty: 'Intermediate',
    title: {
      en: '76. Multimodal AI: Working With Text, Images, Audio, and Video',
      bn: '৭৬. মাল্টিমোডাল এআই: টেক্সট, ছবি, অডিও ও ভিডিও একত্রে ব্যবহার',
    },
    subtitle: {
      en: 'Explore unified vector spaces (CLIP) and Native Multimodal LLMs (GPT-4o, Gemini 1.5 Pro).',
      bn: 'একই ভেক্টর স্পেসে টেক্সট, ছবি ও অডিও একত্রে প্রসেস করার আধুনিক মাল্টিমোডাল এআই প্রযুক্তি।',
    },
    duration: '20 mins',
    objectives: [
      'Define Multimodal AI systems that natively process heterogeneous inputs simultaneously.',
      'Understand CLIP (Contrastive Language-Image Pre-training) joint embedding spaces.',
      'Analyze how Vision-Language LLMs reason across image pixels and text prompts simultaneously.',
    ],
    prerequisites: 'Lesson 75 Complete',
    explanation: {
      simple: {
        en: 'Early AI models could only do one thing—either read text OR classify photos. Multimodal AI (like GPT-4o or Gemini) accepts text, photos, voice notes, and videos all at once in a single conversation!',
        bn: 'মাল্টিমোডাল এআই একসঙ্গে টেক্সট, ছবি, অডিও ও ভিডিও প্রসেস করতে পারে।',
      },
      analogy: {
        en: 'Unimodal AI is like a blindfolded person who can only listen to voice commands. Multimodal AI is like a person who can see with eyes, hear with ears, and speak with voice all integrated into one brain!',
        bn: 'মাল্টিমোডাল এআই এমন একজন মানুষের মতো যে একসঙ্গে চোখ দিয়ে দেখে, কান দিয়ে শুনে এবং কথা বলে।',
      },
      technical: {
        en: 'CLIP aligns image encoder outputs E_I(x) and text encoder outputs E_T(y) in a shared embedding space using cosine similarity contrastive loss. Native multimodal LLMs project visual token embeddings into LLM token space.',
        bn: 'CLIP একই জাবাইনড ভেক্টর স্পেসে ইমেজ ও টেক্সট এনকোড করে কোসাইন সিমিলারিটি নির্ণয় করে।',
      },
    },
    misconceptions: [
      'Assuming Multimodal AI uses separate independent models glued together with standard text scripts (Native models process visual patches as LLM tokens).',
    ],
    feynmanChallenge: {
      question: 'How does CLIP bridge the gap between image pixels and human text descriptions?',
      sampleAnswer: 'CLIP trains an image encoder and text encoder together on millions of (image, text) pairs, pulling matching image and text embeddings close together in a shared vector space.',
    },
    quiz: [
      {
        question: 'Which model introduced joint contrastive learning to project images and text into a shared vector space?',
        options: ['CLIP', 'BERT', 'ResNet50', 'Word2Vec'],
        correctAnswer: 0,
        explanation: 'CLIP (Contrastive Language-Image Pre-training) projects images and text into a unified embedding space.',
      },
    ],
    summary: [
      'Multimodal AI handles text, vision, audio, and video inputs natively.',
      'Shared embedding spaces (CLIP) enable searching photos using natural language text prompts.',
      'Native multimodal LLMs treat image patch tokens alongside text tokens.',
    ],
    glossary: [
      { term: 'CLIP', definition: 'OpenAI architecture mapping images and text into a shared embedding space.' },
      { term: 'Multimodal', definition: 'Ability to understand and process multiple sensory data modalities simultaneously.' },
    ],
    nextLessonId: 'ai-77',
  },
  {
    id: 'ai-77',
    track: 'ai',
    chapter: 8,
    chapterTitle: 'Chapter 8: Build Real AI Applications',
    order: 77,
    difficulty: 'Intermediate',
    title: {
      en: '77. Build a Question-Answering Chatbot Using an AI API',
      bn: '৭৭. এআই এপিআই দিয়ে প্রশ্ন-উত্তরের চ্যাটবট তৈরি',
    },
    subtitle: {
      en: 'Construct a stateful conversational chatbot with message history arrays using Node.js or Python.',
      bn: 'মেসেজ হিস্ট্রি সেশন মেইনটেইন করে প্রশ্ন-উত্তরের চ্যাটবট বানানোর প্র্যাকটিক্যাল কোডিং।',
    },
    duration: '20 mins',
    objectives: [
      'Implement the standard OpenAI / Gemini Chat Completion request payload schema.',
      'Manage conversation message history arrays ([{role: "system"}, {role: "user"}, {role: "assistant"}]).',
      'Handle API environment variables securely without exposing secrets in client code.',
    ],
    prerequisites: 'Lesson 76 Complete',
    explanation: {
      simple: {
        en: 'LLM APIs are stateless—they forget previous messages the instant a request finishes! To build a continuous chatbot, your app must store the conversation history array and send all past messages back to the API on every new question.',
        bn: 'এপিআই নতুন রিকুয়েস্টে আগের কথা ভুলে যায়। তাই চ্যাটবট সেশনে সব আগের কথা অ্যারে বানিয়ে নতুন রিকুয়েস্টে পাঠাতে হয়।',
      },
      analogy: {
        en: 'Stateless API calls are like goldfish memory. Every time you ask a question, you must hand the goldfish a small transcript booklet of everything you talked about earlier so it remembers the conversation context!',
        bn: 'এপিআই মেমোরি হলো নতুন করে স্ক্রিপ্ট পড়ে নেওয়ার মতো—প্রতিবার পুরো চ্যাট হিস্ট্রি সাথে দিয়ে পাঠাতে হয়।',
      },
      technical: {
        en: 'Stateful conversation loop maintains messages: Array<{role: "system"|"user"|"assistant", content: string}>. Append new user prompt -> Call API -> Append returned assistant response to history buffer.',
        bn: 'মেসেজ অ্যারে বাফার (system, user, assistant) রোল দিয়ে প্রতিবার হরাইজনে সেন্ড করা হয়।',
      },
    },
    misconceptions: [
      'Embedding secret API keys directly inside front-end React or HTML code files.',
      'Expecting the server API to magically remember context without passing message history array.',
    ],
    feynmanChallenge: {
      question: 'Why must a developer resend previous conversation messages to the Chat Completion API on every turn?',
      sampleAnswer: 'Because LLM API endpoints are stateless services that do not store session context on cloud servers between independent HTTP requests.',
    },
    codeLab: {
      initialCode: '# Stateful Chatbot Loop simulation in Python\nconversation_history = [\n    {"role": "system", "content": "You are a helpful AI tutor."}\n]\n\ndef chat(user_message):\n    # 1. Append user prompt\n    conversation_history.append({"role": "user", "content": user_message})\n    \n    # 2. Simulate API Call response using full history\n    bot_reply = f"I received your question about \'{user_message}\'. Here is your answer!"\n    \n    # 3. Append bot reply\n    conversation_history.append({"role": "assistant", "content": bot_reply})\n    return bot_reply\n\nprint(chat("What is a Neural Network?"))\nprint(chat("Give me an analogy for it."))\nprint("History length:", len(conversation_history))\n',
      expectedOutput: "I received your question about 'What is a Neural Network?'. Here is your answer!\nI received your question about 'Give me an analogy for it.'. Here is your answer!\nHistory length: 5",
      explanation: 'Notice how history stores system, user, and assistant turns to preserve complete conversation memory!',
    },
    quiz: [
      {
        question: 'Which message role in Chat Completion API payloads sets the overall behavioral persona for the chatbot?',
        options: ['system', 'user', 'assistant', 'admin'],
        correctAnswer: 0,
        explanation: 'The "system" role prompt defines instructions, tone, constraints, and persona for the AI model.',
      },
    ],
    summary: [
      'Chat APIs require passing complete message history arrays for continuous context.',
      'Roles include `system` (behavioral rules), `user` (prompt), and `assistant` (AI response).',
      'Never expose API keys in frontend code; proxy API calls through a secure backend server.',
    ],
    glossary: [
      { term: 'Stateless API', definition: 'An architecture where each request is executed independently without saving client session state on the server.' },
      { term: 'System Prompt', definition: 'Initial instructions configuring persona and safety guardrails for an LLM.' },
    ],
    nextLessonId: 'ai-78',
  },
  {
    id: 'ai-78',
    track: 'ai',
    chapter: 8,
    chapterTitle: 'Chapter 8: Build Real AI Applications',
    order: 78,
    difficulty: 'Intermediate',
    title: {
      en: '78. Retrieval-Augmented Generation (RAG): Connecting AI to External Documents',
      bn: '৭৮. রিট্রিভাল-অগমেন্টেড জেনারেশন (RAG): নিজস্ব ডকুমেন্টের সাথে এআই যুক্ত করা',
    },
    subtitle: {
      en: 'Prevent hallucinations and query private PDFs using Chunking, Embeddings, Vector Databases, and LLM Context Injection.',
      bn: 'প্রাইভেট পিডিএফ বা নথি ভেক্টর ডাটাবেসে সেভ করে সঠিক তথ্য রিট্রিভ করে উত্তর পাওয়ার কৌশল।',
    },
    duration: '25 mins',
    objectives: [
      'Understand the RAG Architecture pipeline: Load PDF -> Chunking -> Vector Embedding -> Vector DB Store -> Semantic Query -> LLM Context Prompt -> Answer.',
      'Explain Vector Databases (Pinecone, ChromaDB, PGVector) for Nearest-Neighbor search.',
      'Differentiate fine-tuning model weights from injecting retrieved context into prompt context windows.',
    ],
    prerequisites: 'Lesson 77 Complete',
    explanation: {
      simple: {
        en: 'LLMs do not know about your private company files or news from yesterday. RAG solves this! When a user asks a question, RAG searches a Vector Database for relevant snippets from your PDFs, attaches those snippets into the prompt, and asks the LLM to write an accurate answer based ONLY on those facts.',
        bn: 'RAG টেকনিক আপনার প্রাইভেট পিডিএফ ফাইল থেকে সঠিক অংশ রিট্রিভ করে এলএলএম প্রম্পটে যুক্ত করে নির্ভুল উত্তর বানিয়ে দেয়।',
      },
      analogy: {
        en: 'RAG is like an open-book exam! Instead of forcing a student to memorize a 1,000-page medical manual (fine-tuning), a librarian assistant hands them the exact 2 relevant pages (retrieval) so they can write an accurate exam answer.',
        bn: 'RAG হলো ওপেন বুক পরীক্ষার মতো—পুরো বই মুখস্থ করার বদলে লাইব্রেরিয়ান সঠিক ২ পৃষ্ঠা এনে দেয়।',
      },
      technical: {
        en: 'RAG chunks text into overlapping passages (e.g. 512 tokens), embeds via embedding model (e.g. text-embedding-3-small) into a Vector DB. User query embedding finds top-K cosine similarity chunks, formatted into prompt context.',
        bn: 'টেক্সটকে চাঙ্ক করে ভেক্টর ডাটাবেসে রাখে এবং কোসাইন সিমিলারিটি দিয়ে শীর্ষ K চাঙ্ক খুঁজে প্রম্পটে ইঞ্জেক্ট করে।',
      },
    },
    misconceptions: [
      'Assuming RAG automatically retrains or updates the underlying LLM model parameter weights.',
      'Chunking documents into massive 10,000-word blocks, which dilutes vector embedding search quality.',
    ],
    feynmanChallenge: {
      question: 'Explain why RAG is preferred over fine-tuning when an application needs to reference rapidly changing daily company policy documents.',
      sampleAnswer: 'RAG updates instantly by adding/deleting text embeddings in a Vector Database without expensive GPU model retraining, while ensuring zero-hallucination citations.',
    },
    codeLab: {
      initialCode: '# Simulated RAG Pipeline Flow\ndef dummy_vector_search(query):\n    # Simulate finding top document snippet\n    return "PDF Snippet: Company refund policy allows returns within 30 days with receipt."\n\ndef rag_answer(query):\n    context = dummy_vector_search(query)\n    prompt = f"Answer question based ONLY on context:\\nContext: {context}\\nQuestion: {query}"\n    # Pass prompt to LLM\n    return f"LLM Output generated using injected context: Returns allowed within 30 days with receipt."\n\nprint(rag_answer("What is the return policy?"))\n',
      expectedOutput: 'LLM Output generated using injected context: Returns allowed within 30 days with receipt.',
      explanation: 'RAG dynamically injects relevant retrieved document context into the LLM prompt to deliver factual answers.',
    },
    quiz: [
      {
        question: 'Which component in a RAG pipeline performs fast semantic vector similarity searches to retrieve matching text chunks?',
        options: ['Vector Database', 'CPU Fan', 'Hard Disk Defrag', 'Graphics Shader'],
        correctAnswer: 0,
        explanation: 'Vector Databases (e.g. Pinecone, Chroma, PGVector) store numerical embeddings and execute high-speed nearest-neighbor similarity searches.',
      },
    ],
    summary: [
      'RAG connects LLMs to external, private, and up-to-date document databases.',
      'Steps: Chunking -> Vector Embedding -> Nearest-Neighbor Retrieval -> LLM Context Generation.',
      'Eliminates hallucinations by grounding responses in retrieved source citations.',
    ],
    glossary: [
      { term: 'RAG', definition: 'Retrieval-Augmented Generation: framework enhancing LLMs with external data retrieval.' },
      { term: 'Vector DB', definition: 'Database designed specifically for storing and searching high-dimensional vector embeddings.' },
    ],
    nextLessonId: 'ai-79',
  },
  {
    id: 'ai-79',
    track: 'ai',
    chapter: 8,
    chapterTitle: 'Chapter 8: Build Real AI Applications',
    order: 79,
    difficulty: 'Intermediate',
    title: {
      en: '79. AI Agents, Tools, Workflows, and When Automation Is Appropriate',
      bn: '৭৯. এআই এজেন্ট, টুলস, ওয়ার্কফ্লো এবং অটোমেশনের সঠিক প্রয়োগ',
    },
    subtitle: {
      en: 'Understand Function Calling, ReAct loops (Reasoning + Acting), autonomous planning, and safety guardrails.',
      bn: 'ফাংশন কলিং, রিঅ্যাক্ট লুপ (ReAct) এবং নিরাপত্তার সাথে অটোমেটেড কাজ করার এজেন্ট তৈরি।',
    },
    duration: '20 mins',
    objectives: [
      'Define AI Agents as LLM reasoning engines equipped with external API execution Tools.',
      'Understand the ReAct pattern: Thought -> Action -> Observation loop.',
      'Evaluate agentic risks, permission boundaries, human-in-the-loop validation, and infinite loop bugs.',
    ],
    prerequisites: 'Lesson 78 Complete',
    explanation: {
      simple: {
        en: 'An AI Agent is an LLM given tools (like web search, calculator, database query, or email sender). Instead of just talking, the agent can think: "I need to check the weather, so I will invoke the Weather Tool, read the result, and then reply!"',
        bn: 'এআই এজেন্ট হলো এমন মডেল যার হাতে টুলস (সার্চ, ক্যালকুলেটর, মেইল) দেওয়া থাকে এবং নিজে চিন্তা করে কাজ সম্পন্ন করে।',
      },
      analogy: {
        en: 'A standard LLM is a smart consultant locked in a room who can only talk. An AI Agent is a manager with a laptop, telephone, and bank card who can actually place orders and execute tasks in the real world!',
        bn: 'এআই এজেন্ট হলো ল্যাপটপ ও ফোন হাতে থাকা ম্যানেজার যে নির্দেশ পেয়ে সরাসরি কাজ সম্পন্ন করতে পারে।',
      },
      technical: {
        en: 'Function Calling provides JSON Schema tool signatures to the LLM. If the model emits a tool_calls payload, the client backend executes the native function, appends tool output as an "observation" role, and re-invokes the LLM.',
        bn: 'ফাংশন কলিং এপিআই স্কিমা দিলে মডেল টুল ব্যবহারের সংকেত পাঠায় এবং ব্যাকএন্ড তা এক্সিকিউট করে উত্তর দেয়।',
      },
    },
    misconceptions: [
      'Giving AI agents unrestricted execution permissions (e.g. DELETE database rights or unlimited financial transfers) without human verification guardrails.',
    ],
    feynmanChallenge: {
      question: 'Describe the three steps of the ReAct (Reason + Act) Agent execution loop.',
      sampleAnswer: '1. Thought: The LLM decides what action is needed. 2. Action: The LLM calls a specific tool API. 3. Observation: The tool result is fed back into the LLM context to plan the next step.',
    },
    codeLab: {
      initialCode: '# AI Function Calling tool schema simulation\ntools = [\n    {\n        "name": "get_stock_price",\n        "description": "Fetches real-time stock ticker price",\n        "parameters": {"type": "object", "properties": {"ticker": {"type": "string"}}}\n    }\n]\n\ndef execute_agent(prompt):\n    print(f"User Prompt: {prompt}")\n    print("Agent Thought: User wants stock price. Calling get_stock_price(AAPL)...")\n    # Simulated tool execution\n    tool_output = "$225.50"\n    print(f"Tool Observation: {tool_output}")\n    return f"Final Answer: The current price of AAPL is {tool_output}."\n\nprint(execute_agent("What is Apple stock price?"))\n',
      expectedOutput: "User Prompt: What is Apple stock price?\nAgent Thought: User wants stock price. Calling get_stock_price('AAPL')...\nTool Observation: $225.50\nFinal Answer: The current price of AAPL is $225.50.",
      explanation: 'Agents combine reasoning with tool execution observations to complete real-world tasks.',
    },
    quiz: [
      {
        question: 'What execution pattern combines Thought, Action execution, and Observation feeding back to the model?',
        options: ['ReAct Pattern', 'Overfitting Loop', 'Gradient Descent', 'Binary Search'],
        correctAnswer: 0,
        explanation: 'The ReAct (Reasoning and Acting) pattern enables LLM agents to solve complex multi-step tasks dynamically.',
      },
    ],
    summary: [
      'Agents extend LLMs with external tools (APIs, search engines, code interpreters).',
      'Function Calling allows models to output structured JSON tool execution requests.',
      'Always enforce human-in-the-loop safeguards for high-stakes actions.',
    ],
    glossary: [
      { term: 'AI Agent', definition: 'An autonomous entity driven by an LLM that perceives its environment and takes actions using tools.' },
      { term: 'Function Calling', definition: 'Feature enabling LLMs to return JSON structured data matching specified tool signatures.' },
    ],
    nextLessonId: 'ai-80',
  },
  {
    id: 'ai-80',
    track: 'ai',
    chapter: 8,
    chapterTitle: 'Chapter 8: Build Real AI Applications',
    order: 80,
    difficulty: 'Intermediate',
    title: {
      en: '80. Capstone Project: Build a Useful AI Application With a Frontend and Backend',
      bn: '৮০. ক্যাপস্টোন প্রজেক্ট: ফ্রন্টএন্ড ও ব্যাকএন্ডসহ সম্পূর্ণ এআই অ্যাপ্লিকেশন',
    },
    subtitle: {
      en: 'Integrate a responsive React UI, secure Express/Python API proxy server, rate-limiting, and LLM text generation.',
      bn: 'রিঅ্যাক্ট ফ্রন্টএন্ড এবং এক্সপ্রেস ব্যাকএন্ড যুক্ত করে আসল এআই অ্যাপ তৈরির সম্পূর্ণ টিউটোরিয়াল।',
    },
    duration: '30 mins',
    objectives: [
      'Architect a full-stack AI web application (React Frontend -> Node.js Backend -> Cloud AI API).',
      'Enforce security best practices: hide API keys, implement rate limiting, and validate inputs.',
      'Build loading spinners, error boundaries, and stream tokens to the user interface.',
    ],
    prerequisites: 'Lessons 71-79 Complete',
    explanation: {
      simple: {
        en: 'In this chapter capstone, you will tie everything together! Build a clean web application where users type prompts in a front-end UI. The front-end calls your secure backend server, which attaches hidden API keys, queries the AI model, and streams back answer tokens.',
        bn: 'এই ক্যাপস্টোন প্রজেক্টে আপনারা ফ্রন্টএন্ড ইউআই থেকে ব্যাকএন্ড এপিআই সার্ভার হয়ে ক্লাউড এআই মডেলের সাথে কানেক্ট করার ফুলস্ট্যাক মেকানিজম শিখবেন।',
      },
      analogy: {
        en: 'Building a full-stack AI app is like running a restaurant. The React UI is the dining table menu, your Node.js backend is the waiter passing orders securely, and the cloud AI API is the chef in the kitchen!',
        bn: 'ফুলস্ট্যাক এআই অ্যাপ হলো রেস্তোরাঁর মতো—রিঅ্যাক্ট ইউআই মেনু কার্ড, ব্যাকএন্ড ওয়েটার এবং ক্লাউড এআই এপিআই হলো শেফ।',
      },
      technical: {
        en: 'Architecture: Client sends POST /api/generate with JWT auth header -> Backend validates rate-limit budget -> Backend invokes OpenAI SDK with process.env.OPENAI_API_KEY -> Responds with Server-Sent Events (SSE) token stream.',
        bn: 'রিঅ্যাক্ট ফ্রন্টএন্ড JWT ব্যাকএন্ডে পাঠায়, ব্যাকএন্ড API KEY ভ্যালিডেট করে SSE টোকেন স্ট্রিমিং ইউআইতে রিফ্লেক্ট করে।',
      },
    },
    misconceptions: [
      'Calling AI APIs directly from client-side JavaScript bundle files.',
      'Omitting rate limiting on backend endpoints, allowing bad actors to drain your cloud API account balance.',
    ],
    feynmanChallenge: {
      question: 'Why is a backend proxy server mandatory when deploying a production React AI app to public users?',
      sampleAnswer: 'To securely protect secret API keys from being stolen in browser network inspector tools and to enforce user authentication, input validation, and rate limiting.',
    },
    codeLab: {
      initialCode: '# Complete Full-Stack AI App Architecture Flow Simulation\nclass AIBackendServer:\n    def __init__(self):\n        self.api_key = "SECRET_SERVER_ENV_KEY_12345"\n    \n    def handle_request(self, user_jwt, prompt):\n        # 1. Validate auth & rate limit\n        if not user_jwt:\n            return {"status": 401, "error": "Unauthorized"}\n        \n        # 2. Call AI API securely\n        response_text = f"AI Generated summary for input: \'{prompt}\'"\n        return {"status": 200, "data": response_text}\n\nserver = AIBackendServer()\nresult = server.handle_request(user_jwt="valid_token", prompt="Summarize Chapter 8")\nprint("Client Received:", result)\n',
      expectedOutput: "Client Received: {'status': 200, 'data': \"AI Generated summary for input: 'Summarize Chapter 8'\"}",
      explanation: 'Congratulations! You mastered full-stack secure AI application integration!',
    },
    quiz: [
      {
        question: 'Which technology protocol enables web servers to stream live LLM text tokens incrementally to front-end clients?',
        options: ['Server-Sent Events (SSE) / WebSockets', 'FTP file download', 'SMTP Email', 'UDP Audio broadcast'],
        correctAnswer: 0,
        explanation: 'Server-Sent Events (SSE) and WebSockets allow real-time HTTP token streaming for instant response rendering.',
      },
    ],
    summary: [
      'Full-stack AI apps separate client UI from secure API backend proxies.',
      'Secrets belong exclusively in server `.env` variables.',
      'Streaming (SSE) improves perceived user latency by rendering text immediately as generated.',
    ],
    glossary: [
      { term: 'Proxy Server', definition: 'Intermediate server forwarding requests from clients to external APIs securely.' },
      { term: 'Rate Limiting', definition: 'Strategy limiting the number of API requests a user can make within a specified timeframe.' },
    ],
    nextLessonId: 'ai-81',
  },
];
