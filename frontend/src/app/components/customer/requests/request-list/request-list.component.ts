import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { CustomerDataService } from '../../../../core/services/customer-data.service';
import { ServiceRequest } from '../../../../core/models/service-request.model';

type RequestFilter = 'all' | 'active' | 'completed' | 'cancelled';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.css'],
})
export class RequestListComponent implements OnInit, OnDestroy {
  requests: ServiceRequest[] = [];

  filterTab: RequestFilter = 'all';

  isLoading = true;
  hasError = false;
  errorMessage = '';

  filterTabs: { value: RequestFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private customerData: CustomerDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRequests(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.customerData
      .getMyServiceRequests()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => {
          this.requests = data;
        },
        error: (err) => {
          this.hasError = true;
          this.errorMessage =
            err?.error?.message || 'Unable to load your requests. Please try again.';
        },
      });
  }

  // ─── Filtering ─────────────────────────────────────────────

  setFilter(tab: RequestFilter): void {
    this.filterTab = tab;
  }

  get filteredRequests(): ServiceRequest[] {
    switch (this.filterTab) {
      case 'active':
        return this.requests.filter(
          (r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
        );
      case 'completed':
        return this.requests.filter((r) => r.status === 'COMPLETED');
      case 'cancelled':
        return this.requests.filter((r) => r.status === 'CANCELLED');
      default:
        return this.requests;
    }
  }

  // ─── Actions ───────────────────────────────────────────────

  onRetry(): void {
    this.loadRequests();
  }

  onRequestService(): void {
    this.router.navigate(['/customer/request/new']);
  }

  onOpenRequest(id: number): void {
    this.router.navigate(['/customer/requests', id]);
  }

  // ─── Helpers ───────────────────────────────────────────────

  formatServiceType(type: string): string {
    return type || 'Service Request';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}