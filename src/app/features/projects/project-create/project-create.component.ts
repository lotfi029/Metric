import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { CreateProjectRequest } from '../../../core/models/project.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.css']
})
export class ProjectCreateComponent {
  projectForm: FormGroup;
  isSaving = signal(false);
  offices = ['Design', 'Technical'];

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.projectForm = this.fb.group({
      projectCode: ['', [Validators.required]],
      clientName: ['', [Validators.required]],
      clientEmail: ['', [Validators.required, Validators.email]],
      clientPhone: ['', [Validators.required]],
      office: ['Design', [Validators.required]],
      contractValue: ['', [Validators.required, Validators.min(0)]],
      contractDate: ['', [Validators.required]],
      description: ['']
    });
  }

  onSubmit() {
    if (this.projectForm.invalid) {
      this.toastService.showError('Please fill in all required fields');
      return;
    }

    this.isSaving.set(true);
    const request: CreateProjectRequest = this.projectForm.value;

    this.projectService.createProject(request).subscribe({
      next: (project) => {
        this.toastService.showSuccess('Project created successfully');
        this.router.navigate(['/projects', project.id]);
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Failed to create project:', err);
        this.toastService.showError('Failed to create project');
      }
    });
  }

  cancel() {
    this.router.navigate(['/projects']);
  }
}
