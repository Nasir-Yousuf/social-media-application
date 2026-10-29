// Preloaded sample databases for MySQL Practice Lab & Course Lessons
// 100% in-memory, safe, and realistic.

export const SAMPLE_DATABASES = {
  university: {
    name: 'university_db',
    label: 'University & Students DB',
    description: 'Students, courses, and department enrollments.',
    tables: {
      students: {
        name: 'students',
        columns: ['student_id', 'first_name', 'last_name', 'email', 'major', 'gpa', 'enrollment_date'],
        types: ['INT PRIMARY KEY', 'VARCHAR(50)', 'VARCHAR(50)', 'VARCHAR(100)', 'VARCHAR(50)', 'DECIMAL(3,2)', 'DATE'],
        rows: [
          { student_id: 1, first_name: 'Amina', last_name: 'Rahman', email: 'amina@school.edu', major: 'Computer Science', gpa: 3.85, enrollment_date: '2023-08-15' },
          { student_id: 2, first_name: 'Tanvir', last_name: 'Hossain', email: 'tanvir@school.edu', major: 'Electrical Engineering', gpa: 3.40, enrollment_date: '2023-08-15' },
          { student_id: 3, first_name: 'Nusrat', last_name: 'Jahan', email: 'nusrat@school.edu', major: 'Computer Science', gpa: 3.92, enrollment_date: '2022-08-20' },
          { student_id: 4, first_name: 'Rafiq', last_name: 'Islam', email: 'rafiq@school.edu', major: 'Business Administration', gpa: 2.95, enrollment_date: '2024-01-10' },
          { student_id: 5, first_name: 'Sadia', last_name: 'Akter', email: 'sadia@school.edu', major: 'Mathematics', gpa: 3.70, enrollment_date: '2022-08-20' },
          { student_id: 6, first_name: 'Fahim', last_name: 'Shahriar', email: 'fahim@school.edu', major: 'Computer Science', gpa: 3.15, enrollment_date: '2023-08-15' },
        ],
      },
      courses: {
        name: 'courses',
        columns: ['course_id', 'course_code', 'course_name', 'credits', 'department'],
        types: ['INT PRIMARY KEY', 'VARCHAR(10)', 'VARCHAR(100)', 'INT', 'VARCHAR(50)'],
        rows: [
          { course_id: 101, course_code: 'CS101', course_name: 'Introduction to Programming', credits: 3, department: 'Computer Science' },
          { course_id: 102, course_code: 'CS201', course_name: 'Database Management Systems', credits: 4, department: 'Computer Science' },
          { course_id: 103, course_code: 'EE101', course_name: 'Circuits and Electronics', credits: 4, department: 'Electrical Engineering' },
          { course_id: 104, course_code: 'MATH101', course_name: 'Calculus and Linear Algebra', credits: 3, department: 'Mathematics' },
          { course_id: 105, course_code: 'BUS101', course_name: 'Principles of Marketing', credits: 3, department: 'Business' },
        ],
      },
      enrollments: {
        name: 'enrollments',
        columns: ['enrollment_id', 'student_id', 'course_id', 'semester', 'grade'],
        types: ['INT PRIMARY KEY', 'INT FOREIGN KEY', 'INT FOREIGN KEY', 'VARCHAR(20)', 'VARCHAR(2)'],
        rows: [
          { enrollment_id: 1, student_id: 1, course_id: 101, semester: 'Fall 2023', grade: 'A' },
          { enrollment_id: 2, student_id: 1, course_id: 102, semester: 'Spring 2024', grade: 'A-' },
          { enrollment_id: 3, student_id: 2, course_id: 103, semester: 'Fall 2023', grade: 'B+' },
          { enrollment_id: 4, student_id: 3, course_id: 101, semester: 'Fall 2022', grade: 'A' },
          { enrollment_id: 5, student_id: 3, course_id: 102, semester: 'Spring 2023', grade: 'A' },
          { enrollment_id: 6, student_id: 4, course_id: 105, semester: 'Spring 2024', grade: 'B' },
          { enrollment_id: 7, student_id: 5, course_id: 104, semester: 'Fall 2022', grade: 'A' },
          { enrollment_id: 8, student_id: 6, course_id: 101, semester: 'Fall 2023', grade: 'B-' },
        ],
      },
    },
  },

  company: {
    name: 'company_db',
    label: 'Corporate HR & Payroll DB',
    description: 'Departments, employees, salaries, and job roles.',
    tables: {
      departments: {
        name: 'departments',
        columns: ['dept_id', 'dept_name', 'location', 'budget'],
        types: ['INT PRIMARY KEY', 'VARCHAR(50)', 'VARCHAR(50)', 'DECIMAL(12,2)'],
        rows: [
          { dept_id: 1, dept_name: 'Engineering', location: 'Dhaka', budget: 500000.00 },
          { dept_id: 2, dept_name: 'Product Design', location: 'Dhaka', budget: 180000.00 },
          { dept_id: 3, dept_name: 'Marketing', location: 'Chittagong', budget: 150000.00 },
          { dept_id: 4, dept_name: 'Finance & HR', location: 'Dhaka', budget: 220000.00 },
          { dept_id: 5, dept_name: 'Customer Support', location: 'Sylhet', budget: 95000.00 },
        ],
      },
      employees: {
        name: 'employees',
        columns: ['emp_id', 'first_name', 'last_name', 'dept_id', 'job_title', 'salary', 'hire_date'],
        types: ['INT PRIMARY KEY', 'VARCHAR(50)', 'VARCHAR(50)', 'INT FOREIGN KEY', 'VARCHAR(50)', 'DECIMAL(10,2)', 'DATE'],
        rows: [
          { emp_id: 1001, first_name: 'Zubair', last_name: 'Ahmed', dept_id: 1, job_title: 'Senior Software Engineer', salary: 120000.00, hire_date: '2020-03-15' },
          { emp_id: 1002, first_name: 'Farhana', last_name: 'Yesmin', dept_id: 1, job_title: 'DevOps Engineer', salary: 95000.00, hire_date: '2021-06-01' },
          { emp_id: 1003, first_name: 'Mahmud', last_name: 'Hassan', dept_id: 2, job_title: 'UI/UX Designer', salary: 75000.00, hire_date: '2022-01-15' },
          { emp_id: 1004, first_name: 'Rumana', last_name: 'Khatun', dept_id: 3, job_title: 'Growth Marketer', salary: 68000.00, hire_date: '2022-09-10' },
          { emp_id: 1005, first_name: 'Imtiaz', last_name: 'Chowdhury', dept_id: 4, job_title: 'Financial Analyst', salary: 82000.00, hire_date: '2019-11-20' },
          { emp_id: 1006, first_name: 'Sabrina', last_name: 'Rashid', dept_id: 1, job_title: 'Backend Developer', salary: 88000.00, hire_date: '2023-04-01' },
          { emp_id: 1007, first_name: 'Kamrul', last_name: 'Hasan', dept_id: 5, job_title: 'Support Specialist', salary: 45000.00, hire_date: '2023-10-15' },
        ],
      },
    },
  },

  ecommerce: {
    name: 'ecommerce_db',
    label: 'E-Commerce Store DB',
    description: 'Customers, categories, products, orders, and order items.',
    tables: {
      categories: {
        name: 'categories',
        columns: ['category_id', 'category_name', 'description'],
        types: ['INT PRIMARY KEY', 'VARCHAR(50)', 'VARCHAR(255)'],
        rows: [
          { category_id: 1, category_name: 'Laptops & Computers', description: 'Ultrabooks, gaming rigs, and desktop computers.' },
          { category_id: 2, category_name: 'Smartphones & Tablets', description: 'iOS, Android smartphones, and accessories.' },
          { category_id: 3, category_name: 'Audio & Headphones', description: 'Wireless earbuds, noise-cancelling headphones, soundbars.' },
          { category_id: 4, category_name: 'Peripherals', description: 'Keyboards, gaming mice, webcams, and monitors.' },
        ],
      },
      products: {
        name: 'products',
        columns: ['product_id', 'product_name', 'category_id', 'price', 'stock_quantity', 'rating'],
        types: ['INT PRIMARY KEY', 'VARCHAR(100)', 'INT FOREIGN KEY', 'DECIMAL(10,2)', 'INT', 'DECIMAL(2,1)'],
        rows: [
          { product_id: 1, product_name: 'MacBook Pro 14"', category_id: 1, price: 1999.00, stock_quantity: 15, rating: 4.9 },
          { product_id: 2, product_name: 'ThinkPad X1 Carbon', category_id: 1, price: 1450.00, stock_quantity: 22, rating: 4.7 },
          { product_id: 3, product_name: 'iPhone 15 Pro', category_id: 2, price: 999.00, stock_quantity: 40, rating: 4.8 },
          { product_id: 4, product_name: 'Samsung Galaxy S24', category_id: 2, price: 899.00, stock_quantity: 35, rating: 4.6 },
          { product_id: 5, product_name: 'Sony WH-1000XM5', category_id: 3, price: 349.00, stock_quantity: 50, rating: 4.8 },
          { product_id: 6, product_name: 'Keychron Q1 Pro Keyboard', category_id: 4, price: 199.00, stock_quantity: 28, rating: 4.9 },
          { product_id: 7, product_name: 'Logitech MX Master 3S', category_id: 4, price: 99.00, stock_quantity: 65, rating: 4.8 },
          { product_id: 8, product_name: 'Dell 27" 4K Monitor', category_id: 4, price: 420.00, stock_quantity: 18, rating: 4.5 },
        ],
      },
      customers: {
        name: 'customers',
        columns: ['customer_id', 'first_name', 'last_name', 'city', 'country', 'created_at'],
        types: ['INT PRIMARY KEY', 'VARCHAR(50)', 'VARCHAR(50)', 'VARCHAR(50)', 'VARCHAR(50)', 'DATE'],
        rows: [
          { customer_id: 1, first_name: 'Arif', last_name: 'Hasan', city: 'Dhaka', country: 'Bangladesh', created_at: '2023-01-12' },
          { customer_id: 2, first_name: 'Priya', last_name: 'Saha', city: 'Chittagong', country: 'Bangladesh', created_at: '2023-02-18' },
          { customer_id: 3, first_name: 'Liam', last_name: 'Smith', city: 'London', country: 'United Kingdom', created_at: '2023-04-05' },
          { customer_id: 4, first_name: 'Mehedi', last_name: 'Zaman', city: 'Dhaka', country: 'Bangladesh', created_at: '2023-05-22' },
          { customer_id: 5, first_name: 'Sara', last_name: 'Connor', city: 'New York', country: 'United States', created_at: '2023-08-30' },
          { customer_id: 6, first_name: 'Anika', last_name: 'Tabassum', city: 'Sylhet', country: 'Bangladesh', created_at: '2024-02-14' },
        ],
      },
      orders: {
        name: 'orders',
        columns: ['order_id', 'customer_id', 'order_date', 'total_amount', 'status'],
        types: ['INT PRIMARY KEY', 'INT FOREIGN KEY', 'DATE', 'DECIMAL(10,2)', 'VARCHAR(20)'],
        rows: [
          { order_id: 101, customer_id: 1, order_date: '2024-02-01', total_amount: 1999.00, status: 'DELIVERED' },
          { order_id: 102, customer_id: 2, order_date: '2024-02-05', total_amount: 349.00, status: 'DELIVERED' },
          { order_id: 103, customer_id: 1, order_date: '2024-02-15', total_amount: 298.00, status: 'SHIPPED' },
          { order_id: 104, customer_id: 3, order_date: '2024-02-20', total_amount: 999.00, status: 'PROCESSING' },
          { order_id: 105, customer_id: 5, order_date: '2024-03-01', total_amount: 1450.00, status: 'DELIVERED' },
        ],
      },
      order_items: {
        name: 'order_items',
        columns: ['order_item_id', 'order_id', 'product_id', 'quantity', 'unit_price'],
        types: ['INT PRIMARY KEY', 'INT FOREIGN KEY', 'INT FOREIGN KEY', 'INT', 'DECIMAL(10,2)'],
        rows: [
          { order_item_id: 1, order_id: 101, product_id: 1, quantity: 1, unit_price: 1999.00 },
          { order_item_id: 2, order_id: 102, product_id: 5, quantity: 1, unit_price: 349.00 },
          { order_item_id: 3, order_id: 103, product_id: 6, quantity: 1, unit_price: 199.00 },
          { order_item_id: 4, order_id: 103, product_id: 7, quantity: 1, unit_price: 99.00 },
          { order_item_id: 5, order_id: 104, product_id: 3, quantity: 1, unit_price: 999.00 },
          { order_item_id: 6, order_id: 105, product_id: 2, quantity: 1, unit_price: 1450.00 },
        ],
      },
    },
  },
};
