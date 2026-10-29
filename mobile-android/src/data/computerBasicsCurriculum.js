// Web-101: Computer & Web Fundamentals
// Complete 32-Lesson Curriculum for Computer Hardware and Software Fundamentals
// Instructor: Professor K M Akkas Ali (akkas@juniv.edu), IIT, Jahangirnagar University
// Ultra-Engaging, 14-to-16-Year-Old Friendly with Deep Analogies & Bilingual (English + বাংলা) Explanations

import { MODULE_1_LESSONS } from './lessonsData/module1.js';
import { MODULE_2_LESSONS } from './lessonsData/module2.js';
import { MODULE_3_LESSONS } from './lessonsData/module3.js';
import { MODULE_4_LESSONS } from './lessonsData/module4.js';
import { MODULE_5_LESSONS } from './lessonsData/module5.js';
import { MODULE_6_LESSONS } from './lessonsData/module6.js';

export const COMPUTER_BASICS_TRACK = {
  id: 'computer-basics',
  title: 'Computer Hardware & Software Fundamentals',
  subtitle: {
    en: 'Master hardware, software, CPU architecture, memory, I/O devices & operating systems',
    bn: 'হার্ডওয়্যার, সফটওয়্যার, সিপিইউ আর্কিটেকচার, মেমোরি, ইনপুট/আউটপুট এবং অপারেটিং সিস্টেমের সম্পূর্ণ পাঠ',
  },
  description: {
    en: 'Web-101: Comprehensive Computer Hardware & Software Fundamentals covering all 6 core lecture files: Working Principles, CPU Architecture, Bus Standards, Memory Hierarchy, Input/Output Devices, and Operating Systems with interactive animated visualizers.',
    bn: 'ওয়েব-১০১: কম্পিউটার হার্ডওয়্যার ও সফটওয়্যার ফান্ডামেন্টালসের পূর্ণাঙ্গ কোর্স। সিপিইউ, বাস সিস্টেম, মেমোরি, ইনপুট ও আউটপুট ডিভাইস এবং অপারেটিং সিস্টেমের প্রতিটি বিষয় সহজ উপমা ও লাইভ অ্যানিমেশনের মাধ্যমে শিখুন।',
  },
  icon: 'cpu',
  color: 'from-emerald-500 via-teal-600 to-sky-600',
  accentColor: '#10b981',
  badge: '32 Lessons • Web-101 Complete Mastery',
  category: 'Foundations',
  totalLessons: 32,
};

export const COMPUTER_BASICS_LESSONS = [
  ...MODULE_1_LESSONS,
  ...MODULE_2_LESSONS,
  ...MODULE_3_LESSONS,
  ...MODULE_4_LESSONS,
  ...MODULE_5_LESSONS,
  ...MODULE_6_LESSONS,
];

export default COMPUTER_BASICS_LESSONS;
