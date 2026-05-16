import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { MOCK_INVOICES, MOCK_BOQ, MOCK_FINANCE_SUMMARY, Invoice, BOQItem } from '@core/mock/index';

@Component({
  selector: 'app-finance-overview',
  standalone: true,
  imports: [CommonModule, BadgeComponent, CurrencyPipe],
  templateUrl: './finance-overview.component.html',
  styleUrls: ['./finance-overview.component.css']
})
export class FinanceOverviewComponent implements OnInit {
  invoices = signal<Invoice[]>(MOCK_INVOICES);
  boqItems = signal<BOQItem[]>(MOCK_BOQ);
  summary   = MOCK_FINANCE_SUMMARY;
  activeTab = signal<'invoices' | 'boq'>('invoices');

  ngOnInit() {}

  getInvoiceVariant(s: string): 'active' | 'inactive' | 'suspended' | 'default' {
    const m: Record<string, 'active' | 'inactive' | 'suspended' | 'default'> = {
      'Paid': 'active', 'Sent': 'default',
      'Overdue': 'suspended', 'Draft': 'inactive', 'Cancelled': 'inactive'
    };
    return m[s] || 'default';
  }

  getBOQColor(s: string): string {
    const m: Record<string, string> = {
      'Delivered': '#34a853', 'Ordered': '#6cd3f7',
      'Approved': '#0073e6', 'Quoted': '#fbbc04', 'Quote-Pending': '#8192a7'
    };
    return m[s] || '#8192a7';
  }

  get collectionRate() {
    return ((this.summary.collected / this.summary.invoiced) * 100).toFixed(1);
  }
}
