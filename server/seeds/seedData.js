const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');

const studentsData = [
  { name: 'Nasir Uddin', username: 'nasir', email: 'nasir@course518.edu', bio: 'CS-518 enthusiast. Building full-stack distributed systems & UI polish.' },
  { name: 'Sarah Chen', username: 'sarah_c', email: 'sarah@course518.edu', bio: 'Front-end engineer. React, Tailwind CSS, & accessible web components.' },
  { name: 'Marcus Davies', username: 'marcus_d', email: 'marcus@course518.edu', bio: 'Backend architecture geek. Express, Go, and database optimization.' },
  { name: 'Priya Kapoor', username: 'priya_k', email: 'priya@course518.edu', bio: 'Machine learning & cloud infra. Big data pipelines and Python.' },
  { name: 'Elena Rostova', username: 'elena_r', email: 'elena@course518.edu', bio: 'Systems programming, concurrency, and security testing.' },
  { name: 'Liam O’Connor', username: 'liam_oc', email: 'liam@course518.edu', bio: 'Mobile first web apps, GraphQL, and micro-animations.' },
  { name: 'Aisha Al-Mansoor', username: 'aisha_m', email: 'aisha@course518.edu', bio: 'Full-stack builder. Passionate about human-computer interaction.' },
  { name: 'David Kim', username: 'david_k', email: 'david@course518.edu', bio: 'Algorithms competitor and open source contributor.' },
  { name: 'Sofia Rodriguez', username: 'sofia_r', email: 'sofia@course518.edu', bio: 'Product design & frontend prototyping. CSS wizard.' },
  { name: 'Lucas Meyer', username: 'lucas_m', email: 'lucas@course518.edu', bio: 'DevOps & CI/CD automation. Docker, Kubernetes, and monitoring.' },
  { name: 'Zainab Fatima', username: 'zainab_f', email: 'zainab@course518.edu', bio: 'Web security and API authentication patterns.' },
  { name: 'Ethan Walker', username: 'ethan_w', email: 'ethan@course518.edu', bio: 'Performance optimization and WebAssembly experiments.' },
  { name: 'Chloe Dubois', username: 'chloe_d', email: 'chloe@course518.edu', bio: 'UI/UX enthusiast, Figma to React translation.' },
  { name: 'Mateo Santos', username: 'mateo_s', email: 'mateo@course518.edu', bio: 'NoSQL modeling, caching strategies, and Redis.' },
  { name: 'Hannah Wright', username: 'hannah_w', email: 'hannah@course518.edu', bio: 'JavaScript runtime nerd. V8 internals and Node streams.' },
  { name: 'Noah Patel', username: 'noah_p', email: 'noah@course518.edu', bio: 'Interactive visualizations with D3 and Canvas.' },
  { name: 'Emily Zhang', username: 'emily_z', email: 'emily@course518.edu', bio: 'State management researcher. Redux, Zustand, and signals.' },
  { name: 'Gabriel Silva', username: 'gabriel_s', email: 'gabriel@course518.edu', bio: 'API design, REST guidelines, and clean code principles.' },
  { name: 'Olivia Martin', username: 'olivia_m', email: 'olivia@course518.edu', bio: 'Testing automation, Jest, Cypress, and Playwright.' },
  { name: 'Daniel Brooks', username: 'daniel_b', email: 'daniel@course518.edu', bio: 'Asynchronous event architecture and WebSockets.' },
  { name: 'Maya Lin', username: 'maya_l', email: 'maya@course518.edu', bio: 'Design systems, token-driven CSS, and micro-interactions.' },
  { name: 'Jackson Reed', username: 'jackson_r', email: 'jackson@course518.edu', bio: 'Serverless architecture, Edge functions, and cloud costs.' },
  { name: 'Amira Hassan', username: 'amira_h', email: 'amira@course518.edu', bio: 'Database indexing, query explain plans, and sharding.' },
  { name: 'Benjamin Cole', username: 'ben_c', email: 'ben@course518.edu', bio: 'Linux tools, shell scripting, and developer productivity.' },
  { name: 'Grace Taylor', username: 'grace_t', email: 'grace@course518.edu', bio: 'Accessibility (a11y) advocate and semantic HTML purist.' },
  { name: 'Kevin Nguyen', username: 'kevin_n', email: 'kevin@course518.edu', bio: 'React Server Components and hydration strategies.' },
  { name: 'Layla Morales', username: 'layla_m', email: 'layla@course518.edu', bio: 'Cybersecurity student. Zero trust architecture.' },
  { name: 'Samuel Becker', username: 'sam_b', email: 'sam@course518.edu', bio: 'Functional programming in modern TypeScript.' },
  { name: 'Isabella Rossi', username: 'isabella_r', email: 'isabella@course518.edu', bio: 'Distributed state, CRDTs, and local-first software.' },
  { name: 'Ryan Murphy', username: 'ryan_m', email: 'ryan@course518.edu', bio: 'Containerization, microservices, and observability.' },
  { name: 'Fatima Zahra', username: 'fatima_z', email: 'fatima@course518.edu', bio: 'Cloud architecture and scalable web platforms.' },
  { name: 'Tyler Scott', username: 'tyler_s', email: 'tyler@course518.edu', bio: 'CSS Grid, Flexbox layouts, and browser rendering engines.' },
  { name: 'Ava Mitchell', username: 'ava_m', email: 'ava@course518.edu', bio: 'Graph databases, Neo4j, and network topology analysis.' },
  { name: 'Henry Adams', username: 'henry_a', email: 'henry@course518.edu', bio: 'Compiler design, AST transformations, and Babel plugins.' },
  { name: 'Mia Tanaka', username: 'mia_t', email: 'mia@course518.edu', bio: 'Progressive Web Apps (PWAs) and offline caching.' }
];

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 10) {
      console.log(`Database already seeded with ${userCount} users.`);
      
      // Check if existing posts need code snippets
      const codePostCount = await Post.countDocuments({ 'codeSnippet.code': { $exists: true, $ne: null } });
      if (codePostCount === 0) {
        console.log('Attaching initial code snippets to existing posts...');
        const posts = await Post.find().limit(5);
        if (posts.length > 0) {
          posts[0].codeSnippet = {
            title: 'useSelectiveState.js',
            language: 'react',
            code: `import { createContext, useContext } from 'react';\n\n// Efficient context selector pattern for CS-518\nexport function createStoreContext(useValue) {\n  const Context = createContext(null);\n  \n  return {\n    Provider: ({ children, ...props }) => {\n      const value = useValue(props);\n      return <Context.Provider value={value}>{children}</Context.Provider>;\n    },\n    useSelector: (selector) => {\n      const store = useContext(Context);\n      if (!store) throw new Error('Missing Provider');\n      return selector(store);\n    }\n  };\n}`,
          };
          await posts[0].save();
        }
        if (posts.length > 1) {
          posts[1].codeSnippet = {
            title: 'prefixCompoundIndex.js',
            language: 'javascript',
            code: `// MongoDB compound index order matters!\n// Matching query: { author: userA, createdAt: { $gt: yesterday } }\npostSchema.index({ author: 1, createdAt: -1 });\n\n// Query optimization:\nconst userFeed = await Post.find({\n  author: userId,\n  createdAt: { $gte: sinceDate }\n})\n.sort({ createdAt: -1 })\n.hint({ author: 1, createdAt: -1 })\n.explain('executionStats');`,
          };
          await posts[1].save();
        }
        if (posts.length > 2) {
          posts[2].codeSnippet = {
            title: 'dataset_pipeline.py',
            language: 'python',
            code: `import pandas as pd\nimport numpy as np\n\ndef clean_telemetry_batch(raw_df: pd.DataFrame) -> pd.DataFrame:\n    """Preprocess course lab benchmarks and remove outliers."""\n    df = raw_df.copy()\n    q1 = df['latency_ms'].quantile(0.25)\n    q3 = df['latency_ms'].quantile(0.75)\n    iqr = q3 - q1\n    \n    filtered = df[(df['latency_ms'] >= q1 - 1.5 * iqr) & \n                  (df['latency_ms'] <= q3 + 1.5 * iqr)]\n    return filtered.sort_values(by='timestamp', ascending=False)`,
          };
          await posts[2].save();
        }
      }
      return;
    }

    console.log('Seeding CS-518 course community data (~35 members + instructor)...');

    // 1. Create Admin (Nasir)
    const adminUser = await User.create({
      name: 'Nasir',
      username: 'nasir',
      email: 'nasir@course518.edu',
      password: 'password123',
      bio: 'Full-stack developer & CS-518 community member.',
      role: 'admin',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=nasir',
      isApproved: true,
    });

    // 2. Create 35 Students
    const studentUsers = [];
    for (const s of studentsData) {
      const student = await User.create({
        ...s,
        password: 'password123',
        role: 'student',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${s.username}`,
        isApproved: true,
      });
      studentUsers.push(student);
    }

    console.log(`Created 1 admin and ${studentUsers.length} student profiles.`);

    // 3. Create Official Announcements
    const announcement1 = await Post.create({
      author: adminUser._id,
      content: '📢 Welcome to the official CS-518 Community Network! Please keep all course discussions, project team formation, and sprint check-ins here. Milestone 1 review is next Friday.',
      isAnnouncement: true,
      isPinned: true,
      likesCount: 28,
      commentsCount: 4,
    });

    const announcement2 = await Post.create({
      author: adminUser._id,
      content: '📌 Office hours today are moved to Room 402B due to the faculty seminar. Feel free to drop by with your MongoDB schema designs!',
      isAnnouncement: true,
      isPinned: false,
      likesCount: 14,
      commentsCount: 2,
    });

    // 4. Create Student Discussion Posts
    const samplePosts = [
      {
        author: studentUsers[0]._id, // Nasir
        content: 'Today I finally understood how React Context and memoized selectors avoid cascade renders. The key is splitting state from dispatch! Pretty satisfying.',
        likesCount: 19,
        commentsCount: 3,
      },
      {
        author: studentUsers[1]._id, // Sarah
        content: 'Anyone looking for a partner for the microservices project? Looking to focus on high-performance GraphQL or REST endpoints with clean API documentation.',
        likesCount: 8,
        commentsCount: 5,
      },
      {
        author: studentUsers[2]._id, // Marcus
        content: 'Friendly reminder: compound indexes on MongoDB collections only optimize queries that match prefixes! Just saved 400ms on my feed queries.',
        likesCount: 22,
        commentsCount: 2,
      },
      {
        author: studentUsers[3]._id, // Priya
        content: 'Study session for the midterm in the CS Library lounge at 4:30 PM. We will review concurrency, transaction isolation levels, and JWT auth flow.',
        likesCount: 16,
        commentsCount: 4,
      },
      {
        author: studentUsers[4]._id, // Elena
        content: 'Pro tip for debugging CORS headers in Express: always place your cors() middleware before all route definitions. Spent an hour figuring that out last night.',
        likesCount: 25,
        commentsCount: 3,
      },
      {
        author: studentUsers[8]._id, // Sofia
        content: 'The new design tokens we set up for the cohort app feel so clean! Dark mode with zinc surfaces and subtle indigo accents is definitely the vibe.',
        likesCount: 15,
        commentsCount: 1,
      },
      {
        author: studentUsers[9]._id, // Lucas
        content: 'Docker Compose makes multi-container local testing so much easier. Node + MongoDB spun up in one command without manual host configuration.',
        likesCount: 12,
        commentsCount: 2,
      },
      {
        author: studentUsers[11]._id, // Ethan
        content: 'Who is staying late at the lab tonight? Coffee is brewing in the 3rd floor kitchenette!',
        likesCount: 18,
        commentsCount: 3,
      },
    ];

    const createdPosts = await Post.insertMany(samplePosts);

    // 5. Create Sample Comments
    await Comment.create([
      {
        post: announcement1._id,
        author: studentUsers[0]._id,
        content: 'Excited for this semester! Great platform for our class.',
      },
      {
        post: announcement1._id,
        author: studentUsers[1]._id,
        content: 'Glad we have our own private space without external social media noise.',
      },
      {
        post: createdPosts[0]._id,
        author: studentUsers[2]._id,
        content: 'Totally agree Nasir! Once you isolate dispatch from data, rerenders drop dramatically.',
      },
      {
        post: createdPosts[0]._id,
        author: studentUsers[3]._id,
        content: 'Could you share the code snippet during tomorrow’s lab session?',
      },
      {
        post: createdPosts[1]._id,
        author: studentUsers[4]._id,
        content: 'I would love to team up Sarah! Sent you a message.',
      },
      {
        post: createdPosts[3]._id,
        author: studentUsers[6]._id,
        content: 'I will be there at 4:30 with study notes!',
      },
    ]);

    // 6. Create Mutual Follows among students to seed the social graph
    const followPairs = [
      [studentUsers[0]._id, studentUsers[1]._id],
      [studentUsers[0]._id, studentUsers[2]._id],
      [studentUsers[0]._id, studentUsers[3]._id],
      [studentUsers[0]._id, adminUser._id],
      [studentUsers[1]._id, studentUsers[0]._id],
      [studentUsers[1]._id, studentUsers[2]._id],
      [studentUsers[2]._id, studentUsers[0]._id],
      [studentUsers[3]._id, studentUsers[0]._id],
      [studentUsers[4]._id, studentUsers[0]._id],
      [studentUsers[5]._id, studentUsers[0]._id],
      [studentUsers[6]._id, studentUsers[1]._id],
      [studentUsers[7]._id, studentUsers[2]._id],
    ];

    for (const [follower, following] of followPairs) {
      await Follow.create({ follower, following });
    }

    // 7. Seed sample likes
    for (let i = 0; i < 5; i++) {
      await Like.create({
        post: createdPosts[0]._id,
        user: studentUsers[i]._id,
      });
    }

    console.log('✅ CS-518 Community Seed completed successfully!');
  } catch (err) {
    console.error('Seed error:', err);
  }
};

module.exports = seedDatabase;
