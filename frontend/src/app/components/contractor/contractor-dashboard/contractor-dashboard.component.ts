import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { ContractorDataService } from '../../../core/services/contractor-data.service';
import { User } from '../../../core/models/user.model';
import { LeadAssignment } from '../../../core/models/lead-assignment.model';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-contractor-dashboard',
  templateUrl: './contractor-dashboard.component.html',
  styleUrls: ['./contractor-dashboard.component.css'],
})
export class ContractorDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;

  leads: LeadAssignment[] = [];
  appointments: Appointment[] = [];

  isLoading = true;
  hasError = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private contractorData: ContractorDataService,
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
      leads: this.contractorData.getMyLeads(),
      appointments: this.contractorData.getMyAppointments(),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => {
          this.leads = data.leads;
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

  get newLeadCount(): number {
    return this.leads.filter((l) => l.status === 'SENT').length;
  }

  get acceptedLeadCount(): number {
    return this.leads.filter((l) => l.status === 'ACCEPTED').length;
  }

  get upcomingAppointmentCount(): number {
    return this.appointments.filter(
      (a) => a.status === 'SCHEDULED' && new Date(a.scheduledStart) >= new Date()
    ).length;
  }

  get completedJobCount(): number {
    return this.appointments.filter((a) => a.status === 'COMPLETED').length;
  }

  // ─── Recent Leads (latest 5) ─────────────────────────────

  get recentLeads(): LeadAssignment[] {
    return [...this.leads]
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(0, 5);
  }

  // ─── Upcoming Appointments (future, scheduled) ────────────

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

  // ─── Actions ──────────────────────────────────────────────

  onViewLeads(): void {
    this.router.navigate(['/contractor/leads']);
  }

  onViewLead(id: number): void {
    this.router.navigate(['/contractor/leads', id]);
  }

  onViewAppointments(): void {
    this.router.navigate(['/contractor/appointments']);
  }

  onRetry(): void {
    this.loadDashboard();
  }
}
