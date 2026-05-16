import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MOCK_KPIs, MOCK_EMPLOYEES, EmployeeKpi, Employee } from '@core/mock/index';

@Component({
  selector: 'app-kpi-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-report.component.html',
  styleUrls: ['./kpi-report.component.css']
})
export class KpiReportComponent implements OnInit {
  kpi    = signal<EmployeeKpi | null>(null);
  emp    = signal<Employee | null>(null);
  period = signal<'monthly' | 'quarterly' | 'annual'>('monthly');
  periods: ('monthly' | 'quarterly' | 'annual')[] = ['monthly', 'quarterly', 'annual'];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      const found = MOCK_KPIs.find(k => k.employeeId === id) || MOCK_KPIs[0];
      const employee = MOCK_EMPLOYEES.find(e => e.id === found.employeeId) || MOCK_EMPLOYEES[0];
      this.kpi.set(found);
      this.emp.set(employee);
    });
  }

  get taskRate() { return this.kpi() ? ((this.kpi()!.tasksCompleted / this.kpi()!.tasksTotal) * 100).toFixed(0) : 0; }

  get stars(): string[] {
    const r = this.kpi()?.performanceRating || 0;
    return Array(5).fill('').map((_, i) =>
      i < Math.floor(r) ? 'star' : (i < r ? 'star_half' : 'star_outline')
    );
  }

  getImpactColor(n: number): string {
    if (n >= 9) return 'bg-[#6cd3f7]';
    if (n >= 7) return 'bg-[#0073e6]';
    return 'bg-[#8192a7]';
  }

  getObjectiveColor(s: string): string {
    const m: Record<string, string> = {
      'On-Track': '#34a853', 'At-Risk': '#fbbc04', 'Behind': '#ba1a1a'
    };
    return m[s] || '#8192a7';
  }

  setPeriod(p: 'monthly' | 'quarterly' | 'annual') {
    this.period.set(p);
  }

  getAttendanceColor(s: string): string {
    const m: Record<string, string> = {
      'Present': '#34a853', 'Late': '#fbbc04',
      'Absent': '#ba1a1a', 'Leave': '#8192a7', 'Holiday': '#6cd3f7'
    };
    return m[s] || '#eceef0';
  }

  maxVelocity = computed(() => Math.max(...(this.kpi()?.velocityData.map(d => d.value) || [100])));
}
