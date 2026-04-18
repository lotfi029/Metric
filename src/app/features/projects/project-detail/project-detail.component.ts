import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { ProjectDetail } from '../../../core/models/project.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
  projectId: string = '';
  project = signal<ProjectDetail | null>(null);
  isLoading = signal(true);

  stageNames = [
    'Onboarding',
    'Site Survey',
    'Space Planning',
    'Moodboard & Design',
    '3D Renders',
    'Handover',
    'Technical Prep',
    'Execution'
  ];

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.projectId = params['projectId'];
      this.loadProject();
    });
  }

  loadProject() {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (data) => {
        this.project.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load project:', err);
        this.toastService.showError('Failed to load project');
        this.isLoading.set(false);
      }
    });
  }

  navigateToStage(stage: number) {
    this.router.navigate([`/projects/${this.projectId}/stage/${stage}`]);
  }

  getStageStatus(stage: number): string {
    const stageStatus = this.project()?.stageStatuses.find(s => s.stage === stage);
    return stageStatus?.status || 'Pending';
  }

  getGateColor(stage: number): string {
    const gateStatus = this.project()?.stageStatuses.find(s => s.stage === stage)?.gateStatus.gateStatus;
    const colors: { [key: string]: string } = {
      'Locked': '#ba1a1a',
      'Cleared': '#34a853',
      'Review': '#fbbc04'
    };
    return colors[gateStatus || 'Locked'] || '#8192a7';
  }

  getStageColor(stage: number): string {
    const colors = [
      '#6cd3f7', '#0073e6', '#0055b8', '#003d94',
      '#34a853', '#fbbc04', '#ea4335', '#041627'
    ];
    return colors[stage - 1] || '#8192a7';
  }

  getStatusVariant(status: string): any {
    const variants: { [key: string]: string } = {
      'Active': 'active',
      'Completed': 'completed',
      'On-Hold': 'warning'
    };
    return variants[status] || 'active';
  }
}
