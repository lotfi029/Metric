import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthStore } from '../../core/auth/auth.store';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  @Input('appHasRole') role!: string | string[];

  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authStore = inject(AuthStore);
  private rendered = false;

  constructor() {
    effect(() => {
      const roles = Array.isArray(this.role) ? this.role : [this.role];
      const hasAccess = roles.filter(Boolean).some(role => this.authStore.hasRole(role));

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
