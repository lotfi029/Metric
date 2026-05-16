export interface Client {
  id: string;
  name: string;
  type: 'Individual' | 'Corporate' | 'Government';
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  nationality: string;
  preferredStyle: string;
  budgetRange: 'Economy' | 'Mid-Range' | 'Premium' | 'Luxury';
  totalProjects: number;
  totalSpent: number;
  status: 'Active' | 'Prospect' | 'Inactive' | 'VIP';
  assignedSales: string; // employee id
  joinDate: string;
  lastContact: string;
  notes: string;
  tags: string[];
}

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    name: 'Mansour Al-Rashid',
    type: 'Individual',
    email: 'mansour@alrashid.ae',
    phone: '+971 50 111 2233',
    address: 'Villa 14, Al-Nakheel District',
    city: 'Abu Dhabi',
    country: 'UAE',
    nationality: 'Emirati',
    preferredStyle: 'Modern Arabic',
    budgetRange: 'Luxury',
    totalProjects: 2,
    totalSpent: 385000,
    status: 'VIP',
    assignedSales: 'emp-007',
    joinDate: '2023-10-01',
    lastContact: '2024-12-10',
    notes: 'Prefers in-person meetings. Very detail-oriented. Requires weekly progress reports.',
    tags: ['VIP', 'Villa', 'Repeat-Client']
  },
  {
    id: 'cli-002',
    name: 'Nour Capital Group',
    type: 'Corporate',
    email: 'projects@nourcapital.ae',
    phone: '+971 4 222 3344',
    address: 'Office 2201, DIFC',
    city: 'Dubai',
    country: 'UAE',
    nationality: 'UAE Registered',
    preferredStyle: 'Contemporary Corporate',
    budgetRange: 'Premium',
    totalProjects: 3,
    totalSpent: 620000,
    status: 'VIP',
    assignedSales: 'emp-007',
    joinDate: '2022-06-15',
    lastContact: '2024-12-12',
    notes: 'Decision maker is Eng. Rami Nour. Budget approval requires board sign-off over 200k.',
    tags: ['Corporate', 'Office', 'DIFC', 'Repeat-Client']
  },
  {
    id: 'cli-003',
    name: 'Farah Al-Mutairi',
    type: 'Individual',
    email: 'farah.m@gmail.com',
    phone: '+971 55 333 4455',
    address: 'Apt 12B, Marina Tower',
    city: 'Dubai',
    country: 'UAE',
    nationality: 'Kuwaiti',
    preferredStyle: 'Modern Minimalist',
    budgetRange: 'Premium',
    totalProjects: 1,
    totalSpent: 145000,
    status: 'Active',
    assignedSales: 'emp-007',
    joinDate: '2024-07-01',
    lastContact: '2024-11-28',
    notes: 'Lives between Kuwait and Dubai. Communication via WhatsApp preferred.',
    tags: ['Apartment', 'Marina', 'Minimalist']
  },
  {
    id: 'cli-004',
    name: 'Tariq Hamdan',
    type: 'Individual',
    email: 'tariq@hamdancafe.ae',
    phone: '+971 50 444 5566',
    address: 'Shop 5, JBR Walk',
    city: 'Dubai',
    country: 'UAE',
    nationality: 'Jordanian',
    preferredStyle: 'Industrial Chic',
    budgetRange: 'Mid-Range',
    totalProjects: 1,
    totalSpent: 78000,
    status: 'Active',
    assignedSales: 'emp-007',
    joinDate: '2024-10-01',
    lastContact: '2024-12-01',
    notes: 'Café & restaurant design. On hold due to municipality permit delay.',
    tags: ['Commercial', 'F&B', 'On-Hold']
  },
  {
    id: 'cli-005',
    name: 'Layla Qassem',
    type: 'Individual',
    email: 'layla.q@outlook.com',
    phone: '+971 52 555 6677',
    address: 'Penthouse, Jumeirah Bay',
    city: 'Dubai',
    country: 'UAE',
    nationality: 'Lebanese',
    preferredStyle: 'Luxury Contemporary',
    budgetRange: 'Luxury',
    totalProjects: 1,
    totalSpent: 520000,
    status: 'Inactive',
    assignedSales: 'emp-007',
    joinDate: '2023-01-01',
    lastContact: '2024-03-15',
    notes: 'Project completed. Extremely satisfied. Requested referral discount for next project.',
    tags: ['Penthouse', 'Luxury', 'Completed', 'Referral-Source']
  },
  {
    id: 'cli-006',
    name: 'Al-Saber Real Estate LLC',
    type: 'Corporate',
    email: 'info@alsaber-re.ae',
    phone: '+971 4 666 7788',
    address: 'Office 404, Business Bay',
    city: 'Dubai',
    country: 'UAE',
    nationality: 'UAE Registered',
    preferredStyle: 'Modern Residential',
    budgetRange: 'Mid-Range',
    totalProjects: 0,
    totalSpent: 0,
    status: 'Prospect',
    assignedSales: 'emp-007',
    joinDate: '2024-12-01',
    lastContact: '2024-12-15',
    notes: 'Developer interested in fit-out packages for 12 units. Awaiting proposal.',
    tags: ['Developer', 'Bulk', 'Prospect']
  }
];
