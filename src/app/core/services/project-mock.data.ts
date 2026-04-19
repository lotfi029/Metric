import {
  ProjectListItem,
  ProjectDetail,
  ChecklistItem,
  DocumentRecord,
  ProjectStageStatus
} from '../models/project.model';

// ─── Mock Project List ────────────────────────────────────────────────────────

export const MOCK_PROJECTS: ProjectListItem[] = [
  {
    id: 'proj-001',
    projectCode: 'MOMS-2024-001',
    clientName: 'Al-Rashid Villa',
    clientEmail: 'alrashid@example.com',
    currentStage: 3,
    status: 'Active',
    office: 'Design',
    startDate: new Date('2024-11-01'),
    daysElapsed: 47,
    progressPercentage: 35
  },
  {
    id: 'proj-002',
    projectCode: 'MOMS-2024-002',
    clientName: 'Nour Office Complex',
    clientEmail: 'nour@office.com',
    currentStage: 6,
    status: 'Active',
    office: 'Technical',
    startDate: new Date('2024-09-15'),
    daysElapsed: 94,
    progressPercentage: 72
  },
  {
    id: 'proj-003',
    projectCode: 'MOMS-2024-003',
    clientName: 'Farah Residential',
    clientEmail: 'farah@home.com',
    currentStage: 8,
    status: 'Active',
    office: 'Technical',
    startDate: new Date('2024-07-01'),
    daysElapsed: 170,
    progressPercentage: 91
  },
  {
    id: 'proj-004',
    projectCode: 'MOMS-2024-004',
    clientName: 'Saber Retail Fit-out',
    clientEmail: 'saber@retail.com',
    currentStage: 1,
    status: 'Active',
    office: 'Design',
    startDate: new Date('2024-12-10'),
    daysElapsed: 8,
    progressPercentage: 5
  },
  {
    id: 'proj-005',
    projectCode: 'MOMS-2023-011',
    clientName: 'Layla Penthouse',
    clientEmail: 'layla@penthouse.com',
    currentStage: 8,
    status: 'Completed',
    office: 'Technical',
    startDate: new Date('2023-06-01'),
    daysElapsed: 210,
    progressPercentage: 100
  },
  {
    id: 'proj-006',
    projectCode: 'MOMS-2024-005',
    clientName: 'Tariq Café Design',
    clientEmail: 'tariq@cafe.com',
    currentStage: 4,
    status: 'On-Hold',
    office: 'Design',
    startDate: new Date('2024-10-01'),
    daysElapsed: 78,
    progressPercentage: 48
  }
];

// ─── Mock Stage Gate ──────────────────────────────────────────────────────────

const makeStageMeta = (
  stage: number,
  status: ProjectStageStatus['status'],
  gateStatus: 'Locked' | 'Cleared' | 'Review',
  checklistComplete: boolean,
  docsUploaded: boolean,
  clientApproved: boolean
): ProjectStageStatus => ({
  stage,
  name: [
    'Client Onboarding', 'Site Survey', '2D Layout', 'Mood Board',
    '3D Renders', 'Handover Meeting', 'Technical Prep', 'Site Execution'
  ][stage - 1],
  officeResponsible: stage <= 5 ? '#design' : '#technical',
  status,
  gateStatus: {
    stage,
    gateStatus,
    conditions: {
      checklistComplete,
      documentsUploaded: docsUploaded,
      clientApproved,
      budgetApproved: stage < 5
    },
    approvedBy: gateStatus === 'Cleared' ? 'Ahmed Al-Farsi' : null,
    approvalDate: gateStatus === 'Cleared' ? new Date('2024-11-15') : null,
    blockingIssues: gateStatus === 'Locked' ? ['Pending client approval'] : []
  },
  completionDate: status === 'Completed' ? new Date() : null,
  assignedTo: stage % 2 === 0 ? 'Omar Khalil' : 'Sara Nasser',
  notes: ''
});

// ─── Mock Checklist Items ─────────────────────────────────────────────────────

