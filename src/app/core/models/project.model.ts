// Project and MOMS Workflow Models

export interface ProjectListItem {
  id: string;
  projectCode: string;
  clientName: string;
  clientEmail: string;
  currentStage: number; // 1-8
  status: 'Active' | 'Completed' | 'On-Hold';
  office: 'Design' | 'Technical';
  startDate: Date;
  daysElapsed: number;
  progressPercentage: number;
}

export interface ProjectDetail extends ProjectListItem {
  clientPhone: string;
  contractValue: number;
  contractDate: Date;
  description: string;
  stageStatuses: ProjectStageStatus[];
  recentDocuments: DocumentRecord[];
  checklists: ChecklistItem[];
  meetings: MeetingRecord[];
  budget: BudgetRecord;
  approvals: ClientApprovalRecord[];
}

export interface ProjectStageStatus {
  stage: number;
  name: string;
  officeResponsible: string;
  status: 'Pending' | 'In-Progress' | 'Completed' | 'Blocked';
  gateStatus: StageGateStatus;
  completionDate: Date | null;
  assignedTo: string;
  notes: string;
}

export interface StageGateStatus {
  stage: number;
  gateStatus: 'Locked' | 'Cleared' | 'Review';
  conditions: {
    checklistComplete: boolean;
    documentsUploaded: boolean;
    clientApproved: boolean;
    budgetApproved: boolean;
  };
  approvedBy: string | null;
  approvalDate: Date | null;
  blockingIssues: string[];
}

export interface ChecklistItem {
  id: string;
  stage: number;
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  completedBy: string | null;
  completedDate: Date | null;
  notes: string;
  order: number;
}

export interface DocumentRecord {
  id: string;
  stage: number;
  fileName: string;
  documentType: string;
  uploadedBy: string;
  uploadDate: Date;
  version: number;
  fileUrl: string;
  isRequired: boolean;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
}

export interface MeetingRecord {
  id: string;
  stage: number;
  title: string;
  meetingDate: Date;
  duration: number; // minutes
  attendees: string[];
  summary: string;
  actionItems: string[];
  meetingNotes: string;
}

export interface BudgetRecord {
  id: string;
  projectId: string;
  totalAllocation: number;
  spent: number;
  remaining: number;
  byStage: {
    stage: number;
    allocated: number;
    spent: number;
  }[];
  approved: boolean;
  approvedBy: string | null;
  approvalDate: Date | null;
}

export interface ClientApprovalRequest {
  id: string;
  stage: number;
  requestDate: Date;
  documentId: string;
  documentName: string;
  requestedBy: string;
  approvalDeadline: Date;
  notes: string;
}

export interface ClientApprovalRecord extends ClientApprovalRequest {
  approvedDate: Date | null;
  approved: boolean;
  approvalNotes: string;
}

export interface TimeTableEntry {
  id: string;
  stage: number;
  taskName: string;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate: Date | null;
  actualEndDate: Date | null;
  owner: string;
  status: 'Pending' | 'In-Progress' | 'Completed' | 'Delayed';
  daysDelayed: number;
}

export interface VendorEntry {
  id: string;
  stage: number;
  vendorName: string;
  vendorCategory: string;
  contactPerson: string;
  email: string;
  phone: string;
  quotedPrice: number;
  selectedForWork: boolean;
  startDate: Date | null;
  endDate: Date | null;
}

export interface BOQItem {
  id: string;
  stage: number;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vendor: string;
  status: 'Quote-Pending' | 'Quoted' | 'Ordered' | 'Delivered';
  orderDate: Date | null;
  deliveryDate: Date | null;
}

// Stage-specific request/response types
export interface CreateProjectRequest {
  projectCode: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  office: 'Design' | 'Technical';
  contractValue: number;
  contractDate: Date;
  description: string;
}

export interface UpdateProjectStageRequest {
  stageName: string;
  officeResponsible: string;
  notes: string;
  assignedTo: string;
}

export interface ApproveStageGateRequest {
  stage: number;
  approvedBy: string;
  approvalNotes: string;
}
