// Clearfeed Learn & Practice - Tailwind CSS Curriculum (30 Lessons)

export const TAILWIND_LESSONS = Array.from({ length: 30 }, (_, index) => {
  const order = index + 1;
  let chapter = 'Chapter 1: Foundations';
  if (order > 10 && order <= 20) chapter = 'Chapter 2: Components & Interaction';
  if (order > 20) chapter = 'Chapter 3: Production Skills';

  const topics = [
    'What Is Tailwind CSS & Utility-First Philosophy?',
    'Install & Configure Tailwind CSS v4',
    'Utility Classes vs Traditional CSS Rules',
    'Spacing, Padding (p-4), Margin (m-2) & Box Model',
    'Typography, Font Sizes (text-xl) & Leading',
    'Colors, Backgrounds (bg-sky-500) & Borders',
    'Flexbox Layouts (flex, items-center, justify-between)',
    'CSS Grid Layouts (grid, grid-cols-3, gap-4)',
    'Responsive Design & Breakpoints (sm, md, lg)',
    'Mini Project: Responsive Profile & Feature Card',
    'Hover (hover:scale-105), Focus & Active States',
    'Transitions, Animations & Transforms',
    'Positioning (absolute, relative, fixed, sticky)',
    'Dark Mode Strategy (dark:bg-[#121519])',
    'Styling Forms, Inputs & Accessible Buttons',
    'Reusable Component Patterns with Tailwind',
    'Container Queries & Advanced Responsiveness',
    'Arbitrary Values (w-[320px]) & Custom Classes',
    'Tailwind CSS Integration with React & JSX',
    'Project: Responsive Dashboard Interface',
    'Tailwind Theme Configuration & Design Tokens',
    'Combining Custom CSS with Tailwind Directives',
    'Accessible Design: Focus Indicators & Contrast',
    'Building Desktop & Mobile Navigation Menus',
    'Styling Dense Data Tables & List Layouts',
    'Styling Modals, Dropdowns & Floating Popovers',
    'Creating Reusable UI Design Systems',
    'Performance, Purging & Production CSS Builds',
    'Debugging Conflicting Utilities & Class Order',
    'Final Project: Production-Quality Web Application UI',
  ];

  const titleText = topics[index] || `Tailwind Lesson ${order}`;

  return {
    id: `tw-${String(order).padStart(2, '0')}`,
    track: 'tailwind',
    order: order,
    chapter: chapter,
    difficulty: order <= 10 ? 'Beginner' : order <= 20 ? 'Intermediate' : 'Advanced',
    title: {
      en: `${order}. ${titleText}`,
      bn: `${order}. ${titleText}`,
    },
    subtitle: {
      en: `Build responsive, modern UI using utility classes for ${titleText}.`,
      bn: `টেইলউইন্ড সিএসএস দিয়ে আধুনিক রেসপন্সিভ ডিজাইন শিখুন।`,
    },
    explanation: {
      simple: {
        en: `Tailwind CSS allows you to build custom user interfaces directly in your markup without writing traditional CSS files.`,
        bn: `টেইলউইন্ড সিএসএস দিয়ে সরাসরি HTML এইচটিএমএল ট্যাগে ক্লাস লিখে ডিজাইন তৈরি করা যায়।`,
      },
      analogy: {
        en: `Tailwind utility classes are like LEGO bricks: instead of carving a custom plastic shape, you snap together small reusable utility blocks!`,
        bn: `লেগো ব্লকের মতো ছোট ছোট ক্লাস মিলিয়ে ডিজাইন তৈরি করা।`,
      },
      technical: {
        en: `Tailwind compiles low-level utility classes into optimized CSS at build time with 0 unused CSS in production.`,
        bn: `বিল্ড টাইমে অব্যবহৃত সিএসএস বাদ দিয়ে অত্যন্ত অপটিমাইজড সিএসএস তৈরি হয়।`,
      },
    },
    outcomes: [
      `Master ${titleText}`,
      'Write live HTML + Tailwind code in sandbox preview',
      'Test responsiveness and state modifiers',
    ],
    starterCode: {
      html: `<div class="p-6 max-w-sm mx-auto bg-white dark:bg-[#121519] rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 space-y-4 font-sans">
  <div class="flex items-center gap-3">
    <div class="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold">TW</div>
    <div>
      <h3 class="text-sm font-bold text-neutral-900 dark:text-white">Tailwind Lesson ${order}</h3>
      <p class="text-xs text-neutral-500">Utility-first CSS</p>
    </div>
  </div>
  <button class="w-full py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
    ${titleText}
  </button>
</div>`,
      css: ``,
      javascript: ``,
    },
    exercise: {
      instructions: {
        en: `Modify the HTML code to add bg-sky-500 and rounded-2xl utilities.`,
        bn: `HTML কোডে bg-sky-500 ও rounded-2xl ক্লাস যোগ করুন।`,
      },
      hint: {
        en: 'Add class="bg-sky-500 rounded-2xl"',
        bn: 'bg-sky-500 যোগ করুন।',
      },
      solution: {
        html: `<div class="bg-sky-500 rounded-2xl p-4 text-white font-bold">Tailwind Live</div>`,
      },
      validation: {
        type: 'html_tags',
        requiredTags: ['div'],
        minTextLength: 3,
      },
    },
  };
});
