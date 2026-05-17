import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

export interface FieldError { field: string; message: string; }
export interface FormError { generalMessage: string; fieldErrors: FieldError[]; }

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  parseHttpError(error: HttpErrorResponse): FormError {
    const extensions = error.error?.extensions?.errors as Record<string, string[]> | null;
    if (!extensions) {
      return {
        generalMessage: error.error?.title ?? error.error?.message ?? 'An unexpected error occurred.',
        fieldErrors: [],
      };
    }

    const fieldErrors: FieldError[] = [];
    let generalMessage = '';

    for (const [key, messages] of Object.entries(extensions)) {
      const isFieldError = !key.includes('.') && /^[A-Z]/.test(key);
      if (isFieldError) {
        fieldErrors.push({ field: key, message: messages[0] });
      } else {
        generalMessage ||= messages[0];
      }
    }

    if (!generalMessage && fieldErrors.length > 0) {
      generalMessage = 'Please correct the errors below.';
    }
    if (!generalMessage) {
      generalMessage = error.error?.title ?? 'An error occurred.';
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
}