export const MOCK_CHECKLIST_ITEMS: Record<string, ChecklistItem[]> = {
  'proj-001-1': [
    {
      id: 'cl-001', stage: 1, title: 'Portfolio presentation to client',
      description: 'Present firm portfolio; upload presentation deck to MOMS',
      isRequired: true, isCompleted: true,
      completedBy: 'Sara Nasser', completedDate: new Date('2024-11-01'),
      notes: '', order: 1
    },
    {
      id: 'cl-002', stage: 1, title: 'Complete Client Application Form',
      description: 'Fill and lock the client application form with all project requirements',
      isRequired: true, isCompleted: true,
      completedBy: 'Sara Nasser', completedDate: new Date('2024-11-01'),
      notes: '', order: 2
    },
    {
      id: 'cl-003', stage: 1, title: 'Initialise material checklist',
      description: 'Create checklist structure from project type — do not fill specifications yet',
      isRequired: true, isCompleted: true,
      completedBy: 'Sara Nasser', completedDate: new Date('2024-11-02'),
      notes: '', order: 3
    },
    {
      id: 'cl-004', stage: 1, title: 'Produce budget analysis report',
      description: 'Verify client budget is realistic against scope; upload report',
      isRequired: true, isCompleted: true,
      completedBy: 'Sara Nasser', completedDate: new Date('2024-11-02'),
      notes: '', order: 4
    },
    {
      id: 'cl-005', stage: 1, title: 'Obtain signed design contract',
      description: 'Send contract via digital portal; client must sign before Stage 2 activates',
      isRequired: true, isCompleted: true,
      completedBy: 'Sara Nasser', completedDate: new Date('2024-11-03'),
      notes: '', order: 5
    }
  ],
  'proj-001-2': [
    {
      id: 'cl-010', stage: 2, title: 'Schedule site visit with client',
      description: 'Agree date/time; log in MOMS; send automated reminder 24h before',
      isRequired: true, isCompleted: true,
      completedBy: 'Omar Khalil', completedDate: new Date('2024-11-07'),
      notes: '', order: 1
    },
    {
      id: 'cl-011', stage: 2, title: 'Fill site application form on-site',
      description: 'Use MOMS mobile app; geotag all photos; submit in real time',
      isRequired: true, isCompleted: true,
      completedBy: 'Omar Khalil', completedDate: new Date('2024-11-08'),
      notes: '', order: 2
    },
    {
      id: 'cl-012', stage: 2, title: 'Complete precise measurements',
      description: 'All rooms, windows, doors, structural elements — millimetre precision',
      isRequired: true, isCompleted: true,
      completedBy: 'Omar Khalil', completedDate: new Date('2024-11-08'),
      notes: '', order: 3
    },
    {
      id: 'cl-013', stage: 2, title: 'Upload As-Built 2D Plan (PDF + DWG)',
      description: 'Both file types required; Technical Manager must review before release',
      isRequired: true, isCompleted: true,
      completedBy: 'Omar Khalil', completedDate: new Date('2024-11-10'),
      notes: '', order: 4
    }
  ],
  'proj-001-3': [
    {
      id: 'cl-020', stage: 3, title: 'Produce Architectural Modification Panel',
      description: 'Identify demolition (red), new build (green), modifications (blue)',
      isRequired: true, isCompleted: true,
      completedBy: 'Sara Nasser', completedDate: new Date('2024-11-15'),
      notes: '', order: 1
    },
    {
      id: 'cl-021', stage: 3, title: 'Create 2–3 Furniture Options per room',
      description: 'Present options to client; record selection in MOMS',
      isRequired: true, isCompleted: false,
      completedBy: null, completedDate: null,
      notes: '', order: 2
    },
    {
      id: 'cl-022', stage: 3, title: 'Produce Final 2D Furniture Layout',
      description: 'Dimensioned drawing based on client-selected option; send for client approval',
      isRequired: true, isCompleted: false,
      completedBy: null, completedDate: null,
      notes: '', order: 3
    },
    {
      id: 'cl-023', stage: 3, title: 'Upload AC / TV / Heater panels',
      description: 'Three separate technical service panels — used later in Stage 7',
      isRequired: true, isCompleted: false,
      completedBy: null, completedDate: null,
      notes: '', order: 4
    }
  ]
};

// ─── Mock Project Detail ──────────────────────────────────────────────────────

