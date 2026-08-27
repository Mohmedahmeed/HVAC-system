import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ContractorDataService } from '../../../core/services/contractor-data.service';
import { Appointment } from '../../../core/models/appointment.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.css'],
})
export class AppointmentListComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = [];

  isLoading = true;
  hasError = false;
  errorMessage = '';
  successMessage = '';

  updatingId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private contractorData: ContractorDataService,
    private dialog: MatDialog
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

    this.contractorData
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
            err?.error?.message || 'Unable to load appointments.';
        },
      });
  }

  // ─── Computed ─────────────────────────────────────────────

  get scheduledAppointments(): Appointment[] {
    return this.appointments
      .filter((a) => a.status === 'SCHEDULED')
      .sort(
        (a, b) =>
          new Date(a.scheduledStart).getTime() -
          new Date(b.scheduledStart).getTime()
      );
  }

  get completedAppointments(): Appointment[] {
    return this.appointments
      .filter((a) => a.status === 'COMPLETED')
      .sort(
        (a, b) =>
          new Date(b.completedAt || b.scheduledStart).getTime() -
          new Date(a.completedAt || a.scheduledStart).getTime()
      );
  }

  get otherAppointments(): Appointment[] {
    return this.appointments.filter(
      (a) => a.status !== 'SCHEDULED' && a.status !== 'COMPLETED'
    );
  }

  // ─── Actions ──────────────────────────────────────────────

  onComplete(apt: Appointment): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Mark as Complete',
        message: `Mark the ${apt.serviceRequest?.serviceType} appointment as completed?`,
        confirmText: 'Mark Complete',
        cancelText: 'Cancel',
        type: 'warning',
      },
      panelClass: 'ch-confirm-dialog',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.updatingId = apt.id;
      this.successMessage = '';

      this.contractorData
        .updateAppointmentStatus(apt.id, 'COMPLETED')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated) => {
            const idx = this.appointments.findIndex((a) => a.id === updated.id);
            if (idx >= 0) {
              this.appointments[idx] = updated;
            }
            this.successMessage = 'Appointment marked as complete.';
            this.updatingId = null;
          },
          error: (err) => {
            this.hasError = true;
            this.errorMessage =
              err?.error?.message || 'Failed to update appointment.';
            this.updatingId = null;
          },
        });
    });
  }

  onRetry(): void {
    this.loadAppointments();
  }

  dismissSuccess(): void {
    this.successMessage = '';
  }

  dismissError(): void {
    this.hasError = false;
    this.errorMessage = '';
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
}
