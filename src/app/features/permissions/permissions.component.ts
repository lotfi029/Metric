import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../core/auth/auth.store';
import { PermissionService } from '../../core/http/permission.service';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, MatChipsModule],
  template: `
    <h1>My Effective Permissions</h1>
    <p>Resolved role permissions plus active overrides from the backend.</p>
    <mat-chip-set>
      @for (permission of permissions(); track permission) { <mat-chip>{{ permission }}</mat-chip> }
    </mat-chip-set>
  `,
  styles: [`h1 { margin: 0 0 8px; } p { color: #64748b; margin-bottom: 18px; }`],
})
export class PermissionsComponent {
  private readonly permissionService = inject(PermissionService);
  private readonly authStore = inject(AuthStore);
  readonly permissions = signal<string[]>(this.authStore.permissions());

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const response = await firstValueFrom(this.permissionService.getMyEffective()).catch(() => null);
    if (response) {
      this.permissions.set(response.permissions);
      this.authStore.updatePermissions(response.permissions);
    }
  }
}
