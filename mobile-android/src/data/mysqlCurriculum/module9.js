// Module 9: Professional Database Skills (Lessons 49-54)

export const module9Lessons = [
  {
    id: 'mysql-lesson-49',
    track: 'mysql',
    moduleId: 'mysql-mod-9',
    moduleTitle: 'Module 9: Professional Database Skills',
    lessonNumber: 49,
    title: 'Indexes and Query Performance',
    subtitle: 'Accelerate lookup speeds from full table scans to microsecond B-Tree searches.',
    difficulty: 'Advanced',
    estimatedMinutes: 30,
    prerequisites: ['Intermediate and Advanced SQL (Module 8)'],
    objectives: [
      'Understand how MySQL B-Tree indexes work behind the scenes.',
      'Differentiate Primary, Unique, Composite, and Regular Secondary indexes.',
      'Create and drop indexes with CREATE INDEX and DROP INDEX.',
      'Understand the trade-offs: faster SELECT queries vs slower INSERT/UPDATE writes.'
    ],
    content: {
      introduction: 'Imagine looking for a topic in a 1,000-page book without an index: you would have to scan every single page from start to finish (a Full Table Scan). With an alphabetical index at the back, you jump straight to page 412 in 2 seconds. In MySQL, indexes provide the exact same superpower for your queries.',
      coreConcepts: [
        {
          title: 'The B-Tree Data Structure',
          body: 'By default, MySQL InnoDB builds balanced search trees (B-Trees). A B-Tree allows MySQL to find any record among millions of rows in just 3 or 4 disk seeks (O(log N) complexity) rather than scanning all N rows (O(N) complexity).'
        },
        {
          title: 'Composite (Multi-Column) Indexes and Left-Prefix Rule',
          body: 'An index on `(last_name, first_name)` accelerates queries filtering by `last_name`, or filtering by both `last_name AND first_name`. However, due to the Leftmost Prefix requirement, it cannot accelerate a query that filters ONLY by `first_name`.'
        },
        {
          title: 'The Index Trade-Off',
          body: 'Indexes are not free! Every index occupies disk space and RAM (InnoDB buffer pool). Furthermore, whenever you `INSERT`, `UPDATE`, or `DELETE`, MySQL must update all associated B-Trees. Never index every column indiscriminately.'
        }
      ],
      sqlSyntax: `-- Create a secondary index on an email column:
CREATE INDEX idx_customers_email 
ON customers(email);

-- Create a composite index for customer lookup:
CREATE INDEX idx_customers_name 
ON customers(last_name, first_name);

-- Create a unique index (enforces uniqueness + accelerates search):
CREATE UNIQUE INDEX idx_employees_phone 
ON employees(phone);

-- Inspect all existing indexes on a table:
SHOW INDEX FROM customers;

-- Drop an index when no longer needed:
DROP INDEX idx_customers_email ON customers;`,
      explanation: [
        '`CREATE INDEX idx_customers_email ON customers(email)`: Tells InnoDB to build an auxiliary B-Tree index keyed on email.',
        '`SHOW INDEX FROM customers`: Shows index names, uniqueness, cardinality (distinctness estimate), and column order.',
        'Primary keys are automatically indexed as the Clustered Index (data rows are physically organized by PK).'
      ],
      sampleBeforeAfter: {
        table: 'Index Performance Comparison (1,000,000 Rows)',
        before: [
          { method: 'Without Index (Full Table Scan)', rows_scanned: '1,000,000 rows', duration: '350 ms' }
        ],
        after: [
          { method: 'With B-Tree Index', rows_scanned: '1 row', duration: '0.4 ms (875x faster)' }
        ]
      },
      commonMistakes: [
        'Wrapping indexed columns in functions in WHERE (e.g. `WHERE YEAR(order_date) = 2026` invalidates the index! Write `WHERE order_date >= \'2026-01-01\' AND order_date < \'2027-01-01\'` instead).',
        'Creating duplicate or redundant indexes (e.g., creating an index on `(A)` when you already have `(A, B)`).',
        'Over-indexing write-heavy logging tables, crippling insert throughput.'
      ],
      practiceExercise: {
        instructions: 'Write the SQL statement to create an index named `idx_products_price` on the `price` column of the `products` table.',
        defaultCode: 'CREATE INDEX idx_products_price ON products(price);',
        solution: 'CREATE INDEX idx_products_price ON products(price);',
        hint: 'Use `CREATE INDEX idx_products_price ON products(price);`'
      },
      quiz: {
        question: 'Why does writing "WHERE LOWER(email) = \'user@email.com\'" prevent MySQL from using a standard index on the email column?',
        options: [
          'Because LOWER is only available in SQLite.',
          'Because applying a function to the column forces MySQL to evaluate every single row, bypassing the pre-computed B-Tree index.',
          'MySQL cannot index text strings.',
          'The query will produce a syntax error.'
        ],
        correctIndex: 1,
        explanation: 'Applying a function or computation to an indexed column prevents the optimizer from doing a direct B-Tree range scan (unless a generated/functional index is explicitly defined).'
      }
    }
  },
  {
    id: 'mysql-lesson-50',
    track: 'mysql',
    moduleId: 'mysql-mod-9',
    moduleTitle: 'Module 9: Professional Database Skills',
    lessonNumber: 50,
    title: 'EXPLAIN and Basic Query Optimization',
    subtitle: 'Read execution plans to detect slow queries and optimize database bottlenecks.',
    difficulty: 'Advanced',
    estimatedMinutes: 30,
    prerequisites: ['Indexes and Query Performance (Lesson 49)'],
    objectives: [
      'Prepend EXPLAIN to any SELECT query to inspect MySQL execution plans.',
      'Understand the "type" column: ALL (bad) vs ref/eq_ref/const (good).',
      'Examine "possible_keys", "key", and "rows" examined.',
      'Use EXPLAIN FORMAT=TREE or EXPLAIN ANALYZE for deep profiling in MySQL 8.0.'
    ],
    content: {
      introduction: 'How do you know why a query is taking 5 seconds? You do not guess—you ask MySQL\'s Query Optimizer using `EXPLAIN`. EXPLAIN displays the exact step-by-step roadmap MySQL intends to use to execute your query.',
      coreConcepts: [
        {
          title: 'The Critical Columns of EXPLAIN',
          body: '- `type`: Access method. Ranked from worst to best:\n  * `ALL`: Full table scan (terrible on large tables)\n  * `index`: Full index scan\n  * `range`: Index range scan (e.g. BETWEEN, >, <)\n  * `ref`: Non-unique index lookup\n  * `eq_ref`: Unique index lookup in a join (fast)\n  * `const`: Primary key exact match (instantaneous)\n- `key`: The actual index MySQL chose to use.\n- `rows`: Estimated number of rows MySQL expects to read.\n- `Extra`: Important flags like `Using filesort` or `Using temporary` (performance warning signs).'
        },
        {
          title: 'EXPLAIN ANALYZE in MySQL 8.0',
          body: 'Running `EXPLAIN ANALYZE SELECT ...` actually executes the query and compares the optimizer’s estimated plan against actual execution times and row counts at each node of the execution tree.'
        }
      ],
      sqlSyntax: `-- Inspect execution plan for an order lookup:
EXPLAIN SELECT * 
FROM orders 
WHERE customer_id = 1;

-- Detailed tree plan in MySQL 8.0+:
EXPLAIN FORMAT=TREE 
SELECT 
    c.first_name, 
    COUNT(o.order_id)
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
WHERE c.customer_id = 1
GROUP BY c.first_name;`,
      explanation: [
        'Prefix any SELECT statement with `EXPLAIN` to view the plan.',
        'If `type` shows `ALL` and `rows` is large, an index is missing.',
        'If `key` shows `NULL`, no index was chosen.',
        'Check `Extra`: `Using filesort` means MySQL had to sort rows in memory/disk because no index supported the ORDER BY.'
      ],
      sampleBeforeAfter: {
        table: 'EXPLAIN Plan Interpretation',
        before: [
          { type: 'ALL', key: 'NULL', rows: '500,000', verdict: 'DANGER: Scanning every row on disk' }
        ],
        after: [
          { type: 'ref', key: 'idx_customer_id', rows: '3', verdict: 'EXCELLENT: Instant B-Tree seek' }
        ]
      },
      commonMistakes: [
        'Ignoring `Using filesort` on large paginated endpoints, causing server CPU spikes.',
        'Assuming a query is fast just because it ran quickly on a local development database with only 10 rows (always test or EXPLAIN with production-scale data).',
        'Not checking the `rows` column (the smaller the number of rows examined, the faster the query).'
      ],
      practiceExercise: {
        instructions: 'Run an EXPLAIN query in `ecommerce_db` to inspect how MySQL plans to execute `SELECT * FROM products WHERE price > 50;`.',
        defaultCode: 'EXPLAIN SELECT * FROM products WHERE price > 50;',
        solution: 'EXPLAIN SELECT * FROM products WHERE price > 50;',
        hint: 'Type `EXPLAIN SELECT * FROM products WHERE price > 50;` to view the plan columns.'
      },
      quiz: {
        question: 'What access "type" in an EXPLAIN output indicates that MySQL is scanning the entire table without using an index?',
        options: [
          'const',
          'eq_ref',
          'ALL',
          'ref'
        ],
        correctIndex: 2,
        explanation: 'The access type `ALL` represents a Full Table Scan, where MySQL must examine every row in the table.'
      }
    }
  },
  {
    id: 'mysql-lesson-51',
    track: 'mysql',
    moduleId: 'mysql-mod-9',
    moduleTitle: 'Module 9: Professional Database Skills',
    lessonNumber: 51,
    title: 'Transactions: START TRANSACTION, COMMIT, and ROLLBACK',
    subtitle: 'Group multiple SQL operations into an all-or-nothing atomic unit of work.',
    difficulty: 'Advanced',
    estimatedMinutes: 30,
    prerequisites: ['EXPLAIN and Query Optimization (Lesson 50)'],
    objectives: [
      'Understand what a database transaction is and why it prevents data corruption.',
      'Control transactions with START TRANSACTION, COMMIT, and ROLLBACK.',
      'Master the classic bank transfer scenario (preventing lost money).',
      'Understand autocommit mode in MySQL.'
    ],
    content: {
      introduction: 'Imagine transferring $100 from Account A to Account B. This requires two queries: 1. Deduct $100 from A. 2. Add $100 to B. What happens if the server crashes or power fails between query 1 and query 2? Account A lost $100, and Account B never got it! Transactions solve this by guaranteeing all-or-nothing execution.',
      coreConcepts: [
        {
          title: 'The Core Transaction Commands',
          body: '- `START TRANSACTION` (or `BEGIN`): Begins a new transaction block.\n- `COMMIT`: Saves all modifications made during the transaction permanently to disk.\n- `ROLLBACK`: Discards all modifications made during the transaction, restoring the database to its exact pre-transaction state.'
        },
        {
          title: 'Autocommit in MySQL',
          body: 'By default, MySQL runs with `autocommit = 1`, meaning every single standalone SQL statement is immediately committed on execution. When you issue `START TRANSACTION`, autocommit is temporarily suspended until you run `COMMIT` or `ROLLBACK`.'
        },
        {
          title: 'Savepoints',
          body: 'Within a long transaction, you can set `SAVEPOINT name;` and later `ROLLBACK TO name;` to undo only a partial section of work without abandoning the entire transaction.'
        }
      ],
      sqlSyntax: `-- Classic Bank Transfer Transaction:
START TRANSACTION;

-- Step 1: Deduct $100 from sender Alice
UPDATE bank_accounts 
SET balance = balance - 100.00 
WHERE account_id = 1 AND balance >= 100.00;

-- Step 2: Add $100 to recipient Bob
UPDATE bank_accounts 
SET balance = balance + 100.00 
WHERE account_id = 2;

-- If both steps succeed without error:
COMMIT;

-- In case of failure or balance check error in application code:
-- ROLLBACK;`,
      explanation: [
        '`START TRANSACTION`: Suspends autocommit. Changes are visible inside the session but not finalized.',
        '`UPDATE bank_accounts ...`: Modifies records under row locks.',
        '`COMMIT`: Atomically writes the changes into the redo log and flushes to disk. Both balances update simultaneously.',
        '`ROLLBACK`: If anything fails, calling ROLLBACK guarantees no money vanishes into thin air.'
      ],
      sampleBeforeAfter: {
        table: 'Transaction Rollback Safety',
        before: [
          { step: 'START TRANSACTION', balance_alice: 500, balance_bob: 200 },
          { step: 'Deduct $100 from Alice', balance_alice: 400, balance_bob: 200 },
          { step: 'Network Failure occurs!', status: 'Error' }
        ],
        after: [
          { action: 'ROLLBACK executed', balance_alice: 500, balance_bob: 200, result: '100% Data Integrity Preserved' }
        ]
      },
      commonMistakes: [
        'Running DDL commands like `CREATE TABLE` or `ALTER TABLE` inside a transaction (In MySQL, DDL causes an implicit, irreversible COMMIT!).',
        'Leaving transactions open indefinitely in application code, holding row locks and causing lock wait timeouts for other users.',
        'Using storage engines like MyISAM that do not support transactions (always use InnoDB).'
      ],
      practiceExercise: {
        instructions: 'Practice starting a transaction in SQL. Begin a transaction, update an employee salary, and then rollback the change.',
        defaultCode: 'START TRANSACTION;\nUPDATE employees SET salary = salary + 1000 WHERE employee_id = 1;\nROLLBACK;',
        solution: 'START TRANSACTION;\nUPDATE employees SET salary = salary + 1000 WHERE employee_id = 1;\nROLLBACK;',
        hint: 'Use START TRANSACTION followed by UPDATE and then ROLLBACK.'
      },
      quiz: {
        question: 'What happens to the changes made during a transaction if a ROLLBACK statement is executed?',
        options: [
          'They are saved to a temporary table.',
          'All changes made since START TRANSACTION are discarded and the database reverts to its previous state.',
          'Only the last INSERT statement is undone.',
          'MySQL prompts the administrator for confirmation.'
        ],
        correctIndex: 1,
        explanation: 'ROLLBACK cancels all uncommitted modifications made during the transaction, restoring full integrity.'
      }
    }
  },
  {
    id: 'mysql-lesson-52',
    track: 'mysql',
    moduleId: 'mysql-mod-9',
    moduleTitle: 'Module 9: Professional Database Skills',
    lessonNumber: 52,
    title: 'ACID Properties Explained with Real-World Examples',
    subtitle: 'Understand Atomicity, Consistency, Isolation, and Durability in enterprise systems.',
    difficulty: 'Advanced',
    estimatedMinutes: 30,
    prerequisites: ['Transactions: START TRANSACTION, COMMIT, ROLLBACK (Lesson 51)'],
    objectives: [
      'Deeply understand the four pillars of ACID.',
      'Explain Atomicity with all-or-nothing execution.',
      'Explain Consistency with integrity constraints and business rules.',
      'Explain Isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable).',
      'Explain Durability with the write-ahead redo log (WAL).'
    ],
    content: {
      introduction: 'For a database to be trusted with financial records, medical histories, or mission-critical transactions, it must adhere to the ACID principles. ACID is the gold standard benchmark of relational reliability.',
      coreConcepts: [
        {
          title: 'A - Atomicity (All or Nothing)',
          body: 'A transaction is treated as a single indivisible unit. Either all operations succeed and commit, or if even a single statement fails, the entire transaction is rolled back. No partial state is ever allowed.'
        },
        {
          title: 'C - Consistency (Valid State to Valid State)',
          body: 'A transaction must take the database from one valid state to another, maintaining all defined constraints (foreign keys, NOT NULL, CHECK, UNIQUE). If a transaction would violate any rule, MySQL rejects it.'
        },
        {
          title: 'I - Isolation (Concurrent Transactions Do Not Interfere)',
          body: 'Multiple transactions can execute simultaneously without seeing each other\'s uncommitted half-finished work. MySQL InnoDB default is REPEATABLE READ, preventing "Dirty Reads" and "Non-Repeatable Reads".'
        },
        {
          title: 'D - Durability (Permanent Once Committed)',
          body: 'Once a transaction is committed, its effects are permanent, even if power is abruptly cut 1 millisecond later. InnoDB achieves this using Write-Ahead Logging (the Redo Log).'
        }
      ],
      sqlSyntax: `-- Inspecting and setting Transaction Isolation Levels in MySQL:
-- Check current global and session isolation level:
SELECT @@transaction_isolation;

-- Set isolation level for current session:
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
-- Options:
-- 1. READ UNCOMMITTED (Allows dirty reads)
-- 2. READ COMMITTED (Common in web apps)
-- 3. REPEATABLE READ (MySQL InnoDB default)
-- 4. SERIALIZABLE (Strictest, full locking)`,
      explanation: [
        '`SELECT @@transaction_isolation`: In MySQL 8.0, shows default `REPEATABLE-READ`.',
        'REPEATABLE READ ensures that if your query reads row 5 at the start of a transaction, reading it again 10 seconds later returns the exact same snapshot, even if another user updated and committed it in the meantime.'
      ],
      sampleBeforeAfter: {
        table: 'ACID Summary Table',
        before: [
          { letter: 'A', name: 'Atomicity', guarantee: 'All or nothing execution' },
          { letter: 'C', name: 'Consistency', guarantee: 'No broken constraints or corrupt schemas' }
        ],
        after: [
          { letter: 'I', name: 'Isolation', guarantee: 'Concurrent sessions do not corrupt each other' },
          { letter: 'D', name: 'Durability', guarantee: 'Committed data survives power failure and crashes' }
        ]
      },
      commonMistakes: [
        'Confusing Consistency (database-level rules) with application-level validation.',
        'Setting isolation to SERIALIZABLE everywhere (destroys concurrent user performance through heavy table and range locking).',
        'Assuming MySQL memory buffers mean data is vulnerable to crashes (the write-ahead redo log guarantees durability).'
      ],
      practiceExercise: {
        instructions: 'Check the default MySQL transaction isolation level using `SELECT @@transaction_isolation;`.',
        defaultCode: 'SELECT @@transaction_isolation;',
        solution: 'SELECT @@transaction_isolation;',
        hint: 'Run `SELECT @@transaction_isolation;`.'
      },
      quiz: {
        question: 'Which ACID property guarantees that once a transaction commits, its changes will never be lost even in a hardware power outage?',
        options: [
          'Atomicity',
          'Consistency',
          'Isolation',
          'Durability'
        ],
        correctIndex: 3,
        explanation: 'Durability ensures committed data is written to non-volatile disk/redo logs and survives crashes.'
      }
    }
  },
  {
    id: 'mysql-lesson-53',
    track: 'mysql',
    moduleId: 'mysql-mod-9',
    moduleTitle: 'Module 9: Professional Database Skills',
    lessonNumber: 53,
    title: 'Views, Stored Procedures, and User-Defined Functions',
    subtitle: 'Encapsulate complex SQL queries and business logic inside the database engine.',
    difficulty: 'Advanced',
    estimatedMinutes: 30,
    prerequisites: ['ACID Properties Explained (Lesson 52)'],
    objectives: [
      'Create and query SQL VIEWs (virtual saved queries) for security and simplification.',
      'Differentiate between Views, Stored Procedures, and Stored Functions.',
      'Write Stored Procedures with IN and OUT parameters and DELIMITER syntax.',
      'Understand when to use stored procedures vs keeping logic in the application layer.'
    ],
    content: {
      introduction: 'As systems expand, writing a 50-line query with 4 joins over and over in your backend code is wasteful and error-prone. Database objects like Views, Stored Procedures, and Stored Functions allow you to encapsulate and reuse SQL logic directly on the database server.',
      coreConcepts: [
        {
          title: 'What is a VIEW?',
          body: 'A VIEW is a saved SELECT query that behaves like a virtual table. It stores NO physical data of its own—every time you query the view, MySQL runs the underlying query dynamically. Views provide abstraction and security (e.g. exposing a view of `employees` that excludes sensitive `salary` and `ssn` columns).'
        },
        {
          title: 'What is a Stored Procedure?',
          body: 'A Stored Procedure is a subroutine stored in the database that can accept input parameters (`IN`), return output values (`OUT`), execute control-flow logic (`IF`, `LOOP`), and perform `INSERT`/`UPDATE` modifications.'
        },
        {
          title: 'The DELIMITER Command',
          body: 'In MySQL, statements normally end with `;`. When writing a procedure with multiple internal semicolons, you must temporarily change the delimiter (e.g. `DELIMITER //`) so MySQL does not terminate the definition early.'
        }
      ],
      sqlSyntax: `-- 1. Create a Secure View (Virtual Table):
CREATE VIEW v_public_employees AS
SELECT 
    e.employee_id,
    e.first_name,
    e.last_name,
    e.job_title,
    d.department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id;

-- Query the view just like a regular table:
SELECT * FROM v_public_employees WHERE department_name = 'Engineering';

-- 2. Stored Procedure with Parameters:
DELIMITER //

CREATE PROCEDURE sp_get_department_payroll(
    IN p_dept_id INT,
    OUT p_total_payroll DECIMAL(10, 2)
)
BEGIN
    SELECT SUM(salary) INTO p_total_payroll
    FROM employees
    WHERE department_id = p_dept_id;
END //

DELIMITER ;

-- Call the procedure:
CALL sp_get_department_payroll(1, @total);
SELECT @total;`,
      explanation: [
        '`CREATE VIEW`: Creates a clean reusable abstraction layer.',
        '`DELIMITER //`: Temporarily reassigns the statement ender to `//` so the procedure body compiles cleanly.',
        '`IN p_dept_id INT`: Input parameter passed by the caller.',
        '`OUT p_total_payroll`: Return parameter populated via `SELECT ... INTO`.'
      ],
      sampleBeforeAfter: {
        table: 'Database Encapsulation Tools',
        before: [
          { tool: 'View', purpose: 'Saved virtual SELECT; no parameters; great for security filters' }
        ],
        after: [
          { tool: 'Stored Procedure', purpose: 'Callable batch logic with parameters, loops, and transaction control' }
        ]
      },
      commonMistakes: [
        'Assuming a standard VIEW caches data physically (it does NOT; it re-executes the query every time).',
        'Forgetting to reset `DELIMITER ;` after creating a stored procedure in MySQL CLI.',
        'Putting complex business logic exclusively in stored procedures, making version control and automated CI/CD testing difficult.'
      ],
      practiceExercise: {
        instructions: 'Write the SQL command to create a view called `v_high_value_products` selecting all products with price > 100.',
        defaultCode: 'CREATE VIEW v_high_value_products AS\nSELECT product_id, product_name, price\nFROM products\nWHERE price > 100;',
        solution: 'CREATE VIEW v_high_value_products AS\nSELECT product_id, product_name, price\nFROM products\nWHERE price > 100;',
        hint: 'Use `CREATE VIEW v_high_value_products AS SELECT ... FROM products WHERE price > 100;`'
      },
      quiz: {
        question: 'Does a standard MySQL VIEW duplicate and store a separate copy of physical table data on disk?',
        options: [
          'Yes, it creates a second copy of all rows.',
          'No, a view is a virtual table that executes its underlying SELECT query dynamically whenever queried.',
          'Only if the table has more than 10,000 rows.',
          'Yes, but only the primary keys.'
        ],
        correctIndex: 1,
        explanation: 'A view does not store data rows on disk; it acts as a saved query template evaluated at runtime.'
      }
    }
  },
  {
    id: 'mysql-lesson-54',
    track: 'mysql',
    moduleId: 'mysql-mod-9',
    moduleTitle: 'Module 9: Professional Database Skills',
    lessonNumber: 54,
    title: 'Triggers, Events, and Database Automation',
    subtitle: 'Automate audit logging, data validation, and scheduled background database maintenance.',
    difficulty: 'Advanced',
    estimatedMinutes: 30,
    prerequisites: ['Views and Stored Procedures (Lesson 53)'],
    objectives: [
      'Understand what Triggers are and when they execute (BEFORE/AFTER INSERT/UPDATE/DELETE).',
      'Use the OLD and NEW pseudo-records inside trigger bodies.',
      'Build an automated audit logging system for security and compliance.',
      'Schedule automated maintenance with the MySQL Event Scheduler.'
    ],
    content: {
      introduction: 'How can you guarantee that every time an employee\'s salary is modified, an audit record is created capturing who changed it, the exact timestamp, the old salary, and the new salary? You cannot rely on application developers never forgetting to write an audit log. A database TRIGGER guarantees it runs every time at the storage engine level.',
      coreConcepts: [
        {
          title: 'What is a Trigger?',
          body: 'A TRIGGER is a named database object that automatically executes in response to a specified event (`INSERT`, `UPDATE`, or `DELETE`) on a particular table. It can fire `BEFORE` the change (e.g. for validation/modification) or `AFTER` the change (e.g. for auditing).'
        },
        {
          title: 'The OLD and NEW Pseudo-Records',
          body: '- `NEW`: Refers to the newly inserted or updated column values.\n- `OLD`: Refers to the existing column values before an update or delete.\n- `INSERT` only has `NEW`.\n- `DELETE` only has `OLD`.\n- `UPDATE` has both `OLD` and `NEW`.'
        },
        {
          title: 'The MySQL Event Scheduler',
          body: 'MySQL has a built-in cron-like background task runner called the Event Scheduler (`CREATE EVENT ... ON SCHEDULE EVERY 1 DAY DO ...`). Used for archiving old records, refreshing cached metrics, and purging expired sessions.'
        }
      ],
      sqlSyntax: `-- Step 1: Create an Audit Table
CREATE TABLE salary_audit_log (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    old_salary DECIMAL(10, 2),
    new_salary DECIMAL(10, 2),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create AFTER UPDATE Trigger
DELIMITER //

CREATE TRIGGER trg_audit_salary_update
AFTER UPDATE ON employees
FOR EACH ROW
BEGIN
    -- Only log if the salary actually changed
    IF OLD.salary <> NEW.salary THEN
        INSERT INTO salary_audit_log (employee_id, old_salary, new_salary)
        VALUES (OLD.employee_id, OLD.salary, NEW.salary);
    END IF;
END //

DELIMITER ;

-- Drop a trigger when obsolete:
-- DROP TRIGGER IF EXISTS trg_audit_salary_update;`,
      explanation: [
        '`AFTER UPDATE ON employees`: The trigger fires automatically immediately after any row in `employees` is updated.',
        '`FOR EACH ROW`: Ensures the trigger executes for every single row affected by the UPDATE statement.',
        '`IF OLD.salary <> NEW.salary`: Compares the pre-update value (`OLD.salary`) with the new incoming value (`NEW.salary`).',
        'No application code can ever bypass this audit trail.'
      ],
      sampleBeforeAfter: {
        table: 'Trigger Audit Trail in Action',
        before: [
          { action: 'UPDATE employees SET salary = 105000 WHERE employee_id = 1;', old: '$95,000' }
        ],
        after: [
          { audit_table: 'salary_audit_log', employee_id: 1, old_salary: 95000, new_salary: 105000, timestamp: '2026-10-14 10:45:00' }
        ]
      },
      commonMistakes: [
        'Attempting to update the same table the trigger is attached to from within an AFTER trigger (causes infinite recursive loops).',
        'Overusing triggers for core business logic, creating "invisible magic" that surprises and confuses backend developers.',
        'Not checking if `event_scheduler` is enabled (`SET GLOBAL event_scheduler = ON;`).'
      ],
      practiceExercise: {
        instructions: 'Inspect the syntax of triggers. Which pseudo-record is used in an INSERT trigger to access the incoming row data?',
        defaultCode: 'SELECT "NEW represents incoming rows in an INSERT trigger" AS trigger_rule;',
        solution: 'SELECT "NEW represents incoming rows in an INSERT trigger" AS trigger_rule;',
        hint: 'NEW holds new values; OLD holds previous values.'
      },
      quiz: {
        question: 'Inside an AFTER UPDATE trigger on an orders table, how do you reference the previous status before the update took place?',
        options: [
          'PREV.status',
          'OLD.status',
          'NEW.status',
          'BEFORE.status'
        ],
        correctIndex: 1,
        explanation: 'In MySQL triggers, `OLD.column_name` references the existing value prior to the update or deletion.'
      }
    }
  }
];
