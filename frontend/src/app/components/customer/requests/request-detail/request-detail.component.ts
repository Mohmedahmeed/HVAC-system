import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, of } from 'rxjs';
import { takeUntil, switchMap, finalize } from 'rxjs/operators';
import { CustomerDataService } from '../../../../core/services/customer-data.service';
import { ServiceRequest } from '../../../../core/models/service-request.model';
import { Appointment } from '../../../../core/models/appointment.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

interface StatusBannerConfig {
  tone: 'info' | 'success' | 'error';
  message: string;
}

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.css'],
})
export class RequestDetailComponent implements OnInit, OnDestroy {
  request: ServiceRequest | null = null;
  appointment: Appointment | null = null;

  isLoading = true;
  hasError = false;
  errorMessage = '';
  notFound = false;

  isCancelling = false;
  successMessage = '';
  cancelError = '';

  private requestId = 0;
  private destroy$ = new Subject<void>();

  private statusConfigs: Record<string, StatusBannerConfig> = {
    NEW: { tone: 'info', message: "We're looking for an HVAC contractor for you." },
    MATCHED: { tone: 'info', message: 'A contractor is reviewing your request.' },
    ACCEPTED: { tone: 'info', message: 'A contractor has accepted this job.' },
    SCHEDULED: { tone: 'info', message: 'Your appointment is booked.' },
    IN_PROGRESS: { tone: 'info', message: 'Work is in progress.' },
    COMPLETED: { tone: 'success', message: 'This request is complete.' },
    CANCELLED: { tone: 'error', message: 'This request was cancelled.' },
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerData: CustomerDataService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const id = Number(params.get('id'));
          if (!id || !Number.isInteger(id) || id <= 0) {
            this.requestId = 0;
            this.notFound = true;
            this.isLoading = false;
            return of(null);
          }
          this.requestId = id;
          this.isLoading = true;
          this.hasError = false;
          this.errorMessage = '';
          this.notFound = false;
          this.successMessage = '';
          this.cancelError = '';
          return this.customerData.getServiceRequest(id);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (request) => {
          if (request) {
            this.request = request;
            this.loadAppointment(request.id);
          }
        },
        error: (err) => {
          if (err?.status === 404) {
            this.notFound = true;
          } else if (err?.status === 403) {
            this.hasError = true;
            this.errorMessage =
              err?.error?.message ||
              "You don't have access to this request.";
          } else {
            this.hasError = true;
            this.errorMessage =
              err?.error?.message || 'Unable to load request details.';
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Appointment (degradable) ──────────────────────────────

  private loadAppointment(requestId: number): void {
    this.customerData
      .getMyAppointments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments) => {
          const match = appointments.find(
            (apt) => apt.serviceRequest?.id === requestId
          );
          this.appointment = match || null;
        },
        error: () => {
          this.appointment = null;
        },
      });
  }

  // ─── Cancel Request ────────────────────────────────────────

  get canCancel(): boolean {
    return this.request?.status === 'NEW';
  }

  onCancelRequest(): void {
    if (!this.request || this.isCancelling) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel this request?',
        message:
          'Your request will be cancelled and contractors will no longer see it. This action cannot be undone.',
        confirmText: 'Yes, cancel request',
        cancelText: 'Keep request',
        type: 'danger',
      },
      panelClass: 'ch-confirm-dialog',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed || !this.request) return;

      this.isCancelling = true;
      this.successMessage = '';
      this.cancelError = '';

      this.customerData
        .cancelServiceRequest(this.request.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated) => {
            this.request = updated;
            this.isCancelling = false;
            this.successMessage = 'Request cancelled successfully.';
          },
          error: (err) => {
            this.isCancelling = false;
            if (err?.status === 403) {
              this.cancelError =
                'This request has already been processed and can no longer be cancelled.';
            } else {
              this.cancelError =
                err?.error?.message || 'Failed to cancel request. Please try again.';
            }
          },
        });
    });
  }

  // ─── Navigation ────────────────────────────────────────────

  onBack(): void {
    this.router.navigate(['/customer/requests']);
  }

  onRetry(): void {
    if (!this.requestId) return;
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.notFound = false;

    this.customerData
      .getServiceRequest(this.requestId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (request) => {
          this.request = request;
          this.loadAppointment(request.id);
        },
        error: (err) => {
          if (err?.status === 404) {
            this.notFound = true;
          } else if (err?.status === 403) {
            this.hasError = true;
            this.errorMessage =
              err?.error?.message ||
              "You don't have access to this request.";
          } else {
            this.hasError = true;
            this.errorMessage = err?.error?.message || 'Unable to load request details.';
          }
        },
      });
  }

  // ─── Status Banner ─────────────────────────────────────────

  get bannerConfig(): StatusBannerConfig {
    return (
      this.statusConfigs[this.request?.status || ''] || {
        tone: 'info',
        message: '',
      }
    );
  }

  get bannerToneClass(): string {
    return `ch-request-detail__banner--${this.bannerConfig.tone}`;
  }

  // ─── Helpers ───────────────────────────────────────────────

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ' at ' +
      date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    );
  }

  formatPrice(price?: number): string {
    if (price == null) return 'Not quoted yet';
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }

  toTitleCase(value?: string): string {
    if (!value) return '—';
    return value
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}