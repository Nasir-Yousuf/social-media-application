// Module 8: Intermediate and Advanced SQL (Lessons 43-48)

export const module8Lessons = [
  {
    id: 'mysql-lesson-43',
    track: 'mysql',
    moduleId: 'mysql-mod-8',
    moduleTitle: 'Module 8: Intermediate and Advanced SQL',
    lessonNumber: 43,
    title: 'Conditional Logic with CASE Expressions',
    subtitle: 'Implement if-then-else decision logic directly inside your SQL queries.',
    difficulty: 'Advanced',
    estimatedMinutes: 25,
    prerequisites: ['Aggregation and Subqueries (Module 7)'],
    objectives: [
      'Understand the syntax of the standard SQL CASE expression.',
      'Differentiate between Simple CASE and Searched CASE.',
      'Transform codes and numbers into readable user-facing categories.',
      'Perform conditional aggregation (pivoting data using SUM(CASE...)).'
    ],
    content: {
      introduction: 'In programming languages like JavaScript or Python, you use `if...else` statements to branch logic. In SQL, the equivalent is the `CASE` expression. It evaluates a list of conditions and returns one of multiple possible result expressions.',
      coreConcepts: [
        {
          title: 'The Searched CASE Expression',
          body: 'The most flexible form is the Searched CASE: `CASE WHEN condition1 THEN result1 WHEN condition2 THEN result2 ELSE default_result END`. Each WHEN condition can evaluate any boolean expression (comparison, range, LIKE, etc.).'
        },
        {
          title: 'The Simple CASE Expression',
          body: 'Matches an expression against specific exact values: `CASE status WHEN \'P\' THEN \'Pending\' WHEN \'S\' THEN \'Shipped\' ELSE \'Unknown\' END`.'
        },
        {
          title: 'Conditional Aggregation (Pivoting)',
          body: 'By wrapping CASE inside `SUM()` or `COUNT()`, you can pivot row-based statuses into side-by-side columns: `SUM(CASE WHEN status = \'completed\' THEN 1 ELSE 0 END) AS completed_orders`.'
        }
      ],
      sqlSyntax: `-- Classify employee salaries into tiers:
SELECT 
    first_name,
    last_name,
    salary,
    CASE 
        WHEN salary >= 100000 THEN 'Executive Tier'
        WHEN salary >= 80000 THEN 'Senior Tier'
        WHEN salary >= 60000 THEN 'Mid Tier'
        ELSE 'Junior Tier'
    END AS compensation_band
FROM employees
ORDER BY salary DESC;

-- Conditional Aggregation: Count orders by status in one row
SELECT 
    COUNT(*) AS total_orders,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
    SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing_count,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_count
FROM orders;`,
      explanation: [
        '`WHEN salary >= 100000 THEN ...`: Evaluated in top-to-bottom order. As soon as a condition matches, evaluation stops.',
        '`ELSE \'Junior Tier\'`: Catches any values that did not match the preceding WHEN clauses.',
        '`END AS compensation_band`: The CASE expression always ends with the `END` keyword.',
        'In the second query, `SUM(CASE WHEN status = \'completed\' THEN 1 ELSE 0 END)` counts only completed orders without requiring separate queries.'
      ],
      sampleBeforeAfter: {
        table: 'CASE Output Transformation',
        before: [
          { name: 'Alice', salary: 95000 },
          { name: 'Bob', salary: 72000 },
          { name: 'Charlie', salary: 110000 }
        ],
        after: [
          { name: 'Alice', salary: 95000, band: 'Senior Tier' },
          { name: 'Bob', salary: 72000, band: 'Mid Tier' },
          { name: 'Charlie', salary: 110000, band: 'Executive Tier' }
        ]
      },
      commonMistakes: [
        'Forgetting the `END` keyword (produces a syntax error).',
        'Ordering conditions incorrectly (e.g. putting `WHEN salary >= 50000` before `WHEN salary >= 100000` catches the 100k employee prematurely).',
        'Omitting `ELSE`: If no condition matches and there is no ELSE, CASE returns `NULL`.'
      ],
      practiceExercise: {
        instructions: 'Query `students` in `university_db` and use a CASE statement to label students with GPA >= 3.8 as "Dean\'s List", GPA >= 3.5 as "Honor Roll", and otherwise "Regular".',
        defaultCode: 'SELECT first_name, last_name, gpa,\n    CASE\n        WHEN gpa >= 3.8 THEN "Dean\'s List"\n        WHEN gpa >= 3.5 THEN "Honor Roll"\n        ELSE "Regular"\n    END AS academic_status\nFROM students;',
        solution: 'SELECT first_name, last_name, gpa,\n    CASE\n        WHEN gpa >= 3.8 THEN "Dean\'s List"\n        WHEN gpa >= 3.5 THEN "Honor Roll"\n        ELSE "Regular"\n    END AS academic_status\nFROM students;',
        hint: 'Use CASE WHEN gpa >= 3.8 THEN ... WHEN gpa >= 3.5 THEN ... ELSE ... END AS academic_status.'
      },
      quiz: {
        question: 'What happens if a row matches none of the WHEN conditions in a CASE expression and there is no ELSE clause specified?',
        options: [
          'MySQL throws a runtime error.',
          'The CASE expression returns NULL for that row.',
          'The row is deleted from the table.',
          'It returns 0.'
        ],
        correctIndex: 1,
        explanation: 'If no WHEN matches and ELSE is omitted, the CASE expression defaults to returning NULL.'
      }
    }
  },
  {
    id: 'mysql-lesson-44',
    track: 'mysql',
    moduleId: 'mysql-mod-8',
    moduleTitle: 'Module 8: Intermediate and Advanced SQL',
    lessonNumber: 44,
    title: 'Essential String Functions',
    subtitle: 'Clean, format, and transform textual data in MySQL.',
    difficulty: 'Advanced',
    estimatedMinutes: 25,
    prerequisites: ['Conditional Logic with CASE (Lesson 43)'],
    objectives: [
      'Master CONCAT() and CONCAT_WS() for combining text.',
      'Format cases using UPPER(), LOWER(), and TRIM().',
      'Slice and extract substrings using SUBSTRING(), LEFT(), and RIGHT().',
      'Search and replace strings using REPLACE(), LOCATE(), and CHAR_LENGTH().'
    ],
    content: {
      introduction: 'Text in real-world databases is frequently messy: extra spaces, mixed case inputs, phone numbers formatted in different styles. MySQL provides an extensive suite of built-in string functions to clean, parse, and present text cleanly.',
      coreConcepts: [
        {
          title: 'Concatenation: CONCAT and CONCAT_WS',
          body: '- `CONCAT(a, b, c)` joins strings together. If ANY input is NULL, `CONCAT()` returns NULL!\n- `CONCAT_WS(separator, a, b, c)` (Concatenate With Separator) joins strings using a delimiter and gracefully ignores NULLs.'
        },
        {
          title: 'Case and Whitespace Sanitization',
          body: '- `TRIM()`, `LTRIM()`, `RTRIM()` strip leading and trailing whitespace.\n- `UPPER()` and `LOWER()` standardize casing for clean comparisons.'
        },
        {
          title: 'Substrings and Length',
          body: '- `SUBSTRING(str, pos, len)` extracts `len` characters starting at 1-based index `pos`.\n- `LEFT(str, n)` and `RIGHT(str, n)` grab the first or last `n` characters.\n- `CHAR_LENGTH(str)` returns character count (handling multi-byte UTF-8 correctly, unlike `LENGTH()` which measures raw bytes).'
        }
      ],
      sqlSyntax: `-- String manipulation showcase:
SELECT 
    CONCAT_WS(' ', first_name, last_name) AS full_name,
    LOWER(email) AS normalized_email,
    CONCAT('$', FORMAT(salary, 2)) AS formatted_salary,
    LEFT(phone, 3) AS area_code,
    REPLACE(job_title, 'Senior', 'Lead') AS modernized_title,
    CHAR_LENGTH(first_name) AS name_character_count
FROM employees;`,
      explanation: [
        '`CONCAT_WS(\' \', first_name, last_name)`: Inserts a single space between names.',
        '`LOWER(email)`: Ensures case-insensitive consistency for email communication.',
        '`FORMAT(salary, 2)`: Formats numbers with comma thousands separators.',
        '`LEFT(phone, 3)`: Extracts the first three digits of a telephone string.'
      ],
      sampleBeforeAfter: {
        table: 'String Transformation Examples',
        before: [
          { first: ' alice ', last: 'WALKER', email: 'Alice@Email.COM' }
        ],
        after: [
          { full_name: 'Alice WALKER', normalized_email: 'alice@email.com' }
        ]
      },
      commonMistakes: [
        "Using `CONCAT(first_name, ' ', middle_name, ' ', last_name)` when `middle_name` is NULL (turns the entire full name into NULL!). Always use `CONCAT_WS()` instead.",
        'Assuming string indexes start at 0 (In SQL, character positions are 1-based, starting at 1!).',
        'Confusing `LENGTH()` (bytes) with `CHAR_LENGTH()` (characters) on UTF-8 strings like Bengali or Emoji characters.'
      ],
      practiceExercise: {
        instructions: 'Write a query on `customers` in `ecommerce_db` that displays each customer\'s full name (concatenated with a space) and email in lower case.',
        defaultCode: 'SELECT CONCAT_WS(" ", first_name, last_name) AS full_name, LOWER(email) AS clean_email FROM customers;',
        solution: 'SELECT CONCAT_WS(" ", first_name, last_name) AS full_name, LOWER(email) AS clean_email FROM customers;',
        hint: 'Use `CONCAT_WS(" ", first_name, last_name)` and `LOWER(email)`.'
      },
      quiz: {
        question: 'What does CONCAT("John", NULL, "Doe") evaluate to in MySQL?',
        options: [
          '"John Doe"',
          '"JohnNULLDoe"',
          'NULL',
          'Throws an error'
        ],
        correctIndex: 2,
        explanation: 'In standard MySQL, if any argument to CONCAT() is NULL, the entire result is NULL. Use CONCAT_WS() to bypass NULLs.'
      }
    }
  },
  {
    id: 'mysql-lesson-45',
    track: 'mysql',
    moduleId: 'mysql-mod-8',
    moduleTitle: 'Module 8: Intermediate and Advanced SQL',
    lessonNumber: 45,
    title: 'Numeric and Date/Time Functions',
    subtitle: 'Perform mathematical operations, date calculations, and timestamp intervals.',
    difficulty: 'Advanced',
    estimatedMinutes: 25,
    prerequisites: ['Essential String Functions (Lesson 44)'],
    objectives: [
      'Master numeric functions: ROUND(), CEIL(), FLOOR(), ABS(), MOD().',
      'Work with dates: NOW(), CURDATE(), CURTIME(), DATE().',
      'Add and subtract time intervals using DATE_ADD(), DATE_SUB(), and DATEDIFF().',
      'Format and extract date components: YEAR(), MONTH(), DAY(), DATE_FORMAT().'
    ],
    content: {
      introduction: 'Dates and numbers are ubiquitous in databases: calculating subscription renewal dates, measuring shipping delivery times, computing sales tax, and rounding totals. MySQL has robust built-in functions for dates, intervals, and mathematical precision.',
      coreConcepts: [
        {
          title: 'Numeric Precision Functions',
          body: '- `ROUND(val, decimals)`: Rounds to nearest decimal place.\n- `CEIL(val)`: Always rounds upward to nearest integer.\n- `FLOOR(val)`: Always rounds downward to nearest integer.\n- `MOD(n, m)`: Returns remainder of division.'
        },
        {
          title: 'Getting Current Time',
          body: '- `NOW()`: Returns current date and time (`YYYY-MM-DD HH:MM:SS`).\n- `CURDATE()`: Returns current date only (`YYYY-MM-DD`).'
        },
        {
          title: 'Date Arithmetic and Formatting',
          body: '- `DATE_ADD(date, INTERVAL expr unit)`: E.g., `DATE_ADD(NOW(), INTERVAL 30 DAY)`.\n- `DATEDIFF(date1, date2)`: Returns the integer number of days between two dates.\n- `DATE_FORMAT(date, format)`: Customizes date display, e.g. `\'%M %d, %Y\'` produces `"October 14, 2026"`.'
        }
      ],
      sqlSyntax: `-- Date and Math operations:
SELECT 
    order_id,
    order_date,
    DATE_ADD(order_date, INTERVAL 3 DAY) AS estimated_delivery,
    DATEDIFF(CURDATE(), order_date) AS days_since_order,
    YEAR(order_date) AS order_year,
    DATE_FORMAT(order_date, '%b %d, %Y') AS formatted_date,
    total_amount,
    ROUND(total_amount * 0.08, 2) AS estimated_sales_tax,
    ROUND(total_amount * 1.08, 2) AS total_with_tax
FROM orders;`,
      explanation: [
        '`DATE_ADD(order_date, INTERVAL 3 DAY)`: Automatically handles month and leap year boundaries.',
        '`DATEDIFF(CURDATE(), order_date)`: Subtracts order_date from today, returning total days.',
        '`DATE_FORMAT(order_date, \'%b %d, %Y\')`: Formats dates into human-readable strings like "Oct 14, 2026".'
      ],
      sampleBeforeAfter: {
        table: 'Date Functions Output',
        before: [
          { raw_date: '2026-10-14 10:30:00' }
        ],
        after: [
          { formatted: 'Oct 14, 2026', next_month: '2026-11-14', days_diff: 0 }
        ]
      },
      commonMistakes: [
        'Comparing dates with strings in inconsistent formats (always stick to ISO `YYYY-MM-DD`).',
        'Reversing arguments in `DATEDIFF(end, start)` (results in negative day counts).',
        'Storing dates as VARCHAR instead of DATE/DATETIME (destroys date math and index performance).'
      ],
      practiceExercise: {
        instructions: 'Calculate the total price of each product in `products` after adding a 5% tax, rounded to two decimal places.',
        defaultCode: 'SELECT product_name, price, ROUND(price * 1.05, 2) AS price_with_tax FROM products;',
        solution: 'SELECT product_name, price, ROUND(price * 1.05, 2) AS price_with_tax FROM products;',
        hint: 'Use `ROUND(price * 1.05, 2)` to calculate tax.'
      },
      quiz: {
        question: 'Which MySQL function adds 14 days to an order date?',
        options: [
          'ADDDAYS(order_date, 14)',
          'DATE_ADD(order_date, INTERVAL 14 DAY)',
          'order_date + 14',
          'CALCDATE(order_date, 14)'
        ],
        correctIndex: 1,
        explanation: 'MySQL uses `DATE_ADD(date, INTERVAL expr unit)` to perform accurate calendar arithmetic.'
      }
    }
  },
  {
    id: 'mysql-lesson-46',
    track: 'mysql',
    moduleId: 'mysql-mod-8',
    moduleTitle: 'Module 8: Intermediate and Advanced SQL',
    lessonNumber: 46,
    title: 'Combining Result Sets with UNION and UNION ALL',
    subtitle: 'Stack rows from multiple SELECT queries vertically into a unified output.',
    difficulty: 'Advanced',
    estimatedMinutes: 25,
    prerequisites: ['Numeric and Date/Time Functions (Lesson 45)'],
    objectives: [
      'Understand how UNION differs from JOIN (vertical stacking vs horizontal joining).',
      'Master the critical performance difference between UNION (deduplicated) and UNION ALL (fast).',
      'Satisfy UNION structural rules: matching column counts and compatible datatypes.',
      'Simulate FULL OUTER JOIN in MySQL using UNION.'
    ],
    content: {
      introduction: 'While `JOIN` combines columns from two tables horizontally side-by-side, `UNION` combines rows from two queries vertically on top of each other. It allows you to merge disparate data sources into a single stream of results.',
      coreConcepts: [
        {
          title: 'UNION vs UNION ALL',
          body: '- `UNION`: Combines rows and runs an internal sort operation to remove duplicate rows.\n- `UNION ALL`: Combines rows and keeps ALL duplicates. Because it does not have to sort or check for duplicates, `UNION ALL` is significantly faster. Use `UNION ALL` unless duplicate elimination is explicitly required.'
        },
        {
          title: 'The Rules of UNION',
          body: '1. Each `SELECT` statement in the UNION must have the exact same number of columns.\n2. The corresponding columns must have compatible data types.\n3. The column names in the final output are determined by the first `SELECT` statement.'
        },
        {
          title: 'Sorting a UNION',
          body: 'You cannot place `ORDER BY` inside each individual query. Instead, place a single `ORDER BY` at the very end of the entire compound statement.'
        }
      ],
      sqlSyntax: `-- Merge customer emails and employee emails into a single mailing list:
SELECT 
    'Customer' AS contact_type,
    customer_id AS id,
    CONCAT(first_name, ' ', last_name) AS full_name,
    email
FROM customers

UNION ALL

SELECT 
    'Employee' AS contact_type,
    employee_id AS id,
    CONCAT(first_name, ' ', last_name) AS full_name,
    email
FROM employees
ORDER BY full_name ASC;`,
      explanation: [
        '`\'Customer\' AS contact_type`: Injects a synthetic column identifying where the row originated.',
        '`UNION ALL`: Stacks employee rows immediately below customer rows without expensive de-duplication.',
        '`ORDER BY full_name ASC`: Sorts the unified list alphabetically.'
      ],
      sampleBeforeAfter: {
        table: 'UNION Stacking',
        before: [
          { table: 'customers (3 rows)', columns: 'first_name, email' },
          { table: 'employees (5 rows)', columns: 'first_name, email' }
        ],
        after: [
          { combined_output: '8 total rows in one unified table' }
        ]
      },
      commonMistakes: [
        'Mismatched column counts (e.g. Query 1 selects 3 columns, Query 2 selects 4 -> `Error 1222: The used SELECT statements have a different number of columns`).',
        'Defaulting to `UNION` when `UNION ALL` is intended, incurring huge memory sorting overhead on millions of rows.',
        'Trying to name output columns in the second query (MySQL ignores aliases in subsequent queries).'
      ],
      practiceExercise: {
        instructions: 'Stack the names of `students` and `employees` into a single query using UNION ALL.',
        defaultCode: 'SELECT first_name, last_name, "Student" AS role FROM students\nUNION ALL\nSELECT first_name, last_name, "Employee" AS role FROM employees\nLIMIT 6;',
        solution: 'SELECT first_name, last_name, "Student" AS role FROM students\nUNION ALL\nSELECT first_name, last_name, "Employee" AS role FROM employees\nLIMIT 6;',
        hint: 'Use UNION ALL between two SELECT statements with matching column counts.'
      },
      quiz: {
        question: 'Why is UNION ALL significantly faster than UNION on large datasets?',
        options: [
          'Because UNION ALL compresses the data.',
          'Because UNION ALL does not perform an in-memory sort to filter out duplicate rows.',
          'Because UNION ALL bypasses table locks.',
          'Because UNION ALL only runs in MySQL 8.'
        ],
        correctIndex: 1,
        explanation: 'UNION performs a distinct sorting pass to discard duplicate rows across queries, whereas UNION ALL simply streams all rows directly.'
      }
    }
  },
  {
    id: 'mysql-lesson-47',
    track: 'mysql',
    moduleId: 'mysql-mod-8',
    moduleTitle: 'Module 8: Intermediate and Advanced SQL',
    lessonNumber: 47,
    title: 'Common Table Expressions (CTEs) with WITH',
    subtitle: 'Write clean, readable, modular queries using temporary named result sets.',
    difficulty: 'Advanced',
    estimatedMinutes: 30,
    prerequisites: ['Combining Result Sets with UNION (Lesson 46)'],
    objectives: [
      'Understand what a Common Table Expression (CTE) is and its syntax using WITH.',
      'Replace messy nested subqueries with readable, sequential CTE blocks.',
      'Chain multiple CTEs in a single statement.',
      'Understand Recursive CTEs for hierarchical tree traversal.'
    ],
    content: {
      introduction: 'Introduced natively in MySQL 8.0, Common Table Expressions (CTEs) revolutionized SQL query organization. Instead of nesting five levels of unreadable derived tables inside parentheses, a CTE allows you to define named temporary result sets at the top of your query using the `WITH` keyword.',
      coreConcepts: [
        {
          title: 'What is a CTE?',
          body: 'A CTE is a temporary, named result set that exists only within the execution scope of a single SQL statement. You define it with `WITH cte_name AS (SELECT ...)`. You can then reference `cte_name` just like a real table in your main query.'
        },
        {
          title: 'Chaining Multiple CTEs',
          body: 'You can define multiple CTEs separated by commas under a single `WITH` keyword: `WITH step1 AS (...), step2 AS (...) SELECT ... FROM step1 JOIN step2...`. This makes multi-stage analytics pipelines look clean and sequential.'
        },
        {
          title: 'Recursive CTEs',
          body: 'A Recursive CTE (`WITH RECURSIVE`) references itself. It is the industry standard way to traverse organizational hierarchy trees (e.g. employee -> manager -> executive), bill-of-materials, or category taxonomy trees.'
        }
      ],
      sqlSyntax: `-- Refactor complex nested subquery using a CTE:
WITH DepartmentSpend AS (
    SELECT 
        department_id,
        COUNT(*) AS head_count,
        SUM(salary) AS total_payroll,
        ROUND(AVG(salary), 2) AS avg_payroll
    FROM employees
    GROUP BY department_id
),
CompanyBenchmark AS (
    SELECT AVG(salary) AS company_wide_avg FROM employees
)
SELECT 
    d.department_name,
    ds.head_count,
    ds.total_payroll,
    ds.avg_payroll,
    cb.company_wide_avg,
    CASE 
        WHEN ds.avg_payroll > cb.company_wide_avg THEN 'Above Average'
        ELSE 'Below Average'
    END AS budget_assessment
FROM DepartmentSpend ds
INNER JOIN departments d ON ds.department_id = d.department_id
CROSS JOIN CompanyBenchmark cb;`,
      explanation: [
        '`WITH DepartmentSpend AS (...)`: Defines the first modular building block.',
        '`CompanyBenchmark AS (...)`: Defines the second modular building block, separated by a comma.',
        'The primary `SELECT` query at the bottom brings the CTEs together cleanly.',
        'Any developer reading this code can understand each calculation in isolation.'
      ],
      sampleBeforeAfter: {
        table: 'Subquery vs CTE Readability',
        before: [
          { method: 'Deeply Nested Subqueries', readability: 'Inside-out, difficult to debug or modify' }
        ],
        after: [
          { method: 'Common Table Expressions (CTE)', readability: 'Top-to-bottom, modular, self-documenting' }
        ]
      },
      commonMistakes: [
        'Repeating the `WITH` keyword for multiple CTEs (separate them with a comma instead: `WITH a AS (...), b AS (...)`).',
        'Trying to use a CTE across multiple queries (a CTE exists ONLY for the immediately following statement).',
        'Creating infinite loops in Recursive CTEs by omitting a terminating condition.'
      ],
      practiceExercise: {
        instructions: 'Write a query with a CTE named `TopEarners` that selects all employees with salary > 85000, then select their first_name and salary from `TopEarners`.',
        defaultCode: 'WITH TopEarners AS (\n    SELECT first_name, last_name, salary\n    FROM employees\n    WHERE salary > 85000\n)\nSELECT first_name, last_name, salary FROM TopEarners;',
        solution: 'WITH TopEarners AS (\n    SELECT first_name, last_name, salary\n    FROM employees\n    WHERE salary > 85000\n)\nSELECT first_name, last_name, salary FROM TopEarners;',
        hint: 'Use `WITH TopEarners AS (SELECT ...) SELECT * FROM TopEarners;`'
      },
      quiz: {
        question: 'Which keyword is used to initiate a Common Table Expression in MySQL 8.0+?',
        options: [
          'CTE',
          'WITH',
          'LET',
          'DECLARE'
        ],
        correctIndex: 1,
        explanation: 'The SQL standard keyword to initiate one or more CTEs is `WITH` (or `WITH RECURSIVE`).'
      }
    }
  },
  {
    id: 'mysql-lesson-48',
    track: 'mysql',
    moduleId: 'mysql-mod-8',
    moduleTitle: 'Module 8: Intermediate and Advanced SQL',
    lessonNumber: 48,
    title: 'Window Functions: ROW_NUMBER, RANK, DENSE_RANK, and OVER',
    subtitle: 'Compute running totals, rankings, and moving averages without collapsing rows.',
    difficulty: 'Advanced',
    estimatedMinutes: 35,
    prerequisites: ['Common Table Expressions (Lesson 47)'],
    objectives: [
      'Understand how Window Functions differ from GROUP BY (they preserve individual row identity).',
      'Master the OVER clause with PARTITION BY and ORDER BY.',
      'Differentiate ROW_NUMBER() vs RANK() vs DENSE_RANK().',
      'Compute running totals and cumulative sums in MySQL 8.0+.'
    ],
    content: {
      introduction: 'When you use `GROUP BY`, rows are collapsed into summary groups. But what if you want to rank employees within each department while still showing every employee row? That is the superpower of Window Functions (introduced in MySQL 8.0). They perform calculations across a set of rows related to the current row without collapsing rows.',
      coreConcepts: [
        {
          title: 'The OVER() Clause',
          body: 'The `OVER()` clause defines the "window" of rows for the calculation:\n- `PARTITION BY`: Divides rows into groups (like GROUP BY, but without collapsing).\n- `ORDER BY`: Determines the evaluation order within each partition.'
        },
        {
          title: 'ROW_NUMBER vs RANK vs DENSE_RANK',
          body: 'Suppose three salaries tie for 1st place:\n- `ROW_NUMBER()`: Assigns unique sequential numbers (1, 2, 3, 4).\n- `RANK()`: Ties get the same rank, but skips ranks after ties (1, 1, 1, 4).\n- `DENSE_RANK()`: Ties get the same rank, and no ranks are skipped (1, 1, 1, 2).'
        },
        {
          title: 'Running Totals',
          body: '`SUM(amount) OVER (ORDER BY order_date)` computes a cumulative sum of sales over time, updating with every transaction.'
        }
      ],
      sqlSyntax: `-- Rank employees by salary within each department:
SELECT 
    department_id,
    first_name,
    last_name,
    salary,
    ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS row_num,
    RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS salary_rank,
    DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dense_salary_rank
FROM employees;

-- Compute running cumulative revenue:
SELECT 
    order_id,
    order_date,
    total_amount,
    SUM(total_amount) OVER (ORDER BY order_date) AS running_revenue_total
FROM orders;`,
      explanation: [
        '`PARTITION BY department_id`: Restarts the ranking counter for each new department.',
        '`ORDER BY salary DESC`: Ranks the highest earner in each department as #1.',
        '`SUM(total_amount) OVER (ORDER BY order_date)`: Keeps adding the current order\'s total to all preceding orders.'
      ],
      sampleBeforeAfter: {
        table: 'Ranking Functions Compared (Ties at $90k)',
        before: [
          { name: 'Alice', salary: 100000 },
          { name: 'Bob', salary: 90000 },
          { name: 'Charlie', salary: 90000 },
          { name: 'Diana', salary: 80000 }
        ],
        after: [
          { row_number: '1, 2, 3, 4 (No ties allowed)' },
          { rank: '1, 2, 2, 4 (Skips 3 due to tie)' },
          { dense_rank: '1, 2, 2, 3 (Preserves next integer sequence)' }
        ]
      },
      commonMistakes: [
        'Attempting to filter window functions directly in the WHERE clause (e.g. `WHERE ROW_NUMBER() = 1` -> illegal in SQL). You must wrap the window query inside a CTE or subquery first!',
        'Attempting to run window functions on MySQL 5.7 or older (they were added in MySQL 8.0).',
        'Confusing `PARTITION BY` with `ORDER BY` inside `OVER()`.'
      ],
      practiceExercise: {
        instructions: 'Rank all employees in `company_db` by salary descending using `DENSE_RANK() OVER (ORDER BY salary DESC)`.',
        defaultCode: 'SELECT first_name, last_name, salary,\n    DENSE_RANK() OVER (ORDER BY salary DESC) AS overall_rank\nFROM employees;',
        solution: 'SELECT first_name, last_name, salary,\n    DENSE_RANK() OVER (ORDER BY salary DESC) AS overall_rank\nFROM employees;',
        hint: 'Use DENSE_RANK() OVER (ORDER BY salary DESC) AS overall_rank.'
      },
      quiz: {
        question: 'If two rows tie for 2nd place, what rank does the next row receive when using DENSE_RANK()?',
        options: [
          '4',
          '3',
          '2.5',
          '0'
        ],
        correctIndex: 1,
        explanation: 'DENSE_RANK does not skip ranks after ties. After ranks 1, 2, 2, the next row is assigned rank 3.'
      }
    }
  }
];
