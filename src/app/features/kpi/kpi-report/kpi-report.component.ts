import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { DetailedUserResponse } from '@core/models/user.model';
import { BadgeComponent } from '@shared/components/badge/badge.component';

interface KPIData {
  attendanceRate: number;
  tasksCompleted: number;
  tasksTotal: number;
  performanceRating: number;
  velocityData: { month: string; value: number }[];
  objectives: { name: string; progress: number }[];
  skills: { name: string; value: number }[];
  recentContributions: any[];
}

@Component({
  selector: 'app-kpi-report',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './kpi-report.component.html',
  styleUrls: ['./kpi-report.component.css']
})
export class KpiReportComponent implements OnInit {
  user = signal<DetailedUserResponse | null>(null);
  isLoading = signal(true);
  periodFilter = signal<'Monthly' | 'Quarterly' | 'Annual'>('Monthly');
  periods = ['Monthly', 'Quarterly', 'Annual'] as const;

  kpiData: KPIData = {
    attendanceRate: 94,
    tasksCompleted: 28,
    tasksTotal: 32,
    performanceRating: 4.5,
    velocityData: [
      { month: 'Jan', value: 85 },
      { month: 'Feb', value: 88 },
      { month: 'Mar', value: 92 },
      { month: 'Apr', value: 89 },
      { month: 'May', value: 95 },
      { month: 'Jun', value: 94 }
    ],
    objectives: [
      { name: 'Launch new product line', progress: 85 },
      { name: 'Improve client satisfaction', progress: 92 },
      { name: 'Team mentorship', progress: 78 }
    ],
    skills: [
      { name: 'Design', value: 92 },
      { name: 'Leadership', value: 85 },
      { name: 'Communication', value: 88 },
      { name: 'Project Management', value: 80 }
    ],
    recentContributions: [
      { date: '2025-12-10', action: 'Completed Project X', category: 'Design', impact: 9, status: 'completed' },
      { date: '2025-12-08', action: 'Led team meeting', category: 'Leadership', impact: 8, status: 'completed' },
      { date: '2025-12-05', action: 'Client presentation', category: 'Sales', impact: 10, status: 'completed' },
      { date: '2025-12-03', action: 'Mentored junior designer', category: 'Training', impact: 7, status: 'completed' },
      { date: '2025-11-30', action: 'Design system update', category: 'Design', impact: 9, status: 'completed' }
    ]
  };

  constructor(
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const userId = params['id'];
      this.loadUser(userId);
    });
  }

  setPeriod(period: string) {
    if (period === 'Monthly' || period === 'Quarterly' || period === 'Annual') {
      this.periodFilter.set(period);
    }
  }

  loadUser(userId: string) {
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load user:', err);
        this.isLoading.set(false);
      }
    });
  }

  getMaxVelocity(): number {
    return Math.max(...this.kpiData.velocityData.map(d => d.value));
  }

  getBarWidth(value: number): string {
    return ((value / this.getMaxVelocity()) * 100) + '%';
  }

  getTaskProgress(): number {
    return (this.kpiData.tasksCompleted / this.kpiData.tasksTotal) * 100;
  }

  getRating(): string[] {
    const full = Math.floor(this.kpiData.performanceRating);
    const half = this.kpiData.performanceRating % 1 > 0;
    const empty = 5 - Math.ceil(this.kpiData.performanceRating);
    return [
      ...Array(full).fill('star'),
      ...(half ? ['star_half'] : []),
      ...Array(empty).fill('star_outline')
    ];
  }

  getImpactColor(impact: number): string {
    if (impact >= 9) return 'bg-[#6cd3f7]';
    if (impact >= 7) return 'bg-[#269dbe]';
    return 'bg-[#8192a7]';
  }
}
