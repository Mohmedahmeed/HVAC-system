import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerDataService } from '../../../core/services/customer-data.service';
import { User } from '../../../core/models/user.model';
import { ServiceRequest } from '../../../core/models/service-request.model';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-customer-dashboard-placeholder',
  templateUrl: './customer-dashboard-placeholder.component.html',
  styleUrls: ['./customer-dashboard-placeholder.component.css'],
})
export class CustomerDashboardPlaceholderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;

  requests: ServiceRequest[] = [];
  appointments: Appointment[] = [];

  isLoading = true;
  hasError = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private customerData: CustomerDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
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
      requests: this.customerData.getMyServiceRequests(),
      appointments: this.customerData.getMyAppointments(),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => {
          this.requests = data.requests;
          this.appointments = data.appointments;
        },
        error: (err) => {
          this.hasError = true;
          this.errorMessage =
            err?.error?.message || 'Unable to load your dashboard. Please try again.';
        },
      });
  }

  // ─── KPI Computed Values ──────────────────────────────────

  get activeRequestCount(): number {
    return this.requests.filter(
      (r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
    ).length;
  }

  get upcomingAppointmentCount(): number {
    return this.appointments.filter(
      (a) => a.status === 'SCHEDULED' && new Date(a.scheduledStart) >= new Date()
    ).length;
  }

  get completedJobCount(): number {
    return this.appointments.filter((a) => a.status === 'COMPLETED').length;
  }

  // ─── Recent Requests (latest 5) ───────────────────────────

  get recentRequests(): ServiceRequest[] {
    return [...this.requests]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  // ─── Upcoming Appointments (future, scheduled) ─────────────

  get upcomingAppointments(): Appointment[] {
    return this.appointments
      .filter(
        (a) => a.status === 'SCHEDULED' && new Date(a.scheduledStart) >= new Date()
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledStart).getTime() -
          new Date(b.scheduledStart).getTime()
      );
  }

  // ─── Greeting ─────────────────────────────────────────────

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  // ─── Helpers ──────────────────────────────────────────────

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  formatServiceType(type: string): string {
    const map: Record<string, string> = {
      'AC Repair': 'AC Repair',
      'AC Installation': 'AC Installation',
      'Heating Repair': 'Heating Repair',
      'HVAC Maintenance': 'HVAC Maintenance',
      'Emergency AC Repair': 'Emergency AC Repair',
    };
    return map[type] || type;
  }

  // ─── Actions ──────────────────────────────────────────────

  onRequestService(): void {
    this.router.navigate(['/customer/request/new']);
  }

  onViewRequests(): void {
    // Route not yet implemented — placeholder action
  }

  onRetry(): void {
    this.loadDashboard();
  }
}
