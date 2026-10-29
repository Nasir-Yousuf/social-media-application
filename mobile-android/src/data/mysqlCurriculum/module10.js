// Module 10: Security, Reliability, and Projects (Lessons 55-60)

export const module10Lessons = [
  {
    id: 'mysql-lesson-55',
    track: 'mysql',
    moduleId: 'mysql-mod-10',
    moduleTitle: 'Module 10: Security, Reliability, and Projects',
    lessonNumber: 55,
    title: 'Database Users, Roles, and Permissions',
    subtitle: 'Enforce the Principle of Least Privilege with CREATE USER, GRANT, and REVOKE.',
    difficulty: 'Advanced',
    estimatedMinutes: 25,
    prerequisites: ['Professional Database Skills (Module 9)'],
    objectives: [
      'Understand why applications must never connect as root in production.',
      'Create secure users with host-scoped accounts (`user`@`host`).',
      'Grant granular permissions (SELECT, INSERT, UPDATE, DELETE) on specific databases.',
      'Manage modern database roles in MySQL 8.0+.'
    ],
    content: {
      introduction: 'A common beginner mistake is configuring a backend web application with the MySQL `root` user and full administrative privileges. If an attacker discovers an SQL injection or server flaw, they now control your entire operating system! In this lesson, you will master MySQL User Management and Role-Based Access Control (RBAC).',
      coreConcepts: [
        {
          title: 'Account Identification: User and Host',
          body: "In MySQL, an account is defined as `'username'@'hostname'`. For example, `'app_user'@'localhost'` can ONLY log in from the local server machine. `'app_user'@'%'` can log in from any remote IP address (less secure)."
        },
        {
          title: 'The Principle of Least Privilege',
          body: 'Grant each user or service only the absolute minimum permissions needed to fulfill its role. A reporting dashboard user only needs `SELECT`. An e-commerce backend needs `SELECT, INSERT, UPDATE, DELETE` on its database, but never `DROP DATABASE` or `GRANT OPTION`.'
        },
        {
          title: 'Roles in MySQL 8.0',
          body: 'A Role is a named collection of privileges (e.g. `role_developer`, `role_analyst`). Instead of granting 10 privileges individually to 50 developers, you grant permissions to the role, and assign the role to users.'
        }
      ],
      sqlSyntax: `-- Step 1: Create a secure application user restricted to localhost
CREATE USER 'clearfeed_app'@'localhost' 
IDENTIFIED BY 'StrongP@ssw0rd!2026';

-- Step 2: Grant least-privilege permissions on a specific database
GRANT SELECT, INSERT, UPDATE, DELETE 
ON ecommerce_db.* 
TO 'clearfeed_app'@'localhost';

-- Step 3: Create a read-only reporting user for data analysts
CREATE USER 'analyst_bob'@'%' 
IDENTIFIED BY 'AnalystSecret#2026';

GRANT SELECT 
ON ecommerce_db.* 
TO 'analyst_bob'@'%';

-- Step 4: Inspect active permissions
SHOW GRANTS FOR 'clearfeed_app'@'localhost';

-- Step 5: Revoke a permission if needed
REVOKE DELETE ON ecommerce_db.* FROM 'clearfeed_app'@'localhost';

-- Flush privilege cache:
FLUSH PRIVILEGES;`,
      explanation: [
        '`CREATE USER ... IDENTIFIED BY`: Sets up a bcrypt/caching_sha2_password authentication record.',
        '`GRANT SELECT, INSERT, UPDATE, DELETE ON ecommerce_db.*`: Restricts access to the tables inside `ecommerce_db` only. The user cannot see or alter other databases.',
        '`SHOW GRANTS FOR`: Audits current permission assignments.',
        '`FLUSH PRIVILEGES`: Reloads the grant tables from the `mysql` system schema into memory.'
      ],
      sampleBeforeAfter: {
        table: 'Security Architecture Comparison',
        before: [
          { configuration: 'App connected as root with 123456 password', risk: 'FATAL: Full server compromise possible' }
        ],
        after: [
          { configuration: 'App connected as clearfeed_app with scoped DML rights on local socket', risk: 'SECURE: Least-privilege isolated access' }
        ]
      },
      commonMistakes: [
        'Granting `ALL PRIVILEGES ON *.*` to application users.',
        'Hardcoding database passwords in public GitHub repositories (always use environment variables like `DB_PASSWORD`).',
        'Using weak passwords that fail MySQL\'s `validate_password` component.'
      ],
      practiceExercise: {
        instructions: 'Inspect the standard syntax for creating a dedicated user and granting SELECT privileges on `ecommerce_db` to that user.',
        defaultCode: 'SELECT "GRANT SELECT ON ecommerce_db.* TO \'analyst\'@\'localhost\';" AS secure_grant_template;',
        solution: 'SELECT "GRANT SELECT ON ecommerce_db.* TO \'analyst\'@\'localhost\';" AS secure_grant_template;',
        hint: 'Examine the GRANT SELECT syntax.'
      },
      quiz: {
        question: 'Why should a web application never connect to MySQL using the root account?',
        options: [
          'Because the root account is restricted to 10 queries per minute.',
          'Because if the app has a vulnerability, the attacker obtains full administrative control to read, drop, or destroy all databases.',
          'MySQL disables the root account automatically.',
          'Root accounts cannot run SELECT queries.'
        ],
        correctIndex: 1,
        explanation: 'Following least privilege prevents an application breach from compromising the entire server and other hosted databases.'
      }
    }
  },
  {
    id: 'mysql-lesson-56',
    track: 'mysql',
    moduleId: 'mysql-mod-10',
    moduleTitle: 'Module 10: Security, Reliability, and Projects',
    lessonNumber: 56,
    title: 'SQL Injection and Parameterized Queries',
    subtitle: 'Understand the #1 database vulnerability and protect applications using prepared statements.',
    difficulty: 'Advanced',
    estimatedMinutes: 30,
    prerequisites: ['Database Users and Permissions (Lesson 55)'],
    objectives: [
      'Understand how SQL Injection (SQLi) attacks occur through raw string concatenation.',
      'Analyze the classic "\' OR \'1\'=\'1" authentication bypass payload.',
      'Implement Prepared Statements and Parameterized Queries in backend languages (Node.js/Express, Python).',
      'Understand why database credentials must never exist in client-side code.'
    ],
    content: {
      introduction: 'SQL Injection has topped the OWASP Top 10 vulnerabilities list for two decades. It occurs when untrusted user input is directly concatenated into a raw SQL query string, allowing an attacker to manipulate the query structure itself and dump, modify, or delete your entire database.',
      coreConcepts: [
        {
          title: 'The Mechanism of SQL Injection',
          body: 'Consider this vulnerable backend code:\n`query = "SELECT * FROM users WHERE email = \'" + userInput + "\' AND password = \'" + pass + "\'"`\nIf the attacker inputs `admin@site.com\' --` for the email, the resulting SQL becomes:\n`SELECT * FROM users WHERE email = \'admin@site.com\' -- \' AND password = \'...\'`\nThe `--` comments out the rest of the query, logging in as admin with NO password!'
        },
        {
          title: 'The Permanent Solution: Parameterized Queries (Prepared Statements)',
          body: 'With Prepared Statements, the database compiles the SQL query structure FIRST using placeholder markers (`?` or `$1`). The database then accepts user inputs strictly as literal data parameters. Even if the user enters `"\' OR \'1\'=\'1"`, the database treats it as a literal string value, rendering injection mathematically impossible.'
        },
        {
          title: 'Frontend vs Backend Architecture Rule',
          body: 'Web browsers must NEVER talk directly to MySQL or contain database passwords. The browser talks over HTTPS to your backend API (e.g. Node.js/Express), and the backend securely connects to MySQL using server-side environment variables.'
        }
      ],
      sqlSyntax: `-- 1. Raw MySQL Prepared Statement Syntax:
PREPARE stmt_user_lookup FROM 
    'SELECT user_id, email, full_name FROM users WHERE email = ?';

SET @email_input = 'student@clearfeed.com';
EXECUTE stmt_user_lookup USING @email_input;
DEALLOCATE PREPARE stmt_user_lookup;

-- 2. Modern Node.js (mysql2/promise) Backend Code Example:
-- const [rows] = await db.execute(
--   'SELECT user_id, email, full_name FROM users WHERE email = ? AND status = ?',
--   [userEmail, 'active']
-- );`,
      explanation: [
        'Notice the `?` placeholder in `WHERE email = ?`.',
        'The query optimizer prepares the AST (Abstract Syntax Tree) before parameters are bound.',
        'User input can NEVER alter the query syntax structure.',
        'Always use parameterized libraries in your backend.'
      ],
      sampleBeforeAfter: {
        table: 'Vulnerable vs Secure Code',
        before: [
          { type: 'Raw String Concatenation', code: '`SELECT * FROM users WHERE email = \'${req.body.email}\'`', safety: 'CRITICAL VULNERABILITY (SQLi)' }
        ],
        after: [
          { type: 'Parameterized Query', code: '`db.execute("SELECT * FROM users WHERE email = ?", [email])`', safety: '100% IMMUNE TO SQL INJECTION' }
        ]
      },
      commonMistakes: [
        'Trying to escape quotes with regex or manual blacklist filters (attackers consistently bypass manual string sanitizers; parameterized queries are required).',
        'Putting database connection strings with passwords inside frontend React code or `.env` files committed to Git.',
        'Using stored procedures with `EXECUTE IMMEDIATE` and concatenated strings (which re-introduces SQLi inside the procedure).'
      ],
      practiceExercise: {
        instructions: 'Inspect the prepared statement query. Notice how the question mark `?` acts as a parameterized placeholder for safe input binding.',
        defaultCode: 'SELECT "Use prepared statements with ? placeholders to prevent SQL Injection" AS best_practice;',
        solution: 'SELECT "Use prepared statements with ? placeholders to prevent SQL Injection" AS best_practice;',
        hint: 'Parameterized queries guarantee input values cannot alter SQL syntax.'
      },
      quiz: {
        question: 'Why do parameterized queries (prepared statements) completely prevent SQL Injection?',
        options: [
          'Because they convert all letters to uppercase.',
          'Because the database compiles the SQL structure first, treating user input strictly as literal values rather than executable code.',
          'Because they run queries twice.',
          'Because MySQL automatically deletes single quotes.'
        ],
        correctIndex: 1,
        explanation: 'Separating query compilation from parameter binding ensures that input data can never alter the syntactic structure of the query.'
      }
    }
  },
  {
    id: 'mysql-lesson-57',
    track: 'mysql',
    moduleId: 'mysql-mod-10',
    moduleTitle: 'Module 10: Security, Reliability, and Projects',
    lessonNumber: 57,
    title: 'Backup, Restore, and Data Import/Export',
    subtitle: 'Protect your organization against disaster with mysqldump, logical backups, and CSV pipelines.',
    difficulty: 'Advanced',
    estimatedMinutes: 25,
    prerequisites: ['SQL Injection and Parameterized Queries (Lesson 56)'],
    objectives: [
      'Master the mysqldump CLI utility for logical backups.',
      'Backup single databases, multiple databases, or specific tables.',
      'Restore databases from SQL dump files safely.',
      'Export and import data using LOAD DATA INFILE and CSV formats.'
    ],
    content: {
      introduction: 'Hardware fails, data centers flood, and human error happens. A company with no database backups is one mistake away from going out of business. In this lesson, you will learn how to create automated logical backups with `mysqldump` and restore them with confidence.',
      coreConcepts: [
        {
          title: 'Logical Backups with mysqldump',
          body: '`mysqldump` is a command-line tool bundled with MySQL. It inspects your database and generates a plain-text `.sql` file containing all the `CREATE TABLE` and `INSERT INTO` statements needed to recreate the entire database from scratch.'
        },
        {
          title: 'Physical Backups vs Logical Backups',
          body: '- `Logical Backup (mysqldump)`: Portable, human-readable SQL text file. Best for small to medium databases (< 100 GB).\n- `Physical Backup (MySQL Enterprise Backup, Percona XtraBackup)`: Direct binary copy of InnoDB data and log files. Instantaneous restore for multi-terabyte enterprise databases.'
        },
        {
          title: 'Importing Bulk Data with LOAD DATA INFILE',
          body: 'Inserting 1 million rows one by one with `INSERT` takes minutes. `LOAD DATA INFILE` reads raw CSV files directly into tables in seconds, making it up to 20x faster.'
        }
      ],
      sqlSyntax: `# --- Terminal / Command Prompt Commands (CLI, not MySQL prompt) ---

# 1. Backup a single database to a compressed SQL file:
mysqldump -u clearfeed_app -p --single-transaction --quick ecommerce_db > ecommerce_backup.sql

# 2. Backup all databases on the server:
mysqldump -u root -p --all-databases > full_server_backup.sql

# 3. Restore a database from a backup file:
mysql -u clearfeed_app -p ecommerce_db < ecommerce_backup.sql

# --- SQL Commands for CSV Import/Export ---
-- Export table to CSV:
SELECT * INTO OUTFILE '/var/lib/mysql-files/products.csv'
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
FROM products;

-- Import CSV into table:
LOAD DATA INFILE '/var/lib/mysql-files/products.csv'
INTO TABLE products
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n';`,
      explanation: [
        '`--single-transaction`: Crucial flag for InnoDB! Creates a snapshot backup without locking tables or interrupting active users.',
        '`--quick`: Forces mysqldump to stream rows directly rather than buffering entire tables in RAM.',
        '`mysql -u user -p db < file.sql`: Restores the database by piping the SQL script back into the engine.'
      ],
      sampleBeforeAfter: {
        table: 'Backup Operations',
        before: [
          { action: 'mysqldump command', input: 'Live production database', output: 'ecommerce_backup.sql' }
        ],
        after: [
          { action: 'mysql restore command', input: 'ecommerce_backup.sql', output: 'Fully restored database with all tables and rows' }
        ]
      },
      commonMistakes: [
        'Running mysqldump on InnoDB tables without `--single-transaction` (locks all tables, freezing web application users during the backup).',
        'Never testing the restore process (a backup that has never been tested is not a real backup!).',
        'Storing backups on the exact same hard drive as the database server.'
      ],
      practiceExercise: {
        instructions: 'Check the syntax for restoring a backup file. Which command-line symbol pipes a backup SQL file into MySQL?',
        defaultCode: 'SELECT "The < redirect operator pipes backup SQL files into the mysql CLI" AS restore_lesson;',
        solution: 'SELECT "The < redirect operator pipes backup SQL files into the mysql CLI" AS restore_lesson;',
        hint: 'Use `mysql -u user -p database_name < backup.sql`.'
      },
      quiz: {
        question: 'Why is the --single-transaction flag essential when using mysqldump on InnoDB tables in production?',
        options: [
          'It deletes the original database after backing up.',
          'It creates a consistent point-in-time snapshot without acquiring global table locks that block active web traffic.',
          'It converts all tables to SQLite.',
          'It doubles the disk write speed.'
        ],
        correctIndex: 1,
        explanation: 'InnoDB MVCC (Multi-Version Concurrency Control) allows mysqldump to read a consistent snapshot while users continue reading and writing.'
      }
    }
  },
  {
    id: 'mysql-lesson-58',
    track: 'mysql',
    moduleId: 'mysql-mod-10',
    moduleTitle: 'Module 10: Security, Reliability, and Projects',
    lessonNumber: 58,
    title: 'Database Security, Reliability, and Production Best Practices',
    subtitle: 'Checklist for hardening, connection pooling, monitoring, and replication.',
    difficulty: 'Advanced',
    estimatedMinutes: 30,
    prerequisites: ['Backup and Restore (Lesson 57)'],
    objectives: [
      'Master the Production Hardening Checklist for MySQL.',
      'Configure connection pooling in backend applications (avoiding connection storms).',
      'Understand Read/Write splitting with Primary-Replica (Master-Slave) replication.',
      'Monitor health metrics: Slow Query Log, CPU, Buffer Pool Hit Rate.'
    ],
    content: {
      introduction: 'Taking a database from development to production requires more than writing good SQL. You must secure the network port, configure connection pools, monitor the Slow Query Log, and understand how databases scale with replication.',
      coreConcepts: [
        {
          title: 'The Production Hardening Checklist',
          body: '1. Change default root password and disable remote root login (`mysql_secure_installation`).\n2. Bind MySQL to local loopback (`bind-address = 127.0.0.1`) or private VPC subnet (never expose port 3306 to the public internet).\n3. Enforce TLS/SSL encryption for in-transit database connections.\n4. Remove the default `test` database and anonymous user accounts.'
        },
        {
          title: 'Connection Pooling',
          body: 'Opening a new TCP/TLS connection to MySQL for every incoming HTTP request consumes 50-100ms and heavy server memory. A Connection Pool keeps a warm set of reusable database connections open, serving requests in < 1ms.'
        },
        {
          title: 'Primary-Replica Replication and Read Scaling',
          body: 'In heavy traffic systems (e.g. social networks), 95% of queries are `SELECT` reads and only 5% are writes. By setting up MySQL Replication, all `INSERT/UPDATE` queries go to the Primary (Master) database, while reads are distributed across multiple Read Replicas.'
        }
      ],
      sqlSyntax: `-- Enabling and configuring the Slow Query Log:
-- Checks for queries taking longer than 2 seconds:
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2.0;
SET GLOBAL log_queries_not_using_indexes = 'ON';

-- Inspecting InnoDB Buffer Pool Hit Ratio (Target > 99%):
SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_read%';

-- Check active running threads / queries:
SHOW PROCESSLIST;`,
      explanation: [
        '`slow_query_log = ON`: Directs MySQL to record any slow queries to a log file for profiling.',
        '`long_query_time = 2.0`: Queries exceeding 2 seconds are flagged.',
        '`SHOW PROCESSLIST`: Displays all currently executing queries and connected client IPs.'
      ],
      sampleBeforeAfter: {
        table: 'Production Architecture',
        before: [
          { architecture: 'Single database handling all reads and writes directly exposed on public IP', status: 'Fragile, Single Point of Failure' }
        ],
        after: [
          { architecture: 'Private VPC + Connection Pooling + Primary/Replica Read Splitting + Automated Backups', status: 'Enterprise Production Grade' }
        ]
      },
      commonMistakes: [
        'Exposing port 3306 directly to the public internet without firewall or VPN protection.',
        'Setting connection pool sizes to 1,000+ connections (overwhelms CPU context switching; 20-50 connections is optimal for most node servers).',
        'Not checking the Slow Query Log regularly.'
      ],
      practiceExercise: {
        instructions: 'Run `SHOW PROCESSLIST;` to inspect currently running threads and client connections.',
        defaultCode: 'SHOW PROCESSLIST;',
        solution: 'SHOW PROCESSLIST;',
        hint: 'Type `SHOW PROCESSLIST;`.'
      },
      quiz: {
        question: 'What is the primary performance benefit of using a Connection Pool in a backend application?',
        options: [
          'It automatically fixes SQL syntax errors.',
          'It reuses existing open database connections, eliminating the high latency and overhead of repeatedly opening and closing TCP/TLS handshakes.',
          'It creates backup copies on Google Drive.',
          'It allows clients to bypass passwords.'
        ],
        correctIndex: 1,
        explanation: 'Connection pooling drastically reduces overhead by reusing established database connections across concurrent web requests.'
      }
    }
  },
  {
    id: 'mysql-lesson-59',
    track: 'mysql',
    moduleId: 'mysql-mod-10',
    moduleTitle: 'Module 10: Security, Reliability, and Projects',
    lessonNumber: 59,
    title: 'Final Project: Build an E-Commerce Database',
    subtitle: 'Design, build, populate, and query an enterprise relational schema from scratch.',
    difficulty: 'Advanced',
    estimatedMinutes: 40,
    prerequisites: ['Database Security and Reliability (Lesson 58)'],
    objectives: [
      'Synthesize all course knowledge into an end-to-end production database project.',
      'Design normalized tables: Categories, Products, Customers, Orders, Order Items.',
      'Apply Primary Keys, Foreign Keys, AUTO_INCREMENT, and Constraints.',
      'Write multi-table revenue queries, sales analytics, and customer loyalty reports.'
    ],
    content: {
      introduction: 'Congratulations on reaching the capstone project! You are tasked with architecting the foundational database schema for a fast-growing e-commerce platform. You will implement the complete relational data model, insert realistic test data, and write executive-level business analytics queries.',
      coreConcepts: [
        {
          title: 'Project Architecture Overview',
          body: 'The database consists of 5 interconnected tables:\n1. `categories`: Product classifications.\n2. `products`: Catalog items with prices, stock, and category foreign keys.\n3. `customers`: Registered users with contact details.\n4. `orders`: High-level purchase receipts with customer foreign keys.\n5. `order_items`: Line-item breakdown linking orders and products (M:N junction).'
        },
        {
          title: 'Required Business Queries',
          body: 'Once built, the schema must power:\n- Inventory management (finding low-stock items).\n- Sales reporting (total revenue by category and month).\n- Customer lifetime value (top-spending VIP clients).'
        }
      ],
      sqlSyntax: `-- Capstone Business Query: Top Selling Categories with Revenue & Order Metrics
SELECT 
    c.category_name,
    COUNT(DISTINCT p.product_id) AS catalog_size,
    SUM(oi.quantity) AS total_units_sold,
    SUM(oi.quantity * oi.unit_price) AS total_category_revenue,
    ROUND(AVG(oi.unit_price), 2) AS avg_item_sale_price
FROM categories c
INNER JOIN products p ON c.category_id = p.category_id
INNER JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY c.category_id, c.category_name
ORDER BY total_category_revenue DESC;`,
      explanation: [
        'Notice how the query traverses across 3 tables cleanly.',
        '`COUNT(DISTINCT p.product_id)`: Accurately counts unique products sold per category without duplication.',
        '`SUM(oi.quantity * oi.unit_price)`: Calculates actual revenue based on line items.',
        'This represents standard production e-commerce analytics.'
      ],
      sampleBeforeAfter: {
        table: 'Capstone Schema Relational Map',
        before: [
          { table: 'customers', connects_to: 'orders (1:N)' },
          { table: 'orders', connects_to: 'order_items (1:N)' }
        ],
        after: [
          { table: 'order_items', connects_to: 'products (N:1)' },
          { table: 'products', connects_to: 'categories (N:1)' }
        ]
      },
      commonMistakes: [
        'Not checking for negative quantities or prices (always add CHECK constraints like `CHECK (price >= 0)`).',
        'Forgetting indexes on foreign key columns.',
        'Relying on current product prices instead of preserving unit_price in order line items.'
      ],
      practiceExercise: {
        instructions: 'Run the executive category sales query in `ecommerce_db` to analyze total units sold and revenue per category.',
        defaultCode: 'SELECT c.category_name, SUM(oi.quantity) AS total_units, SUM(oi.quantity * oi.unit_price) AS total_revenue\nFROM categories c\nINNER JOIN products p ON c.category_id = p.category_id\nINNER JOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY c.category_id, c.category_name\nORDER BY total_revenue DESC;',
        solution: 'SELECT c.category_name, SUM(oi.quantity) AS total_units, SUM(oi.quantity * oi.unit_price) AS total_revenue\nFROM categories c\nINNER JOIN products p ON c.category_id = p.category_id\nINNER JOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY c.category_id, c.category_name\nORDER BY total_revenue DESC;',
        hint: 'Execute the query to view category revenues.'
      },
      quiz: {
        question: 'In our e-commerce schema, which table acts as the junction table resolving the Many-to-Many relationship between orders and products?',
        options: [
          'categories',
          'customers',
          'order_items',
          'inventory'
        ],
        correctIndex: 2,
        explanation: 'The order_items table connects orders to products, storing the quantity and purchase unit_price for each item.'
      }
    }
  },
  {
    id: 'mysql-lesson-60',
    track: 'mysql',
    moduleId: 'mysql-mod-10',
    moduleTitle: 'Module 10: Security, Reliability, and Projects',
    lessonNumber: 60,
    title: 'Final Assessment: Advanced SQL Challenge and Course Review',
    subtitle: 'Comprehensive review of the 60-lesson curriculum and final graduation challenge.',
    difficulty: 'Advanced',
    estimatedMinutes: 45,
    prerequisites: ['Final Project: Build an E-Commerce Database (Lesson 59)'],
    objectives: [
      'Review key milestones across all 10 modules: DDL, DML, Joins, Aggregation, CTEs, Window Functions, and ACID.',
      'Solve a comprehensive multi-step SQL challenge.',
      'Understand next steps in database engineering (sharding, distributed SQL, NoSQL integration).',
      'Earn your Clearfeed MySQL Mastery course completion badge!'
    ],
    content: {
      introduction: 'Congratulations on completing this extensive 60-lesson journey through MySQL Mastery! You began with the basic anatomy of rows and columns and progressed all the way through advanced database architecture, query optimization, ACID transactions, and enterprise security.',
      coreConcepts: [
        {
          title: 'The Complete 10-Module Journey',
          body: '1. Database Fundamentals: Structured data, tables, records, schemas.\n2. SQL Fundamentals: Datatypes, CREATE, INSERT, SELECT.\n3. Filtering and Sorting: WHERE, operators, NULLs, ORDER BY, LIMIT.\n4. Changing Data: UPDATE, DELETE, ALTER, constraints, PKs.\n5. Relationships & Normalization: 1:1, 1:N, M:N, 1NF-3NF.\n6. Joins: INNER, LEFT, RIGHT, CROSS, Self Joins.\n7. Aggregation & Subqueries: GROUP BY, HAVING, EXISTS.\n8. Advanced SQL: CASE, CTEs, Window functions.\n9. Professional Skills: Indexes, EXPLAIN, Transactions, ACID, Views, Triggers.\n10. Security & Projects: RBAC, SQL Injection defense, Backups, Capstone.'
        },
        {
          title: 'The Final SQL Challenge',
          body: 'Write a comprehensive query that identifies the top customer in terms of spending, shows their total orders, their average order value, and their latest order date.'
        }
      ],
      sqlSyntax: `-- The Graduation Master Query:
-- Comprehensive Customer Lifetime Value & Recency Analysis
SELECT 
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.email,
    COUNT(o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0.00) AS lifetime_value,
    COALESCE(ROUND(AVG(o.total_amount), 2), 0.00) AS avg_order_value,
    MAX(o.order_date) AS most_recent_order
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name, c.email
ORDER BY lifetime_value DESC
LIMIT 5;`,
      explanation: [
        'Uses `LEFT JOIN` to guarantee customers with zero orders are still analyzed.',
        '`COALESCE(..., 0.00)` replaces NULL values with zero for clean presentation.',
        '`COUNT(o.order_id)` accurately tallies orders.',
        '`MAX(o.order_date)` identifies the customer\'s most recent purchase date.',
        '`ORDER BY lifetime_value DESC LIMIT 5`: Surfaces the top 5 highest-value clients.'
      ],
      sampleBeforeAfter: {
        table: 'Course Milestone Summary',
        before: [
          { skill: 'Lesson 1', description: 'What is a table and row?' }
        ],
        after: [
          { skill: 'Lesson 60', description: 'Full-stack relational architecture, performance tuning, and enterprise SQL analytics' }
        ]
      },
      commonMistakes: [
        'Stopping your learning journey here—database engineering is a continuous craft.',
        'Neglecting to backup databases in production.',
        'Forgetting that well-indexed, normalized databases outperform bloated un-indexed tables by thousands of times.'
      ],
      practiceExercise: {
        instructions: 'Run the graduation query on `ecommerce_db` to inspect the top customer accounts by lifetime value.',
        defaultCode: 'SELECT c.customer_id, c.first_name, c.last_name, COUNT(o.order_id) AS orders, SUM(o.total_amount) AS total_spent\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.first_name, c.last_name\nORDER BY total_spent DESC;',
        solution: 'SELECT c.customer_id, c.first_name, c.last_name, COUNT(o.order_id) AS orders, SUM(o.total_amount) AS total_spent\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.first_name, c.last_name\nORDER BY total_spent DESC;',
        hint: 'Run the query to graduate from the course!'
      },
      quiz: {
        question: 'Which clause in SQL executes after grouping to filter summarized aggregate buckets?',
        options: [
          'WHERE',
          'ORDER BY',
          'HAVING',
          'LIMIT'
        ],
        correctIndex: 2,
        explanation: 'HAVING filters aggregate summary buckets after the GROUP BY operation has occurred.'
      }
    }
  }
];
