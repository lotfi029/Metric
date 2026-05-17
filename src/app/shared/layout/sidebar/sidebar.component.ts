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
        <span class="brand-text">
          <strong>DMS</strong>
          <small>Management Console</small>
        </span>
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
    .sidebar { position: sticky; top: 0; width: 248px; min-height: 100vh; background: #111827; color: #cbd5e1; padding: 18px 12px; box-sizing: border-box; border-right: 1px solid rgba(255,255,255,.06); }
    .brand { display: flex; align-items: center; gap: 12px; min-height: 54px; margin-bottom: 20px; color: #fff; }
    .brand-mark { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 8px; background: #e0f2fe; color: #075985; font-weight: 900; }
    .brand-text { display: grid; gap: 1px; line-height: 1.1; }
    .brand-text small { color: #94a3b8; font-size: 11px; font-weight: 600; }
    nav { display: grid; gap: 4px; }
    .nav-item { display: flex; align-items: center; gap: 12px; min-height: 42px; padding: 0 12px; border-radius: 8px; color: #aebacd; text-decoration: none; font-weight: 650; font-size: 14px; }
    .nav-item mat-icon { color: #8ea0b8; }
    .nav-item:hover { background: rgba(255,255,255,.06); color: #fff; }
    .nav-item.active { background: #f8fafc; color: #172033; }
    .nav-item.active mat-icon { color: #2563eb; }
    @media (max-width: 960px) { .sidebar { width: 68px; } .brand-text, .nav-item span { display: none; } .nav-item { justify-content: center; padding: 0; } }
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
