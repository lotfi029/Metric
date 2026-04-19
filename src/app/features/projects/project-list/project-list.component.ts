import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { ProjectListItem } from '../../../core/models/project.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  projects = signal<ProjectListItem[]>([]);
  isLoading = signal(true);

  // Filter signals
  selectedStage = signal<number | null>(null);
  selectedStatus = signal<string | null>(null);
  selectedOffice = signal<string | null>(null);

  stages = Array.from({ length: 8 }, (_, i) => ({ number: i + 1, name: this.getStageName(i + 1) }));
  statuses = ['Active', 'Completed', 'On-Hold'];
  offices = ['Design', 'Technical'];

  constructor(
    private projectService: ProjectService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading.set(true);
    const filters: any = {};
    if (this.selectedStage()) filters.stage = this.selectedStage();
    if (this.selectedStatus()) filters.status = this.selectedStatus();
    if (this.selectedOffice()) filters.office = this.selectedOffice();

    this.projectService.getProjects(filters).subscribe({
      next: (data) => {
        this.projects.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load projects:', err);
        this.toastService.showError('Failed to load projects');
        this.isLoading.set(false);
      }
    });
  }

  getStageName(stage: number): string {
    const stageNames: { [key: number]: string } = {
      1: 'Onboarding',
      2: 'Site Survey',
      3: 'Space Planning',
      4: 'Moodboard',
      5: 'Renders',
      6: 'Handover',
      7: 'Tech Prep',
      8: 'Execution'
    };
    return stageNames[stage] || `Stage ${stage}`;
  }

  getStageColor(stage: number): string {
    const colors: { [key: number]: string } = {
      1: '#6cd3f7',
      2: '#0073e6',
      3: '#0055b8',
      4: '#003d94',
      5: '#34a853',
      6: '#fbbc04',
      7: '#ea4335',
      8: '#041627'
    };
    return colors[stage] || '#8192a7';
  }

  onFilterChange() {
    this.loadProjects();
  }

  viewProject(projectId: string) {
    this.router.navigate(['/projects', projectId]);
  }

  createNewProject() {
    this.router.navigate(['/projects/new']);
  }

  getStatusColor(status: string): any {
    const colors: { [key: string]: string } = {
      'Active': 'active',
      'Completed': 'completed',
      'On-Hold': 'warning'
    };
    return colors[status] || 'active';
  }
}
