import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PERMISSIONS } from '../../../core/constants/permissions';
import { AuthStore } from '../../../core/auth/auth.store';
import { TranslationService } from '../translation.service';

interface NavItem {
  label: string;
  labelAr: string;
  icon: string;
  route: string;
  requiredPermission: string | null;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', labelAr: 'لوحة التحكم', icon: 'dashboard', route: '/dashboard', requiredPermission: null },
  { label: 'Users', labelAr: 'المستخدمون', icon: 'group', route: '/users', requiredPermission: PERMISSIONS.users.read },
  { label: 'Employees', labelAr: 'الموظفون', icon: 'badge', route: '/employees', requiredPermission: PERMISSIONS.employees.read },
  { label: 'Clients', labelAr: 'العملاء', icon: 'person_pin', route: '/clients', requiredPermission: PERMISSIONS.clients.read },
  { label: 'Departments', labelAr: 'الأقسام', icon: 'corporate_fare', route: '/departments', requiredPermission: PERMISSIONS.departments.read },
  { label: 'Roles', labelAr: 'الأدوار', icon: 'admin_panel_settings', route: '/roles', requiredPermission: PERMISSIONS.roles.read },
  { label: 'Permissions', labelAr: 'الصلاحيات', icon: 'lock', route: '/permissions', requiredPermission: PERMISSIONS.permissions.read },
  { label: 'Audit Log', labelAr: 'سجل المراجعة', icon: 'history', route: '/audit', requiredPermission: PERMISSIONS.audit.read },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">D</span>
        <span class="brand-text">DMS</span>
      </div>
      <nav>
        @for (item of visibleNavItems(); track item.route) {
          <a [routerLink]="item.route" routerLinkActive="active" class="nav-item">
            <mat-icon>{{ item.icon }}</mat-icon>
            <span>{{ translation.isRtl() ? item.labelAr : item.label }}</span>
          </a>
        }
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar { width: 240px; min-height: 100vh; background: #0f172a; color: #cbd5e1; padding: 16px 12px; box-sizing: border-box; }
    .brand { display: flex; align-items: center; gap: 10px; height: 48px; margin-bottom: 18px; color: #fff; font-weight: 800; }
    .brand-mark { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 8px; background: #38bdf8; color: #082f49; }
    .nav-item { display: flex; align-items: center; gap: 12px; min-height: 44px; padding: 0 12px; border-radius: 8px; color: inherit; text-decoration: none; font-weight: 600; }
    .nav-item:hover, .nav-item.active { background: #1e293b; color: #fff; }
    @media (max-width: 960px) { .sidebar { width: 64px; } .brand-text, .nav-item span { display: none; } .nav-item { justify-content: center; padding: 0; } }
    @media (max-width: 720px) { .sidebar { display: none; } }
  `],
})
export class SidebarComponent {
  private readonly authStore = inject(AuthStore);
  readonly translation = inject(TranslationService);
  readonly visibleNavItems = computed(() =>
    NAV_ITEMS.filter(item => item.requiredPermission === null || this.authStore.can(item.requiredPermission)),
  );
}
