export interface KpiMetric {
  label: string;
  value: number;
  unit: string;
  target: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
}

export interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave' | 'Holiday';
  checkIn: string | null;
  checkOut: string | null;
  hoursWorked: number;
}

export interface EmployeeKpi {
  employeeId: string;
  period: 'monthly' | 'quarterly' | 'annual';
  periodLabel: string;
  attendanceRate: number;
  tasksCompleted: number;
  tasksTotal: number;
  tasksOnTime: number;
  performanceRating: number; // 0-5
  clientSatisfaction: number; // 0-10
  revenueContributed: number;
  projectsWorkedOn: number;
  revisionCycles: number; // lower is better
  velocityData: { month: string; value: number }[];
  objectives: { name: string; progress: number; status: 'On-Track' | 'At-Risk' | 'Behind' }[];
  skills: { name: string; level: number }[];
  attendance: AttendanceRecord[];
  recentContributions: {
    date: string;
    action: string;
    project: string;
    category: string;
    impact: number;
  }[];
}

export const MOCK_KPIs: EmployeeKpi[] = [
  {
    employeeId: 'emp-001',
    period: 'monthly',
    periodLabel: 'December 2024',
    attendanceRate: 96,
    tasksCompleted: 31,
    tasksTotal: 34,
    tasksOnTime: 29,
    performanceRating: 4.7,
    clientSatisfaction: 9.2,
    revenueContributed: 185000,
    projectsWorkedOn: 4,
    revisionCycles: 1.2,
    velocityData: [
      { month: 'Jul', value: 82 }, { month: 'Aug', value: 87 },
      { month: 'Sep', value: 85 }, { month: 'Oct', value: 91 },
      { month: 'Nov', value: 94 }, { month: 'Dec', value: 96 }
    ],
    objectives: [
      { name: 'Complete Al-Rashid Stage 3', progress: 65, status: 'On-Track' },
      { name: 'Reduce revision cycles to < 1.5', progress: 80, status: 'On-Track' },
      { name: 'Train junior designers on V-Ray', progress: 100, status: 'On-Track' },
      { name: 'Finalize Nour Office renders', progress: 90, status: 'On-Track' }
    ],
    skills: [
      { name: 'Client Relations', level: 95 },
      { name: '3D Visualization', level: 88 },
      { name: 'AutoCAD / 2D', level: 92 },
      { name: 'Project Management', level: 85 },
      { name: 'Mood Board', level: 97 }
    ],
    attendance: [
      { date: '2024-12-01', status: 'Present', checkIn: '08:15', checkOut: '17:30', hoursWorked: 9.25 },
      { date: '2024-12-02', status: 'Present', checkIn: '08:00', checkOut: '18:00', hoursWorked: 10 },
      { date: '2024-12-03', status: 'Present', checkIn: '08:30', checkOut: '17:00', hoursWorked: 8.5 },
      { date: '2024-12-04', status: 'Leave', checkIn: null, checkOut: null, hoursWorked: 0 },
      { date: '2024-12-05', status: 'Present', checkIn: '08:10', checkOut: '17:45', hoursWorked: 9.58 },
      { date: '2024-12-08', status: 'Present', checkIn: '08:00', checkOut: '17:30', hoursWorked: 9.5 },
      { date: '2024-12-09', status: 'Late', checkIn: '09:45', checkOut: '18:00', hoursWorked: 8.25 },
      { date: '2024-12-10', status: 'Present', checkIn: '08:20', checkOut: '17:30', hoursWorked: 9.17 },
      { date: '2024-12-11', status: 'Present', checkIn: '08:05', checkOut: '18:30', hoursWorked: 10.42 },
      { date: '2024-12-12', status: 'Present', checkIn: '08:00', checkOut: '17:00', hoursWorked: 9 }
    ],
    recentContributions: [
      { date: '2024-12-16', action: 'Completed mood board for Al-Rashid Stage 4', project: 'MOMS-2024-001', category: 'Design', impact: 9 },
      { date: '2024-12-14', action: 'Client approval obtained on 2D layout', project: 'MOMS-2024-001', category: 'Approval', impact: 10 },
      { date: '2024-12-12', action: 'Led design-technical handover for Nour Office', project: 'MOMS-2024-002', category: 'Coordination', impact: 8 },
      { date: '2024-12-10', action: 'Produced 3D renders (3 rooms) for Farah Residential', project: 'MOMS-2024-003', category: 'Visualization', impact: 9 },
      { date: '2024-12-08', action: 'Mentored Nour Ibrahim on V-Ray lighting techniques', project: 'Internal', category: 'Training', impact: 7 }
    ]
  },
  {
    employeeId: 'emp-002',
    period: 'monthly',
    periodLabel: 'December 2024',
    attendanceRate: 98,
    tasksCompleted: 28,
    tasksTotal: 30,
    tasksOnTime: 27,
    performanceRating: 4.5,
    clientSatisfaction: 8.8,
    revenueContributed: 420000,
    projectsWorkedOn: 5,
    revisionCycles: 0.8,
    velocityData: [
      { month: 'Jul', value: 85 }, { month: 'Aug', value: 88 },
      { month: 'Sep', value: 90 }, { month: 'Oct', value: 87 },
      { month: 'Nov', value: 92 }, { month: 'Dec', value: 95 }
    ],
    objectives: [
      { name: 'Complete Farah execution BOQ', progress: 100, status: 'On-Track' },
      { name: 'Onboard 2 new vendors Q4', progress: 100, status: 'On-Track' },
      { name: 'Reduce site snag rate by 20%', progress: 75, status: 'On-Track' },
      { name: 'Technical handover Nour Office', progress: 85, status: 'At-Risk' }
    ],
    skills: [
      { name: 'BOQ Preparation', level: 96 },
      { name: 'Site Supervision', level: 92 },
      { name: 'Vendor Management', level: 88 },
      { name: 'AutoCAD / Technical', level: 90 },
      { name: 'Contract Management', level: 85 }
    ],
    attendance: [
      { date: '2024-12-01', status: 'Present', checkIn: '07:45', checkOut: '17:00', hoursWorked: 9.25 },
      { date: '2024-12-02', status: 'Present', checkIn: '07:30', checkOut: '17:30', hoursWorked: 10 },
      { date: '2024-12-03', status: 'Present', checkIn: '07:45', checkOut: '16:45', hoursWorked: 9 },
      { date: '2024-12-04', status: 'Present', checkIn: '08:00', checkOut: '17:00', hoursWorked: 9 },
      { date: '2024-12-05', status: 'Present', checkIn: '07:50', checkOut: '17:15', hoursWorked: 9.42 }
    ],
    recentContributions: [
      { date: '2024-12-16', action: 'Approved execution panels for Farah Residential Stage 7', project: 'MOMS-2024-003', category: 'Technical', impact: 9 },
      { date: '2024-12-13', action: 'Completed BOQ for Nour Office (148 line items)', project: 'MOMS-2024-002', category: 'BOQ', impact: 10 },
      { date: '2024-12-11', action: 'Site inspection & snag list — Layla Penthouse', project: 'MOMS-2023-011', category: 'Quality', impact: 8 },
      { date: '2024-12-09', action: 'Negotiated vendor contract saving 12% on tiles supply', project: 'MOMS-2024-001', category: 'Procurement', impact: 9 }
    ]
  },
  {
    employeeId: 'emp-003',
    period: 'monthly',
    periodLabel: 'December 2024',
    attendanceRate: 92,
    tasksCompleted: 22,
    tasksTotal: 26,
    tasksOnTime: 19,
    performanceRating: 4.0,
    clientSatisfaction: 8.4,
    revenueContributed: 95000,
    projectsWorkedOn: 3,
    revisionCycles: 2.1,
    velocityData: [
      { month: 'Jul', value: 75 }, { month: 'Aug', value: 79 },
      { month: 'Sep', value: 81 }, { month: 'Oct', value: 84 },
      { month: 'Nov', value: 86 }, { month: 'Dec', value: 88 }
    ],
    objectives: [
      { name: 'Reduce revision cycles below 2.0', progress: 55, status: 'At-Risk' },
      { name: 'Deliver Tariq Café mood board', progress: 40, status: 'Behind' },
      { name: 'Complete CIDA Intermediate course', progress: 70, status: 'On-Track' }
    ],
    skills: [
      { name: 'Mood Board Creation', level: 88 },
      { name: '3ds Max', level: 82 },
      { name: 'Furniture Selection', level: 90 },
      { name: 'Client Presentation', level: 78 },
      { name: 'AutoCAD', level: 75 }
    ],
    attendance: [],
    recentContributions: [
      { date: '2024-12-14', action: 'Presented mood board options to Tariq Café client', project: 'MOMS-2024-005', category: 'Design', impact: 7 },
      { date: '2024-12-11', action: 'Furniture layout options for Al-Rashid living areas', project: 'MOMS-2024-001', category: 'Design', impact: 8 }
    ]
  }
];
