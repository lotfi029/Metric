import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError(error => {
      if (error.status === 403) {
        toastService.showError('Access forbidden');
      } else if (error.status === 500) {
        toastService.showError('Server error occurred');
      } else if (error.status === 0) {
        toastService.showError('Network error');
      }
      return throwError(() => error);
    })
  );
};
