import { CHAPTER_1_LESSONS } from './chapter1';
import { CHAPTER_2_LESSONS } from './chapter2';
import { CHAPTER_3_LESSONS } from './chapter3';
import { CHAPTER_4_LESSONS } from './chapter4';
import { CHAPTER_5_LESSONS } from './chapter5';
import { CHAPTER_6_LESSONS } from './chapter6';
import { CHAPTER_7_LESSONS } from './chapter7';
import { CHAPTER_8_LESSONS } from './chapter8';
import { CHAPTER_9_LESSONS } from './chapter9';
import { CHAPTER_10_LESSONS } from './chapter10';

export const AI_LESSONS = [
  ...CHAPTER_1_LESSONS,
  ...CHAPTER_2_LESSONS,
  ...CHAPTER_3_LESSONS,
  ...CHAPTER_4_LESSONS,
  ...CHAPTER_5_LESSONS,
  ...CHAPTER_6_LESSONS,
  ...CHAPTER_7_LESSONS,
  ...CHAPTER_8_LESSONS,
  ...CHAPTER_9_LESSONS,
  ...CHAPTER_10_LESSONS,
];

export const AI_CHAPTERS = [
  { id: 1, title: { en: 'Chapter 1: Understanding Artificial Intelligence', bn: 'অধ্যায় ১: কৃত্রিম বুদ্ধিমত্তা বোঝা' }, count: 10, start: 1, end: 10 },
  { id: 2, title: { en: 'Chapter 2: The Evolution of AI and Why It Is Booming Now', bn: 'অধ্যায় ২: এআই-এর বিবর্তন এবং বর্তমান জয়জয়কার' }, count: 10, start: 11, end: 20 },
  { id: 3, title: { en: 'Chapter 3: How Computers and AI Actually Work', bn: 'অধ্যায় ৩: কম্পিউটার ও এআই কীভাবে কাজ করে' }, count: 10, start: 21, end: 30 },
  { id: 4, title: { en: 'Chapter 4: The Mathematics Behind AI, Without Fear', bn: 'অধ্যায় ৪: এআই-এর গাণিতিক ভিত্তি (ভয় ছাড়া)' }, count: 10, start: 31, end: 40 },
  { id: 5, title: { en: 'Chapter 5: Data, Machine Learning, and Neural Networks', bn: 'অধ্যায় ৫: ডেটা, মেশিন লার্নিং এবং নিউরাল নেটওয়ার্ক' }, count: 10, start: 41, end: 50 },
  { id: 6, title: { en: 'Chapter 6: Modern AI Models and Large Language Models', bn: 'অধ্যায় ৬: আধুনিক এআই মডেল ও লার্জ ল্যাঙ্গুয়েজ মডেল' }, count: 10, start: 51, end: 60 },
  { id: 7, title: { en: 'Chapter 7: AI Tools, Programming, and the Technology Stack', bn: 'অধ্যায় ৭: এআই টুলস, প্রোগ্রামিং এবং টেকনোলজি স্ট্যাক' }, count: 10, start: 61, end: 70 },
  { id: 8, title: { en: 'Chapter 8: Build Real AI Applications', bn: 'অধ্যায় ৮: বাস্তব এআই অ্যাপ্লিকেশন তৈরি' }, count: 10, start: 71, end: 80 },
  { id: 9, title: { en: 'Chapter 9: The Future of AI, Its Risks, and Its Opportunities', bn: 'অধ্যায় ৯: এআই-এর ভবিষ্যৎ, ঝুঁকি ও সম্ভাবনা' }, count: 10, start: 81, end: 90 },
  { id: 10, title: { en: 'Chapter 10: Build Your Own AI and Become an AI Creator', bn: 'অধ্যায় ১০: নিজের এআই তৈরি করুন ও এআই ক্রিয়েটর হন' }, count: 10, start: 91, end: 100 },
];

export default AI_LESSONS;
