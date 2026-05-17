import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
import { PermissionGuard } from './core/auth/permission.guard';
import { PERMISSIONS } from './core/constants/permissions';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      {
        path: 'users',
        loadComponent: () => import('./features/users/user-directory/user-directory.component').then(m => m.UserDirectoryComponent),
        canActivate: [PermissionGuard],
        data: { permission: PERMISSIONS.users.read },
      },
      {
        path: 'users/add',
        loadComponent: () => import('./features/users/user-add/user-add.component').then(m => m.UserAddComponent),
        canActivate: [PermissionGuard],
        data: { permission: PERMISSIONS.users.create },
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./features/users/user-details/user-details.component').then(m => m.UserDetailsComponent),
        canActivate: [PermissionGuard],
        data: { permission: PERMISSIONS.users.read },
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/users/user-profile/user-profile.component').then(m => m.UserProfileComponent),
      },
      {
        path: 'employees',
        loadComponent: () => import('./features/employees/employees-list/employees-list.component').then(m => m.EmployeesListComponent),
        canActivate: [PermissionGuard],
        data: { permission: PERMISSIONS.employees.read },
      },
      {
        path: 'employees/:id',
        loadComponent: () => import('./features/employees/employee-detail/employee-detail.component').then(m => m.EmployeeDetailComponent),
        canActivate: [PermissionGuard],
        data: { permission: PERMISSIONS.employees.viewDetails },
      },
      {
        path: 'clients',
        loadComponent: () => import('./features/clients/clients-list/clients-list.component').then(m => m.ClientsListComponent),
        canActivate: [PermissionGuard],
        data: { permission: PERMISSIONS.clients.read },
      },
      {
        path: 'departments',
        loadComponent: () => import('./features/departments/departments-list/departments-list.component').then(m => m.DepartmentsListComponent),
        canActivate: [PermissionGuard],
        data: { permission: PERMISSIONS.departments.read },
      },
      {
        path: 'departments/:id',
        loadComponent: () => import('./features/departments/department-detail/department-detail.component').then(m => m.DepartmentDetailComponent),
        canActivate: [PermissionGuard],
        data: { permission: PERMISSIONS.departments.read },
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/roles/roles.component').then(m => m.RolesComponent),
        canActivate: [PermissionGuard],
        data: { permission: PERMISSIONS.roles.read },
      },
      {
        path: 'permissions',
        loadComponent: () => import('./features/permissions/permissions.component').then(m => m.PermissionsComponent),
        canActivate: [PermissionGuard],
        data: { permission: PERMISSIONS.permissions.read },
      },
      {
        path: 'audit',
        loadComponent: () => import('./features/audit/audit.component').then(m => m.AuditComponent),
        canActivate: [PermissionGuard],
        data: { permission: PERMISSIONS.audit.read },
      },
      {
        path: 'finance',
        loadComponent: () => import('./features/finance/finance-overview/finance-overview.component').then(m => m.FinanceOverviewComponent),
      },
      {
        path: 'kpi/:id',
        loadComponent: () => import('./features/kpi/kpi-report/kpi-report.component').then(m => m.KpiReportComponent),
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent),
      },
      {
        path: 'projects/new',
        loadComponent: () => import('./features/projects/project-create/project-create.component').then(m => m.ProjectCreateComponent),
      },
      {
        path: 'projects/:projectId',
        loadComponent: () => import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
      },
      {
        path: 'projects/:projectId/stage/1',
        loadComponent: () => import('./features/projects/stages/stage1-onboarding/stage1-onboarding.component').then(m => m.Stage1OnboardingComponent),
      },
      {
        path: 'projects/:projectId/stage/2',
        loadComponent: () => import('./features/projects/stages/stage2-survey/stage2-survey.component').then(m => m.Stage2SurveyComponent),
      },
      {
        path: 'projects/:projectId/stage/3',
        loadComponent: () => import('./features/projects/stages/stage3-layout/stage3-layout.component').then(m => m.Stage3LayoutComponent),
      },
      {
        path: 'projects/:projectId/stage/4',
        loadComponent: () => import('./features/projects/stages/stage4-moodboard/stage4-moodboard.component').then(m => m.Stage4MoodboardComponent),
      },
      {
        path: 'projects/:projectId/stage/5',
        loadComponent: () => import('./features/projects/stages/stage5-renders/stage5-renders.component').then(m => m.Stage5RendersComponent),
      },
      {
        path: 'projects/:projectId/stage/6',
        loadComponent: () => import('./features/projects/stages/stage6-handover/stage6-handover.component').then(m => m.Stage6HandoverComponent),
      },
      {
        path: 'projects/:projectId/stage/7',
        loadComponent: () => import('./features/projects/stages/stage7-techprep/stage7-techprep.component').then(m => m.Stage7TechprepComponent),
      },
      {
        path: 'projects/:projectId/stage/8',
        loadComponent: () => import('./features/projects/stages/stage8-execution/stage8-execution.component').then(m => m.Stage8ExecutionComponent),
      },
      { path: '403', loadComponent: () => import('./features/errors/forbidden/forbidden.component').then(m => m.ForbiddenComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
