import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

export const PermissionGuard: CanActivateFn = (route) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const permission = route.data['permission'] as string | undefined;

  if (!permission || authStore.can(permission)) {
    return true;
  }

  router.navigate(['/403']);
  return false;
};
