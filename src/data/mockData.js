export const initialLocations = [
  {
    id: '1',
    name: 'Vijay Patel Building',
    type: 'Classroom',
    description: 'Art and Design building with modern studios.',
    lat: 52.6285,
    lng: -1.1385,
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80'
  },
  {
    id: '2',
    name: 'Hugh Aston Building',
    type: 'Classroom',
    description: 'Business and Law school facilities.',
    lat: 52.6292,
    lng: -1.1378,
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80'
  },
  {
    id: '3',
    name: 'Queens Building',
    type: 'Lab',
    description: 'Engineering and computing laboratories.',
    lat: 52.6278,
    lng: -1.1365,
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80'
  },
  {
    id: '4',
    name: 'Kimberlin Library',
    type: 'Library',
    description: 'Main university library open 24/7.',
    lat: 52.6288,
    lng: -1.1355,
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80'
  },
  {
    id: '5',
    name: 'Campus Centre',
    type: 'Cafeteria',
    description: 'Student union, food court, and social spaces.',
    lat: 52.6281,
    lng: -1.1372,
    imageUrl: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80'
  },
  {
    id: '6',
    name: 'Hawthorn Building',
    type: 'Classroom',
    description: 'Health and life sciences lecture halls.',
    lat: 52.6295,
    lng: -1.136
  },
  {
    id: '7',
    name: 'Gateway House',
    type: 'Office',
    description: 'Technology and media studios, staff offices.',
    lat: 52.63,
    lng: -1.135
  },
  {
    id: '8',
    name: 'Trinity House',
    type: 'Office',
    description: 'Administrative and executive offices.',
    lat: 52.6275,
    lng: -1.138
  }
];

export const initialFeedback = [
  {
    id: '1',
    user: 'student123',
    locationId: '1',
    rating: 5,
    comment: 'Great facilities and natural light in the studios.',
    date: '2023-10-15T10:30:00Z',
    reviewed: true
  },
  {
    id: '2',
    user: 'john.doe',
    locationId: '4',
    rating: 3,
    comment: 'Gets very crowded during exam season. Hard to find a seat.',
    date: '2023-10-16T14:20:00Z',
    reviewed: false
  },
  {
    id: '3',
    user: 'sarah_m',
    locationId: '3',
    rating: 4,
    comment: 'Labs are well equipped but sometimes too cold.',
    date: '2023-10-18T09:15:00Z',
    reviewed: false
  },
  {
    id: '4',
    user: 'guest_user',
    locationId: '5',
    rating: 5,
    comment: 'Good food options and nice atmosphere.',
    date: '2023-10-20T12:45:00Z',
    reviewed: true
  },
  {
    id: '5',
    user: 'alex.w',
    locationId: '2',
    rating: 4,
    comment: 'Lecture theatres are spacious and modern.',
    date: '2023-10-21T11:00:00Z',
    reviewed: false
  }
];

export const initialAdmins = [
  {
    id: '1',
    name: 'Alice Smith',
    email: 'alice@dmu.ac.uk',
    password: 'admin123',
    role: 'System Admin',
    status: 'Active',
    lastLogin: '2023-10-24T08:30:00Z'
  },
  {
    id: '2',
    name: 'Bob Jones',
    email: 'bob@dmu.ac.uk',
    password: 'admin123',
    role: 'Campus Admin',
    status: 'Active',
    lastLogin: '2023-10-23T09:15:00Z'
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@dmu.ac.uk',
    password: 'admin123',
    role: 'Campus Admin',
    status: 'Inactive',
    lastLogin: '2023-09-15T14:20:00Z'
  },
  {
    id: '4',
    name: 'Diana Prince',
    email: 'diana@dmu.ac.uk',
    password: 'admin123',
    role: 'System Admin',
    status: 'Active',
    lastLogin: '2023-10-24T10:05:00Z'
  },
  {
    id: '5',
    name: 'Evan Wright',
    email: 'evan@dmu.ac.uk',
    password: 'admin123',
    role: 'Campus Admin',
    status: 'Active',
    lastLogin: '2023-10-22T16:45:00Z'
  }
];

