import { ProjectListItem, ProjectDetail, ProjectStageStatus, ChecklistItem, DocumentRecord } from '../models/project.model';

// ── Stage name helper ────────────────────────────────────────────────────────
export const STAGE_NAMES = [
  'Client Onboarding & Contract',
  'Technical Site Survey',
  '2D Interior Design Layout',
  'Mood Board Creation & Approval',
  '3D Render Production',
  'Design-to-Technical Handover',
  'Technical Execution Preparation',
  'Site Execution Kick-Off'
];

export const STAGE_OFFICE = [
  '#design', '#technical', '#design', '#design',
  '#design', '#design + #technical', '#technical', '#technical + #execution'
];

// ── Helper to build gate status ───────────────────────────────────────────────
function gate(
  stage: number,
  status: 'Locked' | 'Cleared' | 'Review',
  checks: { checklist: boolean; docs: boolean; client: boolean; budget: boolean },
  approvedBy?: string
): ProjectStageStatus['gateStatus'] {
  return {
    stage,
    gateStatus: status,
    conditions: {
      checklistComplete: checks.checklist,
      documentsUploaded: checks.docs,
      clientApproved: checks.client,
      budgetApproved: checks.budget
    },
    approvedBy: approvedBy || null,
    approvalDate: approvedBy ? new Date('2024-11-15') : null,
    blockingIssues: status === 'Locked'
      ? Object.entries(checks)
          .filter(([, v]) => !v)
          .map(([k]) => ({
            checklist: 'Checklist not fully complete',
            docs: 'Required documents not uploaded',
            client: 'Awaiting client digital approval',
            budget: 'Budget not approved'
          }[k] || k))
      : []
  };
}

// ── Helper to build stage status ──────────────────────────────────────────────
function stageStatus(
  stage: number,
  status: ProjectStageStatus['status'],
  gateResult: ProjectStageStatus['gateStatus'],
  assignedTo: string,
  officeOverride?: string
): ProjectStageStatus {
  return {
    stage,
    name: STAGE_NAMES[stage - 1],
    officeResponsible: officeOverride || STAGE_OFFICE[stage - 1],
    status,
    gateStatus: gateResult,
    completionDate: status === 'Completed' ? new Date(`2024-1${stage}-01`) : null,
    assignedTo,
    notes: ''
  };
}

