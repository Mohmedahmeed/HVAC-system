import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';
import { PortfolioItem } from '../../../core/models/portfolio-item.model';

@Component({
  selector: 'app-contractor-portfolio',
  templateUrl: './contractor-portfolio.component.html',
  styleUrls: ['./contractor-portfolio.component.css'],
})
export class ContractorPortfolioComponent implements OnInit, OnDestroy {
  projects: PortfolioItem[] = [];

  isLoading = true;
  hasError = false;
  unavailable = false;

  selectedServiceType = 'ALL';

  private destroy$ = new Subject<void>();

  constructor(private portfolioData: PortfolioDataService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProjects(): void {
    this.isLoading = true;
    this.hasError = false;
    this.unavailable = false;

    this.portfolioData
      .getMyProjects()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (projects) => {
          this.projects = projects || [];
        },
        error: (err) => {
          // The contractor-portfolio backend does not exist yet (Stage 5), so a
          // failed load is surfaced as a clear "not available yet" state rather
          // than a generic error. Once Stage 5 lands, this resolves to real data.
          if (err?.status === 404 || err?.status === 0) {
            this.unavailable = true;
          } else {
            this.hasError = true;
          }
        },
      });
  }

  get serviceTypes(): string[] {
    const set = new Set<string>();
    this.projects.forEach((p) => p.serviceType && set.add(p.serviceType));
    return Array.from(set);
  }

  get filteredProjects(): PortfolioItem[] {
    if (this.selectedServiceType === 'ALL') {
      return this.projects;
    }
    return this.projects.filter((p) => p.serviceType === this.selectedServiceType);
  }

  get hasProjects(): boolean {
    return this.filteredProjects.length > 0;
  }

  onRetry(): void {
    this.loadProjects();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }
}
