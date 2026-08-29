import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { ContractorDataService } from '../../../../core/services/contractor-data.service';
import {
  Review,
  ReviewDimension,
  REVIEW_DIMENSIONS,
} from '../../../../core/models/review.model';

@Component({
  selector: 'app-contractor-reviews',
  templateUrl: './contractor-reviews.component.html',
  styleUrls: ['./contractor-reviews.component.css'],
})
export class ContractorReviewsComponent implements OnInit, OnDestroy {
  reviews: Review[] = [];

  dimensions: ReviewDimension[] = REVIEW_DIMENSIONS;

  isLoading = true;
  hasError = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(private contractorData: ContractorDataService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get total(): number {
    return this.reviews.length;
  }

  get overallAverage(): number {
    return this.averageOf('overallRating');
  }

  averageOf(key: keyof Review): number {
    if (this.reviews.length === 0) {
      return 0;
    }
    const sum = this.reviews.reduce((acc, r) => acc + (r[key] as number), 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }

  starsFor(value: number): number {
    return Math.round(value);
  }

  reviewerName(review: Review): string {
    const first = review.customer?.firstName || 'Customer';
    const last = review.customer?.lastName || '';
    return last ? `${first} ${last.charAt(0)}.` : first;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  onRetry(): void {
    this.loadReviews();
  }

  private loadReviews(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.contractorData
      .getMyReviews()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => {
          this.reviews = data;
        },
        error: (err) => {
          this.hasError = true;
          this.errorMessage =
            err?.error?.message || 'Unable to load your reviews. Please try again.';
        },
      });
  }
}