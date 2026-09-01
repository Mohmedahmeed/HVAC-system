import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AdminDataService } from '../../../core/services/admin-data.service';
import { User } from '../../../core/models/user.model';
import { ServiceRequest } from '../../../core/models/service-request.model';

export interface ActivityEntry {
  id: number;
  type: 'user' | 'request';
  label: string;
  detail: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  users: User[] = [];
  requests: ServiceRequest[] = [];

  isLoading = true;
  hasError = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(private adminData: AdminDataService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboard(): void {
    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      users: this.adminData.getAllUsers(),
      requests: this.adminData.getAllServiceRequests(),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => {
          this.users = data.users;
          this.requests = data.requests;
        },
        error: (err) => {
          this.hasError = true;
          this.errorMessage =
            err?.error?.message || 'Unable to load platform data. Please try again.';
        },
      });
  }

  // ─── KPIs ──────────────────────────────────────────────────

  get totalUsers(): number {
    return this.users.length;
  }

  get totalContractors(): number {
    return this.users.filter((u) => u.role === 'CONTRACTOR').length;
  }

  get activeRequestCount(): number {
    return this.requests.filter(
      (r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
    ).length;
  }

  get completedJobCount(): number {
    return this.requests.filter((r) => r.status === 'COMPLETED').length;
  }

  // ─── Recent Activity (derived from real users + requests) ──

  get activityFeed(): ActivityEntry[] {
    const entries: ActivityEntry[] = [
      ...this.users.map((u) => ({
        id: u.id,
        type: 'user' as const,
        label: u.role === 'CONTRACTOR' ? 'New contractor' : 'New user',
        detail: `${u.firstName} ${u.lastName ?? ''}`.trim(),
        createdAt: u.createdAt || '',
      })),
      ...this.requests.map((r) => ({
        id: r.id,
        type: 'request' as const,
        label: 'New service request',
        detail: r.serviceType || 'HVAC request',
        createdAt: r.createdAt || '',
      })),
    ]
      .filter((e) => e.createdAt)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 8);

    return entries;
  }

  get hasActivity(): boolean {
    return this.activityFeed.length > 0;
  }

  onRetry(): void {
    this.loadDashboard();
  }

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' · ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    );
  }
}
