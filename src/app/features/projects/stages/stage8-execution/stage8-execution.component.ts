import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { ToastService } from '../../../../core/services/toast.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-stage8-execution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../stage-template.component.html',
  styleUrls: ['../stage.component.css']
})
export class Stage8ExecutionComponent implements OnInit {
  projectId: string = '';
  stage = 8;
  stageName = 'Execution';
  stageDescription = 'Execute design implementation and project delivery';
  isLoading = signal(true);
  isSaving = signal(false);

  stageData = signal<any>(null);
  checklistItems = signal<any[]>([]);
  documents = signal<any[]>([]);
  gateStatus = signal<any>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.projectId = params['projectId'];
      this.loadStageData();
    });
  }

  loadStageData() {
    this.isLoading.set(true);
    this.projectService.getStageDetails(this.projectId, this.stage).subscribe({
      next: (data) => {
        this.stageData.set(data);
        this.loadChecklist();
        this.loadDocuments();
        this.loadGateStatus();
      },
      error: (err) => {
        console.error('Failed to load stage data:', err);
        this.toastService.showError('Failed to load stage data');
        this.isLoading.set(false);
      }
    });
  }

  loadChecklist() {
    this.projectService.getChecklistItems(this.projectId, this.stage).subscribe({
      next: (data) => {
        this.checklistItems.set(data);
      }
    });
  }

  loadDocuments() {
    this.projectService.getDocuments(this.projectId, this.stage).subscribe({
      next: (data) => {
        this.documents.set(data);
      }
    });
  }

  loadGateStatus() {
    this.projectService.getStageGateStatus(this.projectId, this.stage).subscribe({
      next: (data) => {
        this.gateStatus.set(data);
        this.isLoading.set(false);
      }
    });
  }

  completeChecklistItem(checklistId: string) {
    this.projectService.completeChecklistItem(this.projectId, this.stage, checklistId).subscribe({
      next: () => {
        this.toastService.showSuccess('Checklist item completed');
        this.loadChecklist();
      },
      error: () => {
        this.toastService.showError('Failed to complete checklist item');
      }
    });
  }

  approveStageGate() {
    this.isSaving.set(true);
    this.projectService.approveStageGate(this.projectId, {
      stage: this.stage,
      approvedBy: 'Current User',
      approvalNotes: 'Stage approved'
    }).subscribe({
      next: () => {
        this.toastService.showSuccess('Stage gate approved');
        this.isSaving.set(false);
        this.loadGateStatus();
      },
      error: () => {
        this.isSaving.set(false);
        this.toastService.showError('Failed to approve stage gate');
      }
    });
  }

  advanceToNextStage() {
    this.isSaving.set(true);
    this.projectService.advanceToNextStage(this.projectId).subscribe({
      next: () => {
        this.toastService.showSuccess('Advanced to next stage');
        this.router.navigate([`/projects/${this.projectId}/stage/${this.stage + 1}`]);
      },
      error: () => {
        this.isSaving.set(false);
        this.toastService.showError('Failed to advance stage');
      }
    });
  }

  goBack() {
    this.router.navigate(['/projects', this.projectId]);
  }
}
