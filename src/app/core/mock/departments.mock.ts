export interface MockDepartment {
  id: string;
  name: string;
  description: string;
  headId: string; // employee id
  memberIds: string[];
  isActive: boolean;
  createdAt: string;
  responsibilities: string[];
  color: string; // for UI badges
}

export const MOCK_DEPARTMENTS: MockDepartment[] = [
  {
    id: 'dept-001',
    name: 'Design Office',
    description: 'Handles all design stages: client onboarding, 2D/3D layouts, mood boards, and renders.',
    headId: 'emp-001',
    memberIds: ['emp-001', 'emp-003', 'emp-005'],
    isActive: true,
    createdAt: '2020-01-01T00:00:00Z',
    responsibilities: [
      'Stage 1 – Client Onboarding & Contract',
      'Stage 3 – 2D Interior Design Layout',
      'Stage 4 – Mood Board Creation & Approval',
      'Stage 5 – 3D Render Production',
      'Stage 6 – Design-to-Technical Handover (co-owner)'
    ],
    color: '#6cd3f7'
  },
  {
    id: 'dept-002',
    name: 'Technical Office',
    description: 'Handles site surveys, execution planning, BOQ, vendor management, and site supervision.',
    headId: 'emp-002',
    memberIds: ['emp-002', 'emp-004', 'emp-006'],
    isActive: true,
    createdAt: '2020-01-01T00:00:00Z',
    responsibilities: [
      'Stage 2 – Technical Site Survey',
      'Stage 6 – Design-to-Technical Handover (co-owner)',
      'Stage 7 – Technical Execution Preparation',
      'Stage 8 – Site Execution Kick-Off'
    ],
    color: '#041627'
  },
  {
    id: 'dept-003',
    name: 'Sales',
    description: 'Client acquisition, project initiation handover to Design Office, and relationship management.',
    headId: 'emp-007',
    memberIds: ['emp-007'],
    isActive: true,
    createdAt: '2020-01-01T00:00:00Z',
    responsibilities: [
      'Lead generation and qualification',
      'Initial client meetings',
      'Project record creation in MOMS',
      'Handover to Design Office'
    ],
    color: '#34a853'
  },
  {
    id: 'dept-004',
    name: 'Finance',
    description: 'Financial reporting, invoice management, payroll, and project budget tracking.',
    headId: 'emp-008',
    memberIds: ['emp-008'],
    isActive: true,
    createdAt: '2020-01-01T00:00:00Z',
    responsibilities: [
      'Project budget monitoring',
      'Invoice generation and tracking',
      'BOQ financial analysis',
      'Vendor payment processing',
      'Monthly financial reports'
    ],
    color: '#fbbc04'
  }
];
