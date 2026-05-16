import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  parse(error: HttpErrorResponse): { generalMessage: string; fieldErrors: Record<string, string[]> } {
    const errors = error.error?.extensions?.errors as Record<string, string[]> | undefined;
    if (!errors) {
      return { generalMessage: error.error?.title ?? error.message ?? 'Request failed', fieldErrors: {} };
    }

    const fieldErrors: Record<string, string[]> = {};
    let generalMessage = 'Request failed';

    Object.entries(errors).forEach(([key, messages]) => {
      if (key.includes('.')) {
        generalMessage = messages[0] ?? generalMessage;
      } else {
        fieldErrors[key] = messages;
      }
    });

    if (generalMessage === 'Request failed') {
      generalMessage = Object.values(errors).flat()[0] ?? generalMessage;
    }

    return { generalMessage, fieldErrors };
  }

  applyToForm(form: FormGroup, fieldErrors: Record<string, string[]>): void {
    const controls = Object.keys(form.controls);
    Object.entries(fieldErrors).forEach(([key, messages]) => {
      const controlName = controls.find(name => name.toLowerCase() === key.toLowerCase());
      if (controlName) {
        form.controls[controlName].setErrors({ serverError: messages[0] });
      }
    });
  }
}
