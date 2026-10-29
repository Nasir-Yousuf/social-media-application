import { module1Lessons } from './module1.js';
import { module2Lessons } from './module2.js';
import { module3Lessons } from './module3.js';
import { module4Lessons } from './module4.js';
import { module5Lessons } from './module5.js';
import { module6Lessons } from './module6.js';
import { module7Lessons } from './module7.js';
import { module8Lessons } from './module8.js';
import { module9Lessons } from './module9.js';
import { module10Lessons } from './module10.js';

function normalizeLesson(raw, idx) {
  const lessonNumber = raw.lessonNumber || raw.order || (idx + 1);
  const modNum = raw.module || Math.ceil(lessonNumber / 6);
  const moduleId = raw.moduleId || `mysql-mod-${modNum}`;

  // Title string / bilingual
  const titleStr = typeof raw.title === 'object' ? raw.title.en : raw.title;
  const titleBn = typeof raw.title === 'object' ? raw.title.bn : '';

  // Subtitle string / bilingual
  const subtitleStr = typeof raw.subtitle === 'object' ? raw.subtitle.en : (raw.subtitle || '');
  const subtitleBn = typeof raw.subtitle === 'object' ? raw.subtitle.bn : '';

  // Introduction
  const intro = raw.content?.introduction || raw.explanation?.simple?.en || (typeof raw.explanation === 'string' ? raw.explanation : '');
  const introBn = raw.explanation?.simple?.bn || '';

  // Core Concepts
  const coreConcepts = raw.content?.coreConcepts || (
    raw.explanation?.deepDive ? [
      {
        title: 'Core Deep Dive',
        body: typeof raw.explanation.deepDive === 'object' ? raw.explanation.deepDive.en : raw.explanation.deepDive
      }
    ] : []
  );

  // SQL Syntax & Explanations
  const sqlSyntax = raw.content?.sqlSyntax || raw.codeExample?.sql || (typeof raw.codeExample === 'string' ? raw.codeExample : '');
  const explanation = raw.content?.explanation || (
    raw.codeExample?.explanation ? [
      typeof raw.codeExample.explanation === 'object' ? raw.codeExample.explanation.en : raw.codeExample.explanation
    ] : []
  );

  // Before / After Table
  const sampleBeforeAfter = raw.content?.sampleBeforeAfter || (
    raw.codeExample?.expectedOutput ? {
      table: 'Sample Query Result',
      before: [],
      after: raw.codeExample.expectedOutput.rows || []
    } : null
  );

  // Common Mistakes
  const commonMistakes = raw.content?.commonMistakes || (
    raw.commonMistakes ? raw.commonMistakes.map(m => typeof m === 'object' ? m.en : m) : []
  );

  // Practice Exercise
  const practice = raw.content?.practiceExercise || (
    raw.practice ? {
      instructions: typeof raw.practice.instructions === 'object' ? raw.practice.instructions.en : raw.practice.instructions,
      defaultCode: raw.practice.starterQuery || raw.practice.defaultCode || sqlSyntax,
      solution: raw.practice.solution,
      hint: typeof raw.practice.hint === 'object' ? raw.practice.hint.en : raw.practice.hint
    } : null
  );

  // Quiz
  const rawQuiz = raw.content?.quiz || raw.quiz;
  const quiz = rawQuiz ? {
    question: typeof rawQuiz.question === 'object' ? rawQuiz.question.en : rawQuiz.question,
    options: rawQuiz.options || [],
    correctIndex: rawQuiz.correctIndex !== undefined ? rawQuiz.correctIndex : (rawQuiz.correctAnswer !== undefined ? rawQuiz.correctAnswer : 0),
    explanation: typeof rawQuiz.explanation === 'object' ? rawQuiz.explanation.en : (rawQuiz.explanation || '')
  } : null;

  return {
    ...raw,
    id: raw.id,
    lessonNumber,
    moduleId,
    title: titleStr,
    titleBn,
    subtitle: subtitleStr,
    subtitleBn,
    estimatedMinutes: raw.estimatedMinutes || (raw.duration ? parseInt(raw.duration, 10) : 20),
    content: {
      introduction: intro,
      introductionBn: introBn,
      coreConcepts,
      sqlSyntax,
      explanation,
      sampleBeforeAfter,
      commonMistakes,
      practiceExercise: practice,
      quiz
    }
  };
}

