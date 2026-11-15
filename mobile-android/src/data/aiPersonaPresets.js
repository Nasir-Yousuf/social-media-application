/**
 * AI Companion Persona Presets & Language Configuration
 */
export const PERSONA_PRESETS = [
  {
    id: 'Socratic Coding Mentor',
    label: 'Socratic Coding Mentor 💡',
    desc: 'Guides you with questions, architectural mental models, and deep reasoning.',
  },
  {
    id: 'Friendly Study Partner',
    label: 'Friendly Study Partner 🤝',
    desc: 'Supportive classmate who quizzes you on lessons and keeps you motivated.',
  },
  {
    id: 'Architecture Reviewer',
    label: 'Architecture Reviewer 🏛️',
    desc: 'Senior systems engineer who reviews complexity, scaling, and edge cases.',
  },
  {
    id: 'English Partner',
    label: 'English Chatting Partner 🇬🇧',
    desc: 'Articulate coach who practices natural English and gently polishes phrasing.',
  },
  {
    id: 'Best Friend',
    label: 'Best Friend ✨',
    desc: 'Chill, hilarious, deeply caring companion to chat about life and code.',
  },
];

export const LANGUAGE_OPTIONS = [
  { id: 'auto', label: 'Auto Detect 🌐', desc: 'Matches Bengali, English, or mixed naturally' },
  { id: 'bn', label: 'বাংলা (Bangla) 🇧🇩', desc: 'Warm, natural Bengali conversation' },
  { id: 'en', label: 'English 🇬🇧', desc: 'Fluent, articulate English conversation' },
  { id: 'bilingual', label: 'Both / Banglish 💬', desc: 'Casual everyday blend of Bangla & English' },
];

export default {
  PERSONA_PRESETS,
  LANGUAGE_OPTIONS,
};
