// Realistic Bootstrap 5 lessons structured into levels and difficulty tiers for code practice.

export const BOOTSTRAP_LESSONS = [
  // LEVEL 1: BOOTSTRAP BASICS & GRID
  {
    id: 'bs-1',
    level: 1,
    levelName: 'Bootstrap Basics',
    lessonNumber: 1,
    title: 'Containers & Background Utilities',
    difficulty: 'Beginner',
    description: 'Type basic Bootstrap container and text color utility classes.',
    snippet: `<div class="container py-4 bg-dark text-white rounded-3">
  <h1 class="display-4 font-bold">Welcome to Bootstrap</h1>
  <p class="lead">Build fast, responsive sites with modern utilities.</p>
</div>`,
  },
  {
    id: 'bs-2',
    level: 1,
    levelName: 'Bootstrap Basics',
    lessonNumber: 2,
    title: '12-Column Responsive Grid',
    difficulty: 'Beginner',
    description: 'Practice Bootstrap row, col-12, col-md-6, and gap utilities.',
    snippet: `<div class="container">
  <div class="row g-3">
    <div class="col-12 col-md-6 col-lg-4">
      <div class="p-3 bg-light border rounded">Column 1</div>
    </div>
    <div class="col-12 col-md-6 col-lg-4">
      <div class="p-3 bg-light border rounded">Column 2</div>
    </div>
  </div>
</div>`,
  },
  {
    id: 'bs-3',
    level: 1,
    levelName: 'Bootstrap Basics',
    lessonNumber: 3,
    title: 'Buttons & Badges',
    difficulty: 'Beginner',
    description: 'Type Bootstrap btn-primary, btn-outline-success, and badge styles.',
    snippet: `<button type="button" class="btn btn-primary btn-lg shadow-sm">
  Notifications <span class="badge bg-danger">5</span>
</button>
<button type="button" class="btn btn-outline-success rounded-pill ms-2">
  Completed
</button>`,
  },

  // LEVEL 2: BOOTSTRAP UI COMPONENTS
  {
    id: 'bs-4',
    level: 2,
    levelName: 'UI Components',
    lessonNumber: 4,
    title: 'Bootstrap Card Layouts',
    difficulty: 'Intermediate',
    description: 'Type card, card-body, card-title, and card-text elements.',
    snippet: `<div class="card shadow-sm border-0" style="max-width: 18rem;">
  <img src="/img/banner.jpg" class="card-img-top" alt="Card banner">
  <div class="card-body">
    <h5 class="card-title text-primary font-bold">Frontend Course</h5>
    <p class="card-text text-muted">Master Bootstrap 5 grid and components.</p>
    <a href="#" class="btn btn-primary w-100">Enroll Now</a>
  </div>
</div>`,
  },
  {
    id: 'bs-5',
    level: 2,
    levelName: 'UI Components',
    lessonNumber: 5,
    title: 'Bootstrap Navigation Bar (Navbar)',
    difficulty: 'Intermediate',
    description: 'Practice navbar, navbar-expand-lg, nav-item, and nav-link.',
    snippet: `<nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow">
  <div class="container-fluid">
    <a class="navbar-brand font-black" href="#">DevSocial</a>
    <div class="navbar-nav ms-auto">
      <a class="nav-link active" href="#">Home</a>
      <a class="nav-link" href="#">Explore</a>
    </div>
  </div>
</nav>`,
  },

  // LEVEL 3: ALERTS, MODALS & FLEX UTILITIES
  {
    id: 'bs-6',
    level: 3,
    levelName: 'Advanced Utilities',
    lessonNumber: 6,
    title: 'Bootstrap Alerts & Flexbox Utilities',
    difficulty: 'Advanced',
    description: 'Type alert, alert-success, d-flex, justify-content-between, align-items-center.',
    snippet: `<div class="alert alert-success d-flex justify-content-between align-items-center shadow-sm" role="alert">
  <div>
    <strong>Success!</strong> Your lesson progress has been synced.
  </div>
  <button type="button" class="btn-close" aria-label="Close"></button>
</div>`,
  },
];
