export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[] | QuizOption[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface LearnLesson {
  id: string;
  slug: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  markdownContent: string;
  starterCode?: string;
  solutionCode?: string;
  testCases?: Array<{ input: string; expectedOutput: string }>;
  quiz?: QuizQuestion[];
}

export interface LearnTrack {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  totalLessons: number;
  estimatedHours: number;
  lessons: LearnLesson[];
}

export interface LearnSavedCode {
  html?: string;
  css?: string;
  javascript?: string;
}

export interface LearnProgress {
  user: string;
  completedLessons: string[];
  currentTrack: string;
  currentLessonId: string;
  lastLessonByTrack?: Record<string, string>;
  savedCode?: Record<string, LearnSavedCode>;
  xp: number;
  streak: number;
  passedQuizzes: string[];
  certificatesEarned?: string[];
  updatedAt?: string | Date;
}
