// Module 7: Aggregation and Subqueries (Lessons 37-42)

export const module7Lessons = [
  {
    id: 'mysql-lesson-37',
    track: 'mysql',
    moduleId: 'mysql-mod-7',
    moduleTitle: 'Module 7: Aggregation and Subqueries',
    lessonNumber: 37,
    title: 'Aggregate Functions: COUNT, SUM, AVG, MIN, and MAX',
    subtitle: 'Calculate summary statistics and metrics across datasets.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisites: ['SQL Joins (Module 6)'],
    objectives: [
      'Master the five core aggregate functions: COUNT(), SUM(), AVG(), MIN(), MAX().',
      'Understand how aggregate functions handle NULL values.',
      'Differentiate COUNT(*) vs COUNT(column_name) vs COUNT(DISTINCT column_name).',
      'Combine aggregates with column aliases to produce readable business reports.'
    ],
    content: {
      introduction: 'Businesses do not just look at individual database rows—they need high-level metrics: What is our total revenue this month? What is the average employee salary? Who has the lowest test score? Aggregate functions perform calculations on a set of values and return a single summary value.',
      coreConcepts: [
        {
          title: 'The Core 5 Aggregate Functions',
          body: '- `COUNT()`: Counts the number of rows or non-null values.\n- `SUM()`: Returns the arithmetic sum of numeric values.\n- `AVG()`: Calculates the average (mean) of numeric values.\n- `MIN()`: Finds the smallest value (works on numbers, dates, and text strings).\n- `MAX()`: Finds the largest value.'
        },
        {
          title: 'COUNT(*) vs COUNT(column)',
          body: '- `COUNT(*)` counts EVERY row returned, regardless of whether columns contain NULL.\n- `COUNT(column_name)` counts only rows where that specific column is NOT NULL.\n- `COUNT(DISTINCT column_name)` counts unique non-null values.'
        },
        {
          title: 'Null Handling in Math Aggregates',
          body: '`SUM()` and `AVG()` completely ignore NULL values. For example, the average of (10, 20, NULL) is 15 (30 divided by 2), NOT 10 (30 divided by 3).'
        }
      ],
      sqlSyntax: `SELECT 
    COUNT(*) AS total_employees,
    COUNT(DISTINCT department_id) AS active_departments,
    SUM(salary) AS total_payroll,
    ROUND(AVG(salary), 2) AS average_salary,
    MIN(salary) AS lowest_salary,
    MAX(salary) AS highest_salary
FROM employees;`,
      explanation: [
        '`COUNT(*) AS total_employees`: Calculates total headcount.',
        '`COUNT(DISTINCT department_id)`: Counts how many unique departments currently have staff.',
        '`ROUND(AVG(salary), 2)`: Computes the average and rounds to two decimal places.',
        '`MIN(salary)` and `MAX(salary)`: Capture the salary range across the entire company.'
      ],
      sampleBeforeAfter: {
        table: 'Aggregate Summary Example',
        before: [
          { employee: 'Alice', salary: 95000 },
          { employee: 'Bob', salary: 72000 },
          { employee: 'Charlie', salary: 110000 },
          { employee: 'Diana', salary: 85000 }
        ],
        after: [
          { total_employees: 4, total_payroll: 362000, avg_salary: 90500, min_salary: 72000, max_salary: 110000 }
        ]
      },
      commonMistakes: [
        'Attempting to select a regular column alongside an aggregate without a GROUP BY (e.g. `SELECT first_name, AVG(salary) FROM employees;` produces an error or arbitrary row in strict SQL mode).',
        'Assuming `COUNT(column)` includes NULLs (use `COUNT(*)` if you want total row count).',
        'Running `SUM()` on text or varchar columns.'
      ],
      practiceExercise: {
        instructions: 'Write a query on `products` in `ecommerce_db` calculating total products, lowest price, highest price, and average price.',
        defaultCode: 'SELECT COUNT(*) AS total_products, MIN(price) AS min_price, MAX(price) AS max_price, AVG(price) AS avg_price FROM products;',
        solution: 'SELECT COUNT(*) AS total_products, MIN(price) AS min_price, MAX(price) AS max_price, AVG(price) AS avg_price FROM products;',
        hint: 'Use COUNT(*), MIN(price), MAX(price), and AVG(price).'
      },
      quiz: {
        question: 'If a table has 4 rows with values (10, 20, NULL, 30), what does AVG(val) return?',
        options: [
          '15',
          '20',
          'NULL',
          'Error'
        ],
        correctIndex: 1,
        explanation: 'AVG ignores the NULL row: (10 + 20 + 30) / 3 = 60 / 3 = 20.'
      }
    }
  },
  {
    id: 'mysql-lesson-38',
    track: 'mysql',
    moduleId: 'mysql-mod-7',
    moduleTitle: 'Module 7: Aggregation and Subqueries',
    lessonNumber: 38,
    title: 'Grouping Data with GROUP BY',
    subtitle: 'Split records into buckets and calculate aggregates per category or department.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisites: ['Aggregate Functions (Lesson 37)'],
    objectives: [
      'Understand how the GROUP BY clause partitions data into summary buckets.',
      'Group by single and multiple columns.',
      'Enforce SQL standard only_full_group_by rules.',
      'Combine GROUP BY with JOINs to produce department-level and category-level metrics.'
    ],
    content: {
      introduction: 'Finding the average salary of the entire company is helpful, but what if management wants to compare the average salary of each department? The `GROUP BY` clause groups rows that have the same values in specified columns into summary rows.',
      coreConcepts: [
        {
          title: 'The Mechanism of GROUP BY',
          body: 'MySQL sorts and splits incoming rows into "buckets" based on unique values in the `GROUP BY` columns. Then, any aggregate function in the `SELECT` list operates independently on each individual bucket.'
        },
        {
          title: 'The ONLY_FULL_GROUP_BY Rule',
          body: 'Modern MySQL (5.7+) enforces strict SQL standards: Every non-aggregated column in your `SELECT` list MUST be included in the `GROUP BY` clause. If you select `department_id, first_name, AVG(salary) GROUP BY department_id`, MySQL will reject the query because it cannot determine which employee\'s `first_name` to pick for that department.'
        },
        {
          title: 'Grouping by Multiple Columns',
          body: 'You can group by more than one column, e.g. `GROUP BY department_id, job_title`. This creates a bucket for each unique combination of department and role.'
        }
      ],
      sqlSyntax: `-- Calculate total payroll and employee count per department:
SELECT 
    department_id,
    COUNT(*) AS employee_count,
    ROUND(AVG(salary), 2) AS avg_salary,
    SUM(salary) AS total_payroll
FROM employees
GROUP BY department_id
ORDER BY total_payroll DESC;

-- Combined with JOIN to show department names:
SELECT 
    d.department_name,
    COUNT(e.employee_id) AS total_staff,
    ROUND(AVG(e.salary), 2) AS avg_salary
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id
GROUP BY d.department_id, d.department_name;`,
      explanation: [
        '`GROUP BY department_id`: Groups rows having the same `department_id`.',
        '`COUNT(*)`: Counts the rows within each specific department bucket.',
        '`AVG(salary)`: Calculates the average salary for that specific department.',
        'We group by both `d.department_id` and `d.department_name` to satisfy SQL standard group by rules.'
      ],
      sampleBeforeAfter: {
        table: 'GROUP BY Bucketing',
        before: [
          { emp: 'Alice', dept: 'Engineering', salary: 95000 },
          { emp: 'Charlie', dept: 'Engineering', salary: 110000 },
          { emp: 'Bob', dept: 'Marketing', salary: 72000 }
        ],
        after: [
          { department: 'Engineering', count: 2, avg_salary: 102500 },
          { department: 'Marketing', count: 1, avg_salary: 72000 }
        ]
      },
      commonMistakes: [
        'Including a non-aggregated column in `SELECT` that is missing from `GROUP BY` (triggers `Error 1055: Expression #1 of SELECT list is not in GROUP BY clause`).',
        'Placing `GROUP BY` before the `WHERE` clause (Syntax requires: `FROM -> WHERE -> GROUP BY -> ORDER BY`).',
        'Confusing `ORDER BY` with `GROUP BY`.'
      ],
      practiceExercise: {
        instructions: 'Group products in `ecommerce_db` by `category_id` and display the count of products and average price for each category.',
        defaultCode: 'SELECT category_id, COUNT(*) AS product_count, ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY category_id;',
        solution: 'SELECT category_id, COUNT(*) AS product_count, ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY category_id;',
        hint: 'Use `SELECT category_id, COUNT(*), ROUND(AVG(price), 2) FROM products GROUP BY category_id;`'
      },
      quiz: {
        question: 'In MySQL strict mode, what error occurs if you run "SELECT department_id, first_name, MAX(salary) FROM employees GROUP BY department_id"?',
        options: [
          'Table does not exist error.',
          'Expression #2 (first_name) is not in the GROUP BY clause and contains non-aggregated column (Error 1055).',
          'Syntax error near MAX.',
          'The query succeeds and returns all first names as an array.'
        ],
        correctIndex: 1,
        explanation: 'Every column in SELECT must either be enclosed in an aggregate function or listed in GROUP BY.'
      }
    }
  },
  {
    id: 'mysql-lesson-39',
    track: 'mysql',
    moduleId: 'mysql-mod-7',
    moduleTitle: 'Module 7: Aggregation and Subqueries',
    lessonNumber: 39,
    title: 'Filtering Groups: HAVING vs WHERE',
    subtitle: 'Filter individual rows with WHERE and filter aggregated groups with HAVING.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisites: ['Grouping Data with GROUP BY (Lesson 38)'],
    objectives: [
      'Master the critical conceptual difference between WHERE and HAVING.',
      'Understand SQL query execution order: WHERE filters before grouping, HAVING filters after grouping.',
      'Filter aggregate results (e.g. groups with COUNT(*) > 5 or AVG(salary) > 80,000).',
      'Combine WHERE and HAVING in the same query properly.'
    ],
    content: {
      introduction: 'One of the most frequent SQL interview questions is: "What is the difference between WHERE and HAVING?" The short answer: WHERE filters individual rows BEFORE they are grouped, while HAVING filters aggregated group metrics AFTER grouping takes place.',
      coreConcepts: [
        {
          title: 'The WHERE Clause: Pre-Aggregation Filter',
          body: 'WHERE inspects rows as they come off the disk. It cannot evaluate aggregate functions like `SUM()` or `AVG()` because groups have not been created yet! Writing `WHERE AVG(salary) > 50000` is illegal syntax in SQL.'
        },
        {
          title: 'The HAVING Clause: Post-Aggregation Filter',
          body: 'HAVING inspects the computed summary buckets created by `GROUP BY`. You can write `HAVING AVG(salary) > 50000` or `HAVING COUNT(*) >= 2` to filter out entire groups.'
        },
        {
          title: 'SQL Logical Order of Execution',
          body: 'The database executes your query in this exact sequence:\n1. `FROM` & `JOIN` (Gather tables)\n2. `WHERE` (Filter individual rows)\n3. `GROUP BY` (Aggregate into buckets)\n4. `HAVING` (Filter aggregated buckets)\n5. `SELECT` (Choose output columns)\n6. `ORDER BY` (Sort final output)\n7. `LIMIT` (Restrict row count)'
        }
      ],
      sqlSyntax: `-- Find departments where average salary exceeds $80,000,
-- considering only active employees hired after 2020:
SELECT 
    department_id,
    COUNT(*) AS team_size,
    ROUND(AVG(salary), 2) AS avg_salary
FROM employees
WHERE hire_date >= '2020-01-01'   -- WHERE: filters individual rows
GROUP BY department_id            -- GROUP BY: builds buckets
HAVING COUNT(*) >= 2              -- HAVING: filters buckets by metric
   AND AVG(salary) > 80000
ORDER BY avg_salary DESC;`,
      explanation: [
        '`WHERE hire_date >= \'2020-01-01\'`: Discards pre-2020 hires before any grouping starts.',
        '`GROUP BY department_id`: Groups the remaining recent hires by department.',
        '`HAVING COUNT(*) >= 2 AND AVG(salary) > 80000`: Drops any department bucket that has fewer than 2 recent hires or an average pay below $80k.'
      ],
      sampleBeforeAfter: {
        table: 'WHERE vs HAVING Comparison',
        before: [
          { clause: 'WHERE', target: 'Individual raw rows', runs: 'Before GROUP BY', can_use_aggregates: 'NO' }
        ],
        after: [
          { clause: 'HAVING', target: 'Aggregated summary groups', runs: 'After GROUP BY', can_use_aggregates: 'YES' }
        ]
      },
      commonMistakes: [
        'Attempting to put an aggregate function in the WHERE clause (`WHERE COUNT(*) > 2` -> `Invalid use of group function`).',
        'Using HAVING to filter non-aggregated individual row columns (e.g. `HAVING status = \'active\'` wastes database memory; use WHERE instead).',
        'Writing HAVING before GROUP BY.'
      ],
      practiceExercise: {
        instructions: 'Query `company_db` to find departments that have more than 1 employee using `GROUP BY department_id HAVING COUNT(*) > 1`.',
        defaultCode: 'SELECT department_id, COUNT(*) AS emp_count\nFROM employees\nGROUP BY department_id\nHAVING COUNT(*) > 1;',
        solution: 'SELECT department_id, COUNT(*) AS emp_count\nFROM employees\nGROUP BY department_id\nHAVING COUNT(*) > 1;',
        hint: 'Use GROUP BY department_id HAVING COUNT(*) > 1.'
      },
      quiz: {
        question: 'Why does "SELECT department_id FROM employees WHERE AVG(salary) > 50000" fail?',
        options: [
          'Because salary cannot be averaged.',
          'Because WHERE filters individual rows before aggregate functions are calculated; aggregate conditions belong in HAVING.',
          'Because department_id cannot be selected.',
          'Because AVG requires the ROUND function.'
        ],
        correctIndex: 1,
        explanation: 'WHERE cannot evaluate group aggregate functions because rows have not yet been grouped. That is what HAVING is designed for.'
      }
    }
  },
  {
    id: 'mysql-lesson-40',
    track: 'mysql',
    moduleId: 'mysql-mod-7',
    moduleTitle: 'Module 7: Aggregation and Subqueries',
    lessonNumber: 40,
    title: 'Subqueries in SELECT, FROM, and WHERE',
    subtitle: 'Nesting queries inside queries to solve dynamic multi-step questions.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisites: ['Filtering Groups: HAVING vs WHERE (Lesson 39)'],
    objectives: [
      'Understand what a subquery (inner query) is and how it passes values to an outer query.',
      'Write scalar subqueries in the WHERE clause (e.g., finding employees earning above average).',
      'Use subqueries in the SELECT clause to attach single computed values.',
      'Use subqueries in the FROM clause as derived tables with mandatory aliases.'
    ],
    content: {
      introduction: 'Often you cannot answer a business question in a single pass. For example: "Which employees make more than the company average?" To answer this, you must first calculate the average salary, and then filter employees against that computed number. A subquery is a query nested inside another SQL statement.',
      coreConcepts: [
        {
          title: 'Scalar Subqueries in WHERE',
          body: 'A scalar subquery returns exactly one row and one column (a single value). It can be used anywhere an expression or constant is expected, such as `WHERE salary > (SELECT AVG(salary) FROM employees)`.'
        },
        {
          title: 'Subqueries in the FROM Clause (Derived Tables)',
          body: 'You can query the results of another query by placing it in the `FROM` clause. In MySQL, EVERY derived table in the FROM clause MUST be given a table alias (e.g. `FROM (SELECT ...) AS temp_table`).'
        },
        {
          title: 'Subqueries in the SELECT Clause',
          body: 'You can nest a scalar subquery directly in the SELECT list to calculate an inline benchmark, such as showing each employee\'s salary alongside the overall company average.'
        }
      ],
      sqlSyntax: `-- 1. Subquery in WHERE: Find employees earning above the company average
SELECT employee_id, first_name, last_name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)
ORDER BY salary DESC;

-- 2. Subquery in FROM (Derived Table):
SELECT AVG(dept_totals.total_spend) AS avg_department_payroll
FROM (
    SELECT department_id, SUM(salary) AS total_spend
    FROM employees
    GROUP BY department_id
) AS dept_totals;

-- 3. Subquery in SELECT:
SELECT 
    first_name,
    salary,
    (SELECT ROUND(AVG(salary), 2) FROM employees) AS company_avg,
    ROUND(salary - (SELECT AVG(salary) FROM employees), 2) AS diff_from_avg
FROM employees;`,
      explanation: [
        'In Query 1, the inner query `(SELECT AVG(salary) FROM employees)` executes first, computing ~88000.',
        'The outer query then runs: `WHERE salary > 88000`.',
        'In Query 2, `(SELECT ...) AS dept_totals` creates a temporary in-memory table that the outer query aggregates.'
      ],
      sampleBeforeAfter: {
        table: 'Subquery Evaluation Order',
        before: [
          { step: 1, action: 'Inner query evaluates', result: 'Calculates AVG(salary) = 88000' }
        ],
        after: [
          { step: 2, action: 'Outer query evaluates', result: 'Filters rows where salary > 88000' }
        ]
      },
      commonMistakes: [
        'Using a subquery in the WHERE clause with an `=` comparison operator when the subquery returns multiple rows (produces `Error: Subquery returns more than 1 row`). Use `IN` instead of `=` for multi-row subqueries.',
        'Forgetting the alias for a derived table in the `FROM` clause (produces `Error 1248: Every derived table must have its own alias`).',
        'Nesting unindexed subqueries in SELECT across millions of rows (triggers severe performance degradation).'
      ],
      practiceExercise: {
        instructions: 'Find all students in `university_db` whose GPA is higher than the average GPA of all students.',
        defaultCode: 'SELECT student_id, first_name, last_name, gpa\nFROM students\nWHERE gpa > (SELECT AVG(gpa) FROM students);',
        solution: 'SELECT student_id, first_name, last_name, gpa\nFROM students\nWHERE gpa > (SELECT AVG(gpa) FROM students);',
        hint: 'Use `WHERE gpa > (SELECT AVG(gpa) FROM students)`.'
      },
      quiz: {
        question: 'What error occurs if you run "SELECT * FROM (SELECT department_id, COUNT(*) FROM employees GROUP BY department_id)" in MySQL?',
        options: [
          'Table not found.',
          'Every derived table must have its own alias (Error 1248).',
          'COUNT cannot be used in a subquery.',
          'Group by error.'
        ],
        correctIndex: 1,
        explanation: 'MySQL strictly requires every subquery in the FROM clause (derived table) to be assigned an explicit alias, such as `AS sub_summary`.'
      }
    }
  },
  {
    id: 'mysql-lesson-41',
    track: 'mysql',
    moduleId: 'mysql-mod-7',
    moduleTitle: 'Module 7: Aggregation and Subqueries',
    lessonNumber: 41,
    title: 'EXISTS, NOT EXISTS, and Correlated Subqueries',
    subtitle: 'Check for the existence of related rows efficiently with correlated subqueries.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisites: ['Subqueries in SELECT, FROM, WHERE (Lesson 40)'],
    objectives: [
      'Understand what a correlated subquery is and how it references outer query columns.',
      'Master the EXISTS and NOT EXISTS operators.',
      'Compare performance between IN vs EXISTS and NOT IN vs NOT EXISTS.',
      'Avoid the dreaded NULL trap with NOT IN.'
    ],
    content: {
      introduction: 'A standard subquery executes once independently of the outer query. In contrast, a CORRELATED subquery references columns from the outer query, executing once for each row evaluated by the outer query. When paired with `EXISTS` and `NOT EXISTS`, it provides powerful existence testing.',
      coreConcepts: [
        {
          title: 'The EXISTS Operator',
          body: '`EXISTS (subquery)` returns TRUE if the subquery returns at least one row, and FALSE if it returns zero rows. Because it stops scanning as soon as the first matching row is found (short-circuiting), it is often extremely fast.'
        },
        {
          title: 'Correlated Subquery Structure',
          body: 'Notice how the subquery references `c.customer_id` from the outer table: `WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)`. The inner query cannot be run by itself because it depends on the outer row.'
        },
        {
          title: 'The Fatal NOT IN with NULL Trap',
          body: 'If a subquery used with `NOT IN` returns even a single `NULL` value, the entire `NOT IN` condition evaluates to UNKNOWN/FALSE, returning ZERO rows! `NOT EXISTS` does not suffer from this trap, making `NOT EXISTS` much safer in production SQL.'
        }
      ],
      sqlSyntax: `-- Find all customers who have placed at least one order:
SELECT c.customer_id, c.first_name, c.email
FROM customers c
WHERE EXISTS (
    SELECT 1 
    FROM orders o 
    WHERE o.customer_id = c.customer_id
);

-- Find customers who have NEVER placed an order (Safe against NULLs):
SELECT c.customer_id, c.first_name, c.email
FROM customers c
WHERE NOT EXISTS (
    SELECT 1 
    FROM orders o 
    WHERE o.customer_id = c.customer_id
);`,
      explanation: [
        '`SELECT 1`: The column list inside an EXISTS subquery does not matter; MySQL only checks whether any matching row exists.',
        '`WHERE o.customer_id = c.customer_id`: Binds the inner order lookup to the current customer from the outer query.',
        '`NOT EXISTS`: Returns customers where the inner query returns zero matching order records.'
      ],
      sampleBeforeAfter: {
        table: 'IN vs EXISTS Comparison',
        before: [
          { operator: 'NOT IN', null_behavior: 'Fails and returns 0 rows if subquery returns any NULL', speed: 'Slower on large datasets' }
        ],
        after: [
          { operator: 'NOT EXISTS', null_behavior: 'Safe: Immune to NULL values in child tables', speed: 'Fast: Short-circuits on first hit' }
        ]
      },
      commonMistakes: [
        'Using `NOT IN (SELECT foreign_key FROM ...)` when the foreign key column contains NULLs (wipes out your entire result set).',
        'Selecting heavy columns inside `EXISTS (SELECT * FROM ...)` (write `SELECT 1` instead for clarity).',
        'Writing an uncorrelated subquery inside EXISTS by forgetting the outer join condition, causing it to return all rows or no rows.'
      ],
      practiceExercise: {
        instructions: 'Use `EXISTS` to find all departments in `company_db` that currently have at least one employee assigned.',
        defaultCode: 'SELECT d.department_id, d.department_name\nFROM departments d\nWHERE EXISTS (\n    SELECT 1 FROM employees e WHERE e.department_id = d.department_id\n);',
        solution: 'SELECT d.department_id, d.department_name\nFROM departments d\nWHERE EXISTS (\n    SELECT 1 FROM employees e WHERE e.department_id = d.department_id\n);',
        hint: 'Use `WHERE EXISTS (SELECT 1 FROM employees e WHERE e.department_id = d.department_id)`.'
      },
      quiz: {
        question: 'Why is NOT EXISTS preferred over NOT IN when querying subqueries on columns that might contain NULL?',
        options: [
          'Because NOT EXISTS runs in reverse alphabetical order.',
          'Because if the subquery returns a single NULL, NOT IN evaluates to UNKNOWN and returns zero results.',
          'NOT EXISTS is required by MySQL syntax.',
          'NOT IN is deprecated in MySQL 8.'
        ],
        correctIndex: 1,
        explanation: 'In SQL 3-valued logic, `value NOT IN (1, 2, NULL)` evaluates to UNKNOWN for all rows, returning empty results.'
      }
    }
  },
  {
    id: 'mysql-lesson-42',
    track: 'mysql',
    moduleId: 'mysql-mod-7',
    moduleTitle: 'Module 7: Aggregation and Subqueries',
    lessonNumber: 42,
    title: 'Combining Aggregation, Joins, and Subqueries',
    subtitle: 'Synthesize complex business queries answering multi-dimensional analytics questions.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisites: ['EXISTS and Correlated Subqueries (Lesson 41)'],
    objectives: [
      'Solve end-to-end business reporting challenges combining JOINs, GROUP BY, and Subqueries.',
      'Identify top-selling products and top-spending customers.',
      'Calculate percentage of total revenue using inline subqueries.',
      'Structure clean, readable, modular SQL code.'
    ],
    content: {
      introduction: 'In professional software development and data analytics, real-world questions require combining everything you have learned: joining tables, grouping by dimensions, calculating metrics, and comparing against benchmarks computed via subqueries. In this capstone lesson for Module 7, we put it all together.',
      coreConcepts: [
        {
          title: 'Business Metric 1: Top-Spending Customers',
          body: 'Requires joining `customers` with `orders`, grouping by customer identity, summing order totals, and sorting descending.'
        },
        {
          title: 'Business Metric 2: Product Contribution % of Total Sales',
          body: 'Requires calculating the revenue of each product using `SUM(oi.quantity * oi.unit_price)`, and dividing by a subquery that computes the total revenue across the entire company: `(SELECT SUM(total_amount) FROM orders)`.'
        },
        {
          title: 'Formatting and Readability Rules',
          body: 'When combining joins, groups, and subqueries, use consistent indenting, explicit table aliases, and meaningful column aliases so any teammate can review your code.'
        }
      ],
      sqlSyntax: `-- Calculate total revenue per product category and contribution %:
SELECT 
    c.category_name,
    COUNT(DISTINCT p.product_id) AS total_products,
    SUM(oi.quantity) AS units_sold,
    SUM(oi.quantity * oi.unit_price) AS category_revenue,
    ROUND(
        (SUM(oi.quantity * oi.unit_price) / 
         (SELECT SUM(quantity * unit_price) FROM order_items)
        ) * 100, 
        2
    ) AS pct_of_total_sales
FROM categories c
INNER JOIN products p ON c.category_id = p.category_id
INNER JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY c.category_id, c.category_name
ORDER BY category_revenue DESC;`,
      explanation: [
        'Joins 3 tables: `categories`, `products`, and `order_items`.',
        'Groups by category to aggregate revenue per product group.',
        '`(SELECT SUM(quantity * unit_price) FROM order_items)`: Inline scalar subquery that computes grand company revenue dynamically.',
        'Multiplies by 100 and rounds to produce a polished percentage column.'
      ],
      sampleBeforeAfter: {
        table: 'Business Intelligence Report Output',
        before: [
          { raw_order: 'Order #1: Laptop $1299.99' },
          { raw_order: 'Order #2: Mouse $29.99' }
        ],
        after: [
          { category: 'Electronics', units_sold: 5, category_revenue: '$2689.95', pct_of_total_sales: '87.4%' }
        ]
      },
      commonMistakes: [
        'Division by zero in percentage formulas (use `NULLIF(subquery, 0)` to guard against empty databases).',
        'Summing before joining vs joining before summing (double check that one-to-many joins do not inflate counts).',
        'Writing monolithic 200-line queries without comments or indentation.'
      ],
      practiceExercise: {
        instructions: 'Write a query in `ecommerce_db` listing each customer\'s full name, total number of orders placed, and total spent across all orders, sorted by total spent descending.',
        defaultCode: 'SELECT c.first_name, c.last_name, COUNT(o.order_id) AS order_count, SUM(o.total_amount) AS total_spent\nFROM customers c\nINNER JOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.first_name, c.last_name\nORDER BY total_spent DESC;',
        solution: 'SELECT c.first_name, c.last_name, COUNT(o.order_id) AS order_count, SUM(o.total_amount) AS total_spent\nFROM customers c\nINNER JOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.first_name, c.last_name\nORDER BY total_spent DESC;',
        hint: 'Join customers with orders, group by customer_id and names, and calculate COUNT(o.order_id) and SUM(o.total_amount).'
      },
      quiz: {
        question: 'What is the purpose of nesting "(SELECT SUM(...) FROM ...)" in the SELECT list of a grouped query?',
        options: [
          'To format text as upper case.',
          'To compute a benchmark (such as grand total sales) so each group can calculate its percentage share of the total.',
          'It is required by MySQL to make GROUP BY work.',
          'To prevent SQL injection.'
        ],
        correctIndex: 1,
        explanation: 'A scalar subquery calculating the grand total allows individual groups to compute proportions, ratios, or deviations from overall metrics.'
      }
    }
  }
];
