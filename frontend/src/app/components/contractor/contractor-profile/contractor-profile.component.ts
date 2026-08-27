import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ContractorDataService } from '../../../core/services/contractor-data.service';
import { ContractorProfile } from '../../../core/models/contractor-profile.model';

function minOneSpecialty(): ValidatorFn {
  return (control) => {
    const value = control.value as string[];
    return Array.isArray(value) && value.length > 0 ? null : { noSpecialties: true };
  };
}

@Component({
  selector: 'app-contractor-profile',
  templateUrl: './contractor-profile.component.html',
  styleUrls: ['./contractor-profile.component.css'],
})
export class ContractorProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;

  isLoading = true;
  isSaving = false;
  hasError = false;
  errorMessage = '';
  successMessage = '';

  lastSavedValue: Partial<ContractorProfile> = {};

  readonly specialties = [
    { value: 'AC Repair', label: 'AC Repair' },
    { value: 'AC Installation', label: 'AC Installation' },
    { value: 'Heating Repair', label: 'Heating Repair' },
    { value: 'HVAC Maintenance', label: 'HVAC Maintenance' },
    { value: 'Emergency AC Repair', label: 'Emergency AC Repair' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private contractorData: ContractorDataService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      businessName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      licenseNumber: [''],
      specialties: [[] as string[], minOneSpecialty()],
      baseRate: [null, [Validators.min(0), Validators.max(500)]],
      responseTimeHours: [null, [Validators.min(1), Validators.max(72)]],
      acceptsEmergency: [false],
      logoUrl: [''],
    });

    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.hasError = false;

    this.contractorData
      .getMyProfile()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (profile) => {
          const specialtiesArray: string[] = profile.specialties
            ? profile.specialties.split(',').map((s: string) => s.trim())
            : [];
          const formValue = {
            businessName: profile.businessName || '',
            description: profile.description || '',
            licenseNumber: profile.licenseNumber || '',
            specialties: specialtiesArray,
            baseRate: profile.baseRate || null,
            responseTimeHours: profile.responseTimeHours || null,
            acceptsEmergency: profile.acceptsEmergency || false,
            logoUrl: profile.logoUrl || '',
          };
          this.profileForm.patchValue(formValue);
          this.lastSavedValue = { ...formValue } as any;

          (this as any)._serverProfile = profile;
        },
        error: (err) => {
          this.hasError = true;
          this.errorMessage =
            err?.error?.message || 'Unable to load your profile. Please try again.';
        },
      });
  }

  onSave(): void {
    if (this.profileForm.invalid || this.isSaving) return;

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formValue = this.profileForm.value;
    const payload: Partial<ContractorProfile> = {
      businessName: formValue.businessName,
      description: formValue.description || undefined,
      licenseNumber: formValue.licenseNumber || undefined,
      specialties: formValue.specialties?.length
        ? formValue.specialties.join(',')
        : undefined,
      baseRate: formValue.baseRate || undefined,
      responseTimeHours: formValue.responseTimeHours || undefined,
      acceptsEmergency: formValue.acceptsEmergency,
      logoUrl: formValue.logoUrl || undefined,
    };

    this.contractorData
      .updateMyProfile(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSaving = false))
      )
      .subscribe({
        next: () => {
          this.lastSavedValue = { ...formValue };
          this.successMessage = 'Profile updated successfully.';
          setTimeout(() => (this.successMessage = ''), 5000);
        },
        error: (err) => {
          this.errorMessage =
            err?.error?.message || 'Failed to save profile. Please try again.';
        },
      });
  }

  onReset(): void {
    this.profileForm.patchValue(this.lastSavedValue);
    this.successMessage = '';
    this.errorMessage = '';
  }

  isSpecialtyChecked(specialty: string): boolean {
    const current: string[] = this.profileForm.get('specialties')?.value || [];
    return current.includes(specialty);
  }

  toggleSpecialty(specialty: string): void {
    const control = this.profileForm.get('specialties');
    const current: string[] = control?.value || [];
    const index = current.indexOf(specialty);

    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(specialty);
    }

    control?.setValue([...current]);
    control?.markAsTouched();
  }

  get serverProfile(): ContractorProfile | undefined {
    return (this as any)._serverProfile;
  }
}
