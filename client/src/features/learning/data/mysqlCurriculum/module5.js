// Module 5: Relationships and Database Design (Lessons 25-30)

export const module5Lessons = [
  {
    id: 'mysql-lesson-25',
    track: 'mysql',
    moduleId: 'mysql-mod-5',
    moduleTitle: 'Module 5: Relationships and Database Design',
    lessonNumber: 25,
    title: 'Understanding Relational Databases',
    subtitle: 'Why we divide data into separate related tables instead of keeping everything in one giant spreadsheet.',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    prerequisites: ['Primary Keys and Constraints (Lesson 24)'],
    objectives: [
      'Understand why single-table data storage causes data redundancy and update anomalies.',
      'Learn how the relational model connects separate entities via shared keys.',
      'Explore real-world examples: E-commerce, School Management, and Social Networks.',
      'Identify Parent (Primary) and Child (Foreign) tables.'
    ],
    content: {
      introduction: 'In spreadsheets like Excel, beginners often dump all information—customer names, addresses, product titles, prices, and shipping statuses—into one giant table. As business grows, this becomes an unmaintainable nightmare. Relational databases solve this by splitting distinct entities into their own tables and linking them together with keys.',
      coreConcepts: [
        {
          title: 'The Flat File Dilemma: Redundancy and Anomalies',
          body: 'If a customer places 50 orders and changes their address, in a flat single table you would have to update 50 rows. If you miss one, your data becomes corrupt (an Update Anomaly). If you delete an order, you might accidentally delete the customer’s entire profile (a Delete Anomaly). Relational design keeps Customer details in one table and Orders in another.'
        },
        {
          title: 'The Relational Model Foundation',
          body: 'Formulated by E.F. Codd at IBM, the relational model represents data as tables (relations) of rows (tuples) and columns (attributes). Relationships between tables are formed by storing the identifier (Primary Key) of one table as an attribute in another table.'
        },
        {
          title: 'Parent vs Child Tables',
          body: 'The table that owns the primary record is called the Parent table (e.g., `customers`). The table that references the parent record is called the Child table (e.g., `orders`). A child row cannot exist meaningfully without pointing to a valid parent row.'
        }
      ],
      sqlSyntax: `-- Visualizing relational separation:
-- 1. Parent Table: Stores unique customer identity
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50),
    email VARCHAR(100) UNIQUE
);

-- 2. Child Table: Stores orders, referencing customer_id
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10,2)
);`,
      explanation: [
        'Notice how `orders` does NOT duplicate `first_name` or `email`.',
        'It only stores `customer_id`. Whenever we need the customer\'s name, we perform a SQL JOIN query.',
        'If the customer updates their email address, we change exactly ONE row in the `customers` table.'
      ],
      sampleBeforeAfter: {
        table: 'Relational Entity Split',
        before: [
          { order_id: 101, customer: 'Alice', email: 'alice@email.com', product: 'Laptop', price: '$1200' },
          { order_id: 102, customer: 'Alice', email: 'alice@email.com', product: 'Mouse', price: '$25' }
        ],
        after: [
          { entity: 'customers', id: 1, name: 'Alice', email: 'alice@email.com' },
          { entity: 'orders', id: 101, customer_id: 1, amount: '$1200' },
          { entity: 'orders', id: 102, customer_id: 1, amount: '$25' }
        ]
      },
      commonMistakes: [
        'Duplicating human details (like home address, phone number) inside transaction tables.',
        'Trying to link tables using mutable strings like first names rather than stable, immutable integer IDs.',
        'Over-normalizing simple lookup values that never change or have no distinct entity identity.'
      ],
      practiceExercise: {
        instructions: 'Query the `customers` table to see customers, and then inspect `orders` to see how `customer_id` links orders back to customers.',
        defaultCode: 'SELECT customer_id, first_name, email FROM customers;\nSELECT order_id, customer_id, total_amount, status FROM orders;',
        solution: 'SELECT customer_id, first_name, email FROM customers;\nSELECT order_id, customer_id, total_amount, status FROM orders;',
        hint: 'Execute the queries to observe how orders hold a reference (customer_id) rather than repeating names and emails.'
      },
      quiz: {
        question: 'What is a major problem with storing customer addresses repeatedly in an orders table?',
        options: [
          'It is illegal in SQL syntax.',
          'Updating the customer address requires updating multiple rows, risking data inconsistency (update anomaly).',
          'MySQL cannot store VARCHAR fields in orders tables.',
          'Primary keys become disabled.'
        ],
        correctIndex: 1,
        explanation: 'Repeating data causes update anomalies—if a user moves and you miss updating any previous order record, address information becomes inconsistent.'
      }
    }
  },
  {
    id: 'mysql-lesson-26',
    track: 'mysql',
    moduleId: 'mysql-mod-5',
    moduleTitle: 'Module 5: Relationships and Database Design',
    lessonNumber: 26,
    title: 'Foreign Keys and Referential Integrity',
    subtitle: 'Enforcing database-level rules with FOREIGN KEY constraints and CASCADE actions.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisites: ['Understanding Relational Databases (Lesson 25)'],
    objectives: [
      'Define a FOREIGN KEY constraint in MySQL.',
      'Understand referential integrity: preventing orphan records.',
      'Master ON DELETE CASCADE, ON DELETE SET NULL, and RESTRICT.',
      'Learn how to inspect and drop existing foreign key constraints.'
    ],
    content: {
      introduction: 'Just having a column named `customer_id` in `orders` is not enough. Without a Foreign Key constraint, a developer or bug could insert an order for `customer_id = 99999` when no such customer exists! Foreign Keys guarantee referential integrity at the database storage engine level.',
      coreConcepts: [
        {
          title: 'What is a Foreign Key?',
          body: 'A FOREIGN KEY is a column (or collection of columns) in one table that refers to the PRIMARY KEY in another table. MySQL guarantees that any value placed into the foreign key column must either exist in the parent table or be NULL.'
        },
        {
          title: 'Referential Actions: ON DELETE and ON UPDATE',
          body: 'What happens to orders when a customer deletes their account? MySQL lets you choose:\n- `CASCADE`: Deleting parent automatically deletes corresponding child rows.\n- `RESTRICT` / `NO ACTION`: MySQL blocks deleting parent if child rows exist (Default safe choice).\n- `SET NULL`: MySQL sets child foreign key to NULL if parent is deleted.'
        },
        {
          title: 'Storage Engine Requirement: InnoDB',
          body: 'Foreign keys are enforced by MySQL\'s default storage engine, InnoDB. Older engines like MyISAM silently ignore FOREIGN KEY definitions without throwing an error.'
        }
      ],
      sqlSyntax: `CREATE TABLE enrollments (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    grade VARCHAR(2),
    CONSTRAINT fk_enrollments_student
        FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_enrollments_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);`,
      explanation: [
        '`CONSTRAINT fk_enrollments_student`: Best practice is giving your foreign key a clear descriptive name.',
        '`FOREIGN KEY (student_id) REFERENCES students(student_id)`: Binds child column `student_id` to parent primary key.',
        '`ON DELETE CASCADE`: If student #5 is deleted, all their enrollment records are safely purged automatically.',
        '`ON DELETE RESTRICT`: You cannot delete a course while students are actively enrolled in it.'
      ],
      sampleBeforeAfter: {
        table: 'Orphan Prevention',
        before: [
          { action: 'INSERT INTO orders (customer_id, total) VALUES (9999, 50.00)', status: 'Allowed without FK (Data Corruption!)' }
        ],
        after: [
          { action: 'INSERT INTO orders (customer_id, total) VALUES (9999, 50.00)', status: 'ERROR 1452: Cannot add or update child row: a foreign key constraint fails' }
        ]
      },
      commonMistakes: [
        'Mismatching data types: Foreign key and referenced primary key MUST have identical data types (e.g., both `INT UNSIGNED`).',
        'Trying to delete a parent table before dropping child tables referencing it.',
        'Using ON DELETE CASCADE recklessly on financial transaction tables (financial logs should never be cascade deleted).'
      ],
      practiceExercise: {
        instructions: 'Check the enrollments in `university_db` where both student_id and course_id act as foreign keys linking students to courses.',
        defaultCode: 'SELECT enrollment_id, student_id, course_id, grade FROM enrollments LIMIT 5;',
        solution: 'SELECT enrollment_id, student_id, course_id, grade FROM enrollments LIMIT 5;',
        hint: 'Notice each enrollment links one student to one course using their respective ID foreign keys.'
      },
      quiz: {
        question: 'What happens when you define ON DELETE RESTRICT on a foreign key and attempt to delete the parent record while child records exist?',
        options: [
          'MySQL deletes the child rows first, then deletes the parent.',
          'MySQL sets the child foreign key columns to 0.',
          'MySQL rejects the delete operation and throws an error to preserve integrity.',
          'MySQL renames the parent record.'
        ],
        correctIndex: 2,
        explanation: 'ON DELETE RESTRICT prevents the deletion of a parent record as long as any child record references it.'
      }
    }
  },
  {
    id: 'mysql-lesson-27',
    track: 'mysql',
    moduleId: 'mysql-mod-5',
    moduleTitle: 'Module 5: Relationships and Database Design',
    lessonNumber: 27,
    title: 'Cardinality: One-to-One, One-to-Many, and Many-to-Many',
    subtitle: 'Understanding the three cardinal relationship types and how to structure them in tables.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisites: ['Foreign Keys and Referential Integrity (Lesson 26)'],
    objectives: [
      'Master One-to-One (1:1) relationships and their valid use cases.',
      'Master One-to-Many (1:N) relationships: the most common relationship in databases.',
      'Master Many-to-Many (M:N) relationships and why junction/bridge tables are required.',
      'Design foreign key placements for each relationship type.'
    ],
    content: {
      introduction: 'Database relationships describe how records in one table relate numerically to records in another table. Understanding cardinality (1:1, 1:N, M:N) is the single most critical skill in relational schema design.',
      coreConcepts: [
        {
          title: '1. One-to-One (1:1)',
          body: 'Each row in Table A can relate to at most one row in Table B, and vice versa. Examples: `users` and `user_profiles`, or `employees` and `parking_permits`. Implemented by placing a FOREIGN KEY in Table B with a UNIQUE constraint.'
        },
        {
          title: '2. One-to-Many (1:N)',
          body: 'A single row in Table A relates to many rows in Table B, but each row in Table B relates to only one row in Table A. Examples: One `department` has many `employees`; one `customer` has many `orders`. Implemented by placing the parent ID as a FOREIGN KEY in the child table.'
        },
        {
          title: '3. Many-to-Many (M:N)',
          body: 'A row in Table A can relate to many rows in Table B, AND a row in Table B can relate to many rows in Table A. Examples: `students` and `courses` (a student attends multiple courses; a course has multiple students); `products` and `orders`. Implemented using a Bridge/Junction table.'
        }
      ],
      sqlSyntax: `-- 1:1 Implementation: user_profiles references users
CREATE TABLE user_profiles (
    user_id INT PRIMARY KEY,
    bio TEXT,
    avatar_url VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 1:N Implementation: orders table has customer_id
-- (One customer, Many orders)
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);`,
      explanation: [
        'Notice that in 1:1, `user_id` can be both the PRIMARY KEY and the FOREIGN KEY simultaneously.',
        'In 1:N, the foreign key ALWAYS lives on the "Many" side table (Child table).',
        'Never place an array or comma-separated list of IDs in a single column! That violates First Normal Form.'
      ],
      sampleBeforeAfter: {
        table: 'Cardinality Summary',
        before: [
          { relationship: '1:1', example: 'User <-> UserProfile', fk_placement: 'Child table PK is also the FK' },
          { relationship: '1:N', example: 'Customer <-> Orders', fk_placement: 'FK placed on child table (Orders)' }
        ],
        after: [
          { relationship: 'M:N', example: 'Students <-> Courses', fk_placement: 'Requires a separate Junction Table (Enrollments)' }
        ]
      },
      commonMistakes: [
        'Storing comma-separated IDs (e.g. `course_ids: "1,4,7"`) in a single column instead of building a junction table.',
        'Placing the foreign key on the "One" side of a 1:N relationship.',
        'Creating a 1:1 relationship when the data could simply be stored as columns directly in the parent table without performance or security reasons.'
      ],
      practiceExercise: {
        instructions: 'Inspect the 1-to-Many relationship in `company_db`: View departments and see how employees reference their `department_id`.',
        defaultCode: 'SELECT department_id, department_name FROM departments;\nSELECT employee_id, first_name, last_name, department_id FROM employees LIMIT 6;',
        solution: 'SELECT department_id, department_name FROM departments;\nSELECT employee_id, first_name, last_name, department_id FROM employees LIMIT 6;',
        hint: 'Each employee points to a single department_id, but a department can have multiple employees.'
      },
      quiz: {
        question: 'In a One-to-Many relationship between Authors and Books (one author writes many books), where does the foreign key belong?',
        options: [
          'In the Authors table.',
          'In the Books table referencing the Authors table.',
          'In both tables simultaneously.',
          'In a third junction table.'
        ],
        correctIndex: 1,
        explanation: 'In a 1:N relationship, the foreign key always belongs on the "Many" side (the Books table, holding `author_id`).'
      }
    }
  },
  {
    id: 'mysql-lesson-28',
    track: 'mysql',
    moduleId: 'mysql-mod-5',
    moduleTitle: 'Module 5: Relationships and Database Design',
    lessonNumber: 28,
    title: 'Designing Junction Tables for Many-to-Many Relationships',
    subtitle: 'Connecting two entities with bridge tables, composite primary keys, and relationship attributes.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisites: ['Cardinality: 1:1, 1:N, M:N (Lesson 27)'],
    objectives: [
      'Understand why relational databases cannot directly model M:N without an intermediary table.',
      'Create junction tables (also known as associative, bridge, or link tables).',
      'Choose between composite primary keys vs surrogate AUTO_INCREMENT keys on junction tables.',
      'Store relationship-specific attributes (e.g., enrollment_date, quantity, unit_price).'
    ],
    content: {
      introduction: 'How do you model an online store where an Order can contain 10 different Products, and a single Product can be included in thousands of Orders? You cannot put `order_id` in `products`, nor can you put `product_id` in `orders`. The solution is a Junction Table that breaks one M:N relationship into two 1:N relationships.',
      coreConcepts: [
        {
          title: 'The Junction Table Concept',
          body: 'A junction table sits between Table A and Table B. It contains foreign keys referencing both tables:\n- `Table A (1)` <---> `(N) Junction Table (N)` <---> `(1) Table B`.\nFor example, `order_items` connects `orders` and `products`.'
        },
        {
          title: 'Composite Primary Keys on Junction Tables',
          body: 'To ensure a student cannot be enrolled in the exact same course twice, we can create a COMPOSITE primary key combining both foreign keys: `PRIMARY KEY (student_id, course_id)`.'
        },
        {
          title: 'Payload (Relationship) Attributes',
          body: 'Junction tables often store data that belongs to the relationship itself rather than either entity. For example, `quantity` and `price_at_purchase` belong to `order_items`, not `products` or `orders`.'
        }
      ],
      sqlSyntax: `-- Modeling M:N between orders and products:
CREATE TABLE order_items (
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
);`,
      explanation: [
        '`PRIMARY KEY (order_id, product_id)`: Guarantees that product #4 cannot appear multiple times as separate rows in order #101.',
        '`unit_price DECIMAL(10,2)`: Captures the historical price at the moment of order placement. If the product price changes later in `products`, the order receipt remains accurate.'
      ],
      sampleBeforeAfter: {
        table: 'E-Commerce M:N Junction Example',
        before: [
          { order_id: 1, customer_id: 10, total: '$1499.98' },
          { product_id: 1, product_name: 'Laptop Pro 15', current_price: '$1299.99' },
          { product_id: 3, product_name: 'Wireless Mouse', current_price: '$29.99' }
        ],
        after: [
          { junction_table: 'order_items', order_id: 1, product_id: 1, qty: 1, unit_price: '$1299.99' },
          { junction_table: 'order_items', order_id: 1, product_id: 3, qty: 2, unit_price: '$29.99' }
        ]
      },
      commonMistakes: [
        'Not storing historical purchase price in order_items (relying on current product price ruins historical accounting).',
        'Forgetting foreign key constraints on the junction table, leading to ghost references when items or orders are removed.',
        'Allowing duplicate pair entries because a composite primary key or UNIQUE constraint was forgotten.'
      ],
      practiceExercise: {
        instructions: 'Query the `order_items` junction table in `ecommerce_db` to see how it pairs `order_id` and `product_id` with `quantity` and `unit_price`.',
        defaultCode: 'SELECT order_id, product_id, quantity, unit_price FROM order_items ORDER BY order_id LIMIT 6;',
        solution: 'SELECT order_id, product_id, quantity, unit_price FROM order_items ORDER BY order_id LIMIT 6;',
        hint: 'Examine how multiple product_ids belong to the same order_id.'
      },
      quiz: {
        question: 'Why does an order_items table record the unit_price of a product when the products table already has a price column?',
        options: [
          'Because MySQL requires all decimal columns to be duplicated.',
          'To preserve the historical price at the time of purchase in case the product price changes in the future.',
          'To speed up arithmetic operations.',
          'Because foreign keys cannot read prices.'
        ],
        correctIndex: 1,
        explanation: 'Product catalog prices change over time; order line items must freeze the exact price agreed upon at checkout.'
      }
    }
  },
  {
    id: 'mysql-lesson-29',
    track: 'mysql',
    moduleId: 'mysql-mod-5',
    moduleTitle: 'Module 5: Relationships and Database Design',
    lessonNumber: 29,
    title: 'Database Normalization: 1NF, 2NF, and 3NF',
    subtitle: 'Streamlining database schemas by eliminating redundancy and dependency flaws.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisites: ['Designing Junction Tables (Lesson 28)'],
    objectives: [
      'Understand the goals of database normalization.',
      'Achieve First Normal Form (1NF): Atomic columns and unique identifiers.',
      'Achieve Second Normal Form (2NF): Eliminating partial functional dependencies.',
      'Achieve Third Normal Form (3NF): Eliminating transitive dependencies.'
    ],
    content: {
      introduction: 'Normalization is a systematic technique for organizing data in relational databases to reduce redundant data and avoid data modification anomalies. We will study the three foundational forms: 1NF, 2NF, and 3NF.',
      coreConcepts: [
        {
          title: 'First Normal Form (1NF): Atomicity',
          body: 'A table is in 1NF if:\n1. Each column contains only atomic (indivisible) values (no arrays or comma-delimited lists like `"Math, English"` in one field).\n2. No repeating groups of columns (e.g., `phone1`, `phone2`, `phone3`).\n3. The table has a designated primary key.'
        },
        {
          title: 'Second Normal Form (2NF): Full Functional Dependency',
          body: 'A table is in 2NF if:\n1. It is already in 1NF.\n2. All non-key columns depend on the ENTIRE primary key, not just a portion of a composite key. If a column depends only on one half of a composite key, it must move to its own table.'
        },
        {
          title: 'Third Normal Form (3NF): No Transitive Dependencies',
          body: 'A table is in 3NF if:\n1. It is already in 2NF.\n2. No non-key column depends on another non-key column (A -> B -> C). For example, if a table has `zip_code` and `city_name`, having `city_name` depends on `zip_code`, not directly on `user_id`. Move zip codes and cities into a lookup table.'
        }
      ],
      sqlSyntax: `-- Unnormalized Table (Violates 1NF):
-- student_id | name        | courses
-- 1          | John Smith  | "CS101, MATH201"

-- In 1NF, 2NF, and 3NF:
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50),
    last_name VARCHAR(50)
);

CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course_title VARCHAR(100),
    credits INT
);

CREATE TABLE enrollments (
    student_id INT,
    course_id INT,
    enrollment_date DATE,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);`,
      explanation: [
        'Notice how splitting into three tables completely satisfies 1NF, 2NF, and 3NF.',
        '`courses` details live only in `courses`.',
        'Student details live only in `students`.',
        'The relationship lives strictly in `enrollments`.'
      ],
      sampleBeforeAfter: {
        table: 'Normalization Progression',
        before: [
          { form: 'Unnormalized', issue: 'Multiple course names packed into one text field.' },
          { form: '1NF', issue: 'Atomic fields, but repeating teacher names on every student row.' }
        ],
        after: [
          { form: '2NF', solution: 'Eliminated partial dependencies on composite keys.' },
          { form: '3NF', solution: 'Eliminated transitive dependencies (No non-key columns determining other non-key columns).' }
        ]
      },
      commonMistakes: [
        'Over-normalizing simple reporting systems (leading to 12 joins for a basic query when a simple denormalized column would suffice).',
        'Storing calculated values that can be computed on the fly (e.g., storing `age` when you already have `date_of_birth`).',
        'Failing 1NF by putting JSON or comma-separated strings into columns when relational filtering is needed.'
      ],
      practiceExercise: {
        instructions: 'Check the normalized `students` table in `university_db` to verify that first_name and last_name are kept atomic and clean.',
        defaultCode: 'SELECT student_id, first_name, last_name, gpa, enrollment_date FROM students;',
        solution: 'SELECT student_id, first_name, last_name, gpa, enrollment_date FROM students;',
        hint: 'Observe that there are no comma-separated fields or duplicated course catalogs here.'
      },
      quiz: {
        question: 'Which normal form is violated if a table contains a column holding a comma-separated list of telephone numbers?',
        options: [
          'Second Normal Form (2NF)',
          'First Normal Form (1NF)',
          'Third Normal Form (3NF)',
          'Fourth Normal Form (4NF)'
        ],
        correctIndex: 1,
        explanation: 'First Normal Form (1NF) strictly requires all column values to be atomic (indivisible).'
      }
    }
  },
  {
    id: 'mysql-lesson-30',
    track: 'mysql',
    moduleId: 'mysql-mod-5',
    moduleTitle: 'Module 5: Relationships and Database Design',
    lessonNumber: 30,
    title: 'Database Design Mini-Project: Students, Courses, and Enrollments',
    subtitle: 'Apply relational modeling, foreign keys, and normalization to build a university enrollment schema.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisites: ['Normalization: 1NF, 2NF, 3NF (Lesson 29)'],
    objectives: [
      'Design an end-to-end relational schema from business requirements.',
      'Create Parent tables with primary keys, constraints, and sensible datatypes.',
      'Create Child/Junction tables with cascading referential integrity.',
      'Populate test datasets and verify relational queries.'
    ],
    content: {
      introduction: 'In this mini-project, we translate a real-world specification into a fully normalized, professional database schema. You are hired by a university to design their core registration system: Students, Instructors, Courses, and Student Enrollments.',
      coreConcepts: [
        {
          title: 'Requirement Specification',
          body: '1. Each student has an ID, full name, email, and enrollment date.\n2. Each course has a course code (e.g. CS101), course title, and credits.\n3. Students can enroll in multiple courses, and courses have multiple students (M:N).\n4. Each enrollment must record the semester, enrollment date, and letter grade.'
        },
        {
          title: 'Schema Architecture (ER Model)',
          body: 'We identify three primary tables:\n- `students` (Parent Entity)\n- `courses` (Parent Entity)\n- `enrollments` (Junction Table linking students and courses)\nForeign keys enforce that an enrollment cannot exist for a non-existent student or course.'
        }
      ],
      sqlSyntax: `-- Step 1: Create Students Table
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    gpa DECIMAL(3, 2) DEFAULT 0.00
);

-- Step 2: Create Courses Table
CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(10) UNIQUE NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    credits INT NOT NULL DEFAULT 3
);

-- Step 3: Create Enrollments Table
CREATE TABLE enrollments (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    grade VARCHAR(2),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE RESTRICT,
    UNIQUE KEY uq_student_course (student_id, course_id)
);`,
      explanation: [
        '`email VARCHAR(100) UNIQUE NOT NULL`: Enforces unique student registration without duplicate accounts.',
        '`UNIQUE KEY uq_student_course (student_id, course_id)`: Prevents a student from being enrolled in the exact same course twice while still allowing an independent `enrollment_id` primary key.',
        'This represents standard production design in modern web applications.'
      ],
      sampleBeforeAfter: {
        table: 'University Schema Layout',
        before: [
          { table: 'students', role: 'Entity', pk: 'student_id', sample: 'Alice Walker' },
          { table: 'courses', role: 'Entity', pk: 'course_id', sample: 'CS101 Intro to Computer Science' }
        ],
        after: [
          { table: 'enrollments', role: 'Junction', pk: 'enrollment_id', sample: 'Student 1 enrolled in Course 1 with Grade A' }
        ]
      },
      commonMistakes: [
        'Attempting to insert an enrollment with a `student_id` that does not yet exist in the `students` table.',
        'Deleting a course that currently has enrolled students without checking foreign key restrictions.',
        'Leaving out the `UNIQUE KEY` on `(student_id, course_id)` in the enrollments table.'
      ],
      practiceExercise: {
        instructions: 'Write a query in `university_db` to retrieve all courses offering 4 credits.',
        defaultCode: 'SELECT course_id, course_code, course_name, credits FROM courses WHERE credits = 4;',
        solution: 'SELECT course_id, course_code, course_name, credits FROM courses WHERE credits = 4;',
        hint: 'Filter the courses table using WHERE credits = 4.'
      },
      quiz: {
        question: 'Why did we add UNIQUE KEY (student_id, course_id) to the enrollments table?',
        options: [
          'To encrypt the student IDs.',
          'To prevent a student from accidentally enrolling twice in the same course.',
          'To make the query run 100 times faster.',
          'MySQL requires all foreign keys to be unique.'
        ],
        correctIndex: 1,
        explanation: 'The unique composite key ensures each student can only enroll in a particular course once.'
      }
    }
  }
];
