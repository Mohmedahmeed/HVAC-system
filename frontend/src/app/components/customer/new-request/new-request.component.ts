import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomerDataService } from '../../../core/services/customer-data.service';

@Component({
  selector: 'app-new-request',
  templateUrl: './new-request.component.html',
  styleUrls: ['./new-request.component.css'],
})
export class NewRequestComponent implements OnInit, OnDestroy {
  step1!: FormGroup;
  step2!: FormGroup;
  step3!: FormGroup;

  currentStep = 0;
  isSubmitting = false;
  submitSuccess = false;
  errorMessage = '';

  serviceTypes = [
    { value: 'AC Repair', label: 'AC Repair' },
    { value: 'AC Installation', label: 'AC Installation' },
    { value: 'Heating Repair', label: 'Heating Repair' },
    { value: 'HVAC Maintenance', label: 'HVAC Maintenance' },
    { value: 'Emergency AC Repair', label: 'Emergency AC Repair' },
  ];

  urgencies = [
    { value: 'ROUTINE', label: 'Routine', desc: 'Within 3-5 business days' },
    { value: 'URGENT', label: 'Urgent', desc: 'Within 24-48 hours' },
    { value: 'EMERGENCY', label: 'Emergency', desc: 'Same-day service' },
  ];

  propertyTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
  ];

  hvacSystemTypes = [
    { value: 'central', label: 'Central HVAC' },
    { value: 'window', label: 'Window Unit' },
    { value: 'ductless', label: 'Ductless Mini-Split' },
    { value: 'heat-pump', label: 'Heat Pump' },
  ];

  reviewData: Record<string, string> = {};
  minDate = new Date();

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private customerData: CustomerDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.step1 = this.fb.group({
      serviceType: ['', Validators.required],
      urgency: ['', Validators.required],
    });

    this.step2 = this.fb.group({
      problemDescription: ['', [Validators.required, Validators.minLength(10)]],
      propertyType: [''],
      squareFootage: [null],
      hvacSystemType: [''],
    });

    this.step3 = this.fb.group({
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      address: [''],
      preferredDate: [null],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  next(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
      if (this.currentStep === 3) {
        this.buildReviewData();
      }
    }
  }

  back(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  onStepChange(event: { selectedIndex: number }): void {
    if (event.selectedIndex < this.currentStep) {
      this.currentStep = event.selectedIndex;
    }
  }

  submit(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      serviceType: this.step1.value.serviceType,
      problemDescription: this.step2.value.problemDescription,
      urgency: this.step1.value.urgency,
      zipCode: this.step3.value.zipCode,
      propertyType: this.step2.value.propertyType || undefined,
      squareFootage: this.step2.value.squareFootage || undefined,
      hvacSystemType: this.step2.value.hvacSystemType || undefined,
      address: this.step3.value.address || undefined,
      preferredDate: this.step3.value.preferredDate
        ? this.step3.value.preferredDate.toISOString()
        : undefined,
    };

    this.customerData
      .createServiceRequest(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.submitSuccess = true;
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage =
            err?.error?.message || 'Failed to submit request. Please try again.';
        },
      });
  }

  goToDashboard(): void {
    this.router.navigate(['/customer/dashboard']);
  }

  // ─── Helpers ──────────────────────────────────────────────

  formatServiceType(type: string): string {
    return this.serviceTypes.find((s) => s.value === type)?.label || type;
  }

  formatUrgency(urgency: string): string {
    return this.urgencies.find((u) => u.value === urgency)?.label || urgency;
  }

  formatPropertyType(type: string): string {
    return this.propertyTypes.find((p) => p.value === type)?.label || type;
  }

  formatHvacSystemType(type: string): string {
    return this.hvacSystemTypes.find((h) => h.value === type)?.label || type;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  buildReviewData(): void {
    this.reviewData = {
      'Service Type': this.formatServiceType(this.step1.value.serviceType),
      Urgency: this.formatUrgency(this.step1.value.urgency),
      'Problem Description': this.step2.value.problemDescription,
    };

    if (this.step2.value.propertyType) {
      this.reviewData['Property Type'] = this.formatPropertyType(
        this.step2.value.propertyType
      );
    }
    if (this.step2.value.squareFootage) {
      this.reviewData['Square Footage'] =
        this.step2.value.squareFootage.toLocaleString();
    }
    if (this.step2.value.hvacSystemType) {
      this.reviewData['HVAC System'] = this.formatHvacSystemType(
        this.step2.value.hvacSystemType
      );
    }

    this.reviewData['ZIP Code'] = this.step3.value.zipCode;

    if (this.step3.value.address) {
      this.reviewData['Address'] = this.step3.value.address;
    }
    if (this.step3.value.preferredDate) {
      this.reviewData['Preferred Date'] = this.formatDate(
        this.step3.value.preferredDate
      );
    }
  }

  get reviewKeys(): string[] {
    return Object.keys(this.reviewData);
  }
}
