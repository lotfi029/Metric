import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';

export type AppLanguage = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly document = inject(DOCUMENT);
  private readonly current = signal<AppLanguage>((localStorage.getItem('dms_lang') as AppLanguage) || 'en');
  readonly lang = this.current.asReadonly();
  readonly isRtl = computed(() => this.current() === 'ar');

  constructor() {
    this.apply(this.current());
  }

  setLang(lang: AppLanguage): void {
    this.current.set(lang);
    localStorage.setItem('dms_lang', lang);
    this.apply(lang);
  }

  toggle(): void {
    this.setLang(this.current() === 'en' ? 'ar' : 'en');
  }

  private apply(lang: AppLanguage): void {
    this.document.documentElement.lang = lang;
    this.document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