const rawLessons = [
  ...module1Lessons,
  ...module2Lessons,
  ...module3Lessons,
  ...module4Lessons,
  ...module5Lessons,
  ...module6Lessons,
  ...module7Lessons,
  ...module8Lessons,
  ...module9Lessons,
  ...module10Lessons
];

export const MYSQL_LESSONS = rawLessons.map((l, idx) => normalizeLesson(l, idx));

export const MYSQL_MODULES = [
  {
    id: 'mysql-mod-1',
    moduleNumber: 1,
    title: 'Module 1: Database Fundamentals',
    description: 'Understand structured data, relational tables, columns, rows, schemas, and setting up MySQL clients.',
    lessonCount: 6,
    lessonIds: MYSQL_LESSONS.slice(0, 6).map(l => l.id)
  },
  {
    id: 'mysql-mod-2',
    moduleNumber: 2,
    title: 'Module 2: SQL Fundamentals',
    description: 'Learn SQL syntax, datatypes, CREATE TABLE, INSERT INTO, and SELECT column projections.',
    lessonCount: 6,
    lessonIds: MYSQL_LESSONS.slice(6, 12).map(l => l.id)
  },
  {
    id: 'mysql-mod-3',
    moduleNumber: 3,
    title: 'Module 3: Filtering and Sorting',
    description: 'Master WHERE filters, comparison & logical operators, pattern matching with LIKE, NULL handling, and ORDER BY.',
    lessonCount: 6,
    lessonIds: MYSQL_LESSONS.slice(12, 18).map(l => l.id)
  },
  {
    id: 'mysql-mod-4',
    moduleNumber: 4,
    title: 'Module 4: Changing and Managing Data',
    description: 'Safely UPDATE, DELETE, ALTER TABLE structures, manage PRIMARY KEYs, and enforce integrity constraints.',
    lessonCount: 6,
    lessonIds: MYSQL_LESSONS.slice(18, 24).map(l => l.id)
  },
  {
    id: 'mysql-mod-5',
    moduleNumber: 5,
    title: 'Module 5: Relationships and Database Design',
    description: 'Explore Foreign Keys, 1:1, 1:N, M:N relationships, Junction tables, and 1NF-3NF normalization.',
    lessonCount: 6,
    lessonIds: MYSQL_LESSONS.slice(24, 30).map(l => l.id)
  },
  {
    id: 'mysql-mod-6',
    moduleNumber: 6,
    title: 'Module 6: SQL Joins',
    description: 'Combine data with INNER JOIN, LEFT JOIN, RIGHT JOIN, CROSS JOIN, Self Joins, and multi-table pipelines.',
    lessonCount: 6,
    lessonIds: MYSQL_LESSONS.slice(30, 36).map(l => l.id)
  },
  {
    id: 'mysql-mod-7',
    moduleNumber: 7,
    title: 'Module 7: Aggregation and Subqueries',
    description: 'Compute metrics with COUNT, SUM, AVG, GROUP BY, HAVING, and subqueries in SELECT, FROM, and WHERE.',
    lessonCount: 6,
    lessonIds: MYSQL_LESSONS.slice(36, 42).map(l => l.id)
  },
  {
    id: 'mysql-mod-8',
    moduleNumber: 8,
    title: 'Module 8: Intermediate and Advanced SQL',
    description: 'Conditional CASE expressions, string/date math, UNION ALL, CTEs with WITH, and Window Functions (ROW_NUMBER, RANK).',
    lessonCount: 6,
    lessonIds: MYSQL_LESSONS.slice(42, 48).map(l => l.id)
  },
  {
    id: 'mysql-mod-9',
    moduleNumber: 9,
    title: 'Module 9: Professional Database Skills',
    description: 'B-Tree indexes, EXPLAIN query optimization, ACID transactions (COMMIT/ROLLBACK), Views, and Triggers.',
    lessonCount: 6,
    lessonIds: MYSQL_LESSONS.slice(48, 54).map(l => l.id)
  },
  {
    id: 'mysql-mod-10',
    moduleNumber: 10,
    title: 'Module 10: Security, Reliability, and Projects',
    description: 'User permissions, SQL Injection prevention with parameterized queries, backups, and e-commerce capstone project.',
    lessonCount: 6,
    lessonIds: MYSQL_LESSONS.slice(54, 60).map(l => l.id)
  }
];