export const MOCK_PROJECT_DETAIL: Record<string, ProjectDetail> = {
  'proj-001': {
    id: 'proj-001',
    projectCode: 'MOMS-2024-001',
    clientName: 'Al-Rashid Villa',
    clientEmail: 'alrashid@example.com',
    clientPhone: '+966 50 123 4567',
    currentStage: 3,
    status: 'Active',
    office: 'Design',
    startDate: new Date('2024-11-01'),
    daysElapsed: 47,
    progressPercentage: 35,
    contractValue: 185000,
    contractDate: new Date('2024-10-28'),
    description: 'Full interior design for a 450 sqm villa in Al-Nakheel district. Modern Arabic style with contemporary finishes.',
    stageStatuses: [
      makeStageMeta(1, 'Completed', 'Cleared', true, true, true),
      makeStageMeta(2, 'Completed', 'Cleared', true, true, false),
      makeStageMeta(3, 'In-Progress', 'Review', false, false, false),
      makeStageMeta(4, 'Pending', 'Locked', false, false, false),
      makeStageMeta(5, 'Pending', 'Locked', false, false, false),
      makeStageMeta(6, 'Pending', 'Locked', false, false, false),
      makeStageMeta(7, 'Pending', 'Locked', false, false, false),
      makeStageMeta(8, 'Pending', 'Locked', false, false, false),
    ],
    recentDocuments: [
      {
        id: 'd-001', stage: 1, fileName: 'Design_Contract_AlRashid.pdf',
        documentType: 'Design Contract', uploadedBy: 'Sara Nasser',
        uploadDate: new Date('2024-11-02'), version: 1,
        fileUrl: '#', isRequired: true, approvalStatus: 'Approved'
      },
      {
        id: 'd-002', stage: 2, fileName: 'AsBuilt_2D_Plan_AlRashid.dwg',
        documentType: 'As-Built Plan', uploadedBy: 'Omar Khalil',
        uploadDate: new Date('2024-11-08'), version: 1,
        fileUrl: '#', isRequired: true, approvalStatus: 'Approved'
      },
      {
        id: 'd-003', stage: 3, fileName: 'Furniture_Options_v2.pdf',
        documentType: 'Furniture Options', uploadedBy: 'Sara Nasser',
        uploadDate: new Date('2024-11-20'), version: 2,
        fileUrl: '#', isRequired: true, approvalStatus: 'Pending'
      }
    ],
    checklists: MOCK_CHECKLIST_ITEMS['proj-001-3'] || [],
    meetings: [],
    budget: {
      id: 'b-001', projectId: 'proj-001',
      totalAllocation: 185000, spent: 12000, remaining: 173000,
      byStage: [], approved: true, approvedBy: 'Manager', approvalDate: new Date()
    },
    approvals: []
  }
};

// ─── Mock Documents per Stage ─────────────────────────────────────────────────

export const MOCK_DOCUMENTS: Record<string, DocumentRecord[]> = {
  'proj-001-3': [
    {
      id: 'd-010', stage: 3,
      fileName: 'Arch_Modification_Panel_v1.pdf',
      documentType: 'Architectural Modification Panel',
      uploadedBy: 'Sara Nasser',
      uploadDate: new Date('2024-11-16'),
      version: 1, fileUrl: '#',
      isRequired: true, approvalStatus: 'Approved'
    },
    {
      id: 'd-011', stage: 3,
      fileName: 'Furniture_Options_AlRashid_v2.pdf',
      documentType: 'Furniture Options Document',
      uploadedBy: 'Sara Nasser',
      uploadDate: new Date('2024-11-20'),
      version: 2, fileUrl: '#',
      isRequired: true, approvalStatus: 'Pending'
    }
  ]
};

// ─── Mock Gate Status ─────────────────────────────────────────────────────────

export const MOCK_GATE_STATUS: Record<string, any> = {
  'proj-001-3': {
    stage: 3,
    gateStatus: 'Review',
    conditions: {
      checklistComplete: false,
      documentsUploaded: false,
      clientApproved: false,
      budgetApproved: true
    },
    approvedBy: null,
    approvalDate: null,
    blockingIssues: [
      'Final 2D Furniture Layout not yet uploaded',
      'Awaiting client approval on furniture options'
    ]
  }
};
