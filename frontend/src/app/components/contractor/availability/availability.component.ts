import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ContractorDataService } from '../../../core/services/contractor-data.service';
import { Availability } from '../../../core/models/availability.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

interface DaySchedule {
  id?: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  emergencyAvailable: boolean;
  isSaving: boolean;
  isNew: boolean;
}

const ALL_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.css'],
})
export class AvailabilityComponent implements OnInit, OnDestroy {
  schedule: DaySchedule[] = [];

  isLoading = true;
  hasError = false;
  errorMessage = '';
  successMessage = '';

  showAddDay = false;
  selectedNewDay = '';
  addDayError = '';

  readonly dayLabels = DAY_LABELS;

  private destroy$ = new Subject<void>();

  constructor(
    private contractorData: ContractorDataService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAvailability();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAvailability(): void {
    this.isLoading = true;
    this.hasError = false;

    this.contractorData
      .getMyAvailability()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => {
          this.schedule = data
            .sort(
              (a, b) =>
                ALL_DAYS.indexOf(a.dayOfWeek) - ALL_DAYS.indexOf(b.dayOfWeek)
            )
            .map((item) => ({
              ...item,
              startTime: this.toTimeInput(item.startTime),
              endTime: this.toTimeInput(item.endTime),
              isSaving: false,
              isNew: false,
            }));
        },
        error: (err) => {
          this.hasError = true;
          this.errorMessage =
            err?.error?.message || 'Unable to load your availability.';
        },
      });
  }

  onSaveDay(day: DaySchedule): void {
    if (!day.startTime || !day.endTime) return;
    if (day.startTime >= day.endTime) return;

    day.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload: Partial<Availability> = {
      dayOfWeek: day.dayOfWeek,
      startTime: this.toBackendTime(day.startTime),
      endTime: this.toBackendTime(day.endTime),
      emergencyAvailable: day.emergencyAvailable,
    };

    const request$ = day.id
      ? this.contractorData.updateAvailability(day.id, payload)
      : this.contractorData.createAvailability(payload as Omit<Availability, 'id'>);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (saved) => {
        day.id = saved.id;
        day.isSaving = false;
        day.isNew = false;
        this.successMessage = `${DAY_LABELS[day.dayOfWeek]} schedule saved.`;
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        day.isSaving = false;
        this.errorMessage =
          err?.error?.message || `Failed to save ${DAY_LABELS[day.dayOfWeek]} schedule.`;
      },
    });
  }

  onToggleEmergency(day: DaySchedule): void {
    if (!day.id) return;

    day.isSaving = true;

    this.contractorData
      .updateAvailability(day.id, {
        emergencyAvailable: day.emergencyAvailable,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          day.isSaving = false;
        },
        error: (err) => {
          day.emergencyAvailable = !day.emergencyAvailable;
          day.isSaving = false;
          this.errorMessage =
            err?.error?.message || 'Failed to update emergency availability.';
        },
      });
  }

  onDeleteDay(day: DaySchedule): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Remove Schedule',
        message: `Remove ${DAY_LABELS[day.dayOfWeek]} from your availability?`,
        confirmText: 'Remove',
        type: 'danger',
      },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== true) return;

      if (!day.id) {
        this.schedule = this.schedule.filter((d) => d !== day);
        return;
      }

      this.contractorData
        .deleteAvailability(day.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.schedule = this.schedule.filter((d) => d !== day);
          },
          error: (err) => {
            this.errorMessage =
              err?.error?.message || 'Failed to delete schedule.';
          },
        });
    });
  }

  onAddDay(): void {
    if (!this.selectedNewDay) {
      this.addDayError = 'Please select a day.';
      return;
    }

    if (this.schedule.some((d) => d.dayOfWeek === this.selectedNewDay)) {
      this.addDayError = 'This day is already configured.';
      return;
    }

    this.schedule.push({
      dayOfWeek: this.selectedNewDay,
      startTime: '08:00',
      endTime: '17:00',
      emergencyAvailable: false,
      isSaving: false,
      isNew: true,
    });

    this.showAddDay = false;
    this.selectedNewDay = '';
    this.addDayError = '';
  }

  get availableDays(): string[] {
    const configured = new Set(this.schedule.map((d) => d.dayOfWeek));
    return ALL_DAYS.filter((d) => !configured.has(d));
  }

  get hasUnsavedDays(): boolean {
    return this.schedule.some((d) => d.isNew);
  }

  trackByDay(_index: number, day: DaySchedule): string {
    return day.dayOfWeek;
  }

  private toTimeInput(timeStr: string): string {
    if (!timeStr) return '08:00';
    const parts = timeStr.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }

  private toBackendTime(timeStr: string): string {
    return `${timeStr}:00`;
  }
}
