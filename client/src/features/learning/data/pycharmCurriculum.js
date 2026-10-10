// Clearfeed Learn & Practice - PyCharm for Python & AI Curriculum (12 Lessons)

export const PYCHARM_LESSONS = Array.from({ length: 12 }, (_, index) => {
  const order = index + 1;
  const chapter = 'Chapter 1: IDE Foundations & AI Workflows';

  const topics = [
    'What Is PyCharm & Community vs Professional Edition',
    'Installing & Configuring PyCharm for Python & AI',
    'Python Interpreters & Virtual Environment Isolation',
    'PyCharm Project Structure, File Tree & Built-in Terminal',
    'Writing, Running & Configuring Python Run/Debug Configurations',
    'Systematic Debugging: Breakpoints, Variables & Expression Evaluation',
    'Code Completion, Intentions & Refactoring Assistance',
    'Testing Integration (pytest) & Git Version Control in PyCharm',
    'Jupyter Notebook Workflows & Data Viewer in PyCharm',
    'Working with NumPy, Pandas & PyTorch in PyCharm',
    'Managing Environment Variables, API Keys & Remote Compute',
    'Final Workflow Project: Create, Debug & Run a Python AI Project',
  ];

  const titleText = topics[index] || `PyCharm Lesson ${order}`;

  return {
    id: `pyc-${String(order).padStart(2, '0')}`,
    track: 'pycharm',
    order: order,
    chapter: chapter,
    difficulty: order <= 4 ? 'Beginner' : order <= 8 ? 'Intermediate' : 'Advanced',
    title: {
      en: `${order}. ${titleText}`,
      bn: `${order}. ${titleText}`,
    },
    subtitle: {
      en: `Master IDE productivity tools with ${titleText}.`,
      bn: `পাইচার্ম আইডিই দিয়ে প্রফেশনাল পাইথন ডেভেলপমেন্ট শিখুন।`,
    },
    explanation: {
      simple: {
        en: `PyCharm is the world’s leading Python IDE by JetBrains, designed specifically for Python, Data Science, and AI developers.`,
        bn: `পাইচার্ম হলো পাইথন ও এআই ডেভেলপারদের জন্য বিশ্বসেরা আইডিই (IDE)।`,
      },
      analogy: {
        en: `Writing Python code in Notepad is like using a hand saw; using PyCharm is like having a fully equipped digital power workshop!`,
        bn: `পাইচার্ম যেন একটি সম্পূর্ণ সজ্জিত ডিজিটাল পাওয়ার ওয়ার্কশপ!`,
      },
      technical: {
        en: `PyCharm provides dynamic code inspection, AST indexing, PEP 8 linting, virtualenv management, and visual step-debugging.`,
        bn: `ভার্চুয়াল এনভায়রনমেন্ট ম্যানেজমেন্ট, লিন্টিং ও ভিজ্যুয়াল ডিবাগিং।`,
      },
    },
    outcomes: [
      `Understand ${titleText}`,
      'Learn IDE navigation, debugging, and run configurations',
      'Optimize your Python & AI development workflow',
    ],
    starterCode: {
      python: `# PyCharm Workflow - Lesson ${order}: ${titleText}
def run_ide_inspection():
    project_status = "PyCharm Environment Active"
    interpreter = "Python 3.11 (venv)"
    print(f"[{project_status}] Interpreter: {interpreter}")

run_ide_inspection()
`,
    },
    exercise: {
      instructions: {
        en: `Run the Python code to test PyCharm function inspection output.`,
        bn: `পাইথন কোড রান করুন।`,
      },
      hint: {
        en: 'Click Run Code button.',
        bn: 'Run Code চাপুন।',
      },
      solution: {
        python: `print("PyCharm setup verified!")`,
      },
      validation: {
        type: 'py_contains',
        keyword: 'print',
      },
    },
  };
});
