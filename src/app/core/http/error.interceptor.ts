import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 403) {
          snackBar.open("Access denied. You don't have permission to do this.", 'Dismiss', { duration: 4000 });
        } else if (error.status === 500) {
          snackBar.open('Server error. Please try again later.', 'Dismiss', { duration: 4000 });
        } else if (error.status === 0) {
          snackBar.open('Connection error. Please check your network.', 'Dismiss', { duration: 4000 });
        }
      }
      return throwError(() => error);
    }),
  );
};