// ── Full mock checklist data ──────────────────────────────────────────────────
export const MOCK_ALL_CHECKLISTS: Record<string, ChecklistItem[]> = {
  // ── PROJECT 001 — Stage 1 (Completed) ──
  'proj-001-1': [
    { id:'cl-001-1-1', stage:1, title:'Portfolio presentation to client', description:'Present firm capabilities; upload deck to MOMS; record Project Start Date.', isRequired:true, isCompleted:true, completedBy:'Sara Nasser', completedDate:new Date('2024-11-01'), notes:'Client attended in person — Abu Dhabi office.', order:1 },
    { id:'cl-001-1-2', stage:1, title:'Complete Client Application Form', description:'Fill all mandatory fields; lock form after submission.', isRequired:true, isCompleted:true, completedBy:'Sara Nasser', completedDate:new Date('2024-11-01'), notes:'', order:2 },
    { id:'cl-001-1-3', stage:1, title:'Initialise material checklist', description:'Pre-populate categories based on villa project type.', isRequired:true, isCompleted:true, completedBy:'Sara Nasser', completedDate:new Date('2024-11-02'), notes:'', order:3 },
    { id:'cl-001-1-4', stage:1, title:'Produce budget analysis report', description:'Verify AED 185,000 budget is realistic for 450 sqm villa.', isRequired:true, isCompleted:true, completedBy:'Sara Nasser', completedDate:new Date('2024-11-02'), notes:'Budget confirmed adequate for mid-premium finish.', order:4 },
    { id:'cl-001-1-5', stage:1, title:'Obtain signed design contract', description:'Send via digital portal; client must sign before Stage 2.', isRequired:true, isCompleted:true, completedBy:'Sara Nasser', completedDate:new Date('2024-11-03'), notes:'Signed digitally. Gate G1 cleared.', order:5 }
  ],
  // ── PROJECT 001 — Stage 2 (Completed) ──
  'proj-001-2': [
    { id:'cl-001-2-1', stage:2, title:'Schedule site visit with client', description:'Agree date/time; log in MOMS; auto-reminder 24h before.', isRequired:true, isCompleted:true, completedBy:'Khaled Al-Farsi', completedDate:new Date('2024-11-07'), notes:'Visit confirmed for Nov 8.', order:1 },
    { id:'cl-001-2-2', stage:2, title:'Fill site application form on-site', description:'Use MOMS mobile app; geotag all photos; submit in real time.', isRequired:true, isCompleted:true, completedBy:'Khaled Al-Farsi', completedDate:new Date('2024-11-08'), notes:'48 photos uploaded.', order:2 },
    { id:'cl-001-2-3', stage:2, title:'Complete precise measurements', description:'All rooms, windows, doors, structural elements — millimetre precision.', isRequired:true, isCompleted:true, completedBy:'Khaled Al-Farsi', completedDate:new Date('2024-11-08'), notes:'Laser meter used. Total 14 rooms surveyed.', order:3 },
    { id:'cl-001-2-4', stage:2, title:'Produce As-Built 2D Plan', description:'CAD drawing with title block; upload PDF + DWG.', isRequired:true, isCompleted:true, completedBy:'Khaled Al-Farsi', completedDate:new Date('2024-11-10'), notes:'Tech Manager reviewed and approved.', order:4 }
  ],
  // ── PROJECT 001 — Stage 3 (In Progress) ──
  'proj-001-3': [
    { id:'cl-001-3-1', stage:3, title:'Architectural Modification Panel', description:'Colour-code demolition/new build/modifications; Tech Manager sign-off required.', isRequired:true, isCompleted:true, completedBy:'Sara Nasser', completedDate:new Date('2024-11-15'), notes:'3 non-structural walls to be removed.', order:1 },
    { id:'cl-001-3-2', stage:3, title:'Furniture Options Document (2–3 options per room)', description:'Present to client; record selection in MOMS.', isRequired:true, isCompleted:true, completedBy:'Layla Hassan', completedDate:new Date('2024-11-22'), notes:'Client selected Option B for living and Option A for master.', order:2 },
    { id:'cl-001-3-3', stage:3, title:'Final 2D Furniture Layout (dimensioned)', description:'Based on client selection; send for digital approval.', isRequired:true, isCompleted:false, completedBy:null, completedDate:null, notes:'In progress — target Dec 20.', order:3 },
    { id:'cl-001-3-4', stage:3, title:'Air Conditioning Panel', description:'AC type, indoor unit locations, pipe routing, outlet positions.', isRequired:true, isCompleted:false, completedBy:null, completedDate:null, notes:'', order:4 },
    { id:'cl-001-3-5', stage:3, title:'TV / Entertainment Panel', description:'TV points, satellite, speaker wire routing, data sockets.', isRequired:false, isCompleted:false, completedBy:null, completedDate:null, notes:'', order:5 }
  ],
  // ── PROJECT 002 — All stages ──
  'proj-002-1': [
    { id:'cl-002-1-1', stage:1, title:'Portfolio presentation', description:'', isRequired:true, isCompleted:true, completedBy:'Sara Nasser', completedDate:new Date('2024-09-16'), notes:'', order:1 },
    { id:'cl-002-1-2', stage:1, title:'Client Application Form', description:'', isRequired:true, isCompleted:true, completedBy:'Sara Nasser', completedDate:new Date('2024-09-16'), notes:'', order:2 },
    { id:'cl-002-1-3', stage:1, title:'Checklist initialisation', description:'', isRequired:true, isCompleted:true, completedBy:'Sara Nasser', completedDate:new Date('2024-09-17'), notes:'', order:3 },
    { id:'cl-002-1-4', stage:1, title:'Budget analysis', description:'', isRequired:true, isCompleted:true, completedBy:'Sara Nasser', completedDate:new Date('2024-09-17'), notes:'', order:4 },
    { id:'cl-002-1-5', stage:1, title:'Signed design contract', description:'', isRequired:true, isCompleted:true, completedBy:'Sara Nasser', completedDate:new Date('2024-09-18'), notes:'', order:5 }
  ],
  'proj-002-6': [
    { id:'cl-002-6-1', stage:6, title:'Pre-meeting preparation by Design Manager', description:'Consolidated client requests summary; walkthrough presentation ready.', isRequired:true, isCompleted:true, completedBy:'Sara Nasser', completedDate:new Date('2024-12-10'), notes:'', order:1 },
    { id:'cl-002-6-2', stage:6, title:'Pre-meeting preparation by Technical Manager', description:'Technical questions and initial complexity assessment.', isRequired:true, isCompleted:true, completedBy:'Omar Khalil', completedDate:new Date('2024-12-10'), notes:'', order:2 },
    { id:'cl-002-6-3', stage:6, title:'Handover meeting conducted', description:'Formal inter-office meeting; both managers present.', isRequired:true, isCompleted:false, completedBy:null, completedDate:null, notes:'Scheduled Dec 19.', order:3 },
    { id:'cl-002-6-4', stage:6, title:'Meeting summary drafted and dual-signed', description:'Both managers must digitally sign before Stage 7 unlocks.', isRequired:true, isCompleted:false, completedBy:null, completedDate:null, notes:'', order:4 }
  ]
};

