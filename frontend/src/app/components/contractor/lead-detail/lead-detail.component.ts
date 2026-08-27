import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, of } from 'rxjs';
import { takeUntil, switchMap, finalize } from 'rxjs/operators';
import { ContractorDataService } from '../../../core/services/contractor-data.service';
import { LeadAssignment } from '../../../core/models/lead-assignment.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-lead-detail',
  templateUrl: './lead-detail.component.html',
  styleUrls: ['./lead-detail.component.css'],
})
export class LeadDetailComponent implements OnInit, OnDestroy {
  lead: LeadAssignment | null = null;

  isLoading = true;
  isProcessing = false;
  hasError = false;
  errorMessage = '';
  successMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractorData: ContractorDataService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const id = Number(params.get('id'));
          if (!id) {
            this.hasError = true;
            this.errorMessage = 'Invalid lead ID.';
            this.isLoading = false;
            return of(null);
          }
          this.isLoading = true;
          this.hasError = false;
          return this.contractorData.getLead(id);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (lead) => {
          if (lead) {
            this.lead = lead;
          }
        },
        error: (err) => {
          this.hasError = true;
          this.errorMessage =
            err?.error?.message || 'Unable to load lead details.';
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Actions ──────────────────────────────────────────────

  onAccept(): void {
    if (!this.lead) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Accept Lead',
        message: `Accept the ${this.lead.serviceRequest?.serviceType} request from ${this.lead.serviceRequest?.customer?.firstName}? Once accepted, you can schedule an appointment.`,
        confirmText: 'Accept',
        cancelText: 'Cancel',
      },
      panelClass: 'ch-confirm-dialog',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed || !this.lead) return;

      this.isProcessing = true;
      this.successMessage = '';

      this.contractorData
        .acceptLead(this.lead.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated) => {
            this.lead = updated;
            this.successMessage = 'Lead accepted successfully!';
            this.isProcessing = false;
          },
          error: (err) => {
            this.hasError = true;
            this.errorMessage =
              err?.error?.message || 'Failed to accept lead. Please try again.';
            this.isProcessing = false;
          },
        });
    });
  }

  onReject(): void {
    if (!this.lead) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reject Lead',
        message: `Reject the ${this.lead.serviceRequest?.serviceType} request? This action cannot be undone.`,
        confirmText: 'Reject',
        cancelText: 'Cancel',
        showReasonInput: true,
        reasonLabel: 'Reason for rejection (optional)',
      },
      panelClass: 'ch-confirm-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result?.confirmed || !this.lead) return;

      this.isProcessing = true;
      this.successMessage = '';

      this.contractorData
        .rejectLead(this.lead.id, result.reason || '')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated) => {
            this.lead = updated;
            this.successMessage = 'Lead rejected.';
            this.isProcessing = false;
          },
          error: (err) => {
            this.hasError = true;
            this.errorMessage =
              err?.error?.message || 'Failed to reject lead. Please try again.';
            this.isProcessing = false;
          },
        });
    });
  }

  onBack(): void {
    this.router.navigate(['/contractor/leads']);
  }

  onRetry(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.isLoading = true;
      this.hasError = false;
      this.contractorData
        .getLead(id)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.isLoading = false))
        )
        .subscribe({
          next: (lead) => (this.lead = lead),
          error: (err) => {
            this.hasError = true;
            this.errorMessage = err?.error?.message || 'Unable to load lead details.';
          },
        });
    }
  }

  // ─── Helpers ──────────────────────────────────────────────

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

  get isSent(): boolean {
    return this.lead?.status === 'SENT';
  }

  get isAccepted(): boolean {
    return this.lead?.status === 'ACCEPTED';
  }

  get isRejected(): boolean {
    return this.lead?.status === 'REJECTED';
  }

  get isExpired(): boolean {
    return this.lead?.status === 'EXPIRED';
  }
}
