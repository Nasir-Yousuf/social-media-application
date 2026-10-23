// Realistic HTML lessons structured into levels and difficulty tiers for code practice.
// Covers all standard HTML tags including text formatting, links, media, lists, tables, forms, and semantic structure.

export const HTML_LESSONS = [
  // LEVEL 1: HTML BASICS & DOCUMENT STRUCTURE
  {
    id: 'html-1',
    level: 1,
    levelName: 'HTML Basics',
    lessonNumber: 1,
    title: 'Document Root & Head Metadata',
    difficulty: 'Beginner',
    description: 'Practice <html>, <head>, <title>, <meta>, <link>, and <style> tags.',
    snippet: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Webpage</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    body { font-family: sans-serif; }
  </style>
</head>
<body>
  <h1>Welcome to HTML</h1>
</body>
</html>`,
  },
  {
    id: 'html-2',
    level: 1,
    levelName: 'HTML Basics',
    lessonNumber: 2,
    title: 'Headings, Paragraphs & Line Breaks',
    difficulty: 'Beginner',
    description: 'Practice <h1> to <h6>, <p>, <br>, and <hr> horizontal rules.',
    snippet: `<h1>Main Title (H1)</h1>
<h2>Section Header (H2)</h2>
<h3>Subsection Header (H3)</h3>
<p>First paragraph with text content.<br>This starts on a new line.</p>
<hr>
<p>Second paragraph after horizontal line divider.</p>`,
  },
  {
    id: 'html-3',
    level: 1,
    levelName: 'HTML Basics',
    lessonNumber: 3,
    title: 'Basic Text Formatting',
    difficulty: 'Beginner',
    description: 'Type <strong>, <b>, <em>, <i>, <u>, <mark>, and <small>.',
    snippet: `<p>
  This text is <strong>important</strong> and <b>bold</b>.<br>
  This text is <em>emphasized</em> and <i>italicized</i>.<br>
  You can <u>underline</u> text or <mark>highlight key concepts</mark>.<br>
  <small>Disclaimer: This is small footnote text.</small>
</p>`,
  },
  {
    id: 'html-4',
    level: 1,
    levelName: 'HTML Basics',
    lessonNumber: 4,
    title: 'Advanced Formatting & Formulas',
    difficulty: 'Beginner',
    description: 'Type <del>, <ins>, <sub>, and <sup> for chemical & math formulas.',
    snippet: `<p>
  Original price: <del>$100</del> <ins>$75</ins> (Save 25%).
</p>
<p>
  Water formula: H<sub>2</sub>O<br>
  Math formula: x<sup>2</sup> + y<sup>2</sup> = z<sup>2</sup>
</p>`,
  },
  {
    id: 'html-5',
    level: 1,
    levelName: 'HTML Basics',
    lessonNumber: 5,
    title: 'Links & Images',
    difficulty: 'Beginner',
    description: 'Type <a> links, <img> tags, and responsive <picture> containers.',
    snippet: `<a href="https://example.com" target="_blank" rel="noopener">
  Visit Example Website
</a>

<picture>
  <source media="(min-width: 800px)" srcset="/img/large.jpg">
  <img src="/img/mobile.jpg" alt="Responsive Banner" width="400" height="200">
</picture>`,
  },

  // LEVEL 2: MEDIA, LISTS & TABLES
  {
    id: 'html-6',
    level: 2,
    levelName: 'Media & Embedded Content',
    lessonNumber: 6,
    title: 'Iframes & Subtitle Media Tracks',
    difficulty: 'Intermediate',
    description: 'Practice <iframe> external frames and media <track> captions.',
    snippet: `<iframe src="https://example.com/embed" width="560" height="315" title="Embedded Content"></iframe>

<video controls width="640">
  <source src="movie.mp4" type="video/mp4">
  <track src="subtitles_en.vtt" kind="subtitles" srclang="en" label="English">
</video>`,
  },
  {
    id: 'html-7',
    level: 2,
    levelName: 'Lists & Navigation',
    lessonNumber: 7,
    title: 'Unordered & Ordered Lists',
    difficulty: 'Intermediate',
    description: 'Type <ul>, <ol>, and <li> list items.',
    snippet: `<h3>Frontend Checklist</h3>
<ul>
  <li>Learn HTML tags</li>
  <li>Master CSS flexbox</li>
  <li>Write JavaScript logic</li>
</ul>

<h3>Installation Steps</h3>
<ol>
  <li>Download Node.js</li>
  <li>Run npm install</li>
</ol>`,
  },
  {
    id: 'html-8',
    level: 2,
    levelName: 'Lists & Navigation',
    lessonNumber: 8,
    title: 'Description Lists (<dl>, <dt>, <dd>)',
    difficulty: 'Intermediate',
    description: 'Practice description lists with <dl>, <dt> terms, and <dd> descriptions.',
    snippet: `<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language for web page structure.</dd>
  <dt>CSS</dt>
  <dd>Cascading Style Sheets for layout and aesthetics.</dd>
  <dt>JavaScript</dt>
  <dd>Programming language for client-side interactivity.</dd>
</dl>`,
  },
  {
    id: 'html-9',
    level: 2,
    levelName: 'Tables',
    lessonNumber: 9,
    title: 'HTML Tables & Captions',
    difficulty: 'Intermediate',
    description: 'Type <table>, <caption>, <tr>, <th>, and <td> elements.',
    snippet: `<table>
  <caption>Student Test Results</caption>
  <tr>
    <th>Student Name</th>
    <th>Subject</th>
    <th>Score</th>
  </tr>
  <tr>
    <td>Naimur Rahman</td>
    <td>HTML & CSS</td>
    <td>95%</td>
  </tr>
</table>`,
  },
  {
    id: 'html-10',
    level: 2,
    levelName: 'Tables',
    lessonNumber: 10,
    title: 'Advanced Table Sections & Column Groups',
    difficulty: 'Intermediate',
    description: 'Type <thead>, <tbody>, <tfoot>, <colgroup>, and <col> tags.',
    snippet: `<table>
  <colgroup>
    <col span="1" class="col-name">
    <col span="2" class="col-scores">
  </colgroup>
  <thead>
    <tr>
      <th>User</th>
      <th>WPM</th>
      <th>Accuracy</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Alex</td>
      <td>54</td>
      <td>98%</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td>Average</td>
      <td>54</td>
      <td>98%</td>
    </tr>
  </tfoot>
</table>`,
  },

  // LEVEL 3: FORMS & SEMANTIC STRUCTURE
  {
    id: 'html-11',
    level: 3,
    levelName: 'Forms & Inputs',
    lessonNumber: 11,
    title: 'Form Inputs & Buttons',
    difficulty: 'Intermediate',
    description: 'Practice <form>, <label>, <input>, and <button> controls.',
    snippet: `<form action="/submit" method="POST">
  <label for="user-email">Email Address:</label>
  <input type="email" id="user-email" name="email" required placeholder="you@example.com">

  <button type="submit" class="btn-primary">
    Register Account
  </button>
</form>`,
  },
  {
    id: 'html-12',
    level: 3,
    levelName: 'Forms & Inputs',
    lessonNumber: 12,
    title: 'Textareas & Select Dropgroups',
    difficulty: 'Intermediate',
    description: 'Type <textarea>, <select>, <option>, and <optgroup> elements.',
    snippet: `<label for="bio">Biography:</label>
<textarea id="bio" name="bio" rows="4" cols="40"></textarea>

<label for="country">Country:</label>
<select id="country" name="country">
  <optgroup label="Asia">
    <option value="bd">Bangladesh</option>
    <option value="in">India</option>
  </optgroup>
  <optgroup label="Europe">
    <option value="uk">United Kingdom</option>
  </optgroup>
</select>`,
  },
  {
    id: 'html-13',
    level: 3,
    levelName: 'Forms & Inputs',
    lessonNumber: 13,
    title: 'Fieldsets, Legends, Datalist & Output',
    difficulty: 'Advanced',
    description: 'Type <fieldset>, <legend>, <datalist>, and <output> elements.',
    snippet: `<form oninput="result.value=parseInt(a.value)+parseInt(b.value)">
  <fieldset>
    <legend>Calculator</legend>
    <input type="number" id="a" value="10"> +
    <input type="number" id="b" value="20"> =
    <output name="result" for="a b">30</output>
  </fieldset>

  <label for="browser">Browser Suggestion:</label>
  <input list="browser-list" id="browser" name="browser">
  <datalist id="browser-list">
    <option value="Chrome">
    <option value="Firefox">
    <option value="Safari">
  </datalist>
</form>`,
  },
  {
    id: 'html-14',
    level: 3,
    levelName: 'Semantic Page Layouts',
    lessonNumber: 14,
    title: 'Semantic Page Sections',
    difficulty: 'Advanced',
    description: 'Master <header>, <nav>, <main>, <section>, <article>, <aside>, <footer>.',
    snippet: `<header>
  <nav><a href="/">Home</a></nav>
</header>
<main>
  <section>
    <article>
      <h2>Semantic Web Architecture</h2>
      <p>Using structural HTML tags improves SEO and accessibility.</p>
    </article>
  </section>
  <aside>
    <h3>Related Topics</h3>
  </aside>
</main>
<footer>
  <p>&copy; 2026 Clearfeed</p>
</footer>`,
  },
  {
    id: 'html-15',
    level: 3,
    levelName: 'Interactive Elements',
    lessonNumber: 15,
    title: 'Details Accordion, Figures & Dialogs',
    difficulty: 'Advanced',
    description: 'Type <details>, <summary>, <dialog>, <figure>, <figcaption>, and <div>.',
    snippet: `<details>
  <summary>What is HTML5?</summary>
  <p>HTML5 is the latest markup standard for the Web.</p>
</details>

<figure>
  <img src="diagram.png" alt="Architecture Diagram">
  <figcaption>Fig 1. System Architecture</figcaption>
</figure>

<dialog id="favDialog">
  <p>Modal dialog content</p>
</dialog>`,
  },
];
