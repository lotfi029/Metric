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
