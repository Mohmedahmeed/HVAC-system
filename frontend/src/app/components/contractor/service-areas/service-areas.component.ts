import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ContractorDataService } from '../../../core/services/contractor-data.service';
import { ServiceArea } from '../../../core/models/service-area.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-service-areas',
  templateUrl: './service-areas.component.html',
  styleUrls: ['./service-areas.component.css'],
})
export class ServiceAreasComponent implements OnInit, OnDestroy {
  areas: ServiceArea[] = [];

  isLoading = true;
  hasError = false;
  errorMessage = '';

  newZipCode = '';
  newCity = '';
  newState = 'AZ';
  isAdding = false;
  addError = '';
  addSuccess = '';

  private destroy$ = new Subject<void>();

  constructor(
    private contractorData: ContractorDataService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAreas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAreas(): void {
    this.isLoading = true;
    this.hasError = false;

    this.contractorData
      .getMyServiceAreas()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (areas) => (this.areas = areas),
        error: (err) => {
          this.hasError = true;
          this.errorMessage =
            err?.error?.message || 'Unable to load service areas.';
        },
      });
  }

  onAdd(): void {
    const zip = this.newZipCode.trim();
    if (!zip || !/^\d{5}$/.test(zip)) return;

    if (this.areas.some((a) => a.zipCode === zip)) {
      this.addError = 'This ZIP code is already in your service areas.';
      return;
    }

    this.isAdding = true;
    this.addError = '';
    this.addSuccess = '';

    this.contractorData
      .createServiceArea({
        zipCode: zip,
        city: this.newCity.trim() || undefined,
        state: this.newState.trim() || undefined,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isAdding = false))
      )
      .subscribe({
        next: (area) => {
          this.areas.push(area);
          this.newZipCode = '';
          this.newCity = '';
          this.addSuccess = `ZIP code ${zip} added successfully.`;
          setTimeout(() => (this.addSuccess = ''), 3000);
        },
        error: (err) => {
          this.addError =
            err?.error?.message || 'Failed to add service area.';
        },
      });
  }

  onDelete(area: ServiceArea): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Remove Service Area',
        message: `Remove ${area.zipCode}${area.city ? ' (' + area.city + ', ' + area.state + ')' : ''} from your service areas?`,
        confirmText: 'Remove',
        type: 'danger',
      },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.contractorData
          .deleteServiceArea(area.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.areas = this.areas.filter((a) => a.id !== area.id);
            },
            error: (err) => {
              this.addError =
                err?.error?.message || 'Failed to delete service area.';
            },
          });
      }
    });
  }

  get isValidZip(): boolean {
    return /^\d{5}$/.test(this.newZipCode.trim());
  }

  formatArea(area: ServiceArea): string {
    if (area.city && area.state) {
      return `${area.zipCode} \u00B7 ${area.city}, ${area.state}`;
    }
    return area.zipCode;
  }
}
