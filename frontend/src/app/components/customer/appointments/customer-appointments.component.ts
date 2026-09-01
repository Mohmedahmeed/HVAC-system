import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { CustomerDataService } from '../../../core/services/customer-data.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-customer-appointments',
  templateUrl: './customer-appointments.component.html',
  styleUrls: ['./customer-appointments.component.css'],
})
export class CustomerAppointmentsComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = [];

  isLoading = true;
  hasError = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private customerData: CustomerDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAppointments(): void {
    this.isLoading = true;
    this.hasError = false;

    this.customerData
      .getMyAppointments()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (appointments) => {
          this.appointments = appointments;
        },
        error: (err) => {
          this.hasError = true;
          this.errorMessage =
            err?.error?.message || 'Unable to load your appointments. Please try again.';
        },
      });
  }

  get hasAppointments(): boolean {
    return this.appointments.length > 0;
  }

  get scheduledAppointments(): Appointment[] {
    return this.appointments
      .filter((a) => a.status === 'SCHEDULED')
      .sort(
        (a, b) =>
          new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
      );
  }

  get pastAppointments(): Appointment[] {
    return this.appointments
      .filter((a) => a.status !== 'SCHEDULED')
      .sort(
        (a, b) =>
          new Date(b.completedAt || b.scheduledStart).getTime() -
          new Date(a.completedAt || a.scheduledStart).getTime()
      );
  }

  onRequestService(): void {
    this.router.navigate(['/customer/request/new']);
  }

  onRetry(): void {
    this.loadAppointments();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  contractorName(apt: Appointment): string {
    const contractor = apt.contractor;
    if (!contractor) return 'Assigned contractor';
    return `${contractor.firstName} ${contractor.lastName ?? ''}`.trim();
  }
}
