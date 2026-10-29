// Module 4: Changing and Managing Data (Lessons 19-24)
// Complete educational content covering UPDATE, DELETE, ALTER, DROP, TRUNCATE, Constraints, and Primary Keys.

export const MODULE_4_LESSONS = [
  {
    id: 'mysql-19',
    track: 'mysql',
    module: 4,
    moduleTitle: 'Module 4: Changing and Managing Data',
    order: 19,
    difficulty: 'Intermediate',
    title: {
      en: '19. Updating Records with UPDATE',
      bn: '১৯. UPDATE দিয়ে বিদ্যমান ডেটা পরিবর্তন',
    },
    subtitle: {
      en: 'Modify existing values in table rows and learn the life-saving rule of the WHERE clause.',
      bn: 'টেবিলের ভেতরের ডেটা আপডেট করা এবং WHERE ক্লজ না দেওয়ার মারাত্মক ঝুঁকি।',
    },
    duration: '20 mins',
    objectives: [
      'Master the `UPDATE ... SET ... WHERE` syntax.',
      'Update single and multiple columns simultaneously.',
      'Understand the catastrophic risk of running `UPDATE` without a `WHERE` clause.',
      'Verify modifications using SELECT queries after updating.',
    ],
    prerequisites: 'Module 3: Filtering and Sorting.',
    explanation: {
      simple: {
        en: 'The `UPDATE` statement modifies existing data inside a table. For example, if a student changes their major or an employee receives a salary raise, you use `UPDATE`.\nSyntax:\n```sql\nUPDATE students\nSET major = "Data Science", gpa = 3.90\nWHERE student_id = 1;\n```\n⚠️ LIFE-SAVING RULE: ALWAYS include a WHERE clause when updating! If you forget `WHERE`, MySQL will update EVERY SINGLE ROW in the entire table to that value!',
        bn: 'টেবিলের বিদ্যমান কোনো তথ্য পরিবর্তন করার জন্য `UPDATE` ব্যবহৃত হয়। যেমন কোনো ছাত্রের মেজর পরিবর্তন বা কর্মচারীর বেতন বৃদ্ধি।\n⚠️ মারাত্মক সতর্কতা: UPDATE লেখার সময় সর্বদা `WHERE` ক্লজ ব্যবহার করবেন! যদি ভুলেও WHERE ক্লজ না দেন, তবে টেবিলের সব রেকর্ডের মান এক নিমিষে বদলে যাবে!',
      },
      deepDive: {
        en: 'Production tip: Before running any UPDATE statement on a live production database, first write the exact same query as a `SELECT` with that `WHERE` clause to verify exactly which rows will be affected! Many teams also enable MySQL Safe Updates mode (`SET sql_safe_updates = 1;`) which blocks UPDATE queries that do not target a key column.',
        bn: 'প্রফেশনাল টিপস: প্রডাকশনে কোনো UPDATE চালানোর আগে প্রথমে একই WHERE ক্লজ দিয়ে `SELECT` চালিয়ে দেখে নিন কোন কোন রেকর্ড পরিবর্তন হতে চলেছে।',
      },
      syntax: 'UPDATE table_name\nSET column1 = value1, column2 = value2\nWHERE condition;',
    },
    sampleData: {
      description: 'The students table before and after updating student_id 4:',
      columns: ['student_id', 'first_name', 'major', 'gpa'],
      rows: [
        { student_id: 4, first_name: 'Rafiq', major: 'Business Administration (Old)', gpa: 2.95 },
        { student_id: 4, first_name: 'Rafiq', major: 'Management Info Systems (New)', gpa: 3.20 },
      ],
    },
    queryExample: {
      title: 'Updating a Student Major and GPA',
      code: `-- Safely update Rafiq's major and improved GPA using his unique student_id
UPDATE students
SET major = 'Management Info Systems', gpa = 3.20
WHERE student_id = 4;`,
      explanation: [
        'Line 2: Identifies target table `students`.',
        'Line 3: SET clause lists comma-separated assignments.',
        'Line 4: WHERE student_id = 4 restricts modification to only that single record.',
      ],
    },
    expectedOutput: {
      columns: ['status'],
      rows: [{ status: 'Query OK, 1 row affected.' }],
    },
    commonMistakes: [
      'Omitting the WHERE clause: this overwrites the entire table!',
      'Using AND in the SET clause: `SET major = "CS" AND gpa = 3.8` is wrong! Columns in SET must be separated by commas, not AND.',
    ],
    exercise: {
      instructions: 'Give employee with emp_id 1007 a salary raise to 50000 in the `employees` table.',
      hint: 'UPDATE employees SET salary = 50000 WHERE emp_id = 1007;',
      starterQuery: 'UPDATE employees SET salary = 50000 WHERE emp_id = 1007;',
      solution: 'UPDATE employees SET salary = 50000 WHERE emp_id = 1007;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'What happens if you execute an UPDATE statement without specifying a WHERE clause?',
      options: [
        'MySQL throws an error and rejects the query completely',
        'Only the very first row in the table is updated',
        'Every single row in the entire table is updated with the new value',
        'A new empty row is appended to the table',
      ],
      correctAnswer: 2,
      explanation: 'Without a WHERE clause to filter the target rows, the UPDATE statement applies the new values across every single row in the table.',
    },
    nextLessonId: 'mysql-20',
  },

  {
    id: 'mysql-20',
    track: 'mysql',
    module: 4,
    moduleTitle: 'Module 4: Changing and Managing Data',
    order: 20,
    difficulty: 'Intermediate',
    title: {
      en: '20. Deleting Records with DELETE',
      bn: '২০. DELETE দিয়ে রেকর্ড মুছে ফেলা',
    },
    subtitle: {
      en: 'Remove rows safely and understand the irreversible nature of deletion.',
      bn: 'নিরাপদে সারি ডিলিট করা এবং ভুল ডিলিট এড়ানোর উপায়।',
    },
    duration: '20 mins',
    objectives: [
      'Master the `DELETE FROM ... WHERE` syntax.',
      'Understand the difference between deleting rows (`DELETE`) and removing tables (`DROP`).',
      'Learn how foreign key constraints prevent orphaned record deletions.',
      'Understand Soft Deletes (`is_deleted` column) in modern software engineering.',
    ],
    prerequisites: 'Lesson 19: Updating Records with UPDATE.',
    explanation: {
      simple: {
        en: 'The `DELETE` statement permanently removes one or more rows from a table.\nSyntax:\n```sql\nDELETE FROM students\nWHERE student_id = 6;\n```\n⚠️ DANGER: Just like UPDATE, if you run `DELETE FROM students;` without a `WHERE` clause, MySQL will delete ALL rows in the table, leaving you with an empty table!\nIn modern web development, many companies prefer "Soft Deletes" (e.g. `UPDATE users SET is_deleted = TRUE`) so that historical customer orders are not accidentally broken.',
        bn: 'টেবিল থেকে কোনো সারি বা রেকর্ড মুছে ফেলার জন্য `DELETE` ব্যবহৃত হয়।\n⚠️ বিপদজনক সতর্কতা: UPDATE-এর মতো এখানেও WHERE ক্লজ না দিলে টেবিলের সমস্ত রেকর্ড চিরতরে মুছে যাবে!\nবাস্তব অ্যাপ্লিকেশনে সরাসরি ডাটা মুছে ফেলার বদলে অনেক সময় সফট ডিলিট (`is_deleted = 1`) ব্যবহার করা হয় যাতে তথ্যের ইতিহাস বজায় থাকে।',
      },
      deepDive: {
        en: 'If a table has child foreign key dependencies (e.g., student 1 has records in `enrollments`), MySQL InnoDB will by default reject the DELETE statement with `ERROR 1451: Cannot delete or update a parent row: a foreign key constraint fails`. This protects referential integrity.',
        bn: 'যদি কোনো ছাত্রের enrollments টেবিলে রেকর্ড থাকে, তবে সরাসরি তাকে ডিলিট করতে গেলে ফরেন কি এরর দিয়ে আটকে দেবে, যাতে কোনো অভিভাবকহীন ডেটা (orphaned data) তৈরি না হয়।',
      },
      syntax: 'DELETE FROM table_name\nWHERE condition;',
    },
    sampleData: {
      description: 'The students table before and after deleting student_id 6:',
      columns: ['student_id', 'first_name', 'last_name', 'major'],
      rows: [
        { student_id: 1, first_name: 'Amina', last_name: 'Rahman', major: 'Computer Science' },
        { student_id: 6, first_name: 'Fahim', last_name: 'Shahriar', major: 'Computer Science' },
      ],
    },
    queryExample: {
      title: 'Safely Deleting a Specific Record',
      code: `-- Safely delete student with ID 6 using an exact primary key WHERE clause
DELETE FROM students
WHERE student_id = 6;`,
      explanation: [
        'Line 2: Specifies the target table.',
        'Line 3: WHERE clause ensures only the record with student_id 6 is removed.',
      ],
    },
    expectedOutput: {
      columns: ['status'],
      rows: [{ status: 'Query OK, 1 row affected.' }],
    },
    commonMistakes: [
      'Omitting the WHERE clause: running `DELETE FROM students;` destroys all data!',
      'Writing `DELETE * FROM students`: the asterisk is invalid syntax in DELETE statements.',
    ],
    exercise: {
      instructions: 'Delete the course with course_id 105 from the `courses` table.',
      hint: 'DELETE FROM courses WHERE course_id = 105;',
      starterQuery: 'DELETE FROM courses WHERE course_id = 105;',
      solution: 'DELETE FROM courses WHERE course_id = 105;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'Which of the following SQL statements correctly deletes a student named "Fahim" from the students table?',
      options: [
        'REMOVE FROM students WHERE first_name = "Fahim";',
        'DELETE * FROM students WHERE first_name = "Fahim";',
        'DELETE FROM students WHERE first_name = "Fahim";',
        'DROP students WHERE first_name = "Fahim";',
      ],
      correctAnswer: 2,
      explanation: 'DELETE FROM table_name WHERE condition; is the standardized syntax. The asterisk (*) is not used in DELETE statements.',
    },
    nextLessonId: 'mysql-21',
  },

  {
    id: 'mysql-21',
    track: 'mysql',
    module: 4,
    moduleTitle: 'Module 4: Changing and Managing Data',
    order: 21,
    difficulty: 'Intermediate',
    title: {
      en: '21. ALTER TABLE: Changing Table Structures',
      bn: '২১. ALTER TABLE: টেবিলের কাঠামো পরিবর্তন',
    },
    subtitle: {
      en: 'Add new columns, rename fields, change data types, and drop obsolete columns.',
      bn: 'নতুন কলাম যোগ করা, কলামের নাম বা ডেটা টাইপ পরিবর্তন এবং অপ্রয়োজনীয় কলাম মুছে ফেলা।',
    },
    duration: '20 mins',
    objectives: [
      'Master the `ALTER TABLE` DDL command.',
      'Add new columns with `ADD COLUMN`.',
      'Modify column data types with `MODIFY COLUMN`.',
      'Rename columns with `RENAME COLUMN`.',
      'Remove columns with `DROP COLUMN`.',
    ],
    prerequisites: 'Lesson 9: Creating Tables with CREATE TABLE.',
    explanation: {
      simple: {
        en: 'Software requirements evolve. When your website needs to add a phone number or birth date to an existing users table, you don\'t destroy the table and recreate it! Instead, you use `ALTER TABLE`:\n- Add a column:\n  `ALTER TABLE students ADD phone_number VARCHAR(20);`\n- Change data type:\n  `ALTER TABLE students MODIFY phone_number VARCHAR(30);`\n- Rename a column:\n  `ALTER TABLE students RENAME COLUMN gpa TO cumulative_gpa;`\n- Remove a column:\n  `ALTER TABLE students DROP COLUMN phone_number;`',
        bn: 'অ্যাপের রিকোয়ারমেন্ট সময়ের সাথে সাথে পরিবর্তন হয়। ব্যবহারকারীর টেবিলে ফোন নম্বর বা জন্মতারিখের নতুন কলাম দরকার হলে পুরো টেবিল ডিলিট না করে `ALTER TABLE` দিয়ে পরিবর্তন করা হয়। এর মাধ্যমে নতুন কলাম যোগ, টাইপ পরিবর্তন বা নাম রিনেম করা যায়।',
      },
      deepDive: {
        en: 'In large production tables containing millions of rows, running `ALTER TABLE` historically locked the table for reading or writing. Modern MySQL 8.0 uses Online DDL (`ALGORITHM=INPLACE, LOCK=NONE`) to allow simultaneous reads and writes while columns are being added.',
        bn: 'লাখ লাখ ডেটা থাকা টেবিলে ALTER TABLE চালালে পুরোনো দিনে টেবিল লক হয়ে যেত। MySQL 8.0-তে Online DDL ফিচারের কারণে ওয়েবসাইট চালু রেখেই লাইভ টেবিলে নতুন কলাম যোগ করা সম্ভব।',
      },
      syntax: 'ALTER TABLE table_name ADD column_name datatype;\nALTER TABLE table_name DROP COLUMN column_name;\nALTER TABLE table_name MODIFY COLUMN column_name new_datatype;',
    },
    sampleData: {
      description: 'The students table schema before and after adding phone_number:',
      columns: ['Field', 'Type', 'Null', 'Key'],
      rows: [
        { Field: 'student_id', Type: 'INT', Null: 'NO', Key: 'PRI' },
        { Field: 'first_name', Type: 'VARCHAR(50)', Null: 'NO', Key: '' },
        { Field: 'phone_number', Type: 'VARCHAR(20)', Null: 'YES', Key: '' },
      ],
    },
    queryExample: {
      title: 'Adding a Phone Number Column to Students',
      code: `-- Add a new optional phone_number column to the students table
ALTER TABLE students
ADD COLUMN phone_number VARCHAR(20);`,
      explanation: [
        'Line 2: Identifies table `students` being altered.',
        'Line 3: ADD COLUMN declares the new field name `phone_number` and its VARCHAR(20) type.',
      ],
    },
    expectedOutput: {
      columns: ['status'],
      rows: [{ status: "Table 'students' altered successfully." }],
    },
    commonMistakes: [
      'Changing a column data type from VARCHAR to INT when the column already contains letters: MySQL will abort with a data truncation error.',
      'Dropping a column without checking application code: any running API endpoint that selects that column will immediately crash!',
    ],
    exercise: {
      instructions: 'Run a query to add an `is_active` BOOLEAN column to the `students` table.',
      hint: 'ALTER TABLE students ADD COLUMN is_active BOOLEAN;',
      starterQuery: 'ALTER TABLE students ADD COLUMN is_active BOOLEAN;',
      solution: 'ALTER TABLE students ADD COLUMN is_active BOOLEAN;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'Which SQL statement is used to add a new column to an existing table in a database?',
      options: ['UPDATE TABLE', 'ALTER TABLE', 'MODIFY TABLE', 'EXPAND TABLE'],
      correctAnswer: 1,
      explanation: 'ALTER TABLE is the standard DDL command used to modify the structural schema of an existing table.',
    },
    nextLessonId: 'mysql-22',
  },

  {
    id: 'mysql-22',
    track: 'mysql',
    module: 4,
    moduleTitle: 'Module 4: Changing and Managing Data',
    order: 22,
    difficulty: 'Intermediate',
    title: {
      en: '22. DROP, TRUNCATE, and Safe Data Removal',
      bn: '২২. DROP, TRUNCATE এবং নিরাপদ ডেটা রিমুভাল',
    },
    subtitle: {
      en: 'Understand the critical differences between DELETE, TRUNCATE, and DROP.',
      bn: 'DELETE, TRUNCATE এবং DROP-এর সূক্ষ্ম পার্থক্য ও সতর্কতা।',
    },
    duration: '20 mins',
    objectives: [
      'Contrast `DELETE` (row-by-row DML) vs `TRUNCATE` (fast table wipe DDL) vs `DROP` (destroy table entirely DDL).',
      'Understand how `TRUNCATE` resets `AUTO_INCREMENT` counters back to 1.',
      'Use `DROP TABLE IF EXISTS` safely in deployment migrations.',
      'Recognize irreversible destructive operations and production safety protocols.',
    ],
    prerequisites: 'Lesson 20: Deleting Records with DELETE.',
    explanation: {
      simple: {
        en: 'Here is the definitive guide to removing data in SQL:\n1. `DELETE FROM table WHERE ...`: Deletes specific rows. Slowest, but allows WHERE filters. Preserves table structure.\n2. `TRUNCATE TABLE table;`: Wipes ALL rows in a blink. Extremely fast, resets the AUTO_INCREMENT counter back to 1, but keeps the empty table structure ready for new data.\n3. `DROP TABLE table;`: Completely destroys the table, its columns, and all its data permanently from disk. The table ceases to exist!',
        bn: 'ডেটা রিমুভালের ৩টি পদ্ধতির পার্থক্য:\n১. `DELETE`: নির্দিষ্ট সারি ডিলিট করে। তুলনামূলক ধীরগতির, তবে এতে WHERE ক্লজ দেওয়া যায়।\n২. `TRUNCATE`: চোখের পলকে পুরো টেবিলের সব ডেটা খালি করে দেয় এবং আইডি কাউন্টার আবার ১ থেকে শুরু করে। কিন্তু টেবিলটির কাঠামো অক্ষত থাকে।\n৩. `DROP`: টেবিল, কলাম ও ডেটাসহ পুরো টেবিলটিকে চিরতরে ডাটাবেস থেকে মুছে ফেলে!',
      },
      deepDive: {
        en: 'Under the hood, `DELETE` logs every individual deleted row in the transaction rollback undo log. In contrast, `TRUNCATE` drops the physical data file and recreates a fresh, empty data space on disk, bypassing row-by-row undo logging.',
        bn: 'DELETE প্রতিটি সারির জন্য আলাদা আনডু লগ লেখে। কিন্তু TRUNCATE সরাসরি ডিস্কের ফাইলটি খালি করে নতুন স্পেস তৈরি করে, তাই এটি হাজার গুণ দ্রুত কাজ করে।',
      },
      syntax: 'TRUNCATE TABLE table_name;\nDROP TABLE IF EXISTS table_name;',
    },
    sampleData: {
      description: 'Comparison of data removal commands in MySQL:',
      columns: ['Command', 'Type', 'Speed', 'Can Rollback?', 'Table Remains?'],
      rows: [
        { Command: 'DELETE', Type: 'DML', Speed: 'Slow (row-by-row)', 'Can Rollback?': 'Yes (in transaction)', 'Table Remains?': 'Yes' },
        { Command: 'TRUNCATE', Type: 'DDL', Speed: 'Instant (file recreate)', 'Can Rollback?': 'No', 'Table Remains?': 'Yes (empty)' },
        { Command: 'DROP', Type: 'DDL', Speed: 'Instant (delete file)', 'Can Rollback?': 'No', 'Table Remains?': 'No (destroyed)' },
      ],
    },
    queryExample: {
      title: 'Safely Dropping a Temporary Staging Table',
      code: `-- Safely remove a temporary scratch table without throwing errors if it does not exist
DROP TABLE IF EXISTS temp_scratchpad;`,
      explanation: [
        'Line 2: DROP TABLE removes the table from the dictionary. IF EXISTS suppresses errors if the table is already absent.',
      ],
    },
    expectedOutput: {
      columns: ['status'],
      rows: [{ status: "Table 'temp_scratchpad' dropped." }],
    },
    commonMistakes: [
      'Using TRUNCATE when you only meant to delete specific rows: TRUNCATE cannot have a WHERE clause!',
      'Executing DROP TABLE in production without a verified database backup.',
    ],
    exercise: {
      instructions: 'Run a query to safely drop a table named `temp_scratchpad` if it exists.',
      hint: 'DROP TABLE IF EXISTS temp_scratchpad;',
      starterQuery: 'DROP TABLE IF EXISTS temp_scratchpad;',
      solution: 'DROP TABLE IF EXISTS temp_scratchpad;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'Which command empties all records from a table and resets its AUTO_INCREMENT counter to 1 while keeping the table structure intact?',
      options: ['DELETE TABLE', 'TRUNCATE TABLE', 'DROP TABLE', 'RESET TABLE'],
      correctAnswer: 1,
      explanation: 'TRUNCATE TABLE quickly removes all rows and resets the auto_increment identity counter back to 1 while leaving the empty table structure intact.',
    },
    nextLessonId: 'mysql-23',
  },

  {
    id: 'mysql-23',
    track: 'mysql',
    module: 4,
    moduleTitle: 'Module 4: Changing and Managing Data',
    order: 23,
    difficulty: 'Intermediate',
    title: {
      en: '23. Constraints: NOT NULL, UNIQUE, DEFAULT, and CHECK',
      bn: '২৩. কনস্ট্রেইন্টস: NOT NULL, UNIQUE, DEFAULT ও CHECK',
    },
    subtitle: {
      en: 'Enforce business rules directly in the database engine to guarantee zero bad data.',
      bn: 'ডাটাবেস লেভেলে ব্যবসায়িক নিয়ম প্রয়োগ করে ত্রুটিযুক্ত ডেটা প্রবেশ বন্ধ করুন।',
    },
    duration: '20 mins',
    objectives: [
      'Understand why database constraints provide superior data integrity compared to frontend code alone.',
      'Enforce required values with `NOT NULL`.',
      'Prevent duplicate registrations with `UNIQUE`.',
      'Set automatic fallback values with `DEFAULT`.',
      'Validate numerical or business boundaries using `CHECK` constraints (e.g. `CHECK (gpa >= 0.0 AND gpa <= 4.0)`).',
    ],
    prerequisites: 'Lesson 9: Creating Tables with CREATE TABLE.',
    explanation: {
      simple: {
        en: 'Constraints are rules enforced directly by the database engine on your data. Even if a bug in your frontend code tries to insert invalid data, the database will block it:\n- `NOT NULL`: The column can never be left empty.\n- `UNIQUE`: No two rows can have the same value (perfect for usernames, email addresses, or national ID numbers).\n- `DEFAULT`: Automatically fills a value if the insert statement omits it (e.g. `status VARCHAR(20) DEFAULT "ACTIVE"`).\n- `CHECK`: Evaluates a logical expression on insert or update (e.g. `CHECK (price > 0)` prevents negative prices).',
        bn: 'কনস্ট্রেইন্ট হলো ডাটাবেসের নিয়মাবলী। অ্যাপ্লিকেশনে কোনো বাগ থাকলেও ডাটাবেসের কনস্ট্রেইন্ট ভুল ডেটা ঢুকতে দেয় না:\n- `NOT NULL`: কলাম ফাঁকা রাখা যাবে না।\n- `UNIQUE`: ডুপ্লিকেট মান গ্রহণ করবে না (যেমন ইমেইল বা ফোন)।\n- `DEFAULT`: মান না দিলে স্বয়ংক্রিয়ভাবে ডিফল্ট মান বসে যাবে (যেমন `DEFAULT "ACTIVE"`)।\n- `CHECK`: নির্দিষ্ট শর্ত পূরণ না হলে ডেটা সেভ হতে দেবে না (যেমন `price > 0`)।',
      },
      deepDive: {
        en: 'MySQL 8.0 fully enforces CHECK constraints (prior MySQL versions parsed them syntactically but ignored them during execution). Multiple UNIQUE constraints can exist in a single table, but only one PRIMARY KEY is allowed.',
        bn: 'MySQL 8.0-তে CHECK কনস্ট্রেইন্ট সম্পূর্ণ কার্যকর। একটি টেবিলে একাধিক UNIQUE কনস্ট্রেইন্ট থাকতে পারে, কিন্তু PRIMARY KEY কেবল একটিই থাকে।',
      },
      syntax: 'CREATE TABLE accounts (\n  account_id INT PRIMARY KEY,\n  email VARCHAR(100) UNIQUE NOT NULL,\n  balance DECIMAL(10, 2) DEFAULT 0.00,\n  CHECK (balance >= 0.00)\n);',
    },
    sampleData: {
      description: 'Account constraints summary in MySQL:',
      columns: ['Constraint', 'Enforcement Rule', 'Example Usage'],
      rows: [
        { Constraint: 'NOT NULL', 'Enforcement Rule': 'Rejects NULL insertion', 'Example Usage': 'first_name VARCHAR(50) NOT NULL' },
        { Constraint: 'UNIQUE', 'Enforcement Rule': 'Rejects duplicate values', 'Example Usage': 'email VARCHAR(100) UNIQUE' },
        { Constraint: 'DEFAULT', 'Enforcement Rule': 'Supplies fallback if omitted', 'Example Usage': 'status VARCHAR(20) DEFAULT "PENDING"' },
        { Constraint: 'CHECK', 'Enforcement Rule': 'Evaluates boolean predicate', 'Example Usage': 'CHECK (age >= 18)' },
      ],
    },
    queryExample: {
      title: 'Creating an Accounts Table with Multi-Constraint Protection',
      code: `-- Create an accounts table with robust constraints
CREATE TABLE IF NOT EXISTS accounts (
  account_id INT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  is_verified BOOLEAN DEFAULT FALSE,
  CHECK (balance >= 0.00)
);`,
      explanation: [
        'Line 4: `username` must be unique across all rows and cannot be NULL.',
        'Line 5: `balance` defaults to 0.00 and has a CHECK constraint ensuring it never drops below 0.',
      ],
    },
    expectedOutput: {
      columns: ['status'],
      rows: [{ status: "Table 'accounts' created successfully." }],
    },
    commonMistakes: [
      'Relying solely on frontend React form validation: any malicious user with Postman or curl can bypass frontend checks. The database constraint is your final line of defense!',
      'Setting a CHECK constraint that contradicts a DEFAULT value.',
    ],
    exercise: {
      instructions: 'Create a table named `discounts` with `code_id INT PRIMARY KEY`, `code_name VARCHAR(20) UNIQUE NOT NULL`, and `percent_off INT DEFAULT 10`.',
      hint: 'CREATE TABLE discounts (code_id INT PRIMARY KEY, code_name VARCHAR(20) UNIQUE NOT NULL, percent_off INT DEFAULT 10);',
      starterQuery: 'CREATE TABLE discounts (\n  code_id INT PRIMARY KEY,\n  code_name VARCHAR(20) UNIQUE NOT NULL,\n  percent_off INT DEFAULT 10\n);',
      solution: 'CREATE TABLE discounts (code_id INT PRIMARY KEY, code_name VARCHAR(20) UNIQUE NOT NULL, percent_off INT DEFAULT 10);',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'Which constraint ensures that a column automatically receives a specified fallback value when an INSERT query omits it?',
      options: ['FALLBACK', 'DEFAULT', 'AUTO_FILL', 'REPLACE'],
      correctAnswer: 1,
      explanation: 'The DEFAULT constraint automatically assigns a preset fallback value to a column when an INSERT query does not provide one.',
    },
    nextLessonId: 'mysql-24',
  },

  {
    id: 'mysql-24',
    track: 'mysql',
    module: 4,
    moduleTitle: 'Module 4: Changing and Managing Data',
    order: 24,
    difficulty: 'Intermediate',
    title: {
      en: '24. Primary Keys and AUTO_INCREMENT',
      bn: '২৪. প্রাইমারি কি এবং AUTO_INCREMENT এর গুরুত্ব',
    },
    subtitle: {
      en: 'Give every record a unique digital passport and let MySQL manage sequential IDs.',
      bn: 'প্রতিটি রেকর্ডের জন্য অনন্য ডিজিটাল পাসপোর্ট এবং স্বয়ংক্রিয় আইডি জেনারেশন।',
    },
    duration: '20 mins',
    objectives: [
      'Understand why every relational table needs a Primary Key.',
      'Recognize the dual properties of a Primary Key: `UNIQUE` + `NOT NULL`.',
      'Automate unique integer ID generation using `AUTO_INCREMENT`.',
      'Learn how the InnoDB storage engine physically clusters table data on the primary key index.',
    ],
    prerequisites: 'Lesson 23: Constraints.',
    explanation: {
      simple: {
        en: 'A Primary Key is the unique identifier for each row in a database table. Just like every citizen has a unique National ID card or passport number, every row in a database table must have a Primary Key so you can target and update that exact row without affecting any other row.\nBecause creating manual numbers (1, 2, 3...) is tedious and error-prone, MySQL provides `AUTO_INCREMENT`. When you insert a new row, MySQL automatically increments the counter and assigns the next integer ID for you!',
        bn: 'প্রাইমারি কি (Primary Key) হলো প্রতিটি সারির অনন্য শনাক্তকারী নম্বর (যেমন আমাদের জাতীয় পরিচয়পত্র নম্বর)। একটি টেবিলে একই প্রাইমারি কি একাধিক সারিতে থাকতে পারে না।\nMySQL-এর `AUTO_INCREMENT` ফিচারটি স্বয়ংক্রিয়ভাবে নতুন সারির জন্য ১, ২, ৩ করে পরবর্তী ইউনিক আইডি নির্ধারণ করে দেয়।',
      },
      deepDive: {
        en: 'In MySQL InnoDB, the Primary Key dictates the physical layout of data on the SSD disk! This is known as a Clustered Index. Rows are physically sorted and stored in B+Tree leaf pages by their Primary Key value, making primary key lookups (`WHERE id = 1005`) virtually instantaneous.',
        bn: 'InnoDB স্টোরেজ ইঞ্জিনে প্রাইমারি কি অনুযায়ী ডেটা ডিস্কে ক্লাস্টার্ড ইনডেক্স আকারে সাজানো থাকে। ফলে প্রাইমারি কি দিয়ে খোঁজা হলে সেকেন্ডের ভগ্নাংশের মধ্যে ডেটা পাওয়া যায়।',
      },
      syntax: 'CREATE TABLE table_name (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  name VARCHAR(50)\n);',
    },
    sampleData: {
      description: 'Sequential ID assignment with AUTO_INCREMENT:',
      columns: ['student_id (PK)', 'first_name', 'email'],
      rows: [
        { 'student_id (PK)': 1, first_name: 'Amina', email: 'amina@school.edu' },
        { 'student_id (PK)': 2, first_name: 'Tanvir', email: 'tanvir@school.edu' },
        { 'student_id (PK)': 3, first_name: 'Nusrat', email: 'nusrat@school.edu' },
      ],
    },
    queryExample: {
      title: 'Creating a Table with an AUTO_INCREMENT Primary Key',
      code: `-- Create a tags table with automatic integer primary key
CREATE TABLE IF NOT EXISTS tags (
  tag_id INT PRIMARY KEY,
  tag_name VARCHAR(50) UNIQUE NOT NULL
);`,
      explanation: [
        'Line 3: Defines `tag_id` as the table PRIMARY KEY.',
        'Line 4: `tag_name` is uniquely constrained so tag names cannot be duplicated.',
      ],
    },
    expectedOutput: {
      columns: ['status'],
      rows: [{ status: "Table 'tags' created successfully." }],
    },
    commonMistakes: [
      'Using natural keys like names or phone numbers as Primary Keys: phone numbers change! Always use a surrogate integer ID.',
      'Having more than one Primary Key column declaration: a table can have only one Primary Key constraint (though it can span multiple composite columns).',
    ],
    exercise: {
      instructions: 'Write a query to create a table `departments_scratch` with `dept_id INT PRIMARY KEY` and `dept_name VARCHAR(50) NOT NULL`.',
      hint: 'CREATE TABLE departments_scratch (dept_id INT PRIMARY KEY, dept_name VARCHAR(50) NOT NULL);',
      starterQuery: 'CREATE TABLE departments_scratch (\n  dept_id INT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL\n);',
      solution: 'CREATE TABLE departments_scratch (dept_id INT PRIMARY KEY, dept_name VARCHAR(50) NOT NULL);',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'Which two fundamental constraints are automatically enforced on any column defined as a PRIMARY KEY?',
      options: ['CHECK and DEFAULT', 'UNIQUE and NOT NULL', 'FOREIGN KEY and AUTO_INCREMENT', 'VARCHAR and INT'],
      correctAnswer: 1,
      explanation: 'A PRIMARY KEY strictly combines UNIQUE (no two rows can have the same key) and NOT NULL (every row must have a value).',
    },
    nextLessonId: 'mysql-25',
  },
];

export const module4Lessons = MODULE_4_LESSONS;
