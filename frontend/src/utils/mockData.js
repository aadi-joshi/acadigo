// Sample data for demonstration purposes

// Mock Users
export const users = [
  {
    _id: 'admin1',
    name: 'Admin User',
    email: 'admin@acadigo.com',
    password: 'password123',
    role: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    _id: 'trainer1',
    name: 'John Trainer',
    email: 'trainer@acadigo.com',
    password: 'password123',
    role: 'trainer',
    createdAt: '2023-01-02T00:00:00Z',
  },
  {
    _id: 'student1',
    name: 'Alice Student',
    email: 'student@acadigo.com',
    password: 'password123',
    role: 'student',
    batch: 'batch1',
    createdAt: '2023-01-03T00:00:00Z',
  }
];

// Mock Batches
export const batches = [
  {
    _id: 'batch1',
    name: 'Web Development Batch 2023',
    description: 'Complete web development course covering frontend and backend technologies',
    trainer: 'trainer1',
    startDate: '2023-02-01T00:00:00Z',
    endDate: '2023-06-30T00:00:00Z',
    active: true,
    studentCount: 25,
    createdAt: '2023-01-15T00:00:00Z',
  },
  {
    _id: 'batch2',
    name: 'Data Science Fundamentals',
    description: 'Introduction to data science and machine learning',
    trainer: 'trainer1',
    startDate: '2023-03-01T00:00:00Z',
    endDate: '2023-07-31T00:00:00Z',
    active: true,
    studentCount: 18,
    createdAt: '2023-02-15T00:00:00Z',
  },
];

// Mock PPTs
export const ppts = [
  {
    _id: 'ppt1',
    title: 'Introduction to HTML & CSS',
    description: 'Basics of HTML structure and CSS styling',
    fileUrl: 'https://www.w3.org/WAI/demos/bad/after/documents/sample.pdf',
    filePath: '/ppts/html-css-intro.pdf',
    fileName: 'html-css-intro.pdf',
    fileSize: 2.5 * 1024 * 1024, // 2.5MB
    batch: {
      _id: 'batch1',
      name: 'Web Development Batch 2023'
    },
    uploadedBy: {
      _id: 'trainer1',
      name: 'John Trainer',
      role: 'trainer'
    },
    createdAt: '2023-02-05T10:00:00Z',
  },
  {
    _id: 'ppt2',
    title: 'JavaScript Fundamentals',
    description: 'Core concepts of JavaScript programming language',
    fileUrl: 'https://www.w3.org/WAI/demos/bad/after/documents/sample.pdf',
    filePath: '/ppts/javascript-fundamentals.pdf',
    fileName: 'javascript-fundamentals.pdf',
    fileSize: 3.2 * 1024 * 1024, // 3.2MB
    batch: {
      _id: 'batch1',
      name: 'Web Development Batch 2023'
    },
    uploadedBy: {
      _id: 'trainer1',
      name: 'John Trainer',
      role: 'trainer'
    },
    createdAt: '2023-02-12T14:30:00Z',
  },
  {
    _id: 'ppt3',
    title: 'Introduction to Python',
    description: 'Getting started with Python programming',
    fileUrl: 'https://www.w3.org/WAI/demos/bad/after/documents/sample.pdf',
    filePath: '/ppts/python-intro.pdf',
    fileName: 'python-intro.pdf',
    fileSize: 2.8 * 1024 * 1024, // 2.8MB
    batch: {
      _id: 'batch2',
      name: 'Data Science Fundamentals'
    },
    uploadedBy: {
      _id: 'trainer1',
      name: 'John Trainer',
      role: 'trainer'
    },
    createdAt: '2023-03-05T09:15:00Z',
  },
];

