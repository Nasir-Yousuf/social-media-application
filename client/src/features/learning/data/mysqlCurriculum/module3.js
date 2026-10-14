// Module 3: Filtering and Sorting (Lessons 13-18)
// Complete educational content covering WHERE, comparisons, logical operators, LIKE, NULL, ORDER BY, and LIMIT.

export const MODULE_3_LESSONS = [
  {
    id: 'mysql-13',
    track: 'mysql',
    module: 3,
    moduleTitle: 'Module 3: Filtering and Sorting',
    order: 13,
    difficulty: 'Beginner',
    title: {
      en: '13. Filtering Records with WHERE',
      bn: '১৩. WHERE দিয়ে রেকর্ড ফিল্টার করা',
    },
    subtitle: {
      en: 'Narrow down massive tables to retrieve only the exact rows that meet your criteria.',
      bn: 'শর্ত পূরণকারী নির্দিষ্ট রেকর্ডগুলো খুঁজে বের করার মৌলিক কৌশল।',
    },
    duration: '15 mins',
    objectives: [
      'Master the `WHERE` clause to filter database records.',
      'Understand how the database scans rows and checks boolean expressions.',
      'Filter records by numbers, strings, and dates.',
      'Learn the execution order: `FROM` -> `WHERE` -> `SELECT`.',
    ],
    prerequisites: 'Module 2: SQL Fundamentals.',
    explanation: {
      simple: {
        en: 'In a real database with 10 million rows, you almost never want to retrieve every single row. The `WHERE` clause acts as a filter that checks each row. If the condition evaluates to `TRUE`, the row is included in your result; if it evaluates to `FALSE`, the row is skipped.\nExample:\n```sql\nSELECT first_name, last_name, gpa\nFROM students\nWHERE major = "Computer Science";\n```\nOnly students enrolled in Computer Science will be returned.',
        bn: 'লক্ষ লক্ষ রেকর্ডের মধ্যে সব ডেটা দরকার হয় না। `WHERE` ক্লজ একটি চালুনির মতো কাজ করে। এটি প্রতিটি সারির জন্য শর্তটি সত্য (TRUE) নাকি মিথ্যা (FALSE) তা পরীক্ষা করে। শুধুমাত্র শর্ত পূরণ করা সারিগুলোই ফলাফল হিসেবে স্ক্রিনে আসে।',
      },
      deepDive: {
        en: 'Under the hood, if the column in the WHERE clause is indexed (such as a B-tree index), MySQL skips reading the entire table and jumps directly to the matching data blocks using logarithmic search ($O(\\log N)$). Without an index, it performs a Full Table Scan ($O(N)$).',
        bn: 'WHERE ক্লজে ব্যবহৃত কলামে ইনডেক্স থাকলে MySQL চোখের পলকে নির্দিষ্ট ডাটা খুঁজে বের করতে পারে। ইনডেক্স না থাকলে পুরো টেবিলের প্রতিটি রেকর্ড একে একে পড়তে হয় (Full Table Scan)।',
      },
      syntax: 'SELECT column1, column2\nFROM table_name\nWHERE condition;',
    },
    sampleData: {
      description: 'The students table before applying WHERE filter:',
      columns: ['student_id', 'first_name', 'major', 'gpa'],
      rows: [
        { student_id: 1, first_name: 'Amina', major: 'Computer Science', gpa: 3.85 },
        { student_id: 2, first_name: 'Tanvir', major: 'Electrical Engineering', gpa: 3.40 },
        { student_id: 3, first_name: 'Nusrat', major: 'Computer Science', gpa: 3.92 },
        { student_id: 4, first_name: 'Rafiq', major: 'Business Administration', gpa: 2.95 },
      ],
    },
    queryExample: {
      title: 'Finding Computer Science Students',
      code: `-- Fetch students majoring specifically in Computer Science
SELECT student_id, first_name, last_name, gpa
FROM students
WHERE major = 'Computer Science';`,
      explanation: [
        'Line 2: Projected columns.',
        'Line 3: Target table `students`.',
        'Line 4: WHERE clause checking that the major column equals the string literal "Computer Science".',
      ],
    },
    expectedOutput: {
      columns: ['student_id', 'first_name', 'last_name', 'gpa'],
      rows: [
        { student_id: 1, first_name: 'Amina', last_name: 'Rahman', gpa: 3.85 },
        { student_id: 3, first_name: 'Nusrat', last_name: 'Jahan', gpa: 3.92 },
        { student_id: 6, first_name: 'Fahim', last_name: 'Shahriar', gpa: 3.15 },
      ],
    },
    commonMistakes: [
      'Using double equals (`==`): in SQL, equality comparison uses a single equal sign (`=`).',
      'Forgetting quotes around strings: `WHERE major = Computer Science` causes an error because SQL looks for a column named Computer.',
    ],
    exercise: {
      instructions: 'Find all students who have a GPA greater than 3.50 from the `students` table.',
      hint: 'SELECT * FROM students WHERE gpa > 3.50;',
      starterQuery: 'SELECT * FROM students WHERE gpa > 3.50;',
      solution: 'SELECT * FROM students WHERE gpa > 3.50;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'Which operator is used to test for equality in a SQL WHERE clause?',
      options: ['==', '=', '===', 'EQUALS'],
      correctAnswer: 1,
      explanation: 'In SQL, the single equals sign (=) is the standardized comparison operator for checking equality.',
    },
    nextLessonId: 'mysql-14',
  },

  {
    id: 'mysql-14',
    track: 'mysql',
    module: 3,
    moduleTitle: 'Module 3: Filtering and Sorting',
    order: 14,
    difficulty: 'Beginner',
    title: {
      en: '14. Comparison Operators and Logical Operators',
      bn: '১৪. তুলনা ও লজিক্যাল অপারেটরসমূহ',
    },
    subtitle: {
      en: 'Filter numbers, thresholds, and inequalities using =, !=, <>, >, <, >=, and <=.',
      bn: 'সংখ্যা ও সীমানা নির্ধারণের জন্য সমান, অসমান ও বড়-ছোট অপারেটরের ব্যবহার।',
    },
    duration: '20 mins',
    objectives: [
      'Master all SQL comparison operators: `=`, `!=` / `<>`, `>`, `<`, `>=`, `<=`.',
      'Understand how MySQL handles string comparisons lexicographically.',
      'Compare calendar dates using `<` and `>`.',
      'Combine multiple comparison predicates in a single query.',
    ],
    prerequisites: 'Lesson 13: Filtering Records with WHERE.',
    explanation: {
      simple: {
        en: 'SQL provides a full suite of mathematical comparison operators:\n- `=` : Equal to\n- `!=` or `<>` : Not equal to\n- `>` : Greater than\n- `<` : Less than\n- `>=` : Greater than or equal to\n- `<=` : Less than or equal to\nYou can compare dates just like numbers: `WHERE enrollment_date >= "2023-01-01"` finds students who enrolled in 2023 or later.',
        bn: 'SQL-এ গাণিতিক তুলনার জন্য রয়েছে বিভিন্ন অপারেটর:\n- `=` : সমান\n- `!=` বা `<>` : অসমান\n- `>` : বড়\n- `<` : ছোট\n- `>=` : বড় বা সমান\n- `<=` : ছোট বা সমান\nতারিখের ক্ষেত্রেও `<` বা `>` দিয়ে আগের ও পরের তারিখ তুলনা করা যায়।',
      },
      deepDive: {
        en: 'Both `!=` and `<>` mean "not equal" in MySQL. `<>` is the ANSI SQL standard, while `!=` is accepted by nearly all modern engines. When comparing strings with `<` or `>`, MySQL uses the table\'s collation (e.g. `utf8mb4_0900_ai_ci`) to compare alphabetical ordering.',
        bn: '`!=` এবং `<>` উভয়ই "অসমান" বোঝায়। `<>` হলো আন্তর্জাতিক ANSI স্ট্যান্ডার্ড। টেক্সটের ক্ষেত্রে বড়-ছোট তুলনা ডিকশনারির বর্ণানুক্রম অনুযায়ী নির্ধারিত হয়।',
      },
      syntax: 'WHERE salary >= 80000\nWHERE department <> "Support"\nWHERE hire_date > "2022-01-01"',
    },
    sampleData: {
      description: 'The employees table in company_db:',
      columns: ['emp_id', 'first_name', 'last_name', 'salary', 'hire_date'],
      rows: [
        { emp_id: 1001, first_name: 'Zubair', last_name: 'Ahmed', salary: 120000.00, hire_date: '2020-03-15' },
        { emp_id: 1002, first_name: 'Farhana', last_name: 'Yesmin', salary: 95000.00, hire_date: '2021-06-01' },
        { emp_id: 1003, first_name: 'Mahmud', last_name: 'Hassan', salary: 75000.00, hire_date: '2022-01-15' },
        { emp_id: 1007, first_name: 'Kamrul', last_name: 'Hasan', salary: 45000.00, hire_date: '2023-10-15' },
      ],
    },
    queryExample: {
      title: 'Finding High-Earning Employees',
      code: `-- Find employees earning a salary of 80,000 or more
SELECT first_name, last_name, job_title, salary
FROM employees
WHERE salary >= 80000;`,
      explanation: [
        'Line 2: Selected output columns.',
        'Line 3: Target table `employees`.',
        'Line 4: Compares salary column against threshold 80000.',
      ],
    },
    expectedOutput: {
      columns: ['first_name', 'last_name', 'job_title', 'salary'],
      rows: [
        { first_name: 'Zubair', last_name: 'Ahmed', job_title: 'Senior Software Engineer', salary: 120000.00 },
        { first_name: 'Farhana', last_name: 'Yesmin', job_title: 'DevOps Engineer', salary: 95000.00 },
        { first_name: 'Imtiaz', last_name: 'Chowdhury', job_title: 'Financial Analyst', salary: 82000.00 },
        { first_name: 'Sabrina', last_name: 'Rashid', job_title: 'Backend Developer', salary: 88000.00 },
      ],
    },
    commonMistakes: [
      'Using comma separators in numeric numbers: writing `WHERE salary >= 80,000` is a syntax error. Write `80000`.',
      'Confusing `<` with `<=`: if someone earns exactly 80000, `> 80000` excludes them, while `>= 80000` includes them.',
    ],
    exercise: {
      instructions: 'Find all products in the `products` table where price is less than 500 dollars.',
      hint: 'SELECT product_name, price FROM products WHERE price < 500;',
      starterQuery: 'SELECT product_name, price FROM products WHERE price < 500;',
      solution: 'SELECT product_name, price FROM products WHERE price < 500;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'Which of the following operators represents "Not Equal To" in standardized ANSI SQL?',
      options: ['<>', '!=', '><', '!=='],
      correctAnswer: 0,
      explanation: 'While both != and <> work in MySQL, <> is the formal ISO/ANSI SQL standard for "not equal to".',
    },
    nextLessonId: 'mysql-15',
  },

  {
    id: 'mysql-15',
    track: 'mysql',
    module: 3,
    moduleTitle: 'Module 3: Filtering and Sorting',
    order: 15,
    difficulty: 'Beginner',
    title: {
      en: '15. AND, OR, and NOT',
      bn: '১৫. AND, OR এবং NOT লজিক্যাল অপারেটর',
    },
    subtitle: {
      en: 'Combine complex business rules and master operator precedence with parentheses.',
      bn: 'একাধিক শর্ত একসাথে জোড়া দেওয়া ও বন্ধনীর সঠিক অগ্রাধিকার ব্যবহার।',
    },
    duration: '20 mins',
    objectives: [
      'Filter with `AND`: all conditions must be true.',
      'Filter with `OR`: at least one condition must be true.',
      'Negate conditions with `NOT`.',
      'Master operator precedence: understand why `AND` evaluates before `OR`, and how parentheses override order.',
    ],
    prerequisites: 'Lesson 14: Comparison Operators.',
    explanation: {
      simple: {
        en: 'Often, a single condition is not enough to express business rules. You can join conditions using:\n- `AND`: Every condition must be TRUE for the row to match.\n  (e.g., Student is in Computer Science AND has GPA > 3.8)\n- `OR`: Any condition can be TRUE for the row to match.\n  (e.g., Major is "Computer Science" OR Major is "Mathematics")\n- `NOT`: Reverses the condition.\n  (e.g., NOT major = "Business Administration")',
        bn: 'বাস্তব জীবনে প্রায়ই একাধিক শর্ত একসাথে যাচাই করতে হয়:\n- `AND`: সবগুলো শর্তই সত্য হতে হবে।\n- `OR`: যেকোনো একটি শর্ত সত্য হলেই রেকর্ডটি সিলেক্ট হবে।\n- `NOT`: শর্তকে উল্টে দেয় (অর্থাৎ যা সত্য নয়)।',
      },
      deepDive: {
        en: 'CRITICAL RULE: Operator Precedence! In SQL, `AND` takes precedence over `OR` (just like multiplication takes precedence over addition in arithmetic). If you write:\n`WHERE dept = "Eng" OR dept = "Math" AND salary > 80000`\nSQL evaluates `(dept = "Math" AND salary > 80000)` first! All Eng employees will be returned regardless of salary! Always use parentheses `()` to clarify your exact logic.',
        bn: 'জরুরি নিয়ম: গণিতের গুণের মতো SQL-এ `AND`-এর ক্ষমতা `OR`-এর চেয়ে বেশি! তাই একাধিক শর্ত ব্যবহারের সময় ভুল ফলাফল এড়াতে সবসময় প্রথম বন্ধনী `(...)` দিয়ে শর্তগুলো আলাদা করে লিখুন।',
      },
      syntax: 'WHERE condition1 AND condition2\nWHERE (condition1 OR condition2) AND condition3',
    },
    sampleData: {
      description: 'Students dataset with various majors and GPAs:',
      columns: ['student_id', 'first_name', 'major', 'gpa'],
      rows: [
        { student_id: 1, first_name: 'Amina', major: 'Computer Science', gpa: 3.85 },
        { student_id: 2, first_name: 'Tanvir', major: 'Electrical Engineering', gpa: 3.40 },
        { student_id: 3, first_name: 'Nusrat', major: 'Computer Science', gpa: 3.92 },
        { student_id: 5, first_name: 'Sadia', major: 'Mathematics', gpa: 3.70 },
        { student_id: 6, first_name: 'Fahim', major: 'Computer Science', gpa: 3.15 },
      ],
    },
    queryExample: {
      title: 'Combining Conditions with AND and Parentheses',
      code: `-- Find students who are either in Computer Science OR Mathematics, AND have a GPA >= 3.70
SELECT student_id, first_name, major, gpa
FROM students
WHERE (major = 'Computer Science' OR major = 'Mathematics')
  AND gpa >= 3.70;`,
      explanation: [
        'Line 4: Parentheses force the OR expression to evaluate first.',
        'Line 5: AND ensures only students with high GPA (>= 3.70) from those two majors are returned.',
      ],
    },
    expectedOutput: {
      columns: ['student_id', 'first_name', 'major', 'gpa'],
      rows: [
        { student_id: 1, first_name: 'Amina', major: 'Computer Science', gpa: 3.85 },
        { student_id: 3, first_name: 'Nusrat', major: 'Computer Science', gpa: 3.92 },
        { student_id: 5, first_name: 'Sadia', major: 'Mathematics', gpa: 3.70 },
      ],
    },
    commonMistakes: [
      'Omitting parentheses when mixing AND and OR: this is one of the most common security and financial calculation bugs in software engineering.',
      'Writing `WHERE major = "CS" OR "Math"`: this is invalid SQL! You must write `major = "CS" OR major = "Math"`.',
    ],
    exercise: {
      instructions: 'Find all employees from the `employees` table who work in department 1 AND have a salary greater than 90000.',
      hint: 'SELECT * FROM employees WHERE dept_id = 1 AND salary > 90000;',
      starterQuery: 'SELECT * FROM employees WHERE dept_id = 1 AND salary > 90000;',
      solution: 'SELECT * FROM employees WHERE dept_id = 1 AND salary > 90000;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'In SQL operator precedence, which operator is evaluated first when parentheses are absent?',
      options: ['OR', 'AND', 'Both have equal precedence', 'Randomly decided by the server'],
      correctAnswer: 1,
      explanation: 'AND has higher precedence than OR and will be evaluated first unless grouped explicitly with parentheses ().',
    },
    nextLessonId: 'mysql-16',
  },

  {
    id: 'mysql-16',
    track: 'mysql',
    module: 3,
    moduleTitle: 'Module 3: Filtering and Sorting',
    order: 16,
    difficulty: 'Beginner',
    title: {
      en: '16. BETWEEN, IN, and LIKE',
      bn: '১৬. BETWEEN, IN এবং LIKE প্যাটার্ন ম্যাচিং',
    },
    subtitle: {
      en: 'Search ranges, match value lists, and search text patterns using wildcards (% and _).',
      bn: 'রেঞ্জ ফিল্টারিং, তালিকার সাথে মেলানো এবং ওয়াইল্ডকার্ড দিয়ে টেক্সট খোঁজা।',
    },
    duration: '20 mins',
    objectives: [
      'Filter ranges inclusively using `BETWEEN low AND high`.',
      'Replace messy chained OR clauses with the clean `IN (val1, val2, ...)` operator.',
      'Perform text pattern matching with `LIKE`.',
      'Master the two SQL wildcards: `%` (zero or more characters) and `_` (exactly one character).',
    ],
    prerequisites: 'Lesson 15: AND, OR, and NOT.',
    explanation: {
      simple: {
        en: 'SQL provides three powerful shorthands:\n1. `BETWEEN a AND b`: checks if a number or date falls inside a range (inclusive of both boundaries).\n   `WHERE gpa BETWEEN 3.50 AND 4.00`\n2. `IN (val1, val2, val3)`: checks if a value matches any item in a list.\n   `WHERE major IN ("Computer Science", "Physics", "Mathematics")`\n3. `LIKE`: matches patterns in text strings using two wildcards:\n   - `%` represents zero, one, or multiple characters.\n     `LIKE "A%"` finds anything starting with the letter A.\n     `LIKE "%tech%"` finds anything containing the word "tech".\n   - `_` represents exactly one character.\n     `LIKE "C_101"` matches "CS101" or "CE101".',
        bn: 'SQL-এ সহজে ফিল্টার করার ৩টি জনপ্রিয় উপায়:\n১. `BETWEEN`: নির্দিষ্ট রেঞ্জের মধ্যবর্তী মান বের করে (শুরু ও শেষ উভয় সংখ্যাই অন্তর্ভুক্ত)।\n২. `IN`: একাধিক OR লেখার বদলে তালিকায় থাকা মানগুলো সহজে খোঁজে।\n৩. `LIKE`: লেখার প্যাটার্ন খোঁজে। `%` দিয়ে যেকোনো সংখ্যক অক্ষর বোঝায়, আর `_` দিয়ে একটিমাত্র অক্ষর বোঝায়।',
      },
      deepDive: {
        en: 'Performance note: Leading wildcards like `LIKE "%phone"` cannot use standard B-tree indexes because the prefix is unknown! This forces a full table scan. Conversely, trailing wildcards like `LIKE "Apple%"` CAN use B-tree index range scans for rapid performance.',
        bn: 'পারফরম্যান্সের কথা: লেখার শুরুতে ওয়াইল্ডকার্ড (`%phone`) দিলে ইনডেক্স কাজ করে না, পুরো টেবিল স্ক্যান করতে হয়। কিন্তু শেষে দিলে (`Apple%`) ইনডেক্স খুব দ্রুত কাজ করে।',
      },
      syntax: 'WHERE price BETWEEN 100 AND 500\nWHERE city IN ("Dhaka", "Chittagong")\nWHERE email LIKE "%@school.edu"',
    },
    sampleData: {
      description: 'Students email addresses and majors:',
      columns: ['student_id', 'first_name', 'email', 'major', 'gpa'],
      rows: [
        { student_id: 1, first_name: 'Amina', email: 'amina@school.edu', major: 'Computer Science', gpa: 3.85 },
        { student_id: 2, first_name: 'Tanvir', email: 'tanvir@school.edu', major: 'Electrical Engineering', gpa: 3.40 },
        { student_id: 4, first_name: 'Rafiq', email: 'rafiq@school.edu', major: 'Business Administration', gpa: 2.95 },
      ],
    },
    queryExample: {
      title: 'Searching for Specific Email Domain with LIKE',
      code: `-- Find students whose email address ends with @school.edu
SELECT student_id, first_name, last_name, email
FROM students
WHERE email LIKE '%@school.edu';`,
      explanation: [
        'Line 4: `%@school.edu` matches any sequence of characters followed by the literal domain `@school.edu`.',
      ],
    },
    expectedOutput: {
      columns: ['student_id', 'first_name', 'last_name', 'email'],
      rows: [
        { student_id: 1, first_name: 'Amina', last_name: 'Rahman', email: 'amina@school.edu' },
        { student_id: 2, first_name: 'Tanvir', last_name: 'Hossain', email: 'tanvir@school.edu' },
        { student_id: 3, first_name: 'Nusrat', last_name: 'Jahan', email: 'nusrat@school.edu' },
      ],
    },
    commonMistakes: [
      'Assuming BETWEEN is exclusive: `BETWEEN 10 AND 20` includes both 10 and 20.',
      'Using `=` with wildcards: `WHERE email = "%@gmail.com"` will look for the literal percentage sign character! You must use `LIKE`.',
    ],
    exercise: {
      instructions: 'Find all students whose major is either "Computer Science" or "Mathematics" using the `IN` operator.',
      hint: "SELECT * FROM students WHERE major IN ('Computer Science', 'Mathematics');",
      starterQuery: "SELECT * FROM students WHERE major IN ('Computer Science', 'Mathematics');",
      solution: "SELECT * FROM students WHERE major IN ('Computer Science', 'Mathematics');",
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'Which wildcard in SQL matches exactly one single character when used with LIKE?',
      options: ['%', '_ (underscore)', '*', '?'],
      correctAnswer: 1,
      explanation: 'In SQL LIKE pattern matching, the underscore (_) matches exactly one single character, while the percent sign (%) matches zero or more characters.',
    },
    nextLessonId: 'mysql-17',
  },

  {
    id: 'mysql-17',
    track: 'mysql',
    module: 3,
    moduleTitle: 'Module 3: Filtering and Sorting',
    order: 17,
    difficulty: 'Beginner',
    title: {
      en: '17. NULL Values and IS NULL',
      bn: '১৭. NULL মান এবং IS NULL এর সঠিক ব্যবহার',
    },
    subtitle: {
      en: 'Understand the three-valued logic of SQL and why = NULL never works.',
      bn: 'SQL-এর থ্রি-ভ্যালুড লজিক এবং কেন = NULL কখনো কাজ করে না।',
    },
    duration: '20 mins',
    objectives: [
      'Understand what `NULL` means in relational theory: missing, unknown, or not applicable.',
      'Learn why `NULL = NULL` evaluates to `UNKNOWN`, not `TRUE`.',
      'Test for missing values using `IS NULL` and `IS NOT NULL`.',
      'Replace NULLs with fallback values using the `IFNULL()` and `COALESCE()` functions.',
    ],
    prerequisites: 'Lesson 13: Filtering with WHERE.',
    explanation: {
      simple: {
        en: 'In SQL, `NULL` does NOT mean zero (`0`), empty text (`""`), or false (`FALSE`). `NULL` means "Unknown" or "Value Missing".\nBecause it represents an unknown, you can NEVER compare it with an equal sign! If you ask "Does one unknown secret equal another unknown secret?", the answer is "I don\'t know!" (UNKNOWN).\nTherefore, `WHERE phone = NULL` will return ZERO rows every single time!\nTo check for missing data, you must write:\n`WHERE phone IS NULL`\nTo check for existing data, you write:\n`WHERE phone IS NOT NULL`',
        bn: 'SQL-এ `NULL` মানে শূন্য (০) বা খালি টেক্সট নয়। `NULL` মানে হলো "তথ্যটি এখনো অজানা বা এন্ট্রি দেওয়া হয়নি"।\nযেহেতু এটি অজানা, তাই `= NULL` দিয়ে কখনো তুলনা করা যায় না। `WHERE phone = NULL` লিখলে কখনোই কোনো ডেটা আসবে না!\nNULL চেক করার একমাত্র সঠিক নিয়ম হলো:\n`WHERE phone IS NULL` অথবা `WHERE phone IS NOT NULL`।',
      },
      deepDive: {
        en: 'SQL operates on Three-Valued Logic (3VL): TRUE, FALSE, and UNKNOWN. In WHERE clauses, a row is only returned if the condition resolves to TRUE. If it resolves to UNKNOWN (which happens in any direct math or equality comparison with NULL), the row is discarded.',
        bn: 'SQL থ্রি-ভ্যালুড লজিক (TRUE, FALSE, UNKNOWN) ব্যবহার করে। WHERE ক্লজ শুধুমাত্র TRUE হলেই রেকর্ড দেয়, UNKNOWN হলে বাদ দিয়ে দেয়।',
      },
      syntax: 'WHERE column_name IS NULL\nWHERE column_name IS NOT NULL\nSELECT IFNULL(phone, "No Phone Provided")',
    },
    sampleData: {
      description: 'Employee records showing department assignments and commissions:',
      columns: ['emp_id', 'first_name', 'dept_id', 'bonus'],
      rows: [
        { emp_id: 1001, first_name: 'Zubair', dept_id: 1, bonus: 5000 },
        { emp_id: 1004, first_name: 'Rumana', dept_id: 3, bonus: null },
        { emp_id: 1007, first_name: 'Kamrul', dept_id: 5, bonus: null },
      ],
    },
    queryExample: {
      title: 'Finding Records with Missing Data Using IS NULL',
      code: `-- Find employees who do not have a bonus assigned (bonus IS NULL)
SELECT emp_id, first_name, last_name, salary
FROM employees
WHERE dept_id IS NOT NULL;`,
      explanation: [
        'Line 4: Uses IS NOT NULL to select all employees with an assigned department ID.',
      ],
    },
    expectedOutput: {
      columns: ['emp_id', 'first_name', 'last_name', 'salary'],
      rows: [
        { emp_id: 1001, first_name: 'Zubair', last_name: 'Ahmed', salary: 120000.00 },
        { emp_id: 1002, first_name: 'Farhana', last_name: 'Yesmin', salary: 95000.00 },
        { emp_id: 1003, first_name: 'Mahmud', last_name: 'Hassan', salary: 75000.00 },
      ],
    },
    commonMistakes: [
      'Writing `WHERE col = NULL`: this will fail silently and return empty results.',
      'Assuming COUNT(col) counts NULLs: `COUNT(column)` ignores NULL values, whereas `COUNT(*)` counts all rows regardless of NULLs.',
    ],
    exercise: {
      instructions: 'Write a query to find all courses from the `courses` table where department IS NOT NULL.',
      hint: 'SELECT * FROM courses WHERE department IS NOT NULL;',
      starterQuery: 'SELECT * FROM courses WHERE department IS NOT NULL;',
      solution: 'SELECT * FROM courses WHERE department IS NOT NULL;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'What is the result of evaluating the condition `WHERE score = NULL` in SQL?',
      options: [
        'It returns all rows where score is 0',
        'It returns TRUE for all rows',
        'It evaluates to UNKNOWN and returns zero rows',
        'It throws a fatal syntax error crash',
      ],
      correctAnswer: 2,
      explanation: 'In SQL 3-valued logic, any equality comparison with NULL evaluates to UNKNOWN, which causes the WHERE filter to reject the row.',
    },
    nextLessonId: 'mysql-18',
  },

  {
    id: 'mysql-18',
    track: 'mysql',
    module: 3,
    moduleTitle: 'Module 3: Filtering and Sorting',
    order: 18,
    difficulty: 'Beginner',
    title: {
      en: '18. Sorting and Limiting Results with ORDER BY and LIMIT',
      bn: '১৮. সাজানো ও সীমাবদ্ধ করা: ORDER BY এবং LIMIT',
    },
    subtitle: {
      en: 'Sort output ascending/descending, create top-N leaderboards, and build pagination.',
      bn: 'ছোট থেকে বড় বা বড় থেকে ছোট সাজানো, টপ তালিকা তৈরি ও পেজিনেশন।',
    },
    duration: '20 mins',
    objectives: [
      'Sort records using `ORDER BY column ASC` (default) and `DESC`.',
      'Sort by multiple columns (e.g. major alphabetically, then GPA descending).',
      'Limit the number of returned rows using `LIMIT n`.',
      'Implement offset pagination using `LIMIT count OFFSET offset`.',
    ],
    prerequisites: 'Lessons 13-17.',
    explanation: {
      simple: {
        en: 'By default, relational databases do NOT guarantee any specific row order. Rows are stored wherever space is available on the hard disk.\nTo sort your results, use `ORDER BY`:\n- `ASC`: Ascending order (lowest to highest, A to Z). This is the default.\n- `DESC`: Descending order (highest to lowest, Z to A).\nTo restrict the output to only the top results (like the top 3 highest scoring students), append `LIMIT 3`.\n```sql\nSELECT first_name, gpa\nFROM students\nORDER BY gpa DESC\nLIMIT 3;\n```',
        bn: 'ডাটাবেসে তথ্য কোনো নির্দিষ্ট সাজানো ক্রমে থাকে না। ফলাফল সাজাতে `ORDER BY` ব্যবহার করতে হয়:\n- `ASC`: ছোট থেকে বড় বা A থেকে Z (স্বভাবজাত)।\n- `DESC`: বড় থেকে ছোট বা Z থেকে A।\nআর ফলাফলের সংখ্যা সীমাবদ্ধ করতে (যেমন টপ ৩ জন ছাত্র) শেষে `LIMIT 3` যোগ করা হয়।',
      },
      deepDive: {
        en: 'For web application pagination (e.g. Page 2 showing items 11 to 20), you use `LIMIT 10 OFFSET 10` (or MySQL shorthand `LIMIT 10, 10`). Always specify an ORDER BY clause when using LIMIT; otherwise, paginated results will be non-deterministic!',
        bn: 'ওয়েবসাইটে পেজিনেশনের জন্য (যেমন ২য় পেজের ১০টি রেকর্ড) `LIMIT 10 OFFSET 10` ব্যবহার করা হয়। LIMIT ব্যবহারের সময় সবসময় ORDER BY দেওয়া উচিত, নয়তো ডেটার ক্রম এলোমেলো হতে পারে।',
      },
      syntax: 'SELECT col1, col2\nFROM table_name\nORDER BY col1 DESC, col2 ASC\nLIMIT count OFFSET offset;',
    },
    sampleData: {
      description: 'Students table ordered by GPA descending:',
      columns: ['student_id', 'first_name', 'major', 'gpa'],
      rows: [
        { student_id: 3, first_name: 'Nusrat', major: 'Computer Science', gpa: 3.92 },
        { student_id: 1, first_name: 'Amina', major: 'Computer Science', gpa: 3.85 },
        { student_id: 5, first_name: 'Sadia', major: 'Mathematics', gpa: 3.70 },
        { student_id: 2, first_name: 'Tanvir', major: 'Electrical Engineering', gpa: 3.40 },
      ],
    },
    queryExample: {
      title: 'Top 3 Students by GPA Leaderboard',
      code: `-- Fetch the top 3 highest performing students across the university
SELECT first_name, last_name, major, gpa
FROM students
ORDER BY gpa DESC
LIMIT 3;`,
      explanation: [
        'Line 4: ORDER BY gpa DESC orders records from highest GPA to lowest GPA.',
        'Line 5: LIMIT 3 cuts off the result set after the first 3 rows.',
      ],
    },
    expectedOutput: {
      columns: ['first_name', 'last_name', 'major', 'gpa'],
      rows: [
        { first_name: 'Nusrat', last_name: 'Jahan', major: 'Computer Science', gpa: 3.92 },
        { first_name: 'Amina', last_name: 'Rahman', major: 'Computer Science', gpa: 3.85 },
        { student_id: 5, first_name: 'Sadia', last_name: 'Akter', major: 'Mathematics', gpa: 3.70 },
      ],
    },
    commonMistakes: [
      'Putting LIMIT before ORDER BY: in SQL syntax order, LIMIT must always come at the very end of the query.',
      'Assuming ORDER BY permanently sorts the physical table on disk: it only sorts the output presentation stream.',
    ],
    exercise: {
      instructions: 'Find the 5 most expensive products in the `products` table, sorted from highest price to lowest price.',
      hint: 'SELECT product_name, price FROM products ORDER BY price DESC LIMIT 5;',
      starterQuery: 'SELECT product_name, price FROM products ORDER BY price DESC LIMIT 5;',
      solution: 'SELECT product_name, price FROM products ORDER BY price DESC LIMIT 5;',
      validation: {
        type: 'query_returns_rows',
        minRows: 1,
      },
    },
    quiz: {
      question: 'Which clause in a SQL SELECT statement restricts the number of returned rows to a specific count?',
      options: ['TOP', 'LIMIT', 'MAXROWS', 'STOP'],
      correctAnswer: 1,
      explanation: 'In MySQL and PostgreSQL, the LIMIT clause specifies the maximum number of rows to return.',
    },
    nextLessonId: 'mysql-19',
  },
];

export const module3Lessons = MODULE_3_LESSONS;
