import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/user-directory/user-directory.component').then(m => m.UserDirectoryComponent)
      },
      {
        path: 'users/add',
        loadComponent: () => import('./features/users/user-add/user-add.component').then(m => m.UserAddComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./features/users/user-details/user-details.component').then(m => m.UserDetailsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/users/user-profile/user-profile.component').then(m => m.UserProfileComponent)
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/roles/role-management/role-management.component').then(m => m.RoleManagementComponent)
      },
      {
        path: 'departments',
        loadComponent: () => import('./features/departments/department-management/department-management.component').then(m => m.DepartmentManagementComponent)
      },
      {
        path: 'kpi/:id',
        loadComponent: () => import('./features/kpi/kpi-report/kpi-report.component').then(m => m.KpiReportComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent),
        data: { title: 'Projects' }
      },
      {
        path: 'projects/new',
        loadComponent: () => import('./features/projects/project-create/project-create.component').then(m => m.ProjectCreateComponent),
        data: { title: 'Create Project' }
      },
      {
        path: 'projects/:projectId',
        loadComponent: () => import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
        data: { title: 'Project Details' }
      },
      {
        path: 'projects/:projectId/stage/1',
        loadComponent: () => import('./features/projects/stages/stage1-onboarding/stage1-onboarding.component').then(m => m.Stage1OnboardingComponent),
        data: { title: 'Stage 1: Onboarding' }
      },
      {
        path: 'projects/:projectId/stage/2',
        loadComponent: () => import('./features/projects/stages/stage2-survey/stage2-survey.component').then(m => m.Stage2SurveyComponent),
        data: { title: 'Stage 2: Site Survey' }
      },
      {
        path: 'projects/:projectId/stage/3',
        loadComponent: () => import('./features/projects/stages/stage3-layout/stage3-layout.component').then(m => m.Stage3LayoutComponent),
        data: { title: 'Stage 3: Space Planning' }
      },
      {
        path: 'projects/:projectId/stage/4',
        loadComponent: () => import('./features/projects/stages/stage4-moodboard/stage4-moodboard.component').then(m => m.Stage4MoodboardComponent),
        data: { title: 'Stage 4: Moodboard & Design' }
      },
      {
        path: 'projects/:projectId/stage/5',
        loadComponent: () => import('./features/projects/stages/stage5-renders/stage5-renders.component').then(m => m.Stage5RendersComponent),
        data: { title: 'Stage 5: 3D Renders' }
      },
      {
        path: 'projects/:projectId/stage/6',
        loadComponent: () => import('./features/projects/stages/stage6-handover/stage6-handover.component').then(m => m.Stage6HandoverComponent),
        data: { title: 'Stage 6: Handover' }
      },
      {
        path: 'projects/:projectId/stage/7',
        loadComponent: () => import('./features/projects/stages/stage7-techprep/stage7-techprep.component').then(m => m.Stage7TechprepComponent),
        data: { title: 'Stage 7: Technical Prep' }
      },
      {
        path: 'projects/:projectId/stage/8',
        loadComponent: () => import('./features/projects/stages/stage8-execution/stage8-execution.component').then(m => m.Stage8ExecutionComponent),
        data: { title: 'Stage 8: Execution' }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