// Mock Assignments
export const assignments = [
  {
    _id: 'assignment1',
    title: 'HTML Portfolio Project',
    description: 'Create a personal portfolio website using HTML and CSS',
    fileUrl: 'https://www.w3.org/WAI/demos/bad/after/documents/sample.pdf',
    filePath: '/assignments/html-portfolio.pdf',
    fileName: 'html-portfolio-instructions.pdf',
    fileSize: 1.5 * 1024 * 1024, // 1.5MB
    batch: {
      _id: 'batch1',
      name: 'Web Development Batch 2023'
    },
    deadline: '2023-02-20T23:59:59Z',
    maxMarks: 100,
    allowResubmission: true,
    uploadedBy: {
      _id: 'trainer1',
      name: 'John Trainer'
    },
    createdAt: '2023-02-06T11:00:00Z',
  },
  {
    _id: 'assignment2',
    title: 'JavaScript Calculator',
    description: 'Build a simple calculator application using JavaScript',
    fileUrl: 'https://www.w3.org/WAI/demos/bad/after/documents/sample.pdf',
    filePath: '/assignments/js-calculator.pdf',
    fileName: 'js-calculator-instructions.pdf',
    fileSize: 1.2 * 1024 * 1024, // 1.2MB
    batch: {
      _id: 'batch1',
      name: 'Web Development Batch 2023'
    },
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    maxMarks: 100,
    allowResubmission: true,
    uploadedBy: {
      _id: 'trainer1',
      name: 'John Trainer'
    },
    createdAt: '2023-02-15T13:30:00Z',
  },
  {
    _id: 'assignment3',
    title: 'Python Data Analysis',
    description: 'Perform data analysis on a provided dataset using Python and pandas',
    fileUrl: 'https://www.w3.org/WAI/demos/bad/after/documents/sample.pdf',
    filePath: '/assignments/python-data-analysis.pdf',
    fileName: 'python-data-analysis-instructions.pdf',
    fileSize: 1.8 * 1024 * 1024, // 1.8MB
    batch: {
      _id: 'batch2',
      name: 'Data Science Fundamentals'
    },
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    maxMarks: 100,
    allowResubmission: false,
    uploadedBy: {
      _id: 'trainer1',
      name: 'John Trainer'
    },
    createdAt: '2023-03-10T09:45:00Z',
  }
];

// Mock Submissions
export const submissions = [
  {
    _id: 'submission1',
    assignment: {
      _id: 'assignment1',
      title: 'HTML Portfolio Project',
      maxMarks: 100
    },
    student: {
      _id: 'student1',
      name: 'Alice Student'
    },
    files: [
      {
        fileName: 'portfolio.zip',
        fileUrl: 'https://example.com/files/portfolio.zip',
        filePath: '/submissions/portfolio.zip',
        fileSize: 3.7 * 1024 * 1024, // 3.7MB
        uploadedAt: '2023-02-18T16:45:00Z'
      }
    ],
    submittedAt: '2023-02-18T16:45:00Z',
    status: 'graded',
    marks: 85,
    feedback: 'Good work! Your design is clean and responsive. Work on improving the accessibility.',
    gradedBy: {
      _id: 'trainer1',
      name: 'John Trainer'
    },
    gradedAt: '2023-02-22T10:30:00Z',
    isLate: false
  }
];

// Mock Dashboard data for different roles
export const dashboardData = {
  admin: {
    stats: {
      totalUsers: 42,
      trainers: 8,
      students: 33,
      totalBatches: 5,
      activeBatches: 3,
      totalPPTs: 28,
      totalAssignments: 15,
      todayPPTViews: 23,
      maxDailyViews: 50,
      todaySubmissions: 7,
      maxDailySubmissions: 15,
      todayAPIRequests: 156,
      maxDailyAPIRequests: 500
    },
    recentUsers: users
  },
  trainer: {
    stats: {
      totalStudents: 25,
      pptCount: 12,
      pendingSubmissions: 5,
    },
    batches: batches,
    pendingSubmissions: submissions
  },
  student: {
    stats: {
      availablePPTs: 8,
      pendingAssignments: 2,
      completedAssignments: 1,
      batch: {
        name: 'Web Development Batch 2023',
        description: 'Complete web development course covering frontend and backend technologies',
        trainerName: 'John Trainer'
      }
    },
    ppts: ppts.filter(ppt => ppt.batch._id === 'batch1'),
    assignments: assignments.filter(assignment => assignment.batch._id === 'batch1'),
    submissions: submissions
  }
};