// ── Full mock document data ───────────────────────────────────────────────────
export const MOCK_ALL_DOCUMENTS: Record<string, DocumentRecord[]> = {
  'proj-001-1': [
    { id:'doc-001-1-1', stage:1, fileName:'AlRashid_ClientApplicationForm_v1.pdf', documentType:'Client Application Form', uploadedBy:'Sara Nasser', uploadDate:new Date('2024-11-01'), version:1, fileUrl:'#', isRequired:true, approvalStatus:'Approved' },
    { id:'doc-001-1-2', stage:1, fileName:'PortfolioPresentationNov2024.pdf', documentType:'Awareness Presentation', uploadedBy:'Sara Nasser', uploadDate:new Date('2024-11-01'), version:1, fileUrl:'#', isRequired:true, approvalStatus:'Approved' },
    { id:'doc-001-1-3', stage:1, fileName:'BudgetAnalysis_AlRashid_v1.pdf', documentType:'Budget Analysis Report', uploadedBy:'Sara Nasser', uploadDate:new Date('2024-11-02'), version:1, fileUrl:'#', isRequired:true, approvalStatus:'Approved' },
    { id:'doc-001-1-4', stage:1, fileName:'DesignContract_AlRashid_SIGNED.pdf', documentType:'Design Contract', uploadedBy:'Sara Nasser', uploadDate:new Date('2024-11-03'), version:1, fileUrl:'#', isRequired:true, approvalStatus:'Approved' }
  ],
  'proj-001-2': [
    { id:'doc-001-2-1', stage:2, fileName:'SiteApplicationForm_AlRashid.pdf', documentType:'Site Application Form', uploadedBy:'Khaled Al-Farsi', uploadDate:new Date('2024-11-08'), version:1, fileUrl:'#', isRequired:true, approvalStatus:'Approved' },
    { id:'doc-001-2-2', stage:2, fileName:'AsBuilt_AlRashid_Villa_v1.pdf', documentType:'As-Built 2D Plan (PDF)', uploadedBy:'Khaled Al-Farsi', uploadDate:new Date('2024-11-10'), version:1, fileUrl:'#', isRequired:true, approvalStatus:'Approved' },
    { id:'doc-001-2-3', stage:2, fileName:'AsBuilt_AlRashid_Villa_v1.dwg', documentType:'As-Built 2D Plan (DWG)', uploadedBy:'Khaled Al-Farsi', uploadDate:new Date('2024-11-10'), version:1, fileUrl:'#', isRequired:true, approvalStatus:'Approved' }
  ],
  'proj-001-3': [
    { id:'doc-001-3-1', stage:3, fileName:'ArchModification_AlRashid_v1.pdf', documentType:'Architectural Modification Panel', uploadedBy:'Sara Nasser', uploadDate:new Date('2024-11-16'), version:1, fileUrl:'#', isRequired:true, approvalStatus:'Approved' },
    { id:'doc-001-3-2', stage:3, fileName:'FurnitureOptions_AlRashid_v2.pdf', documentType:'Furniture Options Document', uploadedBy:'Layla Hassan', uploadDate:new Date('2024-11-22'), version:2, fileUrl:'#', isRequired:true, approvalStatus:'Approved' }
  ]
};

// ── Project List Items ────────────────────────────────────────────────────────
export const MOCK_PROJECTS: ProjectListItem[] = [
  { id:'proj-001', projectCode:'MOMS-2024-001', clientName:'Mansour Al-Rashid', clientEmail:'mansour@alrashid.ae', currentStage:3, status:'Active', office:'Design', startDate:new Date('2024-11-01'), daysElapsed:47, progressPercentage:35 },
  { id:'proj-002', projectCode:'MOMS-2024-002', clientName:'Nour Capital Group', clientEmail:'projects@nourcapital.ae', currentStage:6, status:'Active', office:'Technical', startDate:new Date('2024-09-15'), daysElapsed:94, progressPercentage:72 },
  { id:'proj-003', projectCode:'MOMS-2024-003', clientName:'Farah Al-Mutairi', clientEmail:'farah.m@gmail.com', currentStage:8, status:'Active', office:'Technical', startDate:new Date('2024-07-01'), daysElapsed:170, progressPercentage:91 },
  { id:'proj-004', projectCode:'MOMS-2024-004', clientName:'Ahmad Saber Retail', clientEmail:'ahmad@saber.ae', currentStage:1, status:'Active', office:'Design', startDate:new Date('2024-12-10'), daysElapsed:8, progressPercentage:5 },
  { id:'proj-005', projectCode:'MOMS-2023-011', clientName:'Layla Qassem', clientEmail:'layla.q@outlook.com', currentStage:8, status:'Completed', office:'Technical', startDate:new Date('2023-06-01'), daysElapsed:210, progressPercentage:100 },
  { id:'proj-006', projectCode:'MOMS-2024-005', clientName:'Tariq Hamdan Café', clientEmail:'tariq@hamdancafe.ae', currentStage:4, status:'On-Hold', office:'Design', startDate:new Date('2024-10-01'), daysElapsed:78, progressPercentage:48 }
];

