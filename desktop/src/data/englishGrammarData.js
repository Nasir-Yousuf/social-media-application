// Clearfeed Learn & Practice - Complete English Grammar Master Guide
// Specially designed for Bangladeshi Curriculum (JSC, SSC, HSC & Admission Tests)
// TypeScript / JS Entity Schema & Comprehensive Data Store

export const ENGLISH_GRAMMAR_MODULES = [
  {
    id: 'english-module-01',
    title: 'Module 01: Parts of Speech (পদ প্রকরণ) & Suffix Recognition Techniques',
    targetClasses: 'Class 6–8 (Foundation Level)',
    track: 'english',
    order: 1,
    difficulty: 'Foundation',
    badge: 'Class 6–8 Foundation',
    rules: [
      {
        id: 'pos-rule-1',
        ruleTitle: '8 Parts of Speech & Functional Categories',
        ruleFormula: 'Noun | Pronoun | Adjective | Verb | Adverb | Preposition | Conjunction | Interjection',
        explanationBn: 'ইংরেজি ভাষায় ব্যবহৃত প্রতিটি অর্থপূর্ণ শব্দকে তাদের কাজ অনুযায়ী ৮টি শ্রেণীতে ভাগ করা হয়েছে।',
        examples: [
          { sentence: 'Rahim is a brilliant student.', targetWord: 'brilliant', explanation: 'Adjective modifying Noun "student"' },
          { sentence: 'She sings beautifully.', targetWord: 'beautifully', explanation: 'Adverb modifying Verb "sings"' },
          { sentence: 'Alas! We lost the game.', targetWord: 'Alas!', explanation: 'Interjection expressing grief' }
        ],
        mnemonicDevice: 'N-P-A-V-A-P-C-I (No Parent Always Values A Perfect Child Inately)'
      },
      {
        id: 'pos-rule-2',
        ruleTitle: 'Suffix Recognition Shortcuts for Noun & Adjective',
        ruleFormula: '-ion/-ment/-ness/-ity -> Noun | -ful/-less/-ive/-able -> Adjective',
        explanationBn: 'শব্দের শেষে নির্দিষ্ট Suffix দেখে অতি সহজেই Part of Speech সনাক্ত করা যায়।',
        examples: [
          { sentence: 'Development (Noun) leads to national prosperity.', targetWord: 'Development', explanation: 'Ends in -ment (Noun)' },
          { sentence: 'Be careful (Adjective) while crossing.', targetWord: 'careful', explanation: 'Ends in -ful (Adjective)' },
          { sentence: 'She acted cleverly (Adverb).', targetWord: 'cleverly', explanation: 'Ends in -ly (Adverb)' }
        ],
        mnemonicDevice: 'Suffixes: Noun (-ment, -ness, -tion), Adj (-ful, -less, -ive), Verb (-fy, -ize), Adv (-ly)'
      },
      {
        id: 'pos-rule-3',
        ruleTitle: 'Gap-Filling Secret Rules (Article + Word Position)',
        ruleFormula: 'Article + 1 Word = Noun | Article + 2 Words = Adj + Noun | Article + 3 Words = Adv + Adj + Noun',
        explanationBn: 'Sentence-এ Article/Determiner-এর পর কয়টি শব্দ আছে তা দেখে সহজে শূন্যস্থান পূরণ করা যায়।',
        examples: [
          { sentence: 'She is a girl.', targetWord: 'girl', explanation: 'Article + 1 Word = Noun' },
          { sentence: 'She is a good girl.', targetWord: 'good girl', explanation: 'Article + 2 Words = Adjective + Noun' },
          { sentence: 'She is a very good girl.', targetWord: 'very good girl', explanation: 'Article + 3 Words = Adverb + Adjective + Noun' }
        ]
      }
    ],
    flashcards: [
      {
        id: 'fc-m1-1',
        moduleId: 'english-module-01',
        front: 'What Part of Speech is formed by adding -tion or -ment?',
        back: 'Noun (e.g., Nation, Development)',
        bengaliHint: 'শব্দের শেষে -tion বা -ment থাকলে তা Noun হয়।',
        category: 'Shortcut'
      },
      {
        id: 'fc-m1-2',
        moduleId: 'english-module-01',
        front: 'If there are 3 words after an Article, what are their Parts of Speech?',
        back: 'Adverb + Adjective + Noun (e.g., a very good girl)',
        bengaliHint: 'Article এর পর ৩টি শব্দ থাকলে: Adverb + Adjective + Noun',
        category: 'Rule'
      },
      {
        id: 'fc-m1-3',
        moduleId: 'english-module-01',
        front: 'Identify Part of Speech: "Quickly"',
        back: 'Adverb (-ly suffix modifying a verb)',
        bengaliHint: 'Verb-কে কীভাবে কাজ সম্পন্ন হয়েছে তা নির্দেশ করে।',
        category: 'Rule'
      }
    ],
    quizzes: [
      {
        id: 'qz-m1-1',
        moduleId: 'english-module-01',
        type: 'mcq',
        prompt: 'Honesty is the best (pure) _____. What is the correct Noun form of "pure"?',
        options: ['purity', 'pureness', 'purify', 'purely'],
        correctAnswer: 'purity',
        explanation: 'According to Suffix Rules, the Noun form of "pure" is "purity" (-ity suffix).',
        examContext: 'JSC'
      },
      {
        id: 'qz-m1-2',
        moduleId: 'english-module-01',
        type: 'gap-fill',
        prompt: 'He answered the question (clever) _____.',
        correctAnswer: 'cleverly',
        explanation: 'The gap modifies the verb "answered", requiring an Adverb (-ly suffix: cleverly).',
        examContext: 'JSC'
      },
      {
        id: 'qz-m1-3',
        moduleId: 'english-module-01',
        type: 'mcq',
        prompt: 'In the sentence "She is a very sincere girl", what part of speech is "very"?',
        options: ['Adverb', 'Adjective', 'Noun', 'Conjunction'],
        correctAnswer: 'Adverb',
        explanation: 'Rule: Article + 3 words = Adverb (very) + Adjective (sincere) + Noun (girl).',
        examContext: 'SSC'
      }
    ]
  },
  {
    id: 'english-module-02',
    title: 'Module 02: Articles (পদাশ্রিত নির্দেশক) & Sound-Based Shortcuts',
    targetClasses: 'Class 6–8 (Foundation Level)',
    track: 'english',
    order: 2,
    difficulty: 'Foundation',
    badge: 'Class 6–8 Foundation',
    rules: [
      {
        id: 'art-rule-1',
        ruleTitle: 'Sound Secret: Vowel Sound vs Consonant/Diphthong Sound',
        ruleFormula: 'Vowel Sound (অ, আ, ই, এ, ও) = An | Consonant & "ইউ / ওয়া" Sound = A',
        explanationBn: 'Article বসানোর সময় বানান নয়, ধ্বনি বা Sound অনুসরণ করতে হয়।',
        examples: [
          { sentence: 'He is an honest man.', targetWord: 'an', explanation: 'Honest starts with vowel sound "অনেস্ট"' },
          { sentence: 'This is a university.', targetWord: 'a', explanation: 'University starts with diphthong sound "ইউ"' },
          { sentence: 'I saw a one-eyed man.', targetWord: 'a', explanation: 'One starts with "ওয়া" sound' }
        ],
        mnemonicDevice: 'Vowel Sound = An, "ইউ/ওয়া" Sound = A'
      },
      {
        id: 'art-rule-2',
        ruleTitle: 'Special Exception for Uncountable Nouns',
        ruleFormula: 'Uncountable Noun + of / in / to -> Use "The"',
        explanationBn: 'Uncountable Noun-এর পূর্বে সাধারণত Article বসে না (x)। কিন্তু এর পর of / in / to থাকলে তার পূর্বে the বসে।',
        examples: [
          { sentence: 'The water of this glass is pure.', targetWord: 'The', explanation: 'Uncountable "water" followed by "of this glass"' },
          { sentence: 'Water is life.', targetWord: 'Water (no article)', explanation: 'General uncountable noun takes no article' }
        ]
      }
    ],
    flashcards: [
      {
        id: 'fc-m2-1',
        moduleId: 'english-module-02',
        front: 'What article comes before "M.A." or "X-ray"?',
        back: 'An (starts with Vowel sound "এম" / "এক্স")',
        bengaliHint: 'সংক্ষিপ্ত শব্দের উচ্চারণ Vowel দিয়ে হলে An বসে।',
        category: 'Shortcut'
      },
      {
        id: 'fc-m2-2',
        moduleId: 'english-module-02',
        front: 'Which article is placed before Superlative Degree?',
        back: 'The (e.g., The best, The most handsome)',
        bengaliHint: 'Superlative Degree এর পূর্বে সর্বদাই "The" বসে।',
        category: 'Rule'
      }
    ],
    quizzes: [
      {
        id: 'qz-m2-1',
        moduleId: 'english-module-02',
        type: 'mcq',
        prompt: 'He gave me _____ one-taka note.',
        options: ['a', 'an', 'the', 'no article'],
        correctAnswer: 'a',
        explanation: 'Words starting with "O" sounding like "ওয়া" take article "a" (e.g. a one-taka note).',
        examContext: 'JSC'
      },
      {
        id: 'qz-m2-2',
        moduleId: 'english-module-02',
        type: 'gap-fill',
        prompt: '_____ water of the Padma is clean.',
        correctAnswer: 'The',
        explanation: 'Uncountable noun "water" followed by preposition "of" takes definite article "The".',
        examContext: 'SSC'
      }
    ]
  },
  {
    id: 'english-module-03',
    title: 'Module 03: Prepositions (Spatial Diagram Method, Rhyme, & Grouped Appropriate Prepositions)',
    targetClasses: 'Class 6–8 (Foundation Level)',
    track: 'english',
    order: 3,
    difficulty: 'Foundation',
    badge: 'Class 6–8 Foundation',
    rules: [
      {
        id: 'prep-rule-1',
        ruleTitle: 'Spatial Diagram Method for Prepositions',
        ruleFormula: 'On (touching surface) | Above (stationary high) | Over (moving across) | In (inside border) | Into (entering inside)',
        explanationBn: 'স্থান ও গতির পার্থক্য ভিজ্যুয়াল ম্যাপের মাধ্যমে সহজে মনে রাখা যায়।',
        examples: [
          { sentence: 'The book is on the table.', targetWord: 'on', explanation: 'Touching surface' },
          { sentence: 'The fan is above my head.', targetWord: 'above', explanation: 'Separated, stationary high' },
          { sentence: 'The cat jumped into the box.', targetWord: 'into', explanation: 'Movement from outside to inside' }
        ]
      },
      {
        id: 'prep-rule-2',
        ruleTitle: "Tanvir Sir's Preposition Rhyme",
        ruleFormula: 'City/Country = In | Days/Dates = On | Exact Point/Small Place = At | Season/Year = In',
        explanationBn: 'ছড়ার মাধ্যমে সময় ও স্থানের প্রিপজিশন ব্যবহার মনে রাখার কৌশল।',
        examples: [
          { sentence: 'He lives in Dhaka at Mirpur.', targetWord: 'in / at', explanation: 'In for big city, At for specific point' },
          { sentence: 'I will meet you on Sunday in May.', targetWord: 'on / in', explanation: 'On for day, In for month' }
        ],
        mnemonicDevice: 'শহরে নগরে গ্রামে মহাদেশে In, দিনের আগে বারের আগে On বসিয়ে দিন! ছোট স্থান সময় ও নির্দিষ্ট পয়েন্টে At!'
      },
      {
        id: 'prep-rule-3',
        ruleTitle: 'Die & Abide Variations Grouping',
        ruleFormula: 'Die of (disease) | Die by (accident/poison) | Die from (overwork) | Die for (country) | Abide by (rules)',
        explanationBn: 'একই Verb-এর সাথে ভিন্ন Preposition বসে ভিন্ন অর্থ তৈরি করে।',
        examples: [
          { sentence: 'He died of cholera.', targetWord: 'of', explanation: 'Died of a disease' },
          { sentence: 'He died for his country.', targetWord: 'for', explanation: 'Sacrificed life for a noble cause' },
          { sentence: 'You must abide by the rules.', targetWord: 'by', explanation: 'Abide by = obey rules' }
        ]
      }
    ],
    flashcards: [
      {
        id: 'fc-m3-1',
        moduleId: 'english-module-03',
        front: 'What is the preposition for dying of a disease versus dying in an accident?',
        back: 'Die OF (disease) vs Die BY (accident/poison)',
        bengaliHint: 'রোগে মারা গেলে OF, দুর্ঘটনায় বা বিষে BY',
        category: 'Appropriate Preposition'
      },
      {
        id: 'fc-m3-2',
        moduleId: 'english-module-03',
        front: 'What preposition follows "Prefer"?',
        back: 'Prefer... TO (e.g., I prefer tea to coffee)',
        bengaliHint: 'অধিক পছন্দ করা বোঝাতে Prefer এর পর TO বসে।',
        category: 'Appropriate Preposition'
      }
    ],
    quizzes: [
      {
        id: 'qz-m3-1',
        moduleId: 'english-module-03',
        type: 'mcq',
        prompt: 'The patriot died _____ his country.',
        options: ['for', 'of', 'by', 'from'],
        correctAnswer: 'for',
        explanation: 'Die for = sacrifice life for a noble cause or country.',
        examContext: 'SSC'
      },
      {
        id: 'qz-m3-2',
        moduleId: 'english-module-03',
        type: 'mcq',
        prompt: 'You should abide _____ the rules of discipline.',
        options: ['by', 'with', 'in', 'at'],
        correctAnswer: 'by',
        explanation: 'Abide by means to comply with or obey rules.',
        examContext: 'SSC'
      }
    ]
  },
  {
    id: 'english-module-04',
    title: 'Module 04: Punctuation Marks & Capitalisation Rules',
    targetClasses: 'Class 6–8 (Foundation Level)',
    track: 'english',
    order: 4,
    difficulty: 'Foundation',
    badge: 'Class 6–8 Foundation',
    rules: [
      {
        id: 'punc-rule-1',
        ruleTitle: 'Master Punctuation Marks (Comma, Colon, Semicolon, Ellipsis)',
        ruleFormula: 'Comma (short pause/list) | Semicolon (link clauses) | Colon (list/explanation)',
        explanationBn: 'বাক্যের অর্থ সুস্পষ্ট রাখতে এবং বিরামচিহ্নের নিখুঁত প্রয়োগ নিশ্চিত করতে ব্যবহৃত হয়।',
        examples: [
          { sentence: 'He said, "Honesty is the best policy."', targetWord: 'Comma & Quotes', explanation: 'Comma before direct quote' },
          { sentence: 'We bought apples, oranges, and mangoes.', targetWord: 'Comma', explanation: 'Separating items in a list' }
        ]
      },
      {
        id: 'punc-rule-2',
        ruleTitle: '11 Golden Rules of Capitalisation',
        ruleFormula: 'Proper Nouns | Days & Months | Pronoun "I" | Direct Quote Start | Degrees/Qualifications',
        explanationBn: 'ইংরেজি বাক্যে বড় হাতের অক্ষর (Capital Letter) ব্যবহারের সুনির্দিষ্ট ১১টি নিয়ম।',
        examples: [
          { sentence: 'He holds an M.A. degree from Dhaka University.', targetWord: 'M.A. / Dhaka University', explanation: 'Educational degree & Proper Noun' },
          { sentence: 'If he comes, I will go.', targetWord: 'I', explanation: 'Single pronoun I is always capital' }
        ]
      }
    ],
    flashcards: [
      {
        id: 'fc-m4-1',
        moduleId: 'english-module-04',
        front: 'When is the direction word "North" capitalized?',
        back: 'When it refers to a specific region (e.g. The North). Simple directions stay lowercase.',
        bengaliHint: 'নির্দিষ্ট অঞ্চল বোঝালে Capital, সাধারণ দিক বোঝালে small letter.',
        category: 'Rule'
      }
    ],
    quizzes: [
      {
        id: 'qz-m4-1',
        moduleId: 'english-module-04',
        type: 'sentence-correction',
        prompt: 'Correct capitalization: "my brother lives in dhaka and passed ssc exam."',
        correctAnswer: 'My brother lives in Dhaka and passed SSC exam.',
        explanation: 'Start of sentence (My), Proper Noun (Dhaka), and Exam Degree (SSC) must be capitalized.',
        examContext: 'JSC'
      }
    ]
  },
  {
    id: 'english-module-05',
    title: 'Module 05: Right Form of Verbs (The 33 Golden Rules: V1, V2, V-ing, V3, Complex/Conditionals)',
    targetClasses: 'Class 9–10 (SSC Level)',
    track: 'english',
    order: 5,
    difficulty: 'Intermediate',
    badge: 'Class 9–10 SSC',
    rules: [
      {
        id: 'rfv-rule-1',
        ruleTitle: 'Rule 5 & 6: Bare Infinitive & Modal Auxiliaries',
        ruleFormula: 'Had better / Had rather / Let / Make / Modals + Base Form (V1)',
        explanationBn: 'Modal verbs এবং কজেটিভ সেমি-মোডালের পর Verb-এর Base Form (V1) বসে।',
        examples: [
          { sentence: 'You had better go home now.', targetWord: 'go', explanation: 'Base form after had better' },
          { sentence: 'He can solve the problem.', targetWord: 'solve', explanation: 'Base form after modal can' }
        ]
      },
      {
        id: 'rfv-rule-2',
        ruleTitle: 'Rule 12: It is high time / It is time with Subject',
        ruleFormula: 'It is high time + Subject + V2',
        explanationBn: 'It is high time-এর পর Subject থাকলে Verb-এর Past Form (V2) হয়।',
        examples: [
          { sentence: 'It is high time we changed our bad habits.', targetWord: 'changed', explanation: 'V2 after It is high time + Subject' }
        ],
        mnemonicDevice: 'It is high time + Sub -> V2'
      },
      {
        id: 'rfv-rule-3',
        ruleTitle: 'Rule 19: Prepositional Phrases taking V+ing',
        ruleFormula: 'Look forward to / With a view to / Mind / Worth / Confess to + Verb + ing',
        explanationBn: 'Look forward to, with a view to ইত্যাদির পর সর্বদাই V + ing বসে।',
        examples: [
          { sentence: 'I am looking forward to hearing from you.', targetWord: 'hearing', explanation: 'V+ing after looking forward to' },
          { sentence: 'He went to market with a view to buying a book.', targetWord: 'buying', explanation: 'V+ing after with a view to' }
        ]
      },
      {
        id: 'rfv-rule-4',
        ruleTitle: 'Rule 31: No sooner had ... than Inversion',
        ruleFormula: 'No sooner had + Sub + V3 + than + Past Indefinite (V2)',
        explanationBn: 'No sooner had এর প্রথম অংশে V3 এবং than-এর পর V2 বসে।',
        examples: [
          { sentence: 'No sooner had the doctor come than the patient died.', targetWord: 'come / died', explanation: 'Had + V3 (come) followed by than + V2 (died)' }
        ]
      }
    ],
    flashcards: [
      {
        id: 'fc-m5-1',
        moduleId: 'english-module-05',
        front: 'What form of verb follows "With a view to"?',
        back: 'Verb + ing (e.g. With a view to learning English)',
        bengaliHint: 'With a view to এর পর সর্বদা V+ing বসে।',
        category: 'Shortcut'
      },
      {
        id: 'fc-m5-2',
        moduleId: 'english-module-05',
        front: 'What verb form follows "It is high time we..."?',
        back: 'Past Form (V2) (e.g. It is high time we changed our habits)',
        bengaliHint: 'It is high time এর পর Subject থাকলে V2 হয়।',
        category: 'Rule'
      }
    ],
    quizzes: [
      {
        id: 'qz-m5-1',
        moduleId: 'english-module-05',
        type: 'mcq',
        prompt: 'It is high time we (change) _____ our corrupted habits.',
        options: ['changed', 'change', 'changing', 'had changed'],
        correctAnswer: 'changed',
        explanation: 'Rule 12: It is high time + Subject + Past Tense (V2).',
        examContext: 'SSC'
      },
      {
        id: 'qz-m5-2',
        moduleId: 'english-module-05',
        type: 'gap-fill',
        prompt: 'I am looking forward to (receive) _____ your response.',
        correctAnswer: 'receiving',
        explanation: 'Rule 19: "Look forward to" is followed by V+ing (receiving).',
        examContext: 'SSC'
      }
    ]
  },
  {
    id: 'english-module-06',
    title: 'Module 06: Completing Sentences & Conditionals (51 Golden Rules & Inversion Patterns)',
    targetClasses: 'Class 9–10 (SSC Level)',
    track: 'english',
    order: 6,
    difficulty: 'Intermediate',
    badge: 'Class 9–10 SSC',
    rules: [
      {
        id: 'cs-rule-1',
        ruleTitle: 'Golden Conditionals (1st, 2nd, 3rd & Inverted 3rd)',
        ruleFormula: '1st: If+Pres->Future | 2nd: If+Past->would+V1 | 3rd: If+Past Perf->would have+V3 | Inv 3rd: Had+Sub+V3->would have+V3',
        explanationBn: 'শর্তযুক্ত বাক্য পূরণের ৪টি প্রধান গাণিতিক ফর্মুলা।',
        examples: [
          { sentence: 'If it rains, we will stay at home.', targetWord: '1st Conditional', explanation: 'If + Present -> Future' },
          { sentence: 'If I had money, I would help the poor.', targetWord: '2nd Conditional', explanation: 'If + Past -> would + V1' },
          { sentence: 'Had I known his address, I would have visited him.', targetWord: 'Inverted 3rd Conditional', explanation: 'Had + Sub + V3 -> would have + V3' }
        ],
        mnemonicDevice: 'If Present -> Will | If Past -> Would | Had/If Past Perf -> Would Have + V3'
      },
      {
        id: 'cs-rule-2',
        ruleTitle: 'Lest ... Should / Might Formula',
        ruleFormula: 'Clause + lest + Subject + should / might + Base Form (V1)',
        explanationBn: 'পাছে কোনো ভয় থাকে এমন বাক্য পূরণে lest-এর পর Subject + should + V1 বসে।',
        examples: [
          { sentence: 'Walk fast lest you should miss the train.', targetWord: 'lest ... should miss', explanation: 'Lest structure' }
        ]
      },
      {
        id: 'cs-rule-3',
        ruleTitle: 'So that / In order that Purpose Formula',
        ruleFormula: 'Clause + so that + Subject + can/could/may/might + V1',
        explanationBn: 'উদ্দেশ্য প্রকাশ করতে so that-এর পর Subject + can/could + V1 বসে।',
        examples: [
          { sentence: 'We eat so that we can survive.', targetWord: 'so that we can survive', explanation: 'Present tense -> can + V1' }
        ]
      }
    ],
    flashcards: [
      {
        id: 'fc-m6-1',
        moduleId: 'english-module-06',
        front: 'Complete the pattern: "Had I seen him..."',
        back: '...I would have given him the message (Sub + would have + V3)',
        bengaliHint: 'Inverted 3rd Conditional: Had + Sub + V3 থাকলে পরবর্তী অংশে would have + V3 বসে।',
        category: 'Shortcut'
      },
      {
        id: 'fc-m6-2',
        moduleId: 'english-module-06',
        front: 'What modal verb must follow "Lest + Subject"?',
        back: 'should or might (e.g. lest you should fall)',
        bengaliHint: 'Lest এর পর Subject এর সাথে সর্বদাই should বা might বসে।',
        category: 'Rule'
      }
    ],
    quizzes: [
      {
        id: 'qz-m6-1',
        moduleId: 'english-module-06',
        type: 'mcq',
        prompt: 'Run fast lest _____.',
        options: ['you should miss the train', 'you will miss the train', 'you missed the train', 'you can miss the train'],
        correctAnswer: 'you should miss the train',
        explanation: 'Rule 9: Clause + lest + Subject + should/might + V1.',
        examContext: 'SSC'
      },
      {
        id: 'qz-m6-2',
        moduleId: 'english-module-06',
        type: 'gap-fill',
        prompt: 'If I had seen the accident, I (inform) _____ the police.',
        correctAnswer: 'would have informed',
        explanation: 'Rule 18: 3rd Conditional (If + Past Perfect -> Sub + would have + V3).',
        examContext: 'SSC'
      }
    ]
  },
  {
    id: 'english-module-07',
    title: 'Module 07: Narration (Direct & Indirect Speech, "RVCPTN" Formula, & Passage Narration)',
    targetClasses: 'Class 9–10 (SSC Level)',
    track: 'english',
    order: 7,
    difficulty: 'Intermediate',
    badge: 'Class 9–10 SSC',
    rules: [
      {
        id: 'nar-rule-1',
        ruleTitle: 'The RVCPTN Formula (রবি কলেজে পিটিয়েছে নাহিদকে)',
        ruleFormula: 'RV (Reporting Verb) -> C (Conjunction) -> P (Person) -> T (Tense) -> N (Near word to distant)',
        explanationBn: 'প্যাসেজ বা বাক্য ন্যারেশনের ৫টি মৌলিক পরিবর্তনের ক্রমিক সূত্র।',
        examples: [
          { sentence: 'Direct: He said, "I am writing now."', targetWord: 'Direct Speech', explanation: 'Original words' },
          { sentence: 'Indirect: He said that he was writing then.', targetWord: 'Indirect Speech', explanation: 'RV=said, C=that, P=he, T=was writing, N=then' }
        ],
        mnemonicDevice: 'RVCPTN: R = RV, C = Conjunction, P = Person (1st->Sub, 2nd->Obj), T = Tense Backshift, N = Near to Distant'
      },
      {
        id: 'nar-rule-2',
        ruleTitle: 'Passage Narration Speaker/Listener & Sir/Yes/No Rules',
        ruleFormula: 'Yes -> replied in the affirmative | No -> replied in the negative | Sir -> respectfully',
        explanationBn: 'প্যাসেজ ন্যারেশনে সম্মানসূচক ও উত্তরসূচক পরিবর্তনের নিয়ম।',
        examples: [
          { sentence: 'Direct: "Yes, Sir," replied the boy.', targetWord: 'Yes, Sir', explanation: 'Indirect: The boy respectfully replied in the affirmative.' }
        ]
      }
    ],
    flashcards: [
      {
        id: 'fc-m7-1',
        moduleId: 'english-module-07',
        front: 'What does "RVCPTN" stand for in narration?',
        back: 'Reporting Verb, Conjunction, Person, Tense, Near word to Distant word',
        bengaliHint: 'রবি কলেজে পিটিয়েছে নাহিদকে (RVCPTN)',
        category: 'Shortcut'
      },
      {
        id: 'fc-m7-2',
        moduleId: 'english-module-07',
        front: 'How to change "By Allah" in passage narration?',
        back: 'Swearing by Allah (e.g. Swearing by Allah, he said that...)',
        bengaliHint: '"By Allah" থাকলে Indirect-এ "Swearing by Allah" ব্যবহার করতে হয়।',
        category: 'Rule'
      }
    ],
    quizzes: [
      {
        id: 'qz-m7-1',
        moduleId: 'english-module-07',
        type: 'passage-rewrite',
        prompt: 'Change to indirect: "Have you done your homework?" the teacher said to Rahim. "Yes, Sir," replied Rahim.',
        correctAnswer: 'The teacher asked Rahim if he had done his homework. Rahim respectfully replied in the affirmative.',
        explanation: '1) Interrogative RV=asked, C=if. 2) Sir + Yes = respectfully replied in the affirmative.',
        examContext: 'SSC'
      }
    ]
  },
  {
    id: 'english-module-08',
    title: 'Module 08: Modifiers (Pre-modifiers, Post-modifiers, & HSC Structure Requirements)',
    targetClasses: 'Class 11–12 (HSC & Admission Level)',
    track: 'english',
    order: 8,
    difficulty: 'Advanced',
    badge: 'Class 11–12 HSC',
    rules: [
      {
        id: 'mod-rule-1',
        ruleTitle: 'Pre-modifiers vs Post-modifiers Classification',
        ruleFormula: 'Pre-modifier: Placed BEFORE Noun/Adj | Post-modifier: Placed AFTER Verb/Noun',
        explanationBn: 'কোনো শব্দের অতিরিক্ত তথ্য প্রদানের স্থান অনুযায়ী Modifier প্রধানত দুই প্রকার।',
        examples: [
          { sentence: 'He is a pious man.', targetWord: 'pious', explanation: 'Adjective pre-modifying Noun "man"' },
          { sentence: 'We eat to live.', targetWord: 'to live', explanation: 'Infinitive phrase post-modifying Verb "eat"' }
        ]
      },
      {
        id: 'mod-rule-2',
        ruleTitle: '10 Core Modification Tools (Appositive, Participle, Intensifier, Noun-Adj)',
        ruleFormula: 'Appositive (Noun phrase extra info) | Intensifier (very/extremely) | Noun-Adj (Noun as Adj)',
        explanationBn: 'এইচএসসি পরীক্ষায় ব্র্যাকেটের ভেতরের নির্দেশনা অনুযায়ী মোডিফায়ার ব্যবহারের নিয়ম।',
        examples: [
          { sentence: 'Kazi Nazrul, our national poet, wrote rebel poems.', targetWord: 'our national poet', explanation: 'Appositive modifying Kazi Nazrul' },
          { sentence: 'I saw a flying bird.', targetWord: 'flying', explanation: 'Present Participle pre-modifying bird' },
          { sentence: 'She is extremely talented.', targetWord: 'extremely', explanation: 'Intensifier pre-modifying Adjective talented' }
        ]
      }
    ],
    flashcards: [
      {
        id: 'fc-m8-1',
        moduleId: 'english-module-08',
        front: 'What modifier structure is used when prompted "Use an infinitive phrase to post-modify the verb"?',
        back: 'to + V1 + extra word(s) (e.g. "to get safe water")',
        bengaliHint: 'Infinitive Phrase = to + Verb Base Form + প্রসঙ্গবাচক শব্দ',
        category: 'Shortcut'
      },
      {
        id: 'fc-m8-2',
        moduleId: 'english-module-08',
        front: 'Give an example of an Intensifier pre-modifying an adjective.',
        back: 'Very or Extremely (e.g. extremely dangerous)',
        bengaliHint: 'Intensifier হিসেবে সর্বাধিক ব্যবহৃত শব্দ: very / extremely / highly',
        category: 'Rule'
      }
    ],
    quizzes: [
      {
        id: 'qz-m8-1',
        moduleId: 'english-module-08',
        type: 'gap-fill',
        prompt: 'Arsenic is an (use intensifier) _____ dangerous substance for human health.',
        correctAnswer: 'extremely',
        explanation: 'Intensifier modifying adjective "dangerous" requires "extremely" or "very".',
        examContext: 'HSC'
      },
      {
        id: 'qz-m8-2',
        moduleId: 'english-module-08',
        type: 'mcq',
        prompt: 'In "Kazi Nazrul, our national poet, was born in Churulia", the underlined phrase is a/an:',
        options: ['Appositive', 'Infinitive phrase', 'Participle', 'Intensifier'],
        correctAnswer: 'Appositive',
        explanation: 'An appositive is a noun phrase placed immediately after a noun to provide identifying info.',
        examContext: 'HSC'
      }
    ]
  },
  {
    id: 'english-module-09',
    title: 'Module 09: Pronoun Reference (Ambiguity Elimination & the 22 Agreement Rules)',
    targetClasses: 'Class 11–12 (HSC & Admission Level)',
    track: 'english',
    order: 9,
    difficulty: 'Advanced',
    badge: 'Class 11–12 HSC',
    rules: [
      {
        id: 'pr-rule-1',
        ruleTitle: 'Ambiguous Pronoun Elimination & Antecedent Clarity',
        ruleFormula: 'If multiple Nouns exist, replace unclear Pronoun with explicit Noun',
        explanationBn: 'বাক্যে একাধিক Noun থাকলে অস্পষ্ট Pronoun না রেখে সরাসরি নির্দিষ্ট Noun-টি লিখতে হয়।',
        examples: [
          { sentence: 'Incorrect: Rahim told Karim that he passed.', targetWord: 'he (Ambiguous)', explanation: 'Unclear whether he refers to Rahim or Karim' },
          { sentence: 'Correct: Rahim told Karim that Karim passed.', targetWord: 'Karim', explanation: 'Explicit noun eliminates ambiguity' }
        ]
      },
      {
        id: 'pr-rule-2',
        ruleTitle: 'Person Order Rules (Good Deed 231 vs Fault/Bad Deed 123)',
        ruleFormula: 'Good Deed / Normal = 231 (You, he and I) | Confession / Fault = 123 (I, you and he)',
        explanationBn: 'বাক্যে একাধিক Person একসাথে বসানোর সর্বজনগ্রাহ্য নিয়ম।',
        examples: [
          { sentence: 'You, he and I will attend the party.', targetWord: '231 Order', explanation: 'Good deed / normal activity' },
          { sentence: 'I, you and he are guilty.', targetWord: '123 Order', explanation: 'Confessing fault or bad deed' }
        ],
        mnemonicDevice: 'Good Deed = 2-3-1 | Bad Deed / Guilt = 1-2-3'
      },
      {
        id: 'pr-rule-3',
        ruleTitle: 'Comparison with "That of" and "Those of"',
        ruleFormula: 'Singular Noun comparison -> that of | Plural Noun comparison -> those of',
        explanationBn: 'তুলনার ক্ষেত্রে Noun-এর পুনরাবৃত্তি এড়াতে Singular-এ that of এবং Plural-এ those of বসে।',
        examples: [
          { sentence: 'The climate of Dhaka is better than that of Chittagong.', targetWord: 'that of', explanation: 'Singular comparison (climate)' }
        ]
      }
    ],
    flashcards: [
      {
        id: 'fc-m9-1',
        moduleId: 'english-module-09',
        front: 'What is the correct pronoun possessive form when the subject is "One"?',
        back: "One's (e.g., One should do one's duty carefully)",
        bengaliHint: 'Subject হিসেবে "One" থাকলে পরবর্তীতে "one\'s" হবে, his/their নয়।',
        category: 'Rule'
      },
      {
        id: 'fc-m9-2',
        moduleId: 'english-module-09',
        front: 'What order of persons is used when admitting a crime or fault?',
        back: '1-2-3 (First Person, Second Person, Third Person: I, you and he)',
        bengaliHint: 'দোষ স্বীকারের ক্ষেত্রে ক্রম হবে: ১ম -> ২য় -> ৩য় পার্সন (123)',
        category: 'Shortcut'
      }
    ],
    quizzes: [
      {
        id: 'qz-m9-1',
        moduleId: 'english-module-09',
        type: 'sentence-correction',
        prompt: 'Correct the pronoun error: "The climate of Dhaka is better than Chittagong."',
        correctAnswer: 'The climate of Dhaka is better than that of Chittagong.',
        explanation: 'Faulty comparison: must compare climate to climate using "that of Chittagong".',
        examContext: 'HSC'
      }
    ]
  },
  {
    id: 'english-module-10',
    title: 'Module 10: High-Frequency Board Vocabulary with Synonyms & Antonyms',
    targetClasses: 'Class 6–12 & Admission Tests',
    track: 'english',
    order: 10,
    difficulty: 'Advanced',
    badge: 'SSC & HSC Board Exam Most Common',
    rules: [
      {
        id: 'vocab-rule-1',
        ruleTitle: 'Board Exam Synonyms & Antonyms Master Matrix',
        ruleFormula: 'Abundant <-> Scarce | Benevolent <-> Malevolent | Diligence <-> Laziness | Transient <-> Permanent',
        explanationBn: 'এসএসসি, এইচএসসি ও বিশ্ববিদ্যালয় ভর্তি পরীক্ষায় সর্বাধিক কমন ২০০+ মূল শব্দভাণ্ডার।',
        examples: [
          { sentence: 'Bangladesh has abundant natural wealth.', targetWord: 'Abundant', explanation: 'Synonym: Plentiful / Ample, Antonym: Scarce' },
          { sentence: 'A benevolent king helped the poor.', targetWord: 'Benevolent', explanation: 'Synonym: Kind / Generous, Antonym: Cruel' }
        ]
      }
    ],
    flashcards: [
      {
        id: 'fc-m10-1',
        moduleId: 'english-module-10',
        front: 'What is the synonym and antonym of "Transient"?',
        back: 'Synonym: Temporary / Fleeting | Antonym: Permanent / Eternal',
        bengaliHint: 'Transient = ক্ষণস্থায়ী (বিপরীত: স্থায়ী)',
        category: 'Vocabulary'
      },
      {
        id: 'fc-m10-2',
        moduleId: 'english-module-10',
        front: 'What is the synonym and antonym of "Frugal"?',
        back: 'Synonym: Economical / Thrifty | Antonym: Extravagant / Wasteful',
        bengaliHint: 'Frugal = পরিমিতব্যয়ী (বিপরীত: অপব্যয়ী)',
        category: 'Vocabulary'
      }
    ],
    quizzes: [
      {
        id: 'qz-m10-1',
        moduleId: 'english-module-10',
        type: 'mcq',
        prompt: 'What is the ANTONYM of "Adversity"?',
        options: ['Prosperity', 'Hardship', 'Misfortune', 'Distress'],
        correctAnswer: 'Prosperity',
        explanation: 'Adversity means hardship/misfortune. Its exact antonym is Prosperity (সমৃদ্ধি).',
        examContext: 'HSC'
      },
      {
        id: 'qz-m10-2',
        moduleId: 'english-module-10',
        type: 'mcq',
        prompt: 'Which of the following is a SYNONYM for "Benevolent"?',
        options: ['Compassionate', 'Malevolent', 'Cruel', 'Hostile'],
        correctAnswer: 'Compassionate',
        explanation: 'Benevolent means kind and generous. Synonym = Compassionate.',
        examContext: 'SSC'
      }
    ]
  }
];

