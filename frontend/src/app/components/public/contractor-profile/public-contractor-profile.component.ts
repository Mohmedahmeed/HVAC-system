import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { takeUntil, switchMap, finalize } from 'rxjs/operators';
import {
  PublicContractorDataService,
  PublicContractorProfile,
} from '../../../core/services/public-contractor-data.service';
import { Review } from '../../../core/models/review.model';

@Component({
  selector: 'app-public-contractor-profile',
  templateUrl: './public-contractor-profile.component.html',
  styleUrls: ['./public-contractor-profile.component.css'],
})
export class PublicContractorProfileComponent implements OnInit, OnDestroy {
  profile: PublicContractorProfile | null = null;
  reviews: Review[] = [];

  isLoading = true;
  hasError = false;
  errorMessage = '';
  notFound = false;

  reviewsAvailable = true;

  private destroy$ = new Subject<void>();
  private currentId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicData: PublicContractorDataService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const id = Number(params.get('id'));
          if (!id || !Number.isInteger(id) || id <= 0) {
            this.notFound = true;
            this.isLoading = false;
            return of(null);
          }
          this.isLoading = true;
          this.hasError = false;
          this.errorMessage = '';
          this.notFound = false;
          this.profile = null;
          this.reviews = [];
          this.reviewsAvailable = true;
          this.currentId = id;
          return this.publicData.getPublicProfile(id).pipe(
            finalize(() => (this.isLoading = false))
          );
        })
      )
      .subscribe({
        next: (profile) => {
          if (profile) {
            this.profile = profile;
            this.loadReviews(profile.userId);
          }
        },
        error: (err) => {
          if (err?.status === 404) {
            this.notFound = true;
          } else {
            this.hasError = true;
            this.errorMessage =
              err?.error?.message || 'Unable to load this contractor profile.';
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Reviews are an independent, degradable call: the public read matcher for
  // GET /reviews/contractor/{id} is a Stage 5 change, so anonymous visitors
  // may currently get 403/401. The profile still renders.
  private loadReviews(contractorId: number): void {
    this.publicData
      .getContractorReviews(contractorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reviews) => {
          this.reviews = reviews;
        },
        error: () => {
          this.reviewsAvailable = false;
        },
      });
  }

  onRetry(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.notFound = false;
    this.profile = null;
    this.reviews = [];
    this.reviewsAvailable = true;

    this.publicData
      .getPublicProfile(this.currentId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.loadReviews(profile.userId);
        },
        error: (err) => {
          if (err?.status === 404) {
            this.notFound = true;
          } else {
            this.hasError = true;
            this.errorMessage =
              err?.error?.message || 'Unable to load this contractor profile.';
          }
        },
      });
  }

  get specialtiesList(): string[] {
    if (!this.profile?.specialties) return [];
    try {
      const parsed = JSON.parse(this.profile.specialties);
      if (Array.isArray(parsed)) {
        return parsed.filter((s) => typeof s === 'string' && s.trim());
      }
    } catch {
      // Not valid JSON — fall through to display-raw handling.
    }
    return [this.profile.specialties].filter((s) => s && s.trim());
  }

  get hasReviews(): boolean {
    return this.reviews.length > 0;
  }

  onRequestService(): void {
    this.router.navigate(['/customer/request/new']);
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  reviewerName(review: Review): string {
    const customer = review.customer;
    if (!customer) return 'Verified customer';
    return `${customer.firstName} ${customer.lastName ?? ''}`.trim();
  }

  formatBaseRate(rate: number): string {
    return rate.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }
}
