// Module 1: Database Fundamentals (Lessons 1-6)
// Complete educational content for absolute beginners to databases.

export const MODULE_1_LESSONS = [
  {
    id: 'mysql-1',
    track: 'mysql',
    module: 1,
    moduleTitle: 'Module 1: Database Fundamentals',
    order: 1,
    difficulty: 'Beginner',
    title: {
      en: '1. What Is Data? Understanding Structured Data',
      bn: '১. ডেটা কী? স্ট্রাকচার্ড ডেটা পরিচিতি',
    },
    subtitle: {
      en: 'Explore how raw facts turn into organized, queryable digital information.',
      bn: 'কাঁচা উপাত্ত কীভাবে সুশৃঙ্খল ও বিশ্লেষণযোগ্য ডিজিটাল তথ্যে পরিণত হয়।',
    },
    duration: '15 mins',
    objectives: [
      'Understand the fundamental difference between raw data and meaningful information.',
      'Differentiate between structured, semi-structured, and unstructured data.',
      'Recognize why spreadsheets fail at scale and why relational structures are necessary.',
      'Identify rows (records) and columns (fields) in tabular structured formats.',
    ],
    prerequisites: 'No prior programming or database experience required!',
    explanation: {
      simple: {
        en: 'Data is a collection of raw, unorganized facts—such as numbers, names, dates, or prices. When we organize and give context to data (like stating that "25" is the age of student "Amina"), it becomes information. In the digital world, modern applications like YouTube, Instagram, and bank systems handle millions of facts every second. To manage this massive volume without losing details, we store information in structured tables made of rows and columns.',
        bn: 'ডেটা হলো অসংগঠিত কাঁচা তথ্য—যেমন কিছু সংখ্যা, নাম বা তারিখ। যখন এই ডেটাকে নির্দিষ্ট প্রেক্ষাপটে সাজানো হয়, তখন তা অর্থপূর্ণ তথ্যে রূপ নেয়। আজকের যুগে ফেসবুক, ইউটিউব বা ব্যাংকিং অ্যাপে কোটি কোটি ডেটা সুশৃঙ্খলভাবে পরিচালনার জন্য টেবিল বা রিল্যাশনাল ফরম্যাটে রাখা হয়।',
      },
      deepDive: {
        en: 'Structured data follows a strict schema where every item fits into predetermined categories with assigned data types (e.g., student_id is always an integer, birth_date is always a calendar date). Unlike an unformatted text document or an unstructured video file, structured data can be searched, sorted, filtered, and computed mathematically in fractions of a millisecond.',
        bn: 'স্ট্রাকচার্ড ডেটা একটি নির্দিষ্ট ছক বা স্কিমা মেনে চলে, যেখানে প্রতিটি কলামের নির্দিষ্ট টাইপ থাকে (যেমন বয়স সবসময় সংখ্যা, নাম সবসময় টেক্সট)। ফলে কম্পিউটার চোখের পলকে লক্ষ লক্ষ ডেটার মধ্য থেকে যেকোনো তথ্য খুঁজে বের করতে পারে।',
      },
      syntax: '/* Concept: Tabular Schema */\nTABLE: students (student_id INT, full_name VARCHAR, gpa DECIMAL)',
    },
    sampleData: {
      description: 'A structured representation of university student records:',
      columns: ['student_id', 'full_name', 'major', 'gpa'],
      rows: [
        { student_id: 1, full_name: 'Amina Rahman', major: 'Computer Science', gpa: 3.85 },
        { student_id: 2, full_name: 'Tanvir Hossain', major: 'Electrical Engineering', gpa: 3.40 },
        { student_id: 3, full_name: 'Nusrat Jahan', major: 'Computer Science', gpa: 3.92 },
      ],
    },
    queryExample: {
      title: 'Viewing All Fields in the Students Table',
      code: `-- Fetch all rows and columns from the students table
SELECT student_id, full_name, major, gpa
FROM students;`,
      explanation: [
        'Line 1: A SQL comment starting with `--` describing the intent of the query.',
        'Line 2: The SELECT clause lists the exact columns we want to inspect.',
        'Line 3: The FROM clause specifies the source table containing our structured records.',
        'Line 4: A semicolon (;) marks the end of the SQL statement.',
      ],
    },
    expectedOutput: {
      columns: ['student_id', 'full_name', 'major', 'gpa'],
      rows: [
        { student_id: 1, full_name: 'Amina Rahman', major: 'Computer Science', gpa: 3.85 },
        { student_id: 2, full_name: 'Tanvir Hossain', major: 'Electrical Engineering', gpa: 3.40 },
        { student_id: 3, full_name: 'Nusrat Jahan', major: 'Computer Science', gpa: 3.92 },
      ],
    },
    commonMistakes: [
      'Confusing data with information: raw numbers without column headers have no meaning.',
      'Treating spreadsheets as permanent production databases: spreadsheets lack multi-user concurrency locks and crash under high transaction volumes.',
    ],
    exercise: {
      instructions: 'Write a query to retrieve all student records from the `students` table showing all columns.',
      hint: 'Use SELECT * FROM students;',
      starterQuery: 'SELECT * FROM students;',
      solution: 'SELECT * FROM students;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'Which of the following is the best example of structured data?',
      options: [
        'A scanned audio recording of a customer phone call',
        'A table with defined columns for ID, Product Name, and Price',
        'A random paragraph of unedited handwritten notes',
        'A social media video post with visual animations',
      ],
      correctAnswer: 1,
      explanation: 'Structured data strictly adheres to predefined rows and columns with fixed data types, like a table of products and prices.',
    },
    nextLessonId: 'mysql-2',
  },

  {
    id: 'mysql-2',
    track: 'mysql',
    module: 1,
    moduleTitle: 'Module 1: Database Fundamentals',
    order: 2,
    difficulty: 'Beginner',
    title: {
      en: '2. What Is a Database? Real-World Examples',
      bn: '২. ডাটাবেস কী? বাস্তব জীবনের উদাহরণ',
    },
    subtitle: {
      en: 'Understand electronic filing cabinets that power hospitals, banks, and e-commerce apps.',
      bn: 'ডিজিটাল ডাটাবেস কীভাবে ব্যাংক, হাসপাতাল ও অনলাইন শপিংয়ে কাজ করে।',
    },
    duration: '15 mins',
    objectives: [
      'Define what a database is and how it differs from a simple operating system file.',
      'Explore real-world use cases: e-commerce shopping carts, hospital patient charts, airline bookings.',
      'Understand the key requirements of enterprise databases: concurrency, persistence, and reliability.',
    ],
    prerequisites: 'Lesson 1: Understanding Structured Data.',
    explanation: {
      simple: {
        en: 'A database is an organized electronic repository of data stored and accessed electronically from a computer system. Think of it as a supercharged, multi-user digital filing cabinet that guarantees your data remains intact even if the computer loses power. In an online store like Amazon, a database stores product catalogs, user passwords, credit balances, and order histories, allowing millions of customers to buy items simultaneously without overwriting each other.',
        bn: 'ডাটাবেস হলো একটি সুসংগঠিত ডিজিটাল তথ্যভাণ্ডার। এটি এমন এক কম্পিউটারাইজড ফাইল ক্যাবিনেট যার মাধ্যমে হাজার হাজার মানুষ একসাথে নিরাপদে তথ্য দেখতে, যোগ করতে ও সংরক্ষণ করতে পারে। বিদ্যুৎ চলে গেলেও এর সংরক্ষিত ডেটা মুছে যায় না।',
      },
      deepDive: {
        en: 'When two users book the very last seat on an airplane at the exact same second, a regular text file or spreadsheet would corrupt or assign the seat twice. A database uses concurrency control, transactions, and indexing to ensure that exactly one user receives the confirmed ticket while the other sees "Seat Sold Out".',
        bn: 'একই সেকেন্ডে যদি দুজন যাত্রী বিমানের শেষ টিকিটটি কাটার চেষ্টা করেন, সাধারণ ফাইলে ডেটা নষ্ট হয়ে যেতে পারে। কিন্তু ডাটাবেসের কনকারেন্সি কন্ট্রোল নিশ্চিত করে যে কেবল একজনই টিকিট পাবেন এবং অন্যজন "আসন খালি নেই" মেসেজ দেখবেন।',
      },
      syntax: 'SHOW DATABASES;',
    },
    sampleData: {
      description: 'System databases active in an enterprise MySQL server instance:',
      columns: ['Database'],
      rows: [
        { Database: 'university_db' },
        { Database: 'company_db' },
        { Database: 'ecommerce_db' },
      ],
    },
    queryExample: {
      title: 'Viewing Available Databases',
      code: `-- List all available databases on your MySQL server
SHOW DATABASES;`,
      explanation: [
        'Line 1: SQL comment describing the utility statement.',
        'Line 2: SHOW DATABASES lists every isolated database catalog currently managed by the server.',
      ],
    },
    expectedOutput: {
      columns: ['Database'],
      rows: [
        { Database: 'university_db' },
        { Database: 'company_db' },
        { Database: 'ecommerce_db' },
      ],
    },
    commonMistakes: [
      'Thinking a single database table is the entire database: a database can contain hundreds of related tables.',
      'Assuming databases are only for numbers: databases store text, timestamps, geospatial points, and binary hashes.',
    ],
    exercise: {
      instructions: 'Run the command to display all databases configured on the active MySQL server.',
      hint: 'Type SHOW DATABASES; and press Run Query.',
      starterQuery: 'SHOW DATABASES;',
      solution: 'SHOW DATABASES;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'Why do modern web applications use databases instead of plain text (.txt) files?',
      options: [
        'Plain text files take up too much color on computer monitors',
        'Databases support secure multi-user access, lightning-fast queries, and data integrity',
        'Text files cannot store English alphabetic characters',
        'Databases are only required when writing CSS stylesheets',
      ],
      correctAnswer: 1,
      explanation: 'Databases are engineered to handle concurrent multi-user transactions, enforce constraints, protect data integrity, and execute fast index-accelerated queries.',
    },
    nextLessonId: 'mysql-3',
  },

  {
    id: 'mysql-3',
    track: 'mysql',
    module: 1,
    moduleTitle: 'Module 1: Database Fundamentals',
    order: 3,
    difficulty: 'Beginner',
    title: {
      en: '3. What Is a DBMS? Database Management Systems Explained',
      bn: '৩. DBMS কী? ডাটাবেস ম্যানেজমেন্ট সিস্টেম ব্যাখ্যা',
    },
    subtitle: {
      en: 'Learn how the software engine acts as the gatekeeper between applications and raw storage.',
      bn: 'সফটওয়্যার ইঞ্জিন কীভাবে অ্যাপ্লিকেশন ও স্টোরেজের মাঝে নিরাপত্তা ও গতি নিশ্চিত করে।',
    },
    duration: '15 mins',
    objectives: [
      'Define a DBMS (Database Management System) and its role in modern architecture.',
      'Understand the client-server database architecture model.',
      'Contrast Relational DBMS (RDBMS) with NoSQL document stores.',
      'Explore core DBMS responsibilities: security, backups, query execution, and cache management.',
    ],
    prerequisites: 'Lesson 2: What Is a Database?',
    explanation: {
      simple: {
        en: 'A Database Management System (DBMS) is the specialized software that manages the database. Applications (like our web browser or mobile app) never touch the raw hard drive directly. Instead, they send requests to the DBMS. The DBMS validates permissions, finds the requested records in memory or disk, and returns the result safely. Examples of popular DBMS software include MySQL, PostgreSQL, Oracle, and Microsoft SQL Server.',
        bn: 'DBMS হলো সেই সফটওয়্যার যা ডাটাবেসকে পরিচালনা করে। যেকোনো অ্যাপ সরাসরি হার্ডড্রাইভে হাত দেয় না; অ্যাপ DBMS-কে নির্দেশ পাঠায়, আর DBMS নিরাপত্তার সাথে ফাইল থেকে তথ্য পড়ে অ্যাপে ফেরত দেয়। যেমন: MySQL, PostgreSQL, Oracle।',
      },
      deepDive: {
        en: 'A Relational DBMS (RDBMS) organizes data into mathematical relations (tables). The RDBMS enforces constraints such as preventing someone from placing an order for a customer ID that does not exist in the database. This guarantees referential integrity across the entire application ecosystem.',
        bn: 'রিলেশনাল DBMS (RDBMS) টেবিলগুলোর মধ্যে সম্পর্ক বজায় রাখে। যেমন: কোনো ক্রেতার অ্যাকাউন্ট মুছে গেলে তার অর্ডারের কী হবে, তা RDBMS স্বয়ংক্রিয়ভাবে নিয়ম অনুযায়ী নিয়ন্ত্রণ করে।',
      },
      syntax: '/* Client App -> [SQL Query] -> RDBMS Engine -> Physical Storage */',
    },
    sampleData: {
      description: 'DBMS engine information and version status:',
      columns: ['Component', 'Role'],
      rows: [
        { Component: 'Query Parser', Role: 'Validates SQL syntax and tokenizes commands' },
        { Component: 'Optimizer', Role: 'Chooses the fastest index and execution path' },
        { Component: 'Storage Engine (InnoDB)', Role: 'Reads/writes physical blocks on SSD and manages buffer pool' },
      ],
    },
    queryExample: {
      title: 'Checking the Active MySQL Version and Server Status',
      code: `-- Ask the MySQL DBMS engine for its version string
SELECT VERSION(), NOW();`,
      explanation: [
        'Line 1: SQL comment.',
        'Line 2: Calls the built-in VERSION() and NOW() server functions to query DBMS engine status.',
      ],
    },
    expectedOutput: {
      columns: ['VERSION()', 'NOW()'],
      rows: [
        { 'VERSION()': '8.0.36-MySQL Community Server (Clearfeed Practice Lab)', 'NOW()': '2026-10-14 10:30:00' },
      ],
    },
    commonMistakes: [
      'Confusing the database (the stored data) with the DBMS (the software engine that operates on the data).',
      'Assuming all databases use SQL: NoSQL systems like MongoDB use JSON-like document syntax rather than relational SQL.',
    ],
    exercise: {
      instructions: 'Run a query to inspect the database server version using the built-in VERSION() function.',
      hint: 'Write SELECT VERSION(); and click Run Query.',
      starterQuery: 'SELECT VERSION();',
      solution: 'SELECT VERSION();',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'What is the primary role of a DBMS in a web application stack?',
      options: [
        'To style buttons and render CSS animations in the user browser',
        'To act as the software engine managing data storage, queries, and security',
        'To compile JavaScript files into machine assembly code',
        'To send physical Wi-Fi signals to smartphones',
      ],
      correctAnswer: 1,
      explanation: 'A DBMS is the server engine that parses queries, optimizes execution paths, enforces security, and manages storage on disk.',
    },
    nextLessonId: 'mysql-4',
  },

  {
    id: 'mysql-4',
    track: 'mysql',
    module: 1,
    moduleTitle: 'Module 1: Database Fundamentals',
    order: 4,
    difficulty: 'Beginner',
    title: {
      en: '4. What Is MySQL? MySQL vs SQL vs a Database',
      bn: '৪. MySQL কী? MySQL বনাম SQL বনাম ডাটাবেস',
    },
    subtitle: {
      en: 'Clear up the most common beginner confusion once and for all.',
      bn: 'MySQL, SQL এবং ডাটাবেস—এই তিনটির মধ্যকার পার্থক্য সম্পূর্ণ পরিষ্কার করুন।',
    },
    duration: '15 mins',
    objectives: [
      'Clearly differentiate between Database (the container), SQL (the language), and MySQL (the software).',
      'Understand the history of MySQL and its open-source lineage.',
      'Explore the default InnoDB storage engine and ACID compliance.',
      'Learn why MySQL powers tech giants like Meta (Facebook), Uber, Netflix, and Shopify.',
    ],
    prerequisites: 'Lesson 3: What Is a DBMS?',
    explanation: {
      simple: {
        en: 'Beginners frequently confuse these three terms:\n1. A Database is the actual collection of files containing your structured data.\n2. SQL (Structured Query Language) is the standardized language humans write to ask questions to the database.\n3. MySQL is the open-source Relational Database Management System software that listens for your SQL commands, processes them, and manages the database on the server.\nThink of it this way: Music is the data, English is the language (SQL), and the Singer who speaks the language is MySQL!',
        bn: 'নতুন শিক্ষার্থীরা প্রায়ই এই তিনটি গুলিয়ে ফেলেন:\n১. Database: তথ্যের ভাণ্ডার বা ফাইলসমূহ।\n২. SQL: ডাটাবেসের সাথে কথা বলার আন্তর্জাতিক ভাষা।\n৩. MySQL: সেই সফটওয়্যার বা সার্ভার যা আপনার SQL কথা বোঝে এবং ডাটা খুঁজে এনে দেয়।\nসহজ ভাষায়: সঙ্গীত হলো ডাটা, ইংরেজি ভাষা হলো SQL, আর যে গায়ক গান গায় সে হলো MySQL!',
      },
      deepDive: {
        en: 'MySQL uses a client-server architecture. A background process called `mysqld` runs continuously on a server listening on port 3306. Multiple client applications (Node.js backend, Python script, or GUI workbench) connect over TCP/IP, send SQL statements, and receive structured tabular result packets.',
        bn: 'MySQL ক্লায়েন্ট-সার্ভার মডেলে চলে। সার্ভারে ব্যাকগ্রাউন্ডে `mysqld` প্রসেস চলতে থাকে (পোর্ট ৩৩০৬)। যেকোনো ক্লায়েন্ট অ্যাপ নেটওয়ার্কের মাধ্যমে SQL পাঠিয়ে ফলাফল গ্রহণ করে।',
      },
      syntax: '/* SQL is the language. MySQL is the software engine executing SQL. */',
    },
    sampleData: {
      description: 'Comparison matrix of the three core database concepts:',
      columns: ['Concept', 'Category', 'Analogy', 'Example'],
      rows: [
        { Concept: 'Database', Category: 'Data Storage', Analogy: 'A library with bookshelves', Example: 'university_db' },
        { Concept: 'SQL', Category: 'Language Standard', Analogy: 'English or Bengali language', Example: 'SELECT * FROM students;' },
        { Concept: 'MySQL', Category: 'Software Engine', Analogy: 'The Librarian who finds books', Example: 'MySQL Server 8.0' },
      ],
    },
    queryExample: {
      title: 'Querying Active Connection Details',
      code: `-- Identify the active database currently selected in this session
SELECT DATABASE();`,
      explanation: [
        'Line 1: SQL comment.',
        'Line 2: Returns the name of the current database schema context.',
      ],
    },
    expectedOutput: {
      columns: ['DATABASE()'],
      rows: [{ 'DATABASE()': 'university_db' }],
    },
    commonMistakes: [
      'Saying "I learned MySQL syntax": SQL syntax is standardized (ANSI SQL); MySQL is the implementation engine with its own specific features.',
      'Thinking MySQL is only for small projects: MySQL runs at massive hyperscale at Meta, YouTube, and GitHub.',
    ],
    exercise: {
      instructions: 'Run a query calling the `DATABASE()` function to verify which database you are currently connected to.',
      hint: 'Type SELECT DATABASE(); and run.',
      starterQuery: 'SELECT DATABASE();',
      solution: 'SELECT DATABASE();',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'Which of the following statements is strictly accurate?',
      options: [
        'SQL is an operating system, and MySQL is a computer screen',
        'SQL is the query language, while MySQL is the RDBMS software that executes SQL queries',
        'MySQL is a programming language, and SQL is a hardware memory chip',
        'Database and SQL mean the exact same thing in computer science',
      ],
      correctAnswer: 1,
      explanation: 'SQL (Structured Query Language) is the standardized declarative language, while MySQL is the specific database engine software.',
    },
    nextLessonId: 'mysql-5',
  },

  {
    id: 'mysql-5',
    track: 'mysql',
    module: 1,
    moduleTitle: 'Module 1: Database Fundamentals',
    order: 5,
    difficulty: 'Beginner',
    title: {
      en: '5. Installing MySQL and Choosing a SQL Client',
      bn: '৫. MySQL ইনস্টলেশন ও ক্লায়েন্ট নির্বাচন',
    },
    subtitle: {
      en: 'Set up your local workstation and choose between CLI, Workbench, DBeaver, or VS Code.',
      bn: 'লোকাল মেশিনে MySQL সার্ভার ও বিভিন্ন গ্রাফিক্যাল ইন্টারফেস ব্যবহারের উপায়।',
    },
    duration: '15 mins',
    objectives: [
      'Understand how MySQL Community Server installs on Windows, macOS, and Linux.',
      'Learn the difference between the Command Line Client (`mysql`) and Graphical User Interfaces (GUIs).',
      'Compare popular SQL GUI tools: MySQL Workbench, DBeaver, TablePlus, and phpMyAdmin.',
      'Understand default connection parameters: Host (`localhost` / `127.0.0.1`), Port (`3306`), and Root credentials.',
    ],
    prerequisites: 'Lesson 4: What Is MySQL?',
    explanation: {
      simple: {
        en: 'To work with MySQL, you typically have two parts:\n1. The MySQL Server (the background engine that actually holds the data on your machine).\n2. The SQL Client (the tool you use to write and submit queries).\nYou can use the built-in terminal black screen (`mysql -u root -p`), or you can use a comfortable graphical desktop program like DBeaver or MySQL Workbench. In this Clearfeed interactive course, we provide an embedded safe practice lab right inside your browser, so you can practice instantly without configuring local ports!',
        bn: 'MySQL নিয়ে কাজ করতে দুটি জিনিস লাগে:\n১. MySQL সার্ভার (যা ব্যাকগ্রাউন্ডে ডেটা জমা রাখে)।\n২. ক্লায়েন্ট টুল (যার মাধ্যমে আপনি কুয়েরি টাইপ করেন)।\nটার্মিনাল ছাড়াও সুন্দর ডেক্সটপ অ্যাপ যেমন DBeaver বা MySQL Workbench দিয়ে সহজে কাজ করা যায়। ক্লিয়ারফিডে আমরা ব্রাউজারেই লাইভ প্র্যাকটিস ল্যাব তৈরি করে দিয়েছি যাতে আপনি সরাসরি কোড লিখে শিখতে পারেন!',
      },
      deepDive: {
        en: 'When connecting to MySQL, client tools require 4 credentials:\n- Host: `127.0.0.1` (or `localhost` for local machine)\n- Port: `3306` (the official IANA registered default port for MySQL)\n- Username: typically `root` for local administrative access\n- Password: set during initial server installation\nNever expose these raw connection credentials in public Git repositories!',
        bn: 'যেকোনো ক্লায়েন্ট দিয়ে কানেক্ট করতে ৪টি তথ্য লাগে: Host (localhost), Port (3306), Username (root) এবং Password। এই তথ্যগুলো কখনো পাবলিক গিটহাবে শেয়ার করা উচিত নয়।',
      },
      syntax: 'mysql -u root -p -h 127.0.0.1 -P 3306',
    },
    sampleData: {
      description: 'Popular SQL client GUI software comparison:',
      columns: ['Client Tool', 'Platform', 'Type', 'Best For'],
      rows: [
        { 'Client Tool': 'Clearfeed Lab', Platform: 'Web Browser', Type: 'Interactive Sandbox', 'Best For': 'Zero-setup interactive learning' },
        { 'Client Tool': 'DBeaver Community', Platform: 'Win / Mac / Linux', Type: 'Universal GUI', 'Best For': 'Professional multi-database development' },
        { 'Client Tool': 'MySQL Workbench', Platform: 'Win / Mac / Linux', Type: 'Official GUI', 'Best For': 'Visual ER diagrams and administration' },
        { 'Client Tool': 'Terminal CLI', Platform: 'Command Line', Type: 'Direct Shell', 'Best For': 'DevOps, Docker, and Linux servers' },
      ],
    },
    queryExample: {
      title: 'Testing Server Connectivity with a Ping Query',
      code: `-- A simple connection verification ping
SELECT 'Connection Established! Server is ready.' AS connection_status;`,
      explanation: [
        'Line 1: SQL comment.',
        'Line 2: Echoes a success message with an alias `connection_status` verifying client-server communication.',
      ],
    },
    expectedOutput: {
      columns: ['connection_status'],
      rows: [{ connection_status: 'Connection Established! Server is ready.' }],
    },
    commonMistakes: [
      'Forgetting the root password set during MySQL installation: resetting the root password on local machines requires restarting MySQL in safe-mode with `--skip-grant-tables`.',
      'Port 3306 conflict: running XAMPP, Docker, and native MySQL at the same time can cause port collision errors.',
    ],
    exercise: {
      instructions: 'Run the connectivity test query to confirm that your client sandbox is communicating with the practice database.',
      hint: "Run: SELECT 'Connected to MySQL 8.0' AS status;",
      starterQuery: "SELECT 'Connected to MySQL 8.0' AS status;",
      solution: "SELECT 'Connected to MySQL 8.0' AS status;",
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'What is the official default TCP network port used by MySQL Server?',
      options: ['80', '443', '3306', '8080'],
      correctAnswer: 2,
      explanation: 'Port 3306 is the standard default port assigned by IANA for MySQL database server communication.',
    },
    nextLessonId: 'mysql-6',
  },

  {
    id: 'mysql-6',
    track: 'mysql',
    module: 1,
    moduleTitle: 'Module 1: Database Fundamentals',
    order: 6,
    difficulty: 'Beginner',
    title: {
      en: '6. Creating Your First Database and Understanding Tables',
      bn: '৬. প্রথম ডাটাবেস তৈরি ও টেবিলের গঠন বোঝা',
    },
    subtitle: {
      en: 'Create a dedicated schema container and dissect rows, columns, and records.',
      bn: 'নতুন ডাটাবেস তৈরি করুন এবং সারি, কলাম ও রেকর্ডের গঠন গভীরভাবে শিখুন।',
    },
    duration: '20 mins',
    objectives: [
      'Create a new database using `CREATE DATABASE`.',
      'Select and switch between active databases using `USE`.',
      'Understand the hierarchy: Server -> Database (Schema) -> Tables -> Rows and Columns.',
      'Inspect tables inside an active database using `SHOW TABLES`.',
    ],
    prerequisites: 'Lessons 1-5.',
    explanation: {
      simple: {
        en: 'Before you can store user information or products, you must create a database. Think of the database as a folder on your computer. Inside that folder, you create separate spreadsheet-like files called tables. Each table represents one specific entity in the real world (e.g. `students`, `orders`, or `books`).\nWe create a database with:\n`CREATE DATABASE school_db;`\nAnd we tell MySQL to start working inside that database with:\n`USE school_db;`',
        bn: 'যেকোনো টেবিল বানানোর আগে একটি ডাটাবেস ফোল্ডার তৈরি করতে হয়। যেমন:\n`CREATE DATABASE school_db;`\nএবং সেই ডাটাবেসের ভেতরে ঢুকতে লিখতে হয়:\n`USE school_db;`\nএরপর আমরা এর ভেতরে বিভিন্ন টেবিল (যেমন: students, teachers) তৈরি করতে পারি।',
      },
      deepDive: {
        en: 'In MySQL, `SCHEMA` and `DATABASE` are exact synonyms. Adding `IF NOT EXISTS` prevents MySQL from throwing an error if a database with that name is already present on the server. Always adopt snake_case conventions for database and table naming (e.g., `company_payroll_db`).',
        bn: 'MySQL-এ SCHEMA এবং DATABASE একই অর্থ বহন করে। `IF NOT EXISTS` লিখলে ডাটাবেসটি আগে থেকেই তৈরি থাকলে কোনো এরর দেখায় না। সর্বদা ছোট হাতের অক্ষর ও আন্ডারস্কোর (snake_case) দিয়ে নাম দেওয়া ভালো।',
      },
      syntax: 'CREATE DATABASE IF NOT EXISTS database_name;\nUSE database_name;\nSHOW TABLES;',
    },
    sampleData: {
      description: 'Tables present inside the active university_db database:',
      columns: ['Tables_in_university_db'],
      rows: [
        { Tables_in_university_db: 'students' },
        { Tables_in_university_db: 'courses' },
        { Tables_in_university_db: 'enrollments' },
      ],
    },
    queryExample: {
      title: 'Listing All Tables in the Active Database',
      code: `-- Check which tables exist in the current database
SHOW TABLES;`,
      explanation: [
        'Line 1: SQL comment.',
        'Line 2: SHOW TABLES returns a list of every existing table inside the currently active database.',
      ],
    },
    expectedOutput: {
      columns: ['Tables_in_university_db'],
      rows: [
        { Tables_in_university_db: 'students' },
        { Tables_in_university_db: 'courses' },
        { Tables_in_university_db: 'enrollments' },
      ],
    },
    commonMistakes: [
      'Trying to create tables before running `USE database_name;`: MySQL will give "ERROR 1046 (3D000): No database selected".',
      'Using spaces in database names: always use underscores (e.g. `my_school_db` instead of `my school db`).',
    ],
    exercise: {
      instructions: 'Switch to the `university` database context and list all tables inside it.',
      hint: 'Run: SHOW TABLES;',
      starterQuery: 'SHOW TABLES;',
      solution: 'SHOW TABLES;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'Which SQL command selects a database to make it the active workspace for subsequent queries?',
      options: ['OPEN database_name;', 'USE database_name;', 'SELECT database_name;', 'GOTO database_name;'],
      correctAnswer: 1,
      explanation: 'The USE statement sets the current default database for all subsequent SQL commands in the current connection session.',
    },
    nextLessonId: 'mysql-7',
  },
];

export const module1Lessons = MODULE_1_LESSONS;
