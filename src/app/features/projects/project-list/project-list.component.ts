import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { debounceTime, merge } from 'rxjs';
import { ProjectService } from '../../../core/services/project.service';
import { ProjectListItem } from '../../../core/models/project.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  projects = signal<ProjectListItem[]>([]);
  isLoading = signal(true);

  selectedStageControl = new FormControl<number | null>(null);
  selectedStatusControl = new FormControl<string | null>(null);
  selectedOfficeControl = new FormControl<string | null>(null);

  stages = Array.from({ length: 8 }, (_, i) => ({ number: i + 1, name: this.getStageName(i + 1) }));
  statuses = ['Active', 'Completed', 'On-Hold'];
  offices = ['Design', 'Technical'];

  constructor(
    private projectService: ProjectService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
    merge(
      this.selectedStageControl.valueChanges,
      this.selectedStatusControl.valueChanges,
      this.selectedOfficeControl.valueChanges
    ).pipe(debounceTime(100)).subscribe(() => this.loadProjects());
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading.set(true);
    const filters: any = {};
    if (this.selectedStageControl.value) filters.stage = this.selectedStageControl.value;
    if (this.selectedStatusControl.value) filters.status = this.selectedStatusControl.value;
    if (this.selectedOfficeControl.value) filters.office = this.selectedOfficeControl.value;

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
