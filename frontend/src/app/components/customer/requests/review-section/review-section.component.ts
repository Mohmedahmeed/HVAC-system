import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { CustomerDataService } from '../../../../core/services/customer-data.service';
import {
  Review,
  ReviewDimension,
  ReviewInput,
  ReviewRatingKey,
  REVIEW_DIMENSIONS,
} from '../../../../core/models/review.model';

@Component({
  selector: 'app-review-section',
  templateUrl: './review-section.component.html',
  styleUrls: ['./review-section.component.css'],
})
export class ReviewSectionComponent implements OnInit, OnDestroy {
  @Input() serviceRequestId = 0;
  @Input() contractorName = '';

  dimensions: ReviewDimension[] = REVIEW_DIMENSIONS;

  existingReview: Review | null = null;

  isLoadingExisting = true;
  existingError = '';

  ratings: Record<ReviewRatingKey, number> = {
    overallRating: 0,
    qualityRating: 0,
    professionalismRating: 0,
    punctualityRating: 0,
    communicationRating: 0,
  };

  comment = '';

  isSubmitting = false;
  submitError = '';

  private destroy$ = new Subject<void>();

  constructor(private customerData: CustomerDataService) {}

  ngOnInit(): void {
    this.loadExisting();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasReview(): boolean {
    return this.existingReview !== null;
  }

  get isValid(): boolean {
    return this.dimensions.every((dim) => this.ratings[dim.key] > 0);
  }

  get reviewedContractorName(): string {
    if (this.contractorName) {
      return this.contractorName;
    }
    const contractor = this.existingReview?.contractor;
    return contractor?.firstName
      ? `${contractor.firstName} ${contractor.lastName ?? ''}`.trim()
      : '';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  onSelect(dim: ReviewDimension, value: number): void {
    this.ratings[dim.key] = value;
  }

  onSubmit(): void {
    if (!this.isValid || this.isSubmitting) {
      return;
    }

    const payload: ReviewInput = {
      overallRating: this.ratings.overallRating,
      qualityRating: this.ratings.qualityRating,
      professionalismRating: this.ratings.professionalismRating,
      punctualityRating: this.ratings.punctualityRating,
      communicationRating: this.ratings.communicationRating,
      comment: this.comment?.trim() ? this.comment.trim() : undefined,
    };

    this.isSubmitting = true;
    this.submitError = '';

    this.customerData
      .createReview(this.serviceRequestId, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: (review) => {
          this.existingReview = review;
        },
        error: (err) => {
          this.submitError =
            err?.error?.message ||
            'Unable to submit your review. Please try again.';
        },
      });
  }

  private loadExisting(): void {
    this.isLoadingExisting = true;
    this.existingError = '';

    this.customerData
      .getMyReviews()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoadingExisting = false))
      )
      .subscribe({
        next: (reviews) => {
          this.existingReview =
            reviews.find((r) => r.serviceRequest?.id === this.serviceRequestId) ??
            null;
        },
        error: () => {
          this.existingError =
            'Unable to load your existing reviews right now.';
          this.existingReview = null;
        },
      });
  }
}