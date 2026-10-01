import React from 'react';
import {
  FileCode,
  FileJson,
  Database,
  Terminal,
  FileText,
  Code2,
} from 'lucide-react';

// Maps file extensions to programming languages
export const EXTENSION_TO_LANGUAGE = {
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'css',
  sass: 'css',
  less: 'css',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'react',
  ts: 'typescript',
  tsx: 'react',
  py: 'python',
  json: 'json',
  sql: 'sql',
  cpp: 'cpp',
  cc: 'cpp',
  c: 'c',
  h: 'cpp',
  hpp: 'cpp',
  java: 'java',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  md: 'markdown',
  markdown: 'markdown',
  txt: 'text',
};

export const LANGUAGE_LABELS = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  react: 'React / JSX',
  jsx: 'JSX',
  tsx: 'TSX',
  html: 'HTML5',
  css: 'CSS3',
  sql: 'SQL',
  cpp: 'C++',
  c: 'C',
  java: 'Java',
  shell: 'Bash / Shell',
  json: 'JSON',
  markdown: 'Markdown',
  text: 'Plain Text',
};

// Guess language from filename
export const getLanguageFromFilename = (filename = '') => {
  if (!filename || !filename.includes('.')) return null;
  const ext = filename.split('.').pop().toLowerCase();
  return EXTENSION_TO_LANGUAGE[ext] || null;
};

// Get rich file metadata and icon styling for VS Code tabs
export const getFileMeta = (filename = '', language = '') => {
  const cleanName = filename.trim();
  const guessedLang = getLanguageFromFilename(cleanName);
  const langKey = (language || guessedLang || 'javascript').toLowerCase();

  switch (langKey) {
    case 'html':
      return {
        name: cleanName || 'index.html',
        language: 'html',
        label: 'HTML',
        color: '#e44d26',
        badge: '</>',
        badgeBg: 'bg-[#e44d26]/15 text-[#e44d26] border-[#e44d26]/30',
        dotColor: '#e44d26',
      };
    case 'css':
      return {
        name: cleanName || 'styles.css',
        language: 'css',
        label: 'CSS',
        color: '#264de4',
        badge: '#',
        badgeBg: 'bg-[#264de4]/15 text-[#4285f4] border-[#264de4]/30',
        dotColor: '#4285f4',
      };
    case 'javascript':
      return {
        name: cleanName || 'script.js',
        language: 'javascript',
        label: 'JS',
        color: '#f7df1e',
        badge: 'JS',
        badgeBg: 'bg-[#f7df1e]/15 text-[#f7df1e] border-[#f7df1e]/30',
        dotColor: '#f7df1e',
      };
    case 'typescript':
      return {
        name: cleanName || 'index.ts',
        language: 'typescript',
        label: 'TS',
        color: '#3178c6',
        badge: 'TS',
        badgeBg: 'bg-[#3178c6]/15 text-[#3178c6] border-[#3178c6]/30',
        dotColor: '#3178c6',
      };
    case 'react':
    case 'jsx':
    case 'tsx':
      return {
        name: cleanName || 'Component.jsx',
        language: 'react',
        label: 'React',
        color: '#61dafb',
        badge: '⚛',
        badgeBg: 'bg-[#61dafb]/15 text-[#61dafb] border-[#61dafb]/30',
        dotColor: '#61dafb',
      };
    case 'python':
      return {
        name: cleanName || 'main.py',
        language: 'python',
        label: 'Python',
        color: '#3776ab',
        badge: 'Py',
        badgeBg: 'bg-[#3776ab]/15 text-[#ffd343] border-[#3776ab]/30',
        dotColor: '#ffd343',
      };
    case 'json':
      return {
        name: cleanName || 'data.json',
        language: 'json',
        label: 'JSON',
        color: '#cbcb41',
        badge: '{ }',
        badgeBg: 'bg-[#cbcb41]/15 text-[#cbcb41] border-[#cbcb41]/30',
        dotColor: '#cbcb41',
      };
    case 'sql':
      return {
        name: cleanName || 'schema.sql',
        language: 'sql',
        label: 'SQL',
        color: '#e38c00',
        badge: 'SQL',
        badgeBg: 'bg-[#e38c00]/15 text-[#e38c00] border-[#e38c00]/30',
        dotColor: '#e38c00',
      };
    case 'cpp':
    case 'c':
      return {
        name: cleanName || 'main.cpp',
        language: 'cpp',
        label: 'C++',
        color: '#00599c',
        badge: 'C++',
        badgeBg: 'bg-[#00599c]/15 text-[#659ad2] border-[#00599c]/30',
        dotColor: '#659ad2',
      };
    case 'java':
      return {
        name: cleanName || 'Main.java',
        language: 'java',
        label: 'Java',
        color: '#b07219',
        badge: '☕',
        badgeBg: 'bg-[#b07219]/15 text-[#f89820] border-[#b07219]/30',
        dotColor: '#f89820',
      };
    case 'shell':
    case 'bash':
      return {
        name: cleanName || 'run.sh',
        language: 'shell',
        label: 'Bash',
        color: '#89e051',
        badge: '>_',
        badgeBg: 'bg-[#89e051]/15 text-[#89e051] border-[#89e051]/30',
        dotColor: '#89e051',
      };
    case 'markdown':
      return {
        name: cleanName || 'README.md',
        language: 'markdown',
        label: 'MD',
        color: '#42a5f5',
        badge: 'M↓',
        badgeBg: 'bg-[#42a5f5]/15 text-[#42a5f5] border-[#42a5f5]/30',
        dotColor: '#42a5f5',
      };
    default:
      return {
        name: cleanName || 'file.txt',
        language: langKey || 'text',
        label: (langKey || 'Code').toUpperCase(),
        color: '#858585',
        badge: '📄',
        badgeBg: 'bg-white/10 text-[#cccccc] border-white/20',
        dotColor: '#858585',
      };
  }
};

