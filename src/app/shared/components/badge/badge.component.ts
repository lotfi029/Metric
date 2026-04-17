import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'active' | 'inactive' | 'suspended' | 'default';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="getBadgeClass()">
      {{ label }}
    </span>
  `,
  styles: []
})
export class BadgeComponent {
  @Input() label = '';
  @Input() variant: BadgeVariant = 'default';

  getBadgeClass(): string {
    const baseClass = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold';
    const variantClass = {
      active: 'bg-[#b7eaff] text-[#001f28]',
      inactive: 'bg-[#e0e3e5] text-[#44474c]',
      suspended: 'bg-[#ffdad6] text-[#93000a]',
      default: 'bg-[#e0e3e5] text-[#44474c]'
    };
    return `${baseClass} ${variantClass[this.variant] || variantClass.default}`;
  }
}
