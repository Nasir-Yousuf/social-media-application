// Module 6: SQL Joins (Lessons 31-36)

export const module6Lessons = [
  {
    id: 'mysql-lesson-31',
    track: 'mysql',
    moduleId: 'mysql-mod-6',
    moduleTitle: 'Module 6: SQL Joins',
    lessonNumber: 31,
    title: 'Mastering INNER JOIN',
    subtitle: 'Combine rows from two tables where the join condition is satisfied in both.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisites: ['Relationships and Database Design (Module 5)'],
    objectives: [
      'Understand the conceptual Venn diagram of INNER JOIN.',
      'Write queries matching Parent and Child tables using the ON keyword.',
      'Use table aliases (e.g. `e` for employees, `d` for departments) for cleaner SQL.',
      'Recognize that unmatched records from both tables are excluded.'
    ],
    content: {
      introduction: 'In relational databases, real business answers almost always span multiple tables. An `orders` table has IDs, but your boss wants customer names. An `employees` table has salaries, but HR wants department titles. The `INNER JOIN` keyword selects records that have matching values in both tables.',
      coreConcepts: [
        {
          title: 'How INNER JOIN Operates',
          body: 'Think of INNER JOIN as an intersection of two sets. MySQL looks at each row in Table A, evaluates the `ON` condition against Table B, and if both rows match, joins their columns into a combined result row. If a row in Table A has no match in Table B, it is omitted from the output.'
        },
        {
          title: 'The ON Clause vs WHERE Clause',
          body: 'The `ON` clause specifies the relationship condition linking the two tables (usually matching a Primary Key to a Foreign Key, e.g., `e.department_id = d.department_id`). The `WHERE` clause is then used to filter the joined result (e.g., `WHERE e.salary > 70000`).'
        },
        {
          title: 'Table Aliasing',
          body: 'Writing `employees.first_name` repeatedly becomes verbose. In the `FROM` and `JOIN` clauses, you can assign short nicknames (aliases) like `FROM employees e JOIN departments d ON e.department_id = d.department_id`.'
        }
      ],
      sqlSyntax: `SELECT 
    e.employee_id,
    e.first_name,
    e.last_name,
    e.salary,
    d.department_name
FROM employees e
INNER JOIN departments d 
    ON e.department_id = d.department_id;`,
      explanation: [
        '`FROM employees e`: Specifies the first (left) table and assigns alias `e`.',
        '`INNER JOIN departments d`: Specifies the second (right) table with alias `d`.',
        '`ON e.department_id = d.department_id`: Explains how the two tables link together.',
        '`SELECT e.first_name, d.department_name`: Pulls columns from both distinct tables seamlessly.'
      ],
      sampleBeforeAfter: {
        table: 'INNER JOIN Execution Result',
        before: [
          { employee: 'Alice Walker', department_id: 1, salary: '$95,000' },
          { department: 'Engineering', department_id: 1, location: 'Building A' }
        ],
        after: [
          { first_name: 'Alice', last_name: 'Walker', salary: 95000, department_name: 'Engineering' }
        ]
      },
      commonMistakes: [
        'Forgetting the `ON` clause (turning the query into an accidental, slow Cartesian CROSS JOIN).',
        'Ambiguous column names: Referencing `department_id` in `SELECT` without prefixing the table alias (`e.department_id` or `d.department_id`) produces `Error: Column department_id is ambiguous`.',
        'Assuming INNER JOIN includes employees who have not yet been assigned to any department (it strictly excludes them).'
      ],
      practiceExercise: {
        instructions: 'Run an INNER JOIN query between `employees` and `departments` in `company_db` to display each employee\'s full name, job title, and department name.',
        defaultCode: 'SELECT e.first_name, e.last_name, e.job_title, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id;',
        solution: 'SELECT e.first_name, e.last_name, e.job_title, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id;',
        hint: 'Use INNER JOIN on e.department_id = d.department_id.'
      },
      quiz: {
        question: 'What happens to a record in Table A during an INNER JOIN if there is no matching record in Table B?',
        options: [
          'It appears with NULLs for Table B\'s columns.',
          'It is completely excluded from the result set.',
          'MySQL throws a syntax error.',
          'It duplicates all rows from Table B.'
        ],
        correctIndex: 1,
        explanation: 'INNER JOIN only returns rows where there is a match in BOTH tables. Unmatched rows are omitted.'
      }
    }
  },
  {
    id: 'mysql-lesson-32',
    track: 'mysql',
    moduleId: 'mysql-mod-6',
    moduleTitle: 'Module 6: SQL Joins',
    lessonNumber: 32,
    title: 'Understanding LEFT JOIN',
    subtitle: 'Preserving all records from the left table even when no matches exist in the right table.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisites: ['Mastering INNER JOIN (Lesson 31)'],
    objectives: [
      'Understand how LEFT JOIN (or LEFT OUTER JOIN) differs from INNER JOIN.',
      'Observe NULL padding on the right table when no match exists.',
      'Use LEFT JOIN to find "orphan" or inactive records (e.g., customers who never bought anything).',
      'Choose appropriately between INNER JOIN and LEFT JOIN for business reports.'
    ],
    content: {
      introduction: 'Suppose your CEO asks: "Show me all registered customers and their latest order total." If you use INNER JOIN, customers who registered today and have not yet made a purchase will be completely hidden! To include every single customer regardless of order history, we use `LEFT JOIN`.',
      coreConcepts: [
        {
          title: 'How LEFT JOIN Works',
          body: 'The `LEFT JOIN` returns ALL records from the left table (Table A), and the matched records from the right table (Table B). If there is no match on the right side, the result contains `NULL` for every column from Table B.'
        },
        {
          title: 'Finding Inactive or Missing Records',
          body: 'One of the most powerful SQL patterns is using `LEFT JOIN ... WHERE right_table.id IS NULL`. This immediately isolates records in the left table that have NO corresponding activity in the right table (e.g., departments with zero employees, or courses with zero student enrollments).'
        },
        {
          title: 'LEFT JOIN vs LEFT OUTER JOIN',
          body: 'In MySQL and the SQL standard, the `OUTER` keyword is optional. `LEFT JOIN` and `LEFT OUTER JOIN` are 100% synonymous and execute identical query plans.'
        }
      ],
      sqlSyntax: `-- Show all customers, including those with 0 orders:
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    o.order_id,
    o.total_amount
FROM customers c
LEFT JOIN orders o 
    ON c.customer_id = o.customer_id;

-- Find customers who have NEVER placed an order:
SELECT c.customer_id, c.first_name, c.email
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;`,
      explanation: [
        '`FROM customers c`: Customers is the LEFT table. Every customer will appear in the output at least once.',
        '`LEFT JOIN orders o`: If a customer has 3 orders, they appear in 3 rows. If they have 0 orders, they appear once with `order_id = NULL` and `total_amount = NULL`.',
        '`WHERE o.order_id IS NULL`: Filters out active buyers, leaving only inactive accounts.'
      ],
      sampleBeforeAfter: {
        table: 'LEFT JOIN Comparison',
        before: [
          { customer_id: 1, name: 'Alice', order_id: 101, total: '$1200' },
          { customer_id: 2, name: 'Bob', order_id: null, total: null }
        ],
        after: [
          { query: 'INNER JOIN', count: '1 row (Alice only)' },
          { query: 'LEFT JOIN', count: '2 rows (Alice with order, Bob with NULL)' }
        ]
      },
      commonMistakes: [
        'Accidentally turning a LEFT JOIN into an INNER JOIN by placing a filter like `WHERE o.total_amount > 50` (which drops rows where `o.total_amount` is NULL).',
        'Confusing which table is "Left": The table specified right after `FROM` is the left table.',
        'Not handling NULLs gracefully in reporting interfaces.'
      ],
      practiceExercise: {
        instructions: 'Write a LEFT JOIN query in `ecommerce_db` between `customers` and `orders` to list all customer names and their order IDs.',
        defaultCode: 'SELECT c.customer_id, c.first_name, c.last_name, o.order_id, o.total_amount\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id;',
        solution: 'SELECT c.customer_id, c.first_name, c.last_name, o.order_id, o.total_amount\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id;',
        hint: 'Use `FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id`.'
      },
      quiz: {
        question: 'Which query correctly finds all departments that currently have ZERO employees?',
        options: [
          'SELECT d.* FROM departments d INNER JOIN employees e ON d.department_id = e.department_id WHERE e.employee_id = 0',
          'SELECT d.* FROM departments d LEFT JOIN employees e ON d.department_id = e.department_id WHERE e.employee_id IS NULL',
          'SELECT d.* FROM departments d RIGHT JOIN employees e ON d.department_id = e.department_id',
          'SELECT d.* FROM departments d WHERE employees = 0'
        ],
        correctIndex: 1,
        explanation: 'A LEFT JOIN followed by `WHERE e.employee_id IS NULL` captures departments with no matching employee rows.'
      }
    }
  },
  {
    id: 'mysql-lesson-33',
    track: 'mysql',
    moduleId: 'mysql-mod-6',
    moduleTitle: 'Module 6: SQL Joins',
    lessonNumber: 33,
    title: 'Understanding RIGHT JOIN and Outer Join Nuances',
    subtitle: 'When to use RIGHT JOIN, how it mirrors LEFT JOIN, and why SQL teams favor LEFT JOIN.',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    prerequisites: ['Understanding LEFT JOIN (Lesson 32)'],
    objectives: [
      'Understand how RIGHT JOIN (RIGHT OUTER JOIN) functions.',
      'Convert any RIGHT JOIN into an equivalent, readable LEFT JOIN.',
      'Understand why professional database engineers standardize on LEFT JOIN.',
      'Learn about FULL OUTER JOIN support in MySQL and the UNION workaround.'
    ],
    content: {
      introduction: '`RIGHT JOIN` is the mirror image of `LEFT JOIN`. It returns all rows from the right table (the one specified after `JOIN`), along with matching rows from the left table. If there is no match on the left, NULLs appear. While valid, almost all professional developers rewrite RIGHT JOINs as LEFT JOINs for natural left-to-right reading comprehension.',
      coreConcepts: [
        {
          title: 'RIGHT JOIN Syntax and Mechanics',
          body: '`SELECT * FROM A RIGHT JOIN B ON A.id = B.a_id` guarantees every row from B appears in the output. If a row in B has no match in A, columns from A are populated with NULL.'
        },
        {
          title: 'The Equivalence Rule',
          body: 'Every single `A RIGHT JOIN B` is semantically identical to `B LEFT JOIN A`. Because humans read left-to-right, having the primary entity declared in `FROM` makes queries far easier to read and maintain.'
        },
        {
          title: 'What About FULL OUTER JOIN?',
          body: 'MySQL does NOT natively support the `FULL OUTER JOIN` keyword (which keeps all unmatched rows from BOTH tables). In MySQL, developers simulate FULL OUTER JOIN by combining a `LEFT JOIN` and a `RIGHT JOIN` with the `UNION` keyword.'
        }
      ],
      sqlSyntax: `-- A RIGHT JOIN:
SELECT 
    d.department_name,
    e.first_name,
    e.last_name
FROM employees e
RIGHT JOIN departments d 
    ON e.department_id = d.department_id;

-- The cleaner, standard equivalent using LEFT JOIN:
SELECT 
    d.department_name,
    e.first_name,
    e.last_name
FROM departments d
LEFT JOIN employees e 
    ON d.department_id = e.department_id;`,
      explanation: [
        'Both queries produce identical result rows.',
        'The second query is immediately understood: "Give me all departments, and attach any employees they may have."',
        'Standardizing on LEFT JOIN across an engineering team reduces cognitive friction.'
      ],
      sampleBeforeAfter: {
        table: 'Equivalence Test',
        before: [
          { query: 'FROM employees e RIGHT JOIN departments d', readability: 'Confusing: focus is on right table' }
        ],
        after: [
          { query: 'FROM departments d LEFT JOIN employees e', readability: 'Intuitive: focus is on primary table in FROM' }
        ]
      },
      commonMistakes: [
        'Mixing LEFT JOIN and RIGHT JOIN in the same query with 4+ tables (creates an unreadable mental puzzle).',
        'Trying to run `FULL OUTER JOIN` directly in MySQL and receiving a syntax error.',
        'Swapping table order during a refactor without swapping the JOIN type.'
      ],
      practiceExercise: {
        instructions: 'Run a query showing all departments and their employees using `FROM departments d LEFT JOIN employees e ON d.department_id = e.department_id`.',
        defaultCode: 'SELECT d.department_name, e.first_name, e.last_name, e.job_title\nFROM departments d\nLEFT JOIN employees e ON d.department_id = e.department_id;',
        solution: 'SELECT d.department_name, e.first_name, e.last_name, e.job_title\nFROM departments d\nLEFT JOIN employees e ON d.department_id = e.department_id;',
        hint: 'Notice that every department appears, even if it has no employee assigned.'
      },
      quiz: {
        question: 'Which of the following queries is semantically equivalent to "SELECT * FROM orders o RIGHT JOIN customers c ON o.customer_id = c.customer_id"?',
        options: [
          'SELECT * FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id',
          'SELECT * FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id',
          'SELECT * FROM customers c RIGHT JOIN orders o ON c.customer_id = o.customer_id',
          'SELECT * FROM orders o CROSS JOIN customers c'
        ],
        correctIndex: 0,
        explanation: 'Flipping the table order and changing RIGHT JOIN to LEFT JOIN preserves the exact same logic.'
      }
    }
  },
  {
    id: 'mysql-lesson-34',
    track: 'mysql',
    moduleId: 'mysql-mod-6',
    moduleTitle: 'Module 6: SQL Joins',
    lessonNumber: 34,
    title: 'CROSS JOIN and Self Joins',
    subtitle: 'Generate Cartesian products and join a table to itself to model hierarchies.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisites: ['Understanding RIGHT JOIN (Lesson 33)'],
    objectives: [
      'Understand Cartesian products and CROSS JOIN syntax.',
      'Identify practical use cases for CROSS JOIN (generating matrix combinations, test grids).',
      'Understand Self Joins: joining a table to an instance of itself.',
      'Query hierarchical structures like Employee-Manager or Parent-Child categories.'
    ],
    content: {
      introduction: 'What if you want to find every possible combination of shirts (Small, Medium, Large) and colors (Red, Blue, Green)? That is a `CROSS JOIN`. And what if an employee\'s manager is also an employee stored in the same table? That is a `Self Join`.',
      coreConcepts: [
        {
          title: 'What is a CROSS JOIN?',
          body: 'A CROSS JOIN produces a Cartesian product: it pairs every row of Table A with every row of Table B. If Table A has 5 rows and Table B has 10 rows, the result is 50 rows. If no `ON` condition is given in a join, MySQL executes a CROSS JOIN.'
        },
        {
          title: 'What is a Self Join?',
          body: 'A Self Join is simply a regular join where a table is joined with itself. To distinguish between the two roles in SQL, you MUST use different table aliases (e.g. `e` for employee and `m` for manager).'
        },
        {
          title: 'Modeling Manager Hierarchies',
          body: 'In an `employees` table, the column `manager_id` points back to `employee_id` in the very same table. By joining `employees e` with `employees m ON e.manager_id = m.employee_id`, we can display each employee alongside their boss.'
        }
      ],
      sqlSyntax: `-- Self Join: Display each employee alongside their manager name
SELECT 
    e.employee_id,
    CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
    e.job_title,
    CONCAT(m.first_name, ' ', m.last_name) AS manager_name
FROM employees e
LEFT JOIN employees m 
    ON e.manager_id = m.employee_id;

-- CROSS JOIN Example (Matrix generation)
SELECT c.course_name, d.department_name
FROM courses c
CROSS JOIN departments d;`,
      explanation: [
        '`FROM employees e`: Instance `e` represents the worker.',
        '`LEFT JOIN employees m`: Instance `m` represents their supervisor.',
        '`ON e.manager_id = m.employee_id`: Matches the manager_id column to the supervisor\'s employee_id.',
        'We use `LEFT JOIN` so the CEO (who has `manager_id = NULL`) still appears in the directory.'
      ],
      sampleBeforeAfter: {
        table: 'Self Join Hierarchy',
        before: [
          { employee_id: 1, name: 'Alice Walker', manager_id: null },
          { employee_id: 2, name: 'Bob Smith', manager_id: 1 }
        ],
        after: [
          { employee_name: 'Alice Walker', manager_name: 'None (Top Executive)' },
          { employee_name: 'Bob Smith', manager_name: 'Alice Walker' }
        ]
      },
      commonMistakes: [
        'Accidentally running a CROSS JOIN on two large production tables (e.g., 100,000 rows x 100,000 rows = 10 billion rows, crashing the server).',
        'Forgetting distinct aliases during a self join (e.g. `FROM employees JOIN employees` throws an error: `Not unique table/alias: employees`).',
        'Using INNER JOIN for manager lookups, which silently hides the company President/CEO.'
      ],
      practiceExercise: {
        instructions: 'Run the Self Join query on `employees` to display employees and their respective manager names.',
        defaultCode: 'SELECT e.employee_id, e.first_name AS employee, e.job_title, m.first_name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.employee_id;',
        solution: 'SELECT e.employee_id, e.first_name AS employee, e.job_title, m.first_name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.employee_id;',
        hint: 'Notice that Alice Walker has manager = NULL because she has no supervisor.'
      },
      quiz: {
        question: 'Why is it mandatory to use different aliases when performing a Self Join in MySQL?',
        options: [
          'Because MySQL needs distinct names to know which instance of the table columns belong to.',
          'Because self joins require two different physical databases.',
          'To encrypt the salary data.',
          'Aliases are optional in self joins.'
        ],
        correctIndex: 0,
        explanation: 'Without aliases, column references like `first_name` would be ambiguous because both sides refer to the same table.'
      }
    }
  },
  {
    id: 'mysql-lesson-35',
    track: 'mysql',
    moduleId: 'mysql-mod-6',
    moduleTitle: 'Module 6: SQL Joins',
    lessonNumber: 35,
    title: 'Joining Three or More Tables',
    subtitle: 'Connecting complex multi-entity relationships into a single cohesive report.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisites: ['CROSS JOIN and Self Joins (Lesson 34)'],
    objectives: [
      'Chain multiple JOIN clauses in a single SELECT query.',
      'Connect tables through intermediary junction tables (e.g., Orders -> Order Items -> Products).',
      'Follow logical foreign key pathways across the database schema.',
      'Combine INNER and LEFT JOINs in multi-table queries cleanly.'
    ],
    content: {
      introduction: 'In realistic systems, answers rarely involve only two tables. To generate a customer invoice, you must connect:\n1. The `customers` table (who bought it),\n2. The `orders` table (when it was bought),\n3. The `order_items` table (how many were bought), and\n4. The `products` table (what the product name is).\nSQL makes chaining joins straightforward.',
      coreConcepts: [
        {
          title: 'The Multi-Table Join Pipeline',
          body: 'Joins are evaluated sequentially. You start with Table 1 in `FROM`. You `JOIN` Table 2 `ON` condition. Then you `JOIN` Table 3 `ON` condition connecting to either Table 1 or Table 2. Each join expands the available columns.'
        },
        {
          title: 'Navigating Through Junction Tables',
          body: 'To connect Students to Courses (a Many-to-Many relationship), you must join through `enrollments`:\n`students` -> `enrollments` -> `courses`.'
        },
        {
          title: 'Careful with Mixed Join Types',
          body: 'If you start with a `LEFT JOIN` and follow it with an `INNER JOIN` on the child table, you may accidentally eliminate the NULL rows you intended to keep. Place joins in deliberate logical order.'
        }
      ],
      sqlSyntax: `-- Connect 4 tables to build a complete customer invoice line-item breakdown:
SELECT 
    c.first_name,
    c.last_name,
    o.order_id,
    o.order_date,
    p.product_name,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS line_total
FROM customers c
INNER JOIN orders o 
    ON c.customer_id = o.customer_id
INNER JOIN order_items oi 
    ON o.order_id = oi.order_id
INNER JOIN products p 
    ON oi.product_id = p.product_id
ORDER BY o.order_id, oi.order_item_id;`,
      explanation: [
        '`FROM customers c`: Start with customers.',
        '`INNER JOIN orders o ON c.customer_id = o.customer_id`: Connect orders.',
        '`INNER JOIN order_items oi ON o.order_id = oi.order_id`: Connect order item rows.',
        '`INNER JOIN products p ON oi.product_id = p.product_id`: Connect to get the actual product title.',
        '`(oi.quantity * oi.unit_price) AS line_total`: Calculate subtotal on the fly.'
      ],
      sampleBeforeAfter: {
        table: '4-Table Pipeline Breakdown',
        before: [
          { table: 'customers', provides: 'Customer name & contact' },
          { table: 'orders', provides: 'Order date & order ID' },
          { table: 'order_items', provides: 'Quantity & item price' },
          { table: 'products', provides: 'Product catalog title' }
        ],
        after: [
          { output: 'Single unified customer receipt row with complete details' }
        ]
      },
      commonMistakes: [
        'Joining Table 3 to Table 1 on an invalid column instead of connecting through Table 2.',
        'Not indenting or organizing SQL formatting, making queries with 4+ joins unreadable.',
        'Selecting `*` in multi-table queries, pulling 40+ redundant ID columns over the network.'
      ],
      practiceExercise: {
        instructions: 'Join `students`, `enrollments`, and `courses` in `university_db` to display student names, course names, and grades.',
        defaultCode: 'SELECT s.first_name, s.last_name, c.course_name, e.grade\nFROM students s\nINNER JOIN enrollments e ON s.student_id = e.student_id\nINNER JOIN courses c ON e.course_id = c.course_id;',
        solution: 'SELECT s.first_name, s.last_name, c.course_name, e.grade\nFROM students s\nINNER JOIN enrollments e ON s.student_id = e.student_id\nINNER JOIN courses c ON e.course_id = c.course_id;',
        hint: 'Use two INNER JOIN clauses: first connect enrollments on student_id, then connect courses on course_id.'
      },
      quiz: {
        question: 'When joining Students to Courses in a Many-to-Many relationship, why do we need two JOIN clauses?',
        options: [
          'Because SQL requires all queries to have an even number of joins.',
          'Because we must join Students to the Enrollments junction table, and then join Enrollments to Courses.',
          'To double the query speed.',
          'Because courses are stored in a different file format.'
        ],
        correctIndex: 1,
        explanation: 'M:N relationships connect through an intermediary junction table, requiring one join to reach the junction table and a second join to reach the target entity.'
      }
    }
  },
  {
    id: 'mysql-lesson-36',
    track: 'mysql',
    moduleId: 'mysql-mod-6',
    moduleTitle: 'Module 6: SQL Joins',
    lessonNumber: 36,
    title: 'Join Practice Lab and Common Join Pitfalls',
    subtitle: 'Diagnose tricky join bugs, Cartesian explosions, and duplicate row issues.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisites: ['Joining Three or More Tables (Lesson 35)'],
    objectives: [
      'Diagnose and resolve the "Cartesian explosion" (duplicate rows caused by multiple 1:N joins).',
      'Understand the difference between filtering in ON vs filtering in WHERE with outer joins.',
      'Optimize join query readability and execution plan basics.',
      'Practice hands-on real-world business join queries.'
    ],
    content: {
      introduction: 'Joins are the backbone of relational database queries, but subtle mistakes can produce inflated sales numbers or duplicate rows. In this lesson and lab, we review the top pitfalls every SQL professional must master.',
      coreConcepts: [
        {
          title: 'The ON vs WHERE Condition Trap in LEFT JOIN',
          body: 'Consider:\n- `FROM A LEFT JOIN B ON A.id = B.a_id AND B.status = \'active\'`\n- `FROM A LEFT JOIN B ON A.id = B.a_id WHERE B.status = \'active\'`\nThese produce radically different results! The first still returns all rows from A. The second converts the query into an INNER JOIN because `WHERE` rejects rows where `B.status` is NULL!'
        },
        {
          title: 'The Fan-Out / Duplicate Row Problem',
          body: 'If a customer has 3 orders and 4 support tickets, joining `customers` to both `orders` and `tickets` produces 3 x 4 = 12 rows for that single customer! Never join two independent 1:N child tables in a single query if you are calculating sums.'
        },
        {
          title: 'Indexing Foreign Keys',
          body: 'Whenever you write `ON A.department_id = B.department_id`, MySQL performs best when the foreign key column is indexed. In MySQL InnoDB, foreign keys are automatically indexed.'
        }
      ],
      sqlSyntax: `-- Trap demonstration:
-- Query 1 (Correct Outer Join Filter): Keeps all customers, attaches only high-value orders
SELECT c.first_name, o.order_id, o.total_amount
FROM customers c
LEFT JOIN orders o 
    ON c.customer_id = o.customer_id 
    AND o.total_amount > 500;

-- Query 2 (Accidental Inner Join): Drops all customers who don't have an order > 500
SELECT c.first_name, o.order_id, o.total_amount
FROM customers c
LEFT JOIN orders o 
    ON c.customer_id = o.customer_id
WHERE o.total_amount > 500;`,
      explanation: [
        'Notice how moving the condition from `ON` to `WHERE` completely changes the result set.',
        'Keep conditions that determine whether a row from the RIGHT table matches in the `ON` clause.',
        'Use `WHERE` only for conditions that filter the entire combined row after joining.'
      ],
      sampleBeforeAfter: {
        table: 'ON vs WHERE in LEFT JOIN',
        before: [
          { method: 'Condition in WHERE', behavior: 'Discards unmatched rows from left table (acts like INNER JOIN)' }
        ],
        after: [
          { method: 'Condition in ON', behavior: 'Preserves all left table rows; attaches right table only when condition holds' }
        ]
      },
      commonMistakes: [
        'Summing prices across a multi-table fan-out join and accidentally multiplying sales totals by 3x or 4x.',
        'Using `SELECT DISTINCT` as a quick band-aid to hide join duplication instead of fixing the root join logic.',
        'Forgetting table aliases on ambiguous column names.'
      ],
      practiceExercise: {
        instructions: 'Write a query in `ecommerce_db` listing all products, their category names, and current prices, sorted by price descending.',
        defaultCode: 'SELECT p.product_name, c.category_name, p.price\nFROM products p\nINNER JOIN categories c ON p.category_id = c.category_id\nORDER BY p.price DESC;',
        solution: 'SELECT p.product_name, c.category_name, p.price\nFROM products p\nINNER JOIN categories c ON p.category_id = c.category_id\nORDER BY p.price DESC;',
        hint: 'Join products p with categories c on p.category_id = c.category_id and sort by p.price DESC.'
      },
      quiz: {
        question: 'What is the danger of using "WHERE right_table.status = \'shipped\'" on a LEFT JOIN query?',
        options: [
          'It crashes the MySQL server.',
          'It silently transforms the LEFT JOIN into an INNER JOIN by filtering out NULL rows from the left table.',
          'It automatically deletes un-shipped orders.',
          'It causes all numbers to round to zero.'
        ],
        correctIndex: 1,
        explanation: 'Any condition in WHERE that checks a right-table column for a specific value excludes rows where that column is NULL, destroying the outer join effect.'
      }
    }
  }
];