// ── Project Detail: proj-001 ──────────────────────────────────────────────────
export const MOCK_PROJECT_DETAIL_001: ProjectDetail = {
  id:'proj-001', projectCode:'MOMS-2024-001', clientName:'Mansour Al-Rashid',
  clientEmail:'mansour@alrashid.ae', clientPhone:'+971 50 111 2233',
  currentStage:3, status:'Active', office:'Design',
  startDate:new Date('2024-11-01'), daysElapsed:47, progressPercentage:35,
  contractValue:185000, contractDate:new Date('2024-10-28'),
  description:'Full interior design for a 450 sqm villa in Al-Nakheel, Abu Dhabi. Modern Arabic style. 6 bedrooms, 2 reception halls, kitchen, 4 bathrooms. Client requires bespoke furniture in master bedroom.',
  stageStatuses: [
    stageStatus(1,'Completed', gate(1,'Cleared',{checklist:true,docs:true,client:true,budget:true},'Sara Nasser'), 'Sara Nasser'),
    stageStatus(2,'Completed', gate(2,'Cleared',{checklist:true,docs:true,client:false,budget:true},'Omar Khalil'), 'Khaled Al-Farsi'),
    stageStatus(3,'In-Progress', gate(3,'Review',{checklist:false,docs:false,client:false,budget:true}), 'Layla Hassan'),
    stageStatus(4,'Pending', gate(4,'Locked',{checklist:false,docs:false,client:false,budget:true}), 'Sara Nasser'),
    stageStatus(5,'Pending', gate(5,'Locked',{checklist:false,docs:false,client:false,budget:true}), 'Nour Ibrahim'),
    stageStatus(6,'Pending', gate(6,'Locked',{checklist:false,docs:false,client:false,budget:false}), 'Sara Nasser'),
    stageStatus(7,'Pending', gate(7,'Locked',{checklist:false,docs:false,client:false,budget:false}), 'Omar Khalil'),
    stageStatus(8,'Pending', gate(8,'Locked',{checklist:false,docs:false,client:false,budget:false}), 'Ahmad Saber')
  ],
  recentDocuments: MOCK_ALL_DOCUMENTS['proj-001-3'],
  checklists: MOCK_ALL_CHECKLISTS['proj-001-3'],
  meetings: [
    { id:'meet-001', stage:1, title:'Initial Client Meeting', meetingDate:new Date('2024-11-01'), duration:90, attendees:['Sara Nasser', 'Mansour Al-Rashid'], summary:'Portfolio presented. Client vision discussed. Budget agreed verbally.', actionItems:['Fill Application Form', 'Send contract'], meetingNotes:'Client specifically requested walnut wood and white marble combination.' }
  ],
  budget: {
    id:'bgt-001', projectId:'proj-001', totalAllocation:185000, spent:18500, remaining:166500,
    byStage:[
      {stage:1, allocated:5000, spent:5000}, {stage:2, allocated:8000, spent:8000},
      {stage:3, allocated:12000, spent:5500}, {stage:4, allocated:10000, spent:0},
      {stage:5, allocated:20000, spent:0}, {stage:6, allocated:5000, spent:0},
      {stage:7, allocated:25000, spent:0}, {stage:8, allocated:100000, spent:0}
    ],
    approved:true, approvedBy:'Sara Nasser', approvalDate:new Date('2024-11-02')
  },
  approvals: []
};