// Map Modules into standard LESSONS format for learning platform integration
export const ENGLISH_GRAMMAR_LESSONS = ENGLISH_GRAMMAR_MODULES.map((mod) => ({
  id: mod.id,
  track: 'english',
  order: mod.order,
  difficulty: mod.difficulty,
  targetClasses: mod.targetClasses,
  badge: mod.badge,
  title: {
    en: mod.title,
    bn: mod.title,
  },
  subtitle: {
    en: `Target Audience: ${mod.targetClasses}`,
    bn: `সিলেবাস লক্ষ্যমাত্রা: ${mod.targetClasses}`,
  },
  explanation: {
    simple: {
      en: `Master guide covering key rules, mnemonic formulas, and board exam gap-fill strategies for ${mod.title}.`,
      bn: `বোর্ড সিলেবাসের উপযোগী ১০০% কমন শর্টকাট রুলস, MNEMONICS ও প্র্যাকটিস গাইড।`,
    },
    whatIsIt: {
      en: `Comprehensive coverage of ${mod.title} for Bangladeshi secondary and higher secondary students (JSC, SSC, HSC & Admission).`,
      bn: `জেএসসি, এসএসসি ও এইচএসসি পরীক্ষার বোর্ডের সংক্ষিপ্ত গোল্ডেন রুলস ও শর্টকাট গাইড।`,
    },
    analogy: {
      en: 'Think of English Grammar like building a clock. Each rule is a wheel gear, and formulas (like RVCPTN or Conditionals) keep the entire sentence running accurately!',
      bn: 'ইংরেজি ব্যাকরণকে ঘড়ির গিয়ারের মতো চিন্তা করুন। প্রতিটি রুলস একেকটি ছোট হুইল, আর ফর্মুলাগুলো বাক্যকে একদম নিখুঁত রাখে!',
    },
    technical: {
      en: `Covers ${mod.rules.length} core golden rules, formula structures, and board exam exercise models.`,
      bn: `${mod.rules.length}টি প্রধান গোল্ডেন রুলস এবং বোর্ডের উদাহরণ সহ।`,
    },
  },
  rules: mod.rules,
  flashcards: mod.flashcards,
  quizzes: mod.quizzes,
  starterCode: {
    html: `<!-- English Grammar Practice Workbook -->\n<div class="grammar-exercise">\n  <h3>${mod.title}</h3>\n  <p>Practice writing or filling gaps based on Golden Rules.</p>\n</div>`,
    css: ``,
    javascript: ``,
  },
  exercise: {
    instructions: {
      en: `Review the rules above and complete the practice quiz to test your mastery of ${mod.title}.`,
      bn: `উপরের রুলস ও ফর্মুলাগুলো দেখে নিচে দেওয়া কুইজ ও প্র্যাকটিসে অংশ নিন।`,
    },
    hint: {
      en: 'Focus on the golden formulas and mnemonics (like RVCPTN or 123/231 order).',
      bn: 'গোল্ডেন ফর্মুলা ও ছড়াগুলো মনে রাখুন।',
    },
    solution: {
      html: `<div class="grammar-exercise completed">Completed ${mod.title} Exercise</div>`,
      css: ``,
      javascript: ``,
    },
    validation: {
      type: 'html_tags',
      requiredTags: ['div'],
      minTextLength: 3,
    },
  },
}));

// Export mapped quizzes for lessonQuizzes.js
export const ENGLISH_GRAMMAR_QUIZZES = ENGLISH_GRAMMAR_MODULES.reduce((acc, mod) => {
  acc[mod.id] = {
    title: `${mod.title} - Mastery Quiz`,
    passingScore: Math.ceil(mod.quizzes.length * 0.6),
    xpReward: 35,
    questions: mod.quizzes.map((q, idx) => ({
      id: q.id || `q${idx + 1}`,
      prompt: q.prompt,
      promptBn: q.prompt,
      options: q.options || ['Correct', 'Incorrect'],
      correctIndex: q.options ? q.options.indexOf(q.correctAnswer) >= 0 ? q.options.indexOf(q.correctAnswer) : 0 : 0,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      explanationBn: q.explanation,
      examContext: q.examContext || 'SSC',
    })),
  };
  return acc;
}, {});