export const initialStaff = [
  {
    id: '1',
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@dmu.ac.uk',
    department: 'Computer Science',
    position: 'Senior Lecturer',
    phone: '+44 116 250 1234',
    buildingId: '3',
    room: 'QB 2.14'
  },
  {
    id: '2',
    name: 'Prof. Michael Chang',
    email: 'm.chang@dmu.ac.uk',
    department: 'Engineering',
    position: 'Head of Department',
    phone: '+44 116 250 2345',
    buildingId: '3',
    room: 'QB 3.01'
  },
  {
    id: '3',
    name: 'Emma Thompson',
    email: 'e.thompson@dmu.ac.uk',
    department: 'Art and Design',
    position: 'Studio Technician',
    phone: '+44 116 250 3456',
    buildingId: '1',
    room: 'VP 1.05'
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'd.wilson@dmu.ac.uk',
    department: 'Business School',
    position: 'Lecturer',
    phone: '+44 116 250 4567',
    buildingId: '2',
    room: 'HA 4.22'
  },
  {
    id: '5',
    name: 'Dr. Lisa Patel',
    email: 'l.patel@dmu.ac.uk',
    department: 'Life Sciences',
    position: 'Research Fellow',
    phone: '+44 116 250 5678',
    buildingId: '6',
    room: 'HB 1.12'
  }
];

export const initialLogs = [
  {
    id: '1',
    userId: '1',
    userName: 'Alice Smith',
    action: 'Login',
    details: 'System Admin logged in',
    timestamp: '2023-10-24T08:30:00Z'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Bob Jones',
    action: 'Update',
    details: 'Updated location: Queens Building',
    timestamp: '2023-10-23T10:15:00Z'
  },
  {
    id: '3',
    userId: '2',
    userName: 'Bob Jones',
    action: 'Review',
    details: 'Reviewed feedback for Campus Centre',
    timestamp: '2023-10-23T11:20:00Z'
  },
  {
    id: '4',
    userId: '4',
    userName: 'Diana Prince',
    action: 'Create',
    details: 'Created new admin: Evan Wright',
    timestamp: '2023-10-22T09:00:00Z'
  },
  {
    id: '5',
    userId: '5',
    userName: 'Evan Wright',
    action: 'Create',
    details: 'Added new location: Trinity House',
    timestamp: '2023-10-22T17:30:00Z'
  },
  {
    id: '6',
    userId: '1',
    userName: 'Alice Smith',
    action: 'Delete',
    details: 'Deleted inactive user account',
    timestamp: '2023-10-21T14:45:00Z'
  }
];

export const chartData = {
  searchesOverTime: [
    { name: 'Jan', searches: 4000 },
    { name: 'Feb', searches: 3000 },
    { name: 'Mar', searches: 5000 },
    { name: 'Apr', searches: 4500 },
    { name: 'May', searches: 6000 },
    { name: 'Jun', searches: 2000 },
    { name: 'Jul', searches: 1500 },
    { name: 'Aug', searches: 2500 },
    { name: 'Sep', searches: 7000 },
    { name: 'Oct', searches: 8500 }
  ],
  locationsByType: [
    { name: 'Classroom', value: 3 },
    { name: 'Office', value: 2 },
    { name: 'Lab', value: 1 },
    { name: 'Library', value: 1 },
    { name: 'Cafeteria', value: 1 }
  ],
  feedbackRatings: [
    { name: '5 Stars', value: 2 },
    { name: '4 Stars', value: 2 },
    { name: '3 Stars', value: 1 },
    { name: '2 Stars', value: 0 },
    { name: '1 Star', value: 0 }
  ],
  actionsByType: [
    { name: 'Login', value: 45 },
    { name: 'Update', value: 25 },
    { name: 'Create', value: 15 },
    { name: 'Delete', value: 5 },
    { name: 'Review', value: 10 }
  ],
  usersByRole: [
    { name: 'Campus Admin', value: 3 },
    { name: 'System Admin', value: 2 }
  ]
};