// Icon renderer component for VS Code tab
export const FileTabIcon = ({ filename, language, size = 'sm' }) => {
  const meta = getFileMeta(filename, language);
  return (
    <span
      className={`inline-flex items-center justify-center font-mono font-bold rounded shrink-0 select-none border ${meta.badgeBg} ${
        size === 'sm' ? 'w-4 h-4 text-[9px] px-0.5' : 'w-5 h-5 text-[11px] px-1'
      }`}
      style={{ minWidth: size === 'sm' ? '16px' : '20px' }}
      title={meta.label}
    >
      {meta.badge}
    </span>
  );
};

// Normalize any snippet object into an array of files
export const normalizeSnippetFiles = (snippet) => {
  if (!snippet) return [];

  if (Array.isArray(snippet.files) && snippet.files.length > 0) {
    return snippet.files
      .filter((f) => f && f.code !== undefined && f.code !== null)
      .map((f, i) => ({
        name: (f.name || `file${i + 1}`).trim(),
        language: (f.language || 'javascript').toLowerCase().trim(),
        code: f.code,
      }));
  }

  if (snippet.code && typeof snippet.code === 'string') {
    return [
      {
        name: (snippet.title || 'snippet.js').trim(),
        language: (snippet.language || 'javascript').toLowerCase().trim(),
        code: snippet.code,
      },
    ];
  }

  return [];
};

// Preset templates for quick multi-file creation
export const SNIPPET_PRESETS = [
  {
    id: 'web',
    title: 'Web (HTML + CSS + JS)',
    description: 'Frontend webpage with HTML markup, styling, and behavior',
    files: [
      {
        name: 'index.html',
        language: 'html',
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Course 518 Demo</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="card">
    <h1>Hello CS-518!</h1>
    <p>Welcome to our course project.</p>
    <button id="actionBtn">Click Me</button>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        name: 'styles.css',
        language: 'css',
        code: `body {
  font-family: system-ui, sans-serif;
  background: #0f1419;
  color: #e7e9ea;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.card {
  background: #16181c;
  border: 1px solid #2f3336;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  text-align: center;
}

button {
  background: #1d9bf0;
  color: white;
  border: none;
  padding: 0.6rem 1.4rem;
  border-radius: 9999px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease;
}

button:hover {
  transform: scale(1.05);
}`,
      },
      {
        name: 'script.js',
        language: 'javascript',
        code: `document.getElementById('actionBtn').addEventListener('click', () => {
  console.log('Action triggered!');
  alert('Connected HTML, CSS, and JS successfully in Course 518!');
});`,
      },
    ],
  },
  {
    id: 'react',
    title: 'React + CSS',
    description: 'React component paired with custom CSS stylesheet',
    files: [
      {
        name: 'UserProfile.jsx',
        language: 'react',
        code: `import React, { useState } from 'react';
import './UserProfile.css';

export const UserProfile = ({ username, role = 'Student' }) => {
  const [likes, setLikes] = useState(0);

  return (
    <div className="profile-container">
      <div className="avatar-placeholder">{username[0]?.toUpperCase()}</div>
      <h3 className="profile-name">@{username}</h3>
      <span className="role-tag">{role}</span>
      <button onClick={() => setLikes(l => l + 1)} className="like-btn">
        ❤️ {likes} Likes
      </button>
    </div>
  );
};

export default UserProfile;`,
      },
      {
        name: 'UserProfile.css',
        language: 'css',
        code: `.profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: #16181c;
  border: 1px solid #2f3336;
  border-radius: 1.25rem;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1d9bf0;
  color: white;
  display: grid;
  place-items: center;
  font-weight: bold;
}

.role-tag {
  font-size: 0.75rem;
  background: rgba(29, 155, 240, 0.15);
  color: #1d9bf0;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
}`,
      },
    ],
  },
  {
    id: 'python_data',
    title: 'Python + JSON',
    description: 'Python script processing a structured JSON dataset',
    files: [
      {
        name: 'analyzer.py',
        language: 'python',
        code: `import json

def load_and_analyze(filepath="data.json"):
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    students = data.get("students", [])
    total_score = sum(s["grade"] for s in students)
    avg = total_score / max(1, len(students))
    
    print(f"Total Enrolled: {len(students)}")
    print(f"Cohort Average: {avg:.2f}%")
    return avg

if __name__ == "__main__":
    load_and_analyze()`,
      },
      {
        name: 'data.json',
        language: 'json',
        code: `{
  "course": "CS-518",
  "term": "Fall 2026",
  "students": [
    { "id": 1, "name": "Nasir", "grade": 98 },
    { "id": 2, "name": "Alex", "grade": 94 },
    { "id": 3, "name": "Jordan", "grade": 91 }
  ]
}`,
      },
    ],
  },
];
