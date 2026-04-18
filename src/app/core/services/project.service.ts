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

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) { }

  // Project CRUD
  getProjects(filters?: { stage?: number; status?: string; office?: string }) {
    let url = this.apiUrl;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.stage) params.append('stage', filters.stage.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.office) params.append('office', filters.office);
      if (params.toString()) url += `?${params.toString()}`;
    }
    return this.http.get<ProjectListItem[]>(url);
  }

  getProjectById(projectId: string) {
    return this.http.get<ProjectDetail>(`${this.apiUrl}/${projectId}`);
  }

  createProject(request: CreateProjectRequest) {
    return this.http.post<ProjectDetail>(this.apiUrl, request);
  }

  updateProject(projectId: string, request: Partial<CreateProjectRequest>) {
    return this.http.put<ProjectDetail>(`${this.apiUrl}/${projectId}`, request);
  }

  // Stage Management
  getStageDetails(projectId: string, stage: number) {
    return this.http.get(`${this.apiUrl}/${projectId}/stage/${stage}`);
  }

  updateStage(projectId: string, stage: number, request: UpdateProjectStageRequest) {
    return this.http.put(`${this.apiUrl}/${projectId}/stage/${stage}`, request);
  }

  // Checklist Items
  getChecklistItems(projectId: string, stage: number) {
    return this.http.get<ChecklistItem[]>(`${this.apiUrl}/${projectId}/stage/${stage}/checklist`);
  }

  completeChecklistItem(projectId: string, stage: number, checklistId: string, notes?: string) {
    return this.http.patch(
      `${this.apiUrl}/${projectId}/stage/${stage}/checklist/${checklistId}/complete`,
      { notes }
    );
  }

  // Documents
  getDocuments(projectId: string, stage?: number) {
    let url = `${this.apiUrl}/${projectId}/documents`;
    if (stage) url += `?stage=${stage}`;
    return this.http.get<DocumentRecord[]>(url);
  }

  uploadDocument(projectId: string, stage: number, file: File, documentType: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return this.http.post(
      `${this.apiUrl}/${projectId}/stage/${stage}/documents/upload`,
      formData
    );
  }

  approveDocument(projectId: string, documentId: string) {
    return this.http.patch(
      `${this.apiUrl}/${projectId}/documents/${documentId}/approve`,
      {}
    );
  }

  // Stage Gate
  approveStageGate(projectId: string, request: ApproveStageGateRequest) {
    return this.http.post(
      `${this.apiUrl}/${projectId}/approve-stage-gate`,
      request
    );
  }

  getStageGateStatus(projectId: string, stage: number) {
    return this.http.get(`${this.apiUrl}/${projectId}/stage/${stage}/gate-status`);
  }

  // Transitions
  advanceToNextStage(projectId: string) {
    return this.http.post(`${this.apiUrl}/${projectId}/advance-stage`, {});
  }

  regressToPreviousStage(projectId: string, reason: string) {
    return this.http.post(`${this.apiUrl}/${projectId}/regress-stage`, { reason });
  }
}
