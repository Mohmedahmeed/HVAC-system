import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ContractorDataService } from '../../../core/services/contractor-data.service';
import { LeadAssignment, LeadAssignmentStatus } from '../../../core/models/lead-assignment.model';

@Component({
  selector: 'app-lead-inbox',
  templateUrl: './lead-inbox.component.html',
  styleUrls: ['./lead-inbox.component.css'],
})
export class LeadInboxComponent implements OnInit, OnDestroy {
  leads: LeadAssignment[] = [];
  filteredLeads: LeadAssignment[] = [];

  isLoading = true;
  hasError = false;
  errorMessage = '';

  activeFilter: LeadAssignmentStatus | 'ALL' = 'ALL';

  filterTabs: { label: string; value: LeadAssignmentStatus | 'ALL' }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'New', value: 'SENT' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Expired', value: 'EXPIRED' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private contractorData: ContractorDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLeads();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLeads(): void {
    this.isLoading = true;
    this.hasError = false;

    this.contractorData
      .getMyLeads()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (leads) => {
          this.leads = leads;
          this.applyFilter();
        },
        error: (err) => {
          this.hasError = true;
          this.errorMessage =
            err?.error?.message || 'Unable to load leads. Please try again.';
        },
      });
  }

  // ─── Filtering ────────────────────────────────────────────

  onFilterChange(filter: LeadAssignmentStatus | 'ALL'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.activeFilter === 'ALL') {
      this.filteredLeads = [...this.leads];
    } else {
      this.filteredLeads = this.leads.filter(
        (l) => l.status === this.activeFilter
      );
    }
  }

  getCountForFilter(filter: LeadAssignmentStatus | 'ALL'): number {
    if (filter === 'ALL') return this.leads.length;
    return this.leads.filter((l) => l.status === filter).length;
  }

  // ─── Helpers ──────────────────────────────────────────────

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatPrice(price?: number): string {
    if (price == null) return '—';
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 0 });
  }

  // ─── Actions ──────────────────────────────────────────────

  onViewLead(id: number): void {
    this.router.navigate(['/contractor/leads', id]);
  }

  onRetry(): void {
    this.loadLeads();
  }
}
