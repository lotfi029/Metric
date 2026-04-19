import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  ProjectListItem,
  ProjectDetail,
  CreateProjectRequest,
  UpdateProjectStageRequest,
  ApproveStageGateRequest,
  ChecklistItem,
  DocumentRecord,
} from '../models/project.model';
import { Observable, of, catchError } from 'rxjs';
import {
  MOCK_PROJECTS,
  MOCK_PROJECT_DETAIL,
  MOCK_CHECKLIST_ITEMS,
  MOCK_DOCUMENTS,
  MOCK_GATE_STATUS
} from './project-mock.data';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) { }

  // Project CRUD
  getProjects(filters?: { stage?: number; status?: string; office?: string }): Observable<ProjectListItem[]> {
    let url = this.apiUrl;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.stage) params.append('stage', filters.stage.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.office) params.append('office', filters.office);
      if (params.toString()) url += `?${params.toString()}`;
    }
    return this.http.get<ProjectListItem[]>(url).pipe(
      catchError(() => {
        let result = [...MOCK_PROJECTS];
        if (filters?.stage) result = result.filter(p => p.currentStage === filters.stage);
        if (filters?.status) result = result.filter(p => p.status === filters.status);
        if (filters?.office) result = result.filter(p => p.office === filters.office);
        return of(result);
      })
    );
  }

  getProjectById(projectId: string): Observable<ProjectDetail> {
    return this.http.get<ProjectDetail>(`${this.apiUrl}/${projectId}`).pipe(
      catchError(() => of(MOCK_PROJECT_DETAIL[projectId] || MOCK_PROJECT_DETAIL['proj-001']))
    );
  }

  createProject(request: CreateProjectRequest): Observable<ProjectDetail> {
    return this.http.post<ProjectDetail>(this.apiUrl, request).pipe(
      catchError(() => of({ ...MOCK_PROJECT_DETAIL['proj-001'], id: 'proj-new', projectCode: request.projectCode }))
    );
  }

  updateProject(projectId: string, request: Partial<CreateProjectRequest>): Observable<ProjectDetail> {
    return this.http.put<ProjectDetail>(`${this.apiUrl}/${projectId}`, request).pipe(
      catchError(() => of(MOCK_PROJECT_DETAIL['proj-001']))
    );
  }

  // Stage Management
  getStageDetails(projectId: string, stage: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${projectId}/stage/${stage}`).pipe(
      catchError(() => of({
        stage,
        officeResponsible: stage <= 5 ? '#design' : '#technical',
        assignedTo: 'Sara Nasser',
        status: stage < 3 ? 'Completed' : (stage === 3 ? 'In-Progress' : 'Pending')
      }))
    );
  }

  updateStage(projectId: string, stage: number, request: UpdateProjectStageRequest) {
    return this.http.put(`${this.apiUrl}/${projectId}/stage/${stage}`, request).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // Checklist Items
  getChecklistItems(projectId: string, stage: number): Observable<ChecklistItem[]> {
    return this.http.get<ChecklistItem[]>(
      `${this.apiUrl}/${projectId}/stage/${stage}/checklist`
    ).pipe(
      catchError(() => of(MOCK_CHECKLIST_ITEMS[`${projectId}-${stage}`] || []))
    );
  }

  completeChecklistItem(projectId: string, stage: number, checklistId: string, notes?: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${projectId}/stage/${stage}/checklist/${checklistId}/complete`,
      { notes }
    ).pipe(catchError(() => of({ success: true })));
  }

  // Documents
  getDocuments(projectId: string, stage?: number): Observable<DocumentRecord[]> {
    let url = `${this.apiUrl}/${projectId}/documents`;
    if (stage) url += `?stage=${stage}`;
    return this.http.get<DocumentRecord[]>(url).pipe(
      catchError(() => of(MOCK_DOCUMENTS[`${projectId}-${stage}`] || []))
    );
  }

  uploadDocument(projectId: string, stage: number, file: File, documentType: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return this.http.post(
      `${this.apiUrl}/${projectId}/stage/${stage}/documents/upload`,
      formData
    ).pipe(catchError(() => of({ success: true })));
  }

  approveDocument(projectId: string, documentId: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${projectId}/documents/${documentId}/approve`,
      {}
    ).pipe(catchError(() => of({ success: true })));
  }

  // Stage Gate
  approveStageGate(projectId: string, request: ApproveStageGateRequest): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${projectId}/approve-stage-gate`,
      request
    ).pipe(catchError(() => of({ success: true })));
  }

  getStageGateStatus(projectId: string, stage: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${projectId}/stage/${stage}/gate-status`).pipe(
      catchError(() => of(MOCK_GATE_STATUS[`${projectId}-${stage}`] || {
        stage,
        gateStatus: stage < 3 ? 'Cleared' : 'Locked',
        conditions: {
          checklistComplete: stage < 3,
          documentsUploaded: stage < 3,
          clientApproved: stage < 3,
          budgetApproved: true
        },
        approvedBy: null,
        approvalDate: null,
        blockingIssues: []
      }))
    );
  }

  // Transitions
  advanceToNextStage(projectId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${projectId}/advance-stage`, {}).pipe(
      catchError(() => of({ success: true }))
    );
  }

  regressToPreviousStage(projectId: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${projectId}/regress-stage`, { reason }).pipe(
      catchError(() => of({ success: true }))
    );
  }
}
