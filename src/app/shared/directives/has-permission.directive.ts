import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthStore } from '../../core/auth/auth.store';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  @Input('appHasPermission') permission!: string | string[];

  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authStore = inject(AuthStore);
  private rendered = false;

  constructor() {
    effect(() => {
      const perms = Array.isArray(this.permission) ? this.permission : [this.permission];
      const hasAccess = perms.filter(Boolean).some(permission => this.authStore.can(permission));

      if (hasAccess && !this.rendered) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.rendered = true;
      } else if (!hasAccess && this.rendered) {
        this.viewContainer.clear();
        this.rendered = false;
      }
    });
  }
}
