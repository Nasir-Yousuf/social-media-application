// Module 2: SQL Fundamentals (Lessons 7-12)
// Complete educational content covering DDL, DML, types, CREATE, INSERT, and SELECT.

export const MODULE_2_LESSONS = [
  {
    id: 'mysql-7',
    track: 'mysql',
    module: 2,
    moduleTitle: 'Module 2: SQL Fundamentals',
    order: 7,
    difficulty: 'Beginner',
    title: {
      en: '7. SQL Syntax, Statements, and Semicolons',
      bn: '৭. SQL সিনট্যাক্স, স্টেটমেন্ট ও সেমিকোলন',
    },
    subtitle: {
      en: 'Master clauses, case-insensitivity conventions, comments, and the golden rules of SQL.',
      bn: 'SQL ক্লজ, ক্যাপিটালাইজেশন নিয়ম, কমেন্ট ও সেমিকোলনের গুরুত্ব জানুন।',
    },
    duration: '15 mins',
    objectives: [
      'Understand the anatomy of a SQL statement (Keywords, Clauses, Identifiers, Literals).',
      'Learn why uppercase keywords (`SELECT`, `FROM`) are industry best practice.',
      'Understand why the semicolon (`;`) is mandatory in client-server SQL.',
      'Write single-line (`--`) and multi-line (`/* ... */`) SQL comments.',
    ],
    prerequisites: 'Module 1: Database Fundamentals.',
    explanation: {
      simple: {
        en: 'SQL is a declarative language: you tell the database WHAT data you want, not HOW to retrieve it. A SQL command is built of keywords and clauses.\nWhile MySQL is case-insensitive regarding keywords (both `select` and `SELECT` work), professional engineers always write SQL keywords in UPPERCASE and table/column identifiers in lowercase. Every statement ends with a semicolon (;) to tell the parser where the command finishes.',
        bn: 'SQL হলো একটি ডিক্লারেটিভ ভাষা: আপনি ডাটাবেসকে বলেন আপনার কী তথ্য দরকার, কীভাবে বের করতে হবে তা ডাটাবেস নিজে ঠিক করে। পেশাদার ডেভেলপাররা সর্বদা SQL কি-ওয়ার্ড বড় হাতের (UPPERCASE) অক্ষরে লেখেন এবং টেবিল ও কলামের নাম ছোট হাতের অক্ষরে লেখেন। প্রতিটি স্টেটমেন্টের শেষে সেমিকোলন (;) দেওয়া জরুরি।',
      },
      deepDive: {
        en: 'Whitespace and newlines are ignored by SQL parsers. Breaking complex queries across multiple lines (one clause per line) dramatically improves readability, debugging, and code reviews.',
        bn: 'SQL-এ অতিরিক্ত স্পেস বা নতুন লাইন কোনো সমস্যা তৈরি করে না। প্রতিটি ক্লজ আলাদা লাইনে লিখলে কোড পড়া এবং ভুল ধরা অনেক সহজ হয়।',
      },
      syntax: 'SELECT column1, column2\nFROM table_name;\n\n-- Single-line comment\n/* Multi-line comment */',
    },
    sampleData: {
      description: 'The students table containing active university records:',
      columns: ['student_id', 'first_name', 'last_name', 'major', 'gpa'],
      rows: [
        { student_id: 1, first_name: 'Amina', last_name: 'Rahman', major: 'Computer Science', gpa: 3.85 },
        { student_id: 2, first_name: 'Tanvir', last_name: 'Hossain', major: 'Electrical Engineering', gpa: 3.40 },
        { student_id: 3, first_name: 'Nusrat', last_name: 'Jahan', major: 'Computer Science', gpa: 3.92 },
      ],
    },
    queryExample: {
      title: 'Clean Multi-Line Query with Proper Conventions',
      code: `-- Good style: uppercase keywords, formatted clauses, semicolon at end
SELECT first_name, last_name, gpa
FROM students;`,
      explanation: [
        'Line 1: Explanatory comment.',
        'Line 2: SELECT keyword in uppercase, followed by comma-separated column names.',
        'Line 3: FROM clause indented on its own line.',
        'Line 4: Semicolon (;) terminates the statement.',
      ],
    },
    expectedOutput: {
      columns: ['first_name', 'last_name', 'gpa'],
      rows: [
        { first_name: 'Amina', last_name: 'Rahman', gpa: 3.85 },
        { first_name: 'Tanvir', last_name: 'Hossain', gpa: 3.40 },
        { first_name: 'Nusrat', last_name: 'Jahan', gpa: 3.92 },
      ],
    },
    commonMistakes: [
      'Forgetting the semicolon at the end of the query: the terminal client will hang waiting for more input.',
      'Putting a comma after the last column name in the SELECT clause (e.g. `SELECT name, age, FROM users;` results in a syntax error).',
    ],
    exercise: {
      instructions: 'Write a formatted query to retrieve `first_name`, `last_name`, and `major` from the `students` table.',
      hint: 'SELECT first_name, last_name, major FROM students;',
      starterQuery: 'SELECT first_name, last_name, major FROM students;',
      solution: 'SELECT first_name, last_name, major FROM students;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'Why is it considered best practice to write SQL keywords in UPPERCASE (e.g. SELECT, FROM)?',
      options: [
        'Because lowercase SQL keywords are completely illegal in MySQL and fail to run',
        'It visually distinguishes SQL language commands from table and column names, improving readability',
        'Uppercase keywords make queries execute twice as fast on modern CPU processors',
        'It is required by the JavaScript browser runtime',
      ],
      correctAnswer: 1,
      explanation: 'While MySQL handles lowercase keywords, writing keywords in UPPERCASE makes the query structure immediately distinguishable from user identifiers.',
    },
    nextLessonId: 'mysql-8',
  },

  {
    id: 'mysql-8',
    track: 'mysql',
    module: 2,
    moduleTitle: 'Module 2: SQL Fundamentals',
    order: 8,
    difficulty: 'Beginner',
    title: {
      en: '8. Understanding Data Types: INT, VARCHAR, DATE, DECIMAL, and More',
      bn: '৮. ডেটা টাইপ বোঝা: INT, VARCHAR, DATE, DECIMAL ইত্যাদি',
    },
    subtitle: {
      en: 'Choose the exact digital storage blueprint for numbers, strings, money, and dates.',
      bn: 'সংখ্যা, লেখা, টাকা-পয়সা এবং তারিখের জন্য সঠিক ডেটা টাইপ নির্বাচন করুন।',
    },
    duration: '20 mins',
    objectives: [
      'Understand why choosing the right data type saves disk storage and prevents data corruption.',
      'Differentiate numeric types: `INT`, `BIGINT`, and `TINYINT`.',
      'Understand string types: `CHAR(n)` vs `VARCHAR(n)` vs `TEXT`.',
      'Learn why financial balances MUST use `DECIMAL(p,s)` instead of floating-point `FLOAT` / `DOUBLE`.',
      'Work with calendar and temporal types: `DATE`, `DATETIME`, and `TIMESTAMP`.',
    ],
    prerequisites: 'Lesson 7: SQL Syntax & Statements.',
    explanation: {
      simple: {
        en: 'Every column in a database table must have a data type. The data type tells MySQL what kind of values can be stored in that column and how much memory to allocate.\n- `INT`: Whole numbers (like student IDs or quantities).\n- `VARCHAR(100)`: Variable-length text up to 100 characters (like names or emails).\n- `DECIMAL(10, 2)`: Exact financial numbers with 2 decimal places (like $19.99 for prices).\n- `DATE`: Calendar dates in `YYYY-MM-DD` format (like 2024-02-15).\n- `BOOLEAN`: True/False values (stored internally as TINYINT 1 or 0).',
        bn: 'টেবিলের প্রতিটি কলামের জন্য একটি নির্দিষ্ট ডেটা টাইপ নির্ধারণ করতে হয়:\n- INT: পূর্ণসংখ্যা (যেমন রোল নম্বর বা বয়স)।\n- VARCHAR(100): সর্বোচ্চ ১০০ অক্ষরের টেক্সট (যেমন নাম বা ইমেইল)।\n- DECIMAL(10, 2): যেকোনো আর্থিক হিসাব বা টাকা (যেমন ১৯.৯৯)।\n- DATE: তারিখ (YYYY-MM-DD ফরম্যাট)।\nসঠিক টাইপ বাছাই করলে মেমোরি বাঁচে এবং ভুল ডেটা প্রবেশ ঠেকানো যায়।',
      },
      deepDive: {
        en: 'A critical rule in software engineering: NEVER store money in `FLOAT` or `DOUBLE`! Floating-point numbers use binary approximations that cause microscopic rounding errors (e.g. `0.1 + 0.2 = 0.30000000000000004`). In banking or e-commerce, always use `DECIMAL(10, 2)` which stores exact decimal digits.',
        bn: 'সফটওয়্যার ইঞ্জিনিয়ারিংয়ের একটি জরুরি নিয়ম: টাকার হিসেবে কখনো FLOAT বা DOUBLE ব্যবহার করবেন না! এগুলোতে সূক্ষ্ম রাউন্ডিং ভুল হতে পারে। ব্যাংক ও ই-কমার্সে সবসময় DECIMAL টাইপ ব্যবহার করতে হয়।',
      },
      syntax: 'DECIMAL(precision, scale)\n-- e.g. DECIMAL(8, 2) allows up to 999999.99',
    },
    sampleData: {
      description: 'Data types in the courses table schema:',
      columns: ['Field', 'Type', 'Null', 'Key'],
      rows: [
        { Field: 'course_id', Type: 'INT', Null: 'NO', Key: 'PRI' },
        { Field: 'course_code', Type: 'VARCHAR(10)', Null: 'NO', Key: '' },
        { Field: 'course_name', Type: 'VARCHAR(100)', Null: 'NO', Key: '' },
        { Field: 'credits', Type: 'INT', Null: 'YES', Key: '' },
        { Field: 'department', Type: 'VARCHAR(50)', Null: 'YES', Key: '' },
      ],
    },
    queryExample: {
      title: 'Inspecting Table Schema and Column Data Types',
      code: `-- Inspect the column definitions and data types of the courses table
DESCRIBE courses;`,
      explanation: [
        'Line 1: SQL comment.',
        'Line 2: DESCRIBE (or DESC) lists all fields, storage types, NULLability, and keys for the table.',
      ],
    },
    expectedOutput: {
      columns: ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'],
      rows: [
        { Field: 'course_id', Type: 'INT', Null: 'NO', Key: 'PRI', Default: 'NULL', Extra: '' },
        { Field: 'course_code', Type: 'VARCHAR(10)', Null: 'NO', Key: '', Default: 'NULL', Extra: '' },
        { Field: 'course_name', Type: 'VARCHAR(100)', Null: 'NO', Key: '', Default: 'NULL', Extra: '' },
        { Field: 'credits', Type: 'INT', Null: 'YES', Key: '', Default: 'NULL', Extra: '' },
        { Field: 'department', Type: 'VARCHAR(50)', Null: 'YES', Key: '', Default: 'NULL', Extra: '' },
      ],
    },
    commonMistakes: [
      'Storing phone numbers or zip codes as INT: leading zeros (e.g. `01711...`) will be stripped! Always store phone numbers as VARCHAR.',
      'Using VARCHAR for birth dates: this prevents mathematical date calculations like finding users older than 18.',
    ],
    exercise: {
      instructions: 'Inspect the schema of the `students` table to see its column data types.',
      hint: 'Type: DESCRIBE students;',
      starterQuery: 'DESCRIBE students;',
      solution: 'DESCRIBE students;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'Which MySQL data type should you choose to store product prices like $49.99 in an online store?',
      options: ['VARCHAR(10)', 'FLOAT', 'DECIMAL(10, 2)', 'BOOLEAN'],
      correctAnswer: 2,
      explanation: 'DECIMAL(10, 2) stores exact decimal values with 2 fractional digits without floating-point rounding errors.',
    },
    nextLessonId: 'mysql-9',
  },

  {
    id: 'mysql-9',
    track: 'mysql',
    module: 2,
    moduleTitle: 'Module 2: SQL Fundamentals',
    order: 9,
    difficulty: 'Beginner',
    title: {
      en: '9. Creating Tables with CREATE TABLE',
      bn: '৯. CREATE TABLE দিয়ে টেবিল তৈরি',
    },
    subtitle: {
      en: 'Construct custom relational tables with defined columns, types, and primary keys.',
      bn: 'নির্দিষ্ট কলাম, ডেটা টাইপ ও প্রাইমারি কি দিয়ে নিজস্ব টেবিল তৈরি করুন।',
    },
    duration: '20 mins',
    objectives: [
      'Master the DDL (Data Definition Language) `CREATE TABLE` syntax.',
      'Understand the `IF NOT EXISTS` clause to prevent duplicate table errors.',
      'Define a Primary Key with `AUTO_INCREMENT` for unique record identification.',
      'Verify newly created tables using `SHOW TABLES` and `DESCRIBE`.',
    ],
    prerequisites: 'Lesson 8: Understanding Data Types.',
    explanation: {
      simple: {
        en: 'The `CREATE TABLE` statement builds a new table in the database. Inside parentheses, you define each column by giving it a name, a data type, and optional constraints.\nFor example, to build an `instructors` table:\n```sql\nCREATE TABLE instructors (\n  instructor_id INT PRIMARY KEY AUTO_INCREMENT,\n  first_name VARCHAR(50) NOT NULL,\n  email VARCHAR(100) UNIQUE,\n  salary DECIMAL(10, 2)\n);\n```\nEvery row in this table will have an automatically assigned unique ID, a mandatory first name, and an email that cannot be duplicated.',
        bn: '`CREATE TABLE` কমান্ড দিয়ে ডাটাবেসে নতুন টেবিল তৈরি করা হয়। ব্র্যাকেটের ভেতরে প্রতিটি কলামের নাম, টাইপ এবং বিভিন্ন শর্ত (constraints) লিখে দেওয়া হয়। যেমন instructors টেবিলে instructor_id স্বয়ংক্রিয়ভাবে ১, ২, ৩ করে বাড়বে (AUTO_INCREMENT) এবং প্রাইমারি কি হিসেবে কাজ করবে।',
      },
      deepDive: {
        en: '`CREATE TABLE` is part of DDL (Data Definition Language). Unlike DML statements that modify rows, DDL statements modify the metadata dictionary of the database. In MySQL InnoDB, DDL operations are atomic as of version 8.0.',
        bn: 'CREATE TABLE হলো DDL (Data Definition Language) কমান্ড। এটি ডেটার ভেতরের মান পরিবর্তন করে না, বরং ডাটাবেসের কাঠামো বা আর্কিটেকচার তৈরি করে।',
      },
      syntax: 'CREATE TABLE IF NOT EXISTS table_name (\n  column1 datatype constraints,\n  column2 datatype constraints,\n  PRIMARY KEY (column1)\n);',
    },
    sampleData: {
      description: 'The structure of an instructors table created with CREATE TABLE:',
      columns: ['Field', 'Type', 'Null', 'Key'],
      rows: [
        { Field: 'instructor_id', Type: 'INT', Null: 'NO', Key: 'PRI' },
        { Field: 'first_name', Type: 'VARCHAR(50)', Null: 'NO', Key: '' },
        { Field: 'last_name', Type: 'VARCHAR(50)', Null: 'NO', Key: '' },
        { Field: 'email', Type: 'VARCHAR(100)', Null: 'YES', Key: 'UNI' },
      ],
    },
    queryExample: {
      title: 'Creating an Instructors Table',
      code: `-- Create an instructors table with unique primary key
CREATE TABLE IF NOT EXISTS instructors (
  instructor_id INT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100)
);`,
      explanation: [
        'Line 2: Defines the table name `instructors`. `IF NOT EXISTS` prevents collision errors.',
        'Line 3: `instructor_id` is an integer that serves as the PRIMARY KEY.',
        'Line 4-5: `first_name` and `last_name` are text columns marked NOT NULL (mandatory).',
        'Line 6: `email` column allowing optional text up to 100 characters.',
      ],
    },
    expectedOutput: {
      columns: ['status'],
      rows: [{ status: "Table 'instructors' created successfully." }],
    },
    commonMistakes: [
      'Missing closing parenthesis or semicolon at the end of the statement.',
      'Trailing comma after the final column definition inside the parentheses.',
    ],
    exercise: {
      instructions: 'Write a CREATE TABLE query to create a table called `books` with `book_id INT PRIMARY KEY`, `title VARCHAR(150)`, and `price DECIMAL(8, 2)`.',
      hint: 'CREATE TABLE books (book_id INT PRIMARY KEY, title VARCHAR(150), price DECIMAL(8, 2));',
      starterQuery: 'CREATE TABLE books (\n  book_id INT PRIMARY KEY,\n  title VARCHAR(150),\n  price DECIMAL(8, 2)\n);',
      solution: 'CREATE TABLE books (book_id INT PRIMARY KEY, title VARCHAR(150), price DECIMAL(8, 2));',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'What does the `NOT NULL` constraint do when defined on a column in a `CREATE TABLE` statement?',
      options: [
        'It forces all numbers in the column to be negative',
        'It prevents rows from being inserted without a value in that column',
        'It deletes the column whenever the computer restarts',
        'It converts all text characters to lowercase',
      ],
      correctAnswer: 1,
      explanation: 'NOT NULL enforces data integrity by ensuring that every inserted record must provide a valid value for that specific column.',
    },
    nextLessonId: 'mysql-10',
  },

  {
    id: 'mysql-10',
    track: 'mysql',
    module: 2,
    moduleTitle: 'Module 2: SQL Fundamentals',
    order: 10,
    difficulty: 'Beginner',
    title: {
      en: '10. Inserting Records with INSERT INTO',
      bn: '১০. INSERT INTO দিয়ে নতুন রেকর্ড যোগ করা',
    },
    subtitle: {
      en: 'Add new rows of data into tables and handle multi-row batch inserts efficiently.',
      bn: 'টেবিলে নতুন তথ্য যোগ করুন এবং একসাথে একাধিক রেকর্ড ইনসার্ট করা শিখুন।',
    },
    duration: '20 mins',
    objectives: [
      'Master the DML (Data Manipulation Language) `INSERT INTO` syntax.',
      'Understand column-value order matching.',
      'Insert multiple records in a single batch statement for high performance.',
      'Verify inserted records using SELECT immediately afterwards.',
    ],
    prerequisites: 'Lesson 9: Creating Tables with CREATE TABLE.',
    explanation: {
      simple: {
        en: 'Once a table exists, you populate it with data using the `INSERT INTO` statement.\nSyntax:\n```sql\nINSERT INTO students (student_id, first_name, last_name, major, gpa)\nVALUES (7, "Kavita", "Roy", "Data Science", 3.75);\n```\nYou specify the target table, list the columns you want to fill inside parentheses, and provide the corresponding values inside `VALUES (...)`. String values must always be wrapped in single or double quotes.',
        bn: 'টেবিল তৈরি হওয়ার পর তাতে নতুন তথ্য বা রেকর্ড ঢোকাতে `INSERT INTO` ব্যবহার করা হয়। প্রথমে টেবিলের নাম ও কলামের তালিকা দিতে হয়, এরপর `VALUES (...)` এর ভেতরে ক্রমানুসারে ডেটা বসাতে হয়। টেক্সট বা তারিখ লেখার সময় অবশ্যই কোটেশন (\' বা ") ব্যবহার করতে হবে।',
      },
      deepDive: {
        en: 'Batch inserting multiple rows in a single query (e.g. `VALUES (...), (...), (...)`) is orders of magnitude faster than running 100 individual `INSERT` statements because it reduces network round-trips and combines transaction disk syncs into a single commit.',
        bn: 'একের পর এক আলাদা INSERT না চালিয়ে একসাথে একাধিক ব্র্যাকেট দিয়ে `VALUES (...), (...), (...)` লিখলে কুয়েরি বহুগুণ দ্রুত এক্সিকিউট হয়।',
      },
      syntax: 'INSERT INTO table_name (col1, col2, col3)\nVALUES (val1, val2, val3),\n       (val4, val5, val6);',
    },
    sampleData: {
      description: 'The students table before and after inserting a new record:',
      columns: ['student_id', 'first_name', 'last_name', 'major', 'gpa'],
      rows: [
        { student_id: 1, first_name: 'Amina', last_name: 'Rahman', major: 'Computer Science', gpa: 3.85 },
        { student_id: 2, first_name: 'Tanvir', last_name: 'Hossain', major: 'Electrical Engineering', gpa: 3.40 },
        { student_id: 7, first_name: 'Kavita', last_name: 'Roy', major: 'Data Science', gpa: 3.75 },
      ],
    },
    queryExample: {
      title: 'Inserting a New Student Record',
      code: `-- Insert a new student record into the students table
INSERT INTO students (student_id, first_name, last_name, email, major, gpa, enrollment_date)
VALUES (7, 'Kavita', 'Roy', 'kavita@school.edu', 'Data Science', 3.75, '2024-02-01');`,
      explanation: [
        'Line 2: Specifies the target table `students` and lists the 7 columns being populated.',
        'Line 3: Provides the exact matching 7 values in corresponding order.',
      ],
    },
    expectedOutput: {
      columns: ['status'],
      rows: [{ status: 'Query OK, 1 row affected.' }],
    },
    commonMistakes: [
      'Mismatched column and value counts: having 4 columns in the column list but providing 5 values in the VALUES clause will cause an error.',
      'Forgetting quotes around strings: writing `VALUES (1, Amina, Rahman)` causes MySQL to look for columns named Amina and Rahman!',
    ],
    exercise: {
      instructions: 'Insert a new student with student_id=8, first_name="Dev", last_name="Sharma", email="dev@school.edu", major="Physics", gpa=3.60, enrollment_date="2024-02-15".',
      hint: "INSERT INTO students (student_id, first_name, last_name, email, major, gpa, enrollment_date) VALUES (8, 'Dev', 'Sharma', 'dev@school.edu', 'Physics', 3.60, '2024-02-15');",
      starterQuery: "INSERT INTO students (student_id, first_name, last_name, email, major, gpa, enrollment_date)\nVALUES (8, 'Dev', 'Sharma', 'dev@school.edu', 'Physics', 3.60, '2024-02-15');",
      solution: "INSERT INTO students (student_id, first_name, last_name, email, major, gpa, enrollment_date) VALUES (8, 'Dev', 'Sharma', 'dev@school.edu', 'Physics', 3.60, '2024-02-15');",
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'In SQL, what is required when inserting text or calendar date values?',
      options: [
        'They must be wrapped in angle brackets `<...>`',
        "They must be wrapped in quotation marks like `'Amina'` or `'2024-01-01'`",
        'They must be written backwards',
        'They must only contain binary numbers 0 and 1',
      ],
      correctAnswer: 1,
      explanation: 'In SQL, string and date literals must always be enclosed in single or double quotes, whereas numeric numbers are written raw without quotes.',
    },
    nextLessonId: 'mysql-11',
  },

  {
    id: 'mysql-11',
    track: 'mysql',
    module: 2,
    moduleTitle: 'Module 2: SQL Fundamentals',
    order: 11,
    difficulty: 'Beginner',
    title: {
      en: '11. Retrieving Data with SELECT',
      bn: '১১. SELECT দিয়ে ডেটা রিট্রিভ করা',
    },
    subtitle: {
      en: 'The heart of SQL: ask questions to your database and extract tabular results.',
      bn: 'SQL-এর প্রাণকেন্দ্র: ডাটাবেস থেকে প্রয়োজনীয় তথ্য নিখুঁতভাবে খুঁজে আনা।',
    },
    duration: '15 mins',
    objectives: [
      'Master the fundamental read operation of SQL: `SELECT`.',
      'Understand the wildcard asterisk (`*`) and when to avoid it in production.',
      'Read and interpret tabular SQL result grids.',
      'Learn how the database engine evaluates `FROM` before `SELECT`.',
    ],
    prerequisites: 'Lessons 7-10.',
    explanation: {
      simple: {
        en: 'The `SELECT` statement is by far the most commonly used command in SQL. It queries the database and displays the matching rows as a neat table.\n```sql\nSELECT * FROM students;\n```\nThe asterisk (`*`) is a wildcard character that means "all columns". While `SELECT *` is convenient during exploration and practice, in production applications you should explicitly name the columns you need. Asking for only the columns you actually use reduces network payload and speeds up query execution.',
        bn: 'SQL-এ সবচেয়ে বেশি ব্যবহৃত কমান্ড হলো `SELECT`। এটি দিয়ে ডাটাবেস থেকে কাঙ্ক্ষিত তথ্য খুঁজে এনে টেবিলে প্রদর্শন করা হয়। স্টার চিহ্ন (`*`) দ্বারা "সবগুলো কলাম" বোঝায়। প্র্যাকটিসের সময় `SELECT *` ব্যবহার করা সহজ হলেও বাস্তব অ্যাপে শুধুমাত্র প্রয়োজনীয় কলামের নাম লিখে ডেটা আনা উত্তম।',
      },
      deepDive: {
        en: 'In SQL execution order, the database engine does NOT evaluate `SELECT` first! It first evaluates the `FROM` clause to locate the physical table on disk, loads the data blocks into memory, and only then projects the requested columns defined in `SELECT`.',
        bn: 'ডাটাবেস ইঞ্জিন কুয়েরি চালানোর সময় প্রথমে `FROM` অংশ দেখে টেবিল শনাক্ত করে, এরপর `SELECT` এ উল্লেখিত কলামগুলোকে ফিল্টার করে নিয়ে আসে।',
      },
      syntax: 'SELECT * FROM table_name;',
    },
    sampleData: {
      description: 'The complete students table in university_db:',
      columns: ['student_id', 'first_name', 'last_name', 'major', 'gpa'],
      rows: [
        { student_id: 1, first_name: 'Amina', last_name: 'Rahman', major: 'Computer Science', gpa: 3.85 },
        { student_id: 2, first_name: 'Tanvir', last_name: 'Hossain', major: 'Electrical Engineering', gpa: 3.40 },
        { student_id: 3, first_name: 'Nusrat', last_name: 'Jahan', major: 'Computer Science', gpa: 3.92 },
        { student_id: 4, first_name: 'Rafiq', last_name: 'Islam', major: 'Business Administration', gpa: 2.95 },
        { student_id: 5, first_name: 'Sadia', last_name: 'Akter', major: 'Mathematics', gpa: 3.70 },
        { student_id: 6, first_name: 'Fahim', last_name: 'Shahriar', major: 'Computer Science', gpa: 3.15 },
      ],
    },
    queryExample: {
      title: 'Querying All Columns from Students',
      code: `-- Retrieve every column and record from the students table
SELECT *
FROM students;`,
      explanation: [
        'Line 2: The asterisk specifies that all 7 columns should be returned.',
        'Line 3: FROM students identifies the table.',
      ],
    },
    expectedOutput: {
      columns: ['student_id', 'first_name', 'last_name', 'email', 'major', 'gpa', 'enrollment_date'],
      rows: [
        { student_id: 1, first_name: 'Amina', last_name: 'Rahman', email: 'amina@school.edu', major: 'Computer Science', gpa: 3.85, enrollment_date: '2023-08-15' },
        { student_id: 2, first_name: 'Tanvir', last_name: 'Hossain', email: 'tanvir@school.edu', major: 'Electrical Engineering', gpa: 3.40, enrollment_date: '2023-08-15' },
        { student_id: 3, first_name: 'Nusrat', last_name: 'Jahan', email: 'nusrat@school.edu', major: 'Computer Science', gpa: 3.92, enrollment_date: '2022-08-20' },
      ],
    },
    commonMistakes: [
      'Using SELECT * in production web backends: if the table later adds large text or binary columns, SELECT * causes massive unnecessary memory overhead.',
      'Misspelling table names: writing `FROM student` instead of `FROM students`.',
    ],
    exercise: {
      instructions: 'Write a query to retrieve all columns and rows from the `courses` table.',
      hint: 'SELECT * FROM courses;',
      starterQuery: 'SELECT * FROM courses;',
      solution: 'SELECT * FROM courses;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'In a SQL query, what does the asterisk symbol (`*`) represent?',
      options: [
        'Multiply all numbers by 100',
        'Wildcard representing all columns in the table',
        'Delete all rows permanently',
        'Sort in ascending alphabetical order',
      ],
      correctAnswer: 1,
      explanation: 'In the SELECT clause, the asterisk (*) serves as a wildcard meaning all columns present in the source table.',
    },
    nextLessonId: 'mysql-12',
  },

  {
    id: 'mysql-12',
    track: 'mysql',
    module: 2,
    moduleTitle: 'Module 2: SQL Fundamentals',
    order: 12,
    difficulty: 'Beginner',
    title: {
      en: '12. Selecting Specific Columns, Aliases, and DISTINCT',
      bn: '১২. নির্দিষ্ট কলাম নির্বাচন, অ্যালিয়াস ও DISTINCT',
    },
    subtitle: {
      en: 'Filter projection, rename result headers with AS, and eliminate duplicate records.',
      bn: 'নির্দিষ্ট কলাম বেছে নেওয়া, AS দিয়ে নতুন নাম দেওয়া এবং ডুপ্লিকেট বাদ দেওয়া।',
    },
    duration: '20 mins',
    objectives: [
      'Select only specific columns instead of dumping the entire table.',
      'Assign readable column aliases using the `AS` keyword.',
      'Eliminate duplicate output values using the `DISTINCT` keyword.',
      'Understand computed expressions in the SELECT projection list.',
    ],
    prerequisites: 'Lesson 11: Retrieving Data with SELECT.',
    explanation: {
      simple: {
        en: 'Instead of fetching everything with `*`, you can list the exact columns you want separated by commas:\n```sql\nSELECT first_name, email FROM students;\n```\nYou can also rename columns in the output using `AS` (called an Alias):\n```sql\nSELECT first_name AS student_first_name FROM students;\n```\nIf you want to see a list of unique values with all duplicates removed, use `DISTINCT`:\n```sql\nSELECT DISTINCT major FROM students;\n```\nEven if 50 students are in "Computer Science", it will appear only once in the result list!',
        bn: 'সব কলাম না এনে কমা দিয়ে নির্দিষ্ট কলাম আনা যায় (যেমন `first_name, email`)। `AS` কি-ওয়ার্ড ব্যবহার করে ফলাফলের কলামের নাম পরিবর্তন (Alias) করা যায়। আর যদি কোনো কলামের ইউনিক মানগুলো দেখতে চান এবং ডুপ্লিকেট বাদ দিতে চান, তবে `DISTINCT` ব্যবহার করবেন।',
      },
      deepDive: {
        en: 'Column aliases created with `AS` are strictly for output formatting. They do not alter the permanent column name on disk. Note that you cannot reference a SELECT column alias in a WHERE clause of the same query, because WHERE is evaluated before SELECT!',
        bn: '`AS` দিয়ে দেওয়া নাম শুধু ফলাফল দেখানোর জন্য ব্যবহৃত হয়; ডাটাবেসের ভেতরের আসল নাম বদলায় না। মনে রাখবেন, WHERE ক্লজে এই অ্যালিয়াস নাম ব্যবহার করা যায় না কারণ WHERE আগে কার্যকর হয়।',
      },
      syntax: 'SELECT DISTINCT column1 AS new_name, column2\nFROM table_name;',
    },
    sampleData: {
      description: 'The majors in the students table before DISTINCT:',
      columns: ['student_id', 'major'],
      rows: [
        { student_id: 1, major: 'Computer Science' },
        { student_id: 2, major: 'Electrical Engineering' },
        { student_id: 3, major: 'Computer Science' },
        { student_id: 4, major: 'Business Administration' },
        { student_id: 5, major: 'Mathematics' },
        { student_id: 6, major: 'Computer Science' },
      ],
    },
    queryExample: {
      title: 'Extracting Unique Majors with DISTINCT',
      code: `-- Get the list of all unique majors offered across our student body
SELECT DISTINCT major
FROM students;`,
      explanation: [
        'Line 2: DISTINCT filters out repeating values so Computer Science appears once instead of three times.',
        'Line 3: Specifies the students table.',
      ],
    },
    expectedOutput: {
      columns: ['major'],
      rows: [
        { major: 'Computer Science' },
        { major: 'Electrical Engineering' },
        { major: 'Business Administration' },
        { major: 'Mathematics' },
      ],
    },
    commonMistakes: [
      'Applying DISTINCT to multiple columns without understanding that it evaluates the entire row combination, not individual columns.',
      'Using quotes on column names instead of values: `SELECT "first_name"` will output the literal word "first_name" for every row instead of reading the column!',
    ],
    exercise: {
      instructions: 'Select unique departments from the `courses` table using DISTINCT, aliasing the column as `academic_department`.',
      hint: 'SELECT DISTINCT department AS academic_department FROM courses;',
      starterQuery: 'SELECT DISTINCT department AS academic_department FROM courses;',
      solution: 'SELECT DISTINCT department AS academic_department FROM courses;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'What is the effect of placing the `DISTINCT` keyword immediately after `SELECT`?',
      options: [
        'It sorts all records in reverse alphabetical order',
        'It removes duplicate rows from the query output results',
        'It encrypts passwords stored in the database',
        'It changes the table definition permanently on disk',
      ],
      correctAnswer: 1,
      explanation: 'SELECT DISTINCT filters duplicate rows from the query results so that only unique combinations are returned.',
    },
    nextLessonId: 'mysql-13',
  },
];

export const module2Lessons = MODULE_2_LESSONS;