// ── Project Detail: proj-002 ──────────────────────────────────────────────────
export const MOCK_PROJECT_DETAIL_002: ProjectDetail = {
  id:'proj-002', projectCode:'MOMS-2024-002', clientName:'Nour Capital Group',
  clientEmail:'projects@nourcapital.ae', clientPhone:'+971 4 222 3344',
  currentStage:6, status:'Active', office:'Technical',
  startDate:new Date('2024-09-15'), daysElapsed:94, progressPercentage:72,
  contractValue:320000, contractDate:new Date('2024-09-12'),
  description:'Open-plan office fit-out in DIFC. 1,200 sqm across 3 floors. Contemporary corporate style. Reception, 8 executive offices, 2 board rooms, open workspace for 60 staff, 2 pantries.',
  stageStatuses:[
    stageStatus(1,'Completed', gate(1,'Cleared',{checklist:true,docs:true,client:true,budget:true},'Sara Nasser'), 'Sara Nasser'),
    stageStatus(2,'Completed', gate(2,'Cleared',{checklist:true,docs:true,client:false,budget:true},'Omar Khalil'), 'Khaled Al-Farsi'),
    stageStatus(3,'Completed', gate(3,'Cleared',{checklist:true,docs:true,client:true,budget:true},'Sara Nasser'), 'Sara Nasser'),
    stageStatus(4,'Completed', gate(4,'Cleared',{checklist:true,docs:true,client:true,budget:true},'Sara Nasser'), 'Layla Hassan'),
    stageStatus(5,'Completed', gate(5,'Cleared',{checklist:true,docs:true,client:true,budget:true},'Sara Nasser'), 'Nour Ibrahim'),
    stageStatus(6,'In-Progress', gate(6,'Review',{checklist:true,docs:false,client:false,budget:true}), 'Sara Nasser'),
    stageStatus(7,'Pending', gate(7,'Locked',{checklist:false,docs:false,client:false,budget:false}), 'Omar Khalil'),
    stageStatus(8,'Pending', gate(8,'Locked',{checklist:false,docs:false,client:false,budget:false}), 'Ahmad Saber')
  ],
  recentDocuments:[
    { id:'doc-002-5-1', stage:5, fileName:'3DRenders_NourOffice_AllFloors.pdf', documentType:'3D Render Package', uploadedBy:'Nour Ibrahim', uploadDate:new Date('2024-12-08'), version:1, fileUrl:'#', isRequired:true, approvalStatus:'Approved' }
  ],
  checklists: MOCK_ALL_CHECKLISTS['proj-002-6'],
  meetings:[
    { id:'meet-002', stage:6, title:'Design-Technical Handover Meeting', meetingDate:new Date('2024-12-19'), duration:120, attendees:['Sara Nasser', 'Omar Khalil', 'Layla Hassan'], summary:'Scheduled', actionItems:['Prepare design walkthroughs', 'Prepare technical question list'], meetingNotes:'' }
  ],
  budget:{
    id:'bgt-002', projectId:'proj-002', totalAllocation:320000, spent:95000, remaining:225000,
    byStage:[
      {stage:1,allocated:8000,spent:8000},{stage:2,allocated:15000,spent:15000},
      {stage:3,allocated:20000,spent:20000},{stage:4,allocated:15000,spent:15000},
      {stage:5,allocated:35000,spent:35000},{stage:6,allocated:7000,spent:2000},
      {stage:7,allocated:40000,spent:0},{stage:8,allocated:180000,spent:0}
    ],
    approved:true, approvedBy:'Sara Nasser', approvalDate:new Date('2024-09-16')
  },
  approvals:[]
};

// ── Master project detail map ─────────────────────────────────────────────────
export const MOCK_PROJECT_DETAILS: Record<string, ProjectDetail> = {
  'proj-001': MOCK_PROJECT_DETAIL_001,
  'proj-002': MOCK_PROJECT_DETAIL_002,
  'proj-003': { ...MOCK_PROJECT_DETAIL_001, id:'proj-003', projectCode:'MOMS-2024-003', clientName:'Farah Al-Mutairi', currentStage:8, progressPercentage:91, contractValue:145000, status:'Active', office:'Technical' },
  'proj-004': { ...MOCK_PROJECT_DETAIL_001, id:'proj-004', projectCode:'MOMS-2024-004', clientName:'Ahmad Saber Retail', currentStage:1, progressPercentage:5, contractValue:78000, status:'Active', office:'Design' },
  'proj-005': { ...MOCK_PROJECT_DETAIL_001, id:'proj-005', projectCode:'MOMS-2023-011', clientName:'Layla Qassem', currentStage:8, progressPercentage:100, contractValue:520000, status:'Completed', office:'Technical' },
  'proj-006': { ...MOCK_PROJECT_DETAIL_001, id:'proj-006', projectCode:'MOMS-2024-005', clientName:'Tariq Hamdan Café', currentStage:4, progressPercentage:48, contractValue:78000, status:'On-Hold', office:'Design' }
};
