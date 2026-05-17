import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

export interface FieldError { field: string; message: string; }
export interface FormError { generalMessage: string; fieldErrors: FieldError[]; }

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  parseHttpError(error: HttpErrorResponse): FormError {
    const payload = error.error;
    const errors =
      (payload?.errors as Record<string, string[]> | undefined) ??
      (payload?.extensions?.errors as Record<string, string[]> | undefined);

    if (!errors) {
      return {
        generalMessage:
          payload?.detail ??
          payload?.title ??
          payload?.message ??
          this.statusMessage(error.status || Number(payload?.status)) ??
          'An unexpected error occurred.',
        fieldErrors: [],
      };
    }

    const fieldErrors: FieldError[] = [];
    let generalMessage = '';

    for (const [key, messages] of Object.entries(errors)) {
      const message = messages?.[0];
      if (!message) continue;
      const isFieldError = !key.includes('.') && /^[A-Z]/.test(key);
      if (isFieldError) {
        fieldErrors.push({ field: key, message });
      } else {
        generalMessage ||= message;
      }
    }

    if (!generalMessage && fieldErrors.length > 0) {
      generalMessage = 'Please correct the errors below.';
    }
    if (!generalMessage) {
      generalMessage =
        payload?.detail ??
        payload?.title ??
        this.statusMessage(error.status || Number(payload?.status)) ??
        'An error occurred.';
    }

    return { generalMessage, fieldErrors };
  }

  parse(error: HttpErrorResponse): FormError {
    return this.parseHttpError(error);
  }

  applyToForm(form: FormGroup, fieldErrors: FieldError[] | Record<string, string[]>): void {
    const normalized = Array.isArray(fieldErrors)
      ? fieldErrors
      : Object.entries(fieldErrors).map(([field, messages]) => ({ field, message: messages[0] }));

    for (const { field, message } of normalized) {
      const controlName = Object.keys(form.controls).find(name => name.toLowerCase() === field.toLowerCase());
      if (controlName) {
        form.controls[controlName].setErrors({ serverError: message });
        form.controls[controlName].markAsTouched();
      }
    }
  }

  private statusMessage(status: number): string | null {
    if (!status) return null;
    if (status === 400) return 'The request could not be completed. Please check the details and try again.';
    if (status === 401) return 'Please sign in again to continue.';
    if (status === 403) return "You don't have permission to do this.";
    if (status === 404) return 'The requested item was not found.';
    if (status >= 500) return 'Server error. Please try again later.';
    return null;
  }
}
